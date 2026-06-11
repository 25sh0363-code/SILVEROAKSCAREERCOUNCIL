/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Settings2, Plus, Edit2, Trash2, ShieldCheck, UserCheck, RefreshCw, X, Image, FileText, CheckCircle2, AlertTriangle, Bold, Italic, Link2, Heading1, Heading2, Quote, List as ListIcon, ListOrdered } from 'lucide-react';
import { Course, BlogPost, ReferenceMaterial, CareerLab, DbUser, UserRole } from '../types';
import { 
  fetchAllCourses, fetchAllBlogs, fetchAllReferences, fetchAllCareerLabs, fetchAllUsers,
  saveCourse, saveBlogPost, saveReference, saveCareerLab, deleteRecord, updateUserRole, deleteUserAndBlogs,
  uploadFileToSupabase
} from '../lib/supabase';

interface StaffProps {
  user: { email: string; name: string; role: string; isAdmin: boolean };
}

type StaffTab = 'courses' | 'blogs' | 'references' | 'labs' | 'users';

export default function Staff({ user }: StaffProps) {
  const [activeTab, setActiveTab] = useState<StaffTab>('courses');
  
  // Data lists
  const [courses, setCourses] = useState<Course[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [refs, setRefs] = useState<ReferenceMaterial[]>([]);
  const [labs, setLabs] = useState<CareerLab[]>([]);
  const [users, setUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    courses: 0,
    blogs: 0,
    references: 0,
    labs: 0,
    users: 0
  });

  // Modal control
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<StaffTab | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Upload status states
  const [uploadProgress, setUploadProgress] = useState<string>('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cList, bList, rList, lList, uList] = await Promise.all([
        fetchAllCourses(false), // Get drafts as well
        fetchAllBlogs(false),
        fetchAllReferences(false),
        fetchAllCareerLabs(false),
        fetchAllUsers()
      ]);

      setCourses(cList);
      setBlogs(bList);
      setRefs(rList);
      setLabs(lList);
      setUsers(uList);

      setStats({
        courses: cList.length,
        blogs: bList.length,
        references: rList.length,
        labs: lList.length,
        users: uList.length
      });
    } catch (err) {
      console.error("Failed to load staff panel assets:", err);
    } finally {
      setLoading(false);
    }
  };

  // Safe delete handler
  const handleDelete = async (type: 'courses' | 'blogs' | 'reference_materials' | 'career_labs', id: string) => {
    if (!confirm("Are you absolutely sure you want to delete this resource? This action stands irreversible from the database.")) return;
    try {
      await deleteRecord(type, id);
      alert("Successfully removed record ✓");
      loadAll();
    } catch (err: any) {
      alert("Failed to remove item: " + err.message);
    }
  };

  // Modify user roles
  const handleRoleChange = async (email: string, targetRole: UserRole) => {
    if (!confirm(`Are you sure you want to alter the clearance level of ${email} to ${targetRole}?`)) return;
    try {
      await updateUserRole(email, targetRole);
      alert("Role changes published successfully!");
      loadAll();
    } catch (err: any) {
      alert("Clearance update failed: " + err.message);
    }
  };

  // Completely purge user
  const handleDeleteUser = async (email: string) => {
    if (!confirm(`CRITICAL WARNING:\nPurging user ${email} will permanently remove their credential rows AND they will lose custody of all blogs they authored. Proceed?`)) return;
    try {
      await deleteUserAndBlogs(email);
      alert("purged user and matching data!");
      loadAll();
    } catch (err: any) {
      alert("Operation failed: " + err.message);
    }
  };

  // Open item modal for add/edit
  const openModal = (tab: StaffTab, item?: any) => {
    setEditingItem(item || null);
    setModalType(tab);
    setModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      {/* 1. Header Hero Panel - Clean, spacious light theme */}
      <section className="mb-10 text-left border-b border-rose-100 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100/80 text-[#B80F2E] font-bold text-[10px] uppercase tracking-wider mb-4">
          <Settings2 className="w-3.5 h-3.5 text-[#B80F2E] animate-spin" />
          <span>Resource Administrative Panel</span>
        </div>
        <h1 className="text-2.5xl sm:text-3.5xl font-black text-gray-900 tracking-tight">Workspace Library Dashboard</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
          Stream, edit, approve, or prune counseling assets. Update user roles or configure templates immediately.
        </p>
      </section>

      {/* 2. KPI Indicator grids */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10 text-left">
        {[
          { label: 'Courses', val: stats.courses, color: 'text-blue-600 bg-blue-50 border-blue-100', tab: 'courses' },
          { label: 'Blog Posts', val: stats.blogs, color: 'text-red-700 bg-rose-50 border-rose-100', tab: 'blogs' },
          { label: 'References', val: stats.references, color: 'text-emerald-700 bg-emerald-50 border-emerald-100', tab: 'references' },
          { label: 'Career Labs', val: stats.labs, color: 'text-amber-600 bg-amber-50 border-amber-100', tab: 'labs' },
          { label: 'Users', val: stats.users, color: 'text-rose-700 bg-rose-50 border-rose-100', tab: 'users' },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => setActiveTab(item.tab as StaffTab)}
            className={`p-4 rounded-2xl border text-left cursor-pointer transition-all hover:shadow-md ${item.color} ${
              activeTab === item.tab ? 'ring-2 ring-gray-900 ring-offset-2' : ''
            }`}
          >
            <div className="text-2xl font-black">{item.val}</div>
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">{item.label}</div>
          </button>
        ))}
      </div>

      {/* 3. Panel Container Board */}
      <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
        
        {/* Navigation tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 flex-wrap overflow-x-auto">
          {[
            { id: 'courses', label: 'Manage Courses' },
            { id: 'blogs', label: 'Counselor Blogs' },
            { id: 'references', label: 'Reference Files' },
            { id: 'labs', label: 'Career Labs' },
            { id: 'users', label: 'User Roles' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StaffTab)}
              className={`px-5 py-4 border-b-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#B80F2E] text-[#B80F2E] bg-white font-extrabold'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Inner Tab Renderer */}
        <div className="p-6">
          {loading ? (
            <div className="py-24 text-center">
              <div className="spinner" />
              <p className="text-gray-400 font-semibold uppercase tracking-widest text-xs mt-4">Streaming database list...</p>
            </div>
          ) : (
            <div>
              
              {/* COURSES TAB VIEW */}
              {activeTab === 'courses' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 font-serif">Academic Course Modules</h3>
                      <p className="text-xs text-gray-500">Add or edit student challenges pipelines and CV preparation guides.</p>
                    </div>
                    <button 
                      onClick={() => openModal('courses')}
                      className="px-4 py-2 bg-gradient-to-r from-[#8F0A22] to-[#B80F2E] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Course</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-[#101827]">
                      <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left">Title</th>
                          <th className="px-4 py-3 text-left">Instructor</th>
                          <th className="px-4 py-3 text-left">Category</th>
                          <th className="px-4 py-3 text-left">Grade</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-semibold">
                        {courses.map(item => (
                          <tr key={item.ID} className="hover:bg-rose-50/20 transition-colors">
                            <td className="px-4 py-4 font-bold text-gray-900 max-w-xs truncate" title={item.Title}>{item.Title}</td>
                            <td className="px-4 py-4 text-gray-600">{item.Instructor}</td>
                            <td className="px-4 py-4 text-xs font-extrabold uppercase text-[#B80F2E]">
                              <span className="bg-rose-50 px-2 py-0.5 rounded">{item.Category}</span>
                            </td>
                            <td className="px-4 py-4 text-xs font-bold uppercase text-gray-500">
                              <span className="bg-gray-100 px-2.5 py-0.5 rounded-lg">{item.Grade}</span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full ${
                                item.Status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {item.Status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => openModal('courses', item)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors" title="Edit course">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete('courses', item.ID)} className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors" title="Delete course">
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

              {/* BLOGS TAB VIEW */}
              {activeTab === 'blogs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 font-serif">Counselor Publications</h3>
                      <p className="text-xs text-gray-500">Draft or publish editorial posts, guidance notes, and checklists.</p>
                    </div>
                    <button 
                      onClick={() => openModal('blogs')}
                      className="px-4 py-2 bg-gradient-to-r from-[#8F0A22] to-[#B80F2E] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Post</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-[#101827]">
                      <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left">Post Title</th>
                          <th className="px-4 py-3 text-left">Author</th>
                          <th className="px-4 py-3 text-left">Tags</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-semibold font-medium">
                        {blogs.map(item => (
                          <tr key={item.ID} className="hover:bg-rose-50/20 transition-colors">
                            <td className="px-4 py-4 font-bold text-gray-900 max-w-sm truncate" title={item.Title}>{item.Title}</td>
                            <td className="px-4 py-4 text-gray-600 text-xs truncate max-w-xs">{item.AuthorEmail}</td>
                            <td className="px-4 py-4 text-xs font-bold text-rose-700">
                              <span className="flex flex-wrap gap-1 max-w-44">
                                {(item.Tags || "").split(',').filter(Boolean).slice(0, 3).map((t, idx) => (
                                  <span key={idx} className="bg-rose-50 px-1.5 py-0.5 rounded">#{t.trim()}</span>
                                ))}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full ${
                                item.Status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {item.Status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => openModal('blogs', item)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors" title="Edit post">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete('blogs', item.ID)} className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors" title="Delete post">
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

              {/* REFERENCES TAB VIEW */}
              {activeTab === 'references' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 font-serif">Reference Material Assets</h3>
                      <p className="text-xs text-gray-500">Edit Latex templates, Ivy lists, and catalog guides.</p>
                    </div>
                    <button 
                      onClick={() => openModal('references')}
                      className="px-4 py-2 bg-gradient-to-r from-[#8F0A22] to-[#B80F2E] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Reference</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-[#101827]">
                      <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left">Document Title</th>
                          <th className="px-4 py-3 text-left">Creator</th>
                          <th className="px-4 py-3 text-left">Category</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-semibold font-medium">
                        {refs.map(item => (
                          <tr key={item.ID} className="hover:bg-rose-50/20 transition-colors">
                            <td className="px-4 py-4 font-bold text-gray-900 max-w-sm truncate" title={item.Title}>{item.Title}</td>
                            <td className="px-4 py-4 text-gray-600">{item.Author}</td>
                            <td className="px-4 py-4 text-xs font-extrabold uppercase text-[#B80F2E]">
                              <span className="bg-rose-50 px-2 py-0.5 rounded">{item.Category}</span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full ${
                                item.Status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {item.Status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => openModal('references', item)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors" title="Edit reference">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete('reference_materials', item.ID)} className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors" title="Delete reference">
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

              {/* LABS TAB VIEW */}
              {activeTab === 'labs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 font-serif font-serif">Career Laboratory Index</h3>
                      <p className="text-xs text-gray-500">Edit or approve student-authored portfolio submissions.</p>
                    </div>
                    <button 
                      onClick={() => openModal('labs')}
                      className="px-4 py-2 bg-gradient-to-r from-[#8F0A22] to-[#B80F2E] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Submission</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-[#101827]">
                      <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left">Project Title</th>
                          <th className="px-4 py-3 text-left">Student</th>
                          <th className="px-4 py-3 text-left">Mentor</th>
                          <th className="px-4 py-3 text-left">Discipline</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-semibold font-medium">
                        {labs.map(item => (
                          <tr key={item.ID} className="hover:bg-rose-50/20 transition-colors">
                            <td className="px-4 py-4 font-bold text-gray-900 max-w-xs truncate" title={item.Title}>{item.Title}</td>
                            <td className="px-4 py-4 text-gray-600">{item.Student}</td>
                            <td className="px-4 py-4 text-gray-600">👤 {item.Mentor}</td>
                            <td className="px-4 py-4 text-xs font-extrabold uppercase text-[#B80F2E]">
                              <span className="bg-rose-50 px-2 py-0.5 rounded">{item.Category}</span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full ${
                                item.Status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {item.Status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => openModal('labs', item)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors" title="Edit portfolio">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete('career_labs', item.ID)} className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors" title="Delete portfolio">
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

              {/* USERS TAB VIEW */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="pb-4 border-b border-gray-100 text-left">
                    <h3 className="text-lg font-bold text-gray-900 font-serif">Credential Clearance & User Roles</h3>
                    <p className="text-xs text-gray-500">Edit role clearance level to allow access to this Staff admin console.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-[#101827]">
                      <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left">User Name</th>
                          <th className="px-4 py-3 text-left">Email Address (school standard)</th>
                          <th className="px-4 py-3 text-left">Current clearance</th>
                          <th className="px-4 py-3 text-right">Admin actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-semibold font-medium">
                        {users.map(u => {
                          const isSelf = u.Email.toLowerCase() === user.email.toLowerCase();
                          return (
                            <tr key={u.Email} className="hover:bg-rose-50/20 transition-colors">
                              <td className="px-4 py-4 font-bold text-gray-900">{u.Name}</td>
                              <td className="px-4 py-4 text-gray-500 text-xs sm:text-sm font-semibold">{u.Email}</td>
                              <td className="px-4 py-4 text-xs font-bold text-rose-700">
                                <select
                                  value={u.Role}
                                  disabled={isSelf}
                                  onChange={(e) => handleRoleChange(u.Email, e.target.value as UserRole)}
                                  className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#B80F2E] disabled:opacity-50"
                                >
                                  <option value="Student">Student</option>
                                  <option value="Editor">Editor (Counselor/Faculty)</option>
                                  <option value="Admin">Admin (Full override)</option>
                                </select>
                              </td>
                              <td className="px-4 py-4 text-right">
                                {!isSelf && (
                                  <button
                                    onClick={() => handleDeleteUser(u.Email)}
                                    className="px-2.5 py-1 text-red-700 border border-red-100 hover:bg-rose-50 rounded-lg text-[11px] font-bold uppercase transition-all"
                                  >
                                    Purge user completely
                                  </button>
                                )}
                                {isSelf && (
                                  <span className="text-[10px] text-gray-400 uppercase italic font-bold">Acting Clearance Account</span>
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

            </div>
          )}
        </div>

      </div>

      {/* 4. UNIFIED MODAL FOR ADD/EDIT DIALOGS */}
      {modalOpen && modalType && (
        <ContentFormModal
          type={modalType}
          item={editingItem}
          onClose={() => { setModalOpen(false); setUploadProgress(''); }}
          onSaved={() => { setModalOpen(false); setUploadProgress(''); loadAll(); }}
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

// -------------------------------------------------------------
// UNIFIED CREATION / EDITING FORM COMPONENT
// -------------------------------------------------------------
interface ModalProps {
  type: StaffTab;
  item: any;
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
  
  // Field values
  const [title, setTitle] = useState(item?.Title || '');
  const [desc, setDesc] = useState(item?.Description || '');
  const [instructor, setInstructor] = useState(item?.Instructor || '');
  const [author, setAuthor] = useState(item?.Author || '');
  const [student, setStudent] = useState(item?.Student || '');
  const [mentor, setMentor] = useState(item?.Mentor || '');
  const [category, setCategory] = useState(item?.Category || '');
  const [grade, setGrade] = useState(item?.Grade || '');
  const [thumbnailURL, setThumbnailURL] = useState(item?.ThumbnailURL || '');
  const [youtubeURL, setYoutubeURL] = useState(item?.YouTubeURL || '');
  const [pdfLink, setPdfLink] = useState(item?.PDFLink || '');
  const [content, setContent] = useState(item?.Content || '');
  const [status, setStatus] = useState<'Draft' | 'Published'>(item?.Status || 'Draft');
  const [tags, setTags] = useState(item?.Tags || '');
  const [featuredImageURL, setFeaturedImageURL] = useState(item?.FeaturedImageURL || '');

  // Auto-suggest category states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const richEditorRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  // Compute all unique existing categories across types, highlighting the active type's categories first
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
    
    // Cross-pollination categories from other tabs
    let otherCategories: string[] = [];
    if (type !== 'courses' && courses) otherCategories.push(...courses.map(c => c.Category));
    if (type !== 'references' && references) otherCategories.push(...references.map(r => r.Category));
    if (type !== 'labs' && labs) otherCategories.push(...labs.map(l => l.Category));
    
    const otherUnique = Array.from(new Set(otherCategories.map(c => c?.trim()).filter(c => c && !currentUnique.includes(c))));
    
    return [...currentUnique, ...otherUnique];
  };

  const existingCategories = getExistingCategories();

  // Initialize the editor with content on mount so we don't wipe it out on re-renders
  useEffect(() => {
    if (richEditorRef.current) {
      richEditorRef.current.innerHTML = content;
    }
  }, []);

  // Exec Editor Formatting Commands safely
  const formatText = (command: string, value?: string) => {
    richEditorRef.current?.focus();
    document.execCommand(command, false, value || '');
  };

  const handleEditorUpdate = () => {
    if (richEditorRef.current) {
      setContent(richEditorRef.current.innerHTML);
    }
  };

  // Upload document file safely to Supabase storage
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

  // Submit and save action
  const handleSaveSubmit = async () => {
    if (!title.trim()) {
      alert("Title is a mandatory field.");
      return;
    }

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
          Content: content,
          Status: status,
          CreatedDate: item?.CreatedDate
        });
      } else if (type === 'blogs') {
        if (!content.trim()) {
          alert("Content body is mandatory.");
          return;
        }
        await saveBlogPost({
          ID: item?.ID,
          Title: title.trim(),
          Content: content,
          FeaturedImageURL: featuredImageURL.trim(),
          PDFLink: pdfLink.trim(),
          Tags: tags.trim(),
          Status: status,
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
          Content: content,
          Status: status,
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
          Content: content,
          Status: status,
          CreatedDate: item?.CreatedDate
        });
      }

      alert("Changes saved and written successfully!");
      onSaved();
    } catch (err: any) {
      alert("Save failed, verify permissions: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-2xl w-full max-h-[90vh] flex flex-col justify-between overflow-hidden">
        
        {/* Modal Top line */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-base font-extrabold uppercase text-[#B80F2E] tracking-wider text-left">
              {isEdit ? 'Modify Resource Post' : 'Add New Resource Post'}
            </h3>
            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">{type} catalog</span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content body */}
        <div className="p-6 overflow-y-auto space-y-4 text-left">
          
          {uploadProgress && (
            <div className="sticky top-0 bg-rose-500 text-white font-extrabold text-xs uppercase tracking-widest text-center px-4 py-2 rounded-xl mb-4 shadow">
              {uploadProgress}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Title <span className="text-red-700">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Aptitude Cv Guide, Liberal Arts syllabus..."
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#B80F2E]"
            />
          </div>

          {/* Type Specific fields */}
          {type === 'courses' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Instructor</label>
                <input
                  type="text"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="Mr. Raj Meheta..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">School Tier Grade</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
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
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Created By Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Counselor Panel, Ms. Shalini..."
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>
          )}

          {type === 'labs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Student <span className="text-red-700">*</span></label>
                <input
                  type="text"
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  placeholder="Suraj..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Mentor Adviser</label>
                <input
                  type="text"
                  value={mentor}
                  onChange={(e) => setMentor(e.target.value)}
                  placeholder="Ms. Shasini..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Description brief & category with autocomplete suggestions dropdown */}
          {type !== 'blogs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 relative" ref={dropdownRef}>
                <label className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center justify-between">
                  <span>Category Discipline</span>
                  {existingCategories.length > 0 && (
                    <span className="text-[10px] text-[#B80F2E] font-black uppercase tracking-wider">
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
                    placeholder="e.g. CV Prep, Resume CV..."
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none pr-8"
                  />
                  {existingCategories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowCategoryDropdown((prev) => !prev)}
                      className="absolute right-0 top-0 bottom-0 px-2.5 text-gray-400 hover:text-[#B80F2E] transition-colors focus:outline-none cursor-pointer flex items-center justify-center border-l border-gray-100"
                    >
                      <svg className={`w-3.5 h-3.5 transform transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Dropdown Suggestions */}
                {showCategoryDropdown && existingCategories.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-rose-100 rounded-xl shadow-lg py-1.5 text-xs font-semibold text-left">
                    {(() => {
                      const filtered = existingCategories.filter(cat => 
                        cat.toLowerCase().includes(category.toLowerCase())
                      );

                      if (filtered.length === 0) {
                        return (
                          <div className="px-3.5 py-2.5 text-gray-400 italic">
                            No match. Press Tab to keep custom category
                          </div>
                        );
                      }

                      return filtered.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategory(cat);
                            setShowCategoryDropdown(false);
                          }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-rose-50 hover:text-[#B80F2E] transition-colors flex items-center justify-between cursor-pointer border-b last:border-b-0 border-gray-50/50"
                        >
                          <span>{cat}</span>
                          {(() => {
                            const isCurrentType = 
                              type === 'courses' ? courses?.some(c => c.Category === cat) :
                              type === 'references' ? references?.some(r => r.Category === cat) :
                              type === 'labs' ? labs?.some(l => l.Category === cat) : false;
                            return isCurrentType ? (
                              <span className="text-[9px] bg-rose-50 text-[#B80F2E] px-1.5 py-0.5 rounded font-black uppercase tracking-wider border border-rose-100/50">
                                {type}
                              </span>
                            ) : (
                              <span className="text-[9px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-gray-100/50">
                                other
                              </span>
                            );
                          })()}
                        </button>
                      ));
                    })()}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Brief description</label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="A transient summary of contents..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Category-specific fields for blog post */}
          {type === 'blogs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-widest font-mono">Topic tags</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="comma-separated list (e.g. ivy, resume, stream)"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>
              <div className="space-y-1 text-left flex flex-col justify-end">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-1"><Image className="w-3.5 h-3.5" /> Featured Image</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'featured')}
                    className="flex-1 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold"
                  />
                  {featuredImageURL && <span className="text-emerald-700 font-extrabold text-[10px] self-center">Has File!</span>}
                </div>
              </div>
            </div>
          )}

          {/* Standard Media Asset Upload fields */}
          {type !== 'blogs' && (
            <div className="border border-rose-50 rounded-2xl p-4 bg-gray-50/50 gap-4 grid grid-cols-1 sm:grid-cols-2">
              
              {/* Thumbnail image */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-1.5"><Image className="w-3.5 h-3.5 text-rose-800" /> Cover Thumbnail</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, 'thumb')}
                  className="w-full py-1 text-xs border-r"
                />
                <input 
                  type="text"
                  value={thumbnailURL} 
                  onChange={(e) => setThumbnailURL(e.target.value)}
                  placeholder="URL link bypass..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-[10px] font-semibold focus:outline-none mt-1 bg-white"
                />
              </div>

              {/* YouTube video */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">YouTube Video URL</label>
                <input 
                  type="text"
                  value={youtubeURL} 
                  onChange={(e) => setYoutubeURL(e.target.value)}
                  placeholder="https://www.youtube.com/watch?..."
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 font-medium">Bypass empty if no media exists.</p>
              </div>

            </div>
          )}

          {/* Unified PDF Document Attachment */}
          <div className="space-y-1 border border-gray-200 rounded-2xl p-4 bg-zinc-50/50 text-left">
            <label className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-800 animate-pulse" />
              <span>Drive PDF Attachment</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={(e) => handleFileUpload(e, 'pdf')}
                className="flex-1 py-1.5 rounded-lg text-xs"
              />
              <input 
                type="text"
                value={pdfLink} 
                onChange={(e) => setPdfLink(e.target.value)}
                placeholder="Google Drive link or raw CDN URL..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-[10px] font-bold focus:outline-none bg-white"
              />
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-1">Accepts native PDF documents or linked Drive directories.</p>
          </div>

          {/* Clean Rich Text Body Editor */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-[#B80F2E] uppercase tracking-widest">Lesson Content / Publication Body</label>
            
            {/* Formatting utility row */}
            <div className="flex flex-wrap gap-1 bg-gray-50 border border-gray-200 p-1.5 rounded-t-xl overflow-x-auto">
              <button onClick={() => formatText('bold')} className="p-1.5 hover:bg-gray-200 rounded" title="Bold text"><Bold className="w-3.5 h-3.5" /></button>
              <button onClick={() => formatText('italic')} className="p-1.5 hover:bg-gray-200 rounded" title="Italic text"><Italic className="w-3.5 h-3.5" /></button>
              <button onClick={() => formatText('formatBlock', '<h2>')} className="p-1.5 hover:bg-gray-200 rounded text-xs font-bold" title="H2 Section">H2</button>
              <button onClick={() => formatText('formatBlock', '<h3>')} className="p-1.5 hover:bg-gray-200 rounded text-xs font-bold" title="H3 Sub-section">H3</button>
              <button onClick={() => formatText('insertUnorderedList')} className="p-1.5 hover:bg-gray-200 rounded" title="Bullet list"><ListIcon className="w-3.5 h-3.5" /></button>
              <button onClick={() => formatText('insertOrderedList')} className="p-1.5 hover:bg-gray-200 rounded" title="Numbered list"><ListOrdered className="w-3.5 h-3.5" /></button>
              <button onClick={() => formatText('formatBlock', '<blockquote>')} className="p-1.5 hover:bg-gray-200 rounded" title="Quote block"><Quote className="w-3.5 h-3.5" /></button>
              <button 
                onClick={() => {
                  const url = prompt("Link destination URI Address (e.g. hpps://...):");
                  if (url) formatText('createLink', url);
                }} 
                className="p-1.5 hover:bg-gray-200 rounded" 
                title="Hyperlink"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Editable drafting canvas */}
            <div
              ref={richEditorRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleEditorUpdate}
              placeholder="Draft your interactive narrative guidelines here..."
              className="w-full min-h-44 bg-white border-x border-b border-gray-200 rounded-b-xl px-4 py-3 text-xs sm:text-sm font-semibold outline-none focus:ring-1 focus:ring-gray-300 overflow-y-auto max-h-60"
            />
          </div>

          {/* Status draft or publish checkboxes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Post Clearance State</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Draft' | 'Published')}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="Draft">Draft (Internal/Admins only)</option>
              <option value="Published">Published (Public to student catalog)</option>
            </select>
          </div>

        </div>

        {/* Modal Footer lines */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-250 text-gray-700 rounded-lg text-xs font-bold uppercase transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveSubmit}
            className="px-5 py-2 bg-gradient-to-r from-[#8F0A22] to-[#B80F2E] text-white rounded-lg text-xs font-bold uppercase hover:brightness-105 transition"
          >
            💾 Commit Changes
          </button>
        </div>

      </div>
    </div>
  );
}
export function FileDownLoader() { return null; }
export function ArrowRightCircle() { return null; }
