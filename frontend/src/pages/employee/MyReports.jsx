import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportAPI } from '../../services/api';
import { FiPlus } from 'react-icons/fi';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    reportAPI.getAll().then((r) => { setReports(r.data); setLoading(false); });
  }, []);

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Weekly Reports</h1>
          <p style={styles.subtitle}>{reports.length} reports submitted</p>
        </div>
        <button style={styles.createBtn} onClick={() => navigate('/employee/reports/new')}>
          <FiPlus size={16} /> New Report
        </button>
      </div>

      {loading ? <div style={styles.loading}>Loading...</div> : (
        <div style={styles.list}>
          {reports.map((r) => (
            <div key={r._id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <p style={styles.week}>
                    {new Date(r.weekStartDate).toLocaleDateString()} – {new Date(r.weekEndDate).toLocaleDateString()}
                  </p>
                  <p style={styles.project}>{r.project?.name}</p>
                </div>
                <span className={`badge badge-${r.status === 'approved' ? 'success' : r.status === 'reviewed' ? 'info' : 'gray'}`}>
                  {r.status}
                </span>
              </div>

              <p style={styles.workSummary}>{r.workCompleted.slice(0, 150)}{r.workCompleted.length > 150 ? '...' : ''}</p>

              <div style={styles.stats}>
                <div style={styles.stat}>
                  <span style={styles.statValue}>{r.timeSpent}h</span>
                  <span style={styles.statLabel}>Hours</span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statValue}>{r.githubActivity?.commits || 0}</span>
                  <span style={styles.statLabel}>Commits</span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statValue}>{r.tasksCompleted?.length || 0}</span>
                  <span style={styles.statLabel}>Tasks Done</span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statValue}>{r.githubActivity?.pullRequests || 0}</span>
                  <span style={styles.statLabel}>PRs</span>
                </div>
              </div>

              {r.adminFeedback && (
                <div style={styles.feedback}>
                  <p style={styles.feedbackLabel}>Admin Feedback</p>
                  <p style={styles.feedbackText}>{r.adminFeedback}</p>
                </div>
              )}
            </div>
          ))}
          {reports.length === 0 && (
            <div style={styles.empty}>
              <p>No reports submitted yet</p>
              <button style={styles.createBtn} onClick={() => navigate('/employee/reports/new')}>Submit First Report</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 20 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#111827' },
  subtitle: { color: '#6b7280', fontSize: '0.875rem', marginTop: 4 },
  createBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' },
  loading: { textAlign: 'center', padding: 60, color: '#6b7280' },
  list: { display: 'flex', flexDirection: 'column', gap: 16 },
  card: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 },
  cardTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  week: { fontWeight: 700, color: '#111827', fontSize: '0.95rem' },
  project: { fontSize: '0.8rem', color: '#6b7280', marginTop: 2 },
  workSummary: { fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 },
  stats: { display: 'flex', gap: 24, padding: '12px 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  statValue: { fontSize: '1.25rem', fontWeight: 800, color: '#1a56db' },
  statLabel: { fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' },
  feedback: { background: '#f0fdf4', borderRadius: 8, padding: '12px', border: '1px solid #bbf7d0' },
  feedbackLabel: { fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: 4 },
  feedbackText: { fontSize: '0.875rem', color: '#15803d' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 60, color: '#9ca3af' },
};

export default MyReports;
