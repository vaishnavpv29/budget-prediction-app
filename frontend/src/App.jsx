import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';

// Auth Pages
import AdminLogin from './pages/auth/AdminLogin';
import EmployeeLogin from './pages/auth/EmployeeLogin';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProjectList from './pages/admin/ProjectList';
import CreateProject from './pages/admin/CreateProject';
import ProjectDetails from './pages/admin/ProjectDetails';
import TaskList from './pages/admin/TaskList';
import AssignTask from './pages/admin/AssignTask';
import EmployeeList from './pages/admin/EmployeeList';
import ReportViewer from './pages/admin/ReportViewer';
import HistoricalData from './pages/admin/HistoricalData';
import CostPrediction from './pages/admin/CostPrediction';
import RiskAnalysis from './pages/admin/RiskAnalysis';
import GitHubTracker from './pages/admin/GitHubTracker';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import TaskUpdate from './pages/employee/TaskUpdate';
import WeeklyReportForm from './pages/employee/WeeklyReportForm';
import MyReports from './pages/employee/MyReports';
import GitHubActivity from './pages/employee/GitHubActivity';

// Shared
import Profile from './pages/Profile';

// Protected Route wrapper
const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/admin/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} replace />;
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={
        user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} replace />
          : <Navigate to="/admin/login" replace />
      } />

      {/* Auth */}
      <Route path="/admin/login" element={user ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />} />
      <Route path="/employee/login" element={user ? <Navigate to="/employee/dashboard" replace /> : <EmployeeLogin />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/projects" element={<ProtectedRoute role="admin"><ProjectList /></ProtectedRoute>} />
      <Route path="/admin/projects/new" element={<ProtectedRoute role="admin"><CreateProject /></ProtectedRoute>} />
      <Route path="/admin/projects/:id" element={<ProtectedRoute role="admin"><ProjectDetails /></ProtectedRoute>} />
      <Route path="/admin/tasks" element={<ProtectedRoute role="admin"><TaskList /></ProtectedRoute>} />
      <Route path="/admin/tasks/new" element={<ProtectedRoute role="admin"><AssignTask /></ProtectedRoute>} />
      <Route path="/admin/employees" element={<ProtectedRoute role="admin"><EmployeeList /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute role="admin"><ReportViewer /></ProtectedRoute>} />
      <Route path="/admin/historical" element={<ProtectedRoute role="admin"><HistoricalData /></ProtectedRoute>} />
      <Route path="/admin/predictions" element={<ProtectedRoute role="admin"><CostPrediction /></ProtectedRoute>} />
      <Route path="/admin/risk" element={<ProtectedRoute role="admin"><RiskAnalysis /></ProtectedRoute>} />
      <Route path="/admin/github" element={<ProtectedRoute role="admin"><GitHubTracker /></ProtectedRoute>} />

      {/* Employee Routes */}
      <Route path="/employee/dashboard" element={<ProtectedRoute role="employee"><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/employee/tasks" element={<ProtectedRoute role="employee"><TaskUpdate /></ProtectedRoute>} />
      <Route path="/employee/projects" element={<ProtectedRoute role="employee"><ProjectList /></ProtectedRoute>} />
      <Route path="/employee/reports" element={<ProtectedRoute role="employee"><MyReports /></ProtectedRoute>} />
      <Route path="/employee/reports/new" element={<ProtectedRoute role="employee"><WeeklyReportForm /></ProtectedRoute>} />
      <Route path="/employee/github" element={<ProtectedRoute role="employee"><GitHubActivity /></ProtectedRoute>} />

      {/* Shared */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' },
            success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
            error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
