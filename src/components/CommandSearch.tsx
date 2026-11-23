/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Pin,
  ArrowRight,
  BookOpen,
  Newspaper,
  FileText,
  FlaskConical,
  CornerDownLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  fetchAllCourses,
  fetchAllBlogs,
  fetchAllReferences,
  fetchAllCareerLabs
} from '../lib/supabase';

interface CommandSearchProps {
  open: boolean;
  onClose: () => void;
  setCurrentPage: (page: string) => void;
  setSelectedId: (id: string) => void;
}

interface QuickItem {
  id: string;
  title: string;
  subtitle: string;
  searchBlob: string;
  type: 'course' | 'blog-item' | 'reference-item' | 'lab-item';
  typeLabel: string;
  isPinned?: boolean;
}

export default function CommandSearch({
  open,
  onClose,
  setCurrentPage,
  setSelectedId
}: CommandSearchProps) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<QuickItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 60);

    let active = true;
    setLoading(true);
    Promise.all([
      fetchAllCourses(true),
      fetchAllBlogs(true),
      fetchAllReferences(true),
      fetchAllCareerLabs(true)
    ])
      .then(([courses, blogs, refs, labs]) => {
        if (!active) return;
        const combined: QuickItem[] = [
          ...labs.map(l => ({
            id: l.ID,
            title: l.Title,
            subtitle: [l.Student, l.Category].filter(Boolean).join(' · '),
            searchBlob: `${l.Title} ${l.Description} ${l.Student} ${l.Mentor} ${l.Category}`.toLowerCase(),
            type: 'lab-item' as const,
            typeLabel: 'Lab Project',
            isPinned: l.IsPinned
          })),
          ...courses.map(c => ({
            id: c.ID,
            title: c.Title,
            subtitle: [c.Category, c.Grade].filter(Boolean).join(' · '),
            searchBlob: `${c.Title} ${c.Description} ${c.Instructor} ${c.Category} ${c.Grade}`.toLowerCase(),
            type: 'course' as const,
            typeLabel: 'Course',
            isPinned: c.IsPinned
          })),
          ...blogs.map(b => ({
            id: b.ID,
            title: b.Title,
            subtitle: b.Tags ? b.Tags.split(',').slice(0, 2).map(t => `#${t.trim()}`).join(' ') : 'Story',
            searchBlob: `${b.Title} ${(b.Content || '').replace(/<[^>]*>/g, '')} ${b.Tags}`.toLowerCase(),
            type: 'blog-item' as const,
            typeLabel: 'Blog',
            isPinned: b.IsPinned
          })),
          ...refs.map(r => ({
            id: r.ID,
            title: r.Title,
            subtitle: r.Category || r.Author || 'Template',
            searchBlob: `${r.Title} ${r.Description} ${r.Author} ${r.Category}`.toLowerCase(),
            type: 'reference-item' as const,
            typeLabel: 'Resource',
            isPinned: r.IsPinned
          }))
        ];
        combined.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
        setItems(combined);
      })
      .catch(err => console.error('Command search load error:', err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 6);
    return items.filter(i => i.searchBlob.includes(q)).slice(0, 8);
  }, [items, query]);

  const handleSelect = (item: QuickItem) => {
    setSelectedId(item.id);
    setCurrentPage(item.type);
    setQuery('');
    onClose();
  };

  const handleFullSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setCurrentPage(`search?q=${encodeURIComponent(q)}`);
    setQuery('');
    onClose();
  };

  const renderIcon = (type: QuickItem['type']) => {
    switch (type) {
      case 'lab-item':
        return <FlaskConical className="w-4 h-4" />;
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      case 'blog-item':
        return <Newspaper className="w-4 h-4" />;
      case 'reference-item':
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[14vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-950/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200/80 overflow-hidden z-10 text-left"
          >
            {/* Input Row */}
            <form onSubmit={handleFullSearch} className="flex items-center px-5 py-4 border-b border-neutral-100 gap-3">
              <Search className="w-5 h-5 text-[#C8102E] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Career Lab projects, courses, blogs, templates..."
                className="w-full text-sm sm:text-base font-medium text-[#111114] placeholder:text-neutral-400 focus:outline-none bg-transparent"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1 rounded-lg bg-neutral-100 text-[11px] font-mono font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                ESC
              </button>
            </form>

            {/* Quick Nav Shortcuts when empty */}
            {!query.trim() && (
              <div className="px-5 py-3 bg-[#FAFAFA] border-b border-neutral-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 shrink-0 mr-1">
                  Jump to
                </span>
                {[
                  { id: 'career-lab', label: 'Career Lab' },
                  { id: 'courses', label: 'Courses' },
                  { id: 'blog', label: 'Stories' },
                  { id: 'references', label: 'Resources' },
                  { id: 'counselors', label: 'Counsellors' }
                ].map(dest => (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => {
                      setCurrentPage(dest.id);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-full bg-white border border-neutral-200 hover:border-[#C8102E] hover:text-[#C8102E] text-xs font-semibold text-neutral-700 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {dest.label}
                  </button>
                ))}
              </div>
            )}

            {/* Results List */}
            <div className="max-h-[55vh] overflow-y-auto p-2.5">
              {loading ? (
                <div className="py-10 text-center text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                  Scanning Career Lab...
                </div>
              ) : results.length === 0 ? (
                <div className="py-12 text-center px-4">
                  <p className="text-sm font-semibold text-[#111114]">No direct matches for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-neutral-500 mt-1">Press Enter to search across the entire Career Lab.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                    {query.trim() ? `Matching Results (${results.length})` : 'Pinned & Recent Highlights'}
                  </p>
                  {results.map(item => (
                    <button
                      key={`${item.type}-${item.id}`}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="w-full px-3.5 py-3 rounded-2xl hover:bg-red-50/70 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          item.isPinned
                            ? 'bg-[#C8102E] text-white'
                            : 'bg-neutral-100 text-neutral-600 group-hover:bg-[#C8102E] group-hover:text-white'
                        }`}>
                          {renderIcon(item.type)}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {item.isPinned && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#C8102E] text-white text-[9px] font-bold uppercase shrink-0">
                                <Pin className="w-2.5 h-2.5 fill-current" />
                                Important
                              </span>
                            )}
                            <p className="text-sm font-semibold text-[#111114] group-hover:text-[#C8102E] truncate">
                              {item.title}
                            </p>
                          </div>
                          {item.subtitle && (
                            <p className="text-xs text-neutral-500 truncate mt-0.5">{item.subtitle}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 group-hover:bg-white text-neutral-600">
                          {item.typeLabel}
                        </span>
                        <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#C8102E] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {query.trim() && (
              <div className="px-5 py-3 bg-[#FAFAFA] border-t border-neutral-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleFullSearch}
                  className="text-xs font-bold text-[#C8102E] hover:text-[#9E0B24] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View all results for &ldquo;{query}&rdquo;</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
                  <CornerDownLeft className="w-3 h-3" /> Enter
                </span>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
