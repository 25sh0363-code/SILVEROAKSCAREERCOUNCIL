/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Home as HomeIcon,
  BookOpen,
  Newspaper,
  Library,
  FlaskConical,
  Users,
  Settings2,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { AppUser } from '../types';
import Logo from './Logo';

interface HeaderProps {
  user: AppUser;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onLogout: () => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export default function Header({
  user,
  currentPage,
  setCurrentPage,
  onLogout,
  menuOpen,
  setMenuOpen
}: HeaderProps) {
  const getInitials = (name: string) => {
    return name?.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase() || 'U';
  };

  const navLinks = [
    { id: 'home', label: 'Home', shortLabel: 'Home', icon: HomeIcon },
    { id: 'courses', label: 'Courses', shortLabel: 'Courses', icon: BookOpen },
    { id: 'blog', label: 'Editorial', shortLabel: 'Editorial', icon: Newspaper },
    { id: 'references', label: 'Reference Library', shortLabel: 'Library', icon: Library },
    { id: 'career-lab', label: 'Career Lab', shortLabel: 'Lab', icon: FlaskConical },
    { id: 'counselors', label: 'Counsellors', shortLabel: 'Advisors', icon: Users },
  ];

  const isNavActive = (id: string) => {
    if (id === 'home') return currentPage === 'home';
    if (id === 'courses') return currentPage === 'courses' || currentPage === 'course';
    if (id === 'blog') return currentPage === 'blog' || currentPage === 'blog-item';
    if (id === 'references') return currentPage === 'references' || currentPage === 'reference-item';
    if (id === 'career-lab') return currentPage === 'career-lab' || currentPage === 'lab-item';
    return currentPage === id || currentPage.startsWith(id);
  };

  const mobileBottomLinks = navLinks.slice(0, 5);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-rose-100/90 shadow-[0_1px_12px_rgba(139,14,36,0.05)] transition-all">
        {/* Signature Silver Oaks crimson top hairline */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#6F091B] via-[#B80F2E] to-[#E11D48]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Brand */}
            <button
              type="button"
              className="flex items-center gap-3 cursor-pointer shrink-0 group focus:outline-none"
              onClick={() => {
                setCurrentPage('home');
                setMenuOpen(false);
              }}
            >
              <Logo className="h-9 sm:h-10 rounded-lg shadow-sm transition-transform duration-200 group-hover:scale-[1.03]" />
              <div className="hidden xl:flex flex-col text-left leading-none">
                <span className="font-serif font-semibold text-sm text-[#241115] tracking-tight">
                  Career Council
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#B80F2E] mt-0.5">
                  Silver Oaks Archive
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 mx-4">
              {navLinks.map((link) => {
                const active = isNavActive(link.id);
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => setCurrentPage(link.id)}
                    className={`relative px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                      active
                        ? 'text-[#9E0D28] bg-rose-50/90 font-semibold'
                        : 'text-[#574044] hover:text-[#9E0D28] hover:bg-rose-50/50'
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[#B80F2E]" />
                    )}
                  </button>
                );
              })}

              {user.isAdmin && (
                <button
                  type="button"
                  onClick={() => setCurrentPage('staff')}
                  className={`ml-1 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 border ${
                    currentPage === 'staff' || currentPage.startsWith('staff-')
                      ? 'bg-[#B80F2E] text-white border-[#B80F2E] shadow-sm'
                      : 'bg-rose-50/60 text-[#9E0D28] border-rose-200/80 hover:bg-rose-100/80'
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Staff Portal</span>
                </button>
              )}
            </nav>

            {/* Desktop User Utilities */}
            <div className="hidden lg:flex items-center gap-3.5 shrink-0">
              <div className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-[#FFF7F8] border border-rose-100">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#8B0E24] to-[#C81637] text-white font-semibold text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                  {getInitials(user.name)}
                </div>
                <div className="flex flex-col text-left leading-tight max-w-[140px]">
                  <span className="text-[#241115] font-semibold text-xs truncate" title={user.name}>
                    {user.name}
                  </span>
                  <span className="text-[10px] font-medium text-[#9E0D28]/80">{user.role}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="text-xs font-semibold text-[#6F4D53] hover:text-[#B80F2E] hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer py-2 px-3 rounded-lg border border-transparent hover:border-rose-100"
                title="Log out of session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>

            {/* Mobile / Tablet Controls */}
            <div className="flex lg:hidden items-center gap-2.5">
              {user.isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage('staff');
                    setMenuOpen(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 border transition-colors ${
                    currentPage === 'staff'
                      ? 'bg-[#B80F2E] text-white border-[#B80F2E]'
                      : 'bg-rose-50 text-[#9E0D28] border-rose-200'
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Staff</span>
                </button>
              )}

              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B0E24] to-[#C81637] text-white font-semibold text-xs flex items-center justify-center shadow-xs">
                {getInitials(user.name)}
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg text-[#574044] hover:text-[#B80F2E] hover:bg-rose-50 transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Slide-Down Drawer */}
        {menuOpen && (
          <div className="lg:hidden border-t border-rose-100 bg-white shadow-xl">
            <div className="px-4 py-4 space-y-1.5 text-left max-h-[80vh] overflow-y-auto">
              <div className="px-3 py-2.5 mb-2 rounded-xl bg-[#FFF6F7] border border-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B0E24] to-[#C81637] text-white font-semibold text-xs flex items-center justify-center shrink-0">
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[#241115] font-semibold text-sm truncate">{user.name}</div>
                    <div className="text-[11px] text-[#9E0D28] font-medium truncate">{user.role} · {user.email}</div>
                  </div>
                </div>
              </div>

              {navLinks.map((link) => {
                const active = isNavActive(link.id);
                const Icon = link.icon;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => {
                      setCurrentPage(link.id);
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 cursor-pointer ${
                      active
                        ? 'text-[#9E0D28] bg-rose-50 font-semibold border border-rose-100'
                        : 'text-[#4A2C32] hover:bg-rose-50/50 hover:text-[#9E0D28]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-[#B80F2E]' : 'text-[#8C6A70]'}`} />
                    <span>{link.label}</span>
                  </button>
                );
              })}

              {user.isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage('staff');
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 cursor-pointer ${
                    currentPage === 'staff' || currentPage.startsWith('staff-')
                      ? 'bg-[#B80F2E] text-white'
                      : 'text-[#9E0D28] bg-rose-50/60 hover:bg-rose-100/70 border border-rose-200/70'
                  }`}
                >
                  <Settings2 className="w-4 h-4" />
                  <span>Staff Admin Portal</span>
                </button>
              )}

              <div className="pt-3 mt-3 border-t border-rose-100">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full justify-center text-xs text-[#9E0D28] hover:bg-rose-50 font-semibold flex items-center gap-2 py-2.5 px-4 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Portal</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar for instant thumb reach */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-rose-100 shadow-[0_-4px_20px_rgba(139,14,36,0.06)] pb-safe"
      >
        <div className="grid grid-cols-5 h-16 px-1">
          {mobileBottomLinks.map((link) => {
            const active = isNavActive(link.id);
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  setCurrentPage(link.id);
                  setMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer relative ${
                  active ? 'text-[#B80F2E]' : 'text-[#7A5A60] hover:text-[#9E0D28]'
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-3 right-3 h-[2.5px] rounded-b-full bg-[#B80F2E]" />
                )}
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.25]' : 'stroke-[1.75]'}`} />
                <span className={`text-[10px] leading-none ${active ? 'font-bold' : 'font-medium'}`}>
                  {link.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
