
export enum CourseCategory {
  JEE = 'JEE',
  NEET = 'NEET',
  FOUNDATION = 'Foundation'
}

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    role: UserRole;
    first_name?: string;
    last_name?: string;
    phone?: string;
    subject?: string;
    avatar?: string;
  };
  // Flattened for easy UI access
  name?: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  subject?: string;
  avatar?: string;
  enrolled_at?: string;
  subscribed_batches?: string[];
  subscribedBatchIds: string[];
}

export interface Stream {
  id: string;
  title: string;
  description?: string;
}

export interface Batch {
  id: string;
  title: string;
  stream: string;
  stream_name?: string;
  stream_id?: string;
  description: string;
  subTitle?: string;
  targetYear?: string;
  duration?: string;
  colorTheme?: string;
}

export interface Subject {
  id: string;
  batch_id: string;
  name: string;
}

export interface Course {
  id: string;
  title: string;
  subTitle?: string;
  category: string;
  stream?: string;
  stream_name?: string;
  description: string;
  targetYear?: string;
  duration?: string;
  price?: string;
  registrationFee?: string;
  features: string[];
  batchDate?: string;
  endDate?: string;
  studentImage?: string;
  colorTheme?: string;
  faculty?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  rank: string;
  exam: string;
  quote: string;
  image: string;
}

export interface Resource {
  id: string;
  title: string;
  subject: string;
  date: string;
  size: string;
  file_url?: string;
  created_at?: string;
  is_new?: boolean;
  isNew?: boolean;
}

export interface Video {
  id: string;
  title: string;
  videoId: string;
  thumbnail: string;
  channelName: string;
  duration: string;
  seconds?: number;
}

export interface BatchAnnouncement {
  id: string;
  batchId?: string;
  batch_id?: string;
  title: string;
  message: string;
  date: string;
  time: string;
  author: string;
  isImportant?: boolean;
  is_important?: boolean;
  tags?: string[];
  created_at?: string;
}

export interface TimetableItem {
  id: string;
  batch_id?: string;
  date?: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  time?: string;
  subject: string;
  topic: string;
  faculty: string;
}

export interface LibraryChapter {
  id: string;
  batch_id?: string;
  subject_id?: string;
  subject?: string;
  title: string;
  chapter_number?: number;
  chapterNumber?: number;
  is_new?: boolean;
  isNew?: boolean;
}

export type ResourceType = 'notes' | 'dpp' | 'mindmap' | 'NOTES' | 'DPP' | 'MINDMAP';

export interface LibraryResource {
  id: string;
  title: string;
  type: ResourceType;
  // Backend fields
  file_url?: string;
  file_size?: number;
  batch_id?: string;
  subject_id?: string;
  chapter_id?: string;
  created_at?: string;
  // Frontend/mock fields
  chapterId?: string;
  uploadDate?: string;
  url?: string;
  isNew?: boolean;
  is_new?: boolean;
  subject?: string;
}

export interface Student {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  enrolledDate?: string;
  enrolled_at?: string;
  avatar?: string;
}
