/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileDown, User, Calendar, Pin, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { AppUser, Course, BlogPost, ReferenceMaterial, CareerLab, PinnableTable } from '../types';
import {
  fetchCourseById,
  fetchBlogById,
  fetchReferenceById,
  fetchCareerLabById,
  getYoutubeEmbedId,
  getPdfDownloadUrl,
  togglePinRecord
} from '../lib/supabase';
import { renderContentToHtml } from '../lib/renderContent';

interface DetailProps {
  type: 'course' | 'blog-item' | 'reference-item' | 'lab-item';
  id: string;
  user?: AppUser | null;
  onBack: () => void;
  setCurrentPage: (page: string) => void;
  setSelectedId: (id: string) => void;
  onNotify?: (msg: string, type?: 'success' | 'err') => void;
}

export default function ItemDetail({
  type,
  id,
  user,
  onBack,
  onNotify
}: DetailProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [reference, setReference] = useState<ReferenceMaterial | null>(null);
  const [lab, setLab] = useState<CareerLab | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItem() {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        if (type === 'course') {
          setCourse(await fetchCourseById(id));
        } else if (type === 'blog-item') {
          setBlog(await fetchBlogById(id));
        } else if (type === 'reference-item') {
          setReference(await fetchReferenceById(id));
        } else if (type === 'lab-item') {
          setLab(await fetchCareerLabById(id));
        }
      } catch (err) {
        console.error("Failed to load details for item id:", id, err);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [type, id]);

  const handleTogglePin = async (
    table: PinnableTable,
    itemId: string,
    title: string,
    currentlyPinned?: boolean
  ) => {
    if (!user?.isAdmin) return;
    const nextPinned = !currentlyPinned;
    if (table === 'courses' && course) setCourse({ ...course, IsPinned: nextPinned });
    if (table === 'blogs' && blog) setBlog({ ...blog, IsPinned: nextPinned });
    if (table === 'reference_materials' && reference) setReference({ ...reference, IsPinned: nextPinned });
    if (table === 'career_labs' && lab) setLab({ ...lab, IsPinned: nextPinned });

    await togglePinRecord(table, itemId, nextPinned);
    onNotify?.(
      nextPinned ? `Pinned "${title}" as an important student notice` : `Unpinned "${title}"`,
      'success'
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="spinner" />
        <p className="text-neutral-400 font-semibold uppercase tracking-wider text-xs mt-3">
          Loading...
        </p>
      </div>
    );
  }

  const renderTopBar = (
    backLabel: string,
    table: PinnableTable,
    itemId: string,
    title: string,
    isPinned?: boolean
  ) => (
    <div className="flex items-center justify-between gap-3 mb-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-bold text-neutral-700 hover:text-[#C8102E] hover:border-red-200 transition-colors cursor-pointer shadow-2xs"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{backLabel}</span>
      </button>

      {user?.isAdmin && (
        <button
          type="button"
          onClick={() => handleTogglePin(table, itemId, title, isPinned)}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
            isPinned
              ? 'bg-[#C8102E] text-white border-[#C8102E] hover:bg-[#9E0B24]'
              : 'bg-white text-[#C8102E] border-red-200 hover:bg-red-50'
          }`}
        >
          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
          <span>{isPinned ? 'Pinned as Important' : 'Pin as Important'}</span>
        </button>
      )}
    </div>
  );

  const renderPinnedBanner = (isPinned?: boolean) => {
    if (!isPinned) return null;
    return (
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#C8102E] to-[#9E0B24] text-white px-5 py-3.5 flex items-center gap-3.5 shadow-md">
        <span className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <Pin className="w-4 h-4 fill-current" />
        </span>
        <div className="text-left">
          <p className="text-[11px] font-bold uppercase tracking-wider text-red-100">
            Pinned · Important for Students
          </p>
          <p className="text-xs text-white/90">
            Highlighted by Silver Oaks Career Lab mentors for priority reading.
          </p>
        </div>
      </div>
    );
  };

  const renderPdfCard = (pdfLink: string, heading: string, subtext: string) => (
    <div className="bg-white border border-red-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shadow-xs">
      <div className="text-left flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-red-50 text-[#C8102E] border border-red-100 flex items-center justify-center shrink-0">
          <FileDown className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-display font-bold text-[#111114] text-sm leading-tight">{heading}</h4>
          <p className="text-xs text-neutral-500 mt-1">{subtext}</p>
        </div>
      </div>
      <a
        href={getPdfDownloadUrl(pdfLink)}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto justify-center px-5 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white font-bold rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
      >
        <FileDown className="w-3.5 h-3.5" />
        <span>
          {pdfLink.toLowerCase().includes("drive.google.com") || pdfLink.includes("/d/")
            ? "View PDF"
            : "Download PDF"}
        </span>
      </a>
    </div>
  );

  const renderVideoFrame = (embedId: string, label: string, frameTitle: string) => (
    <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden p-3 sm:p-4 mb-8 shadow-xs">
      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#C8102E] mb-2.5 px-1.5">
        <PlayCircle className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950">
        <iframe
          src={`https://www.youtube.com/embed/${embedId}`}
          title={frameTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0 absolute inset-0"
        />
      </div>
    </div>
  );

  // Course Details
  if (type === 'course' && course) {
    const embedId = getYoutubeEmbedId(course.YouTubeURL);
    return (
      <div className="bg-[#FAFAFA] min-h-screen">
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-left"
        >
          {renderTopBar('Back to Courses', 'courses', course.ID, course.Title, course.IsPinned)}
          {renderPinnedBanner(course.IsPinned)}

          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-9 mb-8 space-y-4">
            <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
              <span className="px-3 py-1 rounded-full bg-red-50 text-[#C8102E] border border-red-100">
                {course.Category || 'Course'}
              </span>
              {course.Grade && (
                <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700">
                  {course.Grade}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-bold text-[#111114] tracking-tight leading-tight">
              {course.Title}
            </h1>
            {course.Description && (
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">{course.Description}</p>
            )}
            <div className="flex items-center flex-wrap gap-4 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#C8102E]" />
                Mentor: <strong className="text-[#111114] font-semibold">{course.Instructor}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C8102E]" />
                Updated {new Date(course.UpdatedDate || course.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {embedId && renderVideoFrame(embedId, 'Video Session', 'Course Video')}
          {course.PDFLink && renderPdfCard(
            course.PDFLink,
            'Course Worksheet & PDF',
            'Download the accompanying slides, outlines, and exercises.'
          )}

          {course.Content && (
            <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 text-left">
              <h3 className="text-xl font-display font-bold text-[#111114] mb-6 pb-3 border-b border-neutral-100">
                Overview &amp; Notes
              </h3>
              <div
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: renderContentToHtml(course.Content) }}
              />
            </div>
          )}
        </motion.article>
      </div>
    );
  }

  // Blog Details
  if (type === 'blog-item' && blog) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen">
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-left"
        >
          {renderTopBar('Back to Stories', 'blogs', blog.ID, blog.Title, blog.IsPinned)}
          {renderPinnedBanner(blog.IsPinned)}

          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-9 mb-8 space-y-4">
            <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
              {(blog.Tags || '').split(',').filter(Boolean).map((t, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full bg-red-50 text-[#C8102E] border border-red-100">
                  #{t.trim()}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-4xl font-display font-bold text-[#111114] tracking-tight leading-tight">
              {blog.Title}
            </h1>

            <div className="flex items-center flex-wrap gap-4 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#C8102E]" />
                By <strong className="text-[#111114]">{blog.AuthorEmail.split('@')[0]}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C8102E]" />
                {new Date(blog.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {blog.FeaturedImageURL && (
            <div className="aspect-video w-full rounded-3xl overflow-hidden border border-neutral-200 mb-8 bg-neutral-100">
              <img src={blog.FeaturedImageURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          )}

          {blog.PDFLink && renderPdfCard(
            blog.PDFLink,
            'Attached PDF Guide',
            'Download the checklist or companion document.'
          )}

          {blog.Content && (
            <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 text-left">
              <div
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: renderContentToHtml(blog.Content) }}
              />
            </div>
          )}
        </motion.article>
      </div>
    );
  }

  // Reference Details
  if (type === 'reference-item' && reference) {
    const embedId = getYoutubeEmbedId(reference.YouTubeURL);
    return (
      <div className="bg-[#FAFAFA] min-h-screen">
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-left"
        >
          {renderTopBar('Back to Resources', 'reference_materials', reference.ID, reference.Title, reference.IsPinned)}
          {renderPinnedBanner(reference.IsPinned)}

          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-9 mb-8 space-y-4">
            <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
              <span className="px-3 py-1 rounded-full bg-red-50 text-[#C8102E] border border-red-100">
                {reference.Category || 'Template'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-bold text-[#111114] tracking-tight leading-tight">
              {reference.Title}
            </h1>
            {reference.Description && (
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">{reference.Description}</p>
            )}
            <div className="flex items-center flex-wrap gap-4 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#C8102E]" />
                Curated by <strong className="text-[#111114] font-semibold">{reference.Author}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C8102E]" />
                Updated {new Date(reference.UpdatedDate || reference.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {embedId && renderVideoFrame(embedId, 'Walkthrough Video', 'Resource Video')}
          {reference.PDFLink && renderPdfCard(
            reference.PDFLink,
            'Download Template / PDF',
            'Ready-to-use Career Lab document available offline.'
          )}

          {reference.Content && (
            <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 text-left">
              <h3 className="text-xl font-display font-bold text-[#111114] mb-6 pb-3 border-b border-neutral-100">
                Resource Guide
              </h3>
              <div
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: renderContentToHtml(reference.Content) }}
              />
            </div>
          )}
        </motion.article>
      </div>
    );
  }

  // CareerLab Details
  if (type === 'lab-item' && lab) {
    const embedId = getYoutubeEmbedId(lab.YouTubeURL);
    return (
      <div className="bg-[#FAFAFA] min-h-screen">
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-left"
        >
          {renderTopBar('Back to Career Lab', 'career_labs', lab.ID, lab.Title, lab.IsPinned)}
          {renderPinnedBanner(lab.IsPinned)}

          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-9 mb-8 space-y-4">
            <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
              <span className="px-3 py-1 rounded-full bg-red-50 text-[#C8102E] border border-red-100">
                {lab.Category || 'Lab Project'}
              </span>
              <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700">
                Student: {lab.Student}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-bold text-[#111114] tracking-tight leading-tight">
              {lab.Title}
            </h1>
            {lab.Description && (
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">{lab.Description}</p>
            )}
            <div className="flex items-center flex-wrap gap-4 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#C8102E]" />
                Mentor: <strong className="text-[#111114] font-semibold">{lab.Mentor}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C8102E]" />
                Published {new Date(lab.UpdatedDate || lab.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {embedId && renderVideoFrame(embedId, 'Project Showcase Video', 'Career Lab Video')}
          {lab.PDFLink && renderPdfCard(
            lab.PDFLink,
            'Project Paper & PDF',
            'Read or download the full Career Lab project report and findings.'
          )}

          {lab.Content && (
            <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 text-left">
              <h3 className="text-xl font-display font-bold text-[#111114] mb-6 pb-3 border-b border-neutral-100">
                Project Write-Up &amp; Findings
              </h3>
              <div
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: renderContentToHtml(lab.Content) }}
              />
            </div>
          )}
        </motion.article>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 text-center">
      <h3 className="font-display text-xl font-bold text-[#111114]">Item not found</h3>
      <p className="text-neutral-500 text-xs sm:text-sm mt-1.5">
        This Career Lab page could not be found.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-5 px-5 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
      >
        Go Back
      </button>
    </div>
  );
}
