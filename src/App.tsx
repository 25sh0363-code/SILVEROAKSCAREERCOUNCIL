/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  ShieldAlert,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Search,
  ArrowRight,
  RefreshCw,
  Lock,
  Pin,
  FileSearch
} from 'lucide-react';

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
import Logo from './components/Logo';

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedId, setSelectedId] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);
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

  // Scroll cleanly to top when switching views
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

  // Check if we already have session credentials
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

  // Set up standard Google Identity sign-on button
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
            width: Math.min(300, Math.max(240, window.innerWidth - 96))
          });
        }
      } else {
        setTimeout(initGoogleGSI, 400);
      }
    }

    initGoogleGSI();
  }, [user]);

  // Handle Google Token Credential
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
      addToast(`Signed in successfully as ${loggedUser.name}! Welcome to the portal.`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Verification failed. Try alternative standard login.', 'err');
    } finally {
      setLoading(false);
    }
  };

  // JWT Decoder helper
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

  // Logout trigger
  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('c_user');
    addToast("Logged out from the portal session.", "success");
    const google = (window as any).google;
    if (google && google.accounts && google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
  };

  // Global search compilation logic
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
        console.error("Global search data failed to execute query:", err);
      }).finally(() => {
        setLoading(false);
      });
    } catch (err) {
      console.error("Error parsing search index page parameters:", err);
    }
  }, [currentPage]);

  // Main Page Router switch
  const renderCurrentPage = () => {
    if (currentPage === 'course') {
      return (
        <ItemDetail
          type="course"
          id={selectedId}
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
          onBack={() => setCurrentPage('career-lab')}
          setCurrentPage={setCurrentPage}
          setSelectedId={setSelectedId}
          onNotify={addToast}
        />
      );
    }

    switch (currentPage) {
      case 'home':
        return (
          <Home
            setCurrentPage={setCurrentPage}
            setSelectedId={setSelectedId}
            onNotify={addToast}
          />
        );
      case 'courses':
        return (
          <Courses
            setSelectedId={setSelectedId}
            setCurrentPage={setCurrentPage}
            onNotify={addToast}
          />
        );
      case 'blog':
        return (
          <Blog
            setSelectedId={setSelectedId}
            setCurrentPage={setCurrentPage}
            onNotify={addToast}
          />
        );
      case 'references':
        return (
          <References
            setSelectedId={setSelectedId}
            setCurrentPage={setCurrentPage}
            onNotify={addToast}
          />
        );
      case 'career-lab':
        return (
          <CareerLabs
            setSelectedId={setSelectedId}
            setCurrentPage={setCurrentPage}
            onNotify={addToast}
          />
        );
      case 'counselors':
        return <Counsellors setCurrentPage={setCurrentPage} />;
      case 'staff':
        return user?.isAdmin
          ? <Staff user={user} onNotify={addToast} />
          : <ForbiddenErrorPane onRedirect={() => setCurrentPage('home')} />;

      default:
        if (currentPage.startsWith('search')) {
          return (
            <div className="min-h-screen bg-[#FFFBFB]">
              <section className="bg-gradient-to-br from-[#6B081B] via-[#9E0D28] to-[#C21434] text-white py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-left">
                  <span className="text-xs text-rose-100 font-semibold uppercase tracking-[0.16em] inline-flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    <span>Search Queries Index</span>
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-serif font-medium tracking-tight mt-1.5">
                    Results for "{searchQuery}"
                  </h1>
                </div>
              </section>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
                {loading ? (
                  <div className="py-24 text-center">
                    <div className="spinner" />
                    <p className="text-xs text-[#8A6970] font-semibold uppercase tracking-wider mt-3">
                      Indexing archive files...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {/* Courses Matching */}
                    {globalResults.courses.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-[#241115] uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#B80F2E]" />
                          <span>Matching Courses ({globalResults.courses.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {globalResults.courses.map(c => (
                            <div
                              key={c.ID}
                              onClick={() => { setSelectedId(c.ID); setCurrentPage('course'); }}
                              className="bg-white border border-rose-100 hover:border-[#B80F2E] p-5 rounded-2xl cursor-pointer hover:shadow-md transition-all text-left flex flex-col justify-between group"
                            >
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {c.IsPinned && (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-[#B80F2E] text-white font-bold uppercase px-2 py-0.5 rounded-full">
                                      <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                                    </span>
                                  )}
                                  <span className="text-[10px] bg-rose-50 text-[#B80F2E] font-bold uppercase px-2.5 py-0.5 rounded-md tracking-wide">{c.Category}</span>
                                </div>
                                <h4 className="font-serif font-semibold text-lg text-[#241115] group-hover:text-[#B80F2E] line-clamp-1 mt-2.5 mb-1.5 transition-colors">{c.Title}</h4>
                                <p className="text-[#694D53] text-xs line-clamp-2 leading-relaxed">{c.Description}</p>
                              </div>
                              <span className="text-xs text-[#B80F2E] font-semibold mt-4 inline-flex items-center gap-1">
                                Enter course <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Blogs Matching */}
                    {globalResults.blogs.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-[#241115] uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#9E0D28]" />
                          <span>Guidance Articles ({globalResults.blogs.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {globalResults.blogs.map(p => (
                            <div
                              key={p.ID}
                              onClick={() => { setSelectedId(p.ID); setCurrentPage('blog-item'); }}
                              className="bg-white border border-rose-100 hover:border-[#B80F2E] p-5 rounded-2xl cursor-pointer hover:shadow-md transition-all text-left flex flex-col justify-between group"
                            >
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {p.IsPinned && (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-[#B80F2E] text-white font-bold uppercase px-2 py-0.5 rounded-full">
                                      <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                                    </span>
                                  )}
                                  <span className="text-[10px] bg-rose-50 text-[#B80F2E] font-bold uppercase px-2.5 py-0.5 rounded-md tracking-wide">
                                    #{p.Tags ? p.Tags.split(',')[0].trim() : 'General'}
                                  </span>
                                </div>
                                <h4 className="font-serif font-semibold text-lg text-[#241115] group-hover:text-[#B80F2E] line-clamp-1 mt-2.5 mb-1.5 transition-colors">{p.Title}</h4>
                                <p className="text-[#694D53] text-xs line-clamp-2 leading-relaxed">{p.Content.replace(/<[^>]*>/g, '')}</p>
                              </div>
                              <span className="text-xs text-[#B80F2E] font-semibold mt-4 inline-flex items-center gap-1">
                                Read article <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* References Matching */}
                    {globalResults.references.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-[#241115] uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#D91E3E]" />
                          <span>Guides & Reference Documents ({globalResults.references.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {globalResults.references.map(r => (
                            <div
                              key={r.ID}
                              onClick={() => { setSelectedId(r.ID); setCurrentPage('reference-item'); }}
                              className="bg-white border border-rose-100 hover:border-[#B80F2E] p-5 rounded-2xl cursor-pointer hover:shadow-md transition-all text-left flex flex-col justify-between group"
                            >
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {r.IsPinned && (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-[#B80F2E] text-white font-bold uppercase px-2 py-0.5 rounded-full">
                                      <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                                    </span>
                                  )}
                                  <span className="text-[10px] bg-rose-50 text-[#8B0E24] font-bold uppercase px-2.5 py-0.5 rounded-md tracking-wide">{r.Category}</span>
                                </div>
                                <h4 className="font-serif font-semibold text-lg text-[#241115] group-hover:text-[#B80F2E] line-clamp-1 mt-2.5 mb-1.5 transition-colors">{r.Title}</h4>
                                <p className="text-[#694D53] text-xs line-clamp-2 leading-relaxed">{r.Description}</p>
                              </div>
                              <span className="text-xs text-[#B80F2E] font-semibold mt-4 inline-flex items-center gap-1">
                                View reference <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Labs Matching */}
                    {globalResults.labs.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-base font-bold text-[#241115] uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#6B081B]" />
                          <span>Student Career Labs ({globalResults.labs.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {globalResults.labs.map(l => (
                            <div
                              key={l.ID}
                              onClick={() => { setSelectedId(l.ID); setCurrentPage('lab-item'); }}
                              className="bg-white border border-rose-100 hover:border-[#B80F2E] p-5 rounded-2xl cursor-pointer hover:shadow-md transition-all text-left flex flex-col justify-between group"
                            >
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {l.IsPinned && (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-[#B80F2E] text-white font-bold uppercase px-2 py-0.5 rounded-full">
                                      <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                                    </span>
                                  )}
                                  <span className="text-[10px] bg-rose-50 text-[#8B0E24] font-bold uppercase px-2.5 py-0.5 rounded-md tracking-wide">{l.Category}</span>
                                </div>
                                <h4 className="font-serif font-semibold text-lg text-[#241115] group-hover:text-[#B80F2E] line-clamp-1 mt-2.5 mb-1.5 transition-colors">{l.Title}</h4>
                                <p className="text-[#694D53] text-xs line-clamp-2 leading-relaxed">{l.Description}</p>
                              </div>
                              <span className="text-xs text-[#B80F2E] font-semibold mt-4 inline-flex items-center gap-1">
                                Open research <ArrowRight className="w-3.5 h-3.5" />
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
                        <div className="bg-white rounded-2xl border border-rose-100 text-center p-12 sm:p-16 shadow-2xs max-w-xl mx-auto">
                          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#B80F2E] flex items-center justify-center mx-auto mb-4 border border-rose-100">
                            <FileSearch className="w-7 h-7" />
                          </div>
                          <h3 className="text-xl font-semibold text-[#241115] font-serif">
                            No platform items match your query
                          </h3>
                          <p className="text-[#694D53] text-xs sm:text-sm mt-2">
                            Try searching for alternative topics such as "CV", "LaTeX", "Class 11", or "Science".
                          </p>
                          <button
                            type="button"
                            onClick={() => setCurrentPage('home')}
                            className="mt-6 px-5 py-2.5 bg-[#B80F2E] hover:bg-[#8B0E24] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                          >
                            Return Home
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

  // Login visual screen — refined red shades & white, balanced on mobile & desktop
  if (!user) {
    const allowedDomains = [
      '@hyd.silveroaks.co.in',
      '@bt.silveroaks.co.in',
      '@odl.silveroaks.co.in',
      '@vizag.silveroaks.co.in',
      '@km.silveroaks.co.in'
    ];

    return (
      <div className="relative min-h-screen bg-gradient-to-br from-[#5C0717] via-[#980D27] to-[#C21434] flex flex-col justify-between overflow-hidden">
        {/* Ambient radial red highlights */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_95%_5%,rgba(255,255,255,0.18),transparent_48%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_5%_95%,rgba(74,4,17,0.65),transparent_52%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

        {/* Dynamic Toast notifications on Login screen too */}
        {toasts.length > 0 && (
          <div className="fixed bottom-6 right-4 sm:right-6 z-[99999] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)]">
            {toasts.map(t => (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border flex items-start gap-3 shadow-2xl animate-slide-in ${
                  t.type === 'success'
                    ? 'bg-white border-rose-200 text-[#241115] border-l-4 border-l-[#B80F2E]'
                    : 'bg-[#FFF0F2] border-rose-300 text-[#7A0B1F] border-l-4 border-l-[#9E0D28]'
                }`}
              >
                {t.type === 'success'
                  ? <CheckCircle className="w-4 h-4 text-[#B80F2E] shrink-0 mt-0.5" />
                  : <AlertCircle className="w-4 h-4 text-[#B80F2E] shrink-0 mt-0.5" />
                }
                <span className="text-xs sm:text-sm font-semibold text-left leading-snug">{t.msg}</span>
              </div>
            ))}
          </div>
        )}

        {/* Top Header */}
        <header className="relative z-10 px-4 sm:px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-10 sm:h-12 shadow-lg rounded-xl" />
            <div className="flex flex-col text-left text-white leading-tight">
              <span className="font-serif font-semibold text-sm sm:text-base">Silver Oaks Career Council</span>
              <span className="text-[10px] uppercase tracking-[0.16em] text-rose-200 font-semibold">Resource Center</span>
            </div>
          </div>
          <span className="text-[10px] text-white font-bold uppercase bg-white/12 border border-white/25 px-3 py-1.5 rounded-full tracking-widest backdrop-blur-xs">
            Internal Portal
          </span>
        </header>

        {/* Center Card Panel */}
        <main className="relative z-10 max-w-5xl mx-auto px-4 w-full flex-grow flex items-center justify-center py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center w-full bg-white/10 backdrop-blur-md p-5 sm:p-8 lg:p-10 rounded-3xl border border-white/20 shadow-[0_24px_64px_rgba(52,3,13,0.4)]">
            {/* Editorial Copy Column */}
            <div className="lg:col-span-6 text-left space-y-5 text-white">
              <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-rose-100" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight leading-[1.12]">
                Design thinking & stream advice pipelines.
              </h1>
              <p className="text-rose-100/90 text-xs sm:text-sm leading-relaxed max-w-md">
                Sign in with your official Silver Oaks domain credentials to access curated courses, editorial dispatches, peer career labs, and CV templates.
              </p>

              {/* Approved Domains */}
              <div className="pt-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-200 block mb-2.5">
                  Authorized Campus Domains
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {allowedDomains.map(domain => (
                    <span
                      key={domain}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-medium text-rose-50"
                    >
                      <CheckCircle className="w-3 h-3 text-rose-200 shrink-0" />
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* White Sign-In Card */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-rose-100 flex flex-col justify-center gap-6 min-h-[340px] sm:min-h-[380px]">
              <div className="text-center space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-[#B80F2E] flex items-center justify-center mx-auto">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-serif font-semibold text-[#241115]">
                  Internal Sign In
                </h2>
                <p className="text-xs sm:text-sm text-[#694D53]">
                  Authenticate with your designated Silver Oaks Google account.
                </p>
              </div>

              {loading ? (
                <div className="py-6 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 text-[#B80F2E] animate-spin" />
                  <span className="text-[11px] text-[#8A6970] uppercase tracking-widest font-bold">
                    Verifying credentials...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-5">
                  <div className="w-full p-3.5 bg-[#FFF6F7] border border-rose-100 rounded-xl text-center flex items-center justify-center gap-2 text-xs font-medium text-[#8B0E24] leading-snug">
                    <Lock className="w-4 h-4 text-[#B80F2E] shrink-0" />
                    <span>Certified school network · Google Single Sign-On</span>
                  </div>

                  {/* Google Button mounting point target */}
                  <div id="g_login_btn" className="w-full flex justify-center py-1 min-h-[44px]" />
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Login Footer */}
        <footer className="relative z-10 px-4 sm:px-6 py-4 max-w-7xl mx-auto w-full text-center border-t border-white/10">
          <p className="text-rose-100/85 text-[11px] font-medium tracking-wider uppercase">
            Silver Oaks School Group © {new Date().getFullYear()} · Hyderabad · Bangalore · ODL · Character Before Competence
          </p>
        </footer>
      </div>
    );
  }

  // Loaded full React application view
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFBFB]">
      {/* Dynamic Toast notifications — positioned safely above mobile bottom nav */}
      {toasts.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-[99999] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)]">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xl transition-all duration-300 animate-slide-in ${
                t.type === 'success'
                  ? 'bg-white border-rose-200 text-[#241115] border-l-4 border-l-[#B80F2E]'
                  : 'bg-[#FFF0F2] border-rose-300 text-[#7A0B1F] border-l-4 border-l-[#8B0E24]'
              }`}
            >
              {t.type === 'success'
                ? <CheckCircle className="w-4 h-4 text-[#B80F2E] shrink-0 mt-0.5" />
                : <AlertCircle className="w-4 h-4 text-[#B80F2E] shrink-0 mt-0.5" />
              }
              <span className="text-xs sm:text-sm font-semibold text-left leading-snug">{t.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Navigation Header + Mobile Bottom Bar */}
      <Header
        user={user}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      {/* Database Connection Status Warning Banner */}
      {supabaseError && (
        <div className="bg-[#FFF0F2] border-b border-rose-200 py-3.5 px-4 text-center relative z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2.5 text-xs sm:text-sm font-bold text-[#8B0E24] uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-[#B80F2E] shrink-0" />
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

// Reusable Forbidden access screen
function ForbiddenErrorPane({ onRedirect }: { onRedirect: () => void }) {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-[#B80F2E] flex items-center justify-center mx-auto shadow-xs">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-serif font-semibold text-[#241115]">Clearance Check Failed</h2>
      <p className="text-[#694D53] text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
        Access Denied. You need to be assigned as either an Editor or Admin from the counselor panel to view the command workspace.
      </p>
      <button
        type="button"
        onClick={onRedirect}
        className="px-6 py-2.5 bg-[#B80F2E] hover:bg-[#8B0E24] text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
      >
        Return to Home
      </button>
    </div>
  );
}

// Reusable Not Found screen
function NotFoundErrorPane({ onRedirect }: { onRedirect: () => void }) {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-[#B80F2E] flex items-center justify-center mx-auto shadow-xs">
        <FileSearch className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-serif font-semibold text-[#241115]">Content Missing</h2>
      <p className="text-[#694D53] text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
        This page path does not currently exist. Try choosing another category option or link from the navigation menu.
      </p>
      <button
        type="button"
        onClick={onRedirect}
        className="px-6 py-2.5 bg-[#B80F2E] hover:bg-[#8B0E24] text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
      >
        Navigate to Home
      </button>
    </div>
  );
}
