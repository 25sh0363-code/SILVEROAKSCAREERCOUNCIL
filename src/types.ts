/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Student' | 'Editor' | 'Admin';

export interface AppUser {
  email: string;
  name: string;
  role: UserRole;
  isAdmin: boolean;
}

export interface Course {
  ID: string;
  Title: string;
  Description: string;
  Instructor: string;
  Category: string;
  Grade: string;
  ThumbnailURL: string;
  YouTubeURL: string;
  PDFLink: string;
  Content: string;
  Status: 'Draft' | 'Published';
  CreatedDate: string;
  UpdatedDate: string;
}

export interface BlogPost {
  ID: string;
  Title: string;
  Content: string;
  FeaturedImageURL: string;
  PDFLink: string;
  AuthorEmail: string;
  Tags: string; // Comma-separated (e.g. "resume, academic, interview")
  Status: 'Draft' | 'Published';
  CreatedDate: string;
  UpdatedDate: string;
}

export interface ReferenceMaterial {
  ID: string;
  Title: string;
  Description: string;
  Author: string;
  Category: string;
  ThumbnailURL: string;
  YouTubeURL: string;
  PDFLink: string;
  Content: string;
  Status: 'Draft' | 'Published';
  CreatedDate: string;
  UpdatedDate: string;
}

export interface CareerLab {
  ID: string;
  Title: string;
  Student: string;
  Description: string;
  Mentor: string;
  Category: string;
  ThumbnailURL: string;
  YouTubeURL: string;
  PDFLink: string;
  Content: string;
  Status: 'Draft' | 'Published';
  CreatedDate: string;
  UpdatedDate: string;
}

export interface DbUser {
  Name: string;
  Email: string;
  Role: UserRole;
  Status: string;
  CreatedDate: string;
}

// UI configuration
export type CardLayoutPreset = 'classic-card' | 'bento-grid' | 'compact-list';
