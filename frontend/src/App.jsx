import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobProvider } from './context/JobContext';

// Layout Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Navbar from './components/common/Navbar';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Home from './pages/Home';
import JobSearch from './pages/JobSearch';
import { JobDetails } from './pages/JobDetails';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Job Seeker Components
import JobSeekerDashboard from './components/jobseeker/Dashboard';
import JobSeekerProfile from './components/jobseeker/Profile';
import ResumeUpload from './components/jobseeker/ResumeUpload';
import JobApplications from './components/jobseeker/JobApplications';

// Recruiter Components
import RecruiterDashboard from './components/recruiter/Dashboard';
import RecruiterProfile from './components/recruiter/Profile';
import PostJob from './components/recruiter/PostJob';
import ManageJobs from './components/recruiter/ManageJobs';
import ViewCandidates from './components/recruiter/ViewCandidates';
import CandidateSourcing from './components/recruiter/CandidateSourcing';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <Navbar />
        <main className="flex-grow">
          <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              {/* Protected Public Routes */}
              <Route path="/jobs" element={
                <ProtectedRoute>
                  <JobSearch />
                </ProtectedRoute>
              } />
              <Route path="/jobs/:id" element={
                <ProtectedRoute>
                  <JobDetails />
                </ProtectedRoute>
              } />


            {/* Auth Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />

            {/* Job Seeker Routes */}
            <Route path="/jobseeker/dashboard" element={
              <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                <JobSeekerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/jobseeker/profile" element={
              <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                <JobSeekerProfile />
              </ProtectedRoute>
            } />
            <Route path="/jobseeker/resume" element={
              <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                <ResumeUpload />
              </ProtectedRoute>
            } />
            <Route path="/jobseeker/applications" element={
              <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                <JobApplications />
              </ProtectedRoute>
            } />

            {/* Recruiter Routes */}
            <Route path="/recruiter/dashboard" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/profile" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <RecruiterProfile />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/post-job" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <PostJob />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/jobs" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <ManageJobs />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/candidates" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <ViewCandidates />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/sourcing" element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <CandidateSourcing />
              </ProtectedRoute>
            } />


            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <AppContent />
      </JobProvider>
    </AuthProvider>
  );
}

export default App;
