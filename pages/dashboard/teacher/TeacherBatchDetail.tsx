
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BATCH_TIMETABLE } from '../../../constants';
import { ArrowLeft, Bell, Calendar, BookOpen, Clock, AlertCircle, User, MessageCircle, Users, Edit, Loader2, ChevronRight, Hash, Trash2, Settings, Plus, LayoutGrid, ArrowDown, ArrowUp } from 'lucide-react';
import Button from '../../../components/Button';
import RichTextEditor from '../../../components/RichTextEditor';
import Modal from '../../../components/Modal';
import MarkdownText from '../../../components/MarkdownText';
import { BatchAnnouncement, Course, TimetableItem, User as UserType } from '../../../types';
import { api } from '../../../services/api';
import ModernDatePicker from '../../../components/ModernDatePicker';
import ModernTimePicker from '../../../components/ModernTimePicker';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { useViewStatus } from '../../../hooks/useViewStatus';

const TeacherBatchDetail: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { markBatchAsSeen } = useViewStatus();

  const [course, setCourse] = useState<Course | null>(null);
  const [announcements, setAnnouncements] = useState<BatchAnnouncement[]>([]);
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [teachers, setTeachers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ANNOUNCEMENTS' | 'TIMETABLE'>('ANNOUNCEMENTS');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Edit Announcement State
  const [editingAnnouncement, setEditingAnnouncement] = useState<{ id: string, title: string, message: string } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Timetable Edit State
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [classForm, setClassForm] = useState({
    id: '',
    subject: '',
    topic: '',
    faculty: '',
    date: new Date(),
    startTime: '04:00 PM',
    endTime: '05:30 PM'
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!batchId) return;
      setIsLoading(true);
      try {
        // Use Promise.allSettled to prevent one failure (like 403 on users) from breaking everything
        const results = await Promise.allSettled([
          api.courses.get(batchId),
          api.announcements.list(batchId),
          api.users.list(),
          api.timetable.get(batchId)
        ]);

        // 0: Course
        if (results[0].status === 'fulfilled') {
          setCourse(results[0].value);
        } else {
          console.error("Failed to fetch course", results[0].reason);
          setCourse(null);
        }

        // 1: Announcements
        if (results[1].status === 'fulfilled') {
          const annData = results[1].value || [];
          // Normalize announcements
          const normalizedAnn = annData.map((a: any) => ({
            ...a,
            batchId: a.batch_id || a.batchId,
            isImportant: a.is_important || a.isImportant,
            date: a.date || (a.created_at ? new Date(a.created_at).toLocaleDateString('en-GB') : ''),
            time: a.time || (a.created_at ? new Date(a.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''),
            // If author is missing, try to find name from users list later, or default
            authorName: a.author_name || (a.user_id === user?.id ? 'You' : 'Teacher')
          }));
          setAnnouncements(normalizedAnn);
        }

        // 2: Users (Teachers)
        if (results[2].status === 'fulfilled') {
          const allUsers = results[2].value;
          setTeachers(allUsers.filter((u: any) => u.role === 'TEACHER' || u.user_metadata?.role === 'TEACHER'));
        } else {
          // If users fetch fails (e.g. 403), we still want to allow the current user to select themselves if they are a teacher
          if (user && user.role === 'TEACHER') {
            setTeachers([user]);
          } else {
            setTeachers([]);
          }
        }

        // 3: Timetable
        if (results[3].status === 'fulfilled') {
          setTimetable(results[3].value || []);
        }

        // Mark as seen using the centralized hook
        if (batchId) {
          markBatchAsSeen(batchId);
        }

      } catch (error) {
        console.error("Failed to fetch teacher dashboard data", error);
        showToast("Failed to load data", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [batchId, user]);

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    const dateA = new Date(a.date || a.created_at || 0);
    const dateB = new Date(b.date || b.created_at || 0);
    if (dateA.getTime() === dateB.getTime()) return 0;

    return sortOrder === 'newest'
      ? dateB.getTime() - dateA.getTime()
      : dateA.getTime() - dateB.getTime();
  });

  if (!course) {
    if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-ocean-600" /></div>;
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Batch Not Found</h3>
        <p className="text-gray-500 mb-6">The batch you are looking for does not exist or you do not have permission to view it.</p>
        <Button onClick={() => navigate('/dashboard')} variant="outline">Go Back to Dashboard</Button>
      </div>
    );
  }

  // --- ANNOUNCEMENT HANDLERS ---

  const handlePostAnnouncement = async (data: { title: string, message: string, tags: string[], isImportant: boolean }) => {
    if (!batchId) return;
    try {
      const payload = {
        batch_id: batchId,
        title: data.title,
        message: data.message,
        is_important: data.isImportant,
        tags: data.tags
      };

      const created = await api.announcements.create(payload);
      const normalizedCreated = {
        ...created,
        batchId,
        isImportant: data.isImportant,
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        authorName: 'You'
      };
      setAnnouncements([normalizedCreated, ...announcements]);
      showToast("Announcement posted", "success");
    } catch (e) {
      showToast("Failed to post announcement", "error");
    }
  };

  const handleEditClick = (ann: BatchAnnouncement) => {
    setEditingAnnouncement({ id: ann.id, title: ann.title, message: ann.message });
    setShowEditModal(true);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await api.announcements.delete(id);
      setAnnouncements(announcements.filter(a => a.id !== id));
      setShowDeleteConfirm(null);
      showToast("Announcement deleted", "success");
    } catch (e) {
      showToast("Failed to delete", "error");
    }
  };

  const handleEditSubmit = async () => {
    if (!editingAnnouncement) return;
    setIsSubmitting(true);
    try {
      await api.announcements.update(editingAnnouncement.id, {
        title: editingAnnouncement.title,
        message: editingAnnouncement.message
      });

      setAnnouncements(announcements.map(a =>
        a.id === editingAnnouncement.id
          ? { ...a, title: editingAnnouncement.title, message: editingAnnouncement.message }
          : a
      ));
      setShowEditModal(false);
      showToast("Announcement updated", "success");
    } catch (e) {
      showToast("Failed to update", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- TIMETABLE HANDLERS ---

  const openAddClassModal = () => {
    setIsEditingClass(false);
    setClassForm({
      id: '',
      subject: '',
      topic: '',
      faculty: teachers.length > 0 ? `${teachers[0].firstName || teachers[0].first_name} ${teachers[0].lastName || teachers[0].last_name}` : '',
      date: new Date(),
      startTime: '04:00 PM',
      endTime: '05:30 PM'
    });
    setShowTimetableModal(true);
  };

  const openEditClassModal = (item: TimetableItem) => {
    setIsEditingClass(true);
    // Parse time range "04:00 PM - 05:30 PM" or "16:00 - 17:30"
    const timeParts = (item.time || "").split(' - ');
    const start = timeParts[0] || item.start_time || '09:00 AM';
    const end = timeParts[1] || item.end_time || '10:30 AM';

    setClassForm({
      id: item.id,
      subject: item.subject,
      topic: item.topic,
      faculty: item.faculty,
      date: item.date ? new Date(item.date) : new Date(),
      startTime: start,
      endTime: end
    });
    setShowTimetableModal(true);
  };

  const handleSaveClass = async () => {
    if (!classForm.subject || !classForm.topic || !batchId) {
      showToast("Please fill all required fields", "error");
      return;
    }

    try {
      const timeString = `${classForm.startTime} - ${classForm.endTime}`;
      const newItem: any = {
        id: isEditingClass ? classForm.id : `tt-${Date.now()}`,
        time: timeString,
        start_time: classForm.startTime,
        end_time: classForm.endTime,
        subject: classForm.subject,
        topic: classForm.topic,
        faculty: classForm.faculty || 'Guest Faculty',
        date: classForm.date.toISOString().split('T')[0]
      };

      let newTimetable;
      if (isEditingClass) {
        newTimetable = timetable.map(item => item.id === newItem.id ? newItem : item);
      } else {
        newTimetable = [...timetable, newItem];
      }

      await api.timetable.update(batchId, newTimetable);
      setTimetable(newTimetable);
      showToast(isEditingClass ? "Class updated" : "Class added", "success");
      setShowTimetableModal(false);
    } catch (e) {
      showToast("Failed to save schedule", "error");
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!batchId) return;
    try {
      const newTimetable = timetable.filter(t => t.id !== id);
      await api.timetable.update(batchId, newTimetable);
      setTimetable(newTimetable);
      showToast("Class removed", "success");
    } catch (e) {
      showToast("Failed to remove class", "error");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

      {/* 1. Header Bar (Command Center) */}
      <div className="bg-white border-b border-gray-100 p-6 flex items-center justify-between shrink-0 z-20 shadow-sm relative">
        <div className="flex items-center gap-6 relative z-10">
          <button onClick={() => navigate('/dashboard')} className="p-3 hover:bg-slate-50 rounded-full transition-colors border border-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              {course.title}
              <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-slate-200">{course.category}</span>
            </h1>
            <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wide">Teacher Command Center</p>
          </div>
        </div>

        <Link to={`/dashboard/teacher/batch/${batchId}/library`}>
          <Button className="flex items-center gap-2 shadow-xl shadow-ocean-200 px-6 py-3 text-sm rounded-xl hover:scale-105 transition-transform bg-gradient-to-r from-ocean-600 to-ocean-500 border-none">
            <BookOpen className="w-5 h-5" /> Open Library
          </Button>
        </Link>
      </div>

      <div className="flex-1 flex overflow-hidden">

        {/* 2. Sidebar Navigation (Consistent with Student Sidebar) */}
        <div className="w-80 bg-slate-50 border-r border-gray-200 flex flex-col shrink-0 p-4 gap-2">
          <div className="px-4 py-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Management</div>

          <button
            onClick={() => setActiveTab('ANNOUNCEMENTS')}
            className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all ${activeTab === 'ANNOUNCEMENTS'
              ? 'bg-white shadow-md text-ocean-700 ring-1 ring-ocean-100'
              : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-slate-700'
              }`}
          >
            <Bell className={`w-5 h-5 ${activeTab === 'ANNOUNCEMENTS' ? 'fill-ocean-100' : ''}`} /> Notice Board
            {activeTab === 'ANNOUNCEMENTS' && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>

          <button
            onClick={() => setActiveTab('TIMETABLE')}
            className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all ${activeTab === 'TIMETABLE'
              ? 'bg-white shadow-md text-ocean-700 ring-1 ring-ocean-100'
              : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-slate-700'
              }`}
          >
            <Calendar className={`w-5 h-5 ${activeTab === 'TIMETABLE' ? 'fill-ocean-100' : ''}`} /> Weekly Schedule
            {activeTab === 'TIMETABLE' && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>

          <Link to={`/dashboard/teacher/batch/${batchId}/students`}>
            <button className="w-full text-left px-5 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 text-gray-500 hover:bg-white hover:shadow-sm hover:text-slate-700 transition-all border border-transparent hover:border-gray-100">
              <Users className="w-5 h-5" /> Students
            </button>
          </Link>

          <Link to={`/dashboard/teacher/batch/${batchId}/library`}>
            <button className="w-full text-left px-5 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 text-gray-500 hover:bg-white hover:shadow-sm hover:text-slate-700 transition-all border border-transparent hover:border-gray-100">
              <BookOpen className="w-5 h-5" /> Library
            </button>
          </Link>
        </div>

        {/* 3. Main Content Area */}
        <div className="flex-1 bg-white overflow-y-auto custom-scrollbar p-6 lg:p-10">

          {/* ANNOUNCEMENTS TAB */}
          {activeTab === 'ANNOUNCEMENTS' && (
            <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Create Post Section */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">Post Announcement</h2>
                <RichTextEditor onPost={handlePostAnnouncement} />
              </div>

              <div className="border-t border-gray-100 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wider text-xs">Recent History</h3>
                  <button
                    onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                    className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-ocean-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
                  >
                    {sortOrder === 'newest' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                    {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                  </button>
                </div>

                {sortedAnnouncements.length > 0 ? (
                  <div className="space-y-6">
                    {sortedAnnouncements.map((ann) => (
                      <div key={ann.id} className={`p-6 rounded-3xl border transition-all ${ann.isImportant ? 'bg-red-50/30 border-red-100' : 'bg-white border-gray-100 hover:shadow-md'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${ann.isImportant ? 'bg-red-500 animate-pulse' : 'bg-ocean-500'}`}></div>
                            <h4 className="font-bold text-lg text-slate-900 leading-snug">
                              {ann.title}
                            </h4>
                            {ann.isImportant && (
                              <span className="bg-red-100 text-red-600 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-red-200 tracking-wide">
                                Urgent
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 items-center">
                            <span className="text-xs font-bold text-gray-400 bg-white border border-gray-100 px-3 py-1.5 rounded-lg shadow-sm">
                              {ann.date}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditClick(ann)}
                                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-ocean-600 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(ann.id === showDeleteConfirm ? null : ann.id)}
                                className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {showDeleteConfirm === ann.id && (
                          <div className="bg-red-50 p-3 rounded-xl flex items-center justify-between mb-4 animate-in fade-in zoom-in duration-200 border border-red-100">
                            <span className="text-xs text-red-700 font-bold">Delete this post?</span>
                            <div className="flex gap-2">
                              <button onClick={() => setShowDeleteConfirm(null)} className="text-xs font-bold text-gray-500 hover:underline">Cancel</button>
                              <button onClick={() => handleDeleteAnnouncement(ann.id)} className="text-xs font-bold text-red-600 bg-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow">Confirm</button>
                            </div>
                          </div>
                        )}

                        <div className="pl-6 border-l-2 border-gray-200 ml-1.5 mb-5">
                          <div className="text-gray-700 text-base leading-relaxed">
                            <MarkdownText text={ann.message} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pl-6 ml-1.5 pt-4 border-t border-dashed border-gray-200">
                          <div className="flex items-center gap-6 text-gray-500 font-bold">
                            <span className="flex items-center gap-2 text-ocean-700 bg-ocean-50 px-3 py-1.5 rounded-lg">
                              <User className="w-3.5 h-3.5" />
                              <span className="uppercase tracking-wide">{ann.authorName || ann.author || 'Admin'}</span>
                            </span>
                            <span className="flex items-center gap-2 font-medium bg-gray-50 px-3 py-1.5 rounded-lg"><Clock className="w-3.5 h-3.5" /> {ann.time}</span>
                          </div>
                          {ann.tags && (
                            <div className="flex gap-2">
                              {ann.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-0.5 text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold uppercase tracking-wide">
                                  <Hash className="w-3 h-3" /> {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <MessageCircle className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-medium">No announcements yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TIMETABLE TAB */}
          {activeTab === 'TIMETABLE' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-extrabold text-slate-900">Weekly Schedule</h2>
                <Button size="sm" variant="outline" className="text-xs" onClick={openAddClassModal}>
                  <Plus className="w-3 h-3 mr-1" /> Add Class
                </Button>
              </div>

              <div className="relative before:absolute before:left-[35px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-100 space-y-8 pl-4">
                {timetable.map((item, idx) => (
                  <div key={item.id} className="relative pl-16 group">
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-0 w-[70px] h-[70px] rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center text-[10px] font-bold z-10 group-hover:border-ocean-300 group-hover:shadow-md transition-all">
                      <span className="text-gray-400 uppercase tracking-tighter text-[9px]">Class</span>
                      <span className="text-2xl font-black text-slate-900">{idx + 1}</span>
                    </div>

                    {/* Content Card */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group-hover:-translate-y-1 relative">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <h3 className="font-extrabold text-xl text-slate-900 mb-1">{item.subject}</h3>
                          <p className="text-sm text-gray-500 font-medium">{item.topic}</p>
                        </div>
                        <div className="inline-flex items-center text-xs font-bold text-ocean-700 bg-ocean-50 px-4 py-2 rounded-xl border border-ocean-100 whitespace-nowrap">
                          <Clock className="w-4 h-4 mr-2" /> {item.time}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shadow-inner">
                            {item.faculty.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Faculty</span>
                            <span className="text-sm font-bold text-slate-800">{item.faculty}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditClassModal(item)}
                            className="p-2 text-gray-400 hover:text-ocean-600 hover:bg-ocean-50 rounded-xl transition-colors"
                            title="Edit Class"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClass(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete Class"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Edit Announcement Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Announcement"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={editingAnnouncement?.title || ''}
              onChange={(e) => setEditingAnnouncement(prev => prev ? { ...prev, title: e.target.value } : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-ocean-500 outline-none text-slate-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
            <textarea
              value={editingAnnouncement?.message || ''}
              onChange={(e) => setEditingAnnouncement(prev => prev ? { ...prev, message: e.target.value } : null)}
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-ocean-500 outline-none text-slate-900 resize-none bg-white font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Supports basic markdown (**bold**, *italic*)</p>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Timetable Modal */}
      <Modal
        isOpen={showTimetableModal}
        onClose={() => setShowTimetableModal(false)}
        title={isEditingClass ? "Edit Class Schedule" : "Add New Class"}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowTimetableModal(false)}>Cancel</Button>
            <Button onClick={handleSaveClass}>
              {isEditingClass ? 'Update Class' : 'Add Class'}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <ModernDatePicker
            label="Date"
            value={classForm.date}
            onChange={(date) => setClassForm({ ...classForm, date })}
          />

          <div className="grid grid-cols-2 gap-4">
            <ModernTimePicker
              label="Start Time"
              value={classForm.startTime}
              onChange={(time) => setClassForm({ ...classForm, startTime: time })}
            />
            <ModernTimePicker
              label="End Time"
              value={classForm.endTime}
              onChange={(time) => setClassForm({ ...classForm, endTime: time })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
              <select
                value={classForm.subject}
                onChange={(e) => setClassForm({ ...classForm, subject: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-ocean-500 bg-white text-slate-900"
              >
                <option value="">Select Subject</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Faculty</label>
              {teachers.length > 0 ? (
                <select
                  value={classForm.faculty}
                  onChange={(e) => setClassForm({ ...classForm, faculty: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-ocean-500 bg-white text-slate-900"
                >
                  <option value="">Select Faculty</option>
                  {teachers.map(t => (
                    <option key={t.id} value={`${t.firstName || t.first_name || ''} ${t.lastName || t.last_name || ''}`.trim()}>
                      {`${t.firstName || t.first_name || ''} ${t.lastName || t.last_name || ''}`.trim()}
                    </option>
                  ))}
                  <option value="Guest Faculty">Guest Faculty</option>
                </select>
              ) : (
                <input
                  value={classForm.faculty}
                  onChange={(e) => setClassForm({ ...classForm, faculty: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-ocean-500 bg-white text-slate-900"
                  placeholder="Enter Faculty Name"
                />
              )}
            </div>
          </div >

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Topic</label>
            <input
              type="text"
              value={classForm.topic}
              onChange={(e) => setClassForm({ ...classForm, topic: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-ocean-500 text-slate-900 bg-white"
              placeholder="e.g. Thermodynamics - Lecture 1"
            />
          </div>
        </div >
      </Modal >

    </div >
  );
};

export default TeacherBatchDetail;
