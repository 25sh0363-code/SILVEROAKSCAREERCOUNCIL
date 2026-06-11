/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, GraduationCap, Video, FileText, Calendar, Filter, Grid, List, ArrowRight } from 'lucide-react';
import { BlogPost, CardLayoutPreset } from '../types';
import { fetchAllBlogs } from '../lib/supabase';
import { FileDown } from './Courses';

interface BlogProps {
  setSelectedId: (id: string) => void;
  setCurrentPage: (page: string) => void;
}

export default function Blog({ setSelectedId, setCurrentPage }: BlogProps) {
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
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchAllBlogs(true);
        setBlogs(data);

        // Compile unique list of tags
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
    }
    load();
  }, []);

  // Compute filtered posts
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

    setFiltered(result);
  }, [blogs, search, selectedTag]);

  const resetFilters = () => {
    setSearch('');
    setSelectedTag('');
  };

  const navigateToPost = (id: string) => {
    setSelectedId(id);
    setCurrentPage('blog-item');
  };

  return (
    <div className="flex flex-col min-h-screen text-left">
      
      {/* Banner */}
      <section className="bg-gradient-to-r from-[#8F0A22] via-[#B80F2E] to-[#D61A3C] text-white py-16 px-4 relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1000&q=80')` }} />
        <div className="relative z-10 max-w-7xl mx-auto">
          <span className="text-xs text-rose-300 font-extrabold uppercase tracking-widest">Guidance Publications</span>
          <h1 className="text-3xl sm:text-4.5xl font-extrabold tracking-tight mt-1 font-serif">Counselor Insights & Editorial Blog</h1>
          <p className="text-rose-100 text-sm sm:text-base mt-2 max-w-2xl">
            Read professional stream guides, selective Indian admission guidelines, student testimonials, and regular news updates from the Counselor panel.
          </p>
        </div>
      </section>

      {/* Main Column Listing */}
      <section className="py-12 px-4 bg-gray-50 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Tag Filter Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="font-extrabold text-gray-950 uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#B80F2E]" />
                  <span>Topic Tags</span>
                </span>
                {(selectedTag || search) && (
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
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Article Keyword</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search posts..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#B80F2E] focus:border-transparent bg-gray-50/50"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Unique Tags loop */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Guidance Focus</label>
                <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedTag('')}
                    className={`text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedTag === ''
                        ? 'bg-rose-50 text-[#B80F2E] border-l-2 border-[#B80F2E]'
                        : 'text-gray-600 hover:bg-rose-50/30'
                    }`}
                  >
                    All Publications
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-tight ${
                        selectedTag === tag
                          ? 'bg-rose-50 text-[#B80F2E] border-l-2 border-[#B80F2E]'
                          : 'text-gray-600 hover:bg-rose-50/30'
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
          <main className="lg:col-span-3 space-y-6">
            
            {/* View presets switcher */}
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white px-5 py-4 border border-rose-100 rounded-2xl shadow-sm">
              <div className="text-xs sm:text-sm font-bold text-gray-500">
                {filtered.length ? (
                  <span>Showing <strong className="text-gray-900">{filtered.length}</strong> written posts</span>
                ) : (
                  <span>No posts found under selected topic</span>
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
                <p className="text-gray-500 font-semibold uppercase tracking-wider text-xs mt-4">Streaming publication logs...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-lg font-bold text-gray-900 font-serif">No Publications Logged</h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
                  No post matches your keyword selection. Try resetting active category options.
                </p>
                <button 
                  onClick={resetFilters}
                  className="mt-6 px-6 py-2.5 bg-[#B80F2E] text-white rounded-lg font-bold text-xs uppercase tracking-wider"
                >
                  View All Blogs
                </button>
              </div>
            ) : (
              
              /* Layout mapping dispatcher */
              <div className={
                layout === 'compact-list' 
                  ? 'flex flex-col gap-4' 
                  : layout === 'bento-grid'
                    ? 'grid grid-cols-1 md:grid-cols-6 gap-6'
                    : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
              }>
                {filtered.map((p, index) => {
                  const rawContent = p.Content ? p.Content.replace(/<[^>]*>/g, '') : '';
                  const excerpt = rawContent.slice(0, 115) + (rawContent.length > 115 ? '...' : '');
                  const bentoSpan = index % 3 === 0 ? 'md:col-span-4' : 'md:col-span-2';

                  {/* PRESET 1: COMPACT ROWS */}
                  if (layout === 'compact-list') {
                    return (
                      <div
                        key={p.ID}
                        onClick={() => navigateToPost(p.ID)}
                        className="bg-white border border-rose-100 hover:border-[#B80F2E] p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md cursor-pointer transition-all group"
                      >
                        <div className="flex items-start gap-4 text-left">
                          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 text-[#B80F2E] flex items-center justify-center font-bold text-sm shrink-0 sm:flex hidden">
                            ✍️
                          </div>
                          <div>
                            <div className="flex items-center flex-wrap gap-1.5">
                              {(p.Tags || '').split(',').filter(Boolean).slice(0, 3).map((tag, i) => (
                                <span key={i} className="text-[9px] font-black uppercase text-[#B80F2E] tracking-wider bg-rose-50 px-2 py-0.5 rounded">
                                  #{tag.trim()}
                                </span>
                              ))}
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-[#B80F2E] transition-all font-serif mt-1">
                              {p.Title}
                            </h3>
                            <p className="text-gray-500 text-xs sm:text-sm line-clamp-1 mt-0.5 max-w-xl">{excerpt}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-rose-50 pt-2.5 sm:pt-0 shrink-0">
                          <span className="text-xs font-semibold text-gray-500">📅 {new Date(p.CreatedDate).toLocaleDateString()}</span>
                          <button className="p-2 rounded-full bg-rose-50 text-[#B80F2E] group-hover:bg-[#B80F2E] group-hover:text-white transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  {/* PRESET 2: BENTO MATRIX */}
                  if (layout === 'bento-grid') {
                    return (
                      <div
                        key={p.ID}
                        onClick={() => navigateToPost(p.ID)}
                        className={`bg-white border border-[#dde4ee] hover:border-[#B80F2E] hover:shadow-lg rounded-xl overflow-hidden cursor-pointer group transition-all flex flex-col h-full ${bentoSpan}`}
                      >
                        <div className="relative aspect-video bg-rose-50 overflow-hidden shrink-0">
                          <img 
                            src={p.FeaturedImageURL || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 flex gap-1">
                            {p.PDFLink && <span className="text-[8px] bg-emerald-700 text-white font-extrabold uppercase px-2 py-0.5 rounded shadow flex items-center gap-1"><FileDown className="w-2.5 h-2.5"/> PDF</span>}
                          </div>
                        </div>
                        <div className="p-5 flex flex-col justify-between flex-1">
                          <div>
                            <div className="flex gap-1 flex-wrap mb-1.5">
                              {(p.Tags || '').split(',').filter(Boolean).slice(0, 3).map((tag, i) => (
                                <span key={i} className="text-[9px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded tracking-wide">
                                  #{tag.trim()}
                                </span>
                              ))}
                            </div>
                            <h3 className="font-extrabold text-base text-gray-900 group-hover:text-[#B80F2E] transition-all line-clamp-2 mb-2 font-serif">
                              {p.Title}
                            </h3>
                            <p className="text-gray-500 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                              {excerpt}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between border-t border-rose-50 pt-4 mt-4 text-xs font-bold text-gray-500">
                            <span>📅 {new Date(p.CreatedDate).toLocaleDateString()}</span>
                            <span className="text-[#B80F2E] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              <span>Read Entry</span>
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
                      key={p.ID}
                      onClick={() => navigateToPost(p.ID)}
                      className="bg-white border border-[#dde4ee] hover:border-[#B80F2E] hover:shadow-lg rounded-xl overflow-hidden cursor-pointer group transition-all flex flex-col h-[400px]"
                    >
                      <div className="relative aspect-video bg-rose-50 overflow-hidden shrink-0">
                        <img 
                          src={p.FeaturedImageURL || "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80"} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 flex gap-1">
                          {p.PDFLink && <span className="text-[8px] bg-emerald-700 text-white font-extrabold uppercase px-2.5 py-1 rounded shadow flex items-center gap-1"><FileDown className="w-2.5 h-2.5"/> PDF</span>}
                        </div>
                      </div>
                      
                      <div className="p-5 flex flex-col justify-between flex-1">
                        <div>
                          <div className="flex gap-1 flex-wrap mb-1.5">
                            {(p.Tags || '').split(',').filter(Boolean).slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-[9px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded tracking-wide">
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                          <h3 className="font-extrabold text-base text-gray-900 group-hover:text-[#B80F2E] transition-all line-clamp-2 mb-2 font-serif">
                            {p.Title}
                          </h3>
                          <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                            {excerpt}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-rose-50 pt-4 mt-2 text-xs font-bold text-gray-500">
                          <span>📅 {new Date(p.CreatedDate).toLocaleDateString()}</span>
                          <span className="text-[#B80F2E] group-hover:underline">Read Publications →</span>
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
