/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  FileText,
  Filter,
  Grid,
  List,
  ArrowRight,
  Pin,
  FileDown as FileDownIcon,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Newspaper
} from 'lucide-react';
import { BlogPost, CardLayoutPreset } from '../types';
import { fetchAllBlogs, togglePinRecord, sortPinnedFirst } from '../lib/supabase';

interface BlogProps {
  setSelectedId: (id: string) => void;
  setCurrentPage: (page: string) => void;
  onNotify?: (msg: string, type?: 'success' | 'err') => void;
}

export default function Blog({ setSelectedId, setCurrentPage, onNotify }: BlogProps) {
  const [layout, setLayout] = useState<CardLayoutPreset>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'classic-card';
    }
    return 'bento-grid';
  });
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [filtered, setFiltered] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAllBlogs(true);
      setBlogs(data);

      const tagsSet = new Set<string>();
      data.forEach(p => {
        if (p.Tags) {
          p.Tags.split(',').forEach(tag => {
            const t = tag.trim().toLowerCase();
            if (t) tagsSet.add(t);
          });
        }
      });
      setAllTags(Array.from(tagsSet));
    } catch (err) {
      console.error("Failed to load blog posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let result = [...blogs];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.Title.toLowerCase().includes(q) ||
        p.Content.toLowerCase().includes(q)
      );
    }

    if (selectedTag) {
      result = result.filter(p =>
        (p.Tags || '').toLowerCase().split(',').map(t => t.trim()).includes(selectedTag)
      );
    }

    if (pinnedOnly) {
      result = result.filter(p => p.IsPinned);
    }

    setFiltered(sortPinnedFirst(result));
  }, [blogs, search, selectedTag, pinnedOnly]);

  const handleTogglePin = async (e: React.MouseEvent, post: BlogPost) => {
    e.stopPropagation();
    const nextPinned = !post.IsPinned;
    setBlogs(prev =>
      sortPinnedFirst(prev.map(item => item.ID === post.ID ? { ...item, IsPinned: nextPinned } : item))
    );
    await togglePinRecord('blogs', post.ID, nextPinned);
    onNotify?.(
      nextPinned ? `Pinned "${post.Title}" to top` : `Unpinned "${post.Title}"`,
      'success'
    );
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedTag('');
    setPinnedOnly(false);
  };

  const navigateToPost = (id: string) => {
    setSelectedId(id);
    setCurrentPage('blog-item');
  };

  const pinnedCount = blogs.filter(b => b.IsPinned).length;
  const activeFilterCount = (search.trim() ? 1 : 0) + (selectedTag ? 1 : 0) + (pinnedOnly ? 1 : 0);

  return (
    <div className="flex flex-col min-h-screen text-left bg-[#FFFBFB]">
      {/* Crimson Editorial Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#6B081B] via-[#9E0D28] to-[#C21434] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_70%_at_90%_-15%,rgba(255,255,255,0.16),transparent)] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 text-rose-100 text-xs font-semibold uppercase tracking-[0.16em] mb-2">
            <Newspaper className="w-3.5 h-3.5" />
            <span>Counselor Dispatch</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-white">
            Advisory Notes & Editorial Publications
          </h1>
          <p className="text-rose-100/90 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed">
            Read professional stream selection analyses, competitive examination guidelines, university application strategies, and regular dispatches from the counselor faculty.
          </p>
        </div>
      </section>

      {/* Main Column Listing */}
      <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Mobile Collapsible Filter Trigger */}
          <div className="lg:hidden space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-9 pr-3 py-2.5 border border-rose-200 rounded-xl text-sm text-[#241115] placeholder-[#9E7880] focus:outline-none focus:ring-2 focus:ring-[#B80F2E]/25 focus:border-[#B80F2E] bg-white"
                />
                <Search className="w-4 h-4 text-[#B80F2E] absolute left-3 top-3" />
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="px-3.5 py-2.5 bg-white border border-rose-200 rounded-xl text-xs font-semibold text-[#8B0E24] flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Topics</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#B80F2E] text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                {mobileFiltersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Quick Pinned Chip on Mobile */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              <button
                type="button"
                onClick={() => setPinnedOnly(!pinnedOnly)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 border transition-colors cursor-pointer ${
                  pinnedOnly
                    ? 'bg-[#B80F2E] text-white border-[#B80F2E]'
                    : 'bg-white text-[#8B0E24] border-rose-200 hover:bg-rose-50'
                }`}
              >
                <Pin className="w-3 h-3" />
                <span>Pinned ({pinnedCount})</span>
              </button>
              {allTags.slice(0, 6).map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 border transition-colors cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-[#B80F2E] text-white border-[#B80F2E]'
                      : 'bg-white text-[#5C4146] border-rose-100 hover:border-rose-300'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Tag Filter Sidebar */}
          <aside className={`lg:col-span-1 space-y-6 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl border border-rose-100 p-5 space-y-5 shadow-2xs lg:sticky lg:top-24">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                <span className="font-bold text-[#8B0E24] uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#B80F2E]" />
                  <span>Topic Archive</span>
                </span>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-semibold text-[#B80F2E] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Keyword Search (Desktop) */}
              <div className="space-y-1.5 hidden lg:block">
                <label className="text-[11px] font-bold text-[#8A6970] uppercase tracking-wider">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search titles or keywords..."
                    className="w-full pl-8 pr-3 py-2 border border-rose-200 rounded-xl text-xs text-[#241115] placeholder-[#A5828A] focus:outline-none focus:border-[#B80F2E] focus:ring-2 focus:ring-[#B80F2E]/15 bg-white"
                  />
                  <Search className="w-3.5 h-3.5 text-[#B80F2E]/70 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Pinned Filter Toggle */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#8A6970] uppercase tracking-wider">Priority</label>
                <button
                  type="button"
                  onClick={() => setPinnedOnly(!pinnedOnly)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    pinnedOnly
                      ? 'bg-[#B80F2E] text-white border-[#B80F2E] shadow-xs'
                      : 'bg-[#FFF7F8] text-[#8B0E24] border-rose-100 hover:border-rose-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Pin className="w-3.5 h-3.5" />
                    <span>Pinned Posts Only</span>
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    pinnedOnly ? 'bg-white/20 text-white' : 'bg-white text-[#B80F2E]'
                  }`}>
                    {pinnedCount}
                  </span>
                </button>
              </div>

              {/* Unique Tags */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#8A6970] uppercase tracking-wider">Topics</label>
                <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setSelectedTag('')}
                    className={`text-left px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      selectedTag === ''
                        ? 'font-semibold text-[#9E0D28] bg-rose-50 border border-rose-100'
                        : 'text-[#5C4146] hover:text-[#9E0D28] hover:bg-rose-50/40'
                    }`}
                  >
                    All Publications
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`text-left px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        selectedTag === tag
                          ? 'font-semibold text-[#9E0D28] bg-rose-50 border border-rose-100'
                          : 'text-[#5C4146] hover:text-[#9E0D28] hover:bg-rose-50/40'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main publications display */}
          <main className="lg:col-span-3 space-y-5">
            {/* Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-3 bg-white px-4 sm:px-5 py-3 border border-rose-100 rounded-2xl shadow-2xs">
              <div className="text-xs text-[#694D53]">
                {filtered.length ? (
                  <span>
                    Showing <strong className="text-[#8B0E24] font-bold">{filtered.length}</strong> articles
                    {pinnedCount > 0 && !pinnedOnly && (
                      <span className="ml-1.5 text-[#B80F2E] font-medium">
                        · {pinnedCount} pinned
                      </span>
                    )}
                  </span>
                ) : (
                  <span>No articles found under selected topic</span>
                )}
              </div>

              <div className="flex items-center gap-1 bg-[#FFF6F7] p-1 rounded-xl border border-rose-100">
                <button
                  type="button"
                  onClick={() => setLayout('compact-list')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    layout === 'compact-list'
                      ? 'bg-[#B80F2E] text-white shadow-2xs'
                      : 'text-[#694D53] hover:text-[#9E0D28]'
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLayout('bento-grid')}
                  className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    layout === 'bento-grid'
                      ? 'bg-[#B80F2E] text-white shadow-2xs'
                      : 'text-[#694D53] hover:text-[#9E0D28]'
                  }`}
                  title="Bento Grid"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLayout('classic-card')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    layout === 'classic-card'
                      ? 'bg-[#B80F2E] text-white shadow-2xs'
                      : 'text-[#694D53] hover:text-[#9E0D28]'
                  }`}
                  title="Classic Cards"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-24 text-center">
                <div className="spinner" />
                <p className="text-[#8A6970] font-semibold uppercase tracking-wider text-xs mt-3">
                  Streaming publication logs...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-rose-200 p-12 text-center">
                <h3 className="font-serif text-xl text-[#241115]">No publications found</h3>
                <p className="text-[#694D53] text-xs sm:text-sm mt-1.5 max-w-sm mx-auto">
                  No article matches your keyword, pinned filter, or tag selection. Try clearing active filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 px-5 py-2.5 bg-[#B80F2E] text-white rounded-xl text-xs font-semibold hover:bg-[#8B0E24] transition-colors cursor-pointer"
                >
                  View All Publications
                </button>
              </div>
            ) : (
              <div className={
                layout === 'compact-list'
                  ? 'flex flex-col gap-3'
                  : layout === 'bento-grid'
                    ? 'grid grid-cols-1 md:grid-cols-6 gap-6'
                    : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
              }>
                {filtered.map((p, index) => {
                  const rawContent = p.Content ? p.Content.replace(/<[^>]*>/g, '') : '';
                  const excerpt = rawContent.slice(0, 120) + (rawContent.length > 120 ? '...' : '');
                  const bentoSpan = index % 3 === 0 ? 'md:col-span-4' : 'md:col-span-2';

                  // PRESET 1: COMPACT LIST
                  if (layout === 'compact-list') {
                    return (
                      <div
                        key={p.ID}
                        onClick={() => navigateToPost(p.ID)}
                        className={`bg-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all group border ${
                          p.IsPinned
                            ? 'border-rose-300 bg-gradient-to-r from-[#FFF7F8] to-white shadow-xs ring-1 ring-rose-100'
                            : 'border-rose-100 hover:border-rose-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="text-left flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2 text-[11px] font-medium text-[#8A6970] mb-1.5">
                            {p.IsPinned && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#B80F2E] text-white text-[10px] font-bold uppercase tracking-wider">
                                <Pin className="w-2.5 h-2.5 fill-current" />
                                Pinned
                              </span>
                            )}
                            <span>{new Date(p.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            {(p.Tags || '').split(',').filter(Boolean).slice(0, 2).map((tag, i) => (
                              <span key={i} className="text-[#B80F2E] bg-rose-50 px-2 py-0.5 rounded-md font-semibold">
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                          <h3 className="font-serif font-semibold text-[#241115] text-base sm:text-lg group-hover:text-[#B80F2E] transition-colors">
                            {p.Title}
                          </h3>
                          <p className="text-[#694D53] text-xs line-clamp-1 mt-1 max-w-xl">{excerpt}</p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-rose-100/80 pt-3 sm:pt-0 shrink-0 text-xs">
                          <button
                            type="button"
                            onClick={(e) => handleTogglePin(e, p)}
                            title={p.IsPinned ? 'Unpin post' : 'Pin post to top'}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              p.IsPinned
                                ? 'bg-[#B80F2E] text-white border-[#B80F2E]'
                                : 'bg-white text-[#8A6970] border-rose-100 hover:border-rose-300 hover:text-[#B80F2E] hover:bg-rose-50'
                            }`}
                          >
                            <Pin className={`w-3.5 h-3.5 ${p.IsPinned ? 'fill-current' : ''}`} />
                          </button>
                          <span className="text-[#9E0D28] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Read <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // PRESET 2: BENTO GRID & PRESET 3: CLASSIC CARD
                  const isBento = layout === 'bento-grid';
                  return (
                    <div
                      key={p.ID}
                      onClick={() => navigateToPost(p.ID)}
                      className={`bg-white rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 flex flex-col justify-between border ${
                        p.IsPinned
                          ? 'border-rose-300 ring-1 ring-rose-100 shadow-sm hover:shadow-lg'
                          : 'border-rose-100 hover:border-rose-300 hover:shadow-md'
                      } ${isBento ? bentoSpan : ''}`}
                    >
                      <div>
                        <div className="relative aspect-[16/10] bg-rose-50 overflow-hidden shrink-0">
                          <img
                            src={p.FeaturedImageURL || (isBento
                              ? "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                              : "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80")}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#36040D]/30 via-transparent to-transparent" />

                          {/* Top Left: Pinned Badge */}
                          {p.IsPinned && (
                            <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#B80F2E] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                              <Pin className="w-3 h-3 fill-current" />
                              Pinned
                            </span>
                          )}

                          {/* Top Right: PDF Badge + Pin Action Button */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            {p.PDFLink && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/95 text-[#9E0D28] px-2 py-1 rounded-lg shadow-xs">
                                <FileDownIcon className="w-3 h-3" />
                                PDF
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleTogglePin(e, p)}
                              title={p.IsPinned ? 'Unpin post' : 'Pin post to top'}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                                p.IsPinned
                                  ? 'bg-[#B80F2E] text-white'
                                  : 'bg-white/95 text-[#694D53] hover:bg-[#B80F2E] hover:text-white'
                              }`}
                            >
                              <Pin className={`w-3.5 h-3.5 ${p.IsPinned ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="flex items-center flex-wrap gap-1.5 text-[11px] font-medium text-[#8A6970] mb-2">
                            <span>{new Date(p.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            {(p.Tags || '').split(',').filter(Boolean).slice(0, isBento ? 2 : 1).map((tag, i) => (
                              <span key={i} className="text-[#B80F2E] bg-rose-50 px-2 py-0.5 rounded-md font-semibold">
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                          <h3 className="font-serif font-semibold text-lg text-[#241115] group-hover:text-[#B80F2E] transition-colors line-clamp-2 mb-2 leading-snug">
                            {p.Title}
                          </h3>
                          <p className={`text-[#694D53] text-xs leading-relaxed ${isBento ? 'line-clamp-3' : 'line-clamp-2'}`}>
                            {excerpt}
                          </p>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-0">
                        <div className="flex items-center justify-between border-t border-rose-100/80 pt-3.5 text-xs text-[#8A6970]">
                          <span className="font-medium">{isBento ? 'Counselor Panel' : 'Guidance Note'}</span>
                          <span className="text-[#B80F2E] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            {isBento ? 'Read entry' : 'Read'} <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
