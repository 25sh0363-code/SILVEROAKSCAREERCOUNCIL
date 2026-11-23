/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ArrowRight,
  BookOpen,
  FolderGit,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  FileDown,
  GraduationCap,
  Mail,
  User,
  Pin,
  Calendar,
  Sparkles,
  FileText
} from 'lucide-react';
import { Course, BlogPost, ReferenceMaterial, CareerLab, Counselor, PinnableTable } from '../types';
import {
  fetchAllCourses,
  fetchAllBlogs,
  fetchAllReferences,
  fetchAllCareerLabs,
  fetchAllCounselors,
  togglePinRecord,
  sortPinnedFirst
} from '../lib/supabase';

interface HomeProps {
  setCurrentPage: (page: string) => void;
  setSelectedId: (id: string) => void;
  onNotify?: (msg: string, type?: 'success' | 'err') => void;
}

interface PinnedHighlight {
  id: string;
  table: PinnableTable;
  title: string;
  subtitle: string;
  typeLabel: string;
  page: string;
  date?: string;
}

export default function Home({ setCurrentPage, setSelectedId, onNotify }: HomeProps) {
  // Store complete lists for full autocomplete search & pinned highlights
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]);
  const [allRefs, setAllRefs] = useState<ReferenceMaterial[]>([]);
  const [allLabs, setAllLabs] = useState<CareerLab[]>([]);
  const [counselors, setCounselors] = useState<Counselor[]>([]);

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
    async function loadFeatured() {
      try {
        const [cList, bList, rList, lList, counsList] = await Promise.all([
          fetchAllCourses(true),
          fetchAllBlogs(true),
          fetchAllReferences(true),
          fetchAllCareerLabs(true),
          fetchAllCounselors(true)
        ]);
        setAllCourses(cList);
        setAllBlogs(bList);
        setAllRefs(rList);
        setAllLabs(lList);
        setCounselors(counsList.slice(0, 4));
      } catch (err) {
        console.error("Failed to load home featured items:", err);
      }
    }
    loadFeatured();
  }, []);

  // Derived spotlight slices (pinned items automatically float first!)
  const courses = allCourses.slice(0, 6);
  const blogs = allBlogs.slice(0, 6);
  const refs = allRefs.slice(0, 6);
  const labs = allLabs.slice(0, 6);

  // Gather all pinned highlights across blogs, courses, references, and labs
  const pinnedHighlights: PinnedHighlight[] = [
    ...allBlogs
      .filter(b => b.IsPinned)
      .map(b => ({
        id: b.ID,
        table: 'blogs' as PinnableTable,
        title: b.Title,
        subtitle: (b.Content || '').replace(/<[^>]*>/g, '').slice(0, 95) || 'Pinned editorial dispatch',
        typeLabel: 'Editorial Post',
        page: 'blog-item',
        date: b.CreatedDate
      })),
    ...allCourses
      .filter(c => c.IsPinned)
      .map(c => ({
        id: c.ID,
        table: 'courses' as PinnableTable,
        title: c.Title,
        subtitle: c.Description || `${c.Category} · ${c.Grade}`,
        typeLabel: 'Course',
        page: 'course',
        date: c.CreatedDate
      })),
    ...allRefs
      .filter(r => r.IsPinned)
      .map(r => ({
        id: r.ID,
        table: 'reference_materials' as PinnableTable,
        title: r.Title,
        subtitle: r.Description || r.Category,
        typeLabel: 'Reference',
        page: 'reference-item',
        date: r.CreatedDate
      })),
    ...allLabs
      .filter(l => l.IsPinned)
      .map(l => ({
        id: l.ID,
        table: 'career_labs' as PinnableTable,
        title: l.Title,
        subtitle: l.Description || `Student: ${l.Student}`,
        typeLabel: 'Career Lab',
        page: 'lab-item',
        date: l.CreatedDate
      }))
  ];

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

  const handleTogglePin = async (
    e: React.MouseEvent,
    table: PinnableTable,
    id: string,
    title: string,
    currentlyPinned?: boolean
  ) => {
    e.stopPropagation();
    const nextPinned = !currentlyPinned;
    if (table === 'courses') {
      setAllCourses(prev => sortPinnedFirst(prev.map(i => i.ID === id ? { ...i, IsPinned: nextPinned } : i)));
    } else if (table === 'blogs') {
      setAllBlogs(prev => sortPinnedFirst(prev.map(i => i.ID === id ? { ...i, IsPinned: nextPinned } : i)));
    } else if (table === 'reference_materials') {
      setAllRefs(prev => sortPinnedFirst(prev.map(i => i.ID === id ? { ...i, IsPinned: nextPinned } : i)));
    } else if (table === 'career_labs') {
      setAllLabs(prev => sortPinnedFirst(prev.map(i => i.ID === id ? { ...i, IsPinned: nextPinned } : i)));
    }
    await togglePinRecord(table, id, nextPinned);
    onNotify?.(
      nextPinned ? `Pinned "${title}" to top` : `Unpinned "${title}"`,
      'success'
    );
  };

  // Real-time search suggestions across ALL records
  const handleSearchInput = (val: string) => {
    setQuery(val);
    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const q = val.toLowerCase();
    const matches: any[] = [];

    allCourses.forEach(c => {
      if (c.Title.toLowerCase().includes(q) || c.Description.toLowerCase().includes(q) || c.Category.toLowerCase().includes(q)) {
        matches.push({ id: c.ID, title: c.Title, type: 'Course', page: 'course', isPinned: c.IsPinned });
      }
    });
    allBlogs.forEach(p => {
      if (p.Title.toLowerCase().includes(q) || p.Content.toLowerCase().includes(q) || (p.Tags && p.Tags.toLowerCase().includes(q))) {
        matches.push({ id: p.ID, title: p.Title, type: 'Editorial', page: 'blog-item', isPinned: p.IsPinned });
      }
    });
    allRefs.forEach(r => {
      if (r.Title.toLowerCase().includes(q) || r.Description.toLowerCase().includes(q) || r.Category.toLowerCase().includes(q)) {
        matches.push({ id: r.ID, title: r.Title, type: 'Reference', page: 'reference-item', isPinned: r.IsPinned });
      }
    });
    allLabs.forEach(l => {
      if (l.Title.toLowerCase().includes(q) || l.Description.toLowerCase().includes(q) || l.Student.toLowerCase().includes(q)) {
        matches.push({ id: l.ID, title: l.Title, type: 'Career Lab', page: 'lab-item', isPinned: l.IsPinned });
      }
    });

    setSuggestions(matches.slice(0, 6));
    setShowSuggestions(matches.length > 0);
  };

  const handleGlobalSearch = () => {
    if (!query.trim()) return;
    setShowSuggestions(false);
    setCurrentPage(`search?q=${encodeURIComponent(query.trim())}`);
  };

  const scrollSide = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 360;
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
    <div className="flex flex-col min-h-screen bg-[#FFFBFB]">
      {/* 1. Crimson Editorial Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#5C0717] via-[#9B0D27] to-[#C61535] text-white py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_80%_-10%,rgba(255,255,255,0.2),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_100%,rgba(92,7,23,0.7),transparent_55%)] pointer-events-none" />
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1920&q=80')`
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto text-left flex flex-col items-start gap-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/12 border border-white/25 text-rose-50 font-semibold text-[11px] uppercase tracking-[0.16em] backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-200" />
            <span>Silver Oaks Academic Portal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight leading-[1.08] text-white max-w-4xl">
            Designed for Direction.
            <br />
            <span className="text-rose-200 italic font-normal">Built for Student Futures.</span>
          </h1>

          <p className="text-rose-50/90 text-sm sm:text-lg max-w-2xl leading-relaxed font-normal">
            One institutional ecosystem crafted exclusively for Silver Oaks students. Access curated CV templates, research archives, stream guidance, and verified counselor modules.
          </p>

          {/* Elevated Autocomplete Search Panel */}
          <div className="w-full max-w-2xl mt-2 relative" ref={dropdownRef}>
            <div className="flex items-center bg-white rounded-2xl shadow-[0_14px_38px_rgba(68,5,17,0.28)] border border-white/80 overflow-hidden group focus-within:ring-4 focus-within:ring-white/30 transition-all">
              <div className="pl-4 text-[#9E0D28]/60 group-focus-within:text-[#B80F2E] shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
                placeholder="Search resumes, research labs, SAT guides, courses..."
                className="w-full h-13 sm:h-14 bg-transparent outline-none border-none text-[#241115] placeholder-[#9A7A80] px-3 text-sm font-medium"
              />
              <button
                type="button"
                onClick={handleGlobalSearch}
                className="h-11 sm:h-12 m-1 bg-gradient-to-r from-[#8B0E24] to-[#C21434] text-white font-semibold text-xs uppercase tracking-wider px-5 sm:px-6 rounded-xl hover:brightness-110 cursor-pointer transition-all shrink-0 shadow-xs"
              >
                Search
              </button>
            </div>

            {showSuggestions && (
              <div className="absolute top-[106%] left-0 w-full bg-white border border-rose-100 rounded-2xl shadow-2xl z-40 overflow-hidden divide-y divide-rose-50 max-h-80 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <button
                    key={`${item.id}-${idx}`}
                    type="button"
                    onClick={() => handleSuggestClick(item)}
                    className="w-full text-left px-4 py-3.5 hover:bg-[#FFF5F6] flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-rose-50 text-[#B80F2E] border border-rose-100 tracking-wider shrink-0">
                        {item.type}
                      </span>
                      {item.isPinned && (
                        <Pin className="w-3 h-3 text-[#B80F2E] fill-current shrink-0" />
                      )}
                      <span className="text-xs sm:text-sm font-semibold text-[#241115] truncate group-hover:text-[#B80F2E]">
                        {item.title}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-rose-300 group-hover:text-[#B80F2E] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Pinned Highlights Section (renders automatically whenever posts are pinned) */}
      {pinnedHighlights.length > 0 && (
        <section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#FFF4F6] border-b border-rose-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <div className="text-left flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B80F2E] text-white flex items-center justify-center shadow-sm">
                  <Pin className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#B80F2E]">
                    Priority Board
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#241115] leading-tight">
                    Pinned Dispatches & Resources
                  </h2>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#8B0E24] bg-white border border-rose-200 px-3 py-1 rounded-full">
                {pinnedHighlights.length} Pinned
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 text-left">
              {pinnedHighlights.slice(0, 6).map((item) => (
                <div
                  key={`${item.table}-${item.id}`}
                  onClick={() => {
                    setSelectedId(item.id);
                    setCurrentPage(item.page);
                  }}
                  className="bg-white rounded-2xl border border-rose-200 hover:border-[#B80F2E] p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B0E24] via-[#B80F2E] to-[#E11D48]" />
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-[#B80F2E] px-2.5 py-1 rounded-full border border-rose-100">
                        <Pin className="w-2.5 h-2.5 fill-current" />
                        {item.typeLabel}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleTogglePin(e, item.table, item.id, item.title, true)}
                        title="Unpin post"
                        className="p-1.5 rounded-lg text-[#B80F2E] hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Pin className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                    <h3 className="font-serif font-semibold text-base sm:text-lg text-[#241115] group-hover:text-[#B80F2E] transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#694D53] line-clamp-2 mt-1.5 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3.5 mt-4 border-t border-rose-100/70 text-xs">
                    <span className="text-[#8A6970]">
                      {item.date ? new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Featured'}
                    </span>
                    <span className="text-[#B80F2E] font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Open <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Structured Guided Journey Pathways */}
      <section className="bg-white py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-rose-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-xs text-[#B80F2E] font-bold uppercase tracking-[0.16em]">
              Interactive Pathway Guides
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-semibold tracking-tight text-[#241115] mt-2">
              Three Core Pipelines for Development
            </h2>
            <p className="text-[#694D53] text-sm max-w-xl mx-auto mt-2">
              Connect directly with designated archives engineered for specific student growth outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 text-left">
            {[
              {
                icon: FolderGit,
                title: 'Career Discovery',
                desc: 'Analyze interests, career families, and international standards. Download templates and reference briefs crafted by qualified counseling faculties.',
                cta: 'Discover References',
                target: 'references'
              },
              {
                icon: BookOpen,
                title: 'Skill & Aptitude Loops',
                desc: 'Complete structured modules in stream selection, university personal narratives, logical reasoning patterns, and portfolio frameworks.',
                cta: 'Navigate Courses',
                target: 'courses'
              },
              {
                icon: CheckSquare,
                title: 'Portfolio Laboratory',
                desc: 'Review original research reports, environmental studies, design outputs, and community solutions posted by peers under mentor support.',
                cta: 'Access Career Lab',
                target: 'career-lab'
              }
            ].map((path) => {
              const Icon = path.icon;
              return (
                <div
                  key={path.title}
                  onClick={() => setCurrentPage(path.target)}
                  className="bg-[#FFFDFD] rounded-2xl border border-rose-100 hover:border-rose-300 p-6 sm:p-7 shadow-2xs hover:shadow-lg transition-all duration-300 group flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="w-12 h-12 bg-rose-50 text-[#B80F2E] group-hover:bg-[#B80F2E] group-hover:text-white rounded-xl flex items-center justify-center mb-5 border border-rose-100 transition-colors duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-serif font-semibold text-[#241115] group-hover:text-[#B80F2E] transition-colors">
                      {path.title}
                    </h3>
                    <p className="text-[#694D53] text-sm leading-relaxed mt-2.5">
                      {path.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-rose-100/70 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#9E0D28]">
                    <span>{path.cta}</span>
                    <span className="w-7 h-7 rounded-full bg-rose-50 group-hover:bg-[#B80F2E] group-hover:text-white flex items-center justify-center transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. COURSES SPOTLIGHT */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#FFF9FA] border-b border-rose-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="text-left">
              <span className="text-xs text-[#B80F2E] font-bold uppercase tracking-[0.14em]">Academics</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight text-[#241115] mt-1">
                Curated Focus Courses
              </h2>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage('courses')}
                className="text-xs font-bold uppercase tracking-wider text-[#B80F2E] hover:text-[#7A0B1F] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>All Courses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="hidden sm:flex gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollSide(courseScrollRef, 'left')}
                  className="w-9 h-9 bg-white border border-rose-200 hover:border-[#B80F2E] hover:bg-rose-50 text-[#8B0E24] rounded-full flex items-center justify-center cursor-pointer transition-all"
                  aria-label="Scroll courses left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSide(courseScrollRef, 'right')}
                  className="w-9 h-9 bg-white border border-rose-200 hover:border-[#B80F2E] hover:bg-rose-50 text-[#8B0E24] rounded-full flex items-center justify-center cursor-pointer transition-all"
                  aria-label="Scroll courses right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={courseScrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-none pb-4 scroll-smooth snap-x snap-mandatory text-left -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {courses.length ? (
              courses.map((c) => (
                <div
                  key={c.ID}
                  onClick={() => { setSelectedId(c.ID); setCurrentPage('course'); }}
                  className={`snap-start flex-shrink-0 w-[82vw] sm:w-[340px] lg:w-[370px] bg-white rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 flex flex-col justify-between border ${
                    c.IsPinned
                      ? 'border-rose-300 ring-1 ring-rose-100 shadow-sm hover:shadow-lg'
                      : 'border-rose-100 hover:border-rose-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="relative aspect-video bg-rose-50 overflow-hidden">
                      <img
                        src={c.ThumbnailURL || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80"}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#36040D]/35 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        {c.IsPinned && (
                          <span className="inline-flex items-center gap-1 bg-[#B80F2E] text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-full shadow-xs">
                            <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                          </span>
                        )}
                        <span className="bg-white/95 text-[#8B0E24] font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-md tracking-wider shadow-xs">
                          {c.Category}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleTogglePin(e, 'courses', c.ID, c.Title, c.IsPinned)}
                        title={c.IsPinned ? 'Unpin course' : 'Pin course'}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                          c.IsPinned ? 'bg-[#B80F2E] text-white' : 'bg-white/95 text-[#694D53] hover:bg-[#B80F2E] hover:text-white'
                        }`}
                      >
                        <Pin className={`w-3.5 h-3.5 ${c.IsPinned ? 'fill-current' : ''}`} />
                      </button>
                      {c.YouTubeURL && (
                        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-[#8B0E24]/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
                          <PlayCircle className="w-3 h-3" /> Video Lecture
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <span className="text-[11px] font-bold uppercase text-[#B80F2E] tracking-wider">
                        {c.Grade || 'Class Level'}
                      </span>
                      <h3 className="font-serif font-semibold text-lg text-[#241115] line-clamp-2 mt-1 mb-2 group-hover:text-[#B80F2E] transition-colors leading-snug">
                        {c.Title}
                      </h3>
                      <p className="text-[#694D53] text-xs line-clamp-2 leading-relaxed">
                        {c.Description}
                      </p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-0">
                    <div className="flex items-center justify-between border-t border-rose-100/80 pt-3.5 text-xs text-[#694D53]">
                      <span className="inline-flex items-center gap-1.5 truncate max-w-[175px]">
                        <User className="w-3.5 h-3.5 text-[#B80F2E]/70 shrink-0" />
                        <span className="truncate">{c.Instructor || 'Council Staff'}</span>
                      </span>
                      <span className="text-[#B80F2E] font-semibold inline-flex items-center gap-1 shrink-0">
                        Start <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center w-full text-[#8A6970] font-medium text-xs uppercase tracking-wider border border-dashed border-rose-200 rounded-2xl bg-white">
                Gathering counseling courses...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. BLOG PUBLICATIONS SPOTLIGHT */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-rose-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="text-left">
              <span className="text-xs text-[#B80F2E] font-bold uppercase tracking-[0.14em]">Insight Publications</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight text-[#241115] mt-1">
                Counselor Guidance Blog
              </h2>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage('blog')}
                className="text-xs font-bold uppercase tracking-wider text-[#B80F2E] hover:text-[#7A0B1F] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>All Posts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="hidden sm:flex gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollSide(blogScrollRef, 'left')}
                  className="w-9 h-9 bg-white border border-rose-200 hover:border-[#B80F2E] hover:bg-rose-50 text-[#8B0E24] rounded-full flex items-center justify-center cursor-pointer transition-all"
                  aria-label="Scroll blog left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSide(blogScrollRef, 'right')}
                  className="w-9 h-9 bg-white border border-rose-200 hover:border-[#B80F2E] hover:bg-rose-50 text-[#8B0E24] rounded-full flex items-center justify-center cursor-pointer transition-all"
                  aria-label="Scroll blog right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={blogScrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-none pb-4 scroll-smooth snap-x snap-mandatory text-left -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {blogs.length ? (
              blogs.map((p) => {
                const excerpt = p.Content ? p.Content.replace(/<[^>]*>/g, '').slice(0, 115) + '...' : 'Interactive reflections...';
                return (
                  <div
                    key={p.ID}
                    onClick={() => { setSelectedId(p.ID); setCurrentPage('blog-item'); }}
                    className={`snap-start flex-shrink-0 w-[82vw] sm:w-[340px] lg:w-[370px] bg-white rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 flex flex-col justify-between border ${
                      p.IsPinned
                        ? 'border-rose-300 ring-1 ring-rose-100 shadow-sm hover:shadow-lg'
                        : 'border-rose-100 hover:border-rose-300 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="relative aspect-video bg-rose-50 overflow-hidden">
                        <img
                          src={p.FeaturedImageURL || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#36040D]/30 via-transparent to-transparent" />
                        {p.IsPinned && (
                          <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-[#B80F2E] text-white font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                            <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                          </span>
                        )}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          {p.PDFLink && (
                            <span className="text-[10px] bg-white/95 text-[#9E0D28] font-bold uppercase px-2 py-1 rounded-lg shadow-xs inline-flex items-center gap-1">
                              <FileDown className="w-3 h-3" /> PDF
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleTogglePin(e, 'blogs', p.ID, p.Title, p.IsPinned)}
                            title={p.IsPinned ? 'Unpin post' : 'Pin post'}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                              p.IsPinned ? 'bg-[#B80F2E] text-white' : 'bg-white/95 text-[#694D53] hover:bg-[#B80F2E] hover:text-white'
                            }`}
                          >
                            <Pin className={`w-3.5 h-3.5 ${p.IsPinned ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex gap-1.5 flex-wrap mb-2">
                          {(p.Tags || "").split(',').filter(Boolean).slice(0, 2).map((t, i) => (
                            <span key={i} className="text-[10px] font-bold uppercase text-[#B80F2E] bg-rose-50 px-2 py-0.5 rounded-md tracking-wide">
                              #{t.trim()}
                            </span>
                          ))}
                        </div>
                        <h3 className="font-serif font-semibold text-lg text-[#241115] line-clamp-2 mb-2 group-hover:text-[#B80F2E] transition-colors leading-snug">
                          {p.Title}
                        </h3>
                        <p className="text-[#694D53] text-xs line-clamp-2 leading-relaxed">
                          {excerpt}
                        </p>
                      </div>
                    </div>
                    <div className="px-5 pb-5 pt-0">
                      <div className="flex items-center justify-between border-t border-rose-100/80 pt-3.5 text-xs text-[#694D53]">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#B80F2E]/70" />
                          {new Date(p.CreatedDate).toLocaleDateString()}
                        </span>
                        <span className="text-[#B80F2E] font-semibold inline-flex items-center gap-1">
                          Read <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center w-full text-[#8A6970] font-medium text-xs uppercase tracking-wider border border-dashed border-rose-200 rounded-2xl bg-[#FFF9FA]">
                Gathering insightful publications...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. REFERENCE CAROUSEL */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#FFF9FA] border-b border-rose-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="text-left">
              <span className="text-xs text-[#B80F2E] font-bold uppercase tracking-[0.14em]">Templates & Guides</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight text-[#241115] mt-1">
                Reference Material
              </h2>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage('references')}
                className="text-xs font-bold uppercase tracking-wider text-[#B80F2E] hover:text-[#7A0B1F] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>All References</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="hidden sm:flex gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollSide(refScrollRef, 'left')}
                  className="w-9 h-9 bg-white border border-rose-200 hover:border-[#B80F2E] hover:bg-rose-50 text-[#8B0E24] rounded-full flex items-center justify-center cursor-pointer transition-all"
                  aria-label="Scroll references left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSide(refScrollRef, 'right')}
                  className="w-9 h-9 bg-white border border-rose-200 hover:border-[#B80F2E] hover:bg-rose-50 text-[#8B0E24] rounded-full flex items-center justify-center cursor-pointer transition-all"
                  aria-label="Scroll references right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={refScrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-none pb-4 scroll-smooth snap-x snap-mandatory text-left -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {refs.length ? (
              refs.map((r) => (
                <div
                  key={r.ID}
                  onClick={() => { setSelectedId(r.ID); setCurrentPage('reference-item'); }}
                  className={`snap-start flex-shrink-0 w-[82vw] sm:w-[340px] lg:w-[370px] bg-white rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 flex flex-col justify-between border ${
                    r.IsPinned
                      ? 'border-rose-300 ring-1 ring-rose-100 shadow-sm hover:shadow-lg'
                      : 'border-rose-100 hover:border-rose-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="relative aspect-video bg-rose-50 overflow-hidden">
                      <img
                        src={r.ThumbnailURL || "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80"}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#36040D]/30 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        {r.IsPinned && (
                          <span className="inline-flex items-center gap-1 bg-[#B80F2E] text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-full shadow-xs">
                            <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                          </span>
                        )}
                        <span className="bg-white/95 text-[#8B0E24] font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-md tracking-wider shadow-xs">
                          {r.Category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        {r.PDFLink && (
                          <span className="bg-white/95 text-[#9E0D28] font-bold text-[10px] uppercase px-2 py-1 rounded-lg shadow-xs inline-flex items-center gap-1">
                            <FileDown className="w-3 h-3" /> PDF
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleTogglePin(e, 'reference_materials', r.ID, r.Title, r.IsPinned)}
                          title={r.IsPinned ? 'Unpin reference' : 'Pin reference'}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                            r.IsPinned ? 'bg-[#B80F2E] text-white' : 'bg-white/95 text-[#694D53] hover:bg-[#B80F2E] hover:text-white'
                          }`}
                        >
                          <Pin className={`w-3.5 h-3.5 ${r.IsPinned ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <span className="text-[11px] font-semibold uppercase text-[#8A6970] tracking-wider">
                        By {r.Author || 'Mentors'}
                      </span>
                      <h3 className="font-serif font-semibold text-lg text-[#241115] line-clamp-2 mt-1 mb-2 group-hover:text-[#B80F2E] transition-colors leading-snug">
                        {r.Title}
                      </h3>
                      <p className="text-[#694D53] text-xs line-clamp-2 leading-relaxed">
                        {r.Description}
                      </p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-0">
                    <div className="flex items-center justify-between border-t border-rose-100/80 pt-3.5 text-xs text-[#694D53]">
                      <span className="inline-flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#B80F2E]/70" />
                        Resource Brief
                      </span>
                      <span className="text-[#B80F2E] font-semibold inline-flex items-center gap-1">
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center w-full text-[#8A6970] font-medium text-xs uppercase tracking-wider border border-dashed border-rose-200 rounded-2xl bg-white">
                Preparing resource documents...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. CAREER LAB SPOTLIGHT */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-rose-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="text-left">
              <span className="text-xs text-[#B80F2E] font-bold uppercase tracking-[0.14em]">Student Submittals</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight text-[#241115] mt-1">
                Career Laboratory Archive
              </h2>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage('career-lab')}
                className="text-xs font-bold uppercase tracking-wider text-[#B80F2E] hover:text-[#7A0B1F] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>All Submissions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="hidden sm:flex gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollSide(labScrollRef, 'left')}
                  className="w-9 h-9 bg-white border border-rose-200 hover:border-[#B80F2E] hover:bg-rose-50 text-[#8B0E24] rounded-full flex items-center justify-center cursor-pointer transition-all"
                  aria-label="Scroll career labs left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSide(labScrollRef, 'right')}
                  className="w-9 h-9 bg-white border border-rose-200 hover:border-[#B80F2E] hover:bg-rose-50 text-[#8B0E24] rounded-full flex items-center justify-center cursor-pointer transition-all"
                  aria-label="Scroll career labs right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={labScrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-none pb-4 scroll-smooth snap-x snap-mandatory text-left -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {labs.length ? (
              labs.map((l) => (
                <div
                  key={l.ID}
                  onClick={() => { setSelectedId(l.ID); setCurrentPage('lab-item'); }}
                  className={`snap-start flex-shrink-0 w-[82vw] sm:w-[340px] lg:w-[370px] bg-white rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 flex flex-col justify-between border ${
                    l.IsPinned
                      ? 'border-rose-300 ring-1 ring-rose-100 shadow-sm hover:shadow-lg'
                      : 'border-rose-100 hover:border-rose-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="relative aspect-video bg-rose-50 overflow-hidden">
                      <img
                        src={l.ThumbnailURL || "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=800&q=80"}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#36040D]/30 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        {l.IsPinned && (
                          <span className="inline-flex items-center gap-1 bg-[#B80F2E] text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded-full shadow-xs">
                            <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                          </span>
                        )}
                        <span className="bg-[#6B081B] text-white font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-md tracking-wider shadow-xs">
                          {l.Category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        {l.PDFLink && (
                          <span className="bg-white/95 text-[#9E0D28] font-bold text-[10px] uppercase px-2 py-1 rounded-lg shadow-xs inline-flex items-center gap-1">
                            <FileDown className="w-3 h-3" /> PDF
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleTogglePin(e, 'career_labs', l.ID, l.Title, l.IsPinned)}
                          title={l.IsPinned ? 'Unpin project' : 'Pin project'}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                            l.IsPinned ? 'bg-[#B80F2E] text-white' : 'bg-white/95 text-[#694D53] hover:bg-[#B80F2E] hover:text-white'
                          }`}
                        >
                          <Pin className={`w-3.5 h-3.5 ${l.IsPinned ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <span className="text-[11px] font-bold uppercase text-[#B80F2E] tracking-wider">
                        Author: {l.Student}
                      </span>
                      <h3 className="font-serif font-semibold text-lg text-[#241115] line-clamp-2 mt-1 mb-2 group-hover:text-[#B80F2E] transition-colors leading-snug">
                        {l.Title}
                      </h3>
                      <p className="text-[#694D53] text-xs line-clamp-2 leading-relaxed">
                        {l.Description}
                      </p>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-0">
                    <div className="flex items-center justify-between border-t border-rose-100/80 pt-3.5 text-xs text-[#694D53]">
                      <span className="inline-flex items-center gap-1.5 truncate max-w-[175px]">
                        <User className="w-3.5 h-3.5 text-[#B80F2E]/70 shrink-0" />
                        <span className="truncate">Mentor: {l.Mentor || 'Faculty Panel'}</span>
                      </span>
                      <span className="text-[#B80F2E] font-semibold inline-flex items-center gap-1 shrink-0">
                        Explore <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center w-full text-[#8A6970] font-medium text-xs uppercase tracking-wider border border-dashed border-rose-200 rounded-2xl bg-[#FFF9FA]">
                Gathering student career laboratory researches...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. Meet Your Career Counsellors Section */}
      <section className="bg-gradient-to-b from-[#FFF5F6] to-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10 sm:mb-12">
            <div className="text-left max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-rose-200 text-[#B80F2E] font-bold text-[10px] uppercase tracking-wider mb-3 shadow-2xs">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Advisory Desk</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-[#241115]">
                Meet Your Career Counsellors
              </h2>
              <p className="text-[#694D53] text-sm sm:text-base leading-relaxed mt-2.5">
                Our qualified advisory team is ready to guide you in portfolio creation, college admission personal statements, stream selection analysis, and academic development.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage('counselors')}
              className="px-5 py-3 bg-gradient-to-r from-[#8B0E24] to-[#B80F2E] hover:brightness-110 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-all self-start md:self-auto"
            >
              <span>View Roster</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {counselors.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {counselors.map((c) => (
                <div
                  key={c.ID}
                  onClick={() => setCurrentPage('counselors')}
                  className="bg-white rounded-2xl border border-rose-100 shadow-2xs hover:shadow-lg hover:border-rose-200 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="aspect-[4/3] bg-gradient-to-br from-[#FFF2F4] to-[#FFE4E8] relative overflow-hidden shrink-0 border-b border-rose-100">
                      {c.ImageURL ? (
                        <img
                          src={c.ImageURL}
                          alt={c.Name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#C85A6D]">
                          <User className="w-12 h-12 stroke-[1.25]" />
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-serif font-semibold text-lg text-[#241115] truncate group-hover:text-[#B80F2E] transition-colors">
                        {c.Name}
                      </h3>
                      <p className="text-[11px] text-[#B80F2E] font-bold uppercase tracking-wide mt-0.5 truncate">
                        {c.Qualifications || "Student Counsellor"}
                      </p>
                      <p className="text-[#694D53] text-xs line-clamp-3 mt-2.5 leading-relaxed">
                        {c.Intro}
                      </p>
                    </div>
                  </div>

                  {c.Contact && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="flex items-center gap-2 text-xs text-[#694D53] font-medium border-t border-rose-100/80 pt-3.5">
                        <Mail className="w-3.5 h-3.5 text-[#B80F2E] shrink-0" />
                        <span className="truncate select-all">{c.Contact}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-rose-200 p-12 text-center max-w-md mx-auto">
              <p className="text-xs text-[#8A6970] font-semibold uppercase tracking-widest leading-relaxed">
                Connect with counselors in the staff portal to register new active profiles.
              </p>
            </div>
          )}

          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setCurrentPage('counselors')}
              className="inline-flex items-center gap-2 px-6 py-3 border border-rose-200 hover:border-[#B80F2E] rounded-xl text-xs font-bold uppercase tracking-wider text-[#8B0E24] hover:bg-rose-50 bg-white transition-all shadow-2xs cursor-pointer"
            >
              <span>Explore Dedicated Counseling Board</span>
              <ArrowRight className="w-4 h-4 text-[#B80F2E]" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
