/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Newspaper, FolderGit, LogOut, CheckSquare, Settings2, Menu, X, GraduationCap } from 'lucide-react';
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
    { id: 'home', label: 'Home', icon: GraduationCap },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'blog', label: 'Blog', icon: Newspaper },
    { id: 'references', label: 'References', icon: FolderGit },
    { id: 'career-lab', label: 'Career Lab', icon: CheckSquare },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-rose-100 shadow-sm transition-all duration-300">
      {/* Red accent bar on top */}
      <div className="h-1 w-full bg-gradient-to-r from-[#8F0A22] via-[#B80F2E] to-[#EF4444]" />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20 sm:h-22">
          
          {/* Logo Brand with elegant spacing */}
          <div className="flex items-center cursor-pointer group shrink-0" onClick={() => setCurrentPage('home')}>
            <Logo className="h-12 lg:h-13 group-hover:scale-105 transition-all duration-300 shadow-sm rounded-xl" />
          </div>

          {/* Desktop Navigation Links - Spacious and beautifully optimized */}
          <nav className="hidden md:flex items-center space-x-3 lg:space-x-5 xl:space-x-7 ml-10 mr-auto">
            {navLinks.map((link) => {
              const LinkIcon = link.icon;
              const isActive = currentPage === link.id || (link.id !== 'home' && currentPage.startsWith(link.id));
              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentPage(link.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 lg:px-4.5 xl:px-5 rounded-xl text-xs lg:text-sm font-bold tracking-wider uppercase transition-all duration-200 ${
                    isActive
                      ? 'bg-rose-50 text-[#B80F2E] shadow-sm font-black'
                      : 'text-gray-600 hover:text-[#B80F2E] hover:bg-rose-50/50'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </button>
              );
            })}
            
            {/* Admin link */}
            {user.isAdmin && (
              <button
                onClick={() => setCurrentPage('staff')}
                className={`flex items-center gap-2 px-3 py-2.5 lg:px-4.5 xl:px-5 rounded-xl text-xs lg:text-sm font-bold tracking-wider transition-all duration-200 uppercase ${
                  currentPage === 'staff' || currentPage.startsWith('staff-')
                    ? 'bg-rose-900 text-white shadow-md font-black'
                    : 'text-rose-850 hover:text-[#B80F2E] hover:bg-rose-50'
                }`}
              >
                <Settings2 className="w-4 h-4 shrink-0" />
                <span>Staff Portal</span>
              </button>
            )}
          </nav>

          {/* Right utilities: User profile & Logout */}
          <div className="hidden md:flex items-center gap-6 shrink-0">
            
            {/* Profile Avatar Meta */}
            <div className="flex items-center gap-3 pr-4 border-r border-rose-100 max-w-sm">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-[#B80F2E] font-extrabold text-sm uppercase flex items-center justify-center border-2 border-rose-200 shadow-sm shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="flex flex-col text-left leading-tight max-w-[280px]">
                <span className="text-[#101827] font-black text-sm truncate" title={user.name}>{user.name}</span>
                <span className="text-[10px] text-rose-700 font-extrabold uppercase tracking-widest mt-0.5">{user.role}</span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 hover:text-red-700 hover:bg-rose-50 hover:border-rose-200 transition-all text-xs font-extrabold uppercase tracking-widest flex items-center gap-2"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Log out</span>
            </button>
          </div>

          {/* Hamburger trigger for mobile display */}
          <div className="flex md:hidden items-center gap-3">
            {/* Quick profile circle */}
            <div className="w-9 h-9 rounded-full bg-rose-100 text-[#B80F2E] font-black text-xs flex items-center justify-center border border-rose-200">
              {getInitials(user.name)}
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 rounded-xl text-gray-700 hover:text-[#B80F2E] hover:bg-rose-50 border border-gray-200 transition-all"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-rose-100 shadow-xl transition-all duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col text-left">
            {navLinks.map((link) => {
              const LinkIcon = link.icon;
              const isActive = currentPage === link.id || (link.id !== 'home' && currentPage.startsWith(link.id));
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setCurrentPage(link.id);
                    setMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all ${
                    isActive
                      ? 'bg-rose-50 text-[#B80F2E] border-rose-200/60 shadow-sm'
                      : 'text-gray-700 border-transparent hover:bg-rose-50/50 hover:text-[#B80F2E]'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}

            {user.isAdmin && (
              <button
                onClick={() => {
                  setCurrentPage('staff');
                  setMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all ${
                  currentPage === 'staff' || currentPage.startsWith('staff-')
                    ? 'bg-rose-950 text-white border-rose-950 shadow-md'
                    : 'text-rose-800 border-rose-200 bg-rose-50 hover:bg-rose-100/50'
                }`}
              >
                <Settings2 className="w-4 h-4" />
                <span>Staff Portal</span>
              </button>
            )}

            {/* Mobile User Profile Footer */}
            <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-[#B80F2E] font-bold text-xs flex items-center justify-center">
                  {getInitials(user.name)}
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-900 font-bold text-xs truncate max-w-44 text-[#101827]">{user.name}</span>
                  <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider">{user.role}</span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-rose-50 bg-white transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
