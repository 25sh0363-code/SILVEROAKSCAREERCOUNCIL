/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, PlayCircle, FileDown, User, Calendar, BookOpen, Clock, Tag } from 'lucide-react';
import { Course, BlogPost, ReferenceMaterial, CareerLab } from '../types';
import { 
  fetchCourseById, fetchBlogById, fetchReferenceById, fetchCareerLabById,
  getYoutubeEmbedId, getPdfDownloadUrl 
} from '../lib/supabase';
import { renderContentToHtml } from '../lib/renderContent';

interface DetailProps {
  type: 'course' | 'blog-item' | 'reference-item' | 'lab-item';
  id: string;
  onBack: () => void;
  setCurrentPage: (page: string) => void;
  setSelectedId: (id: string) => void;
}

export default function ItemDetail({ type, id, onBack, setCurrentPage, setSelectedId }: DetailProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [reference, setReference] = useState<ReferenceMaterial | null>(null);
  const [lab, setLab] = useState<CareerLab | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItem() {
      setLoading(false);
      if (!id) return;
      setLoading(true);
      try {
        if (type === 'course') {
          const res = await fetchCourseById(id);
          setCourse(res);
        } else if (type === 'blog-item') {
          const res = await fetchBlogById(id);
          setBlog(res);
        } else if (type === 'reference-item') {
          const res = await fetchReferenceById(id);
          setReference(res);
        } else if (type === 'lab-item') {
          const res = await fetchCareerLabById(id);
          setLab(res);
        }
      } catch (err) {
        console.error("Failed to load details for item id:", id, err);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [type, id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="spinner" />
        <p className="text-stone-400 font-medium uppercase tracking-wider text-xs mt-4">Loading details...</p>
      </div>
    );
  }

  // Course Details Render
  if (type === 'course' && course) {
    const embedId = getYoutubeEmbedId(course.YouTubeURL);
    return (
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-left">
        <button 
          onClick={onBack} 
          className="mb-6 flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Courses</span>
        </button>

        <div className="space-y-3 mb-8 pb-6 border-b border-stone-200">
          <div className="flex items-center gap-2 text-[11px] font-medium text-stone-500">
            <span>{course.Category}</span>
            <span>· Grade {course.Grade}</span>
          </div>
          <h1 className="text-2xl sm:text-3.5xl font-serif font-normal text-stone-900 tracking-tight leading-tight">
            {course.Title}
          </h1>
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span>Instructor: {course.Instructor}</span>
            <span>·</span>
            <span>Updated {new Date(course.UpdatedDate || course.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Video Embedding Frame */}
        {embedId && (
          <div className="bg-white rounded-lg border border-stone-200 overflow-hidden p-2.5 mb-8">
            <span className="text-[11px] font-medium text-stone-500 block mb-2 px-1">Video Lecture</span>
            <div className="relative aspect-video w-full rounded overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${embedId}`}
                title="Course Lecture"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0 absolute inset-0"
              />
            </div>
          </div>
        )}

        {/* PDF Download line */}
        {course.PDFLink && (
          <div className="bg-white border border-stone-200 rounded-lg p-5 flex items-center justify-between gap-4 mb-8">
            <div className="text-left flex items-start gap-3.5">
              <div className="w-9 h-9 rounded bg-stone-100 text-stone-700 flex items-center justify-center text-base shrink-0">
                <FileDown className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium text-stone-900 text-sm leading-tight">Syllabus PDF Material</h4>
                <p className="text-xs text-stone-500 mt-0.5">Complementary worksheets, outlines, and task lists ready to download.</p>
              </div>
            </div>
            <a
              href={getPdfDownloadUrl(course.PDFLink)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="sm:inline hidden">
                {course.PDFLink.toLowerCase().includes("drive.google.com") || course.PDFLink.includes("/d/") 
                  ? "View PDF" 
                  : "Download PDF"}
              </span>
            </a>
          </div>
        )}

        {/* Course Core HTML content */}
        {course.Content && (
          <div className="bg-white rounded-lg border border-stone-200 p-6 sm:p-10 text-left">
            <h3 className="text-lg font-serif font-medium text-stone-900 mb-6 pb-3 border-b border-stone-100">
              Course Syllabus & Readings
            </h3>
            <div 
              className="rich-content"
              dangerouslySetInnerHTML={{ __html: renderContentToHtml(course.Content) }}
            />
          </div>
        )}

      </article>
    );
  }

  // BlogPost Details Render
  if (type === 'blog-item' && blog) {
    return (
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-left">
        <button 
          onClick={onBack} 
          className="mb-6 flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Publications</span>
        </button>

        <div className="space-y-3 mb-8 pb-6 border-b border-stone-200">
          <div className="flex items-center gap-2 text-[11px] font-medium text-stone-500">
            {(blog.Tags || "").split(',').filter(Boolean).map((t, idx) => (
              <span key={idx}>#{t.trim()}</span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-3.5xl font-serif font-normal text-stone-900 tracking-tight leading-tight">
            {blog.Title}
          </h1>

          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span>Counselor Faculty ({blog.AuthorEmail.split('@')[0]})</span>
            <span>·</span>
            <span>Published {new Date(blog.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Featured Image */}
        {blog.FeaturedImageURL && (
          <div className="aspect-video w-full rounded-lg overflow-hidden border border-stone-200 mb-8 bg-stone-100">
            <img 
              src={blog.FeaturedImageURL} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* PDF Download line */}
        {blog.PDFLink && (
          <div className="bg-white border border-stone-200 rounded-lg p-5 flex items-center justify-between gap-4 mb-8">
            <div className="text-left flex items-start gap-3.5">
              <div className="w-9 h-9 rounded bg-stone-100 text-stone-700 flex items-center justify-center text-base shrink-0">
                <FileDown className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium text-stone-900 text-sm leading-tight">Supplemental PDF Brief</h4>
                <p className="text-xs text-stone-500 mt-0.5">Official checklist guidelines available for offline reference.</p>
              </div>
            </div>
            <a
              href={getPdfDownloadUrl(blog.PDFLink)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="sm:inline hidden">
                {blog.PDFLink.toLowerCase().includes("drive.google.com") || blog.PDFLink.includes("/d/") 
                  ? "View PDF" 
                  : "Download PDF"}
              </span>
            </a>
          </div>
        )}

        {/* Full post Content */}
        {blog.Content && (
          <div className="bg-white rounded-lg border border-stone-200 p-6 sm:p-10 text-left">
            <div 
              className="rich-content"
              dangerouslySetInnerHTML={{ __html: renderContentToHtml(blog.Content) }}
            />
          </div>
        )}

      </article>
    );
  }

  // Reference Details Render
  if (type === 'reference-item' && reference) {
    const embedId = getYoutubeEmbedId(reference.YouTubeURL);
    return (
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-left">
        <button 
          onClick={onBack} 
          className="mb-6 flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to References</span>
        </button>

        <div className="space-y-3 mb-8 pb-6 border-b border-stone-200">
          <div className="text-[11px] font-medium text-stone-500">
            {reference.Category}
          </div>
          <h1 className="text-2xl sm:text-3.5xl font-serif font-normal text-stone-900 tracking-tight leading-tight">
            {reference.Title}
          </h1>
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span>Compiled by {reference.Author}</span>
            <span>·</span>
            <span>Updated {new Date(reference.UpdatedDate || reference.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Video Embedding Frame */}
        {embedId && (
          <div className="bg-white rounded-lg border border-stone-200 overflow-hidden p-2.5 mb-8">
            <span className="text-[11px] font-medium text-stone-500 block mb-2 px-1">Briefing Video</span>
            <div className="relative aspect-video w-full rounded overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${embedId}`}
                title="Reference Lecture"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0 absolute inset-0"
              />
            </div>
          </div>
        )}

        {/* PDF Download line */}
        {reference.PDFLink && (
          <div className="bg-white border border-stone-200 rounded-lg p-5 flex items-center justify-between gap-4 mb-8">
            <div className="text-left flex items-start gap-3.5">
              <div className="w-9 h-9 rounded bg-stone-100 text-stone-700 flex items-center justify-center text-base shrink-0">
                <FileDown className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium text-stone-900 text-sm leading-tight">Reference Document PDF</h4>
                <p className="text-xs text-stone-500 mt-0.5">Standard CV outlines and tracking spreadsheets ready to download.</p>
              </div>
            </div>
            <a
              href={getPdfDownloadUrl(reference.PDFLink)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="sm:inline hidden">
                {reference.PDFLink.toLowerCase().includes("drive.google.com") || reference.PDFLink.includes("/d/") 
                  ? "View PDF" 
                  : "Download PDF"}
              </span>
            </a>
          </div>
        )}

        {/* Reference HTML content */}
        {reference.Content && (
          <div className="bg-white rounded-lg border border-stone-200 p-6 sm:p-10 text-left">
            <h3 className="text-lg font-serif font-medium text-stone-900 mb-6 pb-3 border-b border-stone-100">
              Official Document Details
            </h3>
            <div 
              className="rich-content"
              dangerouslySetInnerHTML={{ __html: renderContentToHtml(reference.Content) }}
            />
          </div>
        )}

      </article>
    );
  }

  // CareerLab Details Render
  if (type === 'lab-item' && lab) {
    const embedId = getYoutubeEmbedId(lab.YouTubeURL);
    return (
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-left">
        <button 
          onClick={onBack} 
          className="mb-6 flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Career Lab</span>
        </button>

        <div className="space-y-3 mb-8 pb-6 border-b border-stone-200">
          <div className="flex items-center gap-2 text-[11px] font-medium text-stone-500">
            <span>{lab.Category}</span>
            <span>· Student: {lab.Student}</span>
          </div>
          <h1 className="text-2xl sm:text-3.5xl font-serif font-normal text-stone-900 tracking-tight leading-tight">
            {lab.Title}
          </h1>
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span>Mentor: {lab.Mentor}</span>
            <span>·</span>
            <span>Submitted {new Date(lab.UpdatedDate || lab.CreatedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Video Embedding Frame */}
        {embedId && (
          <div className="bg-white rounded-lg border border-stone-200 overflow-hidden p-2.5 mb-8">
            <span className="text-[11px] font-medium text-stone-500 block mb-2 px-1">Project Video</span>
            <div className="relative aspect-video w-full rounded overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${embedId}`}
                title="Career Lab Lecture"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0 absolute inset-0"
              />
            </div>
          </div>
        )}

        {/* PDF Download line */}
        {lab.PDFLink && (
          <div className="bg-white border border-stone-200 rounded-lg p-5 flex items-center justify-between gap-4 mb-8">
            <div className="text-left flex items-start gap-3.5">
              <div className="w-9 h-9 rounded bg-stone-100 text-stone-700 flex items-center justify-center text-base shrink-0">
                <FileDown className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium text-stone-900 text-sm leading-tight">Research Paper PDF</h4>
                <p className="text-xs text-stone-500 mt-0.5">Full research brief, data sheets, and analytical appendices.</p>
              </div>
            </div>
            <a
              href={getPdfDownloadUrl(lab.PDFLink)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="sm:inline hidden">
                {lab.PDFLink.toLowerCase().includes("drive.google.com") || lab.PDFLink.includes("/d/") 
                  ? "View PDF" 
                  : "Download PDF"}
              </span>
            </a>
          </div>
        )}

        {/* Lab Content */}
        {lab.Content && (
          <div className="bg-white rounded-lg border border-stone-200 p-6 sm:p-10 text-left">
            <h3 className="text-lg font-serif font-medium text-stone-900 mb-6 pb-3 border-b border-stone-100">
              Research Thesis & Findings
            </h3>
            <div 
              className="rich-content"
              dangerouslySetInnerHTML={{ __html: renderContentToHtml(lab.Content) }}
            />
          </div>
        )}

      </article>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 text-center">
      <h3 className="font-serif text-lg text-stone-900">Resource not found</h3>
      <p className="text-stone-500 text-xs mt-1">The requested document could not be located in the archive.</p>
      <button 
        onClick={onBack} 
        className="mt-4 px-4 py-2 bg-stone-900 text-white rounded text-xs font-medium hover:bg-stone-800 transition-colors cursor-pointer"
      >
        Return to Previous Page
      </button>
    </div>
  );
}
