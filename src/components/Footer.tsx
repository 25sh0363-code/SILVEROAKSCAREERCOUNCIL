/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Link2 } from 'lucide-react';
import Logo from './Logo';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export default function Footer({ setCurrentPage }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-gray-600 pt-16 pb-8 border-t border-rose-100 relative overflow-hidden select-none">
      
      {/* Decorative rose/red vector grid pattern overlay representing strict design guidelines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#fce7f3_1px,transparent_1px),linear-gradient(to_bottom,#fce7f3_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center cursor-pointer group" onClick={() => setCurrentPage('home')}>
              <Logo className="h-11 sm:h-12 shadow-sm rounded-xl" />
            </div>
            
            <p className="text-gray-550 text-sm max-w-md leading-relaxed font-medium">
              Designed as an integrated workspace for career path discovery, aptitude planning, and research publication. Empowering Silver Oaks members to establish world-class personal portfolios.
            </p>

            <div className="inline-block px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl text-[#B80F2E] font-black text-xs uppercase tracking-widest">
              ★ Character before Competence ★
            </div>
          </div>

          {/* Quick links Col */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Resources</h4>
            <ul className="space-y-3 text-sm">
              {[
                { id: 'courses', label: 'Courses' },
                { id: 'blog', label: 'Blog Publication' },
                { id: 'references', label: 'Reference Library' },
                { id: 'career-lab', label: 'Career Laboratory' }
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => setCurrentPage(link.id)}
                    className="text-gray-550 hover:text-[#B80F2E] font-bold transition-colors duration-200 flex items-center gap-2 focus:outline-none cursor-pointer"
                  >
                    <Link2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Platform Contact</h4>
            <div className="space-y-3 text-sm text-gray-550 leading-relaxed font-semibold">
              <p>Email: <a href="mailto:info@silveroaksschool.edu" className="text-[#B80F2E] hover:underline font-bold transition-colors">info@silveroaksschool.edu</a></p>
              <p className="font-medium text-gray-500">Hyderabad Bachupally Campus & Bengaluru</p>
              <div className="pt-1">
                <span className="text-[10px] bg-rose-50 border border-rose-100 text-[#B80F2E] px-3.5 py-1.5 rounded-lg font-extrabold uppercase tracking-widest inline-block shadow-sm">
                  Authorized Members Only
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer bottom credit guidelines */}
        <div className="mt-16 pt-8 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-extrabold uppercase tracking-wider">
          <p>© {currentYear} Silver Oaks Career Council. All Rights Reserved.</p>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
            <span>Developed with pride</span>
            <Heart className="w-4 h-4 text-[#B80F2E] fill-[#B80F2E] animate-pulse" />
            <span>for academic excellence</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
