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
        <p className="text-gray-400 font-semibold uppercase tracking-widest text-xs mt-4">Streaming publication briefs...</p>
      </div>
    );
  }

  // Course Details Render
  if (type === 'course' && course) {
    const embedId = getYoutubeEmbedId(course.YouTubeURL);
    return (
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-left">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800 hover:text-rose-900 border-b border-transparent hover:border-rose-900 pb-0.5 transition-all">
          <ArrowLeft className="w-4 h-4" />
          <span>Go back to Courses</span>
        </button>

        <div className="space-y-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-[#B80F2E] px-3 py-1 rounded">
              {course.Category}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-3 py-1 rounded-md">
              {course.Grade}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4.5xl font-black text-gray-900 tracking-tight font-serif select-all leading-tight">
            {course.Title}
          </h1>
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-rose-700" /> 👨‍🏫 Instructor: {course.Instructor}</span>
            <span>•</span>
            <span className="flex items-center gap-1.5">📅 Updated {new Date(course.UpdatedDate || course.CreatedDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Video Embedding Frame */}
        {embedId && (
          <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden p-3.5 mb-8">
            <span className="text-[10px] font-black uppercase text-rose-700 block mb-2 tracking-widest">🎬 Video Lecture</span>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow shadow-rose-900/10">
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
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center justify-between gap-4 mb-8">
            <div className="text-left flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg shrink-0">
                📄
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-sm sm:text-base leading-tight">Syllabus PDF Material</h4>
                <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">Complementary worksheets, outlines, and task lists ready to download.</p>
              </div>
            </div>
            <a
              href={getPdfDownloadUrl(course.PDFLink)}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition shadow shadow-emerald-700/5 focus:outline-none"
            >
              <FileDown className="w-4 h-4" />
              <span className="sm:inline hidden">Download PDF</span>
            </a>
          </div>
        )}

        {/* Course Core HTML content */}
        {course.Content && (
          <div className="bg-white rounded-3xl border border-[#dde4ee] shadow-sm p-6 sm:p-10 text-left">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 font-serif mb-6 border-b border-rose-50 pb-3">
              Course syllabus content
            </h3>
            <div 
              className="rich-content"
              dangerouslySetInnerHTML={{ __html: course.Content }}
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
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800 hover:text-rose-900 border-b border-transparent hover:border-rose-900 pb-0.5 transition-all">
          <ArrowLeft className="w-4 h-4" />
          <span>Go back to Publications</span>
        </button>

        <div className="space-y-4 mb-8">
          <div className="flex gap-1.5">
            {(blog.Tags || "").split(',').filter(Boolean).map((t, idx) => (
              <span key={idx} className="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 px-3 py-1 rounded">
                #{t.trim()}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4.5xl font-black text-gray-900 tracking-tight font-serif leading-tight">
            {blog.Title}
          </h1>

          <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-rose-700" /> By Counselor Panel ({blog.AuthorEmail.split('@')[0]})</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Published {new Date(blog.CreatedDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Featured Image */}
        {blog.FeaturedImageURL && (
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-rose-100 shadow mb-8">
            <img 
              src={blog.FeaturedImageURL} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* PDF Download line */}
        {blog.PDFLink && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center justify-between gap-4 mb-8">
            <div className="text-left flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg shrink-0">
                📄
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-sm sm:text-base leading-tight">Supplemental PDF Brief</h4>
                <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">Counselor-attached checklist guidelines ready to download.</p>
              </div>
            </div>
            <a
              href={getPdfDownloadUrl(blog.PDFLink)}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition shadow"
            >
              <FileDown className="w-4 h-4" />
              <span className="sm:inline hidden">Download PDF</span>
            </a>
          </div>
        )}

        {/* Full post Content */}
        {blog.Content && (
          <div className="bg-white rounded-3xl border border-[#dde4ee] shadow-sm p-6 sm:p-10 text-left">
            <div 
              className="rich-content"
              dangerouslySetInnerHTML={{ __html: blog.Content }}
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
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800 hover:text-rose-900 border-b border-transparent hover:border-rose-900 pb-0.5 transition-all">
          <ArrowLeft className="w-4 h-4" />
          <span>Go back to References</span>
        </button>

        <div className="space-y-4 mb-8">
          <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-[#B80F2E] px-3 py-1 rounded">
            {reference.Category}
          </span>
          <h1 className="text-3xl sm:text-4.5xl font-black text-gray-900 tracking-tight font-serif leading-tight">
            {reference.Title}
          </h1>
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-rose-700" /> Compiled by {reference.Author}</span>
            <span>•</span>
            <span className="flex items-center gap-1.5">📅 Updated {new Date(reference.UpdatedDate || reference.CreatedDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Video Embedding Frame */}
        {embedId && (
          <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden p-3.5 mb-8">
            <span className="text-[10px] font-black uppercase text-rose-700 block mb-2 tracking-widest">🎬 Briefing video</span>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow">
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
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center justify-between gap-4 mb-8">
            <div className="text-left flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg shrink-0">
                📄
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-sm sm:text-base leading-tight">Reference File PDF</h4>
                <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">Standard CV outlines and tracking spreadsheets ready to download.</p>
              </div>
            </div>
            <a
              href={getPdfDownloadUrl(reference.PDFLink)}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition shadow"
            >
              <FileDown className="w-4 h-4" />
              <span className="sm:inline hidden">Download Resource</span>
            </a>
          </div>
        )}

        {/* Reference HTML content */}
        {reference.Content && (
          <div className="bg-white rounded-3xl border border-[#dde4ee] shadow-sm p-6 sm:p-10 text-left">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 font-serif mb-6 border-b border-rose-50 pb-3">
              Official document details
            </h3>
            <div 
              className="rich-content"
              dangerouslySetInnerHTML={{ __html: reference.Content }}
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
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800 hover:text-rose-900 border-b border-transparent hover:border-rose-900 pb-0.5 transition-all">
          <ArrowLeft className="w-4 h-4" />
          <span>Go back to Career Lab</span>
        </button>

        <div className="space-y-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-[#B80F2E] px-3 py-1 rounded">
              {lab.Category}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-[#111827] px-3 py-1 rounded-md">
              Student: {lab.Student}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4.5xl font-black text-gray-900 tracking-tight font-serif leading-tight">
            {lab.Title}
          </h1>
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-rose-700" /> 👤 Mentor: {lab.Mentor}</span>
            <span>•</span>
            <span className="flex items-center gap-1.5">📅 Submitted {new Date(lab.UpdatedDate || lab.CreatedDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Video Embedding Frame */}
        {embedId && (
          <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden p-3.5 mb-8">
            <span className="text-[10px] font-black uppercase text-rose-700 block mb-2 tracking-widest">🎬 Project Video Explainer</span>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow">
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
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center justify-between gap-4 mb-8">
            <div className="text-left flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg shrink-0">
                📄
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-sm sm:text-base leading-tight">Research Paper PDF</h4>
                <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">Download full research briefs, data sheets, and charts.</p>
              </div>
            </div>
            <a
              href={getPdfDownloadUrl(lab.PDFLink)}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition shadow"
            >
              <FileDown className="w-4 h-4" />
              <span className="sm:inline hidden">Download Paper</span>
            </a>
          </div>
        )}

        {/* Lab Content */}
        {lab.Content && (
          <div className="bg-white rounded-3xl border border-[#dde4ee] shadow-sm p-6 sm:p-10 text-left">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 font-serif mb-6 border-b border-rose-50 pb-3">
              Research thesis & findings
            </h3>
            <div 
              className="rich-content"
              dangerouslySetInnerHTML={{ __html: lab.Content }}
            />
          </div>
        )}

      </article>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 text-center">
      <div className="text-4xl mb-4">🔍</div>
      <h3 className="text-lg font-bold text-gray-900 font-serif">Resource Not Found</h3>
      <button onClick={onBack} className="mt-4 px-6 py-2 bg-[#B80F2E] text-white rounded-xl font-bold text-xs uppercase tracking-wider">
        Go Back
      </button>
    </div>
  );
}
