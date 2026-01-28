
import { Course, CourseCategory, Resource, Testimonial, Video, BatchAnnouncement, TimetableItem, LibraryChapter, LibraryResource, Student } from './types';

// Replace these with your actual YouTube Data API Key and Channel ID
export const YOUTUBE_CONFIG = {
  API_KEY: 'AIzaSyCCiJAueBG51oEB6vYYNDoZAG5muIZsRZo', // e.g., 'AIzaSy...'
  CHANNEL_ID: 'UCZhIdWYpuVdJGVEqgy3_Vhg', // This is a guess/placeholder. Replace with the actual channel ID for 'Dhriti Classes'
  
  // TOGGLE: Set to true to fetch from YouTube API, false to use the preset VIDEOS list below
  USE_API: true 
};

export const COURSES: Course[] = [
  {
    id: 'c1',
    title: 'JEE Nurture',
    subTitle: 'Batch',
    category: CourseCategory.JEE,
    description: 'For Class 11th',
    targetYear: '2027',
    duration: '2 Years',
    price: '₹ 1,20,000',
    features: ['Live Interactive Classes', 'Daily Practice Papers', 'All India Test Series'],
    batchDate: '25th March 2026',
    endDate: 'Feb 2027',
    studentImage: 'https://png.pngtree.com/png-vector/20230928/ourmid/pngtree-young-indian-student-png-image_10149659.png',
    colorTheme: 'purple',
    faculty: ['R.K. Gupta (Physics)', 'S.K. Mishra (Maths)', 'Dr. P. Sharma (Chemistry)']
  },
  {
    id: 'c2',
    title: 'JEE Enthuse',
    subTitle: 'Batch',
    category: CourseCategory.JEE,
    description: 'For Class 12th',
    targetYear: '2026',
    duration: '1 Year',
    price: '₹ 85,000',
    features: ['Board Exam Preparation', 'Advanced Level Testing', '1-on-1 Mentorship'],
    batchDate: '4th February 2026',
    endDate: 'Jan 2027',
    studentImage: 'https://png.pngtree.com/png-vector/20240322/ourmid/pngtree-indian-student-girl-with-backpack-png-image_12188277.png',
    colorTheme: 'orange',
    faculty: ['A.K. Singh (Physics)', 'B.L. Verma (Maths)', 'V.K. Jaiswal (Inorganic Chem)']
  },
  {
    id: 'c3',
    title: 'JEE Dropper',
    subTitle: 'Batch',
    category: CourseCategory.JEE,
    description: 'For Class 12th Pass',
    targetYear: '2026',
    duration: '1 Year',
    price: '₹ 95,000',
    features: ['Rapid Syllabus Coverage', 'Focus on Problem Solving', 'Rank Booster Material'],
    batchDate: '25th March 2026',
    endDate: 'Mar 2027',
    studentImage: 'https://png.pngtree.com/png-vector/20230527/ourmid/pngtree-indian-student-girl-holding-books-vector-png-image_7110904.png',
    colorTheme: 'blue',
    faculty: ['N.K. Sethi (Physics)', 'M.S. Chouhan (Organic Chem)', 'P. Bahadur (Physical Chem)']
  },
  {
    id: 'c4',
    title: 'Achiever NEET',
    subTitle: 'Batch',
    category: CourseCategory.NEET,
    description: 'For Class 12th Pass',
    targetYear: '2026',
    duration: '1 Year',
    price: '₹ 80,000',
    features: ['NCERT Mastery', 'Diagram-based Learning', 'Daily Biology Quizzes'],
    batchDate: '10th April 2026',
    endDate: 'April 2027',
    studentImage: 'https://png.pngtree.com/png-vector/20230928/ourmid/pngtree-young-indian-student-png-image_10149659.png',
    colorTheme: 'red',
    faculty: ['Dr. A. Ali (Botany)', 'Dr. S. Khan (Zoology)', 'R.D. Sharma (Physics)']
  },
  {
    id: 'c5',
    title: 'Foundation Pro',
    subTitle: 'Batch',
    category: CourseCategory.FOUNDATION,
    description: 'For Class 9th & 10th',
    targetYear: '2028',
    duration: '1 Year',
    price: '₹ 45,000',
    features: ['Olympiad Prep', 'NTSE Coverage', 'Mental Ability Training'],
    batchDate: '1st May 2026',
    endDate: 'Feb 2027',
    studentImage: 'https://png.pngtree.com/png-vector/20240322/ourmid/pngtree-indian-student-girl-with-backpack-png-image_12188277.png',
    colorTheme: 'purple',
    faculty: ['Expert Olympiad Trainers', 'Subject Matter Experts']
  },
  {
    id: 'c6',
    title: 'Leader NEET',
    subTitle: 'Batch',
    category: CourseCategory.NEET,
    description: 'For Class 12th',
    targetYear: '2026',
    duration: '1 Year',
    price: '₹ 90,000',
    features: ['Score Booster', 'Personal Mentorship', 'Mistake Analysis'],
    batchDate: '15th April 2026',
    endDate: 'April 2027',
    studentImage: 'https://png.pngtree.com/png-vector/20230527/ourmid/pngtree-indian-student-girl-holding-books-vector-png-image_7110904.png',
    colorTheme: 'blue',
    faculty: ['Dr. H.K. Tyagi (Biology)', 'S.P. Singh (Physics)', 'D.K. Goyal (Chemistry)']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Ramit Goyal',
    rank: 'AIR 45',
    exam: 'JEE 2025',
    quote: "Whenever I doubted myself, my mentor at Dhriti reminded me of how far I had come. That personal connect was priceless. Today, I'm an IITian at IIT MUMBAI.",
    image: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 't2',
    name: 'Maulik Jain',
    rank: 'AIR 52',
    exam: 'JEE 2025',
    quote: "Dhriti's systematic schedule, doubt-clearing sessions, and rigorous practice sessions prepared me for JEE's toughest challenges. Now, I'm at IIT MUMBAI.",
    image: 'https://randomuser.me/api/portraits/men/5.jpg'
  },
  {
    id: 't3',
    name: 'Arush Anand',
    rank: 'AIR 64',
    exam: 'JEE 2025',
    quote: "At Dhriti, inspiration was everywhere—posters of toppers, success stories, and even our own seniors guiding us. That culture kept me motivated. Now, I'm living my own IIT dream at IIT MUMBAI.",
    image: 'https://randomuser.me/api/portraits/men/55.jpg'
  }
];

export const RESOURCES: Resource[] = [
  { id: 'r1', title: 'JEE Advanced Previous Year Paper 2023', subject: 'Physics', date: '12 May 2024', size: '2.4 MB' },
  { id: 'r2', title: 'NEET Biology Mind Maps', subject: 'Biology', date: '10 May 2024', size: '5.1 MB' },
  { id: 'r3', title: 'Physics Formula Sheet (Mechanics)', subject: 'Physics', date: '05 May 2024', size: '1.2 MB' },
  { id: 'r4', title: 'Chemistry Equation Balancer Guide', subject: 'Chemistry', date: '02 May 2024', size: '3.8 MB' },
  { id: 'r5', title: 'Full Length Mock Test - JEE Mains', subject: 'Mathematics', date: '28 Apr 2024', size: '4.5 MB' },
  { id: 'r6', title: 'Organic Chemistry Named Reactions', subject: 'Chemistry', date: '25 Apr 2024', size: '1.9 MB' },
  { id: 'r7', title: 'Calculus Cheat Sheet', subject: 'Mathematics', date: '20 Apr 2024', size: '1.5 MB' },
  { id: 'r8', title: 'Plant Kingdom NCERT Highlights', subject: 'Biology', date: '15 Apr 2024', size: '3.2 MB' },
];

export const VIDEOS: Video[] = [
  { 
    id: 'v1', 
    title: 'Class 10th - Light Reflection and Refraction | Physics', 
    videoId: 'erfYBftAcdU', 
    thumbnail: 'https://img.youtube.com/vi/erfYBftAcdU/mqdefault.jpg',
    channelName: 'Dhriti Classes',
    duration: '22:15'
  },
  { 
    id: 'v2', 
    title: 'Acids, Bases and Salts - Class 10 Chemistry | One Shot', 
    videoId: 'FSyJA-gQ2m8', // Replaced with a valid Chemistry ID
    thumbnail: 'https://img.youtube.com/vi/FSyJA-gQ2m8/mqdefault.jpg',
    channelName: 'Dhriti Classes',
    duration: '50:12'
  },
  { 
    id: 'v3', 
    title: 'Life Processes Class 10 Science Biology | Full Chapter', 
    videoId: 'm8m-4t0ZgBQ', // Replaced with a valid Biology ID
    thumbnail: 'https://img.youtube.com/vi/m8m-4t0ZgBQ/mqdefault.jpg',
    channelName: 'Dhriti Classes',
    duration: '1:05:00'
  },
  { 
    id: 'v4', 
    title: 'Trigonometry Class 10 Maths | Chapter 8 One Shot', 
    videoId: 'LwfwF4M5z8s', // Replaced with a valid Maths ID
    thumbnail: 'https://img.youtube.com/vi/LwfwF4M5z8s/mqdefault.jpg',
    channelName: 'Dhriti Classes',
    duration: '48:30'
  },
  { 
    id: 'v5', 
    title: 'Electricity - Class 10 Physics | Full Chapter Explanation', 
    videoId: '74k2_i6E7Jc', // Replaced with a valid Physics ID
    thumbnail: 'https://img.youtube.com/vi/74k2_i6E7Jc/mqdefault.jpg',
    channelName: 'Dhriti Classes',
    duration: '55:20'
  }
];

export const ANNOUNCEMENTS = [
  { id: 1, text: "Admissions Open for 2026-27 Session. Early Bird Discount ends soon!", isNew: true },
  { id: 2, text: "JEE Main 2025 Phase 1 Results Declared. Check your rank now.", isNew: true },
  { id: 3, text: "New Batch for NEET Droppers starting from 15th April.", isNew: false },
  { id: 4, text: "Olympiad Level 2 Classes for Class 10th begin next week.", isNew: false },
  { id: 5, text: "Scholarship Test (OST) registration closes on Sunday.", isNew: true },
  { id: 6, text: "Special Webinar on 'How to Crack JEE Advanced' this Saturday.", isNew: true },
  { id: 7, text: "Download the updated answer key for All India Mock Test 3.", isNew: false },
];

// --- MOCK DATA FOR DASHBOARD ---

export const BATCH_ANNOUNCEMENTS: BatchAnnouncement[] = [
  { 
    id: 'a1', 
    batchId: 'c1', 
    title: 'Test Series Schedule Update', 
    message: 'The Minor Test 3 scheduled for Sunday is postponed to next Wednesday due to a public holiday.', 
    date: '2025-05-15', 
    time: '10:00 AM',
    author: 'Admin',
    isImportant: true,
    tags: ['Exam', 'Schedule']
  },
  { 
    id: 'a2', 
    batchId: 'c1', 
    title: 'Physics Notes Uploaded', 
    message: 'Chapter 4: Rotational Motion notes have been uploaded to the library. Please review the solved examples before tomorrow\'s class.', 
    date: '2025-05-14', 
    time: '02:30 PM',
    author: 'R.K. Gupta',
    isImportant: false,
    tags: ['Physics', 'Resources'] 
  },
  { 
    id: 'a3', 
    batchId: 'c1', 
    title: 'Chemistry Class Rescheduled', 
    message: 'Tomorrows Organic Chemistry class will be held at 5:00 PM instead of 4:00 PM.', 
    date: '2025-05-12', 
    time: '09:15 AM',
    author: 'Dr. P. Sharma',
    isImportant: false,
    tags: ['Class Update']
  },
  { 
    id: 'a4', 
    batchId: 'c1', 
    title: 'Welcome to JEE Nurture', 
    message: 'Welcome to the batch! Please complete your profile and download the syllabus.', 
    date: '2025-03-25', 
    time: '11:00 AM',
    author: 'Admin',
    isImportant: false,
    tags: ['General']
  },
];

export const BATCH_TIMETABLE: TimetableItem[] = [
  { id: 'tt1', time: '04:00 PM - 05:30 PM', subject: 'Physics', topic: 'Electrostatics - Coulomb Law', faculty: 'R.K. Gupta' },
  { id: 'tt2', time: '05:45 PM - 07:15 PM', subject: 'Mathematics', topic: 'Complex Numbers - Argand Plane', faculty: 'S.K. Mishra' },
  { id: 'tt3', time: '07:30 PM - 09:00 PM', subject: 'Physical Chem', topic: 'Solid State - Crystal Lattice', faculty: 'Dr. P. Sharma' },
];

export const LIBRARY_CHAPTERS: LibraryChapter[] = [
  // Physics
  { id: 'ch1', subject: 'Physics', title: 'Units and Measurements', chapterNumber: 1, isNew: false },
  { id: 'ch2', subject: 'Physics', title: 'Kinematics', chapterNumber: 2, isNew: true },
  { id: 'ch3', subject: 'Physics', title: 'Laws of Motion', chapterNumber: 3, isNew: false },
  // Chemistry
  { id: 'ch4', subject: 'Chemistry', title: 'Structure of Atom', chapterNumber: 1, isNew: true },
  { id: 'ch5', subject: 'Chemistry', title: 'Chemical Bonding', chapterNumber: 2, isNew: false },
  // Maths
  { id: 'ch6', subject: 'Mathematics', title: 'Sets and Relations', chapterNumber: 1, isNew: false },
  { id: 'ch7', subject: 'Mathematics', title: 'Trigonometric Functions', chapterNumber: 2, isNew: false },
];

// Sample PDF URL for testing
const SAMPLE_PDF = "https://pdfobject.com/pdf/sample.pdf";

export const LIBRARY_RESOURCES: LibraryResource[] = [
  { id: 'res1', chapterId: 'ch1', title: 'Chapter Notes - Dimensional Analysis', type: 'NOTES', uploadDate: '10 May 2025', url: SAMPLE_PDF, isNew: false },
  { id: 'res2', chapterId: 'ch1', title: 'DPP 01 - Unit Conversions', type: 'DPP', uploadDate: '11 May 2025', url: SAMPLE_PDF, isNew: false },
  { id: 'res3', chapterId: 'ch2', title: 'Kinematics Formula Sheet', type: 'MINDMAP', uploadDate: '15 May 2025', url: SAMPLE_PDF, isNew: true },
  { id: 'res4', chapterId: 'ch2', title: 'Full Chapter Notes (Handwritten)', type: 'NOTES', uploadDate: '16 May 2025', url: SAMPLE_PDF, isNew: true },
  { id: 'res5', chapterId: 'ch4', title: 'Bohr Model Explanation', type: 'NOTES', uploadDate: '20 May 2025', url: SAMPLE_PDF, isNew: true },
  { id: 'res6', chapterId: 'ch4', title: 'DPP 01 - Quantum Numbers', type: 'DPP', uploadDate: '21 May 2025', url: SAMPLE_PDF, isNew: false },
  { id: 'res7', chapterId: 'ch6', title: 'Sets Theory Summary', type: 'MINDMAP', uploadDate: '25 May 2025', url: SAMPLE_PDF, isNew: false },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', firstName: 'Arjun', lastName: 'Sharma', email: 'arjun.s@gmail.com', phone: '+91 9876543210', enrolledDate: '24 Mar 2025', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 's2', firstName: 'Priya', lastName: 'Patel', email: 'priya.p@gmail.com', phone: '+91 9876512345', enrolledDate: '25 Mar 2025', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 's3', firstName: 'Rohan', lastName: 'Verma', email: 'rohan.v@gmail.com', phone: '+91 9123456789', enrolledDate: '26 Mar 2025', avatar: 'https://randomuser.me/api/portraits/men/12.jpg' },
  { id: 's4', firstName: 'Sneha', lastName: 'Gupta', email: 'sneha.g@gmail.com', phone: '+91 9988776655', enrolledDate: '28 Mar 2025', avatar: 'https://randomuser.me/api/portraits/women/23.jpg' },
  { id: 's5', firstName: 'Vikram', lastName: 'Singh', email: 'vikram.s@gmail.com', phone: '+91 9811223344', enrolledDate: '02 Apr 2025', avatar: 'https://randomuser.me/api/portraits/men/67.jpg' },
];
