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
    <footer className="bg-[#6B0718] text-white relative overflow-hidden pt-14 pb-28 md:pb-12">
      <div className="absolute inset-0 bg-lab-dots-white opacity-35 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 text-left">
          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
            <button
              type="button"
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-3 cursor-pointer group focus:outline-none"
            >
              <Logo className="h-10 rounded-xl shadow-md" />
              <div className="flex flex-col text-left leading-tight">
                <span className="font-display font-bold text-lg text-white tracking-tight">
                  Silver Oaks Career Lab
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-200">
                  Explore · Build · Launch
                </span>
              </div>
            </button>

            <p className="text-red-100/80 text-sm max-w-md leading-relaxed">
              The student career launchpad at Silver Oaks—built for exploring real fields, publishing hands-on lab projects, taking workshops, and connecting with career counsellors.
            </p>
          </div>

          {/* Explore Links */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-[11px] font-bold text-red-200 uppercase tracking-[0.18em]">
              Explore Lab
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { id: 'career-lab', label: 'Career Lab Projects' },
                { id: 'courses', label: 'Courses & Workshops' },
                { id: 'blog', label: 'Stories & Updates' },
                { id: 'references', label: 'Templates & Resources' },
                { id: 'counselors', label: 'Career Counsellors' }
              ].map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(link.id)}
                    className="text-white/85 hover:text-white font-medium transition-colors focus:outline-none cursor-pointer text-left inline-flex items-center gap-1 group"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-red-200" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4 space-y-3.5">
            <h4 className="text-[11px] font-bold text-red-200 uppercase tracking-[0.18em]">
              Connect
            </h4>
            <div className="space-y-3 text-sm text-red-100/90">
              <a
                href="mailto:careercounselling@hyd.silveroaks.co.in"
                className="inline-flex items-center gap-2.5 text-white hover:text-red-200 font-semibold transition-colors break-all"
              >
                <Mail className="w-4 h-4 text-red-200 shrink-0" />
                <span className="underline decoration-white/30 underline-offset-4">
                  careercounselling@hyd.silveroaks.co.in
                </span>
              </a>
              <div className="flex items-start gap-2.5 text-xs text-red-100/80">
                <MapPin className="w-4 h-4 text-red-200 shrink-0 mt-0.5" />
                <span>Silver Oaks International Schools · Hyderabad, Bengaluru, Vizag &amp; ODL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-red-200/80">
          <p>© {currentYear} Silver Oaks Career Lab</p>
          <p className="font-medium">Character before Competence</p>
        </div>
      </div>
    </footer>
  );
}
