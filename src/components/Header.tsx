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
    { id: 'references', label: 'Library', shortLabel: 'Library', icon: Library },
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
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <button
              type="button"
              onClick={() => {
                setCurrentPage('home');
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 cursor-pointer shrink-0 group focus:outline-none"
            >
              <Logo className="h-9 sm:h-10 rounded-lg shadow-xs transition-transform duration-200 group-hover:scale-[1.03]" />
              <div className="flex flex-col text-left leading-none">
                <span className="font-serif font-semibold text-[15px] text-neutral-950 tracking-tight">
                  Career Council
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8102E] mt-0.5">
                  Silver Oaks
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isNavActive(link.id);
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => setCurrentPage(link.id)}
                    className={`relative px-3.5 py-2 rounded-lg text-[13px] transition-colors cursor-pointer ${
                      active
                        ? 'text-[#C8102E] font-semibold'
                        : 'text-neutral-600 hover:text-neutral-950 font-medium'
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#C8102E] rounded-full" />
                    )}
                  </button>
                );
              })}

              {user.isAdmin && (
                <button
                  type="button"
                  onClick={() => setCurrentPage('staff')}
                  className={`ml-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 border ${
                    currentPage === 'staff' || currentPage.startsWith('staff-')
                      ? 'bg-[#C8102E] text-white border-[#C8102E]'
                      : 'bg-white text-[#C8102E] border-[#C8102E]/30 hover:bg-red-50'
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Staff Portal</span>
                </button>
              )}
            </nav>

            {/* Desktop User Info */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#C8102E] text-white font-semibold text-xs flex items-center justify-center shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="flex flex-col text-left leading-tight max-w-[140px]">
                  <span className="text-neutral-900 font-semibold text-xs truncate" title={user.name}>
                    {user.name}
                  </span>
                  <span className="text-[11px] text-neutral-500">{user.role}</span>
                </div>
              </div>

              <span className="w-px h-5 bg-neutral-200" aria-hidden="true" />

              <button
                type="button"
                onClick={onLogout}
                className="text-xs font-medium text-neutral-500 hover:text-[#C8102E] transition-colors flex items-center gap-1.5 cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-red-50"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>

            {/* Mobile Controls */}
            <div className="flex lg:hidden items-center gap-2">
              {user.isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage('staff');
                    setMenuOpen(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 border transition-colors ${
                    currentPage === 'staff'
                      ? 'bg-[#C8102E] text-white border-[#C8102E]'
                      : 'bg-red-50 text-[#C8102E] border-red-200'
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Staff</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg text-neutral-700 hover:text-[#C8102E] hover:bg-red-50 transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {menuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white shadow-xl">
            <div className="px-4 py-4 space-y-1 text-left">
              <div className="px-3 py-3 mb-2 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#C8102E] text-white font-semibold text-xs flex items-center justify-center shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0">
                  <div className="text-neutral-950 font-semibold text-sm truncate">{user.name}</div>
                  <div className="text-xs text-neutral-500 truncate">{user.role} · {user.email}</div>
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
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 cursor-pointer ${
                      active
                        ? 'text-[#C8102E] bg-red-50 font-semibold'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-[#C8102E]' : 'text-neutral-400'}`} />
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
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 cursor-pointer ${
                    currentPage === 'staff'
                      ? 'bg-[#C8102E] text-white'
                      : 'text-[#C8102E] bg-red-50'
                  }`}
                >
                  <Settings2 className="w-4 h-4" />
                  <span>Staff Admin Portal</span>
                </button>
              )}

              <div className="pt-3 mt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full justify-center text-xs text-neutral-700 hover:text-[#C8102E] hover:bg-red-50 font-semibold flex items-center gap-2 py-2.5 px-4 rounded-xl border border-neutral-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Clean Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 pb-safe"
      >
        <div className="grid grid-cols-5 h-15">
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
                  active ? 'text-[#C8102E]' : 'text-neutral-500'
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-4 right-4 h-[2px] bg-[#C8102E] rounded-b-full" />
                )}
                <Icon className={`w-[19px] h-[19px] ${active ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
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
