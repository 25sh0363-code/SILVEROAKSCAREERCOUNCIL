/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileDown, User, Calendar, Pin, PlayCircle } from 'lucide-react';
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
        <p className="text-neutral-500 font-semibold uppercase tracking-wider text-xs mt-3">
          Loading document...
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
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:text-[#C8102E] hover:border-[#C8102E]/40 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{backLabel}</span>
      </button>

      {/* Admin/Editor-only editorial pin control */}
      {user?.isAdmin && (
        <button
          type="button"
          onClick={() => handleTogglePin(table, itemId, title, isPinned)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            isPinned
              ? 'bg-[#C8102E] text-white border-[#C8102E] hover:bg-[#9E0B24]'
              : 'bg-white text-[#C8102E] border-[#C8102E]/30 hover:bg-red-50'
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
      <div className="mb-6 rounded-xl bg-red-50 border border-red-200 border-l-4 border-l-[#C8102E] px-4 py-3 flex items-center gap-3">
        <span className="w-7 h-7 rounded-lg bg-[#C8102E] text-white flex items-center justify-center shrink-0">
          <Pin className="w-3.5 h-3.5 fill-current" />
        </span>
        <div className="text-left">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#C8102E]">
            Pinned · Important Student Notice
          </p>
          <p className="text-xs text-neutral-700">
            Highlighted by the Silver Oaks Career Council for priority reading.
          </p>
        </div>
      </div>
    );
  };

  const renderPdfCard = (pdfLink: string, heading: string, subtext: string) => (
    <div className="bg-white border border-neutral-200 border-l-4 border-l-[#C8102E] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="text-left flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-[#C8102E] border border-red-100 flex items-center justify-center shrink-0">
          <FileDown className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-semibold text-[#141416] text-sm leading-tight">{heading}</h4>
          <p className="text-xs text-neutral-500 mt-1">{subtext}</p>
        </div>
      </div>
      <a
        href={getPdfDownloadUrl(pdfLink)}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto justify-center px-4 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
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
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden p-3 sm:p-4 mb-8">
      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#C8102E] mb-2.5 px-1">
        <PlayCircle className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-neutral-950">
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

  // Course Details Render
  if (type === 'course' && course) {
    const embedId = getYoutubeEmbedId(course.YouTubeURL);
    return (
      <div className="bg-[#FAFAFA] min-h-screen">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-left">
          {renderTopBar('Back to Courses', 'courses', course.ID, course.Title, course.IsPinned)}
          {renderPinnedBanner(course.IsPinned)}

          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 mb-8 space-y-4">
            <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
              <span className="px-2.5 py-0.5 rounded-md bg-red-50 text-[#C8102E] border border-red-100">
                {course.Category || 'General'}
              </span>
              {course.Grade && (
                <span className="px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                  {course.Grade}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-semibold text-[#141416] tracking-tight leading-tight">
              {course.Title}
            </h1>
            {course.Description && (
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">{course.Description}</p>
            )}
            <div className="flex items-center flex-wrap gap-4 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#C8102E]" />
                Instructor: <strong className="text-[#141416] font-semibold">{course.Instructor}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C8102E]" />
                Updated {new Date(course.UpdatedDate || course.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {embedId && renderVideoFrame(embedId, 'Video Lecture', 'Course Lecture')}
          {course.PDFLink && renderPdfCard(
            course.PDFLink,
            'Syllabus PDF Material',
            'Complementary worksheets, outlines, and task lists ready to download.'
          )}

          {course.Content && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-10 text-left">
              <h3 className="text-xl font-serif font-semibold text-[#141416] mb-6 pb-3 border-b border-neutral-100">
                Course Syllabus &amp; Readings
              </h3>
              <div
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: renderContentToHtml(course.Content) }}
              />
            </div>
          )}
        </article>
      </div>
    );
  }

  // BlogPost Details Render
  if (type === 'blog-item' && blog) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-left">
          {renderTopBar('Back to Editorial', 'blogs', blog.ID, blog.Title, blog.IsPinned)}
          {renderPinnedBanner(blog.IsPinned)}

          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 mb-8 space-y-4">
            <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
              {(blog.Tags || '').split(',').filter(Boolean).map((t, idx) => (
                <span key={idx} className="px-2.5 py-0.5 rounded-md bg-red-50 text-[#C8102E] border border-red-100">
                  #{t.trim()}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-semibold text-[#141416] tracking-tight leading-tight">
              {blog.Title}
            </h1>

            <div className="flex items-center flex-wrap gap-4 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#C8102E]" />
                Counselor Faculty ({blog.AuthorEmail.split('@')[0]})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C8102E]" />
                Published {new Date(blog.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {blog.FeaturedImageURL && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-neutral-200 mb-8 bg-neutral-100">
              <img
                src={blog.FeaturedImageURL}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {blog.PDFLink && renderPdfCard(
            blog.PDFLink,
            'Supplemental PDF Brief',
            'Official checklist guidelines available for offline reference.'
          )}

          {blog.Content && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-10 text-left">
              <div
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: renderContentToHtml(blog.Content) }}
              />
            </div>
          )}
        </article>
      </div>
    );
  }

  // Reference Details Render
  if (type === 'reference-item' && reference) {
    const embedId = getYoutubeEmbedId(reference.YouTubeURL);
    return (
      <div className="bg-[#FAFAFA] min-h-screen">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-left">
          {renderTopBar('Back to Library', 'reference_materials', reference.ID, reference.Title, reference.IsPinned)}
          {renderPinnedBanner(reference.IsPinned)}

          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 mb-8 space-y-4">
            <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
              <span className="px-2.5 py-0.5 rounded-md bg-red-50 text-[#C8102E] border border-red-100">
                {reference.Category || 'Templates'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-semibold text-[#141416] tracking-tight leading-tight">
              {reference.Title}
            </h1>
            {reference.Description && (
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">{reference.Description}</p>
            )}
            <div className="flex items-center flex-wrap gap-4 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#C8102E]" />
                Compiled by <strong className="text-[#141416] font-semibold">{reference.Author}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C8102E]" />
                Updated {new Date(reference.UpdatedDate || reference.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {embedId && renderVideoFrame(embedId, 'Briefing Video', 'Reference Lecture')}
          {reference.PDFLink && renderPdfCard(
            reference.PDFLink,
            'Reference Document PDF',
            'Standard CV outlines and tracking spreadsheets ready to download.'
          )}

          {reference.Content && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-10 text-left">
              <h3 className="text-xl font-serif font-semibold text-[#141416] mb-6 pb-3 border-b border-neutral-100">
                Official Document Details
              </h3>
              <div
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: renderContentToHtml(reference.Content) }}
              />
            </div>
          )}
        </article>
      </div>
    );
  }

  // CareerLab Details Render
  if (type === 'lab-item' && lab) {
    const embedId = getYoutubeEmbedId(lab.YouTubeURL);
    return (
      <div className="bg-[#FAFAFA] min-h-screen">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-left">
          {renderTopBar('Back to Career Lab', 'career_labs', lab.ID, lab.Title, lab.IsPinned)}
          {renderPinnedBanner(lab.IsPinned)}

          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 mb-8 space-y-4">
            <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
              <span className="px-2.5 py-0.5 rounded-md bg-red-50 text-[#C8102E] border border-red-100">
                {lab.Category || 'Research'}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                Student: {lab.Student}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-semibold text-[#141416] tracking-tight leading-tight">
              {lab.Title}
            </h1>
            {lab.Description && (
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">{lab.Description}</p>
            )}
            <div className="flex items-center flex-wrap gap-4 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#C8102E]" />
                Mentor: <strong className="text-[#141416] font-semibold">{lab.Mentor}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C8102E]" />
                Submitted {new Date(lab.UpdatedDate || lab.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {embedId && renderVideoFrame(embedId, 'Project Video', 'Career Lab Lecture')}
          {lab.PDFLink && renderPdfCard(
            lab.PDFLink,
            'Research Paper PDF',
            'Full research brief, data sheets, and analytical appendices.'
          )}

          {lab.Content && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-10 text-left">
              <h3 className="text-xl font-serif font-semibold text-[#141416] mb-6 pb-3 border-b border-neutral-100">
                Research Thesis &amp; Findings
              </h3>
              <div
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: renderContentToHtml(lab.Content) }}
              />
            </div>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 text-center">
      <h3 className="font-serif text-xl text-[#141416]">Resource not found</h3>
      <p className="text-neutral-500 text-xs sm:text-sm mt-1.5">
        The requested document could not be located in the archive.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-5 px-5 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
      >
        Return to Previous Page
      </button>
    </div>
  );
}
