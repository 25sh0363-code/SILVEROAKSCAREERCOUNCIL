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
    <div className="flex flex-col min-h-screen text-left bg-[#fafaf9]">
      
      {/* Page Banner Header */}
      <section className="bg-[#1c1917] text-stone-100 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Syllabuses & Modules</span>
          <h1 className="text-2xl sm:text-4xl font-serif font-normal tracking-tight mt-1 text-stone-100">
            Aptitude & College Preparation Modules
          </h1>
          <p className="text-stone-400 text-sm sm:text-base mt-2 max-w-2xl font-light">
            Acquire specialized credentials, build university application narratives, and practice critical thinking loops designed specifically for school-leavers.
          </p>
        </div>
      </section>

      {/* Main Core listing shell */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar Filter Section */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg border border-stone-200 p-5 space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="font-semibold text-stone-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-stone-600" />
                  <span>Filter Syllabus</span>
                </span>
                {(selectedGrade || selectedCategory || search) && (
                  <button 
                    onClick={resetFilters}
                    className="text-xs text-[#8B1D2C] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Instant search input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Keyword, instructor..."
                    className="w-full pl-8 pr-3 py-2 border border-stone-200 rounded text-xs text-stone-800 focus:outline-none focus:border-stone-500 bg-white"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Class levels */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">School Tier</label>
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => setSelectedGrade('')}
                    className={`text-left px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      selectedGrade === ''
                        ? 'font-semibold text-stone-900 bg-stone-100'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    All Classes
                  </button>
                  {grades.map(g => (
                    <button
                      key={g}
                      onClick={() => setSelectedGrade(g)}
                      className={`text-left px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                        selectedGrade === g
                          ? 'font-semibold text-stone-900 bg-stone-100'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2.5 py-2 border border-stone-200 rounded text-xs font-normal text-stone-800 focus:outline-none focus:border-stone-500 bg-white"
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
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white px-5 py-3 border border-stone-200 rounded-lg">
              <div className="text-xs text-stone-600">
                {filtered.length ? (
                  <span>Showing <strong className="text-stone-900 font-semibold">{filtered.length}</strong> modules</span>
                ) : (
                  <span>No courses found matching criteria</span>
                )}
              </div>
              
              {/* Layout Selection */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setLayout('compact-list')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    layout === 'compact-list'
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
                
                <button
                  onClick={() => setLayout('bento-grid')}
                  className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    layout === 'bento-grid'
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                  title="Bento Grid"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Bento</span>
                </button>
                
                <button
                  onClick={() => setLayout('classic-card')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    layout === 'classic-card'
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
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
                <p className="text-stone-400 font-medium uppercase tracking-wider text-xs mt-4">Streaming module list...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-lg border border-dashed border-stone-200 p-12 text-center">
                <h3 className="font-serif text-lg text-stone-900">No modules available</h3>
                <p className="text-stone-500 text-xs mt-1 max-w-sm mx-auto">
                  Try clearing your active filters or query terms to view other counselor recommendations.
                </p>
                <button 
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-stone-900 text-white rounded text-xs font-medium hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              
              /* Layout dispatcher rendering logic */
              <div className={
                layout === 'compact-list' 
                  ? 'flex flex-col gap-3' 
                  : layout === 'bento-grid'
                    ? 'grid grid-cols-1 md:grid-cols-6 gap-6'
                    : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
              }>
                {filtered.map((c, index) => {
                  
                  const bentoClass = index % 3 === 0 
                    ? 'md:col-span-4' 
                    : 'md:col-span-2';

                  {/* PRESET 1: COMPACT LIST ROWS */}
                  if (layout === 'compact-list') {
                    return (
                      <div 
                        key={c.ID}
                        onClick={() => navigateToCourse(c.ID)}
                        className="bg-white border border-stone-200 hover:border-stone-400 p-4 sm:p-5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-colors group"
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-2 text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1">
                            <span>{c.Category}</span>
                            {c.Grade && <span>· {c.Grade}</span>}
                          </div>
                          <h3 className="font-serif font-medium text-stone-900 text-base group-hover:text-[#8B1D2C] transition-colors">
                            {c.Title}
                          </h3>
                          <p className="text-stone-500 text-xs line-clamp-1 mt-0.5 max-w-xl">{c.Description}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-stone-100 pt-2.5 sm:pt-0 shrink-0 text-xs text-stone-500">
                          <span>Instructor: {c.Instructor}</span>
                          <span className="text-stone-900 group-hover:text-[#8B1D2C] font-medium flex items-center gap-1">
                            Open <ArrowRight className="w-3.5 h-3.5" />
                          </span>
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
                        className={`bg-white border border-stone-200 hover:border-stone-400 rounded-lg overflow-hidden cursor-pointer group transition-colors flex flex-col ${bentoClass}`}
                      >
                        <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden shrink-0">
                          <img 
                            src={c.ThumbnailURL || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80"} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-5 flex flex-col justify-between flex-1">
                          <div>
                            <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1">
                              {c.Category} {c.Grade ? `· ${c.Grade}` : ''}
                            </div>
                            <h3 className="font-serif font-medium text-base text-stone-900 group-hover:text-[#8B1D2C] transition-colors line-clamp-2 mb-1.5">
                              {c.Title}
                            </h3>
                            <p className="text-stone-500 text-xs line-clamp-3 leading-relaxed">
                              {c.Description}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between border-t border-stone-100 pt-3 mt-4 text-xs text-stone-500">
                            <span>Instructor: {c.Instructor}</span>
                            <span className="text-stone-900 group-hover:text-[#8B1D2C] font-medium flex items-center gap-1">
                              Open <ArrowRight className="w-3.5 h-3.5" />
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
                      className="bg-white border border-stone-200 hover:border-stone-400 rounded-lg overflow-hidden cursor-pointer group transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden shrink-0">
                          <img 
                            src={c.ThumbnailURL || "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80"} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                          />
                        </div>
                        
                        <div className="p-5">
                          <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1">
                            {c.Category} {c.Grade ? `· ${c.Grade}` : ''}
                          </div>
                          <h3 className="font-serif font-medium text-base text-stone-900 group-hover:text-[#8B1D2C] transition-colors line-clamp-2 mb-1.5">
                            {c.Title}
                          </h3>
                          <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed">
                            {c.Description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-5 pt-0">
                        <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-500">
                          <span>{c.Instructor}</span>
                          <span className="text-stone-900 group-hover:text-[#8B1D2C] font-medium flex items-center gap-1">
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
