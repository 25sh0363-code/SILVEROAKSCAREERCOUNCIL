/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Course, BlogPost, ReferenceMaterial, CareerLab, DbUser, AppUser, UserRole } from '../types';

// Exact original credentials provided in the user's source code
export const SUPABASE_URL = "https://wicihqhrjgcikcyurbtd.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_ZgwGLXUMusAEhv1ghHdRGg_cnzDn4Of";
export const SUPABASE_STORAGE_BUCKET = "career-lab-uploads";
export const CLIENT_ID = "392344488331-qt8b726lvhbldl9bptpj58bagj8qq2af.apps.googleusercontent.com";

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});

const ALLOWED_EMAIL_DOMAINS = [
  "@hyd.silveroaks.co.in",
  "@bt.silveroaks.co.in",
  "@odl.silveroaks.co.in"
];

export function isAllowedEmail(email: string): boolean {
  const safeEmail = String(email || '').toLowerCase().trim();
  // Allow email bypass/test if locally testing OR if it ends with standard domains OR explicit admin email
  if (
    safeEmail === 'omsurajkashikarjhcsclass6@gmail.com' ||
    safeEmail === 'student@silveroaks.co.in' ||
    safeEmail === 'editor@silveroaks.co.in' ||
    safeEmail === 'admin@silveroaks.co.in'
  ) {
    return true;
  }
  return ALLOWED_EMAIL_DOMAINS.some(domain => safeEmail.endsWith(domain));
}

// -------------------------------------------------------------
// HIGH-FIDELITY FALLBACK DATA (For local preview resilience)
// -------------------------------------------------------------
const MOCK_COURSES: Course[] = [];

const MOCK_POSTS: BlogPost[] = [];

const MOCK_REFS: ReferenceMaterial[] = [];

const MOCK_LABS: CareerLab[] = [];

const MOCK_USERS: DbUser[] = [
  { Name: "Suraj Kashikar", Email: "omsurajkashikarjhcsclass6@gmail.com", Role: "Admin", Status: "Active", CreatedDate: "2026-05-15T09:00:00Z" }
];

// Helper to gracefully execute supabase table queries
async function safeDbCall<T>(
  queryPromise: any,
  mockFallback: T[]
): Promise<T[]> {
  try {
    const { data, error } = await queryPromise;
    if (error) {
      console.warn("Supabase query error, fallback to mock data:", error.message || error);
      return mockFallback;
    }
    if (!data || data.length === 0) {
      return mockFallback;
    }
    return data as T[];
  } catch (err) {
    console.error("Supabase network error, fallback to mock data:", err);
    return mockFallback;
  }
}

// -------------------------------------------------------------
// CORE DB API HANDLERS (Identical logic to vanilla source)
// -------------------------------------------------------------

export async function fetchAllCourses(isPublishedOnly = true): Promise<Course[]> {
  let query = supabase.from('courses').select('*');
  if (isPublishedOnly) {
    query = query.eq('status', 'Published');
  }
  const result = await safeDbCall(
    query.order('created_date', { ascending: false }),
    MOCK_COURSES
  );
  return result.map(toCourse);
}

export async function fetchCourseById(id: string): Promise<Course | null> {
  try {
    const { data, error } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
    if (error || !data) {
      return MOCK_COURSES.find(c => c.ID === id) || null;
    }
    return toCourse(data);
  } catch {
    return MOCK_COURSES.find(c => c.ID === id) || null;
  }
}

export async function fetchAllBlogs(isPublishedOnly = true): Promise<BlogPost[]> {
  let query = supabase.from('blogs').select('*');
  if (isPublishedOnly) {
    query = query.eq('status', 'Published');
  }
  const result = await safeDbCall(
    query.order('created_date', { ascending: false }),
    MOCK_POSTS
  );
  return result.map(toBlogPost);
}

export async function fetchBlogById(id: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase.from('blogs').select('*').eq('id', id).maybeSingle();
    if (error || !data) {
      return MOCK_POSTS.find(p => p.ID === id) || null;
    }
    return toBlogPost(data);
  } catch {
    return MOCK_POSTS.find(p => p.ID === id) || null;
  }
}

export async function fetchAllReferences(isPublishedOnly = true): Promise<ReferenceMaterial[]> {
  let query = supabase.from('reference_materials').select('*');
  if (isPublishedOnly) {
    query = query.eq('status', 'Published');
  }
  const result = await safeDbCall(
    query.order('created_date', { ascending: false }),
    MOCK_REFS
  );
  return result.map(toReference);
}

export async function fetchReferenceById(id: string): Promise<ReferenceMaterial | null> {
  try {
    const { data, error } = await supabase.from('reference_materials').select('*').eq('id', id).maybeSingle();
    if (error || !data) {
      return MOCK_REFS.find(r => r.ID === id) || null;
    }
    return toReference(data);
  } catch {
    return MOCK_REFS.find(r => r.ID === id) || null;
  }
}

export async function fetchAllCareerLabs(isPublishedOnly = true): Promise<CareerLab[]> {
  let query = supabase.from('career_labs').select('*');
  if (isPublishedOnly) {
    query = query.eq('status', 'Published');
  }
  const result = await safeDbCall(
    query.order('created_date', { ascending: false }),
    MOCK_LABS
  );
  return result.map(toCareerLab);
}

export async function fetchCareerLabById(id: string): Promise<CareerLab | null> {
  try {
    const { data, error } = await supabase.from('career_labs').select('*').eq('id', id).maybeSingle();
    if (error || !data) {
      return MOCK_LABS.find(l => l.ID === id) || null;
    }
    return toCareerLab(data);
  } catch {
    return MOCK_LABS.find(l => l.ID === id) || null;
  }
}

export async function fetchAllUsers(): Promise<DbUser[]> {
  try {
    const { data, error } = await supabase.from('users').select('*').order('created_date', { ascending: false });
    if (error || !data || data.length === 0) {
      return MOCK_USERS;
    }
    return data.map(toDbUser);
  } catch {
    return MOCK_USERS;
  }
}

export async function ensureUser(email: string, name: string): Promise<DbUser> {
  const safeEmail = String(email || '').toLowerCase().trim();
  const safeName = String(name || '').trim() || safeEmail.split('@')[0];

  try {
    const db = supabase;
    const { data: current, error: fetchErr } = await db.from('users').select('*').eq('email', safeEmail).maybeSingle();
    if (!fetchErr && current) {
      return toDbUser(current);
    }

    const newUser = {
      id: safeEmail,
      name: safeName,
      email: safeEmail,
      role: (safeEmail.includes('admin') || safeEmail.includes('suraj.kashikar') || safeEmail === 'omsurajkashikarjhcsclass6@gmail.com') ? 'Admin' : 'Student',
      status: 'Active',
      created_date: new Date().toISOString()
    };

    const { data: inserted, error: insertErr } = await db.from('users').upsert([newUser], { onConflict: 'email' }).select('*').single();
    if (insertErr || !inserted) {
      console.warn("Failed to insert user in Supabase, using mock local user");
      return {
        Name: safeName,
        Email: safeEmail,
        Role: newUser.role as UserRole,
        Status: 'Active',
        CreatedDate: newUser.created_date
      };
    }
    return toDbUser(inserted);
  } catch {
    return {
      Name: safeName,
      Email: safeEmail,
      Role: (safeEmail.includes('admin') || safeEmail.includes('suraj.kashikar') || safeEmail === 'omsurajkashikarjhcsclass6@gmail.com') ? 'Admin' : 'Student',
      Status: 'Active',
      CreatedDate: new Date().toISOString()
    };
  }
}

// -------------------------------------------------------------
// SAVE & UPSERT OPERATIONS (Backend stays preserved)
// -------------------------------------------------------------

export async function saveCourse(payload: Partial<Course>): Promise<string> {
  const row = {
    id: payload.ID || uuid(),
    title: payload.Title || "",
    description: payload.Description || "",
    instructor: payload.Instructor || "",
    category: payload.Category || "",
    grade: payload.Grade || "",
    thumbnail_url: payload.ThumbnailURL || "",
    youtube_url: payload.YouTubeURL || "",
    pdf_link: payload.PDFLink || "",
    content: payload.Content || "",
    status: payload.Status || "Draft",
    created_date: payload.CreatedDate || new Date().toISOString(),
    updated_date: new Date().toISOString()
  };

  const { data, error } = await supabase.from('courses').upsert([row], { onConflict: 'id' }).select('*').single();
  if (error || !data) {
    throw new Error(error?.message || "Failed to save course in Supabase");
  }
  return data.id;
}

export async function saveBlogPost(payload: Partial<BlogPost>, authorEmail: string): Promise<string> {
  const row = {
    id: payload.ID || uuid(),
    title: payload.Title || "",
    content: payload.Content || "",
    featured_image_url: payload.FeaturedImageURL || "",
    pdf_link: payload.PDFLink || "",
    author_email: authorEmail || payload.AuthorEmail || "",
    tags: payload.Tags || "",
    status: payload.Status || "Draft",
    created_date: payload.CreatedDate || new Date().toISOString(),
    updated_date: new Date().toISOString()
  };

  const { data, error } = await supabase.from('blogs').upsert([row], { onConflict: 'id' }).select('*').single();
  if (error || !data) {
    throw new Error(error?.message || "Failed to save post in Supabase");
  }
  return data.id;
}

export async function saveReference(payload: Partial<ReferenceMaterial>): Promise<string> {
  const row = {
    id: payload.ID || uuid(),
    title: payload.Title || "",
    description: payload.Description || "",
    author: payload.Author || "",
    category: payload.Category || "",
    thumbnail_url: payload.ThumbnailURL || "",
    youtube_url: payload.YouTubeURL || "",
    pdf_link: payload.PDFLink || "",
    content: payload.Content || "",
    status: payload.Status || "Draft",
    created_date: payload.CreatedDate || new Date().toISOString(),
    updated_date: new Date().toISOString()
  };

  const { data, error } = await supabase.from('reference_materials').upsert([row], { onConflict: 'id' }).select('*').single();
  if (error || !data) {
    throw new Error(error?.message || "Failed to save reference in Supabase");
  }
  return data.id;
}

export async function saveCareerLab(payload: Partial<CareerLab>): Promise<string> {
  const row = {
    id: payload.ID || uuid(),
    title: payload.Title || "",
    student: payload.Student || "",
    description: payload.Description || "",
    mentor: payload.Mentor || "",
    category: payload.Category || "",
    thumbnail_url: payload.ThumbnailURL || "",
    youtube_url: payload.YouTubeURL || "",
    pdf_link: payload.PDFLink || "",
    content: payload.Content || "",
    status: payload.Status || "Draft",
    created_date: payload.CreatedDate || new Date().toISOString(),
    updated_date: new Date().toISOString()
  };

  const { data, error } = await supabase.from('career_labs').upsert([row], { onConflict: 'id' }).select('*').single();
  if (error || !data) {
    throw new Error(error?.message || "Failed to save career lab in Supabase");
  }
  return data.id;
}

export async function deleteRecord(table: 'courses' | 'blogs' | 'reference_materials' | 'career_labs', id: string): Promise<boolean> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

export async function updateUserRole(email: string, role: UserRole): Promise<boolean> {
  const { error } = await supabase.from('users').update({ role, status: 'Active' }).eq('email', email.trim().toLowerCase());
  if (error) throw new Error(error.message);
  return true;
}

export async function deleteUserAndBlogs(email: string): Promise<boolean> {
  const safeEmail = String(email || '').toLowerCase().trim();
  // Delete user authored posts
  const { data: posts, error: fetchErr } = await supabase.from('blogs').select('id').eq('author_email', safeEmail);
  if (!fetchErr && posts) {
    for (const p of posts) {
      await deleteRecord('blogs', p.id);
    }
  }
  // Delete user
  const { error } = await supabase.from('users').delete().eq('email', safeEmail);
  if (error) throw new Error(error.message);
  return true;
}

// -------------------------------------------------------------
// SECURE FILE UPLOADER FOR SUPABASE STORAGE
// -------------------------------------------------------------
export async function uploadFileToSupabase(file: File, folderLabel: string): Promise<string> {
  const safeName = String(file.name || "file").replace(/[^a-zA-Z0-9._-]+/g, "_");
  const folder = folderLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const path = `${folder}/${Date.now()}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    throw new Error(error.message);
  }

  const { data: urlData } = supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(path);

  if (!urlData?.publicUrl) {
    throw new Error("Could not resolve public URL from storage bucket.");
  }
  return urlData.publicUrl;
}

// -------------------------------------------------------------
// TRANSLATION MAPPERS (From DB Scheme into Clean TS Models)
// -------------------------------------------------------------

function toCourse(row: any): Course {
  return {
    ID: row.id,
    Title: row.title,
    Description: row.description,
    Instructor: row.instructor,
    Category: row.category,
    Grade: row.grade,
    ThumbnailURL: row.thumbnail_url,
    YouTubeURL: row.youtube_url,
    PDFLink: row.pdf_link,
    Content: row.content,
    Status: row.status,
    CreatedDate: row.created_date,
    UpdatedDate: row.updated_date,
  };
}

function toBlogPost(row: any): BlogPost {
  return {
    ID: row.id,
    Title: row.title,
    Content: row.content,
    FeaturedImageURL: row.featured_image_url,
    PDFLink: row.pdf_link,
    AuthorEmail: row.author_email,
    Tags: row.tags,
    Status: row.status,
    CreatedDate: row.created_date,
    UpdatedDate: row.updated_date,
  };
}

function toReference(row: any): ReferenceMaterial {
  return {
    ID: row.id,
    Title: row.title,
    Description: row.description,
    Author: row.author,
    Category: row.category,
    ThumbnailURL: row.thumbnail_url,
    YouTubeURL: row.youtube_url,
    PDFLink: row.pdf_link,
    Content: row.content,
    Status: row.status,
    CreatedDate: row.created_date,
    UpdatedDate: row.updated_date,
  };
}

function toCareerLab(row: any): CareerLab {
  return {
    ID: row.id,
    Title: row.title,
    Student: row.student,
    Description: row.description,
    Mentor: row.mentor,
    Category: row.category,
    ThumbnailURL: row.thumbnail_url,
    YouTubeURL: row.youtube_url,
    PDFLink: row.pdf_link,
    Content: row.content,
    Status: row.status,
    CreatedDate: row.created_date,
    UpdatedDate: row.updated_date,
  };
}

function toDbUser(row: any): DbUser {
  return {
    Name: row.name,
    Email: row.email,
    Role: row.role as UserRole,
    Status: row.status,
    CreatedDate: row.created_date,
  };
}

function uuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Math.random().toString(36).substring(2, 16) + Date.now().toString(36);
}

// Extract Youtube Video ID
export function getYoutubeEmbedId(url: string): string {
  if (!url) return "";
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : "";
}

// Helper to convert drive links to raw downloads
export function getPdfDownloadUrl(url: string): string {
  if (!url) return "";
  let m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return "https://drive.google.com/uc?export=download&id=" + m[1];
  m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) return "https://drive.google.com/uc?export=download&id=" + m[1];
  return url;
}
