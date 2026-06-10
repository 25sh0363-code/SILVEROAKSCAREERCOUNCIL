/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, BookOpen, Newspaper, FolderGit, CheckSquare, ChevronLeft, ChevronRight, PlayCircle, FileDown, CheckCircle } from 'lucide-react';
import { Course, BlogPost, ReferenceMaterial, CareerLab, CardLayoutPreset } from '../types';
import { fetchAllCourses, fetchAllBlogs, fetchAllReferences, fetchAllCareerLabs, getYoutubeEmbedId } from '../lib/supabase';

interface HomeProps {
  setCurrentPage: (page: string) => void;
  setSelectedId: (id: string) => void;
}

export default function Home({ setCurrentPage, setSelectedId }: HomeProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [refs, setRefs] = useState<ReferenceMaterial[]>([]);
  const [labs, setLabs] = useState<CareerLab[]>([]);
  
  // Search state
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Spotlight Horizontal Scroll Refs
  const courseScrollRef = useRef<HTMLDivElement>(null);
  const blogScrollRef = useRef<HTMLDivElement>(null);
  const refScrollRef = useRef<HTMLDivElement>(null);
  const labScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Gather featured resources safely from Supabase / Mocks
    async function loadFeatured() {
      try {
        const [cList, bList, rList, lList] = await Promise.all([
          fetchAllCourses(true),
          fetchAllBlogs(true),
          fetchAllReferences(true),
          fetchAllCareerLabs(true)
        ]);
        setCourses(cList.slice(0, 5));
        setBlogs(bList.slice(0, 5));
        setRefs(rList.slice(0, 5));
        setLabs(lList.slice(0, 5));
      } catch (err) {
        console.error("Failed to load home featured items:", err);
      }
    }
    loadFeatured();
  }, []);

  // Handle outside clicks for autocomplete dropdown
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Update suggestions in real time
  const handleSearchInput = (val: string) => {
    setQuery(val);
    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const q = val.toLowerCase();
    const matches: any[] = [];

    // Search through all elements
    courses.forEach(c => {
      if (c.Title.toLowerCase().includes(q) || c.Description.toLowerCase().includes(q)) {
        matches.push({ id: c.ID, title: c.Title, type: 'Course', page: 'course' });
      }
    });
    blogs.forEach(p => {
      if (p.Title.toLowerCase().includes(q) || p.Content.toLowerCase().includes(q)) {
        matches.push({ id: p.ID, title: p.Title, type: 'Blog', page: 'blog-item' });
      }
    });
    refs.forEach(r => {
      if (r.Title.toLowerCase().includes(q) || r.Description.toLowerCase().includes(q)) {
        matches.push({ id: r.ID, title: r.Title, type: 'Reference', page: 'reference-item' });
      }
    });
    labs.forEach(l => {
      if (l.Title.toLowerCase().includes(q) || l.Description.toLowerCase().includes(q)) {
        matches.push({ id: l.ID, title: l.Title, type: 'Career Lab', page: 'lab-item' });
      }
    });

    setSuggestions(matches.slice(0, 6));
    setShowSuggestions(matches.length > 0);
  };

  const handleGlobalSearch = () => {
    if (!query.trim()) return;
    setCurrentPage(`search?q=${encodeURIComponent(query.trim())}`);
  };

  const scrollSide = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 340;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleSuggestClick = (item: any) => {
    setShowSuggestions(false);
    setSelectedId(item.id);
    setCurrentPage(item.page);
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Large Brand Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#8F0A22] via-[#B80F2E] to-[#A30922] text-white py-24 sm:py-32 px-4 shadow-xl select-none">
        
        {/* Animated ambient overlay vectors */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(255,255,255,0.15),rgba(255,255,255,0))]" />
        
        {/* Unsplash beautiful header backdrop */}
        <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-25" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1920&q=80')` }} />

        <div className="relative z-10 max-w-5xl mx-auto text-left flex flex-col items-start gap-4">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest leading-none">
            ★ Silver Oaks Academic Portal ★
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-white max-w-4xl font-serif">
            Designed for Direction. <br/>
            <span className="bg-gradient-to-r from-rose-400 via-rose-500 to-red-600 bg-clip-text text-transparent">Built for Student Futures.</span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-lg max-w-2xl leading-relaxed mt-2 font-medium">
            One professional ecosystem designed exclusively for Silver Oaks students. Connect directly with counsel templates, research archives, stream assessments, and verified counselor modules.
          </p>

          {/* Big Autocomplete Search Panel */}
          <div className="w-full max-w-2xl mt-6 relative" ref={dropdownRef}>
            <div className="flex items-center bg-white rounded-xl shadow-lg border border-rose-100 overflow-hidden group focus-within:ring-2 focus-within:ring-[#B80F2E]">
              <div className="pl-4 text-gray-400 group-focus-within:text-[#B80F2E]">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
                placeholder="Search resumes, research labs, SAT files, stream guidance, classes..."
                className="w-full h-14 bg-transparent outline-none border-none text-gray-900 placeholder-gray-500 px-3 text-sm font-semibold"
              />
              <button 
                onClick={handleGlobalSearch}
                className="h-14 bg-gradient-to-r from-[#8F0A22] to-[#B80F2E] text-white font-bold text-xs uppercase tracking-wider px-6 hover:brightness-105 hover:cursor-pointer transition-all shrink-0"
              >
                Search
              </button>
            </div>

            {/* suggestions dropdown */}
            {showSuggestions && (
              <div className="absolute top-[105%] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-2xl z-40 overflow-hidden divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => handleSuggestClick(item)}
                    className="w-full text-left px-4 py-3.5 hover:bg-rose-50/50 flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 text-[#B80F2E] tracking-wider shrink-0">
                        {item.type}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-[#B80F2E]">{item.title}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#B80F2E] transition-all shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 2. Structured Guided Journey Pathways */}
      <section className="bg-rose-50/30 py-16 px-4 border-b border-rose-100/50">
        <div className="max-w-7xl mx-auto text-center">
          
          <div className="mb-12">
            <span className="text-xs text-rose-700 font-black uppercase tracking-widest">Interactive Pathway Guides</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mt-2 font-serif">Three Core Pipelines for Development</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto mt-1">
              Connect directly with designated pages engineered for specific student growth outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            {/* Pathway 1 */}
            <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-rose-100 text-[#B80F2E] rounded-xl flex items-center justify-center mb-5 border border-rose-200">
                  <FolderGit className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#B80F2E] transition-all">Career Discovery</h3>
                <p className="text-gray-500 text-sm leading-relaxed mt-2.5">
                  Analyze interests, career families, and international standards. Download templates and reference briefs crafted by qualified counseling faculties.
                </p>
              </div>
              <button 
                onClick={() => setCurrentPage('references')}
                className="mt-6 w-full py-2.5 rounded-xl border border-rose-200 text-[#B80F2E] hover:bg-rose-100/30 font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all focus:outline-none"
              >
                <span>Discover References</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pathway 2 */}
            <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-rose-100 text-[#B80F2E] rounded-xl flex items-center justify-center mb-5 border border-rose-200">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#B80F2E] transition-all">Skill & Aptitude Loops</h3>
                <p className="text-gray-500 text-sm leading-relaxed mt-2.5">
                  Complete challenges-based modules in stream selection, university personal narratives, logical reasoning patterns, and portfolio structures.
                </p>
              </div>
              <button 
                onClick={() => setCurrentPage('courses')}
                className="mt-6 w-full py-2.5 rounded-xl border border-rose-200 text-[#B80F2E] hover:bg-rose-100/30 font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all focus:outline-none"
              >
                <span>Navigate Courses</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pathway 3 */}
            <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-rose-100 text-[#B80F2E] rounded-xl flex items-center justify-center mb-5 border border-rose-200">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#B80F2E] transition-all">Portfolio Laboratory</h3>
                <p className="text-gray-500 text-sm leading-relaxed mt-2.5">
                  Review original research reports, environmental studies, design outputs, and community solutions posted by peers under mentor support.
                </p>
              </div>
              <button 
                onClick={() => setCurrentPage('career-lab')}
                className="mt-6 w-full py-2.5 rounded-xl border border-rose-200 text-[#B80F2E] hover:bg-rose-100/30 font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all focus:outline-none"
              >
                <span>Access Career Lab</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Featured Spotlight Rails */}
      
      {/* COURSES SPOTLIGHT */}
      <section className="py-16 px-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="text-left">
              <span className="text-xs text-rose-700 font-extrabold uppercase tracking-wider">Academics</span>
              <h2 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight text-gray-900 mt-1 font-serif">Curated Focus Courses</h2>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentPage('courses')} 
                className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#B80F2E] hover:underline mr-2"
              >
                all courses →
              </button>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => scrollSide(courseScrollRef, 'left')}
                  className="w-10 h-10 border border-gray-200 hover:border-rose-200 hover:bg-rose-50 text-gray-600 rounded-full flex items-center justify-center cursor-pointer shadow-sm transition-all"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => scrollSide(courseScrollRef, 'right')}
                  className="w-10 h-10 border border-gray-200 hover:border-rose-200 hover:bg-rose-50 text-gray-600 rounded-full flex items-center justify-center cursor-pointer shadow-sm transition-all"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div 
            ref={courseScrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-none pb-4 scroll-smooth snap-x snap-mandatory text-left"
          >
            {courses.length ? (
              courses.map((c) => (
                <div 
                  key={c.ID} 
                  onClick={() => { setSelectedId(c.ID); setCurrentPage('course'); }}
                  className="snap-start flex-shrink-0 w-80 sm:w-96 bg-white border border-rose-100 hover:border-[#B80F2E] hover:shadow-lg rounded-2xl overflow-hidden cursor-pointer group transition-all"
                >
                  <div className="relative aspect-video bg-rose-50 text-rose-900 flex items-center justify-center overflow-hidden">
                    <img 
                      src={c.ThumbnailURL || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80"} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-rose-900 text-white font-black text-[9px] uppercase px-2.5 py-1 rounded-md tracking-wider">
                      {c.Category}
                    </div>
                    {c.YouTubeURL && (
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center text-white scale-95 group-hover:scale-100 opacity-80 group-hover:opacity-100 transition-all">
                        <PlayCircle className="w-12 h-12 text-[#B80F2E] fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col justify-between h-48">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#B80F2E] tracking-wider">{c.Grade || 'Class Level'}</span>
                      <h3 className="font-extrabold text-base text-gray-900 line-clamp-2 mt-1 mb-2 group-hover:text-[#B80F2E] transition-all font-serif">
                        {c.Title}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                        {c.Description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-rose-50/60 pt-4 mt-2 text-xs font-bold text-gray-500">
                      <span>👨‍🏫 {c.Instructor || 'Counsel Staff'}</span>
                      <span className="text-[#B80F2E] group-hover:underline">Start Learning →</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center w-full text-gray-400 font-semibold uppercase tracking-wider border border-dashed border-rose-100 rounded-xl">
                Gathering counseling courses...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* BLOG PUBLICATIONS SPOTLIGHT */}
      <section className="py-16 px-4 bg-rose-50/10 border-b border-rose-100/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="text-left">
              <span className="text-xs text-rose-700 font-extrabold uppercase tracking-wider">Insight publications</span>
              <h2 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight text-gray-900 mt-1 font-serif">Counselor Guidance Blog</h2>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentPage('blog')} 
                className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#B80F2E] hover:underline mr-2"
              >
                all posts →
              </button>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => scrollSide(blogScrollRef, 'left')}
                  className="w-10 h-10 border border-gray-200 hover:border-rose-200 hover:bg-rose-50 text-gray-600 rounded-full flex items-center justify-center cursor-pointer shadow-sm transition-all"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => scrollSide(blogScrollRef, 'right')}
                  className="w-10 h-10 border border-gray-200 hover:border-rose-200 hover:bg-rose-50 text-gray-600 rounded-full flex items-center justify-center cursor-pointer shadow-sm transition-all"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div 
            ref={blogScrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-none pb-4 scroll-smooth snap-x snap-mandatory text-left"
          >
            {blogs.length ? (
              blogs.map((p) => {
                const excerpt = p.Content ? p.Content.replace(/<[^>]*>/g, '').slice(0, 115) + '...' : 'Interactive reflections...';
                return (
                  <div 
                    key={p.ID} 
                    onClick={() => { setSelectedId(p.ID); setCurrentPage('blog-item'); }}
                    className="snap-start flex-shrink-0 w-80 sm:w-96 bg-white border border-rose-100 hover:border-[#B80F2E] hover:shadow-lg rounded-2xl overflow-hidden cursor-pointer group transition-all"
                  >
                    <div className="relative aspect-video bg-rose-50 text-rose-900 flex items-center justify-center overflow-hidden">
                      <img 
                        src={p.FeaturedImageURL || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 flex gap-1">
                        {p.PDFLink && <span className="text-[8px] bg-emerald-700 text-white font-extrabold uppercase px-2 py-0.5 rounded shadow flex items-center gap-1"><FileDown className="w-2.5 h-2.5"/> PDF</span>}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col justify-between h-48">
                      <div>
                        <div className="flex gap-1 flex-wrap mb-1">
                          {(p.Tags || "").split(',').filter(Boolean).slice(0, 2).map((t, i) => (
                            <span key={i} className="text-[9px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded tracking-wide">
                              #{t.trim()}
                            </span>
                          ))}
                        </div>
                        <h3 className="font-extrabold text-base text-gray-900 line-clamp-2 mb-2 group-hover:text-[#B80F2E] transition-all font-serif">
                          {p.Title}
                        </h3>
                        <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                          {excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-rose-50/60 pt-4 mt-2 text-xs font-bold text-gray-500">
                        <span>📅 {new Date(p.CreatedDate).toLocaleDateString()}</span>
                        <span className="text-[#B80F2E] group-hover:underline">Read Article →</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center w-full text-gray-400 font-semibold uppercase tracking-wider border border-dashed border-rose-100 rounded-xl">
                Gathering insightful publications...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* REFERENCE CAROUSEL */}
      <section className="py-16 px-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="text-left">
              <span className="text-xs text-rose-700 font-extrabold uppercase tracking-wider">templates & GUIDES</span>
              <h2 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight text-gray-900 mt-1 font-serif">Reference Material</h2>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentPage('references')} 
                className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#B80F2E] hover:underline mr-2"
              >
                all references →
              </button>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => scrollSide(refScrollRef, 'left')}
                  className="w-10 h-10 border border-gray-200 hover:border-rose-200 hover:bg-rose-50 text-gray-600 rounded-full flex items-center justify-center cursor-pointer shadow-sm transition-all"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => scrollSide(refScrollRef, 'right')}
                  className="w-10 h-10 border border-gray-200 hover:border-rose-200 hover:bg-rose-50 text-gray-600 rounded-full flex items-center justify-center cursor-pointer shadow-sm transition-all"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div 
            ref={refScrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-none pb-4 scroll-smooth snap-x snap-mandatory text-left"
          >
            {refs.length ? (
              refs.map((r) => (
                <div 
                  key={r.ID} 
                  onClick={() => { setSelectedId(r.ID); setCurrentPage('reference-item'); }}
                  className="snap-start flex-shrink-0 w-80 sm:w-96 bg-white border border-rose-100 hover:border-[#B80F2E] hover:shadow-lg rounded-2xl overflow-hidden cursor-pointer group transition-all"
                >
                  <div className="relative aspect-video bg-rose-50 text-rose-900 flex items-center justify-center overflow-hidden">
                    <img 
                      src={r.ThumbnailURL || "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80"} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#B80F2E] text-white font-black text-[9px] uppercase px-2.5 py-1 rounded-md tracking-wider">
                      {r.Category}
                    </div>
                    {r.PDFLink && (
                      <div className="absolute top-3 right-3 bg-emerald-700 text-white font-extrabold text-[8px] uppercase px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <FileDown className="w-2.5 h-2.5" /> PDF
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col justify-between h-48">
                    <div>
                      <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Written by {r.Author || 'Mentors'}</span>
                      <h3 className="font-extrabold text-base text-gray-900 line-clamp-2 mt-1 mb-2 group-hover:text-[#B80F2E] transition-all font-serif">
                        {r.Title}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                        {r.Description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-rose-50/60 pt-4 mt-2 text-xs font-bold text-gray-500">
                      <span>✓ Open Resource Brief</span>
                      <span className="text-[#B80F2E] group-hover:underline">View Document →</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center w-full text-gray-400 font-semibold uppercase tracking-wider border border-dashed border-rose-100 rounded-xl">
                Preparing resource documents...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CAREER LAB SPOTLIGHT */}
      <section className="py-16 px-4 bg-rose-50/5 border-b border-rose-100/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="text-left">
              <span className="text-xs text-rose-700 font-extrabold uppercase tracking-wider">Student submittals</span>
              <h2 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight text-gray-900 mt-1 font-serif">Career Laboratory Archive</h2>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentPage('career-lab')} 
                className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#B80F2E] hover:underline mr-2"
              >
                all submissions →
              </button>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => scrollSide(labScrollRef, 'left')}
                  className="w-10 h-10 border border-gray-200 hover:border-rose-200 hover:bg-rose-50 text-gray-600 rounded-full flex items-center justify-center cursor-pointer shadow-sm transition-all"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => scrollSide(labScrollRef, 'right')}
                  className="w-10 h-10 border border-gray-200 hover:border-rose-200 hover:bg-rose-50 text-gray-600 rounded-full flex items-center justify-center cursor-pointer shadow-sm transition-all"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div 
            ref={labScrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-none pb-4 scroll-smooth snap-x snap-mandatory text-left"
          >
            {labs.length ? (
              labs.map((l) => (
                <div 
                  key={l.ID} 
                  onClick={() => { setSelectedId(l.ID); setCurrentPage('lab-item'); }}
                  className="snap-start flex-shrink-0 w-80 sm:w-96 bg-white border border-rose-100 hover:border-[#B80F2E] hover:shadow-lg rounded-2xl overflow-hidden cursor-pointer group transition-all"
                >
                  <div className="relative aspect-video bg-rose-50 text-rose-900 flex items-center justify-center overflow-hidden">
                    <img 
                      src={l.ThumbnailURL || "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=800&q=80"} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#111827] text-white font-black text-[9px] uppercase px-2.5 py-1 rounded-md tracking-wider">
                      {l.Category}
                    </div>
                    {l.PDFLink && (
                      <div className="absolute top-3 right-3 bg-emerald-700 text-white font-extrabold text-[8px] uppercase px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <FileDown className="w-2.5 h-2.5" /> PDF
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col justify-between h-48">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#B80F2E] tracking-wider">Author: {l.Student}</span>
                      <h3 className="font-extrabold text-base text-gray-900 line-clamp-2 mt-1 mb-2 group-hover:text-[#B80F2E] transition-all font-serif">
                        {l.Title}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                        {l.Description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-rose-50/60 pt-4 mt-2 text-xs font-bold text-gray-500">
                      <span>👤 Mentor: {l.Mentor || 'Faculty Panel'}</span>
                      <span className="text-[#B80F2E] group-hover:underline">Explore Project  →</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center w-full text-gray-400 font-semibold uppercase tracking-wider border border-dashed border-rose-100 rounded-xl">
                Gathering student career laboratory researches...
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
