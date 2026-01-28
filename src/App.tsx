
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Resources from './pages/Resources';
import Contact from './pages/Contact';
import Results from './pages/Results';
import CourseDetails from './pages/CourseDetails';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import BatchDetail from './pages/dashboard/BatchDetail';
import BatchLibrary from './pages/dashboard/BatchLibrary';
import TeacherBatchDetail from './pages/dashboard/teacher/TeacherBatchDetail';
import TeacherBatchLibrary from './pages/dashboard/teacher/TeacherBatchLibrary';
import BatchStudents from './pages/dashboard/teacher/BatchStudents';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// ScrollToTop component to ensure pages start at the top on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Layout for Public Pages (Navbar + Footer)
const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/results" element={<Results />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Main App Component with Router
const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Dashboard Routes (Protected) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<StudentDashboard />} />
              <Route path="resources" element={<Resources />} />
              
              {/* Student Routes */}
              <Route path="batch/:batchId" element={<BatchDetail />} />
              <Route path="batch/:batchId/library" element={<BatchLibrary />} />

              {/* Teacher Routes */}
              <Route path="teacher/batch/:batchId" element={<TeacherBatchDetail />} />
              <Route path="teacher/batch/:batchId/library" element={<TeacherBatchLibrary />} />
              <Route path="teacher/batch/:batchId/students" element={<BatchStudents />} />
            </Route>

            {/* Public Routes */}
            <Route path="/*" element={<PublicLayout />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
