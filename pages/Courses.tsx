
import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import { Settings, Plus, Loader2, Save, Trash2, X } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';

const Courses: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { showToast } = useToast();

  // Data States
  const [activeTab, setActiveTab] = useState<string>('JEE');
  const [streams, setStreams] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pageContent, setPageContent] = useState({
    title: 'Choose your \n path to success',
    description: 'Expert-led courses designed to help you ace your competitive exams and build a bright future in science and medicine.'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Admin Modes
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Modals
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showAddStreamModal, setShowAddStreamModal] = useState(false);
  const [deleteStreamConfirm, setDeleteStreamConfirm] = useState<{ isOpen: boolean, name: string }>({ isOpen: false, name: '' });

  // Input States
  const [newCourseName, setNewCourseName] = useState('');
  const [newStreamName, setNewStreamName] = useState('');
  const [editedPageContent, setEditedPageContent] = useState({
    title: 'Choose your \n path to success',
    description: 'Expert-led courses designed to help you ace your competitive exams and build a bright future in science and medicine.'
  });

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [coursesData, streamsRes] = await Promise.all([
          api.courses.list(),
          api.streams.list()
        ]);

        const streamNames = streamsRes.streams.map(s => s.title || (s as any).name || '');
        setCourses(coursesData);
        setStreams(streamNames);

        // Ensure active tab exists
        if (streamNames.length > 0 && !streamNames.includes(activeTab)) {
          setActiveTab(streamNames[0]);
        }
      } catch (e) {
        console.error("Failed to fetch courses/streams", e);
        // Fallback for UI if API fails
        setStreams(['JEE', 'NEET', 'Foundation']);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Save Page Content
  const handleSaveContent = async () => {
    // pageContent is currently local only, showing feedback to user
    setPageContent(editedPageContent);
    showToast("Local page content updated (not persisted to DB)", "info");
  };

  // Add Stream
  const handleAddStream = async () => {
    if (!newStreamName.trim()) return;
    try {
      await api.streams.add(newStreamName.trim());
      setStreams([...streams, newStreamName.trim()]);
      setActiveTab(newStreamName.trim());
      setShowAddStreamModal(false);
      setNewStreamName('');
      showToast("New stream added", "success");
    } catch (e) {
      showToast("Failed to add stream", "error");
    }
  };

  // Delete Stream
  const handleDeleteStream = async () => {
    const streamName = deleteStreamConfirm.name;
    try {
      await api.streams.delete(streamName);
      const newStreams = streams.filter(s => s !== streamName);
      setStreams(newStreams);
      if (activeTab === streamName && newStreams.length > 0) {
        setActiveTab(newStreams[0]);
      }
      setDeleteStreamConfirm({ ...deleteStreamConfirm, isOpen: false });
      showToast("Stream deleted", "success");
    } catch (e) {
      showToast("Failed to delete stream", "error");
    }
  };

  const handleUpdateCourse = async (updatedCourse: Course) => {
    try {
      const payload = {
        ...updatedCourse,
        stream_name: updatedCourse.category,
        stream_id: updatedCourse.category // assuming category maps to stream
      };
      await api.courses.update(payload);
      setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
      showToast("Course updated successfully", "success");
    } catch (e) {
      showToast("Failed to update course", "error");
    }
  };

  const handleAddCourse = async () => {
    if (!newCourseName) return;
    try {
      const payload: any = {
        title: newCourseName,
        sub_title: 'New Batch',
        stream_name: activeTab,
        description: 'For Class 11th/12th Students',
        target_year: new Date().getFullYear().toString(),
        duration: '1 Year',
        price: '₹ 50,000',
        features: ['Live Classes', 'Doubt Solving', 'Study Material'],
        color_theme: 'blue'
      };
      const created = await api.courses.create(payload);

      // Normalize for frontend
      const normalized = {
        ...created,
        category: created.stream_name || created.stream_id || activeTab,
        features: created.features || []
      };

      setCourses([...courses, normalized]);
      setShowAddBatchModal(false);
      setNewCourseName('');
      showToast("New Course Created", "success");
    } catch (e) {
      showToast("Failed to create course", "error");
    }
  };

  const filteredCourses = courses.filter(course => course.category === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Admin Toggle - Sticky/Floating for visibility */}
        {isAdmin && (
          <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-right duration-500">
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`flex items-center gap-2 px-4 py-3 rounded-full font-bold text-sm shadow-xl transition-all border border-white/20 backdrop-blur-md ${isAdminMode
                ? 'bg-ocean-600 text-white ring-4 ring-ocean-100'
                : 'bg-white/90 text-gray-600 hover:bg-white'
                }`}
            >
              <Settings className={`w-4 h-4 ${isAdminMode ? 'animate-spin-slow' : ''}`} />
              {isAdminMode ? 'Exit Edit Mode' : 'Edit Page'}
            </button>
          </div>
        )}

        {/* Header Content */}
        <div className="flex flex-col mb-12">
          <div className="text-center pt-8">
            {isAdminMode ? (
              <div className="max-w-3xl mx-auto space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-dashed border-ocean-300">
                <p className="text-xs font-bold text-ocean-600 uppercase tracking-widest">Header Editing</p>
                <input
                  value={editedPageContent.title}
                  onChange={(e) => setEditedPageContent({ ...editedPageContent, title: e.target.value })}
                  className="w-full text-center text-3xl font-extrabold text-gray-900 border-b border-gray-300 focus:border-ocean-500 outline-none p-2"
                  placeholder="Page Title"
                />
                <textarea
                  value={editedPageContent.description}
                  onChange={(e) => setEditedPageContent({ ...editedPageContent, description: e.target.value })}
                  className="w-full text-center text-xl text-gray-600 font-medium border-b border-gray-300 focus:border-ocean-500 outline-none p-2 resize-none"
                  placeholder="Page Description"
                  rows={2}
                />
                <div className="flex justify-center pt-2">
                  <Button size="sm" onClick={handleSaveContent} className="flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Header
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 whitespace-pre-line">
                  {pageContent.title}
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
                  {pageContent.description}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Tabs / Streams */}
        <div className="flex flex-col items-center mb-12 gap-4">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200 inline-flex flex-wrap justify-center gap-1">
            {streams.map((stream) => (
              <div key={stream} className="relative group">
                <button
                  onClick={() => setActiveTab(stream)}
                  className={`px-8 py-3 rounded-xl text-base font-bold transition-all duration-200 ${activeTab === stream
                    ? 'bg-ocean-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {stream}
                </button>
                {isAdminMode && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteStreamConfirm({ isOpen: true, name: stream }); }}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                    title="Delete Stream"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {isAdminMode && (
              <button
                onClick={() => setShowAddStreamModal(true)}
                className="px-4 py-3 rounded-xl text-base font-bold text-ocean-600 hover:bg-ocean-50 border border-dashed border-ocean-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> New Stream
              </button>
            )}
          </div>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-ocean-600" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div key={course.id} className="h-[420px]">
                <CourseCard
                  course={course}
                  isEditable={isAdminMode}
                  onSave={handleUpdateCourse}
                />
              </div>
            ))}

            {/* Add New Course Card */}
            {isAdminMode && (
              <div
                onClick={() => setShowAddBatchModal(true)}
                className="h-[420px] rounded-[2.5rem] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:shadow-lg transition-all group bg-gray-50/50"
              >
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:bg-ocean-100 group-hover:text-ocean-600 transition-colors mb-4 shadow-sm">
                  <Plus className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-500 group-hover:text-ocean-700">Add New Batch</h3>
                <p className="text-sm text-gray-400 mt-2 font-medium">Click to create</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Batch Modal */}
      <Modal
        isOpen={showAddBatchModal}
        onClose={() => setShowAddBatchModal(false)}
        title={`Add New ${activeTab} Batch`}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAddBatchModal(false)}>Cancel</Button>
            <Button onClick={handleAddCourse}>Create</Button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Batch Name</label>
          <input
            type="text"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-ocean-500 text-slate-900 bg-white"
            placeholder="e.g. Winner Batch"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-2">A new batch page with default content will be created.</p>
        </div>
      </Modal>

      {/* Add Stream Modal */}
      <Modal
        isOpen={showAddStreamModal}
        onClose={() => setShowAddStreamModal(false)}
        title="Add New Stream"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAddStreamModal(false)}>Cancel</Button>
            <Button onClick={handleAddStream}>Add Stream</Button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Stream Name</label>
          <input
            type="text"
            value={newStreamName}
            onChange={(e) => setNewStreamName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-ocean-500 text-slate-900 bg-white"
            placeholder="e.g. Commerce, UPSC, etc."
            autoFocus
          />
        </div>
      </Modal>

      {/* Delete Stream Confirmation */}
      <ConfirmationModal
        isOpen={deleteStreamConfirm.isOpen}
        onClose={() => setDeleteStreamConfirm({ ...deleteStreamConfirm, isOpen: false })}
        onConfirm={handleDeleteStream}
        title="Delete Stream"
        message={`Are you sure you want to delete the stream "${deleteStreamConfirm.name}"? This might hide associated batches.`}
        isDanger={true}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default Courses;
