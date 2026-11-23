/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Award,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  GraduationCap,
  User
} from 'lucide-react';
import { Counselor } from '../types';
import { fetchAllCounselors } from '../lib/supabase';
import { motion } from 'motion/react';

interface CounsellorsProps {
  setCurrentPage: (page: string) => void;
}

export default function Counsellors({ setCurrentPage }: CounsellorsProps) {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const list = await fetchAllCounselors(true);
        setCounselors(list);
      } catch (err) {
        console.error("Failed to load counsellors data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen text-left bg-[#FAFAFA] text-[#141416]">
      {/* Crisp White Editorial Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <button
            type="button"
            onClick={() => setCurrentPage('home')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#C8102E] transition-colors cursor-pointer mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#C8102E] mb-2">
                <span className="w-5 h-[2px] bg-[#C8102E] inline-block" />
                <span>Advisory Department</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-[#141416]">
                Your Career Counsellors
              </h1>
              <p className="text-neutral-600 text-sm sm:text-base mt-2 leading-relaxed">
                Connect with our career counseling faculty for stream selection, standardized test planning, portfolio review, and global university admissions.
              </p>
            </div>
            {!loading && (
              <span className="px-3 py-1.5 rounded-full bg-[#FAFAFA] border border-neutral-200 text-xs font-semibold text-neutral-700 shrink-0 self-start md:self-auto">
                {counselors.length} {counselors.length === 1 ? 'Counsellor' : 'Counsellors'}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main Directory Grid */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 flex-1">
        {loading ? (
          <div className="py-24 text-center">
            <div className="spinner" />
            <p className="text-xs text-neutral-500 font-semibold uppercase tracking-widest mt-3">
              Loading counselor directory...
            </p>
          </div>
        ) : counselors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-10 sm:p-14 text-center max-w-xl mx-auto">
            <div className="w-12 h-12 bg-red-50 text-[#C8102E] rounded-xl flex items-center justify-center mx-auto border border-red-100 mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-[#141416] font-serif">
              No Counsellors Registered
            </h3>
            <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
              The career counselling roster is currently empty. Advisors can add profiles from the Staff Portal.
            </p>
            <button
              type="button"
              onClick={() => setCurrentPage('home')}
              className="mt-6 px-5 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Return Home
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {counselors.map((c, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                key={c.ID}
                id={`counsellor-card-${c.ID}`}
                className="bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Area */}
                  <div className="aspect-[16/10] bg-neutral-100 relative overflow-hidden border-b border-neutral-100">
                    {c.ImageURL ? (
                      <img
                        src={c.ImageURL}
                        alt={c.Name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-[#C8102E]">
                        <User className="w-14 h-14 stroke-[1.25]" />
                      </div>
                    )}
                    <div className="absolute top-3.5 left-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 text-[#141416] font-bold text-[10px] uppercase tracking-wider shadow-xs">
                        <GraduationCap className="w-3.5 h-3.5 text-[#C8102E]" />
                        <span>Advisory Board</span>
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-[#141416] tracking-tight font-serif group-hover:text-[#C8102E] transition-colors leading-snug">
                      {c.Name}
                    </h3>

                    {c.Intro && (
                      <p className="text-neutral-600 text-sm leading-relaxed">
                        {c.Intro}
                      </p>
                    )}

                    {(c.Qualifications || c.Extra) && (
                      <div className="border-t border-neutral-100 pt-4 space-y-3">
                        {c.Qualifications && (
                          <div className="flex items-start gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-red-50 text-[#C8102E] flex items-center justify-center shrink-0 mt-0.5">
                              <Award className="w-4 h-4" />
                            </span>
                            <div>
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                Qualifications
                              </h4>
                              <p className="text-xs text-[#141416] font-semibold leading-normal mt-0.5">
                                {c.Qualifications}
                              </p>
                            </div>
                          </div>
                        )}

                        {c.Extra && (
                          <div className="flex items-start gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-red-50 text-[#C8102E] flex items-center justify-center shrink-0 mt-0.5">
                              <Sparkles className="w-4 h-4" />
                            </span>
                            <div>
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                Advisory Focus
                              </h4>
                              <p className="text-xs text-neutral-700 font-medium leading-relaxed mt-0.5">
                                {c.Extra}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Footer */}
                {c.Contact && (
                  <div className="p-6 pt-0">
                    <div className="border-t border-neutral-100 pt-4 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-neutral-200 flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4 text-[#C8102E]" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            Email
                          </h5>
                          <p className="text-xs text-[#141416] font-semibold truncate select-all leading-tight">
                            {c.Contact}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`mailto:${c.Contact}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        <span>Connect via Email</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
