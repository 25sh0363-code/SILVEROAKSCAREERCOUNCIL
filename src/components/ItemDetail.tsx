/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileDown, User, Calendar, Pin, PlayCircle } from 'lucide-react';
import { Course, BlogPost, ReferenceMaterial, CareerLab, PinnableTable } from '../types';
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
  onBack: () => void;
  setCurrentPage: (page: string) => void;
  setSelectedId: (id: string) => void;
  onNotify?: (msg: string, type?: 'success' | 'err') => void;
}

export default function ItemDetail({
  type,
  id,
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
    const nextPinned = !currentlyPinned;
    if (table === 'courses' && course) setCourse({ ...course, IsPinned: nextPinned });
    if (table === 'blogs' && blog) setBlog({ ...blog, IsPinned: nextPinned });
    if (table === 'reference_materials' && reference) setReference({ ...reference, IsPinned: nextPinned });
    if (table === 'career_labs' && lab) setLab({ ...lab, IsPinned: nextPinned });

    await togglePinRecord(table, itemId, nextPinned);
    onNotify?.(
      nextPinned ? `Pinned "${title}" to top` : `Unpinned "${title}"`,
      'success'
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="spinner" />
        <p className="text-[#8A6970] font-semibold uppercase tracking-wider text-xs mt-3">
          Loading details...
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
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-xs font-semibold text-[#8B0E24] hover:bg-rose-50 transition-colors cursor-pointer shadow-2xs"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{backLabel}</span>
      </button>

      <button
        type="button"
        onClick={() => handleTogglePin(table, itemId, title, isPinned)}
        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
          isPinned
            ? 'bg-[#B80F2E] text-white border-[#B80F2E]'
            : 'bg-white text-[#8B0E24] border-rose-200 hover:bg-rose-50'
        }`}
      >
        <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : ''}`} />
        <span>{isPinned ? 'Pinned Post' : 'Pin Post'}</span>
      </button>
    </div>
  );

  const renderPdfCard = (pdfLink: string, heading: string, subtext: string) => (
    <div className="bg-gradient-to-r from-[#FFF5F6] to-white border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shadow-2xs">
      <div className="text-left flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#B80F2E] text-white flex items-center justify-center shrink-0 shadow-xs">
          <FileDown className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-semibold text-[#241115] text-sm leading-tight">{heading}</h4>
          <p className="text-xs text-[#694D53] mt-1">{subtext}</p>
        </div>
      </div>
      <a
        href={getPdfDownloadUrl(pdfLink)}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto justify-center px-4 py-2.5 bg-gradient-to-r from-[#8B0E24] to-[#B80F2E] hover:brightness-110 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs"
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
    <div className="bg-white rounded-2xl border border-rose-100 overflow-hidden p-3 sm:p-4 mb-8 shadow-2xs">
      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#B80F2E] mb-2.5 px-1">
        <PlayCircle className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#241115]">
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
      <div className="bg-[#FFFBFB] min-h-screen">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-left">
          {renderTopBar('Back to Courses', 'courses', course.ID, course.Title, course.IsPinned)}

          <div className="bg-white rounded-2xl border border-rose-100 p-6 sm:p-8 mb-8 shadow-2xs space-y-3.5">
            <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
              {course.IsPinned && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B80F2E] text-white">
                  <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-[#B80F2E] border border-rose-100">
                {course.Category}
              </span>
              {course.Grade && (
                <span className="text-[#8A6970]">· Grade {course.Grade}</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-semibold text-[#241115] tracking-tight leading-tight">
              {course.Title}
            </h1>
            {course.Description && (
              <p className="text-sm text-[#5C4146] leading-relaxed">{course.Description}</p>
            )}
            <div className="flex items-center flex-wrap gap-4 pt-2 border-t border-rose-100/80 text-xs text-[#8A6970]">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#B80F2E]" />
                Instructor: <strong className="text-[#241115] font-semibold">{course.Instructor}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#B80F2E]" />
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
            <div className="bg-white rounded-2xl border border-rose-100 p-6 sm:p-10 text-left shadow-2xs">
              <h3 className="text-xl font-serif font-semibold text-[#241115] mb-6 pb-3 border-b border-rose-100">
                Course Syllabus & Readings
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
      <div className="bg-[#FFFBFB] min-h-screen">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-left">
          {renderTopBar('Back to Publications', 'blogs', blog.ID, blog.Title, blog.IsPinned)}

          <div className="bg-white rounded-2xl border border-rose-100 p-6 sm:p-8 mb-8 shadow-2xs space-y-3.5">
            <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
              {blog.IsPinned && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B80F2E] text-white">
                  <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                </span>
              )}
              {(blog.Tags || "").split(',').filter(Boolean).map((t, idx) => (
                <span key={idx} className="px-2.5 py-0.5 rounded-md bg-rose-50 text-[#B80F2E] border border-rose-100">
                  #{t.trim()}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-semibold text-[#241115] tracking-tight leading-tight">
              {blog.Title}
            </h1>

            <div className="flex items-center flex-wrap gap-4 pt-2 border-t border-rose-100/80 text-xs text-[#8A6970]">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#B80F2E]" />
                Counselor Faculty ({blog.AuthorEmail.split('@')[0]})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#B80F2E]" />
                Published {new Date(blog.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {blog.FeaturedImageURL && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-rose-100 mb-8 bg-rose-50 shadow-2xs">
              <img
                src={blog.FeaturedImageURL}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {blog.PDFLink && renderPdfCard(
            blog.PDFLink,
            'Supplemental PDF Brief',
            'Official checklist guidelines available for offline reference.'
          )}

          {blog.Content && (
            <div className="bg-white rounded-2xl border border-rose-100 p-6 sm:p-10 text-left shadow-2xs">
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
      <div className="bg-[#FFFBFB] min-h-screen">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-left">
          {renderTopBar('Back to References', 'reference_materials', reference.ID, reference.Title, reference.IsPinned)}

          <div className="bg-white rounded-2xl border border-rose-100 p-6 sm:p-8 mb-8 shadow-2xs space-y-3.5">
            <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
              {reference.IsPinned && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B80F2E] text-white">
                  <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-[#B80F2E] border border-rose-100">
                {reference.Category}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-semibold text-[#241115] tracking-tight leading-tight">
              {reference.Title}
            </h1>
            {reference.Description && (
              <p className="text-sm text-[#5C4146] leading-relaxed">{reference.Description}</p>
            )}
            <div className="flex items-center flex-wrap gap-4 pt-2 border-t border-rose-100/80 text-xs text-[#8A6970]">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#B80F2E]" />
                Compiled by <strong className="text-[#241115] font-semibold">{reference.Author}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#B80F2E]" />
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
            <div className="bg-white rounded-2xl border border-rose-100 p-6 sm:p-10 text-left shadow-2xs">
              <h3 className="text-xl font-serif font-semibold text-[#241115] mb-6 pb-3 border-b border-rose-100">
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
      <div className="bg-[#FFFBFB] min-h-screen">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-left">
          {renderTopBar('Back to Career Lab', 'career_labs', lab.ID, lab.Title, lab.IsPinned)}

          <div className="bg-white rounded-2xl border border-rose-100 p-6 sm:p-8 mb-8 shadow-2xs space-y-3.5">
            <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
              {lab.IsPinned && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B80F2E] text-white">
                  <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-[#B80F2E] border border-rose-100">
                {lab.Category}
              </span>
              <span className="text-[#8A6970]">· Student: {lab.Student}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-semibold text-[#241115] tracking-tight leading-tight">
              {lab.Title}
            </h1>
            {lab.Description && (
              <p className="text-sm text-[#5C4146] leading-relaxed">{lab.Description}</p>
            )}
            <div className="flex items-center flex-wrap gap-4 pt-2 border-t border-rose-100/80 text-xs text-[#8A6970]">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#B80F2E]" />
                Mentor: <strong className="text-[#241115] font-semibold">{lab.Mentor}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#B80F2E]" />
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
            <div className="bg-white rounded-2xl border border-rose-100 p-6 sm:p-10 text-left shadow-2xs">
              <h3 className="text-xl font-serif font-semibold text-[#241115] mb-6 pb-3 border-b border-rose-100">
                Research Thesis & Findings
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
      <h3 className="font-serif text-xl text-[#241115]">Resource not found</h3>
      <p className="text-[#694D53] text-xs sm:text-sm mt-1.5">
        The requested document could not be located in the archive.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-5 px-5 py-2.5 bg-[#B80F2E] text-white rounded-xl text-xs font-semibold hover:bg-[#8B0E24] transition-colors cursor-pointer"
      >
        Return to Previous Page
      </button>
    </div>
  );
}
