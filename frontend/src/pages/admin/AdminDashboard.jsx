import { useEffect, useState } from 'react';
import { projectAPI, taskAPI, userAPI, reportAPI } from '../../services/api';
import { StatCard } from '../../components/common/Card';
import { formatINR } from '../../utils/currency';
import {
  FiFolder, FiCheckSquare, FiUsers, FiAlertTriangle,
  FiTrendingUp, FiClock, FiDollarSign, FiActivity,
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#1a56db', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, tasksRes, empRes, repRes] = await Promise.all([
          projectAPI.getStats(),
          taskAPI.getAll(),
          userAPI.getAll({ role: 'employee' }),
          reportAPI.getAll(),
        ]);
        setStats(statsRes.data);
        setTasks(tasksRes.data);
        setEmployees(empRes.data);
        setReports(repRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  const taskStatusData = [
    { name: 'Pending', value: tasks.filter((t) => t.status === 'pending').length },
    { name: 'In Progress', value: tasks.filter((t) => t.status === 'in-progress').length },
    { name: 'Completed', value: tasks.filter((t) => t.status === 'completed').length },
    { name: 'Overdue', value: tasks.filter((t) => t.status === 'overdue').length },
  ].filter((d) => d.value > 0);

  const projectStatusData = stats?.projects?.map((p) => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
    completion: p.completionPercentage,
  })) || [];

  const riskProjects = stats?.projects?.filter((p) => p.riskLevel === 'high') || [];

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Admin Dashboard</h1>
          <p style={styles.pageSubtitle}>Overview of all projects, tasks, and team performance</p>
        </div>
        <button style={styles.createBtn} onClick={() => navigate('/admin/projects/new')}>
          + New Project
        </button>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <StatCard icon={FiFolder} label="Total Projects" value={stats?.total || 0} color="#1a56db" />
        <StatCard icon={FiActivity} label="In Progress" value={stats?.inProgress || 0} color="#0ea5e9" />
        <StatCard icon={FiCheckSquare} label="Completed" value={stats?.completed || 0} color="#10b981" />
        <StatCard icon={FiAlertTriangle} label="At Risk" value={(stats?.atRisk || 0) + (stats?.delayed || 0)} color="#ef4444" />
        <StatCard icon={FiUsers} label="Employees" value={employees.length} color="#8b5cf6" />
        <StatCard icon={FiFileText} label="Reports This Week" value={reports.filter(r => {
          const d = new Date(r.createdAt);
          const now = new Date();
          return (now - d) < 7 * 24 * 60 * 60 * 1000;
        }).length} color="#f59e0b" />
      </div>

      {/* Charts Row */}
      <div style={styles.chartsRow}>
        {/* Project Completion Bar Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Project Completion (%)</h3>
          {projectStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projectStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="completion" fill="#1a56db" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.emptyChart}>No project data yet</div>
          )}
        </div>

        {/* Task Status Pie Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Task Status Distribution</h3>
          {taskStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={taskStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {taskStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.emptyChart}>No task data yet</div>
          )}
        </div>
      </div>

      {/* Risk Alerts */}
      {riskProjects.length > 0 && (
        <div style={styles.riskSection}>
          <h3 style={styles.sectionTitle}>
            <FiAlertTriangle color="#ef4444" /> High Risk Projects
          </h3>
          <div style={styles.riskList}>
            {riskProjects.map((p) => (
              <div key={p._id} style={styles.riskCard} onClick={() => navigate(`/admin/projects/${p._id}`)}>
                <div style={styles.riskDot} />
                <div>
                  <p style={styles.riskName}>{p.name}</p>
                  <p style={styles.riskMeta}>
                    Budget: {formatINR(p.budget)} · Predicted: {formatINR(p.predictedCost)}
                  </p>
                </div>
                <span className="badge badge-danger">High Risk</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Reports */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.sectionTitle}>Recent Weekly Reports</h3>
          <button style={styles.viewAllBtn} onClick={() => navigate('/admin/reports')}>View All</button>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              {['Employee', 'Project', 'Week', 'Hours', 'Commits', 'Status'].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.slice(0, 5).map((r) => (
              <tr key={r._id} style={styles.tr}>
                <td style={styles.td}>{r.employee?.name}</td>
                <td style={styles.td}>{r.project?.name}</td>
                <td style={styles.td}>{new Date(r.weekStartDate).toLocaleDateString()}</td>
                <td style={styles.td}>{r.timeSpent}h</td>
                <td style={styles.td}>{r.githubActivity?.commits || 0}</td>
                <td style={styles.td}>
                  <span className={`badge badge-${r.status === 'approved' ? 'success' : r.status === 'reviewed' ? 'info' : 'gray'}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr><td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#9ca3af' }}>No reports yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Alias for icon
const FiFileText = FiCheckSquare;

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 24 },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#6b7280' },
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: { fontSize: '1.75rem', fontWeight: 800, color: '#111827' },
  pageSubtitle: { color: '#6b7280', fontSize: '0.9rem', marginTop: 4 },
  createBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16,
  },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  chartCard: {
    background: 'white',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  chartTitle: { fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: 16 },
  emptyChart: { height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' },
  riskSection: {
    background: 'white',
    borderRadius: 12,
    border: '1px solid #fee2e2',
    padding: '20px',
  },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  riskList: { display: 'flex', flexDirection: 'column', gap: 10 },
  riskCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: '#fff5f5',
    borderRadius: 8,
    cursor: 'pointer',
    border: '1px solid #fee2e2',
  },
  riskDot: { width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0 },
  riskName: { fontWeight: 600, fontSize: '0.9rem', color: '#111827' },
  riskMeta: { fontSize: '0.8rem', color: '#6b7280', marginTop: 2 },
  tableCard: {
    background: 'white',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  tableHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  viewAllBtn: {
    background: 'none',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: '0.8rem',
    color: '#1a56db',
    cursor: 'pointer',
    fontWeight: 600,
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', borderBottom: '1px solid #f3f4f6', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid #f9fafb' },
  td: { padding: '12px 12px', fontSize: '0.875rem', color: '#374151' },
};

export default AdminDashboard;
