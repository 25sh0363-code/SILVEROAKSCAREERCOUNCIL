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
  X,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppUser } from '../types';
import Logo from './Logo';

interface HeaderProps {
  user: AppUser;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onLogout: () => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  onOpenSearch?: () => void;
}

export default function Header({
  user,
  currentPage,
  setCurrentPage,
  onLogout,
  menuOpen,
  setMenuOpen,
  onOpenSearch
}: HeaderProps) {
  const getInitials = (name: string) => {
    return name?.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase() || 'U';
  };

  const navLinks = [
    { id: 'home', label: 'Home', shortLabel: 'Home', icon: HomeIcon },
    { id: 'career-lab', label: 'Career Lab', shortLabel: 'Lab', icon: FlaskConical },
    { id: 'courses', label: 'Courses', shortLabel: 'Courses', icon: BookOpen },
    { id: 'blog', label: 'Stories', shortLabel: 'Stories', icon: Newspaper },
    { id: 'references', label: 'Resources', shortLabel: 'Resources', icon: Library },
    { id: 'counselors', label: 'Counsellors', shortLabel: 'Mentors', icon: Users },
  ];

  const isNavActive = (id: string) => {
    if (id === 'home') return currentPage === 'home';
    if (id === 'courses') return currentPage === 'courses' || currentPage === 'course';
    if (id === 'blog') return currentPage === 'blog' || currentPage === 'blog-item';
    if (id === 'references') return currentPage === 'references' || currentPage === 'reference-item';
    if (id === 'career-lab') return currentPage === 'career-lab' || currentPage === 'lab-item';
    return currentPage === id || currentPage.startsWith(id);
  };

  const mobileDockLinks = navLinks.slice(0, 5);

  return (
    <>
      {/* Sleek Modern Floating-Feel Header */}
      <header className="sticky top-0 z-50 w-full bg-white/88 backdrop-blur-xl border-b border-neutral-200/75">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px] gap-3">
            {/* Brand Lockup — Silver Oaks Career Lab */}
            <button
              type="button"
              onClick={() => {
                setCurrentPage('home');
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 cursor-pointer shrink-0 group focus:outline-none"
            >
              <Logo className="h-9 sm:h-10 rounded-xl shadow-xs transition-transform duration-200 group-hover:scale-105" />
              <div className="flex flex-col text-left leading-none">
                <span className="font-display font-bold text-[15px] sm:text-base text-[#111114] tracking-tight">
                  Career<span className="text-[#C8102E]">Lab</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400 mt-0.5">
                  Silver Oaks
                </span>
              </div>
            </button>

            {/* Centered Segmented Pill Navigation (Desktop) */}
            <nav
              aria-label="Primary navigation"
              className="hidden xl:flex items-center bg-neutral-100/85 p-1 rounded-full border border-neutral-200/70"
            >
              {navLinks.map((link) => {
                const active = isNavActive(link.id);
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => setCurrentPage(link.id)}
                    className={`relative px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors cursor-pointer ${
                      active ? 'text-white' : 'text-neutral-600 hover:text-[#111114]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="careerLabActivePill"
                        transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                        className="absolute inset-0 bg-[#C8102E] rounded-full shadow-xs"
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Compact Desktop Nav (lg to xl) */}
            <nav
              aria-label="Primary navigation"
              className="hidden lg:flex xl:hidden items-center bg-neutral-100/85 p-1 rounded-full border border-neutral-200/70"
            >
              {navLinks.map((link) => {
                const active = isNavActive(link.id);
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => setCurrentPage(link.id)}
                    className={`relative px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      active ? 'text-white' : 'text-neutral-600 hover:text-[#111114]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="careerLabActivePillLg"
                        transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                        className="absolute inset-0 bg-[#C8102E] rounded-full shadow-xs"
                      />
                    )}
                    <span className="relative z-10">{link.shortLabel}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Actions (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {onOpenSearch && (
                <button
                  type="button"
                  onClick={onOpenSearch}
                  className="inline-flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-full bg-neutral-100 hover:bg-red-50 border border-neutral-200/80 hover:border-[#C8102E]/30 text-xs font-medium text-neutral-500 hover:text-[#C8102E] transition-all cursor-pointer"
                  title="Quick Search (Cmd/Ctrl + K)"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Search</span>
                  <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-neutral-200 text-neutral-400">
                    ⌘K
                  </kbd>
                </button>
              )}

              {user.isAdmin && (
                <button
                  type="button"
                  onClick={() => setCurrentPage('staff')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 border ${
                    currentPage === 'staff' || currentPage.startsWith('staff-')
                      ? 'bg-[#111114] text-white border-[#111114]'
                      : 'bg-red-50 text-[#C8102E] border-red-200 hover:bg-[#C8102E] hover:text-white hover:border-[#C8102E]'
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Studio</span>
                </button>
              )}

              {/* User Pill */}
              <div className="flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-full bg-neutral-50 border border-neutral-200/80">
                <div
                  className="w-7 h-7 rounded-full bg-[#C8102E] text-white font-bold text-[11px] flex items-center justify-center shrink-0"
                  title={`${user.name} (${user.role})`}
                >
                  {getInitials(user.name)}
                </div>
                <span className="text-xs font-semibold text-[#111114] max-w-[100px] truncate hidden xl:inline">
                  {user.name.split(' ')[0]}
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-[#C8102E] hover:bg-white transition-colors cursor-pointer"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mobile Top Actions */}
            <div className="flex lg:hidden items-center gap-1.5">
              {onOpenSearch && (
                <button
                  type="button"
                  onClick={onOpenSearch}
                  className="p-2.5 rounded-full bg-neutral-100 text-neutral-700 hover:bg-red-50 hover:text-[#C8102E] transition-colors cursor-pointer"
                  aria-label="Search Career Lab"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}

              {user.isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage('staff');
                    setMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-full text-[11px] font-bold inline-flex items-center gap-1 border transition-colors ${
                    currentPage === 'staff'
                      ? 'bg-[#111114] text-white border-[#111114]'
                      : 'bg-red-50 text-[#C8102E] border-red-200'
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Studio</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2.5 rounded-full bg-neutral-100 text-neutral-800 hover:text-[#C8102E] hover:bg-red-50 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Menu Sheet */}
        {menuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white shadow-2xl">
            <div className="px-4 py-4 space-y-1.5 text-left">
              <div className="px-3.5 py-3 mb-2 rounded-2xl bg-[#FAFAFA] border border-neutral-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C8102E] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0">
                  <div className="text-[#111114] font-bold text-sm truncate">{user.name}</div>
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
                    className={`w-full text-left px-3.5 py-3 rounded-2xl text-sm font-semibold transition-colors flex items-center gap-3 cursor-pointer ${
                      active
                        ? 'text-white bg-[#C8102E]'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-neutral-400'}`} />
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
                  className={`w-full text-left px-3.5 py-3 rounded-2xl text-sm font-semibold transition-colors flex items-center gap-3 cursor-pointer ${
                    currentPage === 'staff'
                      ? 'bg-[#111114] text-white'
                      : 'text-[#C8102E] bg-red-50'
                  }`}
                >
                  <Settings2 className="w-4 h-4" />
                  <span>Career Lab Studio (Admin)</span>
                </button>
              )}

              <div className="pt-3 mt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full justify-center text-xs text-neutral-700 hover:text-[#C8102E] hover:bg-red-50 font-bold flex items-center gap-2 py-3 px-4 rounded-2xl border border-neutral-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Floating Native-Feel Mobile Bottom Dock */}
      <div className="md:hidden fixed bottom-3 inset-x-3 z-40 pointer-events-none pb-safe">
        <nav
          aria-label="Mobile navigation dock"
          className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-neutral-200/90 rounded-2xl shadow-[0_12px_36px_rgba(17,17,20,0.14)] px-1.5 py-1.5"
        >
          <div className="grid grid-cols-5 gap-0.5">
            {mobileDockLinks.map((link) => {
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
                  className={`relative flex flex-col items-center justify-center py-2 rounded-xl transition-colors cursor-pointer ${
                    active ? 'text-white' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="mobileDockActive"
                      transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                      className="absolute inset-0 bg-[#C8102E] rounded-xl shadow-xs"
                    />
                  )}
                  <Icon className="relative z-10 w-[18px] h-[18px] stroke-[2]" />
                  <span className="relative z-10 text-[10px] font-bold leading-none mt-1">
                    {link.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
