/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ArrowRight,
  Pin,
  BookOpen,
  FileText,
  FlaskConical,
  Newspaper,
  PlayCircle,
  FileDown,
  Mail,
  User,
  Award,
  X
} from 'lucide-react';
import { Course, BlogPost, ReferenceMaterial, CareerLab, Counselor } from '../types';
import {
  fetchAllCourses,
  fetchAllBlogs,
  fetchAllReferences,
  fetchAllCareerLabs,
  fetchAllCounselors
} from '../lib/supabase';

interface HomeProps {
  setCurrentPage: (page: string) => void;
  setSelectedId: (id: string) => void;
}

interface SearchHit {
  id: string;
  title: string;
  subtitle: string;
  type: 'course' | 'blog-item' | 'reference-item' | 'lab-item';
  typeLabel: string;
  isPinned?: boolean;
}

interface PinnedNotice {
  id: string;
  title: string;
  summary: string;
  meta: string;
  date: string;
  type: 'course' | 'blog-item' | 'reference-item' | 'lab-item';
  typeLabel: string;
}

function stripHtml(html: string): string {
  return (html || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

function formatShortDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Home({ setCurrentPage, setSelectedId }: HomeProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [refs, setRefs] = useState<ReferenceMaterial[]>([]);
  const [labs, setLabs] = useState<CareerLab[]>([]);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);

  // Instant search bar state
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [cList, bList, rList, lList, counsList] = await Promise.all([
        fetchAllCourses(true),
        fetchAllBlogs(true),
        fetchAllReferences(true),
        fetchAllCareerLabs(true),
        fetchAllCounselors(true)
      ]);
      setCourses(cList);
      setBlogs(bList);
      setRefs(rList);
      setLabs(lList);
      setCounselors(counsList);
    } catch (err) {
      console.error("Failed to fetch homepage data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const handlePinsUpdated = () => {
      loadAllData();
    };
    window.addEventListener('pins-updated', handlePinsUpdated);
    return () => window.removeEventListener('pins-updated', handlePinsUpdated);
  }, []);

  // Collect all pinned posts across every section as Important Student Notices
  const pinnedNotices = useMemo<PinnedNotice[]>(() => {
    const items: PinnedNotice[] = [];

    blogs.filter(b => b.IsPinned).forEach(b => {
      items.push({
        id: b.ID,
        title: b.Title,
        summary: stripHtml(b.Content).slice(0, 140),
        meta: b.AuthorEmail ? `By ${b.AuthorEmail.split('@')[0]}` : 'Counselor Editorial',
        date: b.UpdatedDate || b.CreatedDate,
        type: 'blog-item',
        typeLabel: 'Editorial'
      });
    });

    courses.filter(c => c.IsPinned).forEach(c => {
      items.push({
        id: c.ID,
        title: c.Title,
        summary: c.Description || stripHtml(c.Content).slice(0, 140),
        meta: [c.Category, c.Grade].filter(Boolean).join(' · '),
        date: c.UpdatedDate || c.CreatedDate,
        type: 'course',
        typeLabel: 'Course'
      });
    });

    refs.filter(r => r.IsPinned).forEach(r => {
      items.push({
        id: r.ID,
        title: r.Title,
        summary: r.Description || stripHtml(r.Content).slice(0, 140),
        meta: r.Category || r.Author || 'Reference Library',
        date: r.UpdatedDate || r.CreatedDate,
        type: 'reference-item',
        typeLabel: 'Reference'
      });
    });

    labs.filter(l => l.IsPinned).forEach(l => {
      items.push({
        id: l.ID,
        title: l.Title,
        summary: l.Description || stripHtml(l.Content).slice(0, 140),
        meta: l.Student ? `Student: ${l.Student}` : l.Category,
        date: l.UpdatedDate || l.CreatedDate,
        type: 'lab-item',
        typeLabel: 'Career Lab'
      });
    });

    return items.sort((a, b) => {
      const tA = a.date ? new Date(a.date).getTime() : 0;
      const tB = b.date ? new Date(b.date).getTime() : 0;
      return tB - tA;
    });
  }, [courses, blogs, refs, labs]);

  // Live autocomplete hits across entire portal
  const searchHits = useMemo<SearchHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const results: SearchHit[] = [];

    courses.forEach(c => {
      if (
        c.Title.toLowerCase().includes(q) ||
        (c.Description || '').toLowerCase().includes(q) ||
        (c.Category || '').toLowerCase().includes(q) ||
        (c.Grade || '').toLowerCase().includes(q)
      ) {
        results.push({
          id: c.ID,
          title: c.Title,
          subtitle: [c.Category, c.Grade].filter(Boolean).join(' · '),
          type: 'course',
          typeLabel: 'Course',
          isPinned: c.IsPinned
        });
      }
    });

    blogs.forEach(b => {
      if (
        b.Title.toLowerCase().includes(q) ||
        (b.Content || '').toLowerCase().includes(q) ||
        (b.Tags || '').toLowerCase().includes(q)
      ) {
        results.push({
          id: b.ID,
          title: b.Title,
          subtitle: b.Tags ? b.Tags.split(',').slice(0, 2).map(t => `#${t.trim()}`).join(' ') : 'Editorial',
          type: 'blog-item',
          typeLabel: 'Editorial',
          isPinned: b.IsPinned
        });
      }
    });

    refs.forEach(r => {
      if (
        r.Title.toLowerCase().includes(q) ||
        (r.Description || '').toLowerCase().includes(q) ||
        (r.Category || '').toLowerCase().includes(q)
      ) {
        results.push({
          id: r.ID,
          title: r.Title,
          subtitle: r.Category || r.Author,
          type: 'reference-item',
          typeLabel: 'Reference',
          isPinned: r.IsPinned
        });
      }
    });

    labs.forEach(l => {
      if (
        l.Title.toLowerCase().includes(q) ||
        (l.Description || '').toLowerCase().includes(q) ||
        (l.Student || '').toLowerCase().includes(q) ||
        (l.Category || '').toLowerCase().includes(q)
      ) {
        results.push({
          id: l.ID,
          title: l.Title,
          subtitle: l.Student ? `${l.Student} · ${l.Category}` : l.Category,
          type: 'lab-item',
          typeLabel: 'Career Lab',
          isPinned: l.IsPinned
        });
      }
    });

    return results
      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
      .slice(0, 7);
  }, [query, courses, blogs, refs, labs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchFocused(false);
    setCurrentPage(`search?q=${encodeURIComponent(trimmed)}`);
  };

  const openDetail = (type: 'course' | 'blog-item' | 'reference-item' | 'lab-item', id: string) => {
    setSelectedId(id);
    setCurrentPage(type);
  };

  const leadBlog = blogs[0];
  const secondaryBlogs = blogs.slice(1, 5);

  return (
    <div className="bg-white text-[#141416] text-left">
      {/* 1. ARCHITECTURAL CRIMSON HERO */}
      <section className="relative bg-gradient-to-br from-[#6E091A] via-[#8F0B22] to-[#B80F2E] text-white border-b border-[#5B0715]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Editorial Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-red-100">
                <span className="w-6 h-[2px] bg-white inline-block" />
                <span>Silver Oaks International Schools</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-medium leading-[1.08] tracking-tight text-white">
                Internal Career &amp; University Guidance Archive
              </h1>

              <p className="text-sm sm:text-base text-red-50/90 max-w-xl leading-relaxed">
                Structured curriculum modules, counselor dispatches, CV and application templates, and peer-authored research—curated for Silver Oaks students.
              </p>

              {/* High-Contrast Pure White Search Bar */}
              <div className="relative max-w-xl pt-1">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center bg-white rounded-xl p-1.5 shadow-xl shadow-black/15 ring-1 ring-white/20"
                >
                  <Search className="w-4 h-4 text-neutral-400 ml-3 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                    placeholder="Search courses, templates, essays, student labs..."
                    className="w-full py-2.5 text-sm text-[#141416] placeholder:text-neutral-400 focus:outline-none bg-transparent"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 sm:px-5 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    Search
                  </button>
                </form>

                {/* Live Autocomplete Panel */}
                {searchFocused && query.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl border border-neutral-200 shadow-2xl overflow-hidden z-40">
                    {searchHits.length === 0 ? (
                      <div className="px-4 py-5 text-xs text-neutral-500 text-center">
                        No instant matches for &ldquo;{query}&rdquo;. Press Search to inspect full archive.
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-100">
                        {searchHits.map(hit => (
                          <button
                            key={`${hit.type}-${hit.id}`}
                            type="button"
                            onMouseDown={() => openDetail(hit.type, hit.id)}
                            className="w-full px-4 py-3 hover:bg-neutral-50 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                {hit.isPinned && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#C8102E] text-white text-[9px] font-bold uppercase shrink-0">
                                    <Pin className="w-2.5 h-2.5 fill-current" />
                                    Important
                                  </span>
                                )}
                                <p className="text-sm font-semibold text-[#141416] truncate">{hit.title}</p>
                              </div>
                              {hit.subtitle && (
                                <p className="text-xs text-neutral-500 truncate mt-0.5">{hit.subtitle}</p>
                              )}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 text-[#C8102E] shrink-0">
                              {hit.typeLabel}
                            </span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onMouseDown={handleSearchSubmit}
                          className="w-full px-4 py-2.5 bg-[#FAFAFA] hover:bg-red-50 text-xs font-semibold text-[#C8102E] flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>View all results for &ldquo;{query}&rdquo;</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Jump Links */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-red-200/90 font-medium mr-1">Explore:</span>
                {[
                  { label: 'Courses', page: 'courses' },
                  { label: 'Editorial', page: 'blog' },
                  { label: 'Reference Library', page: 'references' },
                  { label: 'Career Lab', page: 'career-lab' },
                  { label: 'Counsellors', page: 'counselors' },
                ].map(item => (
                  <button
                    key={item.page}
                    type="button"
                    onClick={() => setCurrentPage(item.page)}
                    className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white hover:text-[#9E0B24] text-white font-medium border border-white/20 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Live Important Notice Card OR Archive Index */}
            <div className="lg:col-span-5">
              {pinnedNotices.length > 0 ? (
                <div className="bg-white text-[#141416] rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/20 border border-white/20">
                  <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#C8102E] text-white flex items-center justify-center">
                        <Pin className="w-3.5 h-3.5 fill-current" />
                      </span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C8102E]">
                          Pinned by Counsellors
                        </p>
                        <h2 className="text-sm font-bold text-[#141416] leading-tight">
                          Important Notices for Students
                        </h2>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-[#C8102E]">
                      {pinnedNotices.length}
                    </span>
                  </div>

                  <div className="divide-y divide-neutral-100">
                    {pinnedNotices.slice(0, 3).map(notice => (
                      <button
                        key={`${notice.type}-${notice.id}`}
                        type="button"
                        onClick={() => openDetail(notice.type, notice.id)}
                        className="w-full py-3 first:pt-0 last:pb-0 text-left group cursor-pointer flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8102E]">
                              {notice.typeLabel}
                            </span>
                            {notice.date && (
                              <span className="text-[11px] text-neutral-400">
                                · {formatShortDate(notice.date)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-[#141416] group-hover:text-[#C8102E] transition-colors line-clamp-2 leading-snug">
                            {notice.title}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#C8102E] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white text-[#141416] rounded-2xl p-6 shadow-2xl shadow-black/20">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C8102E] mb-4">
                    Archive Directory
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Focus Courses', count: courses.length, page: 'courses', icon: BookOpen },
                      { label: 'Editorial Posts', count: blogs.length, page: 'blog', icon: Newspaper },
                      { label: 'Reference Docs', count: refs.length, page: 'references', icon: FileText },
                      { label: 'Career Labs', count: labs.length, page: 'career-lab', icon: FlaskConical },
                    ].map(stat => {
                      const Icon = stat.icon;
                      return (
                        <button
                          key={stat.page}
                          type="button"
                          onClick={() => setCurrentPage(stat.page)}
                          className="p-4 rounded-xl bg-[#FAFAFA] hover:bg-red-50/70 border border-neutral-200 hover:border-[#C8102E]/30 transition-all text-left group cursor-pointer"
                        >
                          <Icon className="w-4 h-4 text-[#C8102E] mb-2.5" />
                          <div className="text-2xl font-serif font-semibold text-[#141416] group-hover:text-[#C8102E] transition-colors">
                            {loading ? '—' : stat.count}
                          </div>
                          <div className="text-xs font-medium text-neutral-600 mt-0.5">
                            {stat.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. PINNED IMPORTANT NOTICES BULLETIN (Shown whenever admins have pinned posts) */}
      {pinnedNotices.length > 0 && (
        <section className="bg-[#FAFAFA] border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#C8102E] mb-1">
                  <Pin className="w-3.5 h-3.5 fill-current" />
                  <span>Priority Bulletin</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#141416] tracking-tight">
                  Pinned Important Notices
                </h2>
              </div>
              <p className="text-xs text-neutral-500">
                Highlighted by the Silver Oaks Career Council for immediate student attention.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {pinnedNotices.map(notice => (
                <article
                  key={`bulletin-${notice.type}-${notice.id}`}
                  onClick={() => openDetail(notice.type, notice.id)}
                  className="bg-white rounded-xl border border-neutral-200 border-l-4 border-l-[#C8102E] p-5 hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-wider">
                        <Pin className="w-2.5 h-2.5 fill-current" />
                        Pinned · {notice.typeLabel}
                      </span>
                      {notice.date && (
                        <span className="text-[11px] text-neutral-400 font-medium">
                          {formatShortDate(notice.date)}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-[#141416] group-hover:text-[#C8102E] transition-colors leading-snug line-clamp-2">
                      {notice.title}
                    </h3>
                    {notice.summary && (
                      <p className="text-xs text-neutral-600 leading-relaxed mt-2 line-clamp-2">
                        {notice.summary}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 truncate">{notice.meta}</span>
                    <span className="font-semibold text-[#C8102E] inline-flex items-center gap-1 shrink-0">
                      Open
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. THREE CORE PATHWAYS */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                num: '01',
                title: 'Focus Courses',
                desc: 'Grade-wise workshops covering stream selection, profile building, SAT/ACT readiness, and global college applications.',
                page: 'courses',
                count: `${courses.length} modules`
              },
              {
                num: '02',
                title: 'Reference Library',
                desc: 'Downloadable CV and resume templates, university shortlisting sheets, and counselor-verified checklists.',
                page: 'references',
                count: `${refs.length} documents`
              },
              {
                num: '03',
                title: 'Career Laboratory',
                desc: 'Peer-authored research papers, capstone portfolios, and mentored student explorations across disciplines.',
                page: 'career-lab',
                count: `${labs.length} portfolios`
              }
            ].map(pathway => (
              <button
                key={pathway.page}
                type="button"
                onClick={() => setCurrentPage(pathway.page)}
                className="group p-6 sm:p-7 rounded-2xl border border-neutral-200 bg-white hover:border-[#C8102E] hover:shadow-md transition-all text-left flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-serif text-2xl font-semibold text-[#C8102E]">
                      {pathway.num}
                    </span>
                    <span className="text-[11px] font-semibold text-neutral-500 bg-[#FAFAFA] border border-neutral-200 px-2.5 py-0.5 rounded-full">
                      {loading ? '—' : pathway.count}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#141416] group-hover:text-[#C8102E] transition-colors">
                    {pathway.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed mt-2">
                    {pathway.desc}
                  </p>
                </div>
                <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C8102E]">
                  <span>Browse {pathway.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="py-24 text-center">
          <div className="spinner" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mt-3">
            Loading Silver Oaks Archive...
          </p>
        </div>
      ) : (
        <>
          {/* 4. CURATED FOCUS COURSES */}
          {courses.length > 0 && (
            <section className="py-14 sm:py-16 border-b border-neutral-200 bg-[#FAFAFA]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between gap-4 mb-8">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C8102E] mb-1">
                      Curriculum
                    </p>
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#141416] tracking-tight">
                      Curated Focus Courses
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('courses')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C8102E] hover:text-[#880A1F] cursor-pointer shrink-0"
                  >
                    <span>All Courses</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.slice(0, 6).map(course => (
                    <article
                      key={course.ID}
                      onClick={() => openDetail('course', course.ID)}
                      className={`bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group ${
                        course.IsPinned
                          ? 'border-[#C8102E]/45 ring-1 ring-[#C8102E]/15'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div>
                        <div className="aspect-[16/10] bg-neutral-100 relative overflow-hidden border-b border-neutral-100">
                          {course.ThumbnailURL ? (
                            <img
                              src={course.ThumbnailURL}
                              alt={course.Title}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#8F0B22] to-[#C8102E] text-white/90">
                              <BookOpen className="w-10 h-10 stroke-[1.5]" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            {course.IsPinned && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                                <Pin className="w-2.5 h-2.5 fill-current" />
                                Important
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
                              <PlayCircle className="w-3 h-3" />
                              Video
                            </span>
                          )}
                        </div>

                        <div className="p-5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8102E]">
                            {course.Category || 'General'}
                          </span>
                          <h3 className="font-serif text-lg font-semibold text-[#141416] group-hover:text-[#C8102E] transition-colors mt-1.5 leading-snug line-clamp-2">
                            {course.Title}
                          </h3>
                          {course.Description && (
                            <p className="text-xs text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                              {course.Description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="px-5 py-3.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                        <span className="truncate font-medium">{course.Instructor || 'Council Faculty'}</span>
                        {course.PDFLink && (
                          <span className="inline-flex items-center gap-1 text-[#C8102E] font-semibold shrink-0">
                            <FileDown className="w-3.5 h-3.5" />
                            PDF
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 5. COUNSELOR GUIDANCE EDITORIAL (Magazine Split Layout) */}
          {blogs.length > 0 && (
            <section className="py-14 sm:py-16 border-b border-neutral-200 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between gap-4 mb-8">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C8102E] mb-1">
                      Publications
                    </p>
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#141416] tracking-tight">
                      Counselor Guidance Editorial
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('blog')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C8102E] hover:text-[#880A1F] cursor-pointer shrink-0"
                  >
                    <span>All Articles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Lead Featured Article */}
                  {leadBlog && (
                    <article
                      onClick={() => openDetail('blog-item', leadBlog.ID)}
                      className={`lg:col-span-7 rounded-2xl border overflow-hidden bg-white hover:shadow-lg transition-all cursor-pointer group ${
                        leadBlog.IsPinned
                          ? 'border-[#C8102E]/45 ring-1 ring-[#C8102E]/15'
                          : 'border-neutral-200'
                      }`}
                    >
                      <div className="aspect-[16/9] bg-neutral-100 relative overflow-hidden border-b border-neutral-100">
                        {leadBlog.FeaturedImageURL ? (
                          <img
                            src={leadBlog.FeaturedImageURL}
                            alt={leadBlog.Title}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#7A0A1D] to-[#C8102E] flex items-center justify-center text-white/90">
                            <Newspaper className="w-12 h-12 stroke-[1.25]" />
                          </div>
                        )}
                        {leadBlog.IsPinned && (
                          <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                            <Pin className="w-3 h-3 fill-current" />
                            Pinned · Important
                          </span>
                        )}
                      </div>

                      <div className="p-6 sm:p-7">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-neutral-500 mb-3">
                          {(leadBlog.Tags || '').split(',').filter(Boolean).slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[#C8102E] uppercase tracking-wider font-bold">
                              #{tag.trim()}
                            </span>
                          ))}
                          <span>· {formatShortDate(leadBlog.CreatedDate)}</span>
                        </div>
                        <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#141416] group-hover:text-[#C8102E] transition-colors leading-tight">
                          {leadBlog.Title}
                        </h3>
                        <p className="text-sm text-neutral-600 mt-3 leading-relaxed line-clamp-3">
                          {stripHtml(leadBlog.Content)}
                        </p>
                        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                          <span className="text-neutral-500 font-medium">
                            By {leadBlog.AuthorEmail ? leadBlog.AuthorEmail.split('@')[0] : 'Counselor Team'}
                          </span>
                          <span className="font-bold uppercase tracking-wider text-[#C8102E] inline-flex items-center gap-1">
                            Read Article
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </article>
                  )}

                  {/* Secondary Editorial Stack */}
                  <div className="lg:col-span-5 divide-y divide-neutral-200 border-t lg:border-t-0 border-neutral-200">
                    {secondaryBlogs.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-[#FAFAFA] border border-neutral-200 text-xs text-neutral-500">
                        More counselor guidance articles will appear here as they are published.
                      </div>
                    ) : (
                      secondaryBlogs.map(post => (
                        <article
                          key={post.ID}
                          onClick={() => openDetail('blog-item', post.ID)}
                          className="py-5 first:pt-0 last:pb-0 group cursor-pointer flex gap-4 items-start"
                        >
                          {post.FeaturedImageURL && (
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                              <img
                                src={post.FeaturedImageURL}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              {post.IsPinned && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#C8102E] text-white text-[9px] font-bold uppercase tracking-wider">
                                  <Pin className="w-2.5 h-2.5 fill-current" />
                                  Important
                                </span>
                              )}
                              <span className="text-[11px] text-neutral-400 font-medium">
                                {formatShortDate(post.CreatedDate)}
                              </span>
                            </div>
                            <h4 className="font-serif text-base sm:text-lg font-semibold text-[#141416] group-hover:text-[#C8102E] transition-colors leading-snug line-clamp-2">
                              {post.Title}
                            </h4>
                            <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                              {stripHtml(post.Content)}
                            </p>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 6. REFERENCE MATERIAL LIBRARY (Structured Academic Document Grid) */}
          {refs.length > 0 && (
            <section className="py-14 sm:py-16 border-b border-neutral-200 bg-[#FAFAFA]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between gap-4 mb-8">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C8102E] mb-1">
                      Templates &amp; Handbooks
                    </p>
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#141416] tracking-tight">
                      Reference Material
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('references')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C8102E] hover:text-[#880A1F] cursor-pointer shrink-0"
                  >
                    <span>Full Library</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {refs.slice(0, 6).map(refItem => (
                    <article
                      key={refItem.ID}
                      onClick={() => openDetail('reference-item', refItem.ID)}
                      className={`bg-white rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer flex items-start gap-4 group ${
                        refItem.IsPinned
                          ? 'border-neutral-200 border-l-4 border-l-[#C8102E]'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-red-50 text-[#C8102E] border border-red-100 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          {refItem.IsPinned && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#C8102E] text-white text-[9px] font-bold uppercase tracking-wider">
                              <Pin className="w-2.5 h-2.5 fill-current" />
                              Important
                            </span>
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8102E]">
                            {refItem.Category || 'Reference'}
                          </span>
                        </div>
                        <h3 className="font-serif text-lg font-semibold text-[#141416] group-hover:text-[#C8102E] transition-colors leading-snug line-clamp-1">
                          {refItem.Title}
                        </h3>
                        {refItem.Description && (
                          <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                            {refItem.Description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-3 text-[11px] text-neutral-500">
                          <span>By {refItem.Author || 'Counselor Team'}</span>
                          {refItem.PDFLink && (
                            <span className="text-[#C8102E] font-semibold inline-flex items-center gap-1">
                              <FileDown className="w-3 h-3" /> PDF
                            </span>
                          )}
                          {refItem.YouTubeURL && (
                            <span className="text-neutral-700 font-semibold inline-flex items-center gap-1">
                              <PlayCircle className="w-3 h-3" /> Video
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#C8102E] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 7. CAREER LABORATORY ARCHIVE */}
          {labs.length > 0 && (
            <section className="py-14 sm:py-16 border-b border-neutral-200 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between gap-4 mb-8">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C8102E] mb-1">
                      Student Research
                    </p>
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#141416] tracking-tight">
                      Career Laboratory Archive
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('career-lab')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C8102E] hover:text-[#880A1F] cursor-pointer shrink-0"
                  >
                    <span>Explore Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {labs.slice(0, 6).map(lab => (
                    <article
                      key={lab.ID}
                      onClick={() => openDetail('lab-item', lab.ID)}
                      className={`bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group ${
                        lab.IsPinned
                          ? 'border-[#C8102E]/45 ring-1 ring-[#C8102E]/15'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div>
                        <div className="aspect-[16/10] bg-neutral-100 relative overflow-hidden border-b border-neutral-100">
                          {lab.ThumbnailURL ? (
                            <img
                              src={lab.ThumbnailURL}
                              alt={lab.Title}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#6E091A] to-[#A80D27] flex items-center justify-center text-white/90">
                              <FlaskConical className="w-10 h-10 stroke-[1.5]" />
                            </div>
                          )}
                          {lab.IsPinned && (
                            <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                              <Pin className="w-2.5 h-2.5 fill-current" />
                              Important
                            </span>
                          )}
                        </div>
                        <div className="p-5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8102E]">
                            {lab.Category || 'Research'}
                          </span>
                          <h3 className="font-serif text-lg font-semibold text-[#141416] group-hover:text-[#C8102E] transition-colors mt-1.5 leading-snug line-clamp-2">
                            {lab.Title}
                          </h3>
                          {lab.Description && (
                            <p className="text-xs text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                              {lab.Description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="px-5 py-3.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 gap-2">
                        <span className="truncate font-semibold text-[#141416]">{lab.Student}</span>
                        {lab.Mentor && <span className="truncate text-[11px]">Mentor: {lab.Mentor}</span>}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 8. MEET YOUR CAREER COUNSELLORS */}
          {counselors.length > 0 && (
            <section className="py-14 sm:py-16 bg-[#FAFAFA]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between gap-4 mb-8">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C8102E] mb-1">
                      Advisory Department
                    </p>
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#141416] tracking-tight">
                      Meet Your Career Counsellors
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('counselors')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C8102E] hover:text-[#880A1F] cursor-pointer shrink-0"
                  >
                    <span>Full Directory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {counselors.slice(0, 4).map(c => (
                    <div
                      key={c.ID}
                      className="bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
                    >
                      <div>
                        <div className="aspect-[4/3] bg-neutral-100 overflow-hidden border-b border-neutral-100">
                          {c.ImageURL ? (
                            <img
                              src={c.ImageURL}
                              alt={c.Name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-red-50 text-[#C8102E]">
                              <User className="w-10 h-10 stroke-[1.3]" />
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-serif text-lg font-semibold text-[#141416] leading-snug">
                            {c.Name}
                          </h3>
                          {c.Qualifications && (
                            <p className="text-[11px] font-semibold text-[#C8102E] mt-1 inline-flex items-center gap-1">
                              <Award className="w-3 h-3 shrink-0" />
                              <span className="line-clamp-1">{c.Qualifications}</span>
                            </p>
                          )}
                          {c.Intro && (
                            <p className="text-xs text-neutral-600 mt-2.5 line-clamp-3 leading-relaxed">
                              {c.Intro}
                            </p>
                          )}
                        </div>
                      </div>
                      {c.Contact && (
                        <div className="px-5 pb-5">
                          <a
                            href={`mailto:${c.Contact}`}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#C8102E] hover:bg-[#9E0B24] text-white text-xs font-semibold transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email Counsellor</span>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
