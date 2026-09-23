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
    { id: 'home', label: 'Home' },
    { id: 'courses', label: 'Courses' },
    { id: 'blog', label: 'Editorial' },
    { id: 'references', label: 'Reference Library' },
    { id: 'career-lab', label: 'Career Lab' },
    { id: 'counselors', label: 'Counsellors' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-stone-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo Brand with clean alignment */}
          <div 
            className="flex items-center cursor-pointer shrink-0" 
            onClick={() => setCurrentPage('home')}
          >
            <Logo className="h-9 sm:h-10 transition-opacity hover:opacity-85" />
          </div>

          {/* Desktop Navigation Links - Clean, quiet typography */}
          <nav className="hidden md:flex items-center space-x-7 ml-8 mr-auto">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id || (link.id !== 'home' && currentPage.startsWith(link.id));
              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentPage(link.id)}
                  className={`relative py-1 text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#8B1D2C] font-semibold after:absolute after:bottom-[-6px] after:left-0 after:right-0 after:h-[2px] after:bg-[#8B1D2C]'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            
            {/* Staff Portal Link */}
            {user.isAdmin && (
              <button
                onClick={() => setCurrentPage('staff')}
                className={`py-1 text-sm font-medium transition-colors cursor-pointer ${
                  currentPage === 'staff' || currentPage.startsWith('staff-')
                    ? 'text-[#8B1D2C] font-semibold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Staff Portal
              </button>
            )}
          </nav>

          {/* Right utilities: User info & Logout */}
          <div className="hidden md:flex items-center gap-5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 font-medium text-xs flex items-center justify-center border border-stone-200 shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="flex flex-col text-left leading-tight max-w-[180px]">
                <span className="text-stone-900 font-medium text-xs truncate" title={user.name}>{user.name}</span>
                <span className="text-[10px] text-stone-500 tracking-wide mt-0.5">{user.role}</span>
              </div>
            </div>

            <span className="w-px h-4 bg-stone-200" aria-hidden="true" />

            <button
              onClick={onLogout}
              className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer py-1.5 px-2 hover:bg-stone-100 rounded"
              title="Log out of session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-800 font-medium text-xs flex items-center justify-center border border-stone-200">
              {getInitials(user.name)}
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-stone-600 hover:text-stone-900 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white shadow-lg">
          <div className="px-4 py-4 space-y-1 text-left">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id || (link.id !== 'home' && currentPage.startsWith(link.id));
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setCurrentPage(link.id);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#8B1D2C] bg-stone-50 font-semibold'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            {user.isAdmin && (
              <button
                onClick={() => {
                  setCurrentPage('staff');
                  setMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'staff' || currentPage.startsWith('staff-')
                    ? 'text-[#8B1D2C] bg-stone-50 font-semibold'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                Staff Portal
              </button>
            )}

            <div className="pt-3 mt-3 border-t border-stone-200 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-stone-900 font-medium text-xs truncate max-w-44">{user.name}</span>
                <span className="text-[10px] text-stone-500">{user.role}</span>
              </div>

              <button
                onClick={onLogout}
                className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1.5 py-1 px-2.5 rounded border border-stone-200"
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
