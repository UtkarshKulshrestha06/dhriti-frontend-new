
import React from 'react';
import { Course } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Edit2, ExternalLink, Save, X } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  isEditable?: boolean;
  onSave?: (updatedCourse: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isEditable = false, onSave }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';
  
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState<Course>(course);

  // Sync state if course prop changes
  React.useEffect(() => {
    setFormData(course);
  }, [course]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData(course);
    setIsEditing(false);
  };

  // Theme configuration matching the reference design style
  const themeConfig = {
    purple: {
      textDark: 'text-purple-700',
      textBright: 'text-purple-500',
      blob: 'bg-purple-200',
      border: 'border-slate-900',
      button: 'bg-purple-700 hover:bg-purple-600',
      shadow: 'shadow-purple-700/30'
    },
    orange: {
      textDark: 'text-orange-800',
      textBright: 'text-orange-500',
      blob: 'bg-orange-100',
      border: 'border-slate-900',
      button: 'bg-orange-700 hover:bg-orange-600',
      shadow: 'shadow-orange-700/30'
    },
    blue: {
      textDark: 'text-blue-800',
      textBright: 'text-blue-500',
      blob: 'bg-blue-200',
      border: 'border-slate-900',
      button: 'bg-blue-800 hover:bg-blue-700',
      shadow: 'shadow-blue-800/30'
    },
    red: {
      textDark: 'text-red-800',
      textBright: 'text-red-500',
      blob: 'bg-red-200',
      border: 'border-slate-900',
      button: 'bg-red-700 hover:bg-red-600',
      shadow: 'shadow-red-700/30'
    }
  };

  const theme = themeConfig[course.colorTheme || 'blue'];
  const showEditMode = isEditable && isAdmin;
  const isFormActive = showEditMode && isEditing;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_35px_rgba(0,0,0,0.08)] border border-gray-200 relative overflow-hidden flex flex-col h-full hover:-translate-y-1 hover:shadow-[0_30px_45px_rgba(0,0,0,0.12)] transition-all duration-300">
      
      {/* Background Accent Blobs */}
      <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full ${theme.blob} opacity-50 z-0`}></div>
      <div className={`absolute -left-24 -bottom-36 w-96 h-96 rounded-full ${theme.blob} opacity-30 z-0`}></div>

      {/* Admin Controls */}
      {showEditMode && !isEditing && (
        <div className="absolute top-4 right-4 z-20 flex gap-2">
           <button 
             onClick={() => setIsEditing(true)} 
             className="bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-ocean-600 hover:scale-110 transition-all"
             title="Edit Batch Details"
           >
             <Edit2 className="w-4 h-4" />
           </button>
           <button 
             onClick={() => navigate(`/courses/${course.id}`)}
             className="bg-ocean-600 p-2 rounded-full shadow-md text-white hover:bg-ocean-700 hover:scale-110 transition-all"
             title="Edit Full Page Content"
           >
             <ExternalLink className="w-4 h-4" />
           </button>
        </div>
      )}

      {/* Save/Cancel Controls */}
      {isFormActive && (
        <div className="absolute top-4 right-4 z-20 flex gap-2">
           <button 
             onClick={handleCancel} 
             className="bg-red-100 p-2 rounded-full shadow-md text-red-600 hover:bg-red-200 transition-all"
           >
             <X className="w-4 h-4" />
           </button>
           <button 
             onClick={handleSave}
             className="bg-green-100 p-2 rounded-full shadow-md text-green-600 hover:bg-green-200 transition-all"
           >
             <Save className="w-4 h-4" />
           </button>
        </div>
      )}

      {/* Inner Content */}
      <div className="p-8 relative z-10 flex flex-col h-full overflow-y-auto custom-scrollbar">
        
        {/* Titles */}
        <div className="mb-1">
          {isFormActive ? (
            <div className="space-y-2 mb-2">
              <input 
                 name="title"
                 value={formData.title} 
                 onChange={handleChange}
                 className="w-full text-2xl font-extrabold border-b border-gray-300 focus:border-ocean-600 outline-none bg-white text-slate-900"
                 placeholder="Batch Title"
              />
              {/* SubTitle (Batch) is Read Only */}
              <div className="text-[22px] font-bold text-gray-400 mt-3 select-none cursor-not-allowed border-b border-transparent">
                {formData.subTitle || 'Batch'}
              </div>
            </div>
          ) : (
            <>
              <div className={`text-[34px] font-extrabold leading-none ${theme.textDark}`}>
                {course.title}
              </div>
              <div className="text-[22px] font-bold text-slate-800 mt-3">
                {course.subTitle || 'Batch'}
              </div>
            </>
          )}
        </div>

        {/* Description */}
        <div className={`mt-1 text-[20px] font-bold ${theme.textBright} mb-6`}>
           {isFormActive ? (
             <input 
               name="description"
               value={formData.description} 
               onChange={handleChange}
               className="w-full bg-white text-slate-900 border-b border-gray-300 focus:border-ocean-600 outline-none"
             />
           ) : (
             course.description
           )}
        </div>

        {/* Features removed from card as requested, kept only in Explore Page */}

        {/* Batch Date */}
        <div className="mb-4 mt-auto">
          <div className="text-[22px] font-bold text-slate-900 mb-1">
            Batch Date :
          </div>
          <div className={`inline-block border-2 ${theme.border} rounded-[3px_15px_3px_15px] px-3 py-1.5 bg-white`}>
            <span className={`text-[19px] font-medium ${theme.textBright}`}>
               {isFormActive ? (
                 <input 
                   name="batchDate"
                   value={formData.batchDate || ''} 
                   onChange={handleChange}
                   className="w-32 bg-white text-slate-900 outline-none"
                 />
               ) : (
                 course.batchDate || 'Coming Soon'
               )}
            </span>
          </div>
        </div>

        {/* Target */}
        <div className={`text-[20px] font-bold ${theme.textBright} mb-6`}>
          Target Year : <span className={`border-2 ${theme.border} rounded-[3px_15px_3px_15px] px-2 py-0.5 ${theme.textDark} ml-1`}>
             {isFormActive ? (
                 <input 
                   name="targetYear"
                   value={formData.targetYear} 
                   onChange={handleChange}
                   className="w-16 bg-white text-slate-900 outline-none"
                 />
             ) : (
               course.targetYear
             )}
          </span>
        </div>

        {/* Bottom Row */}
        {!isFormActive && (
          <div className="mt-2 flex justify-between items-end">
            <Link to={`/courses/${course.id}`}>
              <button className={`${theme.button} text-white border-none py-3 px-8 text-lg font-bold rounded-[14px] cursor-pointer shadow-[0_12px_20px_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-0.5`}>
                Explore More
              </button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default CourseCard;
