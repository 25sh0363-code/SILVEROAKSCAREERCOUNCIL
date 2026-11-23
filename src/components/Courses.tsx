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
  PlayCircle,
  BookOpen,
  ArrowRight,
  X
} from 'lucide-react';
import { Course, CardLayoutPreset } from '../types';
import { fetchAllCourses } from '../lib/supabase';

interface CoursesProps {
  setCurrentPage: (page: string) => void;
  setSelectedId: (id: string) => void;
}

export default function Courses({ setCurrentPage, setSelectedId }: CoursesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [layout, setLayout] = useState<CardLayoutPreset>('classic-card');

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await fetchAllCourses(true);
      setCourses(data);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
    window.addEventListener('pins-updated', loadCourses);
    return () => window.removeEventListener('pins-updated', loadCourses);
  }, []);

  const grades = useMemo(() => {
    const base = ['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
    const found = new Set<string>(courses.map(c => c.Grade?.trim()).filter(Boolean) as string[]);
    const ordered = base.filter(g => found.has(g));
    found.forEach(g => {
      if (!ordered.includes(g)) ordered.push(g);
    });
    return ['All', ...ordered];
  }, [courses]);

  const categories = useMemo(() => {
    const set = new Set<string>(courses.map(c => c.Category?.trim()).filter(Boolean) as string[]);
    return ['All', ...Array.from(set)];
  }, [courses]);

  const filtered = useMemo(() => {
    return courses.filter(c => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.Title.toLowerCase().includes(q) ||
        (c.Description || '').toLowerCase().includes(q) ||
        (c.Instructor || '').toLowerCase().includes(q) ||
        (c.Category || '').toLowerCase().includes(q);
      const matchesGrade = selectedGrade === 'All' || c.Grade === selectedGrade;
      const matchesCat = selectedCategory === 'All' || c.Category === selectedCategory;
      return matchesSearch && matchesGrade && matchesCat;
    });
  }, [courses, searchTerm, selectedGrade, selectedCategory]);

  const pinnedCount = useMemo(() => filtered.filter(c => c.IsPinned).length, [filtered]);

  const openCourse = (id: string) => {
    setSelectedId(id);
    setCurrentPage('course');
  };

  const hasFilters = Boolean(searchTerm || selectedGrade !== 'All' || selectedCategory !== 'All');

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#141416] text-left">
      {/* Crisp White Editorial Page Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#C8102E] mb-2">
                <span className="w-5 h-[2px] bg-[#C8102E] inline-block" />
                <span>Structured Curriculum</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#141416] tracking-tight">
                Focus Courses
              </h1>
              <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                Grade-calibrated workshops, recorded lectures, and syllabus packets guiding students from middle school exploration through college admissions.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
              <span className="px-3 py-1.5 rounded-full bg-[#FAFAFA] border border-neutral-200 text-neutral-700">
                {filtered.length} {filtered.length === 1 ? 'Course' : 'Courses'}
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

      {/* Inline Full-Width Filter & Toolbar */}
      <section className="bg-white/95 border-b border-neutral-200 sticky top-16 z-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search courses, instructors, topics..."
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

              {/* Grade Select */}
              {grades.length > 1 && (
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  aria-label="Filter by grade"
                  className="px-3.5 py-2 bg-[#FAFAFA] border border-neutral-200 rounded-xl text-xs font-semibold text-[#141416] focus:outline-none focus:bg-white focus:border-[#C8102E] cursor-pointer"
                >
                  {grades.map(g => (
                    <option key={g} value={g}>
                      {g === 'All' ? 'All Grades' : g}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Reset & Layout Switcher */}
            <div className="flex items-center justify-between sm:justify-end gap-2">
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedGrade('All');
                    setSelectedCategory('All');
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

          {/* Horizontal Category Pills */}
          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              {categories.map(cat => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                      active
                        ? 'bg-[#C8102E] text-white border-[#C8102E]'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-[#C8102E]/40 hover:text-[#C8102E]'
                    }`}
                  >
                    {cat === 'All' ? 'All Categories' : cat}
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
              Loading course catalog...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center max-w-lg mx-auto">
            <BookOpen className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-semibold text-[#141416]">No courses found</h3>
            <p className="text-sm text-neutral-500 mt-1">
              No courses match your active search or grade filter.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedGrade('All');
                  setSelectedCategory('All');
                }}
                className="mt-5 px-4 py-2 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : layout === 'compact-list' ? (
          <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-200 overflow-hidden">
            {filtered.map(course => (
              <article
                key={course.ID}
                onClick={() => openCourse(course.ID)}
                className={`p-5 sm:p-6 hover:bg-[#FAFAFA] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  course.IsPinned ? 'border-l-4 border-l-[#C8102E] bg-red-50/20' : ''
                }`}
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {course.ThumbnailURL && (
                    <div className="w-24 h-16 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 hidden sm:block">
                      <img
                        src={course.ThumbnailURL}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      {course.IsPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-wider">
                          <Pin className="w-2.5 h-2.5 fill-current" />
                          Pinned · Important
                        </span>
                      )}
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8102E]">
                        {course.Category || 'General'}
                      </span>
                      {course.Grade && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                          {course.Grade}
                        </span>
                      )}
                    </div>
                    <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#141416] group-hover:text-[#C8102E] transition-colors leading-snug">
                      {course.Title}
                    </h2>
                    {course.Description && (
                      <p className="text-xs sm:text-sm text-neutral-600 mt-1 line-clamp-1">
                        {course.Description}
                      </p>
                    )}
                    <p className="text-xs text-neutral-500 mt-1.5">
                      Instructor: <span className="font-medium text-neutral-700">{course.Instructor || 'Council Staff'}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  {course.YouTubeURL && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-700 text-[11px] font-semibold">
                      <PlayCircle className="w-3.5 h-3.5" /> Video
                    </span>
                  )}
                  {course.PDFLink && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 text-[#C8102E] text-[11px] font-semibold">
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
            {filtered.map((course, idx) => {
              const isWide = layout === 'bento-grid' && (idx === 0 || idx === 3);
              const span = layout === 'bento-grid' ? (isWide ? 'md:col-span-4' : 'md:col-span-2') : '';
              return (
                <article
                  key={course.ID}
                  onClick={() => openCourse(course.ID)}
                  className={`${span} bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group ${
                    course.IsPinned
                      ? 'border-[#C8102E]/45 ring-1 ring-[#C8102E]/15'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div>
                    <div
                      className={`${
                        isWide ? 'aspect-[21/9]' : 'aspect-[16/10]'
                      } bg-neutral-100 relative overflow-hidden border-b border-neutral-100`}
                    >
                      {course.ThumbnailURL ? (
                        <img
                          src={course.ThumbnailURL}
                          alt={course.Title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#8F0B22] to-[#C8102E] flex items-center justify-center text-white/90">
                          <BookOpen className="w-10 h-10 stroke-[1.4]" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {course.IsPinned && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                            <Pin className="w-2.5 h-2.5 fill-current" />
                            Pinned · Important
                          </span>
                        )}
                        {course.Grade && (
                          <span className="px-2.5 py-1 rounded-full bg-white/95 text-[#141416] text-[10px] font-bold uppercase tracking-wider shadow-xs">
                            {course.Grade}
                          </span>
                        )}
                      </div>
                      {course.YouTubeURL && (
                        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/75 text-white text-[10px] font-semibold">
                          <PlayCircle className="w-3 h-3" /> Video
                        </span>
                      )}
                    </div>

                    <div className="p-5 sm:p-6">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8102E]">
                        {course.Category || 'General'}
                      </span>
                      <h2 className={`font-serif font-semibold text-[#141416] group-hover:text-[#C8102E] transition-colors mt-1.5 leading-snug line-clamp-2 ${isWide ? 'text-2xl' : 'text-lg'}`}>
                        {course.Title}
                      </h2>
                      {course.Description && (
                        <p className="text-xs sm:text-sm text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                          {course.Description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 py-3.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                    <span className="truncate font-medium">{course.Instructor || 'Council Staff'}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {course.PDFLink && (
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

export function FileDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M12 18v-6" />
      <path d="m9 15 3 3 3-3" />
    </svg>
  );
}
