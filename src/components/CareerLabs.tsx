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
  FlaskConical,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  FileDown as FileDownIcon
} from 'lucide-react';
import { CareerLab, CardLayoutPreset } from '../types';
import { fetchAllCareerLabs, togglePinRecord, sortPinnedFirst } from '../lib/supabase';

interface CareerLabsProps {
  setSelectedId: (id: string) => void;
  setCurrentPage: (page: string) => void;
  onNotify?: (msg: string, type?: 'success' | 'err') => void;
}

export default function CareerLabs({ setSelectedId, setCurrentPage, onNotify }: CareerLabsProps) {
  const [layout, setLayout] = useState<CardLayoutPreset>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'classic-card';
    }
    return 'bento-grid';
  });
  const [labs, setLabs] = useState<CareerLab[]>([]);
  const [filtered, setFiltered] = useState<CareerLab[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchAllCareerLabs(true);
        setLabs(data);
        const cats = Array.from(new Set(data.map(l => l.Category).filter(Boolean)));
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load career lab index:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    let result = [...labs];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.Title.toLowerCase().includes(q) ||
        l.Description.toLowerCase().includes(q) ||
        l.Student.toLowerCase().includes(q) ||
        l.Mentor.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter(l => l.Category === selectedCategory);
    }

    if (pinnedOnly) {
      result = result.filter(l => l.IsPinned);
    }

    setFiltered(sortPinnedFirst(result));
  }, [labs, search, selectedCategory, pinnedOnly]);

  const handleTogglePin = async (e: React.MouseEvent, lab: CareerLab) => {
    e.stopPropagation();
    const nextPinned = !lab.IsPinned;
    setLabs(prev =>
      sortPinnedFirst(prev.map(item => item.ID === lab.ID ? { ...item, IsPinned: nextPinned } : item))
    );
    await togglePinRecord('career_labs', lab.ID, nextPinned);
    onNotify?.(
      nextPinned ? `Pinned "${lab.Title}" to top` : `Unpinned "${lab.Title}"`,
      'success'
    );
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setPinnedOnly(false);
  };

  const navigateToLab = (id: string) => {
    setSelectedId(id);
    setCurrentPage('lab-item');
  };

  const pinnedCount = labs.filter(l => l.IsPinned).length;
  const activeFilterCount = (search.trim() ? 1 : 0) + (selectedCategory ? 1 : 0) + (pinnedOnly ? 1 : 0);

  return (
    <div className="flex flex-col min-h-screen text-left bg-[#FFFBFB]">
      {/* Crimson Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#6B081B] via-[#9E0D28] to-[#C21434] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_70%_at_90%_-15%,rgba(255,255,255,0.16),transparent)] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 text-rose-100 text-xs font-semibold uppercase tracking-[0.16em] mb-2">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Student Research & Portfolios</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-white">
            Career Laboratory Archive
          </h1>
          <p className="text-rose-100/90 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed">
            Discover original student research papers, experimental prototypes, field study journals, and analytical solutions mentored by campus faculty.
          </p>
        </div>
      </section>

      {/* Main catalog */}
      <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Mobile Search & Quick Filter Bar */}
          <div className="lg:hidden space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects or students..."
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
                <span>Fields</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#B80F2E] text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                {mobileFiltersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

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
              {categories.slice(0, 6).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 border transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#B80F2E] text-white border-[#B80F2E]'
                      : 'bg-white text-[#5C4146] border-rose-100 hover:border-rose-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className={`lg:col-span-1 space-y-6 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl border border-rose-100 p-5 space-y-5 shadow-2xs lg:sticky lg:top-24">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                <span className="font-bold text-[#8B0E24] uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#B80F2E]" />
                  <span>Disciplines</span>
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

              <div className="space-y-1.5 hidden lg:block">
                <label className="text-[11px] font-bold text-[#8A6970] uppercase tracking-wider">Project or Author</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search projects or students..."
                    className="w-full pl-8 pr-3 py-2 border border-rose-200 rounded-xl text-xs text-[#241115] placeholder-[#A5828A] focus:outline-none focus:border-[#B80F2E] focus:ring-2 focus:ring-[#B80F2E]/15 bg-white"
                  />
                  <Search className="w-3.5 h-3.5 text-[#B80F2E]/70 absolute left-2.5 top-2.5" />
                </div>
              </div>

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
                    <span>Pinned Only</span>
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    pinnedOnly ? 'bg-white/20 text-white' : 'bg-white text-[#B80F2E]'
                  }`}>
                    {pinnedCount}
                  </span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#8A6970] uppercase tracking-wider">Field</label>
                <div className="flex flex-col gap-1 pr-1 max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('')}
                    className={`text-left px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      selectedCategory === ''
                        ? 'font-semibold text-[#9E0D28] bg-rose-50 border border-rose-100'
                        : 'text-[#5C4146] hover:text-[#9E0D28] hover:bg-rose-50/40'
                    }`}
                  >
                    All Research
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-left px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'font-semibold text-[#9E0D28] bg-rose-50 border border-rose-100'
                          : 'text-[#5C4146] hover:text-[#9E0D28] hover:bg-rose-50/40'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Listing pane */}
          <main className="lg:col-span-3 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3 bg-white px-4 sm:px-5 py-3 border border-rose-100 rounded-2xl shadow-2xs">
              <div className="text-xs text-[#694D53]">
                {filtered.length ? (
                  <span>
                    Showing <strong className="text-[#8B0E24] font-bold">{filtered.length}</strong> student portfolios
                    {pinnedCount > 0 && !pinnedOnly && (
                      <span className="ml-1.5 text-[#B80F2E] font-medium">· {pinnedCount} pinned</span>
                    )}
                  </span>
                ) : (
                  <span>No portfolios match this discipline category</span>
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
                  Streaming laboratory archives...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-rose-200 p-12 text-center">
                <h3 className="font-serif text-xl text-[#241115]">No laboratory portfolios found</h3>
                <p className="text-[#694D53] text-xs sm:text-sm mt-1.5 max-w-sm mx-auto">
                  Try clearing your filters or query terms to view other student project papers.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 px-5 py-2.5 bg-[#B80F2E] text-white rounded-xl text-xs font-semibold hover:bg-[#8B0E24] transition-colors cursor-pointer"
                >
                  Reset Active Filters
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
                {filtered.map((l, index) => {
                  const bentoSpan = index % 3 === 0 ? 'md:col-span-4' : 'md:col-span-2';

                  // PRESET 1: COMPACT LIST
                  if (layout === 'compact-list') {
                    return (
                      <div
                        key={l.ID}
                        onClick={() => navigateToLab(l.ID)}
                        className={`bg-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all group border ${
                          l.IsPinned
                            ? 'border-rose-300 bg-gradient-to-r from-[#FFF7F8] to-white shadow-xs ring-1 ring-rose-100'
                            : 'border-rose-100 hover:border-rose-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="text-left flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2 text-[11px] font-semibold mb-1.5">
                            {l.IsPinned && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#B80F2E] text-white text-[10px] uppercase">
                                <Pin className="w-2.5 h-2.5 fill-current" />
                                Pinned
                              </span>
                            )}
                            <span className="text-[#B80F2E] bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{l.Category}</span>
                            <span className="text-[#8A6970]">· Student: {l.Student}</span>
                          </div>
                          <h3 className="font-serif font-semibold text-[#241115] text-base sm:text-lg group-hover:text-[#B80F2E] transition-colors">
                            {l.Title}
                          </h3>
                          <p className="text-[#694D53] text-xs line-clamp-1 mt-1 max-w-xl">{l.Description}</p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-rose-100/80 pt-3 sm:pt-0 shrink-0 text-xs text-[#694D53]">
                          <span className="truncate max-w-[150px]">Mentor: {l.Mentor}</span>
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={(e) => handleTogglePin(e, l)}
                              title={l.IsPinned ? 'Unpin project' : 'Pin project to top'}
                              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                l.IsPinned
                                  ? 'bg-[#B80F2E] text-white border-[#B80F2E]'
                                  : 'bg-white text-[#8A6970] border-rose-100 hover:border-rose-300 hover:text-[#B80F2E] hover:bg-rose-50'
                              }`}
                            >
                              <Pin className={`w-3.5 h-3.5 ${l.IsPinned ? 'fill-current' : ''}`} />
                            </button>
                            <span className="text-[#9E0D28] font-semibold flex items-center gap-1">
                              Open <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // PRESET 2 & 3
                  const isBento = layout === 'bento-grid';
                  return (
                    <div
                      key={l.ID}
                      onClick={() => navigateToLab(l.ID)}
                      className={`bg-white rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 flex flex-col justify-between border ${
                        l.IsPinned
                          ? 'border-rose-300 ring-1 ring-rose-100 shadow-sm hover:shadow-lg'
                          : 'border-rose-100 hover:border-rose-300 hover:shadow-md'
                      } ${isBento ? bentoSpan : ''}`}
                    >
                      <div>
                        <div className="relative aspect-[16/10] bg-rose-50 overflow-hidden shrink-0">
                          <img
                            src={l.ThumbnailURL || "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=800&q=80"}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#36040D]/30 via-transparent to-transparent" />

                          {l.IsPinned && (
                            <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#B80F2E] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                              <Pin className="w-3 h-3 fill-current" />
                              Pinned
                            </span>
                          )}

                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            {l.PDFLink && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/95 text-[#9E0D28] px-2 py-1 rounded-lg shadow-xs">
                                <FileDownIcon className="w-3 h-3" />
                                PDF
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleTogglePin(e, l)}
                              title={l.IsPinned ? 'Unpin project' : 'Pin project to top'}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                                l.IsPinned
                                  ? 'bg-[#B80F2E] text-white'
                                  : 'bg-white/95 text-[#694D53] hover:bg-[#B80F2E] hover:text-white'
                              }`}
                            >
                              <Pin className={`w-3.5 h-3.5 ${l.IsPinned ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="flex items-center flex-wrap gap-1.5 text-[11px] font-semibold uppercase tracking-wider mb-2">
                            <span className="text-[#B80F2E] bg-rose-50 px-2 py-0.5 rounded-md">{l.Category}</span>
                            {isBento && <span className="text-[#8A6970]">· {l.Student}</span>}
                          </div>
                          <h3 className="font-serif font-semibold text-lg text-[#241115] group-hover:text-[#B80F2E] transition-colors line-clamp-2 mb-2 leading-snug">
                            {l.Title}
                          </h3>
                          <p className={`text-[#694D53] text-xs leading-relaxed ${isBento ? 'line-clamp-3' : 'line-clamp-2'}`}>
                            {l.Description}
                          </p>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-0">
                        <div className="flex items-center justify-between border-t border-rose-100/80 pt-3.5 text-xs text-[#8A6970]">
                          <span className="truncate max-w-[160px] font-medium">
                            {isBento ? `Mentor: ${l.Mentor}` : `Student: ${l.Student}`}
                          </span>
                          <span className="text-[#B80F2E] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            {isBento ? 'Open project' : 'Open'} <ArrowRight className="w-3.5 h-3.5" />
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
