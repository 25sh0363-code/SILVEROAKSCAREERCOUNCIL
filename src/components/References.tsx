/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, GraduationCap, Video, FileText, UserCheck, Filter, Grid, List, ArrowRight } from 'lucide-react';
import { ReferenceMaterial, CardLayoutPreset } from '../types';
import { fetchAllReferences } from '../lib/supabase';
import { FileDown } from './Courses';

interface ReferencesProps {
  setSelectedId: (id: string) => void;
  setCurrentPage: (page: string) => void;
}

export default function References({ setSelectedId, setCurrentPage }: ReferencesProps) {
  const [layout, setLayout] = useState<CardLayoutPreset>('compact-list');
  const [refs, setRefs] = useState<ReferenceMaterial[]>([]);
  const [filtered, setFiltered] = useState<ReferenceMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchAllReferences(true);
        setRefs(data);
        
        // Extract unique categories
        const cats = Array.from(new Set(data.map(r => r.Category).filter(Boolean)));
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load reference material:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter computing
  useEffect(() => {
    let result = [...refs];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.Title.toLowerCase().includes(q) ||
        r.Description.toLowerCase().includes(q) ||
        r.Author.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter(r => r.Category === selectedCategory);
    }

    setFiltered(result);
  }, [refs, search, selectedCategory]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
  };

  const navigateToRef = (id: string) => {
    setSelectedId(id);
    setCurrentPage('reference-item');
  };

  return (
    <div className="flex flex-col min-h-screen text-left">
      
      {/* Banner */}
      <section className="bg-gradient-to-r from-[#8F0A22] via-[#B80F2E] to-[#D61A3C] text-white py-16 px-4 relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1000&q=80')` }} />
        <div className="relative z-10 max-w-7xl mx-auto">
          <span className="text-xs text-rose-300 font-extrabold uppercase tracking-widest">Digital Resource Library</span>
          <h1 className="text-3xl sm:text-4.5xl font-extrabold tracking-tight mt-1 font-serif">Reference Material & CV Templates</h1>
          <p className="text-rose-100 text-sm sm:text-base mt-2 max-w-2xl">
            Trusted publications, standardized LaTeX CV templates, academic tracking formulas, and video portfolios. Ready to download.
          </p>
        </div>
      </section>

      {/* Main listing shell */}
      <section className="py-12 px-4 bg-gray-50 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="font-extrabold text-gray-950 uppercase text-xs tracking-wider flex items-center gap-1.5Packed">
                  <Filter className="w-3.5 h-3.5 text-[#B80F2E]" />
                  <span>Topic Filters</span>
                </span>
                {(selectedCategory || search) && (
                  <button 
                    onClick={resetFilters}
                    className="text-[10px] text-[#B80F2E] font-bold uppercase tracking-wider hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Keyword Search */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Resource Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search references..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#B80F2E] focus:border-transparent bg-gray-50/50"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Category filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Categories</label>
                <div className="flex flex-col gap-1 pr-1">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedCategory === ''
                        ? 'bg-rose-50 text-[#B80F2E] border-l-2 border-[#B80F2E]'
                        : 'text-gray-600 hover:bg-rose-50/30'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedCategory === cat
                          ? 'bg-rose-50 text-[#B80F2E] border-l-2 border-[#B80F2E]'
                          : 'text-gray-600 hover:bg-rose-50/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Right listing screen */}
          <main className="lg:col-span-3 space-y-6">
            
            {/* View presets switcher */}
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white px-5 py-4 border border-rose-100 rounded-2xl shadow-sm">
              <div className="text-xs sm:text-sm font-bold text-gray-500">
                {filtered.length ? (
                  <span>Showing <strong className="text-gray-900">{filtered.length}</strong> official documents</span>
                ) : (
                  <span>No reference material found</span>
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
                <p className="text-gray-500 font-semibold uppercase tracking-wider text-xs mt-4">Streaming library catalogs...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-lg font-bold text-gray-900 font-serif">No References Available</h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
                  Try clearing your filters or query terms to view other counselor checklists or resources.
                </p>
                <button 
                  onClick={resetFilters}
                  className="mt-6 px-6 py-2.5 bg-[#B80F2E] text-white rounded-lg font-bold text-xs uppercase tracking-wider"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              
              /* Layout list router */
              <div className={
                layout === 'compact-list' 
                  ? 'flex flex-col gap-4' 
                  : layout === 'bento-grid'
                    ? 'grid grid-cols-1 md:grid-cols-6 gap-6'
                    : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
              }>
                {filtered.map((r, index) => {
                  const bentoSpan = index % 3 === 0 ? 'md:col-span-4' : 'md:col-span-2';

                  {/* PRESET 1: COMPACT LIST ROWS */}
                  if (layout === 'compact-list') {
                    return (
                      <div
                        key={r.ID}
                        onClick={() => navigateToRef(r.ID)}
                        className="bg-white border border-[#dde4ee] hover:border-[#B80F2E] p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-350 group relative overflow-hidden"
                      >
                        {/* Elegant accent sidebar visible on item hover */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#B80F2E] scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                        
                        <div className="flex items-center gap-4 text-left flex-1 min-w-0">
                          {/* Sizable Thumbnail Preview with interactive scale-on-hover effect */}
                          <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden bg-rose-50 border border-rose-100/70 shrink-0 flex items-center justify-center relative shadow-inner">
                            {r.ThumbnailURL ? (
                              <img 
                                src={r.ThumbnailURL} 
                                alt="" 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-xl">📎</span>
                            )}
                            
                            {/* Overlay tag format stickers */}
                            <div className="absolute bottom-1 right-1 flex gap-0.5">
                              {r.PDFLink && (
                                <span className="bg-emerald-600 text-white text-[8px] font-black px-1 py-0.5 rounded shadow">
                                  PDF
                                </span>
                              )}
                              {r.YouTubeURL && (
                                <span className="bg-red-600 text-white text-[8px] font-black px-1 py-0.5 rounded shadow">
                                  YT
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Metadata Badging Row */}
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-[9px] font-extrabold uppercase text-[#B80F2E] tracking-widest bg-rose-50/70 border border-rose-100/50 px-2 py-0.5 rounded-md">
                                {r.Category}
                              </span>
                              {r.PDFLink && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded-md">
                                  <FileText className="w-2.5 h-2.5 text-rose-800" /> PDF Checklists
                                </span>
                              )}
                              {r.YouTubeURL && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded-md">
                                  <Video className="w-2.5 h-2.5 text-rose-800" /> Watch Video
                                </span>
                              )}
                            </div>
                            
                            <h3 className="font-extrabold text-gray-900 text-sm sm:text-base group-hover:text-[#B80F2E] transition-all font-serif truncate">
                              {r.Title}
                            </h3>
                            <p className="text-gray-500 text-xs sm:text-sm line-clamp-1 mt-0.5 pr-4 leading-relaxed">
                              {r.Description}
                            </p>
                          </div>
                        </div>

                        {/* Visual statistics or authors panel */}
                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-[#f1f5f9] pt-3 md:pt-0 shrink-0">
                          <div className="text-left md:text-right">
                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Counselor Author</div>
                            <span className="text-xs font-black text-gray-700 mt-0.5 block">
                              {r.Author}
                            </span>
                          </div>
                          
                          <button className="h-9 w-9 rounded-full bg-rose-50 text-[#B80F2E] group-hover:bg-[#B80F2E] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm shrink-0">
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  {/* PRESET 2: MODERN BENTO GRID */}
                  if (layout === 'bento-grid') {
                    return (
                      <div
                        key={r.ID}
                        onClick={() => navigateToRef(r.ID)}
                        className={`bg-white border border-[#dde4ee] hover:border-[#B80F2E] hover:shadow-lg rounded-xl overflow-hidden cursor-pointer group transition-all flex flex-col h-full ${bentoSpan}`}
                      >
                        <div className="relative aspect-video bg-rose-50 overflow-hidden shrink-0">
                          <img 
                            src={r.ThumbnailURL || "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80"} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 bg-[#B80F2E] text-white font-extrabold text-[9px] uppercase px-2 py-0.5 rounded tracking-wide shadow">{r.Category}</span>
                        </div>
                        <div className="p-5 flex flex-col justify-between flex-1">
                          <div>
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{r.Author}</span>
                            <h3 className="font-extrabold text-base text-gray-900 group-hover:text-[#B80F2E] transition-all line-clamp-2 mt-1 mb-2 font-serif">
                              {r.Title}
                            </h3>
                            <p className="text-gray-500 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                              {r.Description}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between border-t border-rose-50 pt-4 mt-4 text-xs font-bold text-gray-500">
                            <span>✍️ {r.Author}</span>
                            <span className="text-[#B80F2E] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              <span>View Brief</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  {/* PRESET 3: CLASSIC CARD */}
                  return (
                    <div
                      key={r.ID}
                      onClick={() => navigateToRef(r.ID)}
                      className="bg-white border border-[#dde4ee] hover:border-[#B80F2E] hover:shadow-lg rounded-xl overflow-hidden cursor-pointer group transition-all flex flex-col h-[400px]"
                    >
                      <div className="relative aspect-video bg-rose-50 overflow-hidden shrink-0">
                        <img 
                          src={r.ThumbnailURL || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80"} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 bg-rose-900 text-white font-extrabold text-[9px] uppercase px-2.5 py-1 rounded shadow tracking-wider">{r.Category}</span>
                        {r.YouTubeURL && (
                          <div className="absolute top-3 right-3 bg-red-600 text-white p-1 rounded-full shadow">
                            <Video className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {r.PDFLink && (
                          <div className="absolute top-3 right-8 bg-emerald-700 text-white p-1 rounded-full shadow">
                            <FileDown className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-5 flex flex-col justify-between flex-1">
                        <div>
                          <span className="text-[10px] font-black uppercase text-[#B80F2E] tracking-wider">Authored by {r.Author}</span>
                          <h3 className="font-extrabold text-base text-gray-900 group-hover:text-[#B80F2E] transition-all line-clamp-2 mt-2 mb-2 font-serif">
                            {r.Title}
                          </h3>
                          <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                            {r.Description}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-rose-50 pt-4 mt-2 text-xs font-bold text-gray-500">
                          <span>👤 Source: Counselor Panel</span>
                          <span className="text-[#B80F2E] group-hover:underline font-bold">Open File →</span>
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
