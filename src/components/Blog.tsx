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
  FileDown,
  ArrowRight,
  Newspaper,
  X
} from 'lucide-react';
import { BlogPost, CardLayoutPreset } from '../types';
import { fetchAllBlogs } from '../lib/supabase';

interface BlogProps {
  setCurrentPage: (page: string) => void;
  setSelectedId: (id: string) => void;
}

function stripHtml(html: string): string {
  return (html || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

export default function Blog({ setCurrentPage, setSelectedId }: BlogProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [layout, setLayout] = useState<CardLayoutPreset>('classic-card');

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAllBlogs(true);
      setBlogs(data);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
    window.addEventListener('pins-updated', loadBlogs);
    return () => window.removeEventListener('pins-updated', loadBlogs);
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    blogs.forEach(b => {
      (b.Tags || '').split(',').map(t => t.trim()).filter(Boolean).forEach(t => tagSet.add(t));
    });
    return ['All', ...Array.from(tagSet)];
  }, [blogs]);

  const filtered = useMemo(() => {
    return blogs.filter(b => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        b.Title.toLowerCase().includes(q) ||
        stripHtml(b.Content).toLowerCase().includes(q) ||
        (b.Tags || '').toLowerCase().includes(q) ||
        (b.AuthorEmail || '').toLowerCase().includes(q);

      const tagsList = (b.Tags || '').split(',').map(t => t.trim().toLowerCase());
      const matchesTag = selectedTag === 'All' || tagsList.includes(selectedTag.toLowerCase());
      return matchesSearch && matchesTag;
    });
  }, [blogs, searchTerm, selectedTag]);

  const pinnedCount = useMemo(() => filtered.filter(b => b.IsPinned).length, [filtered]);

  const openPost = (id: string) => {
    setSelectedId(id);
    setCurrentPage('blog-item');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#141416] text-left">
      {/* Crisp White Editorial Page Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#C8102E] mb-2">
                <span className="w-5 h-[2px] bg-[#C8102E] inline-block" />
                <span>Counselor Publications</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#141416] tracking-tight">
                Guidance Editorial
              </h1>
              <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                Admissions insights, essay guidelines, deadline reminders, and career advice written by the Silver Oaks counseling faculty.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
              <span className="px-3 py-1.5 rounded-full bg-[#FAFAFA] border border-neutral-200 text-neutral-700">
                {filtered.length} {filtered.length === 1 ? 'Article' : 'Articles'}
              </span>
              {pinnedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-[#C8102E]">
                  <Pin className="w-3 h-3 fill-current" />
                  {pinnedCount} Important
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Inline Full-Width Filter & Layout Bar */}
      <section className="bg-white/95 border-b border-neutral-200 sticky top-16 z-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search articles, topics, tags..."
                className="w-full pl-10 pr-9 py-2 bg-[#FAFAFA] border border-neutral-200 rounded-xl text-sm text-[#141416] placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/15 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Layout Switcher */}
            <div className="flex items-center justify-between sm:justify-end gap-2">
              {(searchTerm || selectedTag !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedTag('All');
                  }}
                  className="text-xs font-semibold text-[#C8102E] hover:underline cursor-pointer mr-2"
                >
                  Reset filters
                </button>
              )}
              <div className="inline-flex items-center bg-[#FAFAFA] border border-neutral-200 rounded-xl p-1">
                {[
                  { id: 'compact-list' as CardLayoutPreset, label: 'List', icon: ListIcon },
                  { id: 'bento-grid' as CardLayoutPreset, label: 'Bento', icon: Layers },
                  { id: 'classic-card' as CardLayoutPreset, label: 'Cards', icon: LayoutGrid },
                ].map(opt => {
                  const Icon = opt.icon;
                  const active = layout === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLayout(opt.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        active
                          ? 'bg-[#C8102E] text-white shadow-2xs'
                          : 'text-neutral-600 hover:text-[#141416]'
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

          {/* Horizontal Topic Tags */}
          {allTags.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              {allTags.map(tag => {
                const active = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                      active
                        ? 'bg-[#C8102E] text-white border-[#C8102E]'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-[#C8102E]/40 hover:text-[#C8102E]'
                    }`}
                  >
                    {tag === 'All' ? 'All Topics' : `#${tag}`}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {loading ? (
          <div className="py-24 text-center">
            <div className="spinner" />
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mt-3">
              Loading publications...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center max-w-lg mx-auto">
            <Newspaper className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-semibold text-[#141416]">No matching articles</h3>
            <p className="text-sm text-neutral-500 mt-1">
              Try adjusting your topic tag or search keyword.
            </p>
            {(searchTerm || selectedTag !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTag('All');
                }}
                className="mt-5 px-4 py-2 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Show All Articles
              </button>
            )}
          </div>
        ) : layout === 'compact-list' ? (
          <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-200 overflow-hidden">
            {filtered.map(post => (
              <article
                key={post.ID}
                onClick={() => openPost(post.ID)}
                className={`p-5 sm:p-6 hover:bg-[#FAFAFA] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  post.IsPinned ? 'border-l-4 border-l-[#C8102E] bg-red-50/20' : ''
                }`}
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {post.FeaturedImageURL && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 hidden sm:block">
                      <img
                        src={post.FeaturedImageURL}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-1.5">
                      {post.IsPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-wider">
                          <Pin className="w-2.5 h-2.5 fill-current" />
                          Pinned · Important
                        </span>
                      )}
                      {(post.Tags || '').split(',').filter(Boolean).slice(0, 3).map((t, i) => (
                        <span key={i} className="text-[11px] font-bold text-[#C8102E] uppercase tracking-wider">
                          #{t.trim()}
                        </span>
                      ))}
                      <span className="text-xs text-neutral-400">
                        · {new Date(post.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#141416] group-hover:text-[#C8102E] transition-colors leading-snug">
                      {post.Title}
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-600 mt-1 line-clamp-2">
                      {stripHtml(post.Content)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {post.PDFLink && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 text-[#C8102E] text-[11px] font-semibold">
                      <FileDown className="w-3.5 h-3.5" /> PDF
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#C8102E]">
                    Read <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
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
            {filtered.map((post, idx) => {
              const isHeroBento = layout === 'bento-grid' && (idx === 0 || idx === 3);
              const bentoSpan =
                layout === 'bento-grid'
                  ? isHeroBento
                    ? 'md:col-span-4'
                    : 'md:col-span-2'
                  : '';

              return (
                <article
                  key={post.ID}
                  onClick={() => openPost(post.ID)}
                  className={`${bentoSpan} bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group ${
                    post.IsPinned
                      ? 'border-[#C8102E]/45 ring-1 ring-[#C8102E]/15'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div>
                    <div
                      className={`${
                        isHeroBento ? 'aspect-[21/9]' : 'aspect-[16/10]'
                      } bg-neutral-100 relative overflow-hidden border-b border-neutral-100`}
                    >
                      {post.FeaturedImageURL ? (
                        <img
                          src={post.FeaturedImageURL}
                          alt={post.Title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#7A0A1D] to-[#C8102E] flex items-center justify-center text-white/90">
                          <Newspaper className="w-10 h-10 stroke-[1.4]" />
                        </div>
                      )}
                      {post.IsPinned && (
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                          <Pin className="w-2.5 h-2.5 fill-current" />
                          Pinned · Important
                        </span>
                      )}
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="flex items-center flex-wrap gap-2 mb-2 text-[11px]">
                        {(post.Tags || '').split(',').filter(Boolean).slice(0, 3).map((t, i) => (
                          <span key={i} className="font-bold uppercase tracking-wider text-[#C8102E]">
                            #{t.trim()}
                          </span>
                        ))}
                        <span className="text-neutral-400">
                          · {new Date(post.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h2 className={`font-serif font-semibold text-[#141416] group-hover:text-[#C8102E] transition-colors leading-snug line-clamp-2 ${isHeroBento ? 'text-2xl' : 'text-lg'}`}>
                        {post.Title}
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-600 mt-2 line-clamp-3 leading-relaxed">
                        {stripHtml(post.Content)}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 py-3.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                    <span className="truncate font-medium">
                      {post.AuthorEmail ? post.AuthorEmail.split('@')[0] : 'Counselor Team'}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {post.PDFLink && (
                        <span className="inline-flex items-center gap-1 text-[#C8102E] font-semibold">
                          <FileDown className="w-3.5 h-3.5" /> PDF
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#C8102E] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
