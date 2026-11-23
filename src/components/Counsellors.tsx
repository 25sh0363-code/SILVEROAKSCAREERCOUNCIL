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
  User,
  Heart
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
    <div className="flex flex-col min-h-screen text-left bg-[#FFFBFB]">
      {/* Crimson Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#6B081B] via-[#9E0D28] to-[#C21434] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_90%_-20%,rgba(255,255,255,0.16),transparent)] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto">
          <button
            type="button"
            onClick={() => setCurrentPage('home')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-semibold text-white transition-all cursor-pointer mb-5 backdrop-blur-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2 text-rose-100 text-xs font-semibold uppercase tracking-[0.16em] mb-2">
            <Heart className="w-3.5 h-3.5" />
            <span>Student Support Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-white">
            Your Career Counsellors
          </h1>
          <p className="text-rose-100/90 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed">
            Meet our dedicated career counseling department. Get personalized advisory services for stream selection, competitive examinations, portfolio curation, and global university admissions.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1">
        {loading ? (
          <div className="py-24 text-center">
            <div className="spinner" />
            <p className="text-xs text-[#8A6970] font-semibold uppercase tracking-widest mt-3">
              Connecting with counselor profiles...
            </p>
          </div>
        ) : counselors.length === 0 ? (
          <div className="bg-white rounded-3xl border border-rose-100 p-10 sm:p-14 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-14 h-14 bg-rose-50 text-[#B80F2E] rounded-2xl flex items-center justify-center mx-auto border border-rose-100 mb-4">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-semibold text-[#241115] font-serif">
              No Counsellors Registered
            </h3>
            <p className="text-xs sm:text-sm text-[#694D53] mt-2 leading-relaxed">
              The career counselling roster is currently empty. Please sign into the Staff Portal to create counselor profiles.
            </p>
            <button
              type="button"
              onClick={() => setCurrentPage('home')}
              className="mt-6 px-5 py-2.5 bg-[#B80F2E] text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#8B0E24] transition-colors cursor-pointer"
            >
              Go to Homepage
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-left">
            {counselors.map((c, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.07 }}
                key={c.ID}
                id={`counsellor-card-${c.ID}`}
                className="bg-white rounded-2xl border border-rose-100 shadow-xs hover:shadow-lg hover:border-rose-200 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Area */}
                  <div className="aspect-[16/10] bg-gradient-to-br from-[#FFF2F4] to-[#FFE4E8] relative overflow-hidden border-b border-rose-100">
                    {c.ImageURL ? (
                      <img
                        src={c.ImageURL}
                        alt={c.Name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#C85A6D]">
                        <User className="w-14 h-14 stroke-[1.25]" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest mt-2">
                          Advisory Profile
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3.5 left-3.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#9E0D28] font-bold text-[10px] uppercase tracking-wider shadow-xs border border-rose-100">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Advisory Board</span>
                      </span>
                    </div>
                  </div>

                  {/* Info Body */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-[#241115] tracking-tight font-serif group-hover:text-[#B80F2E] transition-colors leading-snug">
                      {c.Name}
                    </h3>

                    <p className="text-[#5C4146] text-sm leading-relaxed">
                      {c.Intro}
                    </p>

                    {(c.Qualifications || c.Extra) && (
                      <div className="border-t border-rose-100/80 pt-4 space-y-3.5">
                        {c.Qualifications && (
                          <div className="flex items-start gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-rose-50 text-[#B80F2E] flex items-center justify-center shrink-0 mt-0.5">
                              <Award className="w-4 h-4" />
                            </span>
                            <div>
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#9E6E77]">
                                Qualifications
                              </h4>
                              <p className="text-xs text-[#241115] font-semibold leading-normal mt-0.5">
                                {c.Qualifications}
                              </p>
                            </div>
                          </div>
                        )}

                        {c.Extra && (
                          <div className="flex items-start gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-rose-50 text-[#B80F2E] flex items-center justify-center shrink-0 mt-0.5">
                              <Sparkles className="w-4 h-4" />
                            </span>
                            <div>
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#9E6E77]">
                                Advisory Focus
                              </h4>
                              <p className="text-xs text-[#4A2C32] font-medium leading-relaxed mt-0.5">
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
                    <div className="border-t border-rose-100/80 pt-4 space-y-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4 text-[#B80F2E]" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#9E6E77]">
                            Email Contact
                          </h5>
                          <p className="text-xs text-[#241115] font-semibold truncate select-all leading-tight">
                            {c.Contact}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`mailto:${c.Contact}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8B0E24] to-[#B80F2E] hover:brightness-110 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                      >
                        <span>Connect via Email</span>
                        <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
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
