/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Settings2,
  Plus,
  Edit2,
  Trash2,
  X,
  Image,
  FileText,
  Bold,
  Italic,
  Link2,
  Quote,
  List as ListIcon,
  ListOrdered,
  User,
  Pin,
  RotateCcw,
  Save,
  BookOpen,
  Newspaper,
  Library,
  FlaskConical,
  Users,
  GraduationCap
} from 'lucide-react';
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
import {
  fetchAllCourses,
  fetchAllBlogs,
  fetchAllReferences,
  fetchAllCareerLabs,
  fetchAllUsers,
  fetchAllCounselors,
  saveCourse,
  saveBlogPost,
  saveReference,
  saveCareerLab,
  saveCounselor,
  deleteCounselor,
  deleteRecord,
  updateUserRole,
  deleteUserAndBlogs,
  uploadFileToSupabase,
  togglePinRecord,
  sortPinnedFirst
} from '../lib/supabase';

interface StaffProps {
  user: { email: string; name: string; role: string; isAdmin: boolean };
  onNotify?: (msg: string, type?: 'success' | 'err') => void;
}

type StaffTab = 'courses' | 'blogs' | 'references' | 'labs' | 'users' | 'counselors';

export default function Staff({ user, onNotify }: StaffProps) {
  const [activeTab, setActiveTab] = useState<StaffTab>('courses');

  const [courses, setCourses] = useState<Course[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [refs, setRefs] = useState<ReferenceMaterial[]>([]);
  const [labs, setLabs] = useState<CareerLab[]>([]);
  const [users, setUsers] = useState<DbUser[]>([]);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    courses: 0,
    blogs: 0,
    references: 0,
    labs: 0,
    users: 0,
    counselors: 0
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<StaffTab | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cList, bList, rList, lList, uList, counsList] = await Promise.all([
        fetchAllCourses(false),
        fetchAllBlogs(false),
        fetchAllReferences(false),
        fetchAllCareerLabs(false),
        fetchAllUsers(),
        fetchAllCounselors(false)
      ]);

      setCourses(cList);
      setBlogs(bList);
      setRefs(rList);
      setLabs(lList);
      setUsers(uList);
      setCounselors(counsList);

      setStats({
        courses: cList.length,
        blogs: bList.length,
        references: rList.length,
        labs: lList.length,
        users: uList.length,
        counselors: counsList.length
      });
    } catch (err) {
      console.error("Failed to load staff panel assets:", err);
    } finally {
      setLoading(false);
    }
  };

  // Editorial Pin as Important for Students
  const handleTogglePin = async (
    table: PinnableTable,
    id: string,
    title: string,
    currentlyPinned?: boolean
  ) => {
    const nextPinned = !currentlyPinned;
    if (table === 'courses') {
      setCourses(prev => sortPinnedFirst(prev.map(i => i.ID === id ? { ...i, IsPinned: nextPinned } : i)));
    } else if (table === 'blogs') {
      setBlogs(prev => sortPinnedFirst(prev.map(i => i.ID === id ? { ...i, IsPinned: nextPinned } : i)));
    } else if (table === 'reference_materials') {
      setRefs(prev => sortPinnedFirst(prev.map(i => i.ID === id ? { ...i, IsPinned: nextPinned } : i)));
    } else if (table === 'career_labs') {
      setLabs(prev => sortPinnedFirst(prev.map(i => i.ID === id ? { ...i, IsPinned: nextPinned } : i)));
    }

    await togglePinRecord(table, id, nextPinned);
    onNotify?.(
      nextPinned ? `Pinned "${title}" as an important student notice` : `Unpinned "${title}"`,
      'success'
    );
  };

  const handleDelete = async (type: 'courses' | 'blogs' | 'reference_materials' | 'career_labs' | 'counselors', id: string) => {
    if (!confirm("Are you absolutely sure you want to delete this resource? This action stands irreversible from the database.")) return;
    try {
      if (type === 'counselors') {
        await deleteCounselor(id);
      } else {
        await deleteRecord(type, id);
      }
      onNotify?.("Successfully removed record", "success");
      loadAll();
    } catch (err: any) {
      alert("Failed to remove item: " + err.message);
    }
  };

  const handleResetCache = () => {
    if (!confirm("This will clear all local offline data from your browser cache, including any unsaved drafts. Are you sure you want to reset offline data?")) return;
    localStorage.removeItem('local_counselors');
    localStorage.removeItem('local_courses');
    localStorage.removeItem('local_blogs');
    localStorage.removeItem('local_reference_materials');
    localStorage.removeItem('local_career_labs');
    onNotify?.("Local offline caches cleared. Re-fetching from database...", "success");
    loadAll();
  };

  const handleRoleChange = async (email: string, targetRole: UserRole) => {
    if (!confirm(`Are you sure you want to alter the clearance level of ${email} to ${targetRole}?`)) return;
    try {
      await updateUserRole(email, targetRole);
      onNotify?.("Role changes published successfully!", "success");
      loadAll();
    } catch (err: any) {
      alert("Clearance update failed: " + err.message);
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`CRITICAL WARNING:\nPurging user ${email} will permanently remove their credential rows AND they will lose custody of all blogs they authored. Proceed?`)) return;
    try {
      await deleteUserAndBlogs(email);
      onNotify?.("Purged user and matching data.", "success");
      loadAll();
    } catch (err: any) {
      alert("Operation failed: " + err.message);
    }
  };

  const openModal = (tab: StaffTab, item?: any) => {
    setEditingItem(item || null);
    setModalType(tab);
    setModalOpen(true);
  };

  const kpiCards = [
    { label: 'Courses', val: stats.courses, tab: 'courses' as StaffTab, icon: BookOpen },
    { label: 'Editorial', val: stats.blogs, tab: 'blogs' as StaffTab, icon: Newspaper },
    { label: 'References', val: stats.references, tab: 'references' as StaffTab, icon: Library },
    { label: 'Career Labs', val: stats.labs, tab: 'labs' as StaffTab, icon: FlaskConical },
    { label: 'Counsellors', val: stats.counselors, tab: 'counselors' as StaffTab, icon: GraduationCap },
    { label: 'Users', val: stats.users, tab: 'users' as StaffTab, icon: Users },
  ];

  const renderStatusPill = (status: string) => (
    <span
      className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
        status === 'Published'
          ? 'bg-[#C8102E] text-white border-[#C8102E]'
          : 'bg-neutral-100 text-neutral-600 border-neutral-200'
      }`}
    >
      {status}
    </span>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#141416]">
      {/* Crisp White Executive Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 text-left">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#C8102E] mb-2">
            <Settings2 className="w-3.5 h-3.5" />
            <span>Staff Administration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-[#141416]">
            Workspace Library Dashboard
          </h1>
          <p className="text-neutral-600 text-sm mt-2 max-w-2xl leading-relaxed">
            Publish resources, pin important notices to the top for students, manage counselor profiles, and assign faculty roles.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-left">
        {/* KPI Selector Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
          {kpiCards.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.tab;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveTab(item.tab)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  active
                    ? 'bg-[#C8102E] text-white border-[#C8102E] shadow-md'
                    : 'bg-white text-[#141416] border-neutral-200 hover:border-[#C8102E]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    active ? 'bg-white/15 text-white' : 'bg-red-50 text-[#C8102E]'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className={`text-2xl font-serif font-semibold ${active ? 'text-white' : 'text-[#141416]'}`}>
                    {item.val}
                  </span>
                </div>
                <div className={`text-[11px] font-bold uppercase tracking-wider ${
                  active ? 'text-red-100' : 'text-neutral-500'
                }`}>
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Board */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-neutral-200 bg-[#FAFAFA] overflow-x-auto scrollbar-none">
            {[
              { id: 'courses', label: 'Manage Courses' },
              { id: 'blogs', label: 'Counselor Editorial' },
              { id: 'references', label: 'Reference Files' },
              { id: 'labs', label: 'Career Labs' },
              { id: 'counselors', label: 'Counsellors' },
              { id: 'users', label: 'User Roles' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as StaffTab)}
                className={`px-4 sm:px-5 py-3.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#C8102E] text-[#C8102E] bg-white'
                    : 'border-transparent text-neutral-500 hover:text-[#141416]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="py-24 text-center">
                <div className="spinner" />
                <p className="text-neutral-500 font-semibold uppercase tracking-widest text-xs mt-3">
                  Loading records...
                </p>
              </div>
            ) : (
              <div>
                {/* COURSES TAB */}
                {activeTab === 'courses' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-neutral-100">
                      <div>
                        <h3 className="text-lg font-semibold text-[#141416] font-serif">Academic Course Modules</h3>
                        <p className="text-xs text-neutral-500">Pin important courses to highlight them at the top for students.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openModal('courses')}
                        className="px-4 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Course</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-[#141416]">
                        <thead className="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                          <tr>
                            <th className="px-4 py-3 text-left">Title</th>
                            <th className="px-4 py-3 text-left">Instructor</th>
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-left">Grade</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {courses.map(item => (
                            <tr key={item.ID} className={`transition-colors ${item.IsPinned ? 'bg-red-50/40' : 'hover:bg-[#FAFAFA]'}`}>
                              <td className="px-4 py-3.5 font-semibold text-[#141416] max-w-xs" title={item.Title}>
                                <div className="flex items-center gap-2 min-w-0">
                                  {item.IsPinned && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#C8102E] text-white text-[9px] font-bold uppercase shrink-0">
                                      <Pin className="w-2.5 h-2.5 fill-current" /> Important
                                    </span>
                                  )}
                                  <span className="truncate">{item.Title}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-neutral-600 text-xs font-medium">{item.Instructor}</td>
                              <td className="px-4 py-3.5 text-xs font-bold uppercase text-[#C8102E]">
                                <span className="bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">{item.Category}</span>
                              </td>
                              <td className="px-4 py-3.5 text-xs font-semibold text-neutral-600">
                                <span className="bg-neutral-100 px-2.5 py-0.5 rounded-md">{item.Grade}</span>
                              </td>
                              <td className="px-4 py-3.5 text-center">{renderStatusPill(item.Status)}</td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePin('courses', item.ID, item.Title, item.IsPinned)}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                                      item.IsPinned
                                        ? 'bg-[#C8102E] text-white hover:bg-[#9E0B24]'
                                        : 'text-neutral-500 hover:text-[#C8102E] hover:bg-red-50 border border-neutral-200'
                                    }`}
                                    title={item.IsPinned ? 'Unpin notice' : 'Pin as important for students'}
                                  >
                                    <Pin className={`w-3.5 h-3.5 ${item.IsPinned ? 'fill-current' : ''}`} />
                                    <span className="hidden sm:inline">{item.IsPinned ? 'Pinned' : 'Pin'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openModal('courses', item)}
                                    className="p-2 text-neutral-500 hover:text-[#141416] hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors"
                                    title="Edit course"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete('courses', item.ID)}
                                    className="p-2 text-neutral-400 hover:text-[#C8102E] hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                    title="Delete course"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* BLOGS TAB */}
                {activeTab === 'blogs' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-neutral-100">
                      <div>
                        <h3 className="text-lg font-semibold text-[#141416] font-serif">Counselor Publications</h3>
                        <p className="text-xs text-neutral-500">Draft, pin important notices, or publish guidance articles.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openModal('blogs')}
                        className="px-4 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Post</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-[#141416]">
                        <thead className="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                          <tr>
                            <th className="px-4 py-3 text-left">Post Title</th>
                            <th className="px-4 py-3 text-left">Author</th>
                            <th className="px-4 py-3 text-left">Tags</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {blogs.map(item => (
                            <tr key={item.ID} className={`transition-colors ${item.IsPinned ? 'bg-red-50/40' : 'hover:bg-[#FAFAFA]'}`}>
                              <td className="px-4 py-3.5 font-semibold text-[#141416] max-w-sm" title={item.Title}>
                                <div className="flex items-center gap-2 min-w-0">
                                  {item.IsPinned && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#C8102E] text-white text-[9px] font-bold uppercase shrink-0">
                                      <Pin className="w-2.5 h-2.5 fill-current" /> Important
                                    </span>
                                  )}
                                  <span className="truncate">{item.Title}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-neutral-600 text-xs truncate max-w-xs">{item.AuthorEmail}</td>
                              <td className="px-4 py-3.5 text-xs font-semibold text-[#C8102E]">
                                <span className="flex flex-wrap gap-1 max-w-44">
                                  {(item.Tags || "").split(',').filter(Boolean).slice(0, 3).map((t, idx) => (
                                    <span key={idx} className="bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md">#{t.trim()}</span>
                                  ))}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-center">{renderStatusPill(item.Status)}</td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePin('blogs', item.ID, item.Title, item.IsPinned)}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                                      item.IsPinned
                                        ? 'bg-[#C8102E] text-white hover:bg-[#9E0B24]'
                                        : 'text-neutral-500 hover:text-[#C8102E] hover:bg-red-50 border border-neutral-200'
                                    }`}
                                    title={item.IsPinned ? 'Unpin post' : 'Pin as important for students'}
                                  >
                                    <Pin className={`w-3.5 h-3.5 ${item.IsPinned ? 'fill-current' : ''}`} />
                                    <span className="hidden sm:inline">{item.IsPinned ? 'Pinned' : 'Pin'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openModal('blogs', item)}
                                    className="p-2 text-neutral-500 hover:text-[#141416] hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors"
                                    title="Edit post"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete('blogs', item.ID)}
                                    className="p-2 text-neutral-400 hover:text-[#C8102E] hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                    title="Delete post"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* REFERENCES TAB */}
                {activeTab === 'references' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-neutral-100">
                      <div>
                        <h3 className="text-lg font-semibold text-[#141416] font-serif">Reference Material Assets</h3>
                        <p className="text-xs text-neutral-500">Pin essential templates and handbooks so students find them first.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openModal('references')}
                        className="px-4 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Reference</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-[#141416]">
                        <thead className="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                          <tr>
                            <th className="px-4 py-3 text-left">Document Title</th>
                            <th className="px-4 py-3 text-left">Creator</th>
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {refs.map(item => (
                            <tr key={item.ID} className={`transition-colors ${item.IsPinned ? 'bg-red-50/40' : 'hover:bg-[#FAFAFA]'}`}>
                              <td className="px-4 py-3.5 font-semibold text-[#141416] max-w-sm" title={item.Title}>
                                <div className="flex items-center gap-2 min-w-0">
                                  {item.IsPinned && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#C8102E] text-white text-[9px] font-bold uppercase shrink-0">
                                      <Pin className="w-2.5 h-2.5 fill-current" /> Important
                                    </span>
                                  )}
                                  <span className="truncate">{item.Title}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-neutral-600 text-xs font-medium">{item.Author}</td>
                              <td className="px-4 py-3.5 text-xs font-bold uppercase text-[#C8102E]">
                                <span className="bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">{item.Category}</span>
                              </td>
                              <td className="px-4 py-3.5 text-center">{renderStatusPill(item.Status)}</td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePin('reference_materials', item.ID, item.Title, item.IsPinned)}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                                      item.IsPinned
                                        ? 'bg-[#C8102E] text-white hover:bg-[#9E0B24]'
                                        : 'text-neutral-500 hover:text-[#C8102E] hover:bg-red-50 border border-neutral-200'
                                    }`}
                                    title={item.IsPinned ? 'Unpin document' : 'Pin as important for students'}
                                  >
                                    <Pin className={`w-3.5 h-3.5 ${item.IsPinned ? 'fill-current' : ''}`} />
                                    <span className="hidden sm:inline">{item.IsPinned ? 'Pinned' : 'Pin'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openModal('references', item)}
                                    className="p-2 text-neutral-500 hover:text-[#141416] hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors"
                                    title="Edit reference"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete('reference_materials', item.ID)}
                                    className="p-2 text-neutral-400 hover:text-[#C8102E] hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                    title="Delete reference"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* LABS TAB */}
                {activeTab === 'labs' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-neutral-100">
                      <div>
                        <h3 className="text-lg font-semibold text-[#141416] font-serif">Career Laboratory Index</h3>
                        <p className="text-xs text-neutral-500">Pin exemplary student research or edit submissions.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openModal('labs')}
                        className="px-4 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Submission</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-[#141416]">
                        <thead className="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                          <tr>
                            <th className="px-4 py-3 text-left">Project Title</th>
                            <th className="px-4 py-3 text-left">Student</th>
                            <th className="px-4 py-3 text-left">Mentor</th>
                            <th className="px-4 py-3 text-left">Discipline</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {labs.map(item => (
                            <tr key={item.ID} className={`transition-colors ${item.IsPinned ? 'bg-red-50/40' : 'hover:bg-[#FAFAFA]'}`}>
                              <td className="px-4 py-3.5 font-semibold text-[#141416] max-w-xs" title={item.Title}>
                                <div className="flex items-center gap-2 min-w-0">
                                  {item.IsPinned && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#C8102E] text-white text-[9px] font-bold uppercase shrink-0">
                                      <Pin className="w-2.5 h-2.5 fill-current" /> Important
                                    </span>
                                  )}
                                  <span className="truncate">{item.Title}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-neutral-600 text-xs font-medium">{item.Student}</td>
                              <td className="px-4 py-3.5 text-neutral-600 text-xs font-medium">{item.Mentor}</td>
                              <td className="px-4 py-3.5 text-xs font-bold uppercase text-[#C8102E]">
                                <span className="bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">{item.Category}</span>
                              </td>
                              <td className="px-4 py-3.5 text-center">{renderStatusPill(item.Status)}</td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePin('career_labs', item.ID, item.Title, item.IsPinned)}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                                      item.IsPinned
                                        ? 'bg-[#C8102E] text-white hover:bg-[#9E0B24]'
                                        : 'text-neutral-500 hover:text-[#C8102E] hover:bg-red-50 border border-neutral-200'
                                    }`}
                                    title={item.IsPinned ? 'Unpin project' : 'Pin as important for students'}
                                  >
                                    <Pin className={`w-3.5 h-3.5 ${item.IsPinned ? 'fill-current' : ''}`} />
                                    <span className="hidden sm:inline">{item.IsPinned ? 'Pinned' : 'Pin'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openModal('labs', item)}
                                    className="p-2 text-neutral-500 hover:text-[#141416] hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors"
                                    title="Edit portfolio"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete('career_labs', item.ID)}
                                    className="p-2 text-neutral-400 hover:text-[#C8102E] hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                    title="Delete portfolio"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                  <div className="space-y-4">
                    <div className="pb-4 border-b border-neutral-100 text-left">
                      <h3 className="text-lg font-semibold text-[#141416] font-serif">Credential Clearance &amp; User Roles</h3>
                      <p className="text-xs text-neutral-500">Assign Editor or Admin clearance to grant access to this Staff console.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-[#141416]">
                        <thead className="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                          <tr>
                            <th className="px-4 py-3 text-left">User Name</th>
                            <th className="px-4 py-3 text-left">Email Address</th>
                            <th className="px-4 py-3 text-left">Current Clearance</th>
                            <th className="px-4 py-3 text-right">Admin Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {users.map(u => {
                            const isSelf = u.Email.toLowerCase() === user.email.toLowerCase();
                            return (
                              <tr key={u.Email} className="hover:bg-[#FAFAFA] transition-colors">
                                <td className="px-4 py-3.5 font-semibold text-[#141416]">{u.Name}</td>
                                <td className="px-4 py-3.5 text-neutral-600 text-xs font-medium">{u.Email}</td>
                                <td className="px-4 py-3.5 text-xs font-semibold">
                                  <select
                                    value={u.Role}
                                    disabled={isSelf}
                                    onChange={(e) => handleRoleChange(u.Email, e.target.value as UserRole)}
                                    className="px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-[#141416] focus:outline-none focus:border-[#C8102E] disabled:opacity-50"
                                  >
                                    <option value="Student">Student</option>
                                    <option value="Editor">Editor (Counselor/Faculty)</option>
                                    <option value="Admin">Admin (Full override)</option>
                                  </select>
                                </td>
                                <td className="px-4 py-3.5 text-right">
                                  {!isSelf ? (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteUser(u.Email)}
                                      className="px-3 py-1.5 text-[#C8102E] border border-red-200 hover:bg-red-50 rounded-lg text-[11px] font-bold uppercase transition-colors cursor-pointer"
                                    >
                                      Purge User
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-neutral-400 uppercase italic font-bold">
                                      Acting Account
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* COUNSELLORS TAB */}
                {activeTab === 'counselors' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-neutral-100">
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-[#141416] font-serif">Career Counsellor Profiles</h3>
                        <p className="text-xs text-neutral-500">Add, edit, or delete career counsellors appearing across the portal.</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={handleResetCache}
                          className="px-3.5 py-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="Clear local browser cache for counselor records and reset fallback cache."
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset Cache</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openModal('counselors')}
                          className="px-4 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Counsellor</span>
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-[#141416]">
                        <thead className="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                          <tr>
                            <th className="px-4 py-3 text-left w-16">Photo</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Qualifications</th>
                            <th className="px-4 py-3 text-left">Contact Detail</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-left">
                          {counselors.map(item => (
                            <tr key={item.ID} className="hover:bg-[#FAFAFA] transition-colors">
                              <td className="px-4 py-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-red-50 border border-neutral-200 shrink-0">
                                  {item.ImageURL ? (
                                    <img src={item.ImageURL} alt={item.Name} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#C8102E]">
                                      <User className="w-4 h-4" />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3.5 font-semibold text-[#141416] max-w-xs truncate" title={item.Name}>{item.Name}</td>
                              <td className="px-4 py-3.5 text-neutral-600 text-xs max-w-xs truncate" title={item.Qualifications}>{item.Qualifications}</td>
                              <td className="px-4 py-3.5 text-neutral-600 text-xs">{item.Contact}</td>
                              <td className="px-4 py-3.5 text-center">{renderStatusPill(item.Status)}</td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openModal('counselors', item)}
                                    className="p-2 text-neutral-500 hover:text-[#141416] hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors"
                                    title="Edit counsellor"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete('counselors', item.ID)}
                                    className="p-2 text-neutral-400 hover:text-[#C8102E] hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                    title="Delete counsellor"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && modalType && (
        <ContentFormModal
          type={modalType}
          item={editingItem}
          onClose={() => {
            setModalOpen(false);
            setEditingItem(null);
          }}
          onSaved={() => {
            setModalOpen(false);
            setEditingItem(null);
            onNotify?.("Saved changes successfully.", "success");
            loadAll();
          }}
          uploadProgress={uploadProgress}
          setUploadProgress={setUploadProgress}
          currentUserEmail={user.email}
          courses={courses}
          blogs={blogs}
          references={refs}
          labs={labs}
        />
      )}
    </div>
  );
}

interface ModalProps {
  type: StaffTab;
  item: any | null;
  onClose: () => void;
  onSaved: () => void;
  uploadProgress: string;
  setUploadProgress: (prog: string) => void;
  currentUserEmail: string;
  courses: Course[];
  blogs: BlogPost[];
  references: ReferenceMaterial[];
  labs: CareerLab[];
}

function ContentFormModal({
  type,
  item,
  onClose,
  onSaved,
  uploadProgress,
  setUploadProgress,
  currentUserEmail,
  courses,
  blogs,
  references,
  labs
}: ModalProps) {
  const isEdit = !!item;
  const isCounselor = type === 'counselors';

  const [title, setTitle] = useState(isCounselor ? (item?.Name || '') : (item?.Title || ''));
  const [desc, setDesc] = useState(isCounselor ? (item?.Intro || '') : (item?.Description || ''));
  const [instructor, setInstructor] = useState(isCounselor ? (item?.Qualifications || '') : (item?.Instructor || ''));
  const [author, setAuthor] = useState(isCounselor ? (item?.Contact || '') : (item?.Author || ''));
  const [student, setStudent] = useState(item?.Student || '');
  const [mentor, setMentor] = useState(isCounselor ? (item?.Extra || '') : (item?.Mentor || ''));
  const [category, setCategory] = useState(item?.Category || '');
  const [grade, setGrade] = useState(item?.Grade || '');
  const [thumbnailURL, setThumbnailURL] = useState(isCounselor ? (item?.ImageURL || '') : (item?.ThumbnailURL || ''));
  const [youtubeURL, setYoutubeURL] = useState(item?.YouTubeURL || '');
  const [pdfLink, setPdfLink] = useState(item?.PDFLink || '');
  const [content, setContent] = useState(item?.Content || '');
  const [status, setStatus] = useState<'Draft' | 'Published'>(item?.Status || 'Draft');
  const [isPinned, setIsPinned] = useState<boolean>(Boolean(item?.IsPinned));
  const [tags, setTags] = useState(item?.Tags || '');
  const [featuredImageURL, setFeaturedImageURL] = useState(item?.FeaturedImageURL || '');

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const richEditorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const getExistingCategories = (): string[] => {
    let rawCategories: string[] = [];
    if (type === 'courses') {
      rawCategories = courses?.map(c => c.Category) || [];
    } else if (type === 'references') {
      rawCategories = references?.map(r => r.Category) || [];
    } else if (type === 'labs') {
      rawCategories = labs?.map(l => l.Category) || [];
    }

    const currentUnique = Array.from(new Set(rawCategories.map(c => c?.trim()).filter(Boolean)));

    let otherCategories: string[] = [];
    if (type !== 'courses' && courses) otherCategories.push(...courses.map(c => c.Category));
    if (type !== 'references' && references) otherCategories.push(...references.map(r => r.Category));
    if (type !== 'labs' && labs) otherCategories.push(...labs.map(l => l.Category));

    const otherUnique = Array.from(new Set(otherCategories.map(c => c?.trim()).filter(c => c && !currentUnique.includes(c))));

    return [...currentUnique, ...otherUnique];
  };

  const existingCategories = getExistingCategories();

  useEffect(() => {
    if (richEditorRef.current) {
      richEditorRef.current.innerHTML = content;
    }
  }, []);

  const formatText = (command: string, value?: string) => {
    richEditorRef.current?.focus();
    document.execCommand(command, false, value || '');
  };

  const handleEditorUpdate = () => {
    if (richEditorRef.current) {
      setContent(richEditorRef.current.innerHTML);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'thumb' | 'pdf' | 'featured') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(`Uploading ${file.name}...`);
    try {
      const url = await uploadFileToSupabase(file, `${type}-${field}`);
      if (field === 'thumb') setThumbnailURL(url);
      if (field === 'pdf') setPdfLink(url);
      if (field === 'featured') setFeaturedImageURL(url);
      setUploadProgress('Successfully uploaded!');
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
      setUploadProgress('Upload failed');
    }
  };

  const handleSaveSubmit = async () => {
    if (!title.trim()) {
      alert(isCounselor ? "Counsellor Name is a mandatory field." : "Title is a mandatory field.");
      return;
    }

    const finalContent = richEditorRef.current ? richEditorRef.current.innerHTML : content;

    try {
      if (type === 'courses') {
        await saveCourse({
          ID: item?.ID,
          Title: title.trim(),
          Description: desc.trim(),
          Instructor: instructor.trim() || 'Council Staff',
          Category: category.trim() || 'General',
          Grade: grade || 'Class 11',
          ThumbnailURL: thumbnailURL.trim(),
          YouTubeURL: youtubeURL.trim(),
          PDFLink: pdfLink.trim(),
          Content: finalContent,
          Status: status,
          IsPinned: isPinned,
          CreatedDate: item?.CreatedDate
        });
      } else if (type === 'blogs') {
        if (!finalContent.trim()) {
          alert("Content body is mandatory.");
          return;
        }
        await saveBlogPost({
          ID: item?.ID,
          Title: title.trim(),
          Content: finalContent,
          FeaturedImageURL: featuredImageURL.trim(),
          PDFLink: pdfLink.trim(),
          Tags: tags.trim(),
          Status: status,
          IsPinned: isPinned,
          CreatedDate: item?.CreatedDate
        }, currentUserEmail);
      } else if (type === 'references') {
        await saveReference({
          ID: item?.ID,
          Title: title.trim(),
          Description: desc.trim(),
          Author: author.trim() || 'Counselor Team',
          Category: category.trim() || 'Templates',
          ThumbnailURL: thumbnailURL.trim(),
          YouTubeURL: youtubeURL.trim(),
          PDFLink: pdfLink.trim(),
          Content: finalContent,
          Status: status,
          IsPinned: isPinned,
          CreatedDate: item?.CreatedDate
        });
      } else if (type === 'labs') {
        if (!student.trim()) {
          alert("Student name is a mandatory field for Career Lab.");
          return;
        }
        await saveCareerLab({
          ID: item?.ID,
          Title: title.trim(),
          Student: student.trim(),
          Description: desc.trim(),
          Mentor: mentor.trim() || 'Faculty Team',
          Category: category.trim() || 'Aptitude Research',
          ThumbnailURL: thumbnailURL.trim(),
          YouTubeURL: youtubeURL.trim(),
          PDFLink: pdfLink.trim(),
          Content: finalContent,
          Status: status,
          IsPinned: isPinned,
          CreatedDate: item?.CreatedDate
        });
      } else if (type === 'counselors') {
        await saveCounselor({
          ID: item?.ID,
          Name: title.trim(),
          ImageURL: thumbnailURL.trim(),
          Intro: desc.trim(),
          Qualifications: instructor.trim(),
          Extra: mentor.trim(),
          Contact: author.trim(),
          Status: status,
          CreatedDate: item?.CreatedDate
        });
      }

      onSaved();
    } catch (err: any) {
      alert("Save failed, verify permissions: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 max-w-2xl w-full max-h-[92vh] flex flex-col justify-between overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-[#FAFAFA]">
          <div className="text-left">
            <h3 className="text-base font-bold text-[#141416] tracking-tight">
              {isEdit ? 'Modify Resource Post' : 'Add New Resource Post'}
            </h3>
            <span className="text-[11px] text-[#C8102E] font-semibold uppercase tracking-widest">
              {type} catalog
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-[#141416] hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {uploadProgress && (
          <div className="px-6 py-2.5 bg-red-50 border-b border-red-100 text-xs font-semibold text-[#C8102E] text-left">
            {uploadProgress}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#141416] uppercase tracking-wider">
              {isCounselor ? 'Counsellor Full Name' : 'Resource Title'} <span className="text-[#C8102E]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isCounselor ? 'e.g. Ms. Ananya Sharma' : 'Enter a clear, descriptive title...'}
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium text-[#141416] focus:outline-none focus:ring-2 focus:ring-[#C8102E]/15 focus:border-[#C8102E]"
            />
          </div>

          {type === 'courses' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#141416] uppercase tracking-wider">Instructor</label>
                <input
                  type="text"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="Counselor or faculty name..."
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs font-medium text-[#141416] focus:outline-none focus:border-[#C8102E]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#141416] uppercase tracking-wider">School Tier Grade</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs font-medium text-[#141416] focus:outline-none focus:border-[#C8102E] bg-white"
                >
                  <option value="">— select grade tier —</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>
              </div>
            </div>
          )}

          {type === 'references' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#141416] uppercase tracking-wider">Created By Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Counselor Panel..."
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs font-medium text-[#141416] focus:outline-none focus:border-[#C8102E]"
              />
            </div>
          )}

          {type === 'labs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#141416] uppercase tracking-wider">
                  Student <span className="text-[#C8102E]">*</span>
                </label>
                <input
                  type="text"
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  placeholder="Student full name..."
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs font-medium text-[#141416] focus:outline-none focus:border-[#C8102E]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#141416] uppercase tracking-wider">Mentor Adviser</label>
                <input
                  type="text"
                  value={mentor}
                  onChange={(e) => setMentor(e.target.value)}
                  placeholder="Faculty mentor..."
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs font-medium text-[#141416] focus:outline-none focus:border-[#C8102E]"
                />
              </div>
            </div>
          )}

          {type === 'counselors' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#141416] uppercase tracking-wider">Brief Biography / Introduction</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="A brief introduction highlighting their advisory style and experience..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs font-medium text-[#141416] focus:outline-none focus:border-[#C8102E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#141416] uppercase tracking-wider">Academic Qualifications</label>
                  <input
                    type="text"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="e.g. M.Sc in Counseling Psychology..."
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs font-medium text-[#141416] focus:outline-none focus:border-[#C8102E]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#141416] uppercase tracking-wider">Advisory Focus / Specialties</label>
                  <input
                    type="text"
                    value={mentor}
                    onChange={(e) => setMentor(e.target.value)}
                    placeholder="e.g. Liberal Arts, STEM profile building..."
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs font-medium text-[#141416] focus:outline-none focus:border-[#C8102E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#141416] uppercase tracking-wider">Contact Email</label>
                  <input
                    type="email"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. advisor@hyd.silveroaks.co.in"
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs font-medium text-[#141416] focus:outline-none focus:border-[#C8102E]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#141416] uppercase tracking-wider flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5 text-[#C8102E]" />
                    <span>Profile Photo File</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'thumb')}
                      className="flex-1 py-1 text-xs"
                    />
                    {thumbnailURL && <span className="text-[#C8102E] font-bold text-[10px] shrink-0">Attached</span>}
                  </div>
                  <input
                    type="text"
                    value={thumbnailURL}
                    onChange={(e) => setThumbnailURL(e.target.value)}
                    placeholder="Or paste image URL..."
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-[11px] font-medium focus:outline-none focus:border-[#C8102E]"
                  />
                </div>
              </div>
            </div>
          )}

          {type !== 'blogs' && type !== 'counselors' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="text-xs font-bold text-[#141416] uppercase tracking-wider flex items-center justify-between">
                  <span>Category Discipline</span>
                  {existingCategories.length > 0 && (
                    <span className="text-[10px] text-[#C8102E] font-bold">
                      ({existingCategories.length} existing)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setShowCategoryDropdown(true);
                    }}
                    onFocus={() => setShowCategoryDropdown(true)}
                    placeholder="e.g. CV Prep, Stream Advice..."
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs font-medium text-[#141416] focus:outline-none focus:border-[#C8102E] pr-8"
                  />
                  {existingCategories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowCategoryDropdown((prev) => !prev)}
                      className="absolute right-0 top-0 bottom-0 px-2.5 text-neutral-400 hover:text-[#C8102E] cursor-pointer flex items-center justify-center border-l border-neutral-200"
                    >
                      <svg className={`w-3.5 h-3.5 transform transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>

                {showCategoryDropdown && existingCategories.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-neutral-200 rounded-xl shadow-lg py-1 text-xs font-medium text-left">
                    {(() => {
                      const matched = existingCategories.filter(cat =>
                        cat.toLowerCase().includes(category.toLowerCase())
                      );
                      if (matched.length === 0) {
                        return (
                          <div className="px-3.5 py-2.5 text-neutral-500 italic">
                            No match. Keep typing for a custom category.
                          </div>
                        );
                      }
                      return matched.map((cat) => {
                        const isCurrentType =
                          type === 'courses' ? courses?.some(c => c.Category === cat) :
                          type === 'references' ? references?.some(r => r.Category === cat) :
                          type === 'labs' ? labs?.some(l => l.Category === cat) : false;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setCategory(cat);
                              setShowCategoryDropdown(false);
                            }}
                            className="w-full text-left px-3.5 py-2.5 hover:bg-red-50 hover:text-[#C8102E] transition-colors flex items-center justify-between cursor-pointer border-b last:border-b-0 border-neutral-100"
                          >
                            <span>{cat}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              isCurrentType ? 'bg-red-50 text-[#C8102E]' : 'bg-neutral-100 text-neutral-500'
                            }`}>
                              {isCurrentType ? type : 'other'}
                            </span>
                          </button>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#141416] uppercase tracking-wider">Brief Description</label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="A concise summary of contents..."
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs font-medium text-[#141416] focus:outline-none focus:border-[#C8102E]"
                />
              </div>
            </div>
          )}

          {type === 'blogs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#141416] uppercase tracking-wider">Topic Tags</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="comma-separated (e.g. ivy, resume, stream)"
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs font-medium text-[#141416] focus:outline-none focus:border-[#C8102E]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#141416] uppercase tracking-wider flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-[#C8102E]" />
                  <span>Featured Image</span>
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'featured')}
                    className="flex-1 py-1.5 border border-neutral-200 rounded-xl text-xs px-2"
                  />
                  {featuredImageURL && <span className="text-[#C8102E] font-bold text-[10px] shrink-0">Attached</span>}
                </div>
              </div>
            </div>
          )}

          {type !== 'blogs' && type !== 'counselors' && (
            <div className="border border-neutral-200 rounded-xl p-4 bg-[#FAFAFA] gap-4 grid grid-cols-1 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#141416] uppercase tracking-wider flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-[#C8102E]" />
                  <span>Cover Thumbnail</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'thumb')}
                  className="w-full py-1 text-xs"
                />
                <input
                  type="text"
                  value={thumbnailURL}
                  onChange={(e) => setThumbnailURL(e.target.value)}
                  placeholder="Or paste image URL..."
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-[11px] font-medium focus:outline-none focus:border-[#C8102E] bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#141416] uppercase tracking-wider">YouTube Video URL</label>
                <input
                  type="text"
                  value={youtubeURL}
                  onChange={(e) => setYoutubeURL(e.target.value)}
                  placeholder="https://www.youtube.com/watch?..."
                  className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-xs font-medium text-[#141416] focus:outline-none focus:border-[#C8102E] bg-white"
                />
                <p className="text-[10px] text-neutral-500">Leave empty if no video lecture exists.</p>
              </div>
            </div>
          )}

          {type !== 'counselors' && (
            <div className="space-y-2 border border-neutral-200 rounded-xl p-4 bg-[#FAFAFA]">
              <label className="text-xs font-bold text-[#141416] uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C8102E]" />
                <span>Drive / PDF Attachment</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileUpload(e, 'pdf')}
                  className="flex-1 py-1.5 text-xs"
                />
                <input
                  type="text"
                  value={pdfLink}
                  onChange={(e) => setPdfLink(e.target.value)}
                  placeholder="Google Drive link or raw PDF URL..."
                  className="flex-1 px-3 py-2 border border-neutral-200 rounded-xl text-[11px] font-medium focus:outline-none focus:border-[#C8102E] bg-white"
                />
              </div>
              <p className="text-[10px] text-neutral-500">Accepts native PDF documents or linked Google Drive files.</p>
            </div>
          )}

          {type !== 'counselors' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#141416] uppercase tracking-wider">
                Lesson Content / Publication Body
              </label>

              <div className="flex flex-wrap gap-1 bg-[#FAFAFA] border border-neutral-200 p-1.5 rounded-t-xl overflow-x-auto">
                <button type="button" onClick={() => formatText('bold')} className="p-1.5 hover:bg-neutral-200 text-neutral-700 rounded cursor-pointer" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => formatText('italic')} className="p-1.5 hover:bg-neutral-200 text-neutral-700 rounded cursor-pointer" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => formatText('formatBlock', '<h2>')} className="p-1.5 hover:bg-neutral-200 text-neutral-700 rounded text-xs font-bold cursor-pointer" title="H2 Section">H2</button>
                <button type="button" onClick={() => formatText('formatBlock', '<h3>')} className="p-1.5 hover:bg-neutral-200 text-neutral-700 rounded text-xs font-bold cursor-pointer" title="H3 Sub-section">H3</button>
                <button type="button" onClick={() => formatText('insertUnorderedList')} className="p-1.5 hover:bg-neutral-200 text-neutral-700 rounded cursor-pointer" title="Bullet list"><ListIcon className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => formatText('insertOrderedList')} className="p-1.5 hover:bg-neutral-200 text-neutral-700 rounded cursor-pointer" title="Numbered list"><ListOrdered className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => formatText('formatBlock', '<blockquote>')} className="p-1.5 hover:bg-neutral-200 text-neutral-700 rounded cursor-pointer" title="Quote block"><Quote className="w-3.5 h-3.5" /></button>
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt("Link destination URL (e.g. https://...):");
                    if (url) formatText('createLink', url);
                  }}
                  className="p-1.5 hover:bg-neutral-200 text-neutral-700 rounded cursor-pointer"
                  title="Hyperlink"
                >
                  <Link2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div
                ref={richEditorRef}
                contentEditable
                suppressContentEditableWarning
                onBlur={handleEditorUpdate}
                className="w-full min-h-40 bg-white border-x border-b border-neutral-200 rounded-b-xl px-4 py-3 text-xs sm:text-sm text-[#141416] outline-none focus:ring-2 focus:ring-[#C8102E]/15 overflow-y-auto max-h-60"
              />
            </div>
          )}

          {/* Status & Pin as Important */}
          <div className={`grid grid-cols-1 ${type !== 'counselors' ? 'sm:grid-cols-2' : ''} gap-4`}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#141416] uppercase tracking-wider">Post Clearance State</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Draft' | 'Published')}
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-xs font-semibold text-[#141416] focus:outline-none focus:border-[#C8102E] bg-white"
              >
                <option value="Draft">Draft (Internal/Admins only)</option>
                <option value="Published">Published (Public to student catalog)</option>
              </select>
            </div>

            {type !== 'counselors' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#141416] uppercase tracking-wider">Student Priority Notice</label>
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isPinned
                      ? 'bg-[#C8102E] text-white border-[#C8102E]'
                      : 'bg-white text-[#141416] border-neutral-200 hover:border-[#C8102E]'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-current' : 'text-[#C8102E]'}`} />
                    <span>{isPinned ? 'Pinned as Important' : 'Pin as Important'}</span>
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    isPinned ? 'bg-white/20 text-white' : 'bg-red-50 text-[#C8102E]'
                  }`}>
                    {isPinned ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3 bg-[#FAFAFA]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-neutral-200 bg-white text-neutral-600 hover:text-[#141416] hover:bg-neutral-50 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveSubmit}
            className="px-5 py-2.5 bg-[#C8102E] hover:bg-[#9E0B24] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Commit Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function FileDownLoader() { return null; }
export function ArrowRightCircle() { return null; }
