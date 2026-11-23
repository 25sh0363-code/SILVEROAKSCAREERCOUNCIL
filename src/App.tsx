/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertCircle,
  CheckCircle,
  Search,
  ArrowRight,
  RefreshCw,
  Lock,
  Pin,
  FileSearch,
  FlaskConical,
  BookOpen,
  FileText,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';

import { AppUser } from './types';
import {
  isAllowedEmail,
  ensureUser,
  fetchAllCourses,
  fetchAllBlogs,
  fetchAllReferences,
  fetchAllCareerLabs
} from './lib/supabase';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Courses from './components/Courses';
import Blog from './components/Blog';
import References from './components/References';
import CareerLabs from './components/CareerLabs';
import Staff from './components/Staff';
import ItemDetail from './components/ItemDetail';
import Counsellors from './components/Counsellors';
import CommandSearch from './components/CommandSearch';
import Logo from './components/Logo';

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedId, setSelectedId] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Standalone Global Search Page state
  const [searchQuery, setSearchQuery] = useState('');
  const [globalResults, setGlobalResults] = useState<{
    courses: any[];
    blogs: any[];
    references: any[];
    labs: any[];
  }>({ courses: [], blogs: [], references: [], labs: [] });

  // Notifications Toast State
  const [toasts, setToasts] = useState<{ id: string; msg: string; type: 'success' | 'err' }[]>([]);

  // Supabase error status state
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  useEffect(() => {
    const handleDbError = (e: any) => {
      setSupabaseError(e.detail || "Connection failed");
    };
    window.addEventListener('supabase-error', handleDbError);
    return () => window.removeEventListener('supabase-error', handleDbError);
  }, []);

  // Global Cmd+K / Ctrl+K shortcut for Command Search
  useEffect(() => {
    if (!user) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  // Smooth scroll to top on view switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedId]);

  const addToast = (msg: string, type: 'success' | 'err' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Restore session credentials
  useEffect(() => {
    const storedUser = sessionStorage.getItem('c_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse cached session:", err);
      }
    }
  }, []);

  // Initialize Google Identity Sign-In button
  useEffect(() => {
    if (user) return;

    function initGoogleGSI() {
      const google = (window as any).google;
      if (google && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
          client_id: "392344488331-qt8b726lvhbldl9bptpj58bagj8qq2af.apps.googleusercontent.com",
          callback: handleGoogleCredential,
          auto_select: false,
        });

        const container = document.getElementById("g_login_btn");
        if (container) {
          google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            shape: "pill",
            width: Math.min(310, Math.max(240, window.innerWidth - 96))
          });
        }
      } else {
        setTimeout(initGoogleGSI, 400);
      }
    }

    initGoogleGSI();
  }, [user]);

  const handleGoogleCredential = async (response: any) => {
    setLoading(true);
    try {
      const token = response.credential;
      const payload = parseJWT(token);
      if (!payload) {
        throw new Error("Decoding JWT failed.");
      }

      const email = String(payload.email || '').toLowerCase().trim();
      if (!payload.email_verified) {
        throw new Error("Google account email address is not verified.");
      }

      if (!isAllowedEmail(email)) {
        throw new Error("Access Denied: Only @hyd.silveroaks.co.in, @bt.silveroaks.co.in, @odl.silveroaks.co.in, @vizag.silveroaks.co.in, and @km.silveroaks.co.in domains are permitted access.");
      }

      const verifiedName = payload.name || email.split('@')[0];
      const verifiedDbUser = await ensureUser(email, verifiedName);

      const loggedUser: AppUser = {
        email: email,
        name: verifiedDbUser.Name || verifiedName,
        role: verifiedDbUser.Role || 'Student',
        isAdmin: verifiedDbUser.Role === 'Admin' || verifiedDbUser.Role === 'Editor'
      };

      setUser(loggedUser);
      sessionStorage.setItem('c_user', JSON.stringify(loggedUser));
      addToast(`Welcome to Silver Oaks Career Lab, ${loggedUser.name}!`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Verification failed. Please try signing in again.', 'err');
    } finally {
      setLoading(false);
    }
  };

  const parseJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('c_user');
    addToast("Signed out of Career Lab.", "success");
    const google = (window as any).google;
    if (google && google.accounts && google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
  };

  // Global search page loader
  useEffect(() => {
    if (!currentPage.startsWith('search')) return;

    try {
      const q = decodeURIComponent(currentPage.split('q=')[1] || '');
      setSearchQuery(q);
      setLoading(true);

      const qTerm = q.toLowerCase().trim();
      Promise.all([
        fetchAllCourses(true),
        fetchAllBlogs(true),
        fetchAllReferences(true),
        fetchAllCareerLabs(true)
      ]).then(([cList, bList, rList, lList]) => {
        const cMatch = cList.filter(c => c.Title.toLowerCase().includes(qTerm) || c.Description.toLowerCase().includes(qTerm) || c.Category.toLowerCase().includes(qTerm));
        const bMatch = bList.filter(b => b.Title.toLowerCase().includes(qTerm) || b.Content.toLowerCase().includes(qTerm) || (b.Tags && b.Tags.toLowerCase().includes(qTerm)));
        const rMatch = rList.filter(r => r.Title.toLowerCase().includes(qTerm) || r.Description.toLowerCase().includes(qTerm) || r.Category.toLowerCase().includes(qTerm));
        const lMatch = lList.filter(l => l.Title.toLowerCase().includes(qTerm) || l.Description.toLowerCase().includes(qTerm) || l.Student.toLowerCase().includes(qTerm));

        setGlobalResults({
          courses: cMatch,
          blogs: bMatch,
          references: rMatch,
          labs: lMatch
        });
      }).catch(err => {
        console.error("Global search failed:", err);
      }).finally(() => {
        setLoading(false);
      });
    } catch (err) {
      console.error("Error parsing search params:", err);
    }
  }, [currentPage]);

  const renderCurrentPage = () => {
    if (currentPage === 'course') {
      return (
        <ItemDetail
          type="course"
          id={selectedId}
          user={user}
          onBack={() => setCurrentPage('courses')}
          setCurrentPage={setCurrentPage}
          setSelectedId={setSelectedId}
          onNotify={addToast}
        />
      );
    }
    if (currentPage === 'blog-item') {
      return (
        <ItemDetail
          type="blog-item"
          id={selectedId}
          user={user}
          onBack={() => setCurrentPage('blog')}
          setCurrentPage={setCurrentPage}
          setSelectedId={setSelectedId}
          onNotify={addToast}
        />
      );
    }
    if (currentPage === 'reference-item') {
      return (
        <ItemDetail
          type="reference-item"
          id={selectedId}
          user={user}
          onBack={() => setCurrentPage('references')}
          setCurrentPage={setCurrentPage}
          setSelectedId={setSelectedId}
          onNotify={addToast}
        />
      );
    }
    if (currentPage === 'lab-item') {
      return (
        <ItemDetail
          type="lab-item"
          id={selectedId}
          user={user}
          onBack={() => setCurrentPage('career-lab')}
          setCurrentPage={setCurrentPage}
          setSelectedId={setSelectedId}
          onNotify={addToast}
        />
      );
    }

    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} setSelectedId={setSelectedId} />;
      case 'courses':
        return <Courses setSelectedId={setSelectedId} setCurrentPage={setCurrentPage} />;
      case 'blog':
        return <Blog setSelectedId={setSelectedId} setCurrentPage={setCurrentPage} />;
      case 'references':
        return <References setSelectedId={setSelectedId} setCurrentPage={setCurrentPage} />;
      case 'career-lab':
      case 'career-labs':
        return <CareerLabs setSelectedId={setSelectedId} setCurrentPage={setCurrentPage} />;
      case 'counselors':
      case 'counsellors':
        return <Counsellors setCurrentPage={setCurrentPage} />;
      case 'staff':
        return user?.isAdmin
          ? <Staff user={user} onNotify={addToast} />
          : <ForbiddenErrorPane onRedirect={() => setCurrentPage('home')} />;

      default:
        if (currentPage.startsWith('search')) {
          return (
            <div className="min-h-screen bg-[#FAFAFA] text-[#111114]">
              <section className="relative bg-white border-b border-neutral-200/80 py-10 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-lab-dots opacity-40 pointer-events-none" />
                <div className="relative max-w-7xl mx-auto text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[11px] text-[#C8102E] font-bold uppercase tracking-wider">
                    <Search className="w-3.5 h-3.5" />
                    <span>Career Lab Search</span>
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-display font-bold tracking-tight text-[#111114] mt-3">
                    Results for &ldquo;{searchQuery}&rdquo;
                  </h1>
                </div>
              </section>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
                {loading ? (
                  <div className="py-24 text-center">
                    <div className="spinner" />
                    <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mt-3">
                      Searching Career Lab...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {/* Career Labs Matching */}
                    {globalResults.labs.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.16em] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#C8102E]" />
                          <span>Career Lab Projects ({globalResults.labs.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {globalResults.labs.map(l => (
                            <div
                              key={l.ID}
                              onClick={() => { setSelectedId(l.ID); setCurrentPage('lab-item'); }}
                              className={`bg-white border p-5 rounded-3xl cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between group ${
                                l.IsPinned ? 'border-[#C8102E] ring-2 ring-[#C8102E]/15' : 'border-neutral-200 hover:border-red-200'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {l.IsPinned && (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-[#C8102E] text-white font-bold uppercase px-2.5 py-0.5 rounded-full">
                                      <Pin className="w-2.5 h-2.5 fill-current" /> Important
                                    </span>
                                  )}
                                  <span className="text-[10px] bg-red-50 text-[#C8102E] font-bold uppercase px-2.5 py-0.5 rounded-full">{l.Category}</span>
                                </div>
                                <h4 className="font-display font-bold text-lg text-[#111114] group-hover:text-[#C8102E] line-clamp-1 mt-2.5 mb-1.5 transition-colors">{l.Title}</h4>
                                <p className="text-neutral-600 text-xs line-clamp-2 leading-relaxed">{l.Description}</p>
                              </div>
                              <span className="text-xs text-[#C8102E] font-bold mt-4 inline-flex items-center gap-1">
                                Open project <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Courses Matching */}
                    {globalResults.courses.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.16em] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#C8102E]" />
                          <span>Courses ({globalResults.courses.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {globalResults.courses.map(c => (
                            <div
                              key={c.ID}
                              onClick={() => { setSelectedId(c.ID); setCurrentPage('course'); }}
                              className={`bg-white border p-5 rounded-3xl cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between group ${
                                c.IsPinned ? 'border-[#C8102E] ring-2 ring-[#C8102E]/15' : 'border-neutral-200 hover:border-red-200'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {c.IsPinned && (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-[#C8102E] text-white font-bold uppercase px-2.5 py-0.5 rounded-full">
                                      <Pin className="w-2.5 h-2.5 fill-current" /> Important
                                    </span>
                                  )}
                                  <span className="text-[10px] bg-red-50 text-[#C8102E] font-bold uppercase px-2.5 py-0.5 rounded-full">{c.Category}</span>
                                </div>
                                <h4 className="font-display font-bold text-lg text-[#111114] group-hover:text-[#C8102E] line-clamp-1 mt-2.5 mb-1.5 transition-colors">{c.Title}</h4>
                                <p className="text-neutral-600 text-xs line-clamp-2 leading-relaxed">{c.Description}</p>
                              </div>
                              <span className="text-xs text-[#C8102E] font-bold mt-4 inline-flex items-center gap-1">
                                Open course <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stories Matching */}
                    {globalResults.blogs.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.16em] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#C8102E]" />
                          <span>Stories ({globalResults.blogs.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {globalResults.blogs.map(p => (
                            <div
                              key={p.ID}
                              onClick={() => { setSelectedId(p.ID); setCurrentPage('blog-item'); }}
                              className={`bg-white border p-5 rounded-3xl cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between group ${
                                p.IsPinned ? 'border-[#C8102E] ring-2 ring-[#C8102E]/15' : 'border-neutral-200 hover:border-red-200'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {p.IsPinned && (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-[#C8102E] text-white font-bold uppercase px-2.5 py-0.5 rounded-full">
                                      <Pin className="w-2.5 h-2.5 fill-current" /> Important
                                    </span>
                                  )}
                                  <span className="text-[10px] bg-red-50 text-[#C8102E] font-bold uppercase px-2.5 py-0.5 rounded-full">
                                    #{p.Tags ? p.Tags.split(',')[0].trim() : 'Story'}
                                  </span>
                                </div>
                                <h4 className="font-display font-bold text-lg text-[#111114] group-hover:text-[#C8102E] line-clamp-1 mt-2.5 mb-1.5 transition-colors">{p.Title}</h4>
                                <p className="text-neutral-600 text-xs line-clamp-2 leading-relaxed">{p.Content.replace(/<[^>]*>/g, '')}</p>
                              </div>
                              <span className="text-xs text-[#C8102E] font-bold mt-4 inline-flex items-center gap-1">
                                Read story <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources Matching */}
                    {globalResults.references.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.16em] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#C8102E]" />
                          <span>Templates &amp; Resources ({globalResults.references.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {globalResults.references.map(r => (
                            <div
                              key={r.ID}
                              onClick={() => { setSelectedId(r.ID); setCurrentPage('reference-item'); }}
                              className={`bg-white border p-5 rounded-3xl cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between group ${
                                r.IsPinned ? 'border-[#C8102E] ring-2 ring-[#C8102E]/15' : 'border-neutral-200 hover:border-red-200'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {r.IsPinned && (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-[#C8102E] text-white font-bold uppercase px-2.5 py-0.5 rounded-full">
                                      <Pin className="w-2.5 h-2.5 fill-current" /> Important
                                    </span>
                                  )}
                                  <span className="text-[10px] bg-red-50 text-[#C8102E] font-bold uppercase px-2.5 py-0.5 rounded-full">{r.Category}</span>
                                </div>
                                <h4 className="font-display font-bold text-lg text-[#111114] group-hover:text-[#C8102E] line-clamp-1 mt-2.5 mb-1.5 transition-colors">{r.Title}</h4>
                                <p className="text-neutral-600 text-xs line-clamp-2 leading-relaxed">{r.Description}</p>
                              </div>
                              <span className="text-xs text-[#C8102E] font-bold mt-4 inline-flex items-center gap-1">
                                Open resource <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty Search State */}
                    {globalResults.courses.length === 0 &&
                      globalResults.blogs.length === 0 &&
                      globalResults.references.length === 0 &&
                      globalResults.labs.length === 0 && (
                        <div className="bg-white rounded-3xl border border-neutral-200 text-center p-12 sm:p-16 max-w-xl mx-auto">
                          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#C8102E] flex items-center justify-center mx-auto mb-4 border border-red-100">
                            <FileSearch className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-bold text-[#111114] font-display">
                            No matches found
                          </h3>
                          <p className="text-neutral-500 text-xs sm:text-sm mt-2">
                            Try searching for &ldquo;CV&rdquo;, &ldquo;Class 11&rdquo;, &ldquo;Design&rdquo;, or &ldquo;Science&rdquo;.
                          </p>
                          <button
                            type="button"
                            onClick={() => setCurrentPage('home')}
                            className="mt-6 px-5 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                          >
                            Back to Home
                          </button>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          );
        }

        return <NotFoundErrorPane onRedirect={() => setCurrentPage('home')} />;
    }
  };

  // Modern Studio Login Screen for Silver Oaks Career Lab
  if (!user) {
    const allowedDomains = [
      '@hyd.silveroaks.co.in',
      '@bt.silveroaks.co.in',
      '@odl.silveroaks.co.in',
      '@vizag.silveroaks.co.in',
      '@km.silveroaks.co.in'
    ];

    return (
      <div className="min-h-screen bg-[#FAFAFA] relative overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 bg-lab-dots opacity-50 pointer-events-none" />

        {/* Toasts on Login */}
        {toasts.length > 0 && (
          <div className="fixed bottom-6 right-4 sm:right-6 z-[99999] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)]">
            {toasts.map(t => (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border flex items-start gap-3 shadow-2xl animate-slide-in ${
                  t.type === 'success'
                    ? 'bg-white border-neutral-200 text-[#111114] border-l-4 border-l-[#C8102E]'
                    : 'bg-red-50 border-red-200 text-[#7A0A1D] border-l-4 border-l-[#C8102E]'
                }`}
              >
                {t.type === 'success'
                  ? <CheckCircle className="w-4 h-4 text-[#C8102E] shrink-0 mt-0.5" />
                  : <AlertCircle className="w-4 h-4 text-[#C8102E] shrink-0 mt-0.5" />
                }
                <span className="text-xs sm:text-sm font-semibold text-left leading-snug">{t.msg}</span>
              </div>
            ))}
          </div>
        )}

        {/* Minimal Brand Top Bar */}
        <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-10 rounded-xl shadow-xs" />
            <div className="text-left leading-none">
              <span className="font-display font-bold text-base text-[#111114] tracking-tight block">
                Career<span className="text-[#C8102E]">Lab</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                Silver Oaks
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-white border border-neutral-200 text-[11px] font-bold text-neutral-600 shadow-2xs">
            Student &amp; Mentor Access
          </span>
        </header>

        {/* Sculptural Asymmetric Center Stage */}
        <main className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full items-stretch">
            {/* Left Sculptural Crimson Studio Card */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="lg:col-span-7 relative rounded-[32px] bg-gradient-to-br from-[#D41132] via-[#A30B25] to-[#650616] text-white p-8 sm:p-10 lg:p-12 overflow-hidden flex flex-col justify-between shadow-[0_24px_64px_-16px_rgba(163,11,37,0.45)] text-left"
            >
              <div className="absolute inset-0 bg-lab-dots-white opacity-35 pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-white/15 blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-5">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-[11px] font-bold uppercase tracking-wider text-white">
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Silver Oaks Career Lab</span>
                </span>

                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.06] tracking-tight text-white">
                  Explore real careers. Showcase your work.
                </h1>

                <p className="text-red-100/90 text-sm sm:text-base max-w-md leading-relaxed">
                  Sign in with your Silver Oaks Google account to unlock student lab projects, career workshops, templates, and mentor guidance.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="relative z-10 grid grid-cols-2 gap-2.5 mt-8">
                {[
                  { icon: FlaskConical, label: 'Student Projects' },
                  { icon: BookOpen, label: 'Career Courses' },
                  { icon: FileText, label: 'CV & Guides' },
                  { icon: Users, label: 'Counsellors' }
                ].map(feat => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={feat.label}
                      className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl bg-white/10 border border-white/15 text-xs font-bold text-white"
                    >
                      <Icon className="w-4 h-4 text-red-200 shrink-0" />
                      <span>{feat.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right Pure White Sign-In Card */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.06 }}
              className="lg:col-span-5 bg-white rounded-[32px] border border-neutral-200 p-7 sm:p-10 shadow-xl shadow-neutral-900/5 flex flex-col justify-between text-center"
            >
              <div className="space-y-2.5 pt-2">
                <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-[#C8102E] flex items-center justify-center mx-auto">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#111114] tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-sm text-neutral-500">
                  Continue with your Silver Oaks school Google account.
                </p>
              </div>

              <div className="my-8">
                {loading ? (
                  <div className="py-6 flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-7 h-7 text-[#C8102E] animate-spin" />
                    <span className="text-[11px] text-neutral-500 uppercase tracking-widest font-bold">
                      Signing you in...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Google Identity Sign-In Button Target */}
                    <div id="g_login_btn" className="w-full flex justify-center py-1 min-h-[44px]" />
                  </div>
                )}
              </div>

              {/* Allowed Campus Domains */}
              <div className="pt-5 border-t border-neutral-100 space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  Silver Oaks Campuses
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {allowedDomains.map(domain => (
                    <span
                      key={domain}
                      className="px-2.5 py-1 rounded-full bg-[#FAFAFA] border border-neutral-200 text-[10px] font-semibold text-neutral-600"
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        <footer className="relative z-10 py-5 px-4 text-center">
          <p className="text-xs text-neutral-400 font-medium">
            Silver Oaks Career Lab · Character before Competence
          </p>
        </footer>
      </div>
    );
  }

  // Authenticated Full App Shell
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Global Command Search Modal (Cmd/Ctrl + K) */}
      <CommandSearch
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        setCurrentPage={setCurrentPage}
        setSelectedId={setSelectedId}
      />

      {/* Toasts — safely above mobile floating dock */}
      {toasts.length > 0 && (
        <div className="fixed bottom-24 md:bottom-6 right-4 sm:right-6 z-[99999] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)]">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xl transition-all duration-300 animate-slide-in ${
                t.type === 'success'
                  ? 'bg-white border-neutral-200 text-[#111114] border-l-4 border-l-[#C8102E]'
                  : 'bg-red-50 border-red-200 text-[#7A0A1D] border-l-4 border-l-[#C8102E]'
              }`}
            >
              {t.type === 'success'
                ? <CheckCircle className="w-4 h-4 text-[#C8102E] shrink-0 mt-0.5" />
                : <AlertCircle className="w-4 h-4 text-[#C8102E] shrink-0 mt-0.5" />
              }
              <span className="text-xs sm:text-sm font-semibold text-left leading-snug">{t.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Header + Floating Mobile Dock */}
      <Header
        user={user}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Database Connection Status Warning Banner */}
      {supabaseError && (
        <div className="bg-red-50 border-b border-red-200 py-3 px-4 text-center relative z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-[#9E0B24] uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-[#C8102E] shrink-0" />
            <span>database is inactive please contact the the career counsellors</span>
          </div>
        </div>
      )}

      <main className="flex-grow">
        {renderCurrentPage()}
      </main>

      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}

function ForbiddenErrorPane({ onRedirect }: { onRedirect: () => void }) {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-[#C8102E] flex items-center justify-center mx-auto">
        <ShieldAlert className="w-7 h-7" />
      </div>
      <h2 className="text-2xl font-display font-bold text-[#111114]">Access Restricted</h2>
      <p className="text-neutral-500 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
        You need Editor or Admin access to open the Career Lab Studio.
      </p>
      <button
        type="button"
        onClick={onRedirect}
        className="px-6 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-full font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
      >
        Back to Home
      </button>
    </div>
  );
}

function NotFoundErrorPane({ onRedirect }: { onRedirect: () => void }) {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-[#C8102E] flex items-center justify-center mx-auto">
        <FileSearch className="w-7 h-7" />
      </div>
      <h2 className="text-2xl font-display font-bold text-[#111114]">Page Not Found</h2>
      <p className="text-neutral-500 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
        That page doesn&apos;t exist in Career Lab. Head back to the main dashboard.
      </p>
      <button
        type="button"
        onClick={onRedirect}
        className="px-6 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-full font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
      >
        Go Home
      </button>
    </div>
  );
}
