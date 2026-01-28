import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Circle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { Course, User } from '../types';
import { COURSES } from '../constants';
import Modal from './Modal';
import Button from './Button';
import { useToast } from '../context/ToastContext';

interface ManageEnrollmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

const ManageEnrollmentsModal: React.FC<ManageEnrollmentsModalProps> = ({ isOpen, onClose, user }) => {
    const { showToast } = useToast();
    const [enrolledBatchIds, setEnrolledBatchIds] = useState<string[]>([]);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && user) {
            fetchData();
        }
    }, [isOpen, user]);

    const fetchData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const [enrollments, courses] = await Promise.all([
                api.enrollments.list(user.id),
                api.courses.list()
            ]);
            setEnrolledBatchIds(enrollments.map(e => e.batch_id));
            setAllCourses(courses || []);
        } catch (error) {
            console.error("Failed to fetch enrollment data", error);
            showToast("Failed to load data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleEnrollment = async (batchId: string) => {
        if (!user) return;
        setIsSaving(batchId);
        const isEnrolled = enrolledBatchIds.includes(batchId);

        try {
            if (isEnrolled) {
                await api.enrollments.remove(user.id, batchId);
                setEnrolledBatchIds(prev => prev.filter(id => id !== batchId));
                showToast(`Removed from ${batchId}`, "success");
            } else {
                await api.enrollments.add(user.id, batchId);
                setEnrolledBatchIds(prev => [...prev, batchId]);
                showToast(`Enrolled in ${batchId}`, "success");
            }
        } catch (error) {
            console.error("Enrollment toggle failed", error);
            showToast("Failed to update enrollment", "error");
        } finally {
            setIsSaving(null);
        }
    };

    if (!user) return null;

    const displayName = user.name || `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim() || 'Student';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Manage Batch Access"
            footer={
                <Button onClick={onClose}>Done</Button>
            }
        >
            <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-600 font-bold text-xl">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900">{displayName}</h4>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Available Batches</p>

                    {isLoading ? (
                        <div className="py-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-ocean-600" /></div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {allCourses.map((course) => {
                                const isEnrolled = enrolledBatchIds.includes(course.id);
                                const loading = isSaving === course.id;

                                return (
                                    <div
                                        key={course.id}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isEnrolled
                                            ? 'bg-ocean-50 border-ocean-200 ring-1 ring-ocean-100'
                                            : 'bg-white border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${isEnrolled ? 'bg-ocean-100 text-ocean-600' : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{course.title}</p>
                                                <p className="text-[10px] text-gray-500 font-medium">{course.subTitle || course.category}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleToggleEnrollment(course.id)}
                                            disabled={!!isSaving}
                                            className={`p-2 rounded-lg transition-colors ${isEnrolled
                                                ? 'text-ocean-600 bg-white shadow-sm border border-ocean-100'
                                                : 'text-gray-300 hover:text-ocean-600 hover:bg-ocean-50'
                                                }`}
                                        >
                                            {loading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : isEnrolled ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <Circle className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ManageEnrollmentsModal;
