/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, MapPin, ArrowUpRight } from 'lucide-react';
import Logo from './Logo';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export default function Footer({ setCurrentPage }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#7A0A1D] text-white pt-14 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 text-left">
          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
            <button
              type="button"
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-3 cursor-pointer group focus:outline-none"
            >
              <Logo className="h-10 rounded-lg shadow-sm" />
              <div className="flex flex-col text-left leading-tight">
                <span className="font-serif font-semibold text-base text-white">
                  Silver Oaks Career Council
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-200">
                  Internal Resource Center
                </span>
              </div>
            </button>

            <p className="text-red-100/80 text-sm max-w-md leading-relaxed">
              An academic resource center and counseling advisory ecosystem for students and faculty of Silver Oaks. Dedicated to ethical career development, research inquiry, and university guidance.
            </p>

            <p className="text-xs text-red-200 italic font-serif">
              “Character before Competence”
            </p>
          </div>

          {/* Archive Links */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-[11px] font-bold text-red-200 uppercase tracking-[0.16em]">
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
                    className="text-white/85 hover:text-white transition-colors focus:outline-none cursor-pointer text-left inline-flex items-center gap-1 group"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-red-200" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Advisory Desk */}
          <div className="md:col-span-4 space-y-3.5">
            <h4 className="text-[11px] font-bold text-red-200 uppercase tracking-[0.16em]">
              Advisory Desk
            </h4>
            <div className="space-y-3 text-sm text-red-100/90">
              <a
                href="mailto:careercounselling@hyd.silveroaks.co.in"
                className="flex items-center gap-2.5 text-white hover:text-red-200 font-medium transition-colors break-all"
              >
                <Mail className="w-4 h-4 text-red-200 shrink-0" />
                <span className="underline decoration-white/30 underline-offset-4">
                  careercounselling@hyd.silveroaks.co.in
                </span>
              </a>
              <div className="flex items-start gap-2.5 text-xs text-red-100/80">
                <MapPin className="w-4 h-4 text-red-200 shrink-0 mt-0.5" />
                <span>Bachupally Campus, Hyderabad & Bengaluru</span>
              </div>
              <p className="text-[11px] text-red-200/70 leading-relaxed">
                Internal institutional portal exclusively for authorized Silver Oaks students & faculty.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-red-200/80">
          <p>© {currentYear} Silver Oaks Career Council. All rights reserved.</p>
          <p>Academic Excellence & Direction</p>
        </div>
      </div>
    </footer>
  );
}
