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
  BookOpen,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  PlayCircle
} from 'lucide-react';
import { Course, CardLayoutPreset } from '../types';
import { fetchAllCourses, togglePinRecord, sortPinnedFirst } from '../lib/supabase';

interface CoursesProps {
  setSelectedId: (id: string) => void;
  setCurrentPage: (page: string) => void;
  onNotify?: (msg: string, type?: 'success' | 'err') => void;
}

export default function Courses({ setSelectedId, setCurrentPage, onNotify }: CoursesProps) {
  const [layout, setLayout] = useState<CardLayoutPreset>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'classic-card';
    }
    return 'bento-grid';
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const grades = ["Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchAllCourses(true);
        setCourses(data);
        const cats = Array.from(new Set(data.map(c => c.Category).filter(Boolean)));
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    let result = [...courses];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.Title.toLowerCase().includes(q) ||
        c.Description.toLowerCase().includes(q) ||
        c.Instructor.toLowerCase().includes(q)
      );
    }

    if (selectedGrade) {
      result = result.filter(c => c.Grade === selectedGrade);
    }

    if (selectedCategory) {
      result = result.filter(c => c.Category === selectedCategory);
    }

    if (pinnedOnly) {
      result = result.filter(c => c.IsPinned);
    }

    setFiltered(sortPinnedFirst(result));
  }, [courses, search, selectedGrade, selectedCategory, pinnedOnly]);

  const handleTogglePin = async (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    const nextPinned = !course.IsPinned;
    setCourses(prev =>
      sortPinnedFirst(prev.map(item => item.ID === course.ID ? { ...item, IsPinned: nextPinned } : item))
    );
    await togglePinRecord('courses', course.ID, nextPinned);
    onNotify?.(
      nextPinned ? `Pinned "${course.Title}" to top` : `Unpinned "${course.Title}"`,
      'success'
    );
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedGrade('');
    setSelectedCategory('');
    setPinnedOnly(false);
  };

  const navigateToCourse = (id: string) => {
    setSelectedId(id);
    setCurrentPage('course');
  };

  const pinnedCount = courses.filter(c => c.IsPinned).length;
  const activeFilterCount =
    (search.trim() ? 1 : 0) +
    (selectedGrade ? 1 : 0) +
    (selectedCategory ? 1 : 0) +
    (pinnedOnly ? 1 : 0);

  return (
    <div className="flex flex-col min-h-screen text-left bg-[#FFFBFB]">
      {/* Crimson Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#6B081B] via-[#9E0D28] to-[#C21434] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_70%_at_90%_-15%,rgba(255,255,255,0.16),transparent)] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 text-rose-100 text-xs font-semibold uppercase tracking-[0.16em] mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Syllabuses & Modules</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-white">
            Aptitude & College Preparation Modules
          </h1>
          <p className="text-rose-100/90 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed">
            Acquire specialized credentials, build university application narratives, and practice critical thinking loops designed specifically for school-leavers.
          </p>
        </div>
      </section>

      {/* Main Core listing shell */}
      <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Mobile Compact Search & Filter Bar */}
          <div className="lg:hidden space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Keyword, instructor..."
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
                <span>Filters</span>
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
              {grades.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGrade(selectedGrade === g ? '' : g)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 border transition-colors cursor-pointer ${
                    selectedGrade === g
                      ? 'bg-[#B80F2E] text-white border-[#B80F2E]'
                      : 'bg-white text-[#5C4146] border-rose-100 hover:border-rose-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Left Sidebar Filter Section */}
          <aside className={`lg:col-span-1 space-y-6 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl border border-rose-100 p-5 space-y-5 shadow-2xs lg:sticky lg:top-24">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                <span className="font-bold text-[#8B0E24] uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#B80F2E]" />
                  <span>Filter Syllabus</span>
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

              {/* Desktop search */}
              <div className="space-y-1.5 hidden lg:block">
                <label className="text-[11px] font-bold text-[#8A6970] uppercase tracking-wider">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Keyword, instructor..."
                    className="w-full pl-8 pr-3 py-2 border border-rose-200 rounded-xl text-xs text-[#241115] placeholder-[#A5828A] focus:outline-none focus:border-[#B80F2E] focus:ring-2 focus:ring-[#B80F2E]/15 bg-white"
                  />
                  <Search className="w-3.5 h-3.5 text-[#B80F2E]/70 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Pinned Filter */}
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

              {/* Class levels */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#8A6970] uppercase tracking-wider">School Tier</label>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedGrade('')}
                    className={`text-left px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      selectedGrade === ''
                        ? 'font-semibold text-[#9E0D28] bg-rose-50 border border-rose-100'
                        : 'text-[#5C4146] hover:text-[#9E0D28] hover:bg-rose-50/40'
                    }`}
                  >
                    All Classes
                  </button>
                  {grades.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGrade(g)}
                      className={`text-left px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        selectedGrade === g
                          ? 'font-semibold text-[#9E0D28] bg-rose-50 border border-rose-100'
                          : 'text-[#5C4146] hover:text-[#9E0D28] hover:bg-rose-50/40'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#8A6970] uppercase tracking-wider">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs font-medium text-[#241115] focus:outline-none focus:border-[#B80F2E] bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Right Main Grid Section */}
          <main className="lg:col-span-3 space-y-5">
            {/* Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-3 bg-white px-4 sm:px-5 py-3 border border-rose-100 rounded-2xl shadow-2xs">
              <div className="text-xs text-[#694D53]">
                {filtered.length ? (
                  <span>
                    Showing <strong className="text-[#8B0E24] font-bold">{filtered.length}</strong> modules
                    {pinnedCount > 0 && !pinnedOnly && (
                      <span className="ml-1.5 text-[#B80F2E] font-medium">· {pinnedCount} pinned</span>
                    )}
                  </span>
                ) : (
                  <span>No courses found matching criteria</span>
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
                  <span>Bento</span>
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
                  Streaming module list...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-rose-200 p-12 text-center">
                <h3 className="font-serif text-xl text-[#241115]">No modules available</h3>
                <p className="text-[#694D53] text-xs sm:text-sm mt-1.5 max-w-sm mx-auto">
                  Try clearing your active filters or query terms to view other counselor recommendations.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 px-5 py-2.5 bg-[#B80F2E] text-white rounded-xl text-xs font-semibold hover:bg-[#8B0E24] transition-colors cursor-pointer"
                >
                  Reset All Filters
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
                {filtered.map((c, index) => {
                  const bentoClass = index % 3 === 0 ? 'md:col-span-4' : 'md:col-span-2';

                  // PRESET 1: COMPACT LIST
                  if (layout === 'compact-list') {
                    return (
                      <div
                        key={c.ID}
                        onClick={() => navigateToCourse(c.ID)}
                        className={`bg-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all group border ${
                          c.IsPinned
                            ? 'border-rose-300 bg-gradient-to-r from-[#FFF7F8] to-white shadow-xs ring-1 ring-rose-100'
                            : 'border-rose-100 hover:border-rose-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="text-left flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                            {c.IsPinned && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#B80F2E] text-white text-[10px]">
                                <Pin className="w-2.5 h-2.5 fill-current" />
                                Pinned
                              </span>
                            )}
                            <span className="text-[#B80F2E] bg-rose-50 px-2 py-0.5 rounded-md">{c.Category}</span>
                            {c.Grade && <span className="text-[#8A6970]">· {c.Grade}</span>}
                          </div>
                          <h3 className="font-serif font-semibold text-[#241115] text-base sm:text-lg group-hover:text-[#B80F2E] transition-colors">
                            {c.Title}
                          </h3>
                          <p className="text-[#694D53] text-xs line-clamp-1 mt-1 max-w-xl">{c.Description}</p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-rose-100/80 pt-3 sm:pt-0 shrink-0 text-xs text-[#694D53]">
                          <span className="truncate max-w-[160px]">{c.Instructor}</span>
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={(e) => handleTogglePin(e, c)}
                              title={c.IsPinned ? 'Unpin course' : 'Pin course to top'}
                              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                c.IsPinned
                                  ? 'bg-[#B80F2E] text-white border-[#B80F2E]'
                                  : 'bg-white text-[#8A6970] border-rose-100 hover:border-rose-300 hover:text-[#B80F2E] hover:bg-rose-50'
                              }`}
                            >
                              <Pin className={`w-3.5 h-3.5 ${c.IsPinned ? 'fill-current' : ''}`} />
                            </button>
                            <span className="text-[#9E0D28] font-semibold flex items-center gap-1">
                              Open <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // PRESET 2 & 3: BENTO & CLASSIC CARD
                  const isBento = layout === 'bento-grid';
                  return (
                    <div
                      key={c.ID}
                      onClick={() => navigateToCourse(c.ID)}
                      className={`bg-white rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 flex flex-col justify-between border ${
                        c.IsPinned
                          ? 'border-rose-300 ring-1 ring-rose-100 shadow-sm hover:shadow-lg'
                          : 'border-rose-100 hover:border-rose-300 hover:shadow-md'
                      } ${isBento ? bentoClass : ''}`}
                    >
                      <div>
                        <div className="relative aspect-[16/10] bg-rose-50 overflow-hidden shrink-0">
                          <img
                            src={c.ThumbnailURL || (isBento
                              ? "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80"
                              : "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80")}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#36040D]/30 via-transparent to-transparent" />

                          {c.IsPinned && (
                            <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#B80F2E] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                              <Pin className="w-3 h-3 fill-current" />
                              Pinned
                            </span>
                          )}

                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            {c.YouTubeURL && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/95 text-[#9E0D28] px-2 py-1 rounded-lg shadow-xs">
                                <PlayCircle className="w-3 h-3" />
                                Video
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleTogglePin(e, c)}
                              title={c.IsPinned ? 'Unpin course' : 'Pin course to top'}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                                c.IsPinned
                                  ? 'bg-[#B80F2E] text-white'
                                  : 'bg-white/95 text-[#694D53] hover:bg-[#B80F2E] hover:text-white'
                              }`}
                            >
                              <Pin className={`w-3.5 h-3.5 ${c.IsPinned ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="flex items-center flex-wrap gap-1.5 text-[11px] font-semibold uppercase tracking-wider mb-2">
                            <span className="text-[#B80F2E] bg-rose-50 px-2 py-0.5 rounded-md">{c.Category}</span>
                            {c.Grade && <span className="text-[#8A6970]">· {c.Grade}</span>}
                          </div>
                          <h3 className="font-serif font-semibold text-lg text-[#241115] group-hover:text-[#B80F2E] transition-colors line-clamp-2 mb-2 leading-snug">
                            {c.Title}
                          </h3>
                          <p className={`text-[#694D53] text-xs leading-relaxed ${isBento ? 'line-clamp-3' : 'line-clamp-2'}`}>
                            {c.Description}
                          </p>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-0">
                        <div className="flex items-center justify-between border-t border-rose-100/80 pt-3.5 text-xs text-[#8A6970]">
                          <span className="truncate max-w-[170px] font-medium">{c.Instructor}</span>
                          <span className="text-[#B80F2E] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Open <ArrowRight className="w-3.5 h-3.5" />
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

export function FileDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
