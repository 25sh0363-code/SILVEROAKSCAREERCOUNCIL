/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, LogIn, ShieldAlert, Sparkles, User, AlertCircle, 
  MapPin, CheckCircle, Search, ArrowRight, Grid, List, RefreshCw 
} from 'lucide-react';

import { AppUser, DbUser } from './types';
import { isAllowedEmail, ensureUser } from './lib/supabase';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Courses from './components/Courses';
import Blog from './components/Blog';
import References from './components/References';
import CareerLabs from './components/CareerLabs';
import Staff from './components/Staff';
import ItemDetail from './components/ItemDetail';
import { fetchAllCourses, fetchAllBlogs, fetchAllReferences, fetchAllCareerLabs } from './lib/supabase';
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
    if (user) return; // Only bind if not authenticated

    function initGoogleGSI() {
      const google = (window as any).google;
      if (google && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
          client_id: "392344488331-qt8b726lvhbldl9bptpj58bagj8qq2af.apps.googleusercontent.com",
          callback: handleGoogleCredential,
          auto_select: false,
        });

        // Try rendering standard button inside login form if visible
        const container = document.getElementById("g_login_btn");
        if (container) {
          google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            width: 320
          });
        }
      } else {
        // Retry GSI loading if library takes time to stream in
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
        throw new Error("Access Denied: Only @hyd.silveroaks.co.in, @bt.silveroaks.co.in, and @odl.silveroaks.co.in domains are permitted access.");
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
    // Ensure standard google gsi listener resets properly
    const google = (window as any).google;
    if (google && google.accounts && google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
  };

  // Global search compilation logic
  useEffect(() => {
    if (!currentPage.startsWith('search')) return;
    
    // Extract query string
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
    
    // Detailed inner resource views
    if (currentPage === 'course') {
      return (
        <ItemDetail 
          type="course" 
          id={selectedId} 
          onBack={() => setCurrentPage('courses')} 
          setCurrentPage={setCurrentPage} 
          setSelectedId={setSelectedId} 
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
        />
      );
    }

    // List/Main components view
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
        return (
          <CareerLabs 
            setSelectedId={setSelectedId} 
            setCurrentPage={setCurrentPage} 
          />
        );
      case 'staff':
        return user?.isAdmin 
          ? <Staff user={user} /> 
          : <ForbiddenErrorPane onRedirect={() => setCurrentPage('home')} />;
      
      default:
        // Render Search Results index if currentPage contains search
        if (currentPage.startsWith('search')) {
          return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-left">
              <span className="text-xs text-rose-500 font-extrabold uppercase tracking-widest block mb-1">Search queries index</span>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight font-serif mb-6 border-b pb-3">Results for "{searchQuery}"</h1>
              
              {loading ? (
                <div className="py-24 text-center">
                  <div className="spinner" />
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mt-4">Indexing database files...</p>
                </div>
              ) : (
                <div className="space-y-12">
                  
                  {/* Courses Matching block */}
                  {globalResults.courses.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#B80F2E]" />
                        <span>Matching Courses ({globalResults.courses.length})</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {globalResults.courses.map(c => (
                          <div 
                            key={c.ID} 
                            onClick={() => { setSelectedId(c.ID); setCurrentPage('course'); }}
                            className="bg-white border hover:border-[#B80F2E] p-5 rounded-2xl cursor-pointer hover:shadow-md transition-all text-left flex flex-col justify-between"
                          >
                            <div>
                              <span className="text-[10px] bg-rose-50 text-[#B80F2E] font-black uppercase px-2.5 py-0.5 rounded tracking-wide">{c.Category}</span>
                              <h4 className="font-extrabold text-base text-gray-900 line-clamp-1 mt-2 mb-1.5 font-serif">{c.Title}</h4>
                              <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">{c.Description}</p>
                            </div>
                            <span className="text-xs text-rose-800 font-bold mt-4 block">Enter course lesson →</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blogs matching block */}
                  {globalResults.blogs.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#B80F2E]" />
                        <span>Guidance Articles ({globalResults.blogs.length})</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {globalResults.blogs.map(p => (
                          <div 
                            key={p.ID} 
                            onClick={() => { setSelectedId(p.ID); setCurrentPage('blog-item'); }}
                            className="bg-white border hover:border-[#B80F2E] p-5 rounded-2xl cursor-pointer hover:shadow-md transition-all text-left flex flex-col justify-between"
                          >
                            <div>
                              <span className="text-[10px] bg-rose-50 text-[#B80F3E] font-black uppercase px-2.5 py-0.5 rounded tracking-wide">#{p.Tags ? p.Tags.split(',')[0].trim() : 'General'}</span>
                              <h4 className="font-extrabold text-base text-gray-900 line-clamp-1 mt-2 mb-1.5 font-serif">{p.Title}</h4>
                              <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">{p.Content.replace(/<[^>]*>/g, '')}</p>
                            </div>
                            <span className="text-xs text-[#B80F2E] font-bold mt-4 block">Read article →</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reference matching block */}
                  {globalResults.references.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
                        <span>Guides & Reference Documents ({globalResults.references.length})</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {globalResults.references.map(r => (
                          <div 
                            key={r.ID} 
                            onClick={() => { setSelectedId(r.ID); setCurrentPage('reference-item'); }}
                            className="bg-white border hover:border-emerald-700 p-5 rounded-2xl cursor-pointer hover:shadow-md transition-all text-left flex flex-col justify-between"
                          >
                            <div>
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-black uppercase px-2.5 py-0.5 rounded tracking-wide">{r.Category}</span>
                              <h4 className="font-extrabold text-base text-gray-900 line-clamp-1 mt-2 mb-1.5 font-serif">{r.Title}</h4>
                              <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">{r.Description}</p>
                            </div>
                            <span className="text-xs text-emerald-800 font-bold mt-4 block">View reference guide →</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lab matching block */}
                  {globalResults.labs.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                        <span>Student Career Labs ({globalResults.labs.length})</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {globalResults.labs.map(l => (
                          <div 
                            key={l.ID} 
                            onClick={() => { setSelectedId(l.ID); setCurrentPage('lab-item'); }}
                            className="bg-white border hover:border-amber-600 p-5 rounded-2xl cursor-pointer hover:shadow-md transition-all text-left flex flex-col justify-between"
                          >
                            <div>
                              <span className="text-[10px] bg-amber-50 text-amber-700 font-black uppercase px-2.5 py-0.5 rounded tracking-wide">Category: {l.Category}</span>
                              <h4 className="font-extrabold text-base text-gray-900 line-clamp-1 mt-2 mb-1.5 font-serif">{l.Title}</h4>
                              <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">{l.Description}</p>
                            </div>
                            <span className="text-xs text-amber-800 font-bold mt-4 block">Open research project →</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* If absolutely nothing matches */}
                  {globalResults.courses.length === 0 &&
                    globalResults.blogs.length === 0 &&
                    globalResults.references.length === 0 &&
                    globalResults.labs.length === 0 && (
                      <div className="bg-white rounded-2xl border text-center p-16 shadow-inner max-w-xl mx-auto">
                        <div className="text-4xl mb-4">🛸</div>
                        <h3 className="text-lg font-bold text-gray-900 font-serif">No platform items match your query</h3>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">
                          Try searching for alternative topics such as "CV", "LaTeX", "Class 11", "Mehta", or "Science".
                        </p>
                        <button 
                          onClick={() => setCurrentPage('home')}
                          className="mt-6 px-5 py-2.5 bg-[#B80F2E] hover:bg-[#8F0A22] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                        >
                          Return Home
                        </button>
                      </div>
                    )}

                </div>
              )}
            </div>
          );
        }
        
        return <NotFoundErrorPane onRedirect={() => setCurrentPage('home')} />;
    }
  };

  // Login visual screen
  if (!user) {
    return (
      <div className="relative min-h-screen bg-[#8F0A22] flex flex-col justify-between select-none">
        
        {/* Animated background overlays representing Silver Oaks branding red gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(214,26,60,0.5),rgba(255,255,255,0)_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(143,10,34,0.7),rgba(255,255,255,0)_50%)]" />

        {/* Vector dot graph grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-30" />

        {/* Top dummy navbar just to represent structural spacing */}
        <header className="relative z-10 px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-11 sm:h-12 shadow-md rounded-xl" />
          </div>
          <span className="text-[10px] text-rose-100 font-bold uppercase bg-white/5 border border-white/10 px-3 py-1.5 rounded-full tracking-widest">
            Internal Portal
          </span>
        </header>

        {/* Center Card Panel */}
        <main className="relative z-10 max-w-6xl mx-auto px-4 w-full flex-grow flex items-center justify-center py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full max-w-4xl bg-white/10 backdrop-blur-md p-6 sm:p-10 rounded-3xl border border-white/20 shadow-2xl">
            
            {/* Visual Text Panel */}
            <div className="text-left space-y-6 text-white hidden md:block select-text">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-[#B80F2E] flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-shadow animate-pulse" />
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight leading-tight font-serif">
                Design thinking & stream advice pipelines.
              </h2>
              <p className="text-rose-100 text-sm leading-relaxed max-w-sm">
                Log in using your official school domain credentials to browse academic courses, view peer submission labs, and download CV LaTeX structures.
              </p>
              <div className="flex flex-col gap-2.5 text-xs text-rose-200 font-semibold tracking-wide">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-rose-300" />
                  <span>Approved for @hyd.silveroaks.co.in</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-rose-300" />
                  <span>Approved for @bt.silveroaks.co.in</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-rose-300" />
                  <span>Approved for @odl.silveroaks.co.in</span>
                </div>
              </div>
            </div>

            {/* Login Card options */}
            <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-2xl border border-gray-100 flex flex-col justify-center gap-6 min-h-[420px]">
              <div className="text-center space-y-2">
                <div className="text-3xl">🎓</div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-serif leading-none">Internal Sign In</h2>
                <p className="text-xs sm:text-sm text-gray-500 font-semibold">Please authenticate only with your designated email domain.</p>
              </div>

              {loading && (
                <div className="py-6 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 text-[#B80F2E] animate-spin" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold animate-pulse">Verifying credentials...</span>
                </div>
              )}

              {/* Autocomplete Google Button Wrapper */}
              {!loading && (
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="p-4 bg-rose-50/50 border border-rose-100/50 rounded-xl text-center flex items-center justify-center sm:text-xs text-[10px] font-bold text-rose-800 leading-tight">
                    🔒 Certified secure network. Standard Single Sign-On handles official member logins below.
                  </div>
                  
                  {/* Google Button mounting point target */}
                  <div id="g_login_btn" className="w-full flex justify-center py-2" />
                </div>
              )}

            </div>

          </div>
        </main>

        {/* Login footer statement */}
        <footer className="relative z-10 px-6 py-5 max-w-7xl mx-auto w-full text-center border-t border-white/5">
          <p className="text-rose-100 text-xs font-semibold uppercase tracking-wider">
            Silver Oaks School Group © {new Date().getFullYear()} · Hyderabad · Bangalore · ODL · character before competence
          </p>
        </footer>

      </div>
    );
  }

  // Loaded full React application view
  return (
    <div className="flex flex-col min-h-screen bg-rose-50/10">
      
      {/* Dynamic Toast notifications overlay lists */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2.5 max-w-md w-full">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`p-4 rounded-xl border flex items-center justify-between shadow-2xl relative overflow-hidden transition-all duration-300 animate-slide-in ${
                t.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-950 border-l-4 border-l-emerald-600' 
                  : 'bg-rose-50 border-rose-100 text-rose-950 border-l-4 border-l-rose-700'
              }`}
            >
              <span className="text-xs sm:text-sm font-bold text-left">{t.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main navigation Header */}
      <Header
        user={user}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <main className="flex-grow">
        {renderCurrentPage()}
      </main>

      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}

// Reusable standard Forbidden access screen
function ForbiddenErrorPane({ onRedirect }: { onRedirect: () => void }) {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 text-[#B80F2E] flex items-center justify-center font-bold text-3xl mx-auto shadow-sm">
        🚫
      </div>
      <h2 className="text-2xl font-black text-gray-900 font-serif leading-none">Clearance Check Failed</h2>
      <p className="text-gray-500 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
        Access Denied. You need to be assigned as either an Editor or Admin from the counselor panel to view the command workspace.
      </p>
      <button 
        onClick={onRedirect}
        className="px-6 py-2.5 bg-[#B80F2E] text-white rounded-xl font-bold text-xs uppercase tracking-wider"
      >
        Return to Home Track
      </button>
    </div>
  );
}

// Reusable generic Not Found screen
function NotFoundErrorPane({ onRedirect }: { onRedirect: () => void }) {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-gray-900 flex items-center justify-center font-bold text-3xl mx-auto border border-rose-100 shadow-sm">
        🔍
      </div>
      <h2 className="text-2xl font-black text-gray-900 font-serif leading-none">Content Missing</h2>
      <p className="text-gray-500 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
        This page path does not currently exist. Try choosing another category option or link from the top navigation.
      </p>
      <button 
        onClick={onRedirect}
        className="px-6 py-2.5 bg-[#B80F2E] text-white rounded-xl font-bold text-xs uppercase tracking-wider"
      >
        Navigate to Home
      </button>
    </div>
  );
}
