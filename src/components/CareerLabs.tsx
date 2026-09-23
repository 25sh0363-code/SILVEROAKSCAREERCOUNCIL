/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, GraduationCap, Video, FileText, UserCheck, Filter, Grid, List, ArrowRight } from 'lucide-react';
import { CareerLab, CardLayoutPreset } from '../types';
import { fetchAllCareerLabs } from '../lib/supabase';
import { FileDown } from './Courses';

interface CareerLabsProps {
  setSelectedId: (id: string) => void;
  setCurrentPage: (page: string) => void;
}

export default function CareerLabs({ setSelectedId, setCurrentPage }: CareerLabsProps) {
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
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchAllCareerLabs(true);
        setLabs(data);
        
        // Extract unique categories
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

  // Filter computing
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

    setFiltered(result);
  }, [labs, search, selectedCategory]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
  };

  const navigateToLab = (id: string) => {
    setSelectedId(id);
    setCurrentPage('lab-item');
  };

  return (
    <div className="flex flex-col min-h-screen text-left bg-[#fafaf9]">
      
      {/* Banner */}
      <section className="bg-[#1c1917] text-stone-100 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Student Research & Portfolios</span>
          <h1 className="text-2xl sm:text-4xl font-serif font-normal tracking-tight mt-1 text-stone-100">
            Career Laboratory Archive
          </h1>
          <p className="text-stone-400 text-sm sm:text-base mt-2 max-w-2xl font-light">
            Discover original student research papers, experimental prototypes, field study journals, and analytical solutions mentored by campus faculty.
          </p>
        </div>
      </section>

      {/* Main catalog */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg border border-stone-200 p-5 space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="font-semibold text-stone-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-stone-600" />
                  <span>Disciplines</span>
                </span>
                {(selectedCategory || search) && (
                  <button 
                    onClick={resetFilters}
                    className="text-xs text-[#8B1D2C] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Keyword Search */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Project or Author</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search projects or students..."
                    className="w-full pl-8 pr-3 py-2 border border-stone-200 rounded text-xs text-stone-800 focus:outline-none focus:border-stone-500 bg-white"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Category filter list */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Field</label>
                <div className="flex flex-col gap-0.5 pr-1">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`text-left px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      selectedCategory === ''
                        ? 'font-semibold text-stone-900 bg-stone-100'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    All Research
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-left px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'font-semibold text-stone-900 bg-stone-100'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
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
          <main className="lg:col-span-3 space-y-6">
            
            {/* View presets switcher */}
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white px-5 py-3 border border-stone-200 rounded-lg">
              <div className="text-xs text-stone-600">
                {filtered.length ? (
                  <span>Showing <strong className="text-stone-900 font-semibold">{filtered.length}</strong> student portfolios</span>
                ) : (
                  <span>No portfolios match this discipline category</span>
                )}
              </div>
              
              {/* Design Selection Button Group */}
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
                  <span>Grid</span>
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
                <p className="text-stone-400 font-medium uppercase tracking-wider text-xs mt-4">Streaming laboratory archives...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-lg border border-dashed border-stone-200 p-12 text-center">
                <h3 className="font-serif text-lg text-stone-900">No laboratory portfolios found</h3>
                <p className="text-stone-500 text-xs mt-1 max-w-sm mx-auto">
                  Try clearing your filters or query terms to view other student project papers.
                </p>
                <button 
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-stone-900 text-white rounded text-xs font-medium hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Reset Active Filters
                </button>
              </div>
            ) : (
              
              /* Layout display list template */
              <div className={
                layout === 'compact-list' 
                  ? 'flex flex-col gap-3' 
                  : layout === 'bento-grid'
                    ? 'grid grid-cols-1 md:grid-cols-6 gap-6'
                    : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
              }>
                {filtered.map((l, index) => {
                  const bentoSpan = index % 3 === 0 ? 'md:col-span-4' : 'md:col-span-2';

                  {/* PRESET 1: COMPACT LIST ROWS */}
                  if (layout === 'compact-list') {
                    return (
                      <div
                        key={l.ID}
                        onClick={() => navigateToLab(l.ID)}
                        className="bg-white border border-stone-200 hover:border-stone-400 p-4 sm:p-5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-colors group"
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-2 text-[11px] font-medium text-stone-500 mb-1">
                            <span>{l.Category}</span>
                            <span>· Student: {l.Student}</span>
                          </div>
                          <h3 className="font-serif font-medium text-stone-900 text-base group-hover:text-[#8B1D2C] transition-colors">
                            {l.Title}
                          </h3>
                          <p className="text-stone-500 text-xs line-clamp-1 mt-0.5 max-w-xl">{l.Description}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-stone-100 pt-2.5 sm:pt-0 shrink-0 text-xs text-stone-500">
                          <span>Mentor: {l.Mentor}</span>
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
                        key={l.ID}
                        onClick={() => navigateToLab(l.ID)}
                        className={`bg-white border border-stone-200 hover:border-stone-400 rounded-lg overflow-hidden cursor-pointer group transition-colors flex flex-col ${bentoSpan}`}
                      >
                        <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden shrink-0">
                          <img 
                            src={l.ThumbnailURL || "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=800&q=80"} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-5 flex flex-col justify-between flex-1">
                          <div>
                            <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1">
                              {l.Category} · {l.Student}
                            </div>
                            <h3 className="font-serif font-medium text-base text-stone-900 group-hover:text-[#8B1D2C] transition-colors line-clamp-2 mb-1.5">
                              {l.Title}
                            </h3>
                            <p className="text-stone-500 text-xs line-clamp-3 leading-relaxed">
                              {l.Description}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between border-t border-stone-100 pt-3 mt-4 text-xs text-stone-500">
                            <span>Mentor: {l.Mentor}</span>
                            <span className="text-stone-900 group-hover:text-[#8B1D2C] font-medium flex items-center gap-1">
                              Open project <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  {/* PRESET 3: CLASSIC CARD */}
                  return (
                    <div
                      key={l.ID}
                      onClick={() => navigateToLab(l.ID)}
                      className="bg-white border border-stone-200 hover:border-stone-400 rounded-lg overflow-hidden cursor-pointer group transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden shrink-0">
                          <img 
                            src={l.ThumbnailURL || "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=600&q=80"} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                          />
                        </div>
                        
                        <div className="p-5">
                          <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1">
                            {l.Category}
                          </div>
                          <h3 className="font-serif font-medium text-base text-stone-900 group-hover:text-[#8B1D2C] transition-colors line-clamp-2 mb-1.5">
                            {l.Title}
                          </h3>
                          <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed">
                            {l.Description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-5 pt-0">
                        <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-500">
                          <span>Student: {l.Student}</span>
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
