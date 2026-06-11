import { useEffect, useState } from 'react';
import { reportAPI, userAPI } from '../../services/api';
import { FiSearch, FiCheck, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ReportViewer = () => {
  const [reports, setReports] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState({ employee: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([reportAPI.getAll(), userAPI.getAll({ role: 'employee' })]).then(([rRes, eRes]) => {
      setReports(rRes.data);
      setEmployees(eRes.data);
      setLoading(false);
    });
  }, []);

  const handleReview = async (id, status) => {
    const feedback = status === 'approved' ? prompt('Add feedback (optional):') || '' : '';
    try {
      await reportAPI.review(id, { status, adminFeedback: feedback });
      setReports((prev) => prev.map((r) => r._id === id ? { ...r, status, adminFeedback: feedback } : r));
      if (selected?._id === id) setSelected((prev) => ({ ...prev, status, adminFeedback: feedback }));
      toast.success(`Report ${status}`);
    } catch { toast.error('Failed to update report'); }
  };

  const filtered = reports.filter((r) => {
    const matchEmp = !filter.employee || r.employee?._id === filter.employee;
    const matchStatus = !filter.status || r.status === filter.status;
    return matchEmp && matchStatus;
  });

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Weekly Reports</h1>
          <p style={styles.subtitle}>{reports.length} total reports</p>
        </div>
      </div>

      <div style={styles.toolbar}>
        <select value={filter.employee} onChange={(e) => setFilter({ ...filter, employee: e.target.value })} style={styles.select}>
          <option value="">All Employees</option>
          {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} style={styles.select}>
          <option value="">All Status</option>
          {['submitted', 'reviewed', 'approved'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={styles.layout}>
        {/* Report List */}
        <div style={styles.list}>
          {loading ? <div style={styles.loading}>Loading...</div> : filtered.map((r) => (
            <div
              key={r._id}
              style={{ ...styles.reportCard, ...(selected?._id === r._id ? styles.reportCardActive : {}) }}
              onClick={() => setSelected(r)}
            >
              <div style={styles.reportTop}>
                <div style={styles.empAvatar}>{r.employee?.name?.charAt(0)}</div>
                <div style={styles.reportInfo}>
                  <p style={styles.empName}>{r.employee?.name}</p>
                  <p style={styles.reportWeek}>{new Date(r.weekStartDate).toLocaleDateString()} – {new Date(r.weekEndDate).toLocaleDateString()}</p>
                </div>
                <span className={`badge badge-${r.status === 'approved' ? 'success' : r.status === 'reviewed' ? 'info' : 'gray'}`}>{r.status}</span>
              </div>
              <div style={styles.reportMeta}>
                <span>⏱ {r.timeSpent}h</span>
                <span>📦 {r.githubActivity?.commits || 0} commits</span>
                <span>📁 {r.project?.name}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && <div style={styles.empty}>No reports found</div>}
        </div>

        {/* Report Detail */}
        {selected ? (
          <div style={styles.detail}>
            <div style={styles.detailHeader}>
              <div>
                <h3 style={styles.detailTitle}>{selected.employee?.name}'s Report</h3>
                <p style={styles.detailWeek}>{new Date(selected.weekStartDate).toLocaleDateString()} – {new Date(selected.weekEndDate).toLocaleDateString()}</p>
              </div>
              {selected.status === 'submitted' && (
                <div style={styles.reviewBtns}>
                  <button style={styles.reviewBtn} onClick={() => handleReview(selected._id, 'reviewed')}>Mark Reviewed</button>
                  <button style={styles.approveBtn} onClick={() => handleReview(selected._id, 'approved')}><FiCheck size={14} /> Approve</button>
                </div>
              )}
            </div>

            <div style={styles.detailGrid}>
              <div style={styles.detailSection}>
                <p style={styles.detailLabel}>Work Completed</p>
                <p style={styles.detailText}>{selected.workCompleted}</p>
              </div>
              <div style={styles.detailSection}>
                <p style={styles.detailLabel}>Pending Tasks</p>
                <p style={styles.detailText}>{selected.pendingTasks || 'None'}</p>
              </div>
              <div style={styles.detailSection}>
                <p style={styles.detailLabel}>Challenges</p>
                <p style={styles.detailText}>{selected.challenges || 'None'}</p>
              </div>
              <div style={styles.detailSection}>
                <p style={styles.detailLabel}>Next Week Plan</p>
                <p style={styles.detailText}>{selected.nextWeekPlan || 'Not specified'}</p>
              </div>
            </div>

            <div style={styles.githubStats}>
              <h4 style={styles.statsTitle}>GitHub Activity</h4>
              <div style={styles.statsGrid}>
                {[
                  { label: 'Commits', value: selected.githubActivity?.commits || 0 },
                  { label: 'Pull Requests', value: selected.githubActivity?.pullRequests || 0 },
                  { label: 'Hours Spent', value: `${selected.timeSpent}h` },
                ].map((s) => (
                  <div key={s.label} style={styles.statItem}>
                    <p style={styles.statValue}>{s.value}</p>
                    <p style={styles.statLabel}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {selected.adminFeedback && (
              <div style={styles.feedback}>
                <p style={styles.feedbackLabel}>Admin Feedback</p>
                <p style={styles.feedbackText}>{selected.adminFeedback}</p>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.noSelection}>
            <FiEye size={32} color="#d1d5db" />
            <p>Select a report to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 20 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#111827' },
  subtitle: { color: '#6b7280', fontSize: '0.875rem', marginTop: 4 },
  toolbar: { display: 'flex', gap: 12 },
  select: { padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: '0.875rem', background: 'white', cursor: 'pointer' },
  layout: { display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  loading: { textAlign: 'center', padding: 40, color: '#6b7280' },
  empty: { textAlign: 'center', padding: 40, color: '#9ca3af' },
  reportCard: { background: 'white', borderRadius: 10, border: '1.5px solid #e5e7eb', padding: '14px', cursor: 'pointer', transition: 'all 0.15s' },
  reportCardActive: { border: '1.5px solid #1a56db', background: '#eff6ff' },
  reportTop: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  empAvatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 },
  reportInfo: { flex: 1 },
  empName: { fontWeight: 700, fontSize: '0.875rem', color: '#111827' },
  reportWeek: { fontSize: '0.75rem', color: '#6b7280' },
  reportMeta: { display: 'flex', gap: 12, fontSize: '0.75rem', color: '#6b7280' },
  detail: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 },
  detailHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  detailTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#111827' },
  detailWeek: { fontSize: '0.8rem', color: '#6b7280', marginTop: 4 },
  reviewBtns: { display: 'flex', gap: 8 },
  reviewBtn: { padding: '7px 14px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', color: '#374151' },
  approveBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#10b981', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  detailSection: { background: '#f9fafb', borderRadius: 8, padding: '14px' },
  detailLabel: { fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
  detailText: { fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 },
  githubStats: { background: '#f0f9ff', borderRadius: 10, padding: '16px', border: '1px solid #bae6fd' },
  statsTitle: { fontSize: '0.875rem', fontWeight: 700, color: '#0369a1', marginBottom: 12 },
  statsGrid: { display: 'flex', gap: 24 },
  statItem: { textAlign: 'center' },
  statValue: { fontSize: '1.5rem', fontWeight: 800, color: '#0369a1' },
  statLabel: { fontSize: '0.75rem', color: '#0ea5e9' },
  feedback: { background: '#f0fdf4', borderRadius: 8, padding: '14px', border: '1px solid #bbf7d0' },
  feedbackLabel: { fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: 6 },
  feedbackText: { fontSize: '0.875rem', color: '#15803d' },
  noSelection: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 60, color: '#9ca3af', background: 'white', borderRadius: 12, border: '1px solid #e5e7eb' },
};

export default ReportViewer;
