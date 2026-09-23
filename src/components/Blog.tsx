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
    <div className="flex flex-col min-h-screen text-left bg-[#fafaf9]">
      
      {/* Banner */}
      <section className="bg-[#1c1917] text-stone-100 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Counselor Dispatch</span>
          <h1 className="text-2xl sm:text-4xl font-serif font-normal tracking-tight mt-1 text-stone-100">
            Advisory Notes & Editorial Publications
          </h1>
          <p className="text-stone-400 text-sm sm:text-base mt-2 max-w-2xl font-light">
            Read professional stream selection analyses, competitive examination guidelines, university application strategies, and regular dispatches from the counselor faculty.
          </p>
        </div>
      </section>

      {/* Main Column Listing */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Tag Filter Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg border border-stone-200 p-5 space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="font-semibold text-stone-900 uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-stone-600" />
                  <span>Topic Archive</span>
                </span>
                {(selectedTag || search) && (
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
                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search titles or keywords..."
                    className="w-full pl-8 pr-3 py-2 border border-stone-200 rounded text-xs text-stone-800 focus:outline-none focus:border-stone-500 bg-white"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Unique Tags loop */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Topics</label>
                <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedTag('')}
                    className={`text-left px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      selectedTag === ''
                        ? 'font-semibold text-stone-900 bg-stone-100'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    All Publications
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`text-left px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                        selectedTag === tag
                          ? 'font-semibold text-stone-900 bg-stone-100'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
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
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white px-5 py-3 border border-stone-200 rounded-lg">
              <div className="text-xs text-stone-600">
                {filtered.length ? (
                  <span>Showing <strong className="text-stone-900 font-semibold">{filtered.length}</strong> articles</span>
                ) : (
                  <span>No articles found under selected topic</span>
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
                <p className="text-stone-400 font-medium uppercase tracking-wider text-xs mt-4">Streaming publication logs...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-lg border border-dashed border-stone-200 p-12 text-center">
                <h3 className="font-serif text-lg text-stone-900">No publications found</h3>
                <p className="text-stone-500 text-xs mt-1 max-w-sm mx-auto">
                  No article matches your keyword or tag selection. Try clearing active filters.
                </p>
                <button 
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-stone-900 text-white rounded text-xs font-medium hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  View All Publications
                </button>
              </div>
            ) : (
              
              /* Layout mapping dispatcher */
              <div className={
                layout === 'compact-list' 
                  ? 'flex flex-col gap-3' 
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
                        className="bg-white border border-stone-200 hover:border-stone-400 p-4 sm:p-5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-colors group"
                      >
                        <div className="text-left">
                          <div className="flex items-center flex-wrap gap-1.5 text-[11px] font-medium text-stone-500 mb-1">
                            <span>{new Date(p.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            {(p.Tags || '').split(',').filter(Boolean).slice(0, 2).map((tag, i) => (
                              <span key={i} className="text-stone-400">· #{tag.trim()}</span>
                            ))}
                          </div>
                          <h3 className="font-serif font-medium text-stone-900 text-base group-hover:text-[#8B1D2C] transition-colors">
                            {p.Title}
                          </h3>
                          <p className="text-stone-500 text-xs line-clamp-1 mt-0.5 max-w-xl">{excerpt}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-stone-100 pt-2.5 sm:pt-0 shrink-0 text-xs text-stone-500">
                          <span>Staff Article</span>
                          <span className="text-stone-900 group-hover:text-[#8B1D2C] font-medium flex items-center gap-1">
                            Read <ArrowRight className="w-3.5 h-3.5" />
                          </span>
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
                        className={`bg-white border border-stone-200 hover:border-stone-400 rounded-lg overflow-hidden cursor-pointer group transition-colors flex flex-col ${bentoSpan}`}
                      >
                        <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden shrink-0">
                          <img 
                            src={p.FeaturedImageURL || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                          />
                          {p.PDFLink && (
                            <span className="absolute top-2.5 right-2.5 text-[10px] font-medium bg-stone-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded">
                              PDF
                            </span>
                          )}
                        </div>
                        <div className="p-5 flex flex-col justify-between flex-1">
                          <div>
                            <div className="flex items-center gap-2 text-[11px] font-medium text-stone-500 mb-1.5">
                              <span>{new Date(p.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              {(p.Tags || '').split(',').filter(Boolean).slice(0, 2).map((tag, i) => (
                                <span key={i} className="text-stone-400">· #{tag.trim()}</span>
                              ))}
                            </div>
                            <h3 className="font-serif font-medium text-base text-stone-900 group-hover:text-[#8B1D2C] transition-colors line-clamp-2 mb-1.5">
                              {p.Title}
                            </h3>
                            <p className="text-stone-500 text-xs line-clamp-3 leading-relaxed">
                              {excerpt}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between border-t border-stone-100 pt-3 mt-4 text-xs text-stone-500">
                            <span>Counselor Panel</span>
                            <span className="text-stone-900 group-hover:text-[#8B1D2C] font-medium flex items-center gap-1">
                              Read entry <ArrowRight className="w-3.5 h-3.5" />
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
                      className="bg-white border border-stone-200 hover:border-stone-400 rounded-lg overflow-hidden cursor-pointer group transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden shrink-0">
                          <img 
                            src={p.FeaturedImageURL || "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80"} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                          />
                          {p.PDFLink && (
                            <span className="absolute top-2.5 right-2.5 text-[10px] font-medium bg-stone-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded">
                              PDF
                            </span>
                          )}
                        </div>
                        
                        <div className="p-5">
                          <div className="flex items-center gap-2 text-[11px] font-medium text-stone-500 mb-1.5">
                            <span>{new Date(p.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            {(p.Tags || '').split(',').filter(Boolean).slice(0, 1).map((tag, i) => (
                              <span key={i} className="text-stone-400">· #{tag.trim()}</span>
                            ))}
                          </div>
                          <h3 className="font-serif font-medium text-base text-stone-900 group-hover:text-[#8B1D2C] transition-colors line-clamp-2 mb-1.5">
                            {p.Title}
                          </h3>
                          <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed">
                            {excerpt}
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-5 pt-0">
                        <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-500">
                          <span>Guidance Note</span>
                          <span className="text-stone-900 group-hover:text-[#8B1D2C] font-medium flex items-center gap-1">
                            Read <ArrowRight className="w-3.5 h-3.5" />
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
