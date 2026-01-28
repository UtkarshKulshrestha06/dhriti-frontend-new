
import { BATCH_ANNOUNCEMENTS, LIBRARY_RESOURCES, MOCK_STUDENTS, LIBRARY_CHAPTERS, COURSES } from '../constants';
import { BatchAnnouncement, LibraryResource, LibraryChapter, Course, User } from '../types';

// Keys for LocalStorage
const KEYS = {
  ANNOUNCEMENTS: 'dc_announcements',
  RESOURCES: 'dc_resources',
  STUDENTS: 'dc_students',
  CHAPTERS: 'dc_chapters',
  COURSES: 'dc_courses',
  STREAMS: 'dc_streams',
  PAGE_CONTENT_COURSES: 'dc_content_courses'
};

const DEFAULT_STREAMS = ['JEE', 'NEET', 'Foundation'];
const DEFAULT_COURSE_CONTENT = {
  title: 'Our Premium Classroom Courses',
  description: 'Meticulously designed curriculum to ensure comprehensive coverage and depth of understanding.'
};

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to transform MOCK_STUDENTS to User type for the first run
const getInitialUsers = (): User[] => {
  const students: User[] = MOCK_STUDENTS.map(s => ({
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    email: s.email,
    role: 'STUDENT',
    phone: s.phone,
    avatar: s.avatar,
    subscribedBatchIds: ['c1'] 
  }));

  const teachers: User[] = [
    { id: 't1', firstName: 'R.K.', lastName: 'Gupta', email: 'teacher@dhriti.com', role: 'TEACHER', phone: '9876543210', subscribedBatchIds: ['c1', 'c2'] }
  ];

  const admins: User[] = [
    { id: 'a1', firstName: 'Super', lastName: 'Admin', email: 'admin@dhriti.com', role: 'ADMIN', phone: '0000000000', subscribedBatchIds: [] }
  ];

  return [...students, ...teachers, ...admins];
};

// Initialize Data if empty
const initialize = () => {
  if (!localStorage.getItem(KEYS.ANNOUNCEMENTS)) {
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(BATCH_ANNOUNCEMENTS));
  }
  if (!localStorage.getItem(KEYS.RESOURCES)) {
    localStorage.setItem(KEYS.RESOURCES, JSON.stringify(LIBRARY_RESOURCES));
  }
  if (!localStorage.getItem(KEYS.STUDENTS)) {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(getInitialUsers()));
  }
  if (!localStorage.getItem(KEYS.CHAPTERS)) {
    localStorage.setItem(KEYS.CHAPTERS, JSON.stringify(LIBRARY_CHAPTERS));
  }
  if (!localStorage.getItem(KEYS.COURSES)) {
    localStorage.setItem(KEYS.COURSES, JSON.stringify(COURSES));
  }
  if (!localStorage.getItem(KEYS.STREAMS)) {
    localStorage.setItem(KEYS.STREAMS, JSON.stringify(DEFAULT_STREAMS));
  }
  if (!localStorage.getItem(KEYS.PAGE_CONTENT_COURSES)) {
    localStorage.setItem(KEYS.PAGE_CONTENT_COURSES, JSON.stringify(DEFAULT_COURSE_CONTENT));
  }
};

initialize();

export const api = {
  streams: {
    list: async (): Promise<string[]> => {
      await delay(200);
      return JSON.parse(localStorage.getItem(KEYS.STREAMS) || '[]');
    },
    add: async (stream: string): Promise<void> => {
      await delay(300);
      const streams = JSON.parse(localStorage.getItem(KEYS.STREAMS) || '[]');
      if (!streams.includes(stream)) {
        localStorage.setItem(KEYS.STREAMS, JSON.stringify([...streams, stream]));
      }
    },
    update: async (oldName: string, newName: string): Promise<void> => {
      await delay(300);
      const streams = JSON.parse(localStorage.getItem(KEYS.STREAMS) || '[]');
      const index = streams.indexOf(oldName);
      if (index !== -1) {
        streams[index] = newName;
        localStorage.setItem(KEYS.STREAMS, JSON.stringify(streams));
      }
    },
    set: async (streams: string[]): Promise<void> => {
      await delay(300);
      localStorage.setItem(KEYS.STREAMS, JSON.stringify(streams));
    },
    delete: async (stream: string): Promise<void> => {
      await delay(300);
      const streams = JSON.parse(localStorage.getItem(KEYS.STREAMS) || '[]');
      const filtered = streams.filter((s: string) => s !== stream);
      localStorage.setItem(KEYS.STREAMS, JSON.stringify(filtered));
    }
  },
  pageContent: {
    getCoursesPage: async (): Promise<{title: string, description: string}> => {
      await delay(200);
      return JSON.parse(localStorage.getItem(KEYS.PAGE_CONTENT_COURSES) || JSON.stringify(DEFAULT_COURSE_CONTENT));
    },
    updateCoursesPage: async (data: {title: string, description: string}): Promise<void> => {
      await delay(300);
      localStorage.setItem(KEYS.PAGE_CONTENT_COURSES, JSON.stringify(data));
    }
  },
  courses: {
    list: async (): Promise<Course[]> => {
        await delay(300);
        return JSON.parse(localStorage.getItem(KEYS.COURSES) || '[]');
    },
    get: async (id: string): Promise<Course | undefined> => {
        await delay(200);
        const all = JSON.parse(localStorage.getItem(KEYS.COURSES) || '[]');
        return all.find((c: Course) => c.id === id);
    },
    update: async (course: Course): Promise<void> => {
        await delay(500);
        const all = JSON.parse(localStorage.getItem(KEYS.COURSES) || '[]');
        const updated = all.map((c: Course) => c.id === course.id ? course : c);
        localStorage.setItem(KEYS.COURSES, JSON.stringify(updated));
    },
    create: async (course: Course): Promise<Course> => {
        await delay(500);
        const all = JSON.parse(localStorage.getItem(KEYS.COURSES) || '[]');
        const newCourse = { ...course, id: `c${Date.now()}` };
        localStorage.setItem(KEYS.COURSES, JSON.stringify([...all, newCourse]));
        return newCourse;
    },
    delete: async (id: string): Promise<void> => {
        await delay(400);
        const all = JSON.parse(localStorage.getItem(KEYS.COURSES) || '[]');
        const filtered = all.filter((c: Course) => c.id !== id);
        localStorage.setItem(KEYS.COURSES, JSON.stringify(filtered));
    }
  },
  users: {
    list: async (): Promise<User[]> => {
      await delay(300);
      return JSON.parse(localStorage.getItem(KEYS.STUDENTS) || '[]');
    },
    create: async (user: User): Promise<User> => {
       await delay(400);
       const all = JSON.parse(localStorage.getItem(KEYS.STUDENTS) || '[]');
       const newUser = { ...user, id: `u${Date.now()}` };
       localStorage.setItem(KEYS.STUDENTS, JSON.stringify([...all, newUser]));
       return newUser;
    },
    update: async (user: User): Promise<void> => {
       await delay(400);
       const all = JSON.parse(localStorage.getItem(KEYS.STUDENTS) || '[]');
       const updated = all.map((u: User) => u.id === user.id ? user : u);
       localStorage.setItem(KEYS.STUDENTS, JSON.stringify(updated));
    },
    delete: async (id: string): Promise<void> => {
       await delay(300);
       const all = JSON.parse(localStorage.getItem(KEYS.STUDENTS) || '[]');
       const filtered = all.filter((u: User) => u.id !== id);
       localStorage.setItem(KEYS.STUDENTS, JSON.stringify(filtered));
    }
  },
  announcements: {
    list: async (batchId: string): Promise<BatchAnnouncement[]> => {
      await delay(300);
      const all = JSON.parse(localStorage.getItem(KEYS.ANNOUNCEMENTS) || '[]');
      return all.filter((a: BatchAnnouncement) => a.batchId === batchId).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    create: async (announcement: BatchAnnouncement): Promise<BatchAnnouncement> => {
      await delay(500);
      const all = JSON.parse(localStorage.getItem(KEYS.ANNOUNCEMENTS) || '[]');
      const newAnnouncement = { ...announcement, id: `ann-${Date.now()}` };
      localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify([newAnnouncement, ...all]));
      return newAnnouncement;
    },
    update: async (id: string, updates: Partial<BatchAnnouncement>): Promise<void> => {
        await delay(400);
        const all = JSON.parse(localStorage.getItem(KEYS.ANNOUNCEMENTS) || '[]');
        const updated = all.map((a: BatchAnnouncement) => a.id === id ? { ...a, ...updates } : a);
        localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(updated));
    },
    delete: async (id: string): Promise<void> => {
        await delay(300);
        const all = JSON.parse(localStorage.getItem(KEYS.ANNOUNCEMENTS) || '[]');
        const filtered = all.filter((a: BatchAnnouncement) => a.id !== id);
        localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(filtered));
    }
  },
  resources: {
    list: async (batchId: string): Promise<LibraryResource[]> => { 
      await delay(300);
      const all = JSON.parse(localStorage.getItem(KEYS.RESOURCES) || '[]');
      return all; 
    },
    create: async (resource: LibraryResource): Promise<LibraryResource> => {
      await delay(600);
      const all = JSON.parse(localStorage.getItem(KEYS.RESOURCES) || '[]');
      const newRes = { ...resource, id: `res-${Date.now()}` };
      localStorage.setItem(KEYS.RESOURCES, JSON.stringify([newRes, ...all]));
      return newRes;
    },
    update: async (id: string, updates: Partial<LibraryResource>): Promise<void> => {
      await delay(400);
      const all = JSON.parse(localStorage.getItem(KEYS.RESOURCES) || '[]');
      const updated = all.map((r: LibraryResource) => r.id === id ? { ...r, ...updates } : r);
      localStorage.setItem(KEYS.RESOURCES, JSON.stringify(updated));
    },
    delete: async (id: string): Promise<void> => {
      await delay(300);
      const all = JSON.parse(localStorage.getItem(KEYS.RESOURCES) || '[]');
      const filtered = all.filter((r: LibraryResource) => r.id !== id);
      localStorage.setItem(KEYS.RESOURCES, JSON.stringify(filtered));
    }
  },
  chapters: {
    list: async (): Promise<LibraryChapter[]> => {
      await delay(200);
      return JSON.parse(localStorage.getItem(KEYS.CHAPTERS) || '[]');
    },
    create: async (chapter: LibraryChapter): Promise<LibraryChapter> => {
      await delay(400);
      const all = JSON.parse(localStorage.getItem(KEYS.CHAPTERS) || '[]');
      const newChapter = { ...chapter, id: `ch-${Date.now()}` };
      localStorage.setItem(KEYS.CHAPTERS, JSON.stringify([...all, newChapter]));
      return newChapter;
    },
    delete: async (id: string): Promise<void> => {
      await delay(300);
      const all = JSON.parse(localStorage.getItem(KEYS.CHAPTERS) || '[]');
      const filtered = all.filter((c: LibraryChapter) => c.id !== id);
      localStorage.setItem(KEYS.CHAPTERS, JSON.stringify(filtered));
    }
  }
};
