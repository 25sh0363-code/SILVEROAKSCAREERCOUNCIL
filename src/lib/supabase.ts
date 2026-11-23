/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import {
  Course,
  BlogPost,
  ReferenceMaterial,
  CareerLab,
  DbUser,
  UserRole,
  Counselor,
  PinnableTable
} from '../types';

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
  "@odl.silveroaks.co.in",
  "@vizag.silveroaks.co.in",
  "@km.silveroaks.co.in"
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
// PINNED POSTS PERSISTENCE (Supabase is_pinned + resilient local sync)
// -------------------------------------------------------------
const PIN_STORAGE_KEY = 'socc_pinned_items_v1';

type PinOverrideMap = Record<string, boolean>;

function readPinMap(): PinOverrideMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PIN_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writePinMap(map: PinOverrideMap) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    console.warn("Unable to save pinned items locally:", err);
  }
}

function pinKey(table: PinnableTable, id: string): string {
  return `${table}:${id}`;
}

export function resolvePinnedState(table: PinnableTable, id: string, dbValue?: boolean | null): boolean {
  const map = readPinMap();
  const key = pinKey(table, id);
  if (key in map) {
    return Boolean(map[key]);
  }
  return Boolean(dbValue);
}

export function clearLocalPinOverrides() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PIN_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('pins-updated'));
}

export async function togglePinRecord(
  table: PinnableTable,
  id: string,
  nextPinned: boolean
): Promise<boolean> {
  // 1. Persist immediately in local registry for instant UI responsiveness and schema resilience
  const map = readPinMap();
  map[pinKey(table, id)] = nextPinned;
  writePinMap(map);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pins-updated', { detail: { table, id, isPinned: nextPinned } }));
  }

  // 2. Attempt cloud persistence in Supabase (silently ignores if is_pinned column is not yet added)
  try {
    const { error } = await supabase
      .from(table)
      .update({ is_pinned: nextPinned })
      .eq('id', id);

    if (error) {
      const msg = (error.message || '').toLowerCase();
      const isMissingCol =
        msg.includes('is_pinned') ||
        msg.includes('column') ||
        msg.includes('schema cache') ||
        error.code === '42703' ||
        error.code === 'PGRST204';
      if (!isMissingCol) {
        console.warn(`Supabase pin sync warning for ${table}:`, error.message);
      }
    }
  } catch (err) {
    console.warn(`Supabase pin sync network warning for ${table}:`, err);
  }

  return nextPinned;
}

export function sortPinnedFirst<T extends { IsPinned?: boolean; CreatedDate?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const pinDiff = (b.IsPinned ? 1 : 0) - (a.IsPinned ? 1 : 0);
    if (pinDiff !== 0) return pinDiff;
    const dateA = a.CreatedDate ? new Date(a.CreatedDate).getTime() : 0;
    const dateB = b.CreatedDate ? new Date(b.CreatedDate).getTime() : 0;
    return dateB - dateA;
  });
}

// -------------------------------------------------------------
// HIGH-FIDELITY FALLBACK DATA (For local preview resilience)
// -------------------------------------------------------------
const MOCK_COURSES: Course[] = [];
const MOCK_POSTS: BlogPost[] = [];
const MOCK_REFS: ReferenceMaterial[] = [];
const MOCK_LABS: CareerLab[] = [];
const MOCK_COUNSELORS: Counselor[] = [];

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

      const errMsg = (error.message || String(error)).toLowerCase();
      const isMissingTable =
        errMsg.includes("could not find the table") ||
        errMsg.includes("relation") ||
        errMsg.includes("does not exist") ||
        errMsg.includes("schema cache") ||
        error.code === "42P01" ||
        error.code === "PGRST116";

      if (typeof window !== 'undefined' && !isMissingTable) {
        window.dispatchEvent(new CustomEvent('supabase-error', {
          detail: error.message || String(error)
        }));
      }
      return mockFallback;
    }
    if (!data || data.length === 0) {
      return mockFallback;
    }
    return data as T[];
  } catch (err: any) {
    console.error("Supabase network error, fallback to mock data:", err);

    const errMsg = (err?.message || String(err)).toLowerCase();
    const isMissingTable =
      errMsg.includes("could not find the table") ||
      errMsg.includes("relation") ||
      errMsg.includes("does not exist") ||
      errMsg.includes("schema cache");

    if (typeof window !== 'undefined' && !isMissingTable) {
      window.dispatchEvent(new CustomEvent('supabase-error', {
        detail: err?.message || String(err)
      }));
    }
    return mockFallback;
  }
}

// -------------------------------------------------------------
// CORE DB API HANDLERS (Identical logic to vanilla source + pin sorting)
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
  return sortPinnedFirst(result.map(toCourse));
}

export async function fetchCourseById(id: string): Promise<Course | null> {
  try {
    const { data, error } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
    if (error || !data) {
      const fallback = MOCK_COURSES.find(c => c.ID === id) || null;
      return fallback ? { ...fallback, IsPinned: resolvePinnedState('courses', fallback.ID, fallback.IsPinned) } : null;
    }
    return toCourse(data);
  } catch {
    const fallback = MOCK_COURSES.find(c => c.ID === id) || null;
    return fallback ? { ...fallback, IsPinned: resolvePinnedState('courses', fallback.ID, fallback.IsPinned) } : null;
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
  return sortPinnedFirst(result.map(toBlogPost));
}

export async function fetchBlogById(id: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase.from('blogs').select('*').eq('id', id).maybeSingle();
    if (error || !data) {
      const fallback = MOCK_POSTS.find(p => p.ID === id) || null;
      return fallback ? { ...fallback, IsPinned: resolvePinnedState('blogs', fallback.ID, fallback.IsPinned) } : null;
    }
    return toBlogPost(data);
  } catch {
    const fallback = MOCK_POSTS.find(p => p.ID === id) || null;
    return fallback ? { ...fallback, IsPinned: resolvePinnedState('blogs', fallback.ID, fallback.IsPinned) } : null;
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
  return sortPinnedFirst(result.map(toReference));
}

export async function fetchReferenceById(id: string): Promise<ReferenceMaterial | null> {
  try {
    const { data, error } = await supabase.from('reference_materials').select('*').eq('id', id).maybeSingle();
    if (error || !data) {
      const fallback = MOCK_REFS.find(r => r.ID === id) || null;
      return fallback ? { ...fallback, IsPinned: resolvePinnedState('reference_materials', fallback.ID, fallback.IsPinned) } : null;
    }
    return toReference(data);
  } catch {
    const fallback = MOCK_REFS.find(r => r.ID === id) || null;
    return fallback ? { ...fallback, IsPinned: resolvePinnedState('reference_materials', fallback.ID, fallback.IsPinned) } : null;
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
  return sortPinnedFirst(result.map(toCareerLab));
}

export async function fetchCareerLabById(id: string): Promise<CareerLab | null> {
  try {
    const { data, error } = await supabase.from('career_labs').select('*').eq('id', id).maybeSingle();
    if (error || !data) {
      const fallback = MOCK_LABS.find(l => l.ID === id) || null;
      return fallback ? { ...fallback, IsPinned: resolvePinnedState('career_labs', fallback.ID, fallback.IsPinned) } : null;
    }
    return toCareerLab(data);
  } catch {
    const fallback = MOCK_LABS.find(l => l.ID === id) || null;
    return fallback ? { ...fallback, IsPinned: resolvePinnedState('career_labs', fallback.ID, fallback.IsPinned) } : null;
  }
}

export async function fetchAllCounselors(isPublishedOnly = true): Promise<Counselor[]> {
  let localList: Counselor[] = [];
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('local_counselors');
    if (stored) {
      try {
        const parsed: Counselor[] = JSON.parse(stored);
        // Automatically clean out the old hardcoded mock IDs c1 and c2 from local storage
        const filtered = parsed.filter(c => c.ID !== 'c1' && c.ID !== 'c2' && c.Name !== "Ms. Shalini Sinha" && c.Name !== "Mr. Arjun Mehta");
        if (filtered.length !== parsed.length) {
          localStorage.setItem('local_counselors', JSON.stringify(filtered));
        }
        localList = filtered;
      } catch (err) {
        console.error("Failed to parse local counselors", err);
      }
    }
  }

  // Try to clean them up in the actual database silently in background
  try {
    supabase.from('counselors').delete().in('id', ['c1', 'c2']).then(() => {});
  } catch {}

  const mergedFallback = [...localList];

  const finalFallback = isPublishedOnly
    ? mergedFallback.filter(c => c.Status === 'Published')
    : mergedFallback;

  let query = supabase.from('counselors').select('*');
  if (isPublishedOnly) {
    query = query.eq('status', 'Published');
  }
  const result = await safeDbCall(
    query.order('created_date', { ascending: false }),
    []
  );

  if (result && result.length > 0) {
    const mapped = result.map(toCounselor);
    return mapped.filter(c => c.ID !== 'c1' && c.ID !== 'c2' && c.Name !== "Ms. Shalini Sinha" && c.Name !== "Mr. Arjun Mehta");
  }

  return finalFallback.filter(c => c.ID !== 'c1' && c.ID !== 'c2' && c.Name !== "Ms. Shalini Sinha" && c.Name !== "Mr. Arjun Mehta");
}

export async function saveCounselor(payload: Partial<Counselor>): Promise<string> {
  const id = payload.ID || uuid();
  const row = {
    id: id,
    name: payload.Name || "",
    image_url: payload.ImageURL || "",
    intro: payload.Intro || "",
    qualifications: payload.Qualifications || "",
    extra: payload.Extra || "",
    contact: payload.Contact || "",
    status: payload.Status || "Draft",
    created_date: payload.CreatedDate || new Date().toISOString(),
    updated_date: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase.from('counselors').upsert([row], { onConflict: 'id' }).select('*').single();
    if (!error && data) {
      return data.id;
    }
    console.warn("Failed to save counselor in Supabase, using local storage fallback:", error?.message);
  } catch (err) {
    console.warn("Supabase save counselor error, using local storage fallback:", err);
  }

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('local_counselors');
    let localList: Counselor[] = [];
    if (stored) {
      try {
        localList = JSON.parse(stored);
      } catch {}
    }
    const counselor: Counselor = {
      ID: id,
      Name: row.name,
      ImageURL: row.image_url,
      Intro: row.intro,
      Qualifications: row.qualifications,
      Extra: row.extra,
      Contact: row.contact,
      Status: row.status as 'Draft' | 'Published',
      CreatedDate: row.created_date,
      UpdatedDate: row.updated_date
    };

    const existingIndex = localList.findIndex(c => c.ID === id);
    if (existingIndex >= 0) {
      localList[existingIndex] = counselor;
    } else {
      localList.push(counselor);
    }
    localStorage.setItem('local_counselors', JSON.stringify(localList));
  }

  return id;
}

export async function deleteCounselor(id: string): Promise<boolean> {
  let isMissingTable = false;
  try {
    const { error } = await supabase.from('counselors').delete().eq('id', id);
    if (error) {
      const errMsg = (error.message || '').toLowerCase();
      isMissingTable =
        errMsg.includes("could not find the table") ||
        errMsg.includes("relation") ||
        errMsg.includes("does not exist") ||
        errMsg.includes("schema cache");

      if (!isMissingTable) {
        throw new Error(error.message || "Database failed to delete counselor.");
      }
    }
  } catch (err: any) {
    const errMsg = (err?.message || '').toLowerCase();
    const isMissingTableError =
      errMsg.includes("could not find the table") ||
      errMsg.includes("relation") ||
      errMsg.includes("does not exist") ||
      errMsg.includes("schema cache");

    if (!isMissingTableError) {
      throw err;
    }
  }

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('local_counselors');
    if (stored) {
      try {
        let localList: Counselor[] = JSON.parse(stored);
        localList = localList.filter(c => c.ID !== id);
        localStorage.setItem('local_counselors', JSON.stringify(localList));
      } catch {}
    }
  }
  return true;
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
// SAVE & UPSERT OPERATIONS (Backend stays preserved + safe pin sync)
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
  if (payload.IsPinned !== undefined) {
    await togglePinRecord('courses', data.id, Boolean(payload.IsPinned));
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
  if (payload.IsPinned !== undefined) {
    await togglePinRecord('blogs', data.id, Boolean(payload.IsPinned));
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
  if (payload.IsPinned !== undefined) {
    await togglePinRecord('reference_materials', data.id, Boolean(payload.IsPinned));
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
  if (payload.IsPinned !== undefined) {
    await togglePinRecord('career_labs', data.id, Boolean(payload.IsPinned));
  }
  return data.id;
}

export async function deleteRecord(table: PinnableTable, id: string): Promise<boolean> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);
  // Clean up local pin entry if present
  const map = readPinMap();
  const key = pinKey(table, id);
  if (key in map) {
    delete map[key];
    writePinMap(map);
  }
  return true;
}

export async function updateUserRole(email: string, role: UserRole): Promise<boolean> {
  const { error } = await supabase.from('users').update({ role, status: 'Active' }).eq('email', email.trim().toLowerCase());
  if (error) throw new Error(error.message);
  return true;
}

export async function deleteUserAndBlogs(email: string): Promise<boolean> {
  const safeEmail = String(email || '').toLowerCase().trim();
  const { data: posts, error: fetchErr } = await supabase.from('blogs').select('id').eq('author_email', safeEmail);
  if (!fetchErr && posts) {
    for (const p of posts) {
      await deleteRecord('blogs', p.id);
    }
  }
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

  const { error } = await supabase.storage
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
    IsPinned: resolvePinnedState('courses', row.id, row.is_pinned),
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
    IsPinned: resolvePinnedState('blogs', row.id, row.is_pinned),
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
    IsPinned: resolvePinnedState('reference_materials', row.id, row.is_pinned),
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
    IsPinned: resolvePinnedState('career_labs', row.id, row.is_pinned),
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

function toCounselor(row: any): Counselor {
  return {
    ID: row.id,
    Name: row.name,
    ImageURL: row.image_url,
    Intro: row.intro,
    Qualifications: row.qualifications,
    Extra: row.extra,
    Contact: row.contact,
    Status: row.status,
    CreatedDate: row.created_date,
    UpdatedDate: row.updated_date,
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

// Helper to convert drive links to safe preview/view links that open in any browser/iframe context
export function getPdfDownloadUrl(url: string): string {
  if (!url) return "";

  let cleaned = url.replace(/['"<>]/g, "").trim();

  try {
    if (cleaned.includes('%')) {
      cleaned = decodeURIComponent(cleaned);
    }
  } catch (e) {
    console.error("Failed to decode URL", cleaned);
  }

  let m = cleaned.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) {
    return `https://drive.google.com/file/d/${m[1]}/view?usp=drivesdk`;
  }
  m = cleaned.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) {
    return `https://drive.google.com/file/d/${m[1]}/view?usp=drivesdk`;
  }

  return cleaned;
}
