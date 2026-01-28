
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { COURSES } from '../../../constants';
import { ArrowLeft, Search, Mail, Phone, Trash2, UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/mockBackend';
import { User } from '../../../types';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import ConfirmationModal from '../../../components/ConfirmationModal';

const BatchStudents: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
  
  const isAdmin = currentUser?.role === 'ADMIN';
  const course = COURSES.find(c => c.id === batchId);
  
  // States
  const [enrolledUsers, setEnrolledUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // For selection modal
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollSearch, setEnrollSearch] = useState('');
  const [deleteData, setDeleteData] = useState<{isOpen: boolean, id: string, name: string}>({ isOpen: false, id: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [batchId]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const users = await api.users.list();
      setAllUsers(users);
      const enrolled = users.filter(u => u.subscribedBatchIds.includes(batchId || ''));
      setEnrolledUsers(enrolled);
    } finally {
      setIsLoading(false);
    }
  };

  if (!course) return <div>Batch not found</div>;

  const filteredEnrolledUsers = enrolledUsers.filter(u => {
    const fullName = `${u.firstName} ${u.lastName}`;
    return fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           u.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Users available to enroll (not currently in batch)
  const availableUsers = allUsers.filter(u => {
    const fullName = `${u.firstName} ${u.lastName}`;
    return !u.subscribedBatchIds.includes(batchId || '') &&
    (fullName.toLowerCase().includes(enrollSearch.toLowerCase()) || u.email.toLowerCase().includes(enrollSearch.toLowerCase()));
  });

  // --- Handlers ---

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${type}: ${text}`, 'success');
  };

  const handleRemoveUser = async () => {
    if (!deleteData.id) return;
    try {
        const userToUpdate = enrolledUsers.find(u => u.id === deleteData.id);
        if (userToUpdate) {
            const newBatches = userToUpdate.subscribedBatchIds.filter(id => id !== batchId);
            await api.users.update({ ...userToUpdate, subscribedBatchIds: newBatches });
            
            setEnrolledUsers(prev => prev.filter(u => u.id !== deleteData.id));
            // Update global list cache conceptually if needed
            setAllUsers(prev => prev.map(u => u.id === deleteData.id ? { ...u, subscribedBatchIds: newBatches } : u));
            
            showToast("User removed from batch", "success");
        }
    } catch (e) {
        showToast("Failed to remove user", "error");
    }
  };

  const handleEnrollUser = async (userId: string) => {
    setIsSubmitting(true);
    try {
        const userToEnroll = allUsers.find(u => u.id === userId);
        if (userToEnroll && batchId) {
            const newBatches = [...userToEnroll.subscribedBatchIds, batchId];
            await api.users.update({ ...userToEnroll, subscribedBatchIds: newBatches });
            
            const updatedUser = { ...userToEnroll, subscribedBatchIds: newBatches };
            setEnrolledUsers([...enrolledUsers, updatedUser]);
            setAllUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
            
            showToast("User enrolled successfully", "success");
        }
    } catch (e) {
        showToast("Failed to enroll user", "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <button onClick={() => navigate(`/dashboard/teacher/batch/${batchId}`)} className="flex items-center text-gray-500 hover:text-ocean-600 font-bold text-sm mb-2 transition-colors">
             <ArrowLeft className="w-4 h-4 mr-1" /> Back to Batch
           </button>
           <h1 className="text-2xl font-extrabold text-slate-900">
             Batch Members
           </h1>
           <p className="text-gray-500 text-sm">Total {enrolledUsers.length} members in {course.title}</p>
        </div>
        
        <div className="flex gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search enrolled..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-ocean-500 outline-none w-full md:w-64 text-slate-900 bg-white"
                />
            </div>
            {isAdmin && (
                <Button onClick={() => setShowEnrollModal(true)} className="flex items-center gap-2 rounded-xl shadow-lg shadow-ocean-200">
                    <UserPlus className="w-4 h-4" /> Enroll Student
                </Button>
            )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="overflow-x-auto">
            {isLoading ? (
                <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-ocean-600"/></div>
            ) : (
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <th className="p-4 pl-6">Name</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Contact Info</th>
                        <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredEnrolledUsers.length > 0 ? filteredEnrolledUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                    {u.firstName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{u.firstName} {u.lastName}</p>
                                    <p className="text-xs text-gray-400">ID: #{u.id.toUpperCase()}</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                u.role === 'ADMIN' ? 'bg-red-100 text-red-600' :
                                u.role === 'TEACHER' ? 'bg-purple-100 text-purple-600' :
                                'bg-blue-100 text-blue-600'
                            }`}>
                                {u.role}
                            </span>
                        </td>
                        <td className="p-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail className="w-3.5 h-3.5 text-gray-400" /> {u.email}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-3.5 h-3.5 text-gray-400" /> {u.phone || 'N/A'}
                                </div>
                            </div>
                        </td>
                        <td className="p-4 text-right pr-6">
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => handleCopy(u.phone || '', 'Phone')}
                                    className="p-2 rounded-lg bg-gray-50 hover:bg-ocean-50 text-gray-500 hover:text-ocean-600 transition-colors"
                                    title="Copy Phone"
                                >
                                <Phone className="w-4 h-4" />
                                </button>
                                {isAdmin && (
                                    <button 
                                        onClick={() => setDeleteData({isOpen: true, id: u.id, name: `${u.firstName} ${u.lastName}`})}
                                        className="p-2 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                                        title="Remove from Batch"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-400">
                                No students enrolled yet.
                            </td>
                        </tr>
                    )}
                </tbody>
                </table>
            )}
         </div>
      </div>

      {/* Enroll Modal */}
      <Modal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        title='Enroll Existing User'
      >
         <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search users to enroll..." 
                    value={enrollSearch}
                    onChange={(e) => setEnrollSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-ocean-500 outline-none text-slate-900 bg-white"
                    autoFocus
                />
            </div>
            
            <div className="max-h-60 overflow-y-auto custom-scrollbar border border-gray-100 rounded-xl divide-y divide-gray-100">
                {availableUsers.length > 0 ? availableUsers.map(user => (
                    <div key={user.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                        <div>
                            <p className="font-bold text-sm text-slate-800">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <button 
                            onClick={() => handleEnrollUser(user.id)}
                            disabled={isSubmitting}
                            className="bg-ocean-50 text-ocean-700 hover:bg-ocean-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        >
                            Enroll
                        </button>
                    </div>
                )) : (
                    <p className="p-4 text-center text-sm text-gray-400">No matching users found.</p>
                )}
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 flex gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <p>Only users NOT already enrolled in this batch are shown here. To add a completely new user, go to the Admin Dashboard first.</p>
            </div>
         </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal 
         isOpen={deleteData.isOpen}
         onClose={() => setDeleteData({ ...deleteData, isOpen: false })}
         onConfirm={handleRemoveUser}
         title="Remove Member"
         message={`Are you sure you want to remove "${deleteData.name}" from this batch?`}
         isDanger={true}
         confirmLabel="Remove"
      />
    </div>
  );
};

export default BatchStudents;
