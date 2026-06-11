import { useEffect, useState } from 'react';
import { taskAPI, projectAPI, reportAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/Card';
import { FiCheckSquare, FiClock, FiFolder, FiFileText, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      taskAPI.getAll(),
      projectAPI.getAll(),
      reportAPI.getAll(),
    ]).then(([tRes, pRes, rRes]) => {
      setTasks(tRes.data);
      setProjects(pRes.data);
      setReports(rRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  const pending = tasks.filter((t) => t.status === 'pending');
  const inProgress = tasks.filter((t) => t.status === 'in-progress');
  const completed = tasks.filter((t) => t.status === 'completed');
  const overdue = tasks.filter((t) => t.status === 'overdue');

  const upcomingTasks = tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.welcome}>
        <div>
          <h1 style={styles.title}>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p style={styles.subtitle}>Here's your work overview for today</p>
        </div>
        <button style={styles.reportBtn} onClick={() => navigate('/employee/reports/new')}>
          + Submit Weekly Report
        </button>
      </div>

      <div style={styles.statsGrid}>
        <StatCard icon={FiClock} label="Pending Tasks" value={pending.length} color="#f59e0b" />
        <StatCard icon={FiCheckSquare} label="In Progress" value={inProgress.length} color="#1a56db" />
        <StatCard icon={FiCheckSquare} label="Completed" value={completed.length} color="#10b981" />
        <StatCard icon={FiAlertCircle} label="Overdue" value={overdue.length} color="#ef4444" />
        <StatCard icon={FiFolder} label="My Projects" value={projects.length} color="#8b5cf6" />
        <StatCard icon={FiFileText} label="Reports Submitted" value={reports.length} color="#0ea5e9" />
      </div>

      <div style={styles.twoCol}>
        {/* Upcoming Tasks */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Upcoming Tasks</h3>
            <button style={styles.viewAllBtn} onClick={() => navigate('/employee/tasks')}>View All</button>
          </div>
          <div style={styles.taskList}>
            {upcomingTasks.map((t) => {
              const daysLeft = Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div key={t._id} style={styles.taskItem}>
                  <div style={{ ...styles.priorityDot, background: t.priority === 'critical' ? '#ef4444' : t.priority === 'high' ? '#f59e0b' : t.priority === 'medium' ? '#1a56db' : '#9ca3af' }} />
                  <div style={styles.taskInfo}>
                    <p style={styles.taskTitle}>{t.title}</p>
                    <p style={styles.taskMeta}>{t.project?.name}</p>
                  </div>
                  <div style={styles.taskRight}>
                    <span style={{ ...styles.daysLeft, color: daysLeft < 3 ? '#ef4444' : daysLeft < 7 ? '#f59e0b' : '#6b7280' }}>
                      {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                    </span>
                    <span className={`badge badge-${t.status === 'in-progress' ? 'info' : 'gray'}`}>{t.status}</span>
                  </div>
                </div>
              );
            })}
            {upcomingTasks.length === 0 && <p style={styles.empty}>No pending tasks 🎉</p>}
          </div>
        </div>

        {/* My Projects */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>My Projects</h3>
            <button style={styles.viewAllBtn} onClick={() => navigate('/employee/projects')}>View All</button>
          </div>
          <div style={styles.projectList}>
            {projects.map((p) => (
              <div key={p._id} style={styles.projectItem}>
                <div style={styles.projectIcon}>
                  {p.type.charAt(0).toUpperCase()}
                </div>
                <div style={styles.projectInfo}>
                  <p style={styles.projectName}>{p.name}</p>
                  <div style={styles.progressRow}>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${p.completionPercentage || 0}%` }} />
                    </div>
                    <span style={styles.progressPct}>{p.completionPercentage || 0}%</span>
                  </div>
                </div>
                <span className={`badge badge-${p.riskLevel === 'high' ? 'danger' : p.riskLevel === 'medium' ? 'warning' : 'success'}`}>
                  {p.riskLevel}
                </span>
              </div>
            ))}
            {projects.length === 0 && <p style={styles.empty}>No projects assigned yet</p>}
          </div>
        </div>
      </div>

      {/* GitHub reminder */}
      {!user?.githubUsername && (
        <div style={styles.githubBanner}>
          <span style={styles.githubIcon}>🐙</span>
          <div>
            <p style={styles.githubTitle}>Connect your GitHub account</p>
            <p style={styles.githubText}>Add your GitHub username to enable commit tracking and task verification</p>
          </div>
          <button style={styles.githubBtn} onClick={() => navigate('/profile')}>Update Profile</button>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 24 },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#6b7280' },
  welcome: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#111827' },
  subtitle: { color: '#6b7280', fontSize: '0.9rem', marginTop: 4 },
  reportBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  cardTitle: { fontSize: '1rem', fontWeight: 700, color: '#111827' },
  viewAllBtn: { background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '5px 12px', fontSize: '0.8rem', color: '#1a56db', cursor: 'pointer', fontWeight: 600 },
  taskList: { display: 'flex', flexDirection: 'column', gap: 10 },
  taskItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px', background: '#f9fafb', borderRadius: 8 },
  priorityDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: '0.875rem', fontWeight: 600, color: '#111827' },
  taskMeta: { fontSize: '0.75rem', color: '#6b7280', marginTop: 2 },
  taskRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  daysLeft: { fontSize: '0.75rem', fontWeight: 600 },
  empty: { color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: 20 },
  projectList: { display: 'flex', flexDirection: 'column', gap: 12 },
  projectItem: { display: 'flex', alignItems: 'center', gap: 12 },
  projectIcon: { width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 },
  projectInfo: { flex: 1 },
  projectName: { fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: 4 },
  progressRow: { display: 'flex', alignItems: 'center', gap: 8 },
  progressBar: { flex: 1, height: 5, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #1a56db, #0ea5e9)', borderRadius: 3 },
  progressPct: { fontSize: '0.7rem', color: '#6b7280', fontWeight: 600, minWidth: 28 },
  githubBanner: { display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', borderRadius: 12, border: '1px solid #bae6fd' },
  githubIcon: { fontSize: '1.5rem' },
  githubTitle: { fontWeight: 700, color: '#0369a1', fontSize: '0.9rem' },
  githubText: { fontSize: '0.8rem', color: '#0ea5e9', marginTop: 2 },
  githubBtn: { padding: '8px 16px', background: '#0369a1', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' },
};

export default EmployeeDashboard;
