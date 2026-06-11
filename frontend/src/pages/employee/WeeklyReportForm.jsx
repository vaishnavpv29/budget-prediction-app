import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportAPI, projectAPI, taskAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

const getWeekDates = () => {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
};

const WeeklyReportForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const week = getWeekDates();

  const [form, setForm] = useState({
    project: '',
    weekStartDate: week.start,
    weekEndDate: week.end,
    workCompleted: '',
    pendingTasks: '',
    timeSpent: '',
    challenges: '',
    nextWeekPlan: '',
    tasksCompleted: [],
  });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([projectAPI.getAll(), taskAPI.getAll()]).then(([pRes, tRes]) => {
      setProjects(pRes.data);
      setTasks(tRes.data.filter((t) => t.status === 'completed' || t.status === 'in-progress'));
    });
  }, []);

  const toggleTask = (id) => {
    setForm((prev) => ({
      ...prev,
      tasksCompleted: prev.tasksCompleted.includes(id)
        ? prev.tasksCompleted.filter((t) => t !== id)
        : [...prev.tasksCompleted, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.project) { toast.error('Please select a project'); return; }
    setLoading(true);
    try {
      await reportAPI.submit({ ...form, timeSpent: Number(form.timeSpent) });
      toast.success('Weekly report submitted!');
      navigate('/employee/reports');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const projectTasks = tasks.filter((t) => !form.project || t.project?._id === form.project);

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/employee/reports')}>
          <FiArrowLeft size={16} /> Back
        </button>
        <h1 style={styles.title}>Submit Weekly Report</h1>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.grid}>
          <div style={styles.col}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Report Details</h3>

              <div style={styles.field}>
                <label style={styles.label}>Project *</label>
                <select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} style={styles.input} required>
                  <option value="">Select project...</option>
                  {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>

              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Week Start</label>
                  <input type="date" value={form.weekStartDate} onChange={(e) => setForm({ ...form, weekStartDate: e.target.value })} style={styles.input} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Week End</label>
                  <input type="date" value={form.weekEndDate} onChange={(e) => setForm({ ...form, weekEndDate: e.target.value })} style={styles.input} />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Hours Spent This Week *</label>
                <input type="number" value={form.timeSpent} onChange={(e) => setForm({ ...form, timeSpent: e.target.value })} style={styles.input} placeholder="40" required min="0" max="168" />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Work Completed *</label>
                <textarea value={form.workCompleted} onChange={(e) => setForm({ ...form, workCompleted: e.target.value })} style={{ ...styles.input, height: 100, resize: 'vertical' }} placeholder="Describe what you accomplished this week..." required />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Pending Tasks</label>
                <textarea value={form.pendingTasks} onChange={(e) => setForm({ ...form, pendingTasks: e.target.value })} style={{ ...styles.input, height: 80, resize: 'vertical' }} placeholder="What's still in progress or blocked?" />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Challenges Faced</label>
                <textarea value={form.challenges} onChange={(e) => setForm({ ...form, challenges: e.target.value })} style={{ ...styles.input, height: 80, resize: 'vertical' }} placeholder="Any blockers or difficulties?" />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Next Week Plan</label>
                <textarea value={form.nextWeekPlan} onChange={(e) => setForm({ ...form, nextWeekPlan: e.target.value })} style={{ ...styles.input, height: 80, resize: 'vertical' }} placeholder="What will you work on next week?" />
              </div>
            </div>
          </div>

          <div style={styles.col}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Tasks Completed This Week</h3>
              <p style={styles.sectionSub}>{form.tasksCompleted.length} selected</p>
              <div style={styles.taskList}>
                {projectTasks.map((t) => (
                  <div
                    key={t._id}
                    style={{ ...styles.taskItem, ...(form.tasksCompleted.includes(t._id) ? styles.taskSelected : {}) }}
                    onClick={() => toggleTask(t._id)}
                  >
                    <div style={{ ...styles.checkbox, ...(form.tasksCompleted.includes(t._id) ? styles.checkboxChecked : {}) }}>
                      {form.tasksCompleted.includes(t._id) && '✓'}
                    </div>
                    <div style={styles.taskInfo}>
                      <p style={styles.taskTitle}>{t.title}</p>
                      <p style={styles.taskMeta}>{t.project?.name} · {t.status}</p>
                    </div>
                  </div>
                ))}
                {projectTasks.length === 0 && (
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: 20 }}>
                    {form.project ? 'No tasks found for this project' : 'Select a project to see tasks'}
                  </p>
                )}
              </div>
            </div>

            {user?.githubUsername && (
              <div style={styles.githubNote}>
                <p style={styles.githubTitle}>🐙 GitHub Activity Auto-Fetched</p>
                <p style={styles.githubText}>
                  Your GitHub activity for @{user.githubUsername} will be automatically fetched and included in this report.
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={styles.formFooter}>
          <button type="button" style={styles.cancelBtn} onClick={() => navigate('/employee/reports')}>Cancel</button>
          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? <span className="spinner" /> : <><FiSave size={16} /> Submit Report</>}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 24 },
  header: { display: 'flex', alignItems: 'center', gap: 16 },
  backBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: '#374151', fontSize: '0.875rem' },
  title: { fontSize: '1.5rem', fontWeight: 800, color: '#111827' },
  form: {},
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 },
  col: { display: 'flex', flexDirection: 'column', gap: 20 },
  section: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#111827' },
  sectionSub: { fontSize: '0.8rem', color: '#6b7280', marginTop: -8 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#374151' },
  input: { padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: '0.875rem', color: '#111827', background: '#f9fafb', width: '100%', boxSizing: 'border-box' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  taskList: { display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' },
  taskItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', cursor: 'pointer' },
  taskSelected: { border: '1.5px solid #1a56db', background: '#eff6ff' },
  checkbox: { width: 18, height: 18, borderRadius: 4, border: '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 },
  checkboxChecked: { background: '#1a56db', border: '2px solid #1a56db', color: 'white' },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: '0.875rem', fontWeight: 600, color: '#111827' },
  taskMeta: { fontSize: '0.75rem', color: '#6b7280', marginTop: 2 },
  githubNote: { background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', borderRadius: 10, padding: '16px', border: '1px solid #bae6fd' },
  githubTitle: { fontWeight: 700, fontSize: '0.875rem', color: '#0369a1' },
  githubText: { fontSize: '0.8rem', color: '#0ea5e9', marginTop: 4, lineHeight: 1.5 },
  formFooter: { display: 'flex', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { padding: '11px 24px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, fontWeight: 600, cursor: 'pointer', color: '#374151' },
  submitBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '11px 28px', background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' },
};

export default WeeklyReportForm;
