/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';
import Logo from './Logo';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export default function Footer({ setCurrentPage }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-white to-[#FFF4F6] text-[#574044] pt-16 pb-24 md:pb-12 border-t border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 text-left">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <button
              type="button"
              className="flex items-center gap-3 cursor-pointer group focus:outline-none"
              onClick={() => setCurrentPage('home')}
            >
              <Logo className="h-10 rounded-lg shadow-xs transition-transform group-hover:scale-[1.03]" />
              <div className="flex flex-col text-left leading-tight">
                <span className="font-serif font-semibold text-base text-[#241115]">
                  Silver Oaks Career Council
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#B80F2E]">
                  Internal Resource Center
                </span>
              </div>
            </button>

            <p className="text-[#694D53] text-sm max-w-md leading-relaxed">
              An academic resource center and counseling advisory ecosystem for students and faculty of Silver Oaks. Dedicated to ethical career development, research inquiry, and university guidance.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-rose-100 text-xs text-[#9E0D28] font-serif italic shadow-2xs">
              Character before Competence
            </div>
          </div>

          {/* Resources */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold text-[#8B0E24] uppercase tracking-wider">
              Resource Archive
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { id: 'courses', label: 'Courses & Modules' },
                { id: 'blog', label: 'Guidance Editorial' },
                { id: 'references', label: 'Reference Library' },
                { id: 'career-lab', label: 'Career Laboratory' },
                { id: 'counselors', label: 'Advisory Roster' }
              ].map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(link.id)}
                    className="text-[#5C4146] hover:text-[#B80F2E] transition-colors focus:outline-none cursor-pointer text-left inline-flex items-center gap-1 group"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#B80F2E]" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Advisory Contact */}
          <div className="md:col-span-4 space-y-3.5">
            <h4 className="text-xs font-bold text-[#8B0E24] uppercase tracking-wider">
              Advisory Desk
            </h4>
            <div className="p-4 rounded-2xl bg-white border border-rose-100/90 shadow-2xs space-y-3 text-sm">
              <a
                href="mailto:careercounselling@hyd.silveroaks.co.in"
                className="flex items-center gap-2.5 text-[#241115] hover:text-[#B80F2E] font-medium transition-colors group break-all"
              >
                <span className="w-8 h-8 rounded-lg bg-rose-50 text-[#B80F2E] flex items-center justify-center shrink-0 group-hover:bg-[#B80F2E] group-hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                </span>
                <span className="text-xs sm:text-sm underline decoration-rose-200 underline-offset-2">
                  careercounselling@hyd.silveroaks.co.in
                </span>
              </a>
              <div className="flex items-start gap-2.5 text-xs text-[#694D53]">
                <MapPin className="w-4 h-4 text-[#B80F2E] shrink-0 mt-0.5" />
                <span>Bachupally Campus, Hyderabad & Bengaluru</span>
              </div>
              <div className="flex items-start gap-2.5 text-[11px] text-[#8A6970]">
                <ShieldCheck className="w-4 h-4 text-[#B80F2E]/70 shrink-0 mt-0.5" />
                <span>Internal institutional portal for authorized Silver Oaks students & staff</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-12 pt-6 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8A6970]">
          <p>© {currentYear} Silver Oaks Career Council. All rights reserved.</p>
          <p className="font-medium text-[#9E0D28]/80">Academic Excellence & Direction</p>
        </div>
      </div>
    </footer>
  );
}
