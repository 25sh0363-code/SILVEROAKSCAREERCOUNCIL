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
    <footer className="bg-stone-50 text-stone-600 pt-16 pb-12 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center cursor-pointer" onClick={() => setCurrentPage('home')}>
              <Logo className="h-9 sm:h-10 opacity-90" />
            </div>
            
            <p className="text-stone-500 text-sm max-w-md leading-relaxed">
              An academic resource center and counseling advisory ecosystem for students and faculty of Silver Oaks. Dedicated to ethical career development, research inquiry, and university guidance.
            </p>

            <p className="text-xs text-stone-400 italic font-serif">
              Character before Competence
            </p>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-sm">
              {[
                { id: 'courses', label: 'Courses' },
                { id: 'blog', label: 'Guidance Editorial' },
                { id: 'references', label: 'Reference Library' },
                { id: 'career-lab', label: 'Career Laboratory' },
                { id: 'counselors', label: 'Advisory Roster' }
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => setCurrentPage(link.id)}
                    className="text-stone-500 hover:text-stone-900 transition-colors focus:outline-none cursor-pointer text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Advisory Desk</h4>
            <div className="space-y-2 text-sm text-stone-500 leading-relaxed">
              <p>
                <a href="mailto:careercounselling@hyd.silveroaks.co.in" className="text-stone-700 hover:text-[#8B1D2C] underline decoration-stone-300 underline-offset-2 transition-colors">
                  careercounselling@hyd.silveroaks.co.in
                </a>
              </p>
              <p className="text-xs text-stone-500">Bachupally Campus, Hyderabad & Bengaluru</p>
              <p className="text-[11px] text-stone-400">Internal institutional portal for authorized students & staff</p>
            </div>
          </div>

        </div>

        {/* Footer bottom */}
        <div className="mt-14 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <p>© {currentYear} Silver Oaks Career Council. All rights reserved.</p>
          <p className="text-stone-400">Academic Excellence & Direction</p>
        </div>

      </div>
    </footer>
  );
}
