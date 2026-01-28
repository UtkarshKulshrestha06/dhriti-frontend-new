
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Course, User, UserRole, Stream, LibraryResource } from '../../types';
import { ArrowRight, Clock, Loader2, Plus, Edit2, Trash2, Search, UserPlus, Users, Layers, Book, Filter, Briefcase, GraduationCap, Zap, Star, Shield, Mail, Phone, FileText, Upload, X } from 'lucide-react';
import Button from '../../components/Button';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import ManageEnrollmentsModal from '../../components/ManageEnrollmentsModal';
import { useViewStatus } from '../../hooks/useViewStatus';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // States
    const [courses, setCourses] = useState<Course[]>([]);
    const [streams, setStreams] = useState<string[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Admin/Teacher Specific
    const isAdmin = user?.role === 'ADMIN';
    const isTeacher = user?.role === 'TEACHER';
    const [activeTab, setActiveTab] = useState<'BATCHES' | 'USERS' | 'STREAMS' | 'FREEBIES'>('BATCHES');

    // Filters
    const [activeStreamFilter, setActiveStreamFilter] = useState('All');
    const [activeRoleFilter, setActiveRoleFilter] = useState('All');

    // User Management State
    const [userSearch, setUserSearch] = useState('');
    const [showUserModal, setShowUserModal] = useState(false);
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [userForm, setUserForm] = useState({ id: '', firstName: '', lastName: '', email: '', password: '', role: 'STUDENT' as UserRole, phone: '', subject: '' });
    const [deleteUserConfirm, setDeleteUserConfirm] = useState<{ isOpen: boolean, id: string }>({ isOpen: false, id: '' });
    const [selectedUserForEnrollment, setSelectedUserForEnrollment] = useState<User | null>(null);
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
    const [fetchError, setFetchError] = useState(false);

    // Streams & Freebies Management
    const [streamsData, setStreamsData] = useState<Stream[]>([]);
    const [freebies, setFreebies] = useState<LibraryResource[]>([]);
    const [isStreamsLoading, setIsStreamsLoading] = useState(false);
    const [isFreebiesLoading, setIsFreebiesLoading] = useState(false);
    const [newStreamName, setNewStreamName] = useState('');
    const [deleteStreamConfirmState, setDeleteStreamConfirmState] = useState<{ isOpen: boolean, name: string }>({ isOpen: false, name: '' });
    const [isUploadingFreebie, setIsUploadingFreebie] = useState(false);
    const [freebieForm, setFreebieForm] = useState({ title: '', type: 'NOTES', subject: 'All' });
    const [freebieFile, setFreebieFile] = useState<File | null>(null);
    const [showFreebieModal, setShowFreebieModal] = useState(false);
    const [unreadBatches, setUnreadBatches] = useState<Set<string>>(new Set());

    const { isAnnouncementUnread } = useViewStatus();

    useEffect(() => {
        fetchData();
    }, [user]);

    useEffect(() => {
        if (isAdmin && activeTab === 'STREAMS') {
            fetchStreams();
        } else if (isAdmin && activeTab === 'FREEBIES') {
            fetchFreebies();
        }
    }, [activeTab]);

    const fetchStreams = async () => {
        setIsStreamsLoading(true);
        try {
            const data = await api.streams.list();
            setStreamsData(data.streams || []);
        } catch (e) {
            console.error("Failed to fetch streams", e);
        } finally {
            setIsStreamsLoading(false);
        }
    };

    const fetchFreebies = async () => {
        setIsFreebiesLoading(true);
        try {
            const data = await api.freebies.list();
            setFreebies(data || []);
        } catch (e) {
            console.error("Failed to fetch freebies", e);
        } finally {
            setIsFreebiesLoading(false);
        }
    };

    const handleAddStream = async () => {
        if (!newStreamName.trim()) return;
        try {
            await api.streams.add(newStreamName.trim());
            showToast("Stream added successfully", "success");
            setNewStreamName('');
            fetchStreams();
        } catch (e) {
            showToast("Failed to add stream", "error");
        }
    };

    const handleDeleteStream = async () => {
        try {
            await api.streams.delete(deleteStreamConfirmState.name);
            showToast("Stream deleted", "success");
            setDeleteStreamConfirmState({ isOpen: false, name: '' });
            fetchStreams();
        } catch (e) {
            showToast("Failed to delete stream", "error");
        }
    };

    const handleUploadFreebie = async () => {
        if (!freebieFile || !freebieForm.title) {
            showToast("Title and file are required", "error");
            return;
        }

        setIsUploadingFreebie(true);
        try {
            const formData = new FormData();
            formData.append('pdf', freebieFile);
            formData.append('title', freebieForm.title);
            formData.append('type', freebieForm.type);
            formData.append('subject', freebieForm.subject);

            await api.freebies.upload(formData);
            showToast("Freebie uploaded successfully", "success");
            setShowFreebieModal(false);
            setFreebieFile(null);
            setFreebieForm({ title: '', type: 'NOTES', subject: 'All' });
            fetchFreebies();
        } catch (e) {
            showToast("Failed to upload freebie", "error");
        } finally {
            setIsUploadingFreebie(false);
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        setFetchError(false);
        try {
            const fetchPromises: Promise<any>[] = [
                api.courses.list(),
                api.streams.list()
            ];

            // Only Admins can list all users
            if (isAdmin) {
                fetchPromises.push(api.users.list());
            }

            const results = await Promise.allSettled(fetchPromises);

            // Handle Courses
            if (results[0].status === 'fulfilled') {
                const allCourses = results[0].value;
                if (isAdmin) {
                    setCourses(allCourses);
                } else {
                    const enrolledIds = user?.subscribedBatchIds || user?.subscribed_batches || [];
                    setCourses(allCourses.filter((c: Course) => enrolledIds.includes(c.id)));
                }
            } else {
                setFetchError(true);
            }

            // Handle Streams
            if (results[1].status === 'fulfilled') {
                const streamData = results[1].value;
                const streamNames = streamData.streams?.map((s: any) => s.title) || [];
                setStreams(['All', ...streamNames]);
            }

            // Handle Users (Admin Only)
            if (isAdmin && results[2] && results[2].status === 'fulfilled') {
                const fetchedUsers = results[2].value as any[];
                setUsers(fetchedUsers.map(u => ({
                    ...u,
                    name: u.name || (u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : ''),
                    firstName: u.first_name || u.firstName,
                    lastName: u.last_name || u.lastName,
                    subscribedBatchIds: u.subscribed_batches || u.subscribedBatchIds || []
                })));
            }

        } catch (e) {
            console.error("Dashboard data fetch error", e);
            setFetchError(true);
        } finally {
            setIsLoading(false);

            // Post-fetch check for unread announcements
            if (courses.length > 0 && !isAdmin && !isTeacher) {
                const checkUnread = async () => {
                    const newUnread = new Set<string>();
                    await Promise.all(courses.map(async (course) => {
                        try {
                            const anns = await api.announcements.list(course.id);
                            if (anns && anns.length > 0) {
                                if (isAnnouncementUnread(anns[0])) {
                                    newUnread.add(course.id);
                                }
                            }
                        } catch (err) { /* ignore */ }
                    }));
                    setUnreadBatches(newUnread);
                };
                checkUnread();
            }
        }
    };

    // --- FILTER LOGIC ---
    const filteredCourses = courses.filter(c => {
        if (activeStreamFilter === 'All') return true;
        return c.category === activeStreamFilter;
    });

    const filteredUsers = users.filter(u => {
        const fullName = `${u.firstName} ${u.lastName}`;
        const matchesSearch = fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearch.toLowerCase());
        if (!matchesSearch) return false;

        if (activeRoleFilter === 'All') return true;
        return u.role === activeRoleFilter;
    });

    // --- USER ACTIONS (ADMIN) ---
    const openAddUserModal = () => {
        setIsEditingUser(false);
        setUserForm({ id: '', firstName: '', lastName: '', email: '', password: '', role: 'STUDENT', phone: '', subject: '' });
        setShowUserModal(true);
    };

    const openEditUserModal = (u: User) => {
        setIsEditingUser(true);
        setUserForm({
            id: u.id,
            firstName: u.firstName || u.first_name || '',
            lastName: u.lastName || u.last_name || '',
            email: u.email,
            password: '',
            role: u.role || 'STUDENT',
            phone: u.phone || '',
            subject: u.subject || ''
        });
        setShowUserModal(true);
    };

    const handleSaveUser = async () => {
        try {
            if (isEditingUser) {
                const payload = {
                    first_name: userForm.firstName,
                    last_name: userForm.lastName,
                    email: userForm.email,
                    role: userForm.role,
                    phone: userForm.phone,
                    subject: userForm.role === 'TEACHER' ? userForm.subject : undefined
                };

                await api.users.update(userForm.id, payload);
                setUsers(users.map(u => u.id === userForm.id ? {
                    ...u,
                    ...payload,
                    firstName: userForm.firstName,
                    lastName: userForm.lastName,
                    name: `${userForm.firstName} ${userForm.lastName}`
                } : u));
                showToast("User updated successfully", "success");
            } else {
                if (!userForm.password) {
                    showToast("Password is required for new users", "error");
                    return;
                }
                const payload = {
                    first_name: userForm.firstName,
                    last_name: userForm.lastName,
                    email: userForm.email,
                    password: userForm.password,
                    role: userForm.role,
                    phone: userForm.phone,
                    subject: userForm.role === 'TEACHER' ? userForm.subject : undefined
                };
                const created = await api.users.create(payload);
                const newUser = {
                    ...created,
                    firstName: userForm.firstName,
                    lastName: userForm.lastName,
                    name: `${userForm.firstName} ${userForm.lastName}`,
                    subscribedBatchIds: []
                };
                setUsers([...users, newUser]);
                showToast("User added successfully", "success");
            }
            setShowUserModal(false);
        } catch (e) {
            showToast("Failed to save user", "error");
        }
    };

    const handleDeleteUser = async () => {
        try {
            await api.users.delete(deleteUserConfirm.id);
            setUsers(users.filter(u => u.id !== deleteUserConfirm.id));
            setDeleteUserConfirm({ isOpen: false, id: '' });
            showToast("User deleted", "success");
        } catch (e) {
            showToast("Failed to delete user", "error");
        }
    };

    // Helper for Theme Config (Blobs & Colors)
    const getThemeConfig = (theme: string | undefined) => {
        switch (theme) {
            case 'red': return {
                gradient: 'from-rose-500 to-red-600',
                blob: 'bg-red-200',
                text: 'text-red-700',
                light: 'bg-red-50'
            };
            case 'purple': return {
                gradient: 'from-violet-500 to-purple-600',
                blob: 'bg-purple-200',
                text: 'text-purple-700',
                light: 'bg-purple-50'
            };
            case 'orange': return {
                gradient: 'from-orange-400 to-amber-600',
                blob: 'bg-orange-200',
                text: 'text-orange-800',
                light: 'bg-orange-50'
            };
            default: return {
                gradient: 'from-cyan-500 to-blue-600',
                blob: 'bg-blue-200',
                text: 'text-ocean-700',
                light: 'bg-blue-50'
            };
        }
    };

    // --- RENDER ---

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-ocean-600" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Section */}
            {isAdmin ? (
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Admin Overview</h1>
                        <p className="text-gray-500 font-medium mt-1">Manage institute performance, batches, and users.</p>
                    </div>

                    <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap gap-1">
                        {[
                            { id: 'BATCHES', label: 'Batches', icon: Layers },
                            { id: 'USERS', label: 'Directory', icon: Users },
                            { id: 'STREAMS', label: 'Streams', icon: Briefcase },
                            { id: 'FREEBIES', label: 'Public Content', icon: Star }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-slate-900'}`}
                            >
                                <tab.icon className="w-4 h-4" /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-2xl p-8 md:p-12">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-ocean-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-ocean-200 mb-3 border border-white/10">
                            <Star className="w-3 h-3 fill-current" /> {isTeacher ? 'Teacher Portal' : 'Student Portal'}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Welcome back, {user?.firstName}! 👋</h1>
                        <p className="text-slate-300 text-lg font-medium max-w-xl">Ready to continue your {isTeacher ? 'teaching' : 'learning'} journey? Select a batch below.</p>
                    </div>
                </div>
            )}

            {/* --- BATCHES VIEW (Shared Design) --- */}
            {(!isAdmin || activeTab === 'BATCHES') && (
                <div className="space-y-8">
                    {/* Filters (Admin Only or if multiple streams exist) */}
                    {(isAdmin || streams.length > 2) && (
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                            {streams.map(stream => (
                                <button
                                    key={stream}
                                    onClick={() => setActiveStreamFilter(stream)}
                                    className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${activeStreamFilter === stream
                                        ? 'bg-ocean-600 text-white border-ocean-600 shadow-md shadow-ocean-200'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-ocean-300 hover:text-ocean-600'
                                        }`}
                                >
                                    {stream}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                        {/* Course Cards - "Blob" Style */}
                        {filteredCourses.map(course => {
                            const theme = getThemeConfig(course.colorTheme);
                            const studentCount = users.filter(u => u.subscribedBatchIds.includes(course.id)).length;
                            const linkTarget = (isAdmin || isTeacher) ? `/dashboard/teacher/batch/${course.id}` : `/dashboard/batch/${course.id}`;
                            const btnText = (isAdmin || isTeacher) ? 'Manage Batch' : 'Open Batch';

                            return (
                                <div
                                    key={course.id}
                                    onClick={() => navigate(linkTarget)}
                                    className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden flex flex-col h-full hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                                >
                                    {/* Blobs */}
                                    <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full ${theme.blob} opacity-50 transition-transform group-hover:scale-110 duration-700`}></div>
                                    <div className={`absolute -left-20 -bottom-20 w-64 h-64 rounded-full ${theme.blob} opacity-30 transition-transform group-hover:scale-110 duration-700`}></div>

                                    <div className="p-8 relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-6">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100 ${theme.text}`}>
                                                {course.category}
                                            </span>
                                            {isAdmin && (
                                                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-xs font-bold text-gray-500">
                                                    <Users className="w-3.5 h-3.5" /> {studentCount}
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-3xl font-extrabold text-slate-900 leading-tight mb-2 group-hover:text-ocean-700 transition-colors flex items-center gap-3">
                                            {course.title}
                                            {unreadBatches.has(course.id) && (
                                                <span className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
                                            )}
                                        </h3>
                                        <p className="text-lg font-bold text-gray-400 mb-6">{course.subTitle || 'Batch'}</p>

                                        <div className="mt-auto">
                                            <div className="flex items-center gap-4 text-sm font-medium text-gray-500 mb-6">
                                                <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                    <Briefcase className="w-4 h-4" /> {course.targetYear}
                                                </span>
                                                <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                    <Clock className="w-4 h-4" /> {course.duration}
                                                </span>
                                            </div>
                                            <Button className="w-full justify-center rounded-xl py-3.5 shadow-lg group-hover:shadow-ocean-200 transition-all text-sm font-bold">
                                                {btnText} <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Free Resources Card */}
                        {(activeStreamFilter === 'All' || activeStreamFilter === 'Free') && (
                            <div
                                onClick={() => navigate('/dashboard/batch/freebies/library')}
                                className="bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-white hover:border-ocean-300 hover:shadow-xl transition-all group"
                            >
                                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Book className="w-8 h-8 text-slate-400 group-hover:text-ocean-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-700 group-hover:text-ocean-700 mb-2">Free Resources</h3>
                                <p className="text-gray-500 font-medium mb-8">Access public notes & videos</p>
                                <Button variant="outline" className="rounded-xl px-8 bg-transparent">
                                    Open Library
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- USERS TABLE VIEW (Admin Only) --- */}
            {isAdmin && activeTab === 'USERS' && (
                <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                    {/* User Toolbar */}
                    <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between gap-6 bg-slate-50/50">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            <div className="relative flex-1 max-w-md group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-ocean-500 transition-colors" />
                                <input
                                    placeholder="Search by name or email..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    className="pl-12 pr-4 py-3 rounded-2xl border border-gray-200 w-full focus:ring-4 focus:ring-ocean-100 focus:border-ocean-400 outline-none text-slate-900 bg-white shadow-sm transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
                                {['All', 'STUDENT', 'TEACHER', 'ADMIN'].map(role => (
                                    <button
                                        key={role}
                                        onClick={() => setActiveRoleFilter(role)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeRoleFilter === role
                                            ? 'bg-slate-900 text-white shadow-md'
                                            : 'text-gray-500 hover:text-slate-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        {role.charAt(0) + role.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Button onClick={openAddUserModal} className="flex items-center gap-2 shadow-lg shadow-ocean-200 rounded-xl px-6 py-3">
                            <UserPlus className="w-5 h-5" /> Add New User
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="p-5 pl-8">User Identity</th>
                                    <th className="p-5">System Role</th>
                                    <th className="p-5">Contact</th>
                                    <th className="p-5 text-right pr-8">Manage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-5 pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md ${u.role === 'ADMIN' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                                                    u.role === 'TEACHER' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' :
                                                        'bg-gradient-to-br from-blue-500 to-cyan-600'
                                                    }`}>
                                                    {u.firstName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm">{u.firstName} {u.lastName}</div>
                                                    <div className="text-xs text-gray-400 font-mono">ID: {u.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${u.role === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-200' :
                                                u.role === 'TEACHER' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                    'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                <Shield className="w-3 h-3" /> {u.role}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                                    <Mail className="w-3.5 h-3.5 text-gray-400" /> {u.email}
                                                </div>
                                                {u.phone && (
                                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {u.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5 text-right pr-8">
                                            <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                {u.role === 'STUDENT' && (
                                                    <button
                                                        onClick={() => { setSelectedUserForEnrollment(u); setShowEnrollmentModal(true); }}
                                                        className="p-2 rounded-lg hover:bg-ocean-50 text-gray-400 hover:text-ocean-600 transition-colors"
                                                        title="Manage Enrollments"
                                                    >
                                                        <Layers className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openEditUserModal(u)}
                                                    className="p-2 rounded-lg hover:bg-ocean-50 text-gray-400 hover:text-ocean-600 transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteUserConfirm({ isOpen: true, id: u.id })}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                                    disabled={u.id === user?.id}
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-gray-400">
                                            No users found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- STREAMS VIEW (Admin Only) --- */}
            {isAdmin && activeTab === 'STREAMS' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Academic Streams</h2>
                                <p className="text-gray-500 font-medium">Define and manage the course categories available in the system.</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <input
                                    placeholder="Enter stream name (e.g. UPSC)"
                                    value={newStreamName}
                                    onChange={(e) => setNewStreamName(e.target.value)}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-ocean-500 bg-white text-slate-900 min-w-[240px]"
                                />
                                <Button onClick={handleAddStream} className="rounded-xl px-6">
                                    <Plus className="w-5 h-5 mr-2" /> Add Stream
                                </Button>
                            </div>
                        </div>

                        {isStreamsLoading ? (
                            <div className="py-12 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-ocean-600" /></div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {streamsData.map(stream => (
                                    <div key={stream.id || stream.title} className="bg-slate-50 border border-gray-100 rounded-2xl p-5 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-ocean-100 rounded-xl flex items-center justify-center text-ocean-600 font-bold">
                                                {stream.title.charAt(0)}
                                            </div>
                                            <span className="font-bold text-slate-900">{stream.title}</span>
                                        </div>
                                        <button
                                            onClick={() => setDeleteStreamConfirmState({ isOpen: true, name: stream.title })}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- FREEBIES VIEW (Admin Only) --- */}
            {isAdmin && activeTab === 'FREEBIES' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Public Content Library</h2>
                                <p className="text-gray-500 font-medium">Manage resources accessible to all users without enrollment.</p>
                            </div>
                            <Button onClick={() => setShowFreebieModal(true)} className="rounded-xl px-6 shadow-lg shadow-amber-200 bg-amber-600 hover:bg-amber-700">
                                <Upload className="w-5 h-5 mr-2" /> Upload Resource
                            </Button>
                        </div>

                        {isFreebiesLoading ? (
                            <div className="py-12 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-ocean-600" /></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4 pl-6">Resource</th>
                                            <th className="p-4">Category</th>
                                            <th className="p-4">Type</th>
                                            <th className="p-4">Upload Date</th>
                                            <th className="p-4 text-right pr-6">Manage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {freebies.length > 0 ? freebies.map(file => (
                                            <tr key={file.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="p-4 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="w-5 h-5 text-gray-400" />
                                                        <span className="font-bold text-slate-900">{file.title}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-sm font-medium text-gray-600">{file.subject || 'General'}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight ${file.type === 'NOTES' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                                                        }`}>
                                                        {file.type}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-500">
                                                    {file.created_at ? new Date(file.created_at).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="p-4 text-right pr-6">
                                                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="p-12 text-center text-gray-400">
                                                    No public resources uploaded yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* User Modals */}
            <Modal
                isOpen={showUserModal}
                onClose={() => setShowUserModal(false)}
                title={isEditingUser ? "Edit User" : "Add New User"}
                footer={
                    <>
                        <Button variant="outline" onClick={() => setShowUserModal(false)}>Cancel</Button>
                        <Button onClick={handleSaveUser}>{isEditingUser ? "Save Changes" : "Add User"}</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">First Name</label>
                            <input
                                value={userForm.firstName}
                                onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ocean-500 bg-white text-slate-900"
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
                            <input
                                value={userForm.lastName}
                                onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ocean-500 bg-white text-slate-900"
                                placeholder="Doe"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <input
                            value={userForm.email}
                            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ocean-500 bg-white text-slate-900"
                            type="email"
                        />
                    </div>
                    {!isEditingUser && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                            <input
                                value={userForm.password}
                                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ocean-500 bg-white text-slate-900"
                                type="password"
                                placeholder="Enter password"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                        <input
                            value={userForm.phone}
                            onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ocean-500 bg-white text-slate-900"
                            placeholder="+91..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                            <select
                                value={userForm.role}
                                onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none bg-white text-slate-900"
                            >
                                <option value="STUDENT">Student</option>
                                <option value="TEACHER">Teacher</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        {userForm.role === 'TEACHER' && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                                <input
                                    value={userForm.subject}
                                    onChange={(e) => setUserForm({ ...userForm, subject: e.target.value })}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none bg-white text-slate-900"
                                    placeholder="e.g. Physics"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            <ConfirmationModal
                isOpen={deleteUserConfirm.isOpen}
                onClose={() => setDeleteUserConfirm({ isOpen: false, id: '' })}
                onConfirm={handleDeleteUser}
                title="Delete User"
                message="Are you sure you want to delete this user? This cannot be undone."
                isDanger={true}
                confirmLabel="Delete"
            />

            <ConfirmationModal
                isOpen={deleteStreamConfirmState.isOpen}
                onClose={() => setDeleteStreamConfirmState({ isOpen: false, name: '' })}
                onConfirm={handleDeleteStream}
                title="Delete Stream"
                message={`Are you sure you want to delete the "${deleteStreamConfirmState.name}" stream? This may affect associated batches.`}
                isDanger={true}
                confirmLabel="Delete"
            />

            <Modal
                isOpen={showFreebieModal}
                onClose={() => setShowFreebieModal(false)}
                title="Upload Public Resource"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setShowFreebieModal(false)}>Cancel</Button>
                        <Button onClick={handleUploadFreebie} isLoading={isUploadingFreebie}>Upload File</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Resource Title</label>
                        <input
                            value={freebieForm.title}
                            onChange={(e) => setFreebieForm({ ...freebieForm, title: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-ocean-500 bg-white text-slate-900"
                            placeholder="e.g. NCERT Physics Chapter 1 Notes"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                            <select
                                value={freebieForm.type}
                                onChange={(e) => setFreebieForm({ ...freebieForm, type: e.target.value as any })}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none bg-white text-slate-900"
                            >
                                <option value="NOTES">Notes (PDF)</option>
                                <option value="VIDEO">Video Lecture</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                            <select
                                value={freebieForm.subject}
                                onChange={(e) => setFreebieForm({ ...freebieForm, subject: e.target.value })}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none bg-white text-slate-900"
                            >
                                <option value="All">All/General</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Biology">Biology</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Select File</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-ocean-400 transition-colors bg-slate-50">
                            {freebieFile ? (
                                <div className="text-center">
                                    <FileText className="mx-auto h-12 w-12 text-ocean-500" />
                                    <p className="mt-2 text-sm font-bold text-slate-900">{freebieFile.name}</p>
                                    <button
                                        onClick={() => setFreebieFile(null)}
                                        className="mt-2 text-xs text-red-600 font-bold hover:underline"
                                    >
                                        Remove file
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label className="relative cursor-pointer bg-white rounded-md font-bold text-ocean-600 hover:text-ocean-500 outline-none">
                                            <span>Upload a file</span>
                                            <input
                                                type="file"
                                                className="sr-only"
                                                onChange={(e) => setFreebieFile(e.target.files?.[0] || null)}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PDF, MP4, PNG up to 50MB</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>

            <ManageEnrollmentsModal
                isOpen={showEnrollmentModal}
                onClose={() => { setShowEnrollmentModal(false); setSelectedUserForEnrollment(null); }}
                user={selectedUserForEnrollment}
            />
        </div>
    );
};

export default StudentDashboard;
