/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, GraduationCap, Video, FileText, User, Filter, Grid, List, CheckCircle, ArrowRight } from 'lucide-react';
import { Course, CardLayoutPreset } from '../types';
import { fetchAllCourses } from '../lib/supabase';

interface CoursesProps {
  setSelectedId: (id: string) => void;
  setCurrentPage: (page: string) => void;
}

export default function Courses({ setSelectedId, setCurrentPage }: CoursesProps) {
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
  const [categories, setCategories] = useState<string[]>([]);

  const grades = ["Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchAllCourses(true);
        setCourses(data);
        
        // Extract unique categories
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

  // Filter computation
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

    setFiltered(result);
  }, [courses, search, selectedGrade, selectedCategory]);

  const resetFilters = () => {
    setSearch('');
    setSelectedGrade('');
    setSelectedCategory('');
  };

  const navigateToCourse = (id: string) => {
    setSelectedId(id);
    setCurrentPage('course');
  };

  return (
    <div className="flex flex-col min-h-screen text-left">
      
      {/* Page Banner Header */}
      <section className="bg-gradient-to-r from-[#8F0A22] via-[#B80F2E] to-[#D61A3C] text-white py-16 px-4 relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1000&q=80')` }} />
        <div className="relative z-10 max-w-7xl mx-auto">
          <span className="text-xs text-rose-300 font-extrabold uppercase tracking-widest">Syllabuses & Modules</span>
          <h1 className="text-3xl sm:text-4.5xl font-extrabold tracking-tight mt-1 font-serif">Aptitude & College Preparation Courses</h1>
          <p className="text-rose-100 text-sm sm:text-base mt-2 max-w-2xl">
            Acquire specialized credentials, build resume strategies, and practice critical thinking loops designed specifically for school-leavers.
          </p>
        </div>
      </section>

      {/* Main Core listing shell */}
      <section className="py-12 px-4 bg-gray-50 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar Filter Section */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="font-extrabold text-gray-950 uppercase text-xs tracking-wider flex items-center gap-1.5Packed">
                  <Filter className="w-3.5 h-3.5 text-[#B80F2E]" />
                  <span>Browse Filters</span>
                </span>
                {(selectedGrade || selectedCategory || search) && (
                  <button 
                    onClick={resetFilters}
                    className="text-[10px] text-[#B80F2E] font-bold uppercase tracking-wider hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Instant search input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Search keywords</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Keyword, instructor..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#B80F2E] focus:border-transparent bg-gray-50/50"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Class levels (original selector logic) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">School Tier</label>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setSelectedGrade('')}
                    className={`text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedGrade === ''
                        ? 'bg-rose-50 text-[#B80F2E] border-l-2 border-[#B80F2E]'
                        : 'text-gray-600 hover:bg-rose-50/30'
                    }`}
                  >
                    All Classes
                  </button>
                  {grades.map(g => (
                    <button
                      key={g}
                      onClick={() => setSelectedGrade(g)}
                      className={`text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedGrade === g
                          ? 'bg-rose-50 text-[#B80F2E] border-l-2 border-[#B80F2E]'
                          : 'text-gray-600 hover:bg-rose-50/30'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Categories</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#B80F2E] bg-gray-50/50"
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
          <main className="lg:col-span-3 space-y-6">
            
            {/* Toolbar line */}
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white px-5 py-4 border border-rose-100 rounded-2xl shadow-sm">
              <div className="text-xs sm:text-sm font-bold text-gray-500">
                {filtered.length ? (
                  <span>Showing <strong className="text-gray-900">{filtered.length}</strong> published courses</span>
                ) : (
                  <span>No courses found matching criteria</span>
                )}
              </div>
              
              {/* Dynamic Design Selection Button Group */}
              <div className="flex items-center gap-1 bg-rose-50/50 p-1 rounded-xl border border-rose-100">
                <button
                  onClick={() => setLayout('compact-list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                    layout === 'compact-list'
                      ? 'bg-rose-900 text-white shadow-sm'
                      : 'text-gray-500 hover:text-rose-900 hover:bg-rose-100/30'
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
                
                <button
                  onClick={() => setLayout('bento-grid')}
                  className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                    layout === 'bento-grid'
                      ? 'bg-rose-900 text-white shadow-sm'
                      : 'text-gray-500 hover:text-rose-900 hover:bg-rose-100/30'
                  }`}
                  title="Bento Grid"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Bento</span>
                </button>
                
                <button
                  onClick={() => setLayout('classic-card')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                    layout === 'classic-card'
                      ? 'bg-rose-900 text-white shadow-sm'
                      : 'text-gray-500 hover:text-rose-900 hover:bg-rose-100/30'
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
                <p className="text-gray-500 font-semibold uppercase tracking-wider text-xs mt-4">Streaming module list...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-16 text-center shadow-sm">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-lg font-bold text-gray-900 font-serif">No Courses Available</h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
                  Try clearing your active filters or query terms to view other counselor recommendations.
                </p>
                <button 
                  onClick={resetFilters}
                  className="mt-6 px-6 py-2.5 bg-[#B80F2E] text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#8F0A22] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              
              /* Layout dispatcher rendering logic */
              <div className={
                layout === 'compact-list' 
                  ? 'flex flex-col gap-4' 
                  : layout === 'bento-grid'
                    ? 'grid grid-cols-1 md:grid-cols-6 gap-6'
                    : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
              }>
                {filtered.map((c, index) => {
                  
                  // Bento grid span mapping logic (asymmetrical rhythm)
                  const bentoClass = index % 3 === 0 
                    ? 'md:col-span-4 bg-gradient-to-br from-rose-50/10 to-rose-200/5' 
                    : 'md:col-span-2';

                  {/* PRESET 1: COMPACT LIST ROWS */}
                  if (layout === 'compact-list') {
                    return (
                      <div 
                        key={c.ID}
                        onClick={() => navigateToCourse(c.ID)}
                        className="bg-white border border-rose-100 hover:border-[#B80F2E] p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md cursor-pointer transition-all group"
                      >
                        <div className="flex items-start gap-4 text-left">
                          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 text-[#B80F2E] flex items-center justify-center font-bold text-sm shrink-0 sm:flex hidden">
                            📚
                          </div>
                          <div>
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="text-[10px] font-black uppercase text-[#B80F2E] tracking-wider">{c.Category}</span>
                              <span className="text-[10px] font-bold uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{c.Grade}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-[#B80F2E] transition-all font-serif mt-1">
                              {c.Title}
                            </h3>
                            <p className="text-gray-500 text-xs sm:text-sm line-clamp-1 mt-0.5 max-w-xl">{c.Description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-rose-50 pt-2.5 sm:pt-0 shrink-0">
                          <span className="text-xs font-semibold text-gray-500">👨‍🏫 {c.Instructor}</span>
                          <button className="p-2 rounded-full bg-rose-50 text-[#B80F2E] group-hover:bg-[#B80F2E] group-hover:text-white transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  {/* PRESET 2: MODERN BENTO GRID */}
                  if (layout === 'bento-grid') {
                    return (
                      <div
                        key={c.ID}
                        onClick={() => navigateToCourse(c.ID)}
                        className={`bg-white border border-[#dde4ee] hover:border-[#B80F2E] hover:shadow-lg rounded-xl overflow-hidden cursor-pointer group transition-all flex flex-col h-full ${bentoClass}`}
                      >
                        <div className="relative aspect-video bg-rose-50 overflow-hidden shrink-0">
                          <img 
                            src={c.ThumbnailURL || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80"} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 bg-[#B80F2E] text-white font-extrabold text-[9px] uppercase px-2 py-0.5 rounded tracking-wide shadow">{c.Category}</span>
                        </div>
                        <div className="p-5 flex flex-col justify-between flex-1">
                          <div>
                            <span className="text-[10px] font-black uppercase text-[#B80F2E] tracking-widest">{c.Grade}</span>
                            <h3 className="font-extrabold text-base text-gray-900 group-hover:text-[#B80F2E] transition-all line-clamp-2 mt-1 mb-2 font-serif">
                              {c.Title}
                            </h3>
                            <p className="text-gray-500 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                              {c.Description}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between border-t border-rose-50 pt-4 mt-4 text-xs font-bold text-gray-500">
                            <span>👨‍🏫 {c.Instructor}</span>
                            <span className="text-[#B80F2E] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              <span>Enter</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  {/* PRESET 3: CLASSIC CARD LAYOUT */}
                  return (
                    <div
                      key={c.ID}
                      onClick={() => navigateToCourse(c.ID)}
                      className="bg-white border border-[#dde4ee] hover:border-[#B80F2E] hover:shadow-lg rounded-xl overflow-hidden cursor-pointer group transition-all flex flex-col h-[400px]"
                    >
                      <div className="relative aspect-video bg-rose-50 overflow-hidden shrink-0">
                        <img 
                          src={c.ThumbnailURL || "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80"} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 bg-rose-900 text-white font-extrabold text-[9px] uppercase px-2.5 py-1 rounded shadow tracking-wider">{c.Category}</span>
                        {c.YouTubeURL && (
                          <div className="absolute top-3 right-3 bg-red-600 text-white p-1 rounded-full shadow">
                            <Video className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {c.PDFLink && (
                          <div className="absolute top-3 right-8 bg-emerald-700 text-white p-1 rounded-full shadow">
                            <FileDown className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-5 flex flex-col justify-between flex-1">
                        <div>
                          <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider bg-rose-50 px-2 py-0.5 rounded text-[#B80F2E]">{c.Grade}</span>
                          <h3 className="font-extrabold text-base text-gray-900 group-hover:text-[#B80F2E] transition-all line-clamp-2 mt-2 mb-2 font-serif">
                            {c.Title}
                          </h3>
                          <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                            {c.Description}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-rose-50 pt-4 mt-2 text-xs font-bold text-gray-500">
                          <span>👨‍🏫 {c.Instructor}</span>
                          <span className="text-[#B80F2E] group-hover:underline">View Lesson →</span>
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
