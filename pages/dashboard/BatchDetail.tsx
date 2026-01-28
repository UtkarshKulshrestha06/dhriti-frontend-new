
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BATCH_TIMETABLE } from '../../constants';
import { api } from '../../services/api';
import { Course, BatchAnnouncement, TimetableItem } from '../../types';
import { ArrowLeft, Bell, Calendar, BookOpen, Clock, AlertCircle, User, MessageCircle, Loader2, ChevronRight, Hash, ArrowDown, ArrowUp } from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import MarkdownText from '../../components/MarkdownText';

const BatchDetail: React.FC = () => {
    const { batchId } = useParams<{ batchId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [course, setCourse] = useState<Course | null>(null);
    const [announcements, setAnnouncements] = useState<BatchAnnouncement[]>([]);
    const [timetable, setTimetable] = useState<TimetableItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ANNOUNCEMENTS' | 'TIMETABLE'>('ANNOUNCEMENTS');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    useEffect(() => {
        const fetchData = async () => {
            if (!batchId) return;
            try {
                const [courseData, annData, timetableData] = await Promise.all([
                    api.courses.get(batchId),
                    api.announcements.list(batchId),
                    api.timetable.get(batchId)
                ]);
                setCourse(courseData || null);
                // Normalize announcements
                const normalizedAnn = (annData || []).map((a: any) => ({
                    ...a,
                    batchId: a.batch_id || a.batchId,
                    isImportant: a.is_important || a.isImportant,
                    date: a.date || (a.created_at ? new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''),
                    time: a.time || (a.created_at ? new Date(a.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''),
                    author: a.author || 'Admin'
                }));
                setAnnouncements(normalizedAnn);
                setTimetable(timetableData || BATCH_TIMETABLE);
            } catch (e) {
                console.error("Fetch error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [batchId]);

    const showTimetable = timetable.length > 0;
    const isTeacher = user?.role === 'TEACHER';

    // Sort Announcements
    const sortedAnnouncements = [...announcements].sort((a, b) => {
        const dateA = new Date(a.date || a.created_at || 0);
        const dateB = new Date(b.date || b.created_at || 0);
        if (dateA.getTime() === dateB.getTime()) return 0;
        return sortOrder === 'newest'
            ? dateB.getTime() - dateA.getTime()
            : dateA.getTime() - dateB.getTime();
    });

    // Handle redirect in useEffect
    useEffect(() => {
        if (isTeacher && batchId) {
            navigate(`/dashboard/teacher/batch/${batchId}`, { replace: true });
        }
    }, [isTeacher, batchId, navigate]);

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-ocean-600" /></div>;
    if (!course) return <div className="p-10 text-center">Batch not found</div>;

    if (isTeacher) return null;

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

            {/* 1. Header Bar */}
            <div className="bg-white border-b border-gray-100 p-6 flex items-center justify-between shrink-0 z-20 shadow-sm relative">
                <div className="flex items-center gap-6 relative z-10">
                    <button onClick={() => navigate('/dashboard')} className="p-3 hover:bg-slate-50 rounded-full transition-colors border border-gray-200">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                            {course.title}
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-md shadow-red-200">LIVE</span>
                        </h1>
                        <p className="text-sm font-medium text-gray-500 mt-1">{course.subTitle} • Target {course.targetYear}</p>
                    </div>
                </div>

                <Link to={`/dashboard/batch/${batchId}/library`}>
                    <Button className="flex items-center gap-2 shadow-xl shadow-ocean-200 px-6 py-3 text-sm rounded-xl hover:scale-105 transition-transform bg-gradient-to-r from-ocean-600 to-ocean-500 border-none">
                        <BookOpen className="w-5 h-5" /> Open Library
                    </Button>
                </Link>
            </div>

            <div className="flex-1 flex overflow-hidden">

                {/* 2. Sidebar Navigation */}
                <div className="w-80 bg-slate-50 border-r border-gray-200 flex flex-col shrink-0 p-4 gap-2">
                    <div className="px-4 py-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Dashboard Menu</div>

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

                    <Link to={`/dashboard/batch/${batchId}/library`}>
                        <button className="w-full text-left px-5 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 text-gray-500 hover:bg-white hover:shadow-sm hover:text-slate-700 transition-all border border-transparent hover:border-gray-100">
                            <BookOpen className="w-5 h-5" /> Library
                        </button>
                    </Link>
                </div>

                {/* 3. Main Content Area */}
                <div className="flex-1 bg-white overflow-y-auto custom-scrollbar p-6 lg:p-10">

                    {/* ANNOUNCEMENTS VIEW */}
                    {activeTab === 'ANNOUNCEMENTS' && (
                        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-extrabold text-slate-900">Announcements</h2>

                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{sortedAnnouncements.length} Posts</span>

                                    <button
                                        onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                                        className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-ocean-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
                                    >
                                        {sortOrder === 'newest' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                                        {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                                    </button>
                                </div>
                            </div>

                            {sortedAnnouncements.length > 0 ? (
                                <div className="space-y-6">
                                    {sortedAnnouncements.map((ann) => (
                                        <div key={ann.id} className={`p-6 rounded-3xl border transition-all ${ann.isImportant ? 'bg-red-50/40 border-red-100 shadow-sm' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full shadow-sm ${ann.isImportant ? 'bg-red-500 animate-pulse' : 'bg-ocean-500'}`}></div>
                                                    <h4 className={`font-bold text-xl ${ann.isImportant ? 'text-red-900' : 'text-slate-900'}`}>
                                                        {ann.title}
                                                    </h4>
                                                    {ann.isImportant && (
                                                        <span className="bg-red-100 text-red-600 text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 border border-red-200">
                                                            <AlertCircle className="w-3 h-3" /> Urgent
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-gray-400 bg-white border border-gray-100 px-3 py-1.5 rounded-lg shadow-sm">
                                                    {ann.date}
                                                </span>
                                            </div>

                                            <div className="pl-6 border-l-2 border-gray-200 ml-1.5 mb-5">
                                                <div className="text-gray-700 text-base leading-relaxed">
                                                    <MarkdownText text={ann.message} />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-xs pl-6 ml-1.5 pt-4 border-t border-dashed border-gray-200">
                                                <div className="flex items-center gap-6 text-gray-500 font-bold">
                                                    <span className="flex items-center gap-2 text-ocean-700 bg-ocean-50 px-3 py-1.5 rounded-lg">
                                                        <User className="w-3.5 h-3.5" />
                                                        <span className="uppercase tracking-wide">{ann.author}</span>
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
                                <div className="flex flex-col items-center justify-center h-80 text-gray-400 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                        <MessageCircle className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="font-bold text-lg">No new announcements.</p>
                                    <p className="text-sm">Check back later for updates.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TIMETABLE VIEW */}
                    {activeTab === 'TIMETABLE' && (
                        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-extrabold text-slate-900">Weekly Schedule</h2>
                                <span className="text-xs font-bold text-ocean-600 bg-ocean-50 px-4 py-2 rounded-xl uppercase tracking-widest border border-ocean-100">Live Classes</span>
                            </div>

                            {showTimetable ? (
                                <div className="relative before:absolute before:left-[35px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-100 space-y-8 pl-4">
                                    {timetable.map((item, idx) => (
                                        <div key={item.id} className="relative pl-16 group">
                                            {/* Timeline Dot */}
                                            <div className="absolute left-0 top-0 w-[70px] h-[70px] rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center text-[10px] font-bold z-10 group-hover:border-ocean-300 group-hover:shadow-md transition-all">
                                                <span className="text-gray-400 uppercase tracking-tighter text-[9px]">Class</span>
                                                <span className="text-2xl font-black text-slate-900">{idx + 1}</span>
                                            </div>

                                            {/* Content Card */}
                                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group-hover:-translate-y-1">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                    <div>
                                                        <h3 className="font-extrabold text-xl text-slate-900 mb-1">{item.subject}</h3>
                                                        <p className="text-sm text-gray-500 font-medium">{item.topic}</p>
                                                    </div>
                                                    <div className="inline-flex items-center text-xs font-bold text-ocean-700 bg-ocean-50 px-4 py-2 rounded-xl border border-ocean-100 whitespace-nowrap">
                                                        <Clock className="w-4 h-4 mr-2" /> {item.time || `${item.start_time?.slice(0, 5)} - ${item.end_time?.slice(0, 5)}`}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shadow-inner">
                                                        {item.faculty?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Faculty</span>
                                                        <span className="text-sm font-bold text-slate-800">{item.faculty || 'TBA'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-80 text-gray-400 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                        <Calendar className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="font-bold text-lg">No classes scheduled yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default BatchDetail;
