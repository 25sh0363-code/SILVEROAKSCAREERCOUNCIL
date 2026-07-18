/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Mail, Award, Sparkles, Phone, ArrowLeft, ExternalLink, GraduationCap, Calendar, User, Heart } from 'lucide-react';
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
        const list = await fetchAllCounselors(true); // Published only
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
      
      {/* Back button and Header Info */}
      <div className="mb-10">
        <button 
          onClick={() => setCurrentPage('home')}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-rose-50/50 border border-rose-100 rounded-xl text-xs font-black uppercase tracking-wider text-gray-700 hover:text-[#B80F2E] transition-all cursor-pointer shadow-sm mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-[#B80F2E] font-bold text-[10px] uppercase tracking-wider mb-4">
          <Heart className="w-3.5 h-3.5 text-[#B80F2E]" />
          <span>Student Support Ecosystem</span>
        </div>
        
        <h1 className="text-3xl sm:text-4.5xl font-black text-gray-900 tracking-tight font-serif">
          Your Career Counsellors
        </h1>
        <p className="text-gray-500 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed">
          Meet our dedicated career counseling department. Get personalized advisory services for stream selection, competitive examinations, portfolio curation, and global university admissions.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="spinner border-t-[#B80F2E] animate-spin inline-block w-8 h-8 border-4 rounded-full border-rose-100 mb-4" />
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest animate-pulse">
            Connecting with counselor profiles...
          </p>
        </div>
      ) : counselors.length === 0 ? (
        <div className="bg-white rounded-3xl border border-rose-100 p-12 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-2xl mx-auto border border-rose-100 shadow-sm mb-4">
            🎓
          </div>
          <h3 className="text-lg font-bold text-gray-900 font-serif">No Counsellors Registered</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
            The career counselling roster is currently empty. Please sign into the Staff Portal to create counselor profiles.
          </p>
          <button 
            onClick={() => setCurrentPage('home')}
            className="mt-6 px-5 py-2.5 bg-[#B80F2E] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#8F0A22] transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {counselors.map((c, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              key={c.ID}
              id={`counsellor-card-${c.ID}`}
              className="bg-white rounded-3xl border border-rose-100/80 shadow-sm hover:shadow-xl hover:border-rose-200/60 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Photo Area at top */}
                <div className="aspect-[16/10] bg-rose-50/20 relative overflow-hidden border-b border-rose-50">
                  {c.ImageURL ? (
                    <img 
                      src={c.ImageURL} 
                      alt={c.Name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-rose-300">
                      <User className="w-16 h-16 stroke-1" />
                      <span className="text-[10px] font-extrabold uppercase tracking-widest mt-2">No Photo Provided</span>
                    </div>
                  )}
                  {/* Visual badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[#B80F2E] font-black text-[10px] uppercase tracking-wider shadow-sm border border-rose-100/40">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Advisory Board</span>
                    </span>
                  </div>
                </div>

                {/* Information Area in middle */}
                <div className="p-6 space-y-4">
                  {/* Name and Designation */}
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-950 tracking-tight font-serif group-hover:text-[#B80F2E] transition-colors leading-tight">
                      {c.Name}
                    </h3>
                  </div>

                  {/* Intro/Bio */}
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-medium">
                    {c.Intro}
                  </p>

                  <div className="border-t border-rose-100/60 pt-4 space-y-3.5">
                    {/* Qualifications */}
                    {c.Qualifications && (
                      <div className="flex items-start gap-2.5">
                        <Award className="w-4 h-4 text-[#B80F2E] shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-[9px] font-black uppercase tracking-wider text-gray-400">Qualifications</h4>
                          <p className="text-xs text-gray-800 font-bold leading-normal mt-0.5">{c.Qualifications}</p>
                        </div>
                      </div>
                    )}

                    {/* Extra Specialties / Info */}
                    {c.Extra && (
                      <div className="flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-[#B80F2E] shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-[9px] font-black uppercase tracking-wider text-gray-400">Advisory Focus</h4>
                          <p className="text-xs text-gray-600 font-semibold leading-relaxed mt-0.5">{c.Extra}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Footer block (stacked, beautifully spaced, zero collision possible) */}
              {c.Contact && (
                <div className="p-6 pt-0">
                  <div className="border-t border-gray-100 pt-5 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-[#B80F2E]" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-[9px] font-black uppercase tracking-wider text-gray-400">Email Contact</h5>
                        <p className="text-xs text-gray-700 font-bold truncate select-all leading-tight">{c.Contact}</p>
                      </div>
                    </div>
                    <a 
                      href={`mailto:${c.Contact}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#B80F2E] hover:bg-[#8F0A22] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm group-hover:shadow-md"
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

    </div>
  );
}
