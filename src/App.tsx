/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  ShieldAlert,
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
            width: Math.min(320, Math.max(240, window.innerWidth - 96))
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
        return (
          <Home
            setCurrentPage={setCurrentPage}
            setSelectedId={setSelectedId}
          />
        );
      case 'courses':
        return (
          <Courses
            setSelectedId={setSelectedId}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'blog':
        return (
          <Blog
            setSelectedId={setSelectedId}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'references':
        return (
          <References
            setSelectedId={setSelectedId}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'career-lab':
      case 'career-labs':
        return (
          <CareerLabs
            setSelectedId={setSelectedId}
            setCurrentPage={setCurrentPage}
          />
        );
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
            <div className="min-h-screen bg-[#FAFAFA] text-[#141416]">
              <section className="bg-white border-b border-neutral-200 py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-left">
                  <span className="text-[11px] text-[#C8102E] font-bold uppercase tracking-[0.18em] inline-flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    <span>Archive Search</span>
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-serif font-semibold tracking-tight text-[#141416] mt-1.5">
                    Results for &ldquo;{searchQuery}&rdquo;
                  </h1>
                </div>
              </section>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
                {loading ? (
                  <div className="py-24 text-center">
                    <div className="spinner" />
                    <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-3">
                      Searching archive...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {/* Courses Matching */}
                    {globalResults.courses.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.16em] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#C8102E]" />
                          <span>Matching Courses ({globalResults.courses.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {globalResults.courses.map(c => (
                            <div
                              key={c.ID}
                              onClick={() => { setSelectedId(c.ID); setCurrentPage('course'); }}
                              className={`bg-white border p-5 rounded-2xl cursor-pointer hover:shadow-md transition-all text-left flex flex-col justify-between group ${
                                c.IsPinned ? 'border-[#C8102E]/45 border-l-4 border-l-[#C8102E]' : 'border-neutral-200 hover:border-neutral-300'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {c.IsPinned && (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-[#C8102E] text-white font-bold uppercase px-2 py-0.5 rounded">
                                      <Pin className="w-2.5 h-2.5 fill-current" /> Important
                                    </span>
                                  )}
                                  <span className="text-[10px] bg-red-50 text-[#C8102E] font-bold uppercase px-2 py-0.5 rounded tracking-wide">{c.Category}</span>
                                </div>
                                <h4 className="font-serif font-semibold text-lg text-[#141416] group-hover:text-[#C8102E] line-clamp-1 mt-2.5 mb-1.5 transition-colors">{c.Title}</h4>
                                <p className="text-neutral-600 text-xs line-clamp-2 leading-relaxed">{c.Description}</p>
                              </div>
                              <span className="text-xs text-[#C8102E] font-semibold mt-4 inline-flex items-center gap-1">
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
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.16em] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#C8102E]" />
                          <span>Guidance Editorial ({globalResults.blogs.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {globalResults.blogs.map(p => (
                            <div
                              key={p.ID}
                              onClick={() => { setSelectedId(p.ID); setCurrentPage('blog-item'); }}
                              className={`bg-white border p-5 rounded-2xl cursor-pointer hover:shadow-md transition-all text-left flex flex-col justify-between group ${
                                p.IsPinned ? 'border-[#C8102E]/45 border-l-4 border-l-[#C8102E]' : 'border-neutral-200 hover:border-neutral-300'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {p.IsPinned && (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-[#C8102E] text-white font-bold uppercase px-2 py-0.5 rounded">
                                      <Pin className="w-2.5 h-2.5 fill-current" /> Important
                                    </span>
                                  )}
                                  <span className="text-[10px] bg-red-50 text-[#C8102E] font-bold uppercase px-2 py-0.5 rounded tracking-wide">
                                    #{p.Tags ? p.Tags.split(',')[0].trim() : 'General'}
                                  </span>
                                </div>
                                <h4 className="font-serif font-semibold text-lg text-[#141416] group-hover:text-[#C8102E] line-clamp-1 mt-2.5 mb-1.5 transition-colors">{p.Title}</h4>
                                <p className="text-neutral-600 text-xs line-clamp-2 leading-relaxed">{p.Content.replace(/<[^>]*>/g, '')}</p>
                              </div>
                              <span className="text-xs text-[#C8102E] font-semibold mt-4 inline-flex items-center gap-1">
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
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.16em] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#C8102E]" />
                          <span>Reference Library ({globalResults.references.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {globalResults.references.map(r => (
                            <div
                              key={r.ID}
                              onClick={() => { setSelectedId(r.ID); setCurrentPage('reference-item'); }}
                              className={`bg-white border p-5 rounded-2xl cursor-pointer hover:shadow-md transition-all text-left flex flex-col justify-between group ${
                                r.IsPinned ? 'border-[#C8102E]/45 border-l-4 border-l-[#C8102E]' : 'border-neutral-200 hover:border-neutral-300'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {r.IsPinned && (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-[#C8102E] text-white font-bold uppercase px-2 py-0.5 rounded">
                                      <Pin className="w-2.5 h-2.5 fill-current" /> Important
                                    </span>
                                  )}
                                  <span className="text-[10px] bg-red-50 text-[#C8102E] font-bold uppercase px-2 py-0.5 rounded tracking-wide">{r.Category}</span>
                                </div>
                                <h4 className="font-serif font-semibold text-lg text-[#141416] group-hover:text-[#C8102E] line-clamp-1 mt-2.5 mb-1.5 transition-colors">{r.Title}</h4>
                                <p className="text-neutral-600 text-xs line-clamp-2 leading-relaxed">{r.Description}</p>
                              </div>
                              <span className="text-xs text-[#C8102E] font-semibold mt-4 inline-flex items-center gap-1">
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
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.16em] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#C8102E]" />
                          <span>Student Career Labs ({globalResults.labs.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {globalResults.labs.map(l => (
                            <div
                              key={l.ID}
                              onClick={() => { setSelectedId(l.ID); setCurrentPage('lab-item'); }}
                              className={`bg-white border p-5 rounded-2xl cursor-pointer hover:shadow-md transition-all text-left flex flex-col justify-between group ${
                                l.IsPinned ? 'border-[#C8102E]/45 border-l-4 border-l-[#C8102E]' : 'border-neutral-200 hover:border-neutral-300'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {l.IsPinned && (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-[#C8102E] text-white font-bold uppercase px-2 py-0.5 rounded">
                                      <Pin className="w-2.5 h-2.5 fill-current" /> Important
                                    </span>
                                  )}
                                  <span className="text-[10px] bg-red-50 text-[#C8102E] font-bold uppercase px-2 py-0.5 rounded tracking-wide">{l.Category}</span>
                                </div>
                                <h4 className="font-serif font-semibold text-lg text-[#141416] group-hover:text-[#C8102E] line-clamp-1 mt-2.5 mb-1.5 transition-colors">{l.Title}</h4>
                                <p className="text-neutral-600 text-xs line-clamp-2 leading-relaxed">{l.Description}</p>
                              </div>
                              <span className="text-xs text-[#C8102E] font-semibold mt-4 inline-flex items-center gap-1">
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
                        <div className="bg-white rounded-2xl border border-neutral-200 text-center p-12 sm:p-16 max-w-xl mx-auto">
                          <div className="w-12 h-12 rounded-xl bg-red-50 text-[#C8102E] flex items-center justify-center mx-auto mb-4 border border-red-100">
                            <FileSearch className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl font-semibold text-[#141416] font-serif">
                            No items match your query
                          </h3>
                          <p className="text-neutral-500 text-xs sm:text-sm mt-2">
                            Try searching for topics such as &ldquo;CV&rdquo;, &ldquo;LaTeX&rdquo;, &ldquo;Class 11&rdquo;, or &ldquo;Science&rdquo;.
                          </p>
                          <button
                            type="button"
                            onClick={() => setCurrentPage('home')}
                            className="mt-6 px-5 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
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

  // Sharp Architectural Split Login Screen (Crimson + Pure White)
  if (!user) {
    const allowedDomains = [
      '@hyd.silveroaks.co.in',
      '@bt.silveroaks.co.in',
      '@odl.silveroaks.co.in',
      '@vizag.silveroaks.co.in',
      '@km.silveroaks.co.in'
    ];

    return (
      <div className="min-h-screen bg-white flex flex-col lg:flex-row">
        {/* Toast notifications on Login screen */}
        {toasts.length > 0 && (
          <div className="fixed bottom-6 right-4 sm:right-6 z-[99999] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)]">
            {toasts.map(t => (
              <div
                key={t.id}
                className={`p-4 rounded-xl border flex items-start gap-3 shadow-2xl animate-slide-in ${
                  t.type === 'success'
                    ? 'bg-white border-neutral-200 text-[#141416] border-l-4 border-l-[#C8102E]'
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

        {/* Left Crimson Institutional Panel */}
        <aside className="lg:w-[52%] bg-gradient-to-br from-[#650616] via-[#8F0B22] to-[#B80F2E] text-white px-6 py-10 sm:px-12 sm:py-14 lg:p-16 flex flex-col justify-between text-left">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Logo className="h-10 sm:h-11 rounded-lg shadow-md" />
              <div className="leading-tight">
                <span className="font-serif font-semibold text-base block text-white">
                  Silver Oaks Career Council
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-200">
                  Internal Resource Center
                </span>
              </div>
            </div>
            <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-[0.16em] px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white">
              Campus Portal
            </span>
          </div>

          <div className="my-10 lg:my-0 max-w-lg space-y-5">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-red-200">
              <span className="w-6 h-[2px] bg-white inline-block" />
              <span>Character Before Competence</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.1] tracking-tight text-white">
              Academic &amp; career guidance built for Silver Oaks students.
            </h1>
            <p className="text-red-100/90 text-sm sm:text-base leading-relaxed">
              Access grade-wise courses, counselor guidance articles, CV templates, and peer Career Lab portfolios using your official school Google account.
            </p>

            <div className="pt-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-200 mb-2.5">
                Authorized Campus Domains
              </p>
              <div className="flex flex-wrap gap-1.5">
                {allowedDomains.map(domain => (
                  <span
                    key={domain}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-[11px] font-medium text-white"
                  >
                    {domain}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-red-200/80 uppercase tracking-wider">
            Silver Oaks International Schools © {new Date().getFullYear()} · Hyderabad · Bengaluru · ODL
          </p>
        </aside>

        {/* Right Pure White Sign-In Panel */}
        <main className="lg:w-[48%] bg-white px-6 py-12 sm:px-12 flex items-center justify-center">
          <div className="w-full max-w-sm space-y-7 text-center">
            <div className="space-y-2.5">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 text-[#C8102E] flex items-center justify-center mx-auto">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#141416] tracking-tight">
                Sign in to Portal
              </h2>
              <p className="text-sm text-neutral-500">
                Use your verified Silver Oaks Google Workspace credentials to continue.
              </p>
            </div>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-7 h-7 text-[#C8102E] animate-spin" />
                <span className="text-[11px] text-neutral-500 uppercase tracking-widest font-bold">
                  Verifying credentials...
                </span>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="p-3.5 bg-[#FAFAFA] border border-neutral-200 rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-neutral-700">
                  <Lock className="w-4 h-4 text-[#C8102E] shrink-0" />
                  <span>Certified School Network · Google SSO</span>
                </div>

                {/* Google Identity Sign-In Mount */}
                <div id="g_login_btn" className="w-full flex justify-center py-1 min-h-[44px]" />

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Having trouble signing in? Contact{' '}
                  <a
                    href="mailto:careercounselling@hyd.silveroaks.co.in"
                    className="text-[#C8102E] font-semibold hover:underline"
                  >
                    careercounselling@hyd.silveroaks.co.in
                  </a>
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Loaded full React application view
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Dynamic Toast notifications — safely above mobile bottom nav */}
      {toasts.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-[99999] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)]">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`p-4 rounded-xl border flex items-start gap-3 shadow-xl transition-all duration-300 animate-slide-in ${
                t.type === 'success'
                  ? 'bg-white border-neutral-200 text-[#141416] border-l-4 border-l-[#C8102E]'
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

// Reusable Forbidden access screen
function ForbiddenErrorPane({ onRedirect }: { onRedirect: () => void }) {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-[#C8102E] flex items-center justify-center mx-auto">
        <ShieldAlert className="w-7 h-7" />
      </div>
      <h2 className="text-2xl font-serif font-semibold text-[#141416]">Clearance Check Failed</h2>
      <p className="text-neutral-500 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
        Access Denied. You need to be assigned as either an Editor or Admin from the counselor panel to view the command workspace.
      </p>
      <button
        type="button"
        onClick={onRedirect}
        className="px-6 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
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
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-[#C8102E] flex items-center justify-center mx-auto">
        <FileSearch className="w-7 h-7" />
      </div>
      <h2 className="text-2xl font-serif font-semibold text-[#141416]">Content Missing</h2>
      <p className="text-neutral-500 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
        This page path does not currently exist. Try choosing another category option or link from the navigation menu.
      </p>
      <button
        type="button"
        onClick={onRedirect}
        className="px-6 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
      >
        Navigate to Home
      </button>
    </div>
  );
}
