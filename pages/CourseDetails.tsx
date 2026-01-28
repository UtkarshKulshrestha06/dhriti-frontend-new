
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, BookOpen, CheckCircle2, Phone, CreditCard, ArrowLeft, Download, Settings, Save, X, Plus, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import { api } from '../services/api';
import { Course, Stream } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [streams, setStreams] = useState<string[]>([]);

  // Edit State
  const [formData, setFormData] = useState<Course | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    if (!courseId) return;
    try {
      const [courseData, streamsRes] = await Promise.all([
        api.courses.get(courseId),
        api.streams.list()
      ]);

      const normalizeCourse = (c: any) => ({
        ...c,
        title: c.title || '',
        subTitle: c.sub_title || c.subTitle || 'Batch',
        category: c.stream_name || c.stream_id || c.category || 'General',
        description: c.description || '',
        targetYear: c.target_year || c.targetYear || '',
        duration: c.duration || '',
        price: c.price || '',
        registrationFee: c.registration_fee || c.registrationFee || '',
        batchDate: c.batch_date || c.batchDate || '',
        endDate: c.end_date || c.endDate || '',
        features: c.features || [],
        faculty: c.faculty || []
      });

      const normalized = normalizeCourse(courseData);
      setCourse(normalized);
      setFormData(normalized);
      setStreams(streamsRes.streams.map((s: Stream) => s.title));
    } catch (e) {
      console.error("Failed to fetch course details", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    try {
      const payload = {
        ...formData,
        sub_title: formData.subTitle,
        stream_name: formData.category,
        stream_id: formData.category,
        target_year: formData.targetYear,
        registration_fee: formData.registrationFee,
        batch_date: formData.batchDate,
        end_date: formData.endDate,
        color_theme: formData.colorTheme
      };
      await api.courses.update(payload);
      setCourse(formData);
      setIsAdminMode(false);
      showToast("Page updated successfully", "success");
    } catch (e) {
      showToast("Failed to update page", "error");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Array Field Handlers (Features, Faculty)
  const handleArrayChange = (field: 'features' | 'faculty', index: number, value: string) => {
    if (!formData) return;
    const newArray = [...(formData[field] || [])];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const handleAddArrayItem = (field: 'features' | 'faculty') => {
    if (!formData) return;
    const newArray = [...(formData[field] || []), ''];
    setFormData({ ...formData, [field]: newArray });
  };

  const handleRemoveArrayItem = (field: 'features' | 'faculty', index: number) => {
    if (!formData) return;
    const newArray = [...(formData[field] || [])];
    newArray.splice(index, 1);
    setFormData({ ...formData, [field]: newArray });
  };

  if (!course || !formData) {
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Course Not Found</h2>
        <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
      </div>
    );
  }

  // Theme Colors Helper
  const getThemeColors = (theme: string | undefined) => {
    switch (theme) {
      case 'purple': return 'from-purple-50 to-purple-100 text-purple-700 border-purple-200 bg-purple-50';
      case 'orange': return 'from-orange-50 to-orange-100 text-orange-700 border-orange-200 bg-orange-50';
      case 'red': return 'from-red-50 to-red-100 text-red-700 border-red-200 bg-red-50';
      default: return 'from-blue-50 to-blue-100 text-blue-700 border-blue-200 bg-blue-50';
    }
  };

  const themeClass = getThemeColors(course.colorTheme);
  const accentColor = course.colorTheme === 'red' ? 'text-red-600' :
    course.colorTheme === 'orange' ? 'text-orange-600' :
      course.colorTheme === 'purple' ? 'text-purple-600' : 'text-ocean-600';

  return (
    <div className="min-h-screen bg-white font-sans relative">

      {/* Admin Toggle */}
      {isAdmin && (
        <div className="fixed top-24 right-4 z-50">
          {isAdminMode ? (
            <div className="flex gap-2">
              <button
                onClick={() => { setIsAdminMode(false); setFormData(course); }}
                className="flex items-center gap-2 px-4 py-3 rounded-full font-bold text-sm shadow-xl bg-red-600 text-white hover:bg-red-700 transition-all"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-3 rounded-full font-bold text-sm shadow-xl bg-green-600 text-white hover:bg-green-700 transition-all"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdminMode(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-full font-bold text-sm shadow-xl bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition-all"
            >
              <Settings className="w-4 h-4" /> Edit Page
            </button>
          )}
        </div>
      )}

      {/* 1. Header Section */}
      <div className={`relative pt-12 pb-20 bg-gradient-to-br ${themeClass} overflow-hidden`}>
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-white opacity-40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-80 h-80 bg-white opacity-40 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-8 font-bold transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="w-full lg:w-2/3">
              {isAdminMode ? (
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`inline-block px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider bg-white/80 shadow-sm mb-4 outline-none border border-ocean-300 text-slate-900`}
                >
                  {streams.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/60 shadow-sm mb-4 ${accentColor}`}>
                  {course.category}
                </span>
              )}

              {isAdminMode ? (
                <div className="space-y-3 mb-4">
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full text-4xl md:text-5xl font-extrabold text-slate-900 bg-white/50 border-b border-gray-300 focus:border-ocean-600 outline-none p-1 placeholder:text-gray-400"
                    placeholder="Course Title"
                  />
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-baseline">
                    {/* Subtitle is READ ONLY in edit mode as per requirements */}
                    <span className="text-2xl font-bold text-slate-700 select-none opacity-80">
                      {formData.subTitle || 'Batch'}
                    </span>
                    <span className="text-gray-400 mx-2 hidden sm:inline">|</span>
                    <input
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full sm:w-2/3 text-xl font-bold bg-white/50 border-b border-gray-300 focus:border-ocean-600 outline-none p-1 text-slate-700"
                      placeholder="Description"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">{course.title}</h1>
                  <p className="text-2xl text-slate-600 font-bold">{course.subTitle} <span className="text-gray-400 mx-2">|</span> {course.description}</p>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-sm border border-white/50 text-slate-900 font-bold hover:bg-white hover:scale-105 transition-all flex items-center group">
                <div className={`p-1 rounded-full mr-3 ${course.colorTheme === 'red' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} group-hover:bg-slate-900 group-hover:text-white transition-colors`}>
                  <Download className="w-5 h-5" />
                </div>
                <span>Syllabus PDF</span>
              </button>

              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/50 min-w-[120px]">
                <p className="text-xs font-bold text-gray-500 uppercase">Target Year</p>
                {isAdminMode ? (
                  <input
                    name="targetYear"
                    value={formData.targetYear}
                    onChange={handleInputChange}
                    className="w-full text-2xl font-black bg-transparent border-b border-gray-300 focus:border-ocean-600 outline-none text-slate-900"
                  />
                ) : (
                  <p className={`text-2xl font-black ${accentColor}`}>{course.targetYear}</p>
                )}
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/50 min-w-[120px]">
                <p className="text-xs font-bold text-gray-500 uppercase">Duration</p>
                {isAdminMode ? (
                  <input
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full text-2xl font-black bg-transparent border-b border-gray-300 focus:border-ocean-600 outline-none text-slate-900"
                  />
                ) : (
                  <p className={`text-2xl font-black ${accentColor}`}>{course.duration}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: Details */}
          <div className="lg:col-span-2 space-y-8">

            {/* Batch Info Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className={`w-6 h-6 mr-3 ${accentColor}`} /> Batch Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-sm text-gray-500 font-bold mb-1">Starting Date</p>
                  {isAdminMode ? (
                    <input
                      name="batchDate"
                      value={formData.batchDate || ''}
                      onChange={handleInputChange}
                      className="w-full text-lg font-bold bg-white border border-gray-300 rounded px-2 py-1 text-slate-900"
                    />
                  ) : (
                    <p className="text-lg font-bold text-gray-900">{course.batchDate}</p>
                  )}
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-sm text-gray-500 font-bold mb-1">Ending Date (Tentative)</p>
                  {isAdminMode ? (
                    <input
                      name="endDate"
                      value={formData.endDate || ''}
                      onChange={handleInputChange}
                      className="w-full text-lg font-bold bg-white border border-gray-300 rounded px-2 py-1 text-slate-900"
                    />
                  ) : (
                    <p className="text-lg font-bold text-gray-900">{course.endDate || 'March ' + course.targetYear}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircle2 className={`w-6 h-6 mr-3 ${accentColor}`} /> Key Highlights
              </h3>
              <ul className="space-y-4">
                {(isAdminMode ? formData.features : course.features).map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className={`mt-1 mr-3 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${course.colorTheme === 'red' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      <CheckCircle2 size={12} strokeWidth={4} />
                    </div>
                    {isAdminMode ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          value={feature}
                          onChange={(e) => handleArrayChange('features', idx, e.target.value)}
                          className="flex-1 text-lg font-medium border-b border-gray-300 focus:border-ocean-600 outline-none bg-white text-slate-900"
                        />
                        <button onClick={() => handleRemoveArrayItem('features', idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-lg text-gray-700 font-medium">{feature}</span>
                    )}
                  </li>
                ))}

                {isAdminMode && (
                  <button onClick={() => handleAddArrayItem('features')} className="flex items-center gap-2 text-ocean-600 font-bold mt-2 hover:bg-ocean-50 px-3 py-2 rounded-lg">
                    <Plus className="w-4 h-4" /> Add Highlight
                  </button>
                )}

                {/* Static highlights for display only if not admin mode editing */}
                {!isAdminMode && (
                  <>
                    <li className="flex items-start">
                      <div className={`mt-1 mr-3 w-5 h-5 rounded-full flex items-center justify-center bg-gray-100 text-gray-600`}>
                        <CheckCircle2 size={12} strokeWidth={4} />
                      </div>
                      <span className="text-lg text-gray-700 font-medium"> Comprehensive study material (Printed + Digital)</span>
                    </li>
                    <li className="flex items-start">
                      <div className={`mt-1 mr-3 w-5 h-5 rounded-full flex items-center justify-center bg-gray-100 text-gray-600`}>
                        <CheckCircle2 size={12} strokeWidth={4} />
                      </div>
                      <span className="text-lg text-gray-700 font-medium"> Regular Parent-Teacher Meetings</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Faculty */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className={`w-6 h-6 mr-3 ${accentColor}`} /> Expert Faculty
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(isAdminMode ? (formData.faculty || []) : (course.faculty || [])).map((fac, idx) => (
                  <div key={idx} className="flex items-center p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm mr-4 shrink-0">
                      {fac.charAt(0)}
                    </div>
                    {isAdminMode ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          value={fac}
                          onChange={(e) => handleArrayChange('faculty', idx, e.target.value)}
                          className="flex-1 font-bold border-b border-gray-300 focus:border-ocean-600 outline-none bg-transparent text-slate-900"
                        />
                        <button onClick={() => handleRemoveArrayItem('faculty', idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-bold text-gray-800">{fac}</span>
                    )}
                  </div>
                ))}

                {isAdminMode && (
                  <button onClick={() => handleAddArrayItem('faculty')} className="flex items-center justify-center gap-2 text-ocean-600 font-bold p-4 border-2 border-dashed border-ocean-200 rounded-2xl hover:bg-ocean-50">
                    <Plus className="w-4 h-4" /> Add Faculty
                  </button>
                )}

                {(!course.faculty || course.faculty.length === 0) && !isAdminMode && <p className="text-gray-500">Faculty details will be updated shortly.</p>}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Pricing & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sticky top-24">
              <h3 className="text-xl font-bold text-gray-500 mb-2 uppercase tracking-wide">Course Fee</h3>
              <div className="flex items-baseline mb-1">
                {isAdminMode ? (
                  <input
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="text-4xl font-extrabold text-slate-900 w-full border-b border-gray-300 focus:border-ocean-600 outline-none bg-white"
                  />
                ) : (
                  <span className="text-4xl font-extrabold text-slate-900">{course.price}</span>
                )}
                {!isAdminMode && <span className="text-gray-400 text-sm ml-2 font-medium">/ year</span>}
              </div>
              <p className="text-sm text-green-600 font-bold mb-8">EMI Options Available</p>

              <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl mb-8">
                <p className="text-yellow-800 font-bold text-sm mb-1 uppercase">Registration Fee</p>
                {isAdminMode ? (
                  <input
                    name="registrationFee"
                    value={formData.registrationFee || '₹ 10,000'}
                    onChange={handleInputChange}
                    className="text-2xl font-black text-slate-900 w-full border-b border-yellow-300 bg-transparent focus:border-yellow-600 outline-none"
                  />
                ) : (
                  <p className="text-2xl font-black text-slate-900">{course.registrationFee || '₹ 10,000'}</p>
                )}
                <p className="text-xs text-yellow-700 mt-1">*Adjustable in total fee</p>
              </div>

              <div className="space-y-4">
                <Button size="lg" className="w-full text-lg py-4 rounded-xl shadow-lg shadow-ocean-200">
                  <CreditCard className="w-5 h-5 mr-2" /> Pay Registration
                </Button>
                <Link to="/contact" className="block">
                  <Button variant="outline" size="lg" className="w-full text-lg py-4 rounded-xl border-2">
                    <Phone className="w-5 h-5 mr-2" /> Request a Call
                  </Button>
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-400 font-medium">
                  Need help? Call <span className="text-gray-900 font-bold">+91 98765 43210</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default CourseDetails;
