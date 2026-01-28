
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { COURSES, LIBRARY_CHAPTERS, LIBRARY_RESOURCES } from '../../../constants';
import { ArrowLeft, Book, ChevronRight, Filter, Eye, Trash2, Edit2, UploadCloud, Loader2, Plus, Folder, FileText, Zap, Brain, ArrowDown, ArrowUp } from 'lucide-react';
import { ResourceType, LibraryResource, LibraryChapter, Subject } from '../../../types';
import Button from '../../../components/Button';
import PDFViewer from '../../../components/PDFViewer';
import Modal from '../../../components/Modal';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { api } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { useViewStatus } from '../../../hooks/useViewStatus';

const TeacherBatchLibrary: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const { user } = useAuth();

  // Handle 'freebies' virtual course or find existing course
  const course = batchId === 'freebies'
    ? { id: 'freebies', title: 'Free Resources', colorTheme: 'blue' }
    : COURSES.find(c => c.id === batchId);

  // State
  const [subjects, setSubjects] = useState<{ id: string, name: string }[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<ResourceType | 'ALL'>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Data State
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [chapters, setChapters] = useState<LibraryChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [pdfViewerState, setPdfViewerState] = useState<{ isOpen: boolean; url: string; title: string }>({ isOpen: false, url: '', title: '' });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; type: 'RESOURCE' | 'CHAPTER'; id: string; title: string }>({ isOpen: false, type: 'RESOURCE', id: '', title: '' });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [newFile, setNewFile] = useState({ title: '', type: 'NOTES' as ResourceType, file: null as File | null });
  const [editingResource, setEditingResource] = useState<{ id: string, title: string } | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  const { isResourceUnread, isChapterUnread, markResourceAsRead, markChapterAsRead } = useViewStatus();

  // Fetch subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!batchId) return;
      if (batchId === 'freebies') {
        setSubjects([{ id: 'physics', name: 'Physics' }, { id: 'chemistry', name: 'Chemistry' }, { id: 'mathematics', name: 'Mathematics' }]);
        setActiveSubjectId('physics');
        return;
      }
      try {
        const subs = await api.subjects.list(batchId);
        if (subs && subs.length > 0) {
          setSubjects(subs);
          setActiveSubjectId(subs[0].id);
        } else {
          // Fallback/Mock
          setSubjects([{ id: 'physics', name: 'Physics' }, { id: 'chemistry', name: 'Chemistry' }, { id: 'mathematics', name: 'Mathematics' }]);
          setActiveSubjectId('physics');
        }
      } catch (e) {
        setSubjects([{ id: 'physics', name: 'Physics' }, { id: 'chemistry', name: 'Chemistry' }, { id: 'mathematics', name: 'Mathematics' }]);
        setActiveSubjectId('physics');
      }
    };
    fetchSubjects();
  }, [batchId]);

  // Fetch chapters and resources when subject changes
  useEffect(() => {
    const fetchChaptersAndResources = async () => {
      if (!batchId || !activeSubjectId) return;
      setIsLoading(true);
      try {
        const [chapterData, resourceData] = await Promise.all([
          api.chapters.list(batchId, activeSubjectId),
          api.resources.list(batchId, activeSubjectId)
        ]);
        setChapters(chapterData || []);
        setResources(resourceData || []);
        setActiveChapterId(chapterData?.length > 0 ? chapterData[0].id : null);
      } catch (e) {
        console.error("Failed to fetch chapters/resources", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChaptersAndResources();
  }, [batchId, activeSubjectId]);

  if (!course) return <div>Batch not found</div>;

  let filteredResources = resources.filter(res => {
    const resChapterId = res.chapterId || res.chapter_id;
    if (resChapterId !== activeChapterId) return false;
    if (filterType !== 'ALL' && res.type.toUpperCase() !== filterType.toUpperCase()) return false;
    return true;
  });

  // Sorting
  filteredResources = filteredResources.sort((a, b) => {
    const dateA = new Date(a.uploadDate || a.created_at || 0);
    const dateB = new Date(b.uploadDate || b.created_at || 0);
    return sortOrder === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

  // --- LOGIC FOR "NEW" INDICATORS (BUBBLING) ---
  const hasNewInSubject = (subjectId: string) => {
    return chapters.some(c => isChapterUnread(c, resources));
  };

  // --- ACTIONS ---

  const handleChapterClick = (chapterId: string) => {
    setActiveChapterId(chapterId);
    markChapterAsRead(chapterId);
  };

  const handleResourceClick = (res: LibraryResource) => {
    markResourceAsRead(res.id);
    setPdfViewerState({
      isOpen: true,
      url: res.url,
      title: res.title
    });
  };

  const getResourceTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'NOTES': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'DPP': return <Zap className="w-5 h-5 text-purple-600" />;
      case 'MINDMAP': return <Brain className="w-5 h-5 text-orange-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getResourceTypeName = (type: ResourceType) => {
    switch (type) {
      case 'NOTES': return 'Notes';
      case 'DPP': return 'Daily Practice';
      case 'MINDMAP': return 'Mind Map';
      default: return type;
    }
  };

  // --- CRUD Handlers ---

  const handleDeleteResource = async () => {
    const id = deleteConfirmation.id;
    try {
      await api.resources.delete(id);
      setResources(resources.filter(r => r.id !== id));
      setDeleteConfirmation({ ...deleteConfirmation, isOpen: false });
      showToast("Resource deleted successfully", "success");
    } catch (e) {
      showToast("Failed to delete resource", "error");
    }
  };

  const handleDeleteChapter = async () => {
    const id = deleteConfirmation.id;
    try {
      await api.chapters.delete(id);
      setChapters(chapters.filter(c => c.id !== id));
      if (activeChapterId === id) setActiveChapterId(null);
      setDeleteConfirmation({ ...deleteConfirmation, isOpen: false });
      showToast("Chapter deleted successfully", "success");
    } catch (e) {
      showToast("Failed to delete chapter", "error");
    }
  };

  const confirmDelete = (e: React.MouseEvent, type: 'RESOURCE' | 'CHAPTER', id: string, title: string) => {
    e.stopPropagation();
    setDeleteConfirmation({ isOpen: true, type, id, title });
  };

  const handleEditClick = (e: React.MouseEvent, res: LibraryResource) => {
    e.stopPropagation();
    setEditingResource({ id: res.id, title: res.title });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editingResource) return;
    setIsSubmitting(true);
    try {
      await api.resources.update(editingResource.id, { title: editingResource.title });
      setResources(resources.map(r => r.id === editingResource.id ? { ...r, title: editingResource.title } : r));
      setShowEditModal(false);
      showToast("Resource updated", "success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewFile({ ...newFile, file: e.target.files[0] });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChapterId || !batchId || !activeSubjectId) {
      showToast("Selection error: Missing context", "error");
      return;
    }

    if (!newFile.file || !newFile.title) {
      showToast("Title and file are required", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('pdf', newFile.file);
      formData.append('batch_id', batchId);
      formData.append('subject_id', activeSubjectId);
      formData.append('chapter_id', activeChapterId);
      formData.append('title', newFile.title);
      formData.append('type', newFile.type);

      // Consolidate into a single upload call
      // The backend should create the resource record and return it
      const created = await api.resources.upload(formData);

      // Normalize fields if backend returns snake_case
      const normalizedResource = {
        ...created,
        id: created.id || created._id,
        isNew: true, // Mark as new locally
        uploadDate: new Date().toLocaleDateString()
      };

      setResources(prev => [normalizedResource, ...prev]);
      setShowUploadModal(false);
      setNewFile({ title: '', type: 'NOTES', file: null });
      showToast("File uploaded successfully", "success");
    } catch (err: any) {
      console.error("Upload failed:", err);
      showToast(err.message || "Failed to upload file", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim() || !batchId || !activeSubjectId) return;
    setIsSubmitting(true);
    try {
      const nextNum = chapters.length + 1;
      const created = await api.chapters.create({
        batch_id: batchId,
        subject_id: activeSubjectId,
        title: newChapterTitle,
        chapter_number: nextNum,
        isNew: true
      });
      setChapters([...chapters, created]);
      setActiveChapterId(created.id);
      setShowAddChapterModal(false);
      setNewChapterTitle('');
      showToast("Chapter added successfully", "success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const backLink = batchId === 'freebies' ? '/dashboard' : `/dashboard/teacher/batch/${batchId}`;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

      {/* 1. Header Bar */}
      <div className="bg-white border-b border-gray-100 p-4 px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(backLink)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              {course.title}
            </h1>
            <p className="text-xs font-medium text-gray-400">Library Manager</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 hidden md:inline-block">Type:</span>
          <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
            {['ALL', 'NOTES', 'DPP', 'MINDMAP'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t as any)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${filterType === t
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">

        {/* 2. Sidebar (Subject + Chapters) */}
        <div className="w-80 bg-slate-50 border-r border-gray-200 flex flex-col shrink-0">
          {/* Subject Tabs */}
          <div className="flex p-2 gap-1 border-b border-gray-200 bg-white">
            {subjects.map(sub => {
              const hasNew = hasNewInSubject(sub.id);
              return (
                <button
                  key={sub.id}
                  onClick={() => { setActiveSubjectId(sub.id); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all relative ${activeSubjectId === sub.id
                    ? 'bg-slate-900 text-white shadow'
                    : 'text-gray-500 hover:bg-gray-100'
                    }`}
                >
                  {sub.name.slice(0, 4)}
                  {hasNew && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white shadow-sm"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Chapter List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            <div className="px-2 py-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Chapters</div>
            {isLoading ? (
              <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-ocean-600" /></div>
            ) : chapters.length > 0 ? (
              chapters.map(chapter => {
                const hasNew = isChapterUnread(chapter, resources);
                return (
                  <div key={chapter.id} className="group/item relative">
                    <button
                      onClick={() => handleChapterClick(chapter.id)}
                      className={`w-full text-left px-3 py-3 rounded-xl text-sm font-bold flex items-center justify-between transition-all border relative ${activeChapterId === chapter.id
                        ? 'bg-white shadow-sm text-ocean-700 border-ocean-100'
                        : 'text-gray-500 border-transparent hover:bg-white hover:border-gray-200'
                        }`}
                    >
                      <span className="flex items-center gap-2 truncate pr-6">
                        <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${activeChapterId === chapter.id ? 'bg-ocean-100 text-ocean-700' : 'bg-gray-200 text-gray-500'}`}>
                          {chapter.chapterNumber || chapter.chapter_number}
                        </span>
                        <span className="truncate">{chapter.title}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        {hasNew && (
                          <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] animate-pulse"></span>
                        )}
                        {activeChapterId === chapter.id && <ChevronRight className="w-3 h-3" />}
                      </div>
                    </button>
                    <button
                      onClick={(e) => confirmDelete(e, 'CHAPTER', chapter.id, chapter.title)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover/item:opacity-100 z-10 bg-white shadow-sm border border-gray-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center text-xs text-gray-400">No chapters found</div>
            )}
          </div>

          {/* Add Chapter Button */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <button
              onClick={() => setShowAddChapterModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-ocean-300 hover:text-ocean-600 hover:bg-ocean-50 transition-all font-bold text-sm"
            >
              <Plus className="w-4 h-4" /> Add New Chapter
            </button>
          </div>
        </div>

        {/* 3. Main Area (File List) */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">

          {/* Toolbar */}
          <div className="h-16 border-b border-gray-50 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-ocean-300" />
              <h2 className="text-lg font-bold text-slate-800">
                {chapters.find(c => c.id === activeChapterId)?.title || "Select a Chapter"}
              </h2>
              <span className="text-xs font-medium text-gray-400 ml-2 bg-gray-50 px-2 py-1 rounded-full">
                {filteredResources.length} Files
              </span>
            </div>

            <div className="flex gap-4">
              {/* Sort Button */}
              <button
                onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-ocean-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200"
              >
                {sortOrder === 'newest' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
              </button>

              <Button
                onClick={() => setShowUploadModal(true)}
                disabled={!activeChapterId}
                className="flex items-center gap-2 shadow-lg shadow-ocean-100"
              >
                <UploadCloud className="w-4 h-4" /> Upload
              </Button>
            </div>
          </div>

          {/* List View */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/30 custom-scrollbar">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : filteredResources.length > 0 ? (
              <div className="flex flex-col gap-3">
                {filteredResources.map(res => {
                  const isNew = isResourceUnread(res);
                  return (
                    <div
                      key={res.id}
                      onClick={() => handleResourceClick(res)}
                      className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 hover:border-ocean-300 hover:shadow-md transition-all group relative cursor-pointer overflow-hidden"
                    >
                      {/* Icon Box */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${res.type === 'NOTES' ? 'bg-blue-50 text-blue-600' :
                        res.type === 'DPP' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                        {getResourceTypeIcon(res.type)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 truncate group-hover:text-ocean-700 transition-colors">{res.title}</h3>
                          {isNew && (
                            <span className="bg-red-500 text-white text-[9px] font-black px-1.5 rounded animate-pulse shadow-sm">NEW</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-2">
                          <span>{res.uploadDate}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="uppercase">{getResourceTypeName(res.type)}</span>
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleResourceClick(res); }}
                          className="px-3 py-2 rounded-lg bg-ocean-50 text-ocean-600 font-bold text-xs hover:bg-ocean-100 flex items-center gap-2"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={(e) => handleEditClick(e, res)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => confirmDelete(e, 'RESOURCE', res.id, res.title)}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Folder className="w-10 h-10 text-gray-200" />
                </div>
                <p className="font-bold text-gray-400">This folder is empty</p>
                <p className="text-sm">Upload files to get started</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* PDF Viewer Modal */}
      {pdfViewerState.isOpen && (
        <PDFViewer
          url={pdfViewerState.url}
          title={pdfViewerState.title}
          onClose={() => setPdfViewerState({ ...pdfViewerState, isOpen: false })}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })}
        onConfirm={() => {
          if (deleteConfirmation.type === 'RESOURCE') handleDeleteResource();
          else handleDeleteChapter();
        }}
        title={`Delete ${deleteConfirmation.type === 'RESOURCE' ? 'Resource' : 'Chapter'}`}
        message={`Are you sure you want to delete "${deleteConfirmation.title}"? This action cannot be undone.`}
        isDanger={true}
        confirmLabel="Delete"
      />

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Resource"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleUpload} disabled={isSubmitting || !newFile.file || !newFile.title}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={newFile.title}
              onChange={(e) => setNewFile({ ...newFile, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-ocean-500 outline-none text-slate-900 bg-white"
              placeholder="e.g., Chapter 1 Notes"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['NOTES', 'DPP', 'MINDMAP'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNewFile({ ...newFile, type: t as ResourceType })}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${newFile.type === t
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">File</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${newFile.file ? 'border-ocean-500 bg-ocean-50' : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              <UploadCloud className={`w-8 h-8 mb-2 ${newFile.file ? 'text-ocean-600' : 'text-gray-400'}`} />
              <span className="text-xs text-slate-600 font-medium">
                {newFile.file ? newFile.file.name : "Click to select PDF"}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Resource"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Resource Title</label>
          <input
            type="text"
            value={editingResource?.title || ''}
            onChange={(e) => setEditingResource(prev => prev ? { ...prev, title: e.target.value } : null)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-ocean-500 outline-none text-slate-900 bg-white"
          />
        </div>
      </Modal>

      {/* Add Chapter Modal */}
      <Modal
        isOpen={showAddChapterModal}
        onClose={() => setShowAddChapterModal(false)}
        title={`Add ${subjects.find(s => s.id === activeSubjectId)?.name || ''} Chapter`}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowAddChapterModal(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleAddChapter} disabled={isSubmitting || !newChapterTitle}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Chapter'}
            </Button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Chapter Title</label>
          <input
            type="text"
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            placeholder="e.g. Thermodynamics"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-ocean-500 outline-none text-slate-900 bg-white"
          />
        </div>
      </Modal>
    </div>
  );
};

export default TeacherBatchLibrary;
