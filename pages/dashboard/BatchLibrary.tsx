
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { COURSES, LIBRARY_CHAPTERS, LIBRARY_RESOURCES } from '../../constants';
import { api } from '../../services/api';
import { ArrowLeft, Book, ChevronRight, Filter, Eye, FileText, Zap, Brain, Folder, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { ResourceType, LibraryResource, LibraryChapter, Subject } from '../../types';
import PDFViewer from '../../components/PDFViewer';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useViewStatus } from '../../hooks/useViewStatus';

const BatchLibrary: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const course = batchId === 'freebies'
    ? { id: 'freebies', title: 'Free Resources', colorTheme: 'blue' }
    : COURSES.find(c => c.id === batchId);

  // State
  const [subjects, setSubjects] = useState<{ id: string, name: string }[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [chapters, setChapters] = useState<LibraryChapter[]>([]);
  const [allResources, setAllResources] = useState<LibraryResource[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<ResourceType | 'ALL'>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isLoading, setIsLoading] = useState(true);

  // State for PDF Viewer
  const [pdfViewerState, setPdfViewerState] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });

  const { isResourceUnread, isChapterUnread, markResourceAsRead, markChapterAsRead } = useViewStatus();

  // Fetch subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      if (batchId === 'freebies') {
        try {
          // Fetch all freebies to derive subjects
          const allFreebies = await api.freebies.list();
          if (allFreebies && allFreebies.length > 0) {
            const uniqueSubjects = Array.from(new Set(allFreebies.map(f => f.subject || 'General')));
            const subjectList = uniqueSubjects.map(s => ({ id: s.toLowerCase(), name: s }));
            setSubjects(subjectList);
            setActiveSubjectId(subjectList[0].id);
          } else {
            setSubjects([{ id: 'general', name: 'General' }]);
            setActiveSubjectId('general');
          }
        } catch (e) {
          setSubjects([{ id: 'general', name: 'General' }]);
          setActiveSubjectId('general');
        }
        setIsLoading(false);
        return;
      }

      try {
        const subs = await api.subjects.list(batchId!);
        if (subs && subs.length > 0) {
          setSubjects(subs);
          setActiveSubjectId(subs[0].id);
        } else {
          setSubjects([]);
        }
      } catch (e) {
        console.error("Failed to fetch subjects", e);
        setSubjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubjects();
  }, [batchId]);

  // Fetch chapters and resources when subject changes
  useEffect(() => {
    const fetchChaptersAndResources = async () => {
      if (!activeSubjectId) return;
      setIsLoading(true);

      if (batchId === 'freebies') {
        try {
          const allFreebies = await api.freebies.list();
          // Filter by active subject (name matching)
          const currentSubjectName = subjects.find(s => s.id === activeSubjectId)?.name;
          const filtered = allFreebies?.filter(f => (f.subject || 'General') === currentSubjectName) || [];

          setChapters([]); // Freebies might not have chapters, or we can group them if needed
          setAllResources(filtered);
        } catch (e) {
          console.error("Failed to fetch freebies", e);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (!batchId) return;

      try {
        const [chapterData, resourceData] = await Promise.all([
          api.chapters.list(batchId, activeSubjectId),
          api.resources.list(batchId, activeSubjectId)
        ]);
        setChapters(chapterData || []);
        setAllResources(resourceData || []);
        setActiveChapterId(chapterData?.length > 0 ? chapterData[0].id : null);
      } catch (e) {
        console.error("Failed to fetch chapters/resources", e);
        setChapters([]);
        setAllResources([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChaptersAndResources();
  }, [batchId, activeSubjectId, subjects]);

  if (!course) return <div>Batch not found</div>;

  // --- LOGIC FOR "NEW" INDICATORS ---
  const isSubjectUnread = (subjectId: string) => {
    // We check if any of the visible chapters are unread using the hook
    return chapters.some(c => isChapterUnread(c, allResources));
  };

  // --- FILTERING & SORTING ---
  // Filter Resources by Chapter and Type
  let resources = allResources.filter(res => {
    const resChapterId = res.chapterId || res.chapter_id;
    if (activeChapterId !== null && resChapterId !== activeChapterId) return false;
    if (filterType !== 'ALL' && res.type.toUpperCase() !== filterType.toUpperCase()) return false;
    return true;
  });

  // Sort Resources
  resources = resources.sort((a, b) => {
    const dateA = new Date(a.uploadDate || a.created_at || 0);
    const dateB = new Date(b.uploadDate || b.created_at || 0);
    return sortOrder === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

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

  const backLink = batchId === 'freebies' ? '/dashboard' : `/dashboard/batch/${batchId}`;

  return (
    <>
      <div className="h-[calc(100vh-6rem)] flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-4 px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(backLink)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                {course.title}
              </h1>
              <p className="text-xs font-medium text-gray-400">Library</p>
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

          {/* Sidebar: Subjects & Chapters */}
          <div className="w-full md:w-80 border-r border-gray-200 bg-slate-50 flex flex-col shrink-0">

            {/* Subject Tabs */}
            <div className="flex p-2 gap-1 border-b border-gray-200 bg-white">
              {subjects.map(sub => {
                const hasNew = isSubjectUnread(sub.id);
                return (
                  <button
                    key={sub.id}
                    onClick={() => { setActiveSubjectId(sub.id); setActiveChapterId(null); }}
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
                  const hasNew = isChapterUnread(chapter, allResources);
                  return (
                    <button
                      key={chapter.id}
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

                      <div className="flex items-center gap-2 shrink-0">
                        {hasNew && (
                          <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] animate-pulse"></span>
                        )}
                        {activeChapterId === chapter.id && <ChevronRight className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-10 text-center text-xs text-gray-400">No chapters found</div>
              )}
            </div>
          </div>

          {/* Main Content: Resources */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">

            {/* Toolbar */}
            <div className="h-16 border-b border-gray-50 flex items-center justify-between px-8 shrink-0">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-ocean-300" />
                <h2 className="text-lg font-bold text-slate-800">
                  {chapters.find(c => c.id === activeChapterId)?.title || "Select a Chapter"}
                </h2>
                <span className="text-xs font-medium text-gray-400 ml-2 bg-gray-50 px-2 py-1 rounded-full">
                  {resources.length} Files
                </span>
              </div>

              {/* Sort Button */}
              <button
                onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-ocean-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
              >
                {sortOrder === 'newest' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
              </button>
            </div>

            {/* List View */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/30 custom-scrollbar">
              {resources.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {resources.map(res => {
                    const isNew = isResourceUnread(res);
                    return (
                      <div
                        key={res.id}
                        onClick={() => handleResourceClick(res)}
                        className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 hover:border-ocean-300 hover:shadow-md transition-all group cursor-pointer relative overflow-hidden"
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

                        {/* Action */}
                        <button className="px-4 py-2 rounded-lg bg-ocean-50 text-ocean-600 font-bold text-xs group-hover:bg-ocean-100 flex items-center gap-2 transition-colors">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Filter className="w-12 h-12 mb-4 opacity-20" />
                  <p>No resources found for this selection.</p>
                </div>
              )}
            </div>

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
    </>
  );
};

export default BatchLibrary;
