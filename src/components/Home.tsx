/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ArrowRight,
  ArrowUpRight,
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
  X,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

type ExplorerTab = 'labs' | 'courses' | 'blogs' | 'refs';

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

  const [activeFeedTab, setActiveFeedTab] = useState<ExplorerTab>('labs');
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

      // Default the explorer tab to the first non-empty section, prioritizing Career Lab
      if (lList.length > 0) setActiveFeedTab('labs');
      else if (cList.length > 0) setActiveFeedTab('courses');
      else if (bList.length > 0) setActiveFeedTab('blogs');
      else if (rList.length > 0) setActiveFeedTab('refs');
    } catch (err) {
      console.error("Failed to fetch homepage data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const handlePinsUpdated = () => loadAllData();
    window.addEventListener('pins-updated', handlePinsUpdated);
    return () => window.removeEventListener('pins-updated', handlePinsUpdated);
  }, []);

  // All Admin-pinned Important Notices across Career Lab
  const pinnedNotices = useMemo<PinnedNotice[]>(() => {
    const items: PinnedNotice[] = [];

    labs.filter(l => l.IsPinned).forEach(l => {
      items.push({
        id: l.ID,
        title: l.Title,
        summary: l.Description || stripHtml(l.Content).slice(0, 140),
        meta: l.Student ? `By ${l.Student}` : l.Category,
        date: l.UpdatedDate || l.CreatedDate,
        type: 'lab-item',
        typeLabel: 'Career Lab'
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

    blogs.filter(b => b.IsPinned).forEach(b => {
      items.push({
        id: b.ID,
        title: b.Title,
        summary: stripHtml(b.Content).slice(0, 140),
        meta: b.AuthorEmail ? `By ${b.AuthorEmail.split('@')[0]}` : 'Career Lab Story',
        date: b.UpdatedDate || b.CreatedDate,
        type: 'blog-item',
        typeLabel: 'Story'
      });
    });

    refs.filter(r => r.IsPinned).forEach(r => {
      items.push({
        id: r.ID,
        title: r.Title,
        summary: r.Description || stripHtml(r.Content).slice(0, 140),
        meta: r.Category || r.Author || 'Resource',
        date: r.UpdatedDate || r.CreatedDate,
        type: 'reference-item',
        typeLabel: 'Resource'
      });
    });

    return items.sort((a, b) => {
      const tA = a.date ? new Date(a.date).getTime() : 0;
      const tB = b.date ? new Date(b.date).getTime() : 0;
      return tB - tA;
    });
  }, [courses, blogs, refs, labs]);

  // Live hero autocomplete
  const searchHits = useMemo<SearchHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const results: SearchHit[] = [];

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
          subtitle: [l.Student, l.Category].filter(Boolean).join(' · '),
          type: 'lab-item',
          typeLabel: 'Lab',
          isPinned: l.IsPinned
        });
      }
    });

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
          subtitle: b.Tags ? b.Tags.split(',').slice(0, 2).map(t => `#${t.trim()}`).join(' ') : 'Story',
          type: 'blog-item',
          typeLabel: 'Story',
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
          typeLabel: 'Resource',
          isPinned: r.IsPinned
        });
      }
    });

    return results
      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
      .slice(0, 6);
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

  const feedTabs: { id: ExplorerTab; label: string; count: number; targetPage: string }[] = [
    { id: 'labs', label: 'Career Lab', count: labs.length, targetPage: 'career-lab' },
    { id: 'courses', label: 'Courses', count: courses.length, targetPage: 'courses' },
    { id: 'blogs', label: 'Stories', count: blogs.length, targetPage: 'blog' },
    { id: 'refs', label: 'Resources', count: refs.length, targetPage: 'references' }
  ];

  const activeTabMeta = feedTabs.find(t => t.id === activeFeedTab) || feedTabs[0];

  return (
    <div className="bg-white text-[#111114] text-left">
      {/* 1. MODERN ASYMMETRIC BENTO HERO (Pure White Canvas + Sculptural Crimson Studio Card) */}
      <section className="relative overflow-hidden border-b border-neutral-200/80">
        <div className="absolute inset-0 bg-lab-dots opacity-55 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-red-100/50 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-16 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Typography & Interactive Search Column */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-[#C8102E] text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#C8102E] animate-pulse" />
                <span>Silver Oaks Career Lab</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.75rem] font-bold tracking-[-0.03em] leading-[1.03] text-[#111114]">
                Explore careers.{' '}
                <span className="text-[#C8102E]">Build real work.</span>
              </h1>

              <p className="text-neutral-600 text-base sm:text-lg max-w-xl leading-relaxed">
                Your space at Silver Oaks to discover student lab projects, take hands-on career workshops, grab ready-to-use templates, and connect with mentors.
              </p>

              {/* Elevated Interactive Search Bar */}
              <div className="relative max-w-xl">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center bg-white rounded-2xl p-1.5 border border-neutral-200 shadow-[0_8px_30px_rgba(17,17,20,0.06)] focus-within:border-[#C8102E] focus-within:ring-4 focus-within:ring-red-100 transition-all"
                >
                  <Search className="w-4 h-4 text-[#C8102E] ml-3.5 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                    placeholder="Search projects, workshops, CV templates..."
                    className="w-full py-2.5 text-sm font-medium text-[#111114] placeholder:text-neutral-400 focus:outline-none bg-transparent"
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
                    className="px-5 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    Search
                  </button>
                </form>

                {/* Instant Autocomplete */}
                {searchFocused && query.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden z-40">
                    {searchHits.length === 0 ? (
                      <div className="px-4 py-5 text-xs text-neutral-500 text-center">
                        No quick matches for &ldquo;{query}&rdquo;. Press Search to inspect everything.
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-100">
                        {searchHits.map(hit => (
                          <button
                            key={`${hit.type}-${hit.id}`}
                            type="button"
                            onMouseDown={() => openDetail(hit.type, hit.id)}
                            className="w-full px-4 py-3 hover:bg-red-50/60 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                {hit.isPinned && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#C8102E] text-white text-[9px] font-bold uppercase shrink-0">
                                    <Pin className="w-2.5 h-2.5 fill-current" />
                                    Important
                                  </span>
                                )}
                                <p className="text-sm font-semibold text-[#111114] truncate">{hit.title}</p>
                              </div>
                              {hit.subtitle && (
                                <p className="text-xs text-neutral-500 truncate mt-0.5">{hit.subtitle}</p>
                              )}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-50 text-[#C8102E] shrink-0">
                              {hit.typeLabel}
                            </span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onMouseDown={handleSearchSubmit}
                          className="w-full px-4 py-3 bg-[#FAFAFA] hover:bg-red-50 text-xs font-bold text-[#C8102E] flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>See all results for &ldquo;{query}&rdquo;</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage('career-lab')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C8102E] hover:bg-[#9E0B24] text-white text-sm font-bold shadow-[0_10px_25px_-8px_rgba(200,16,46,0.55)] transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>Open Career Lab</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage('courses')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-red-50 text-[#111114] hover:text-[#C8102E] border border-neutral-200 hover:border-red-200 text-sm font-semibold transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#C8102E]" />
                  <span>Browse Courses</span>
                </button>
              </div>
            </motion.div>

            {/* Right Column: Sculptural Crimson Studio Card */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="lg:col-span-5"
            >
              <div className="relative rounded-[28px] bg-gradient-to-br from-[#D41132] via-[#A30B25] to-[#650616] text-white p-6 sm:p-7 shadow-[0_24px_64px_-16px_rgba(163,11,37,0.45)] overflow-hidden">
                <div className="absolute inset-0 bg-lab-dots-white opacity-35 pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/15 blur-2xl pointer-events-none" />

                <div className="relative z-10">
                  {pinnedNotices.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-white/15">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-xl bg-white text-[#C8102E] flex items-center justify-center shadow-sm">
                            <Pin className="w-4 h-4 fill-current" />
                          </span>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-200">
                              Pinned for Students
                            </p>
                            <h2 className="font-display font-bold text-base text-white leading-tight">
                              Important Updates
                            </h2>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-white/15 text-white border border-white/20">
                          {pinnedNotices.length}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {pinnedNotices.slice(0, 3).map(notice => (
                          <button
                            key={`${notice.type}-${notice.id}`}
                            type="button"
                            onClick={() => openDetail(notice.type, notice.id)}
                            className="w-full p-3.5 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-[#111114] border border-white/15 hover:border-white transition-all text-left group cursor-pointer flex items-start justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/20 group-hover:bg-red-50 group-hover:text-[#C8102E]">
                                  {notice.typeLabel}
                                </span>
                                {notice.date && (
                                  <span className="text-[11px] text-red-100 group-hover:text-neutral-400">
                                    {formatShortDate(notice.date)}
                                  </span>
                                )}
                              </div>
                              <p className="font-display font-semibold text-sm leading-snug line-clamp-2">
                                {notice.title}
                              </p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 shrink-0 mt-1 text-red-200 group-hover:text-[#C8102E] transition-colors" />
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-200">
                            Live inside the lab
                          </p>
                          <h2 className="font-display text-xl font-bold text-white mt-0.5">
                            Career Lab Snapshot
                          </h2>
                        </div>
                        <Sparkles className="w-5 h-5 text-red-200" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Lab Projects', count: labs.length, page: 'career-lab', icon: FlaskConical },
                          { label: 'Courses', count: courses.length, page: 'courses', icon: BookOpen },
                          { label: 'Stories', count: blogs.length, page: 'blog', icon: Newspaper },
                          { label: 'Resources', count: refs.length, page: 'references', icon: FileText }
                        ].map(stat => {
                          const Icon = stat.icon;
                          return (
                            <button
                              key={stat.page}
                              type="button"
                              onClick={() => setCurrentPage(stat.page)}
                              className="p-4 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-[#111114] border border-white/15 hover:border-white transition-all text-left group cursor-pointer"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <Icon className="w-4 h-4 text-red-200 group-hover:text-[#C8102E]" />
                                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:text-[#C8102E]" />
                              </div>
                              <div className="font-display text-3xl font-bold leading-none">
                                {loading ? '—' : stat.count}
                              </div>
                              <div className="text-xs font-semibold text-red-100 group-hover:text-neutral-600 mt-1.5">
                                {stat.label}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Quick Campus Counsellors CTA inside card footer */}
                  <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between gap-2">
                    <span className="text-xs text-red-100 font-medium">
                      Need 1-on-1 career advice?
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage('counselors')}
                      className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-red-200 cursor-pointer"
                    >
                      <span>Meet Counsellors</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. PINNED IMPORTANT STUDENT NOTICES STRIP (Only visible when Admins pin posts) */}
      {pinnedNotices.length > 0 && (
        <section className="bg-[#FFF7F8] border-b border-red-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#C8102E] text-white flex items-center justify-center">
                  <Pin className="w-3.5 h-3.5 fill-current" />
                </span>
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-[#111114] leading-tight">
                    Pinned · Important for Students
                  </h2>
                </div>
              </div>
              <span className="text-xs font-medium text-neutral-500">
                Highlighted by Career Lab Counsellors
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedNotices.map(notice => (
                <article
                  key={`strip-${notice.type}-${notice.id}`}
                  onClick={() => openDetail(notice.type, notice.id)}
                  className="bg-white rounded-2xl border border-red-200/80 border-l-4 border-l-[#C8102E] p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-wider">
                        <Pin className="w-2.5 h-2.5 fill-current" />
                        {notice.typeLabel}
                      </span>
                      {notice.date && (
                        <span className="text-[11px] font-medium text-neutral-400">
                          {formatShortDate(notice.date)}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#111114] group-hover:text-[#C8102E] transition-colors leading-snug line-clamp-2">
                      {notice.title}
                    </h3>
                    {notice.summary && (
                      <p className="text-xs text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                        {notice.summary}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 truncate">{notice.meta}</span>
                    <span className="font-bold text-[#C8102E] inline-flex items-center gap-1 shrink-0">
                      Open <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. INTERACTIVE LAB EXPLORER (Tabbed Bento Showcase — Fast & Zero Endless Scrolling) */}
      <section className="py-14 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C8102E] mb-1.5">
                Discover
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#111114] tracking-tight">
                Explore Silver Oaks Career Lab
              </h2>
            </div>

            {/* Segmented Tab Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
              <div className="inline-flex items-center bg-neutral-100 p-1 rounded-full border border-neutral-200/70">
                {feedTabs.map(tab => {
                  const active = activeFeedTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveFeedTab(tab.id)}
                      className={`relative px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                        active ? 'text-white' : 'text-neutral-600 hover:text-[#111114]'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="homeExplorerTab"
                          transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                          className="absolute inset-0 bg-[#C8102E] rounded-full shadow-xs"
                        />
                      )}
                      <span className="relative z-10">{tab.label}</span>
                      <span className={`relative z-10 font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                        active ? 'bg-white/20 text-white' : 'bg-white text-neutral-500'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage(activeTabMeta.targetPage)}
                className="hidden sm:inline-flex items-center gap-1 px-4 py-2.5 rounded-full text-xs font-bold text-[#C8102E] hover:bg-red-50 transition-colors cursor-pointer shrink-0"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="spinner" />
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mt-3">
                Loading Career Lab...
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* TAB 1: CAREER LAB BENTO SHOWCASE */}
              {activeFeedTab === 'labs' && (
                <motion.div
                  key="tab-labs"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {labs.length === 0 ? (
                    <EmptySectionNotice label="Career Lab projects" />
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Lead Feature Lab Project */}
                      {labs[0] && (
                        <article
                          onClick={() => openDetail('lab-item', labs[0].ID)}
                          className={`lg:col-span-7 rounded-3xl overflow-hidden border bg-white hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between ${
                            labs[0].IsPinned ? 'border-[#C8102E] ring-2 ring-[#C8102E]/15' : 'border-neutral-200'
                          }`}
                        >
                          <div className="aspect-[16/10] bg-neutral-100 relative overflow-hidden">
                            {labs[0].ThumbnailURL ? (
                              <img
                                src={labs[0].ThumbnailURL}
                                alt={labs[0].Title}
                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#6B0718] to-[#C8102E] flex items-center justify-center text-white/90">
                                <FlaskConical className="w-14 h-14 stroke-[1.3]" />
                              </div>
                            )}
                            <div className="absolute top-4 left-4 flex items-center gap-2">
                              {labs[0].IsPinned && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                  <Pin className="w-2.5 h-2.5 fill-current" /> Important
                                </span>
                              )}
                              <span className="px-3 py-1 rounded-full bg-white/95 text-[#111114] text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                {labs[0].Category || 'Lab Project'}
                              </span>
                            </div>
                          </div>
                          <div className="p-6 sm:p-7">
                            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#111114] group-hover:text-[#C8102E] transition-colors leading-tight">
                              {labs[0].Title}
                            </h3>
                            {labs[0].Description && (
                              <p className="text-sm text-neutral-600 mt-2.5 line-clamp-2 leading-relaxed">
                                {labs[0].Description}
                              </p>
                            )}
                            <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                              <span className="font-bold text-[#111114]">
                                {labs[0].Student}
                                {labs[0].Mentor && <span className="font-medium text-neutral-500"> · Mentor: {labs[0].Mentor}</span>}
                              </span>
                              <span className="font-bold text-[#C8102E] inline-flex items-center gap-1">
                                Explore <ArrowUpRight className="w-4 h-4" />
                              </span>
                            </div>
                          </div>
                        </article>
                      )}

                      {/* Side Stacked Lab Cards */}
                      <div className="lg:col-span-5 flex flex-col gap-5">
                        {labs.slice(1, 4).map(lab => (
                          <article
                            key={lab.ID}
                            onClick={() => openDetail('lab-item', lab.ID)}
                            className={`flex-1 bg-white rounded-3xl border p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex gap-4 items-center group ${
                              lab.IsPinned ? 'border-[#C8102E]/60 bg-red-50/20' : 'border-neutral-200'
                            }`}
                          >
                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-100">
                              {lab.ThumbnailURL ? (
                                <img
                                  src={lab.ThumbnailURL}
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#8F0B22] to-[#C8102E] flex items-center justify-center text-white">
                                  <FlaskConical className="w-7 h-7 stroke-[1.5]" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center flex-wrap gap-1.5 mb-1">
                                {lab.IsPinned && (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#C8102E] text-white text-[9px] font-bold uppercase">
                                    <Pin className="w-2.5 h-2.5 fill-current" /> Important
                                  </span>
                                )}
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8102E]">
                                  {lab.Category || 'Lab'}
                                </span>
                              </div>
                              <h4 className="font-display font-bold text-base text-[#111114] group-hover:text-[#C8102E] transition-colors line-clamp-2 leading-snug">
                                {lab.Title}
                              </h4>
                              <p className="text-xs text-neutral-500 mt-1 truncate font-medium">
                                {lab.Student}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#C8102E] group-hover:translate-x-0.5 transition-all shrink-0" />
                          </article>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 2: COURSES */}
              {activeFeedTab === 'courses' && (
                <motion.div
                  key="tab-courses"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {courses.length === 0 ? (
                    <EmptySectionNotice label="courses" />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {courses.slice(0, 6).map(course => (
                        <article
                          key={course.ID}
                          onClick={() => openDetail('course', course.ID)}
                          className={`bg-white rounded-3xl border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group ${
                            course.IsPinned ? 'border-[#C8102E] ring-2 ring-[#C8102E]/15' : 'border-neutral-200'
                          }`}
                        >
                          <div>
                            <div className="aspect-[16/10] bg-neutral-100 relative overflow-hidden">
                              {course.ThumbnailURL ? (
                                <img
                                  src={course.ThumbnailURL}
                                  alt={course.Title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#8F0B22] to-[#C8102E] flex items-center justify-center text-white">
                                  <BookOpen className="w-10 h-10 stroke-[1.4]" />
                                </div>
                              )}
                              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                                {course.IsPinned && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                                    <Pin className="w-2.5 h-2.5 fill-current" /> Important
                                  </span>
                                )}
                                {course.Grade && (
                                  <span className="px-2.5 py-1 rounded-full bg-white/95 text-[#111114] text-[10px] font-bold uppercase tracking-wider shadow-xs">
                                    {course.Grade}
                                  </span>
                                )}
                              </div>
                              {course.YouTubeURL && (
                                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 text-white text-[10px] font-semibold">
                                  <PlayCircle className="w-3 h-3" /> Video
                                </span>
                              )}
                            </div>
                            <div className="p-5">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8102E]">
                                {course.Category || 'Workshop'}
                              </span>
                              <h3 className="font-display text-lg font-bold text-[#111114] group-hover:text-[#C8102E] transition-colors mt-1 line-clamp-2 leading-snug">
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
                            <span className="truncate font-semibold text-neutral-700">{course.Instructor || 'Career Lab Faculty'}</span>
                            {course.PDFLink && (
                              <span className="inline-flex items-center gap-1 text-[#C8102E] font-bold shrink-0">
                                <FileDown className="w-3.5 h-3.5" /> PDF
                              </span>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 3: STORIES / BLOG */}
              {activeFeedTab === 'blogs' && (
                <motion.div
                  key="tab-blogs"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {blogs.length === 0 ? (
                    <EmptySectionNotice label="stories" />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {blogs.slice(0, 6).map(post => (
                        <article
                          key={post.ID}
                          onClick={() => openDetail('blog-item', post.ID)}
                          className={`bg-white rounded-3xl border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group ${
                            post.IsPinned ? 'border-[#C8102E] ring-2 ring-[#C8102E]/15' : 'border-neutral-200'
                          }`}
                        >
                          <div>
                            <div className="aspect-[16/10] bg-neutral-100 relative overflow-hidden">
                              {post.FeaturedImageURL ? (
                                <img
                                  src={post.FeaturedImageURL}
                                  alt={post.Title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#7A0A1D] to-[#C8102E] flex items-center justify-center text-white">
                                  <Newspaper className="w-10 h-10 stroke-[1.4]" />
                                </div>
                              )}
                              {post.IsPinned && (
                                <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                                  <Pin className="w-2.5 h-2.5 fill-current" /> Important
                                </span>
                              )}
                            </div>
                            <div className="p-5">
                              <div className="flex items-center gap-2 text-[11px] mb-1.5">
                                {(post.Tags || '').split(',').filter(Boolean).slice(0, 2).map((t, i) => (
                                  <span key={i} className="font-bold uppercase tracking-wider text-[#C8102E]">
                                    #{t.trim()}
                                  </span>
                                ))}
                                <span className="text-neutral-400">{formatShortDate(post.CreatedDate)}</span>
                              </div>
                              <h3 className="font-display text-lg font-bold text-[#111114] group-hover:text-[#C8102E] transition-colors line-clamp-2 leading-snug">
                                {post.Title}
                              </h3>
                              <p className="text-xs text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                                {stripHtml(post.Content)}
                              </p>
                            </div>
                          </div>
                          <div className="px-5 py-3.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                            <span className="truncate font-medium">{post.AuthorEmail ? post.AuthorEmail.split('@')[0] : 'Career Lab'}</span>
                            <span className="font-bold text-[#C8102E] inline-flex items-center gap-1">
                              Read <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 4: RESOURCES */}
              {activeFeedTab === 'refs' && (
                <motion.div
                  key="tab-refs"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {refs.length === 0 ? (
                    <EmptySectionNotice label="resources" />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {refs.slice(0, 6).map(refItem => (
                        <article
                          key={refItem.ID}
                          onClick={() => openDetail('reference-item', refItem.ID)}
                          className={`bg-white rounded-3xl border p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group ${
                            refItem.IsPinned ? 'border-[#C8102E] ring-2 ring-[#C8102E]/15' : 'border-neutral-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-4">
                              <span className="w-11 h-11 rounded-2xl bg-red-50 text-[#C8102E] border border-red-100 flex items-center justify-center group-hover:bg-[#C8102E] group-hover:text-white transition-colors">
                                <FileText className="w-5 h-5" />
                              </span>
                              <div className="flex items-center gap-1.5">
                                {refItem.IsPinned && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C8102E] text-white text-[10px] font-bold uppercase">
                                    <Pin className="w-2.5 h-2.5 fill-current" /> Important
                                  </span>
                                )}
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700">
                                  {refItem.Category || 'Template'}
                                </span>
                              </div>
                            </div>
                            <h3 className="font-display text-lg font-bold text-[#111114] group-hover:text-[#C8102E] transition-colors line-clamp-2 leading-snug">
                              {refItem.Title}
                            </h3>
                            {refItem.Description && (
                              <p className="text-xs text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                                {refItem.Description}
                              </p>
                            )}
                          </div>
                          <div className="mt-5 pt-3.5 border-t border-neutral-100 flex items-center justify-between text-xs">
                            <span className="text-neutral-500 truncate">{refItem.Author || 'Career Lab'}</span>
                            <span className="font-bold text-[#C8102E] inline-flex items-center gap-1 shrink-0">
                              {refItem.PDFLink ? 'Open PDF' : 'View'} <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Mobile "View All" button for active tab */}
          <div className="mt-6 sm:hidden">
            <button
              type="button"
              onClick={() => setCurrentPage(activeTabMeta.targetPage)}
              className="w-full py-3 rounded-2xl bg-red-50 text-[#C8102E] font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Explore all {activeTabMeta.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. ASYMMETRIC SPLIT: LATEST STORIES + QUICK TEMPLATES & RESOURCES */}
      {!loading && (blogs.length > 0 || refs.length > 0) && (
        <section className="py-14 sm:py-16 bg-[#FAFAFA] border-y border-neutral-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              {/* Left 7 cols: Latest Stories */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C8102E] mb-1">
                      Stories &amp; Insights
                    </p>
                    <h2 className="font-display text-2xl font-bold text-[#111114]">
                      Latest from Career Lab
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('blog')}
                    className="text-xs font-bold text-[#C8102E] hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    All Stories <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {blogs.slice(0, 4).map(post => (
                    <article
                      key={`split-blog-${post.ID}`}
                      onClick={() => openDetail('blog-item', post.ID)}
                      className={`bg-white rounded-2xl border p-4 sm:p-5 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group ${
                        post.IsPinned ? 'border-[#C8102E]/45 border-l-4 border-l-[#C8102E]' : 'border-neutral-200'
                      }`}
                    >
                      {post.FeaturedImageURL && (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
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
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-[#C8102E] text-white text-[9px] font-bold uppercase">
                              <Pin className="w-2.5 h-2.5 fill-current" /> Important
                            </span>
                          )}
                          <span className="text-[11px] text-neutral-400 font-medium">
                            {formatShortDate(post.CreatedDate)}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-base text-[#111114] group-hover:text-[#C8102E] transition-colors line-clamp-1">
                          {post.Title}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                          {stripHtml(post.Content)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#C8102E] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </article>
                  ))}
                </div>
              </div>

              {/* Right 5 cols: Quick-Grab Templates & Guides */}
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C8102E] mb-1">
                      Toolkit
                    </p>
                    <h2 className="font-display text-2xl font-bold text-[#111114]">
                      Quick Templates
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('references')}
                    className="text-xs font-bold text-[#C8102E] hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    All Resources <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white rounded-3xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
                  {refs.slice(0, 5).map(r => (
                    <button
                      key={`quick-ref-${r.ID}`}
                      type="button"
                      onClick={() => openDetail('reference-item', r.ID)}
                      className="w-full p-4 sm:p-4.5 hover:bg-red-50/50 transition-colors text-left flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-xl bg-red-50 text-[#C8102E] flex items-center justify-center shrink-0 group-hover:bg-[#C8102E] group-hover:text-white transition-colors">
                          <FileText className="w-4 h-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {r.IsPinned && (
                              <Pin className="w-3 h-3 text-[#C8102E] fill-current shrink-0" />
                            )}
                            <p className="font-semibold text-sm text-[#111114] group-hover:text-[#C8102E] truncate">
                              {r.Title}
                            </p>
                          </div>
                          <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                            {r.Category || 'Template'} {r.PDFLink ? '· PDF Ready' : ''}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover:text-[#C8102E] shrink-0" />
                    </button>
                  ))}
                  {refs.length === 0 && (
                    <div className="p-8 text-center text-xs text-neutral-400">
                      Templates will appear here once published.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. MEET YOUR COUNSELLORS */}
      {!loading && counselors.length > 0 && (
        <section className="py-14 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C8102E] mb-1">
                  Mentors
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#111114] tracking-tight">
                  Your Career Counsellors
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage('counselors')}
                className="text-xs font-bold text-[#C8102E] hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                Meet Everyone <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {counselors.slice(0, 4).map(c => (
                <div
                  key={c.ID}
                  className="bg-[#FAFAFA] hover:bg-white rounded-3xl border border-neutral-200 hover:border-red-200 hover:shadow-lg p-5 flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-red-50 ring-2 ring-red-100 shrink-0">
                        {c.ImageURL ? (
                          <img
                            src={c.ImageURL}
                            alt={c.Name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#C8102E]">
                            <User className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-base text-[#111114] truncate">
                          {c.Name}
                        </h3>
                        {c.Qualifications && (
                          <p className="text-[11px] font-semibold text-[#C8102E] line-clamp-1 flex items-center gap-1 mt-0.5">
                            <Award className="w-3 h-3 shrink-0" />
                            <span>{c.Qualifications}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    {c.Intro && (
                      <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                        {c.Intro}
                      </p>
                    )}
                  </div>
                  {c.Contact && (
                    <a
                      href={`mailto:${c.Contact}`}
                      className="mt-5 w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white group-hover:bg-[#C8102E] text-[#111114] group-hover:text-white border border-neutral-200 group-hover:border-[#C8102E] text-xs font-bold transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Counsellor</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function EmptySectionNotice({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-200 bg-[#FAFAFA] py-14 px-6 text-center">
      <p className="font-display font-semibold text-base text-[#111114]">
        No {label} published yet
      </p>
      <p className="text-xs text-neutral-500 mt-1">
        New Career Lab content will show up here automatically.
      </p>
    </div>
  );
}
