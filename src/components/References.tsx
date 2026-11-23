/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  Layers,
  Pin,
  FileText,
  FileDown,
  PlayCircle,
  ArrowRight,
  ArrowUpRight,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { ReferenceMaterial, CardLayoutPreset } from '../types';
import { fetchAllReferences } from '../lib/supabase';

interface ReferencesProps {
  setCurrentPage: (page: string) => void;
  setSelectedId: (id: string) => void;
}

export default function References({ setCurrentPage, setSelectedId }: ReferencesProps) {
  const [refs, setRefs] = useState<ReferenceMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [layout, setLayout] = useState<CardLayoutPreset>('classic-card');

  const loadRefs = async () => {
    setLoading(true);
    try {
      const data = await fetchAllReferences(true);
      setRefs(data);
    } catch (err) {
      console.error("Failed to fetch references:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefs();
    window.addEventListener('pins-updated', loadRefs);
    return () => window.removeEventListener('pins-updated', loadRefs);
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>(refs.map(r => r.Category?.trim()).filter(Boolean) as string[]);
    return ['All', ...Array.from(set)];
  }, [refs]);

  const filtered = useMemo(() => {
    return refs.filter(r => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.Title.toLowerCase().includes(q) ||
        (r.Description || '').toLowerCase().includes(q) ||
        (r.Author || '').toLowerCase().includes(q) ||
        (r.Category || '').toLowerCase().includes(q);
      const matchesCat = selectedCategory === 'All' || r.Category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [refs, searchTerm, selectedCategory]);

  const pinnedCount = useMemo(() => filtered.filter(r => r.IsPinned).length, [filtered]);
  const hasFilters = Boolean(searchTerm || selectedCategory !== 'All');

  const openRef = (id: string) => {
    setSelectedId(id);
    setCurrentPage('reference-item');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111114] text-left">
      {/* Unified Studio Header */}
      <section className="relative bg-white border-b border-neutral-200/80 overflow-hidden">
        <div className="absolute inset-0 bg-lab-dots opacity-40 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 sm:py-12 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#C8102E] text-[11px] font-bold uppercase tracking-wider mb-3">
                <FileText className="w-3.5 h-3.5" />
                <span>Career Lab Toolkit</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-[#111114] leading-tight">
                Templates &amp; Resources
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 mt-2 leading-relaxed">
                Ready-to-use CV formats, application checklists, guides, and PDF toolkits curated by Career Lab mentors.
              </p>
            </div>

            <div className="w-full lg:w-[380px] shrink-0">
              <div className="relative flex items-center bg-[#FAFAFA] border border-neutral-200 rounded-2xl focus-within:bg-white focus-within:border-[#C8102E] focus-within:ring-4 focus-within:ring-red-100 transition-all">
                <Search className="w-4 h-4 text-[#C8102E] ml-3.5 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search templates, checklists, PDFs..."
                  className="w-full px-3 py-3 text-sm font-medium text-[#111114] placeholder:text-neutral-400 focus:outline-none bg-transparent"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="p-2 mr-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              {categories.map(cat => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      active
                        ? 'bg-[#C8102E] text-white border-[#C8102E] shadow-xs'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-red-200 hover:text-[#C8102E]'
                    }`}
                  >
                    {cat === 'All' ? `All (${refs.length})` : cat}
                  </button>
                );
              })}
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-[#C8102E] hover:underline whitespace-nowrap cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
              {pinnedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-[#C8102E] text-[11px] font-bold">
                  <Pin className="w-3 h-3 fill-current" />
                  {pinnedCount} Important
                </span>
              )}
              <div className="inline-flex items-center bg-neutral-100 border border-neutral-200/80 rounded-full p-1">
                {[
                  { id: 'classic-card' as CardLayoutPreset, label: 'Cards', icon: LayoutGrid },
                  { id: 'bento-grid' as CardLayoutPreset, label: 'Bento', icon: Layers },
                  { id: 'compact-list' as CardLayoutPreset, label: 'List', icon: ListIcon },
                ].map(opt => {
                  const Icon = opt.icon;
                  const active = layout === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLayout(opt.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        active ? 'bg-[#C8102E] text-white shadow-2xs' : 'text-neutral-600 hover:text-[#111114]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {loading ? (
          <div className="py-24 text-center">
            <div className="spinner" />
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mt-3">
              Loading resources...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-lg mx-auto">
            <FileText className="w-10 h-10 text-red-200 mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold text-[#111114]">No matching resources</h3>
            <p className="text-sm text-neutral-500 mt-1">
              Try a different category or search keyword.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="mt-5 px-5 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Show All Resources
              </button>
            )}
          </div>
        ) : layout === 'compact-list' ? (
          <div className="bg-white rounded-3xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
            {filtered.map(item => (
              <article
                key={item.ID}
                onClick={() => openRef(item.ID)}
                className={`p-5 sm:p-6 hover:bg-red-50/35 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  item.IsPinned ? 'border-l-4 border-l-[#C8102E] bg-red-50/25' : ''
                }`}
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-100 text-[#C8102E] flex items-center justify-center shrink-0 group-hover:bg-[#C8102E] group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      {item.IsPinned && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-wider">
                          <Pin className="w-2.5 h-2.5 fill-current" /> Pinned · Important
                        </span>
                      )}
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8102E]">
                        {item.Category || 'Template'}
                      </span>
                    </div>
                    <h2 className="font-display text-lg font-bold text-[#111114] group-hover:text-[#C8102E] transition-colors leading-snug">
                      {item.Title}
                    </h2>
                    {item.Description && (
                      <p className="text-xs sm:text-sm text-neutral-600 mt-1 line-clamp-1">{item.Description}</p>
                    )}
                    <p className="text-xs text-neutral-500 mt-1.5 font-medium">
                      By {item.Author || 'Career Lab Team'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {item.YouTubeURL && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-semibold">
                      <PlayCircle className="w-3.5 h-3.5" /> Video
                    </span>
                  )}
                  {item.PDFLink && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-[#C8102E] text-[11px] font-bold">
                      <FileDown className="w-3.5 h-3.5" /> PDF
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#C8102E] group-hover:translate-x-0.5 transition-all" />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div
            className={
              layout === 'bento-grid'
                ? 'grid grid-cols-1 md:grid-cols-6 gap-5'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            }
          >
            {filtered.map((item, idx) => {
              const isWide = layout === 'bento-grid' && (idx === 0 || idx === 3);
              const span = layout === 'bento-grid' ? (isWide ? 'md:col-span-4' : 'md:col-span-2') : '';
              return (
                <motion.article
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.24) }}
                  key={item.ID}
                  onClick={() => openRef(item.ID)}
                  className={`${span} bg-white rounded-3xl border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                    item.IsPinned ? 'border-[#C8102E] ring-2 ring-[#C8102E]/15' : 'border-neutral-200 hover:border-red-200'
                  }`}
                >
                  <div>
                    <div className={`${isWide ? 'aspect-[21/9]' : 'aspect-[16/10]'} bg-neutral-100 relative overflow-hidden`}>
                      {item.ThumbnailURL ? (
                        <img
                          src={item.ThumbnailURL}
                          alt={item.Title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#7A0A1D] to-[#C8102E] flex items-center justify-center text-white">
                          <FileText className="w-10 h-10 stroke-[1.4]" />
                        </div>
                      )}
                      {item.IsPinned && (
                        <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                          <Pin className="w-2.5 h-2.5 fill-current" /> Pinned · Important
                        </span>
                      )}
                    </div>

                    <div className="p-5 sm:p-6">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8102E]">
                        {item.Category || 'Template'}
                      </span>
                      <h2 className={`font-display font-bold text-[#111114] group-hover:text-[#C8102E] transition-colors mt-1.5 leading-snug line-clamp-2 ${isWide ? 'text-2xl' : 'text-lg'}`}>
                        {item.Title}
                      </h2>
                      {item.Description && (
                        <p className="text-xs sm:text-sm text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                          {item.Description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 py-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                    <span className="truncate font-semibold text-neutral-700">{item.Author || 'Career Lab Team'}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.PDFLink && (
                        <span className="inline-flex items-center gap-1 text-[#C8102E] font-bold">
                          <FileDown className="w-3.5 h-3.5" /> PDF
                        </span>
                      )}
                      <ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover:text-[#C8102E] transition-colors" />
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
