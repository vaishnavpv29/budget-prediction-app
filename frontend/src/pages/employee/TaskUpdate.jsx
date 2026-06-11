import { useEffect, useState } from 'react';
import { taskAPI } from '../../services/api';
import { FiSearch, FiGithub, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const priorityColors = { low: 'badge-gray', medium: 'badge-info', high: 'badge-warning', critical: 'badge-danger' };

const TaskUpdate = () => {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: '', progressNotes: '', actualHours: '', githubCommitHash: '' });

  useEffect(() => {
    taskAPI.getAll().then((r) => { setTasks(r.data); setLoading(false); });
  }, []);

  const openUpdate = (task) => {
    setUpdating(task);
    setUpdateForm({ status: task.status, progressNotes: task.progressNotes || '', actualHours: task.actualHours || '', githubCommitHash: '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await taskAPI.update(updating._id, {
        ...updateForm,
        actualHours: Number(updateForm.actualHours) || 0,
      });
      setTasks((prev) => prev.map((t) => t._id === updating._id ? res.data : t));
      toast.success('Task updated!');
      setUpdating(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.project?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <h1 style={styles.title}>My Tasks</h1>
        <p style={styles.subtitle}>{tasks.length} tasks assigned to you</p>
      </div>

      <div style={styles.searchWrap}>
        <FiSearch size={16} style={styles.searchIcon} />
        <input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} style={styles.searchInput} />
      </div>

      {loading ? <div style={styles.loading}>Loading tasks...</div> : (
        <div style={styles.taskGrid}>
          {filtered.map((t) => {
            const daysLeft = Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            return (
              <div key={t._id} style={{ ...styles.taskCard, borderLeft: `4px solid ${t.status === 'completed' ? '#10b981' : t.status === 'overdue' ? '#ef4444' : t.status === 'in-progress' ? '#1a56db' : '#9ca3af'}` }}>
                <div style={styles.taskTop}>
                  <div>
                    <h3 style={styles.taskTitle}>{t.title}</h3>
                    <p style={styles.taskProject}>{t.project?.name}</p>
                  </div>
                  <span className={`badge ${priorityColors[t.priority]}`}>{t.priority}</span>
                </div>

                {t.description && <p style={styles.taskDesc}>{t.description}</p>}

                <div style={styles.taskMeta}>
                  <span style={{ color: daysLeft < 3 ? '#ef4444' : '#6b7280', fontSize: '0.8rem' }}>
                    📅 {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'} · Due {new Date(t.dueDate).toLocaleDateString()}
                  </span>
                  {t.estimatedHours > 0 && <span style={styles.metaItem}>⏱ {t.estimatedHours}h estimated</span>}
                </div>

                {t.githubCommitVerified && (
                  <div style={styles.verified}>
                    <FiGithub size={13} /> <span>GitHub commit verified</span>
                  </div>
                )}

                <div style={styles.taskFooter}>
                  <span className={`badge badge-${t.status === 'completed' ? 'success' : t.status === 'in-progress' ? 'info' : t.status === 'overdue' ? 'danger' : 'gray'}`}>
                    {t.status}
                  </span>
                  {t.status !== 'completed' && (
                    <button style={styles.updateBtn} onClick={() => openUpdate(t)}>Update Progress</button>
                  )}
                  {t.status === 'completed' && (
                    <span style={styles.completedBadge}><FiCheck size={12} /> Completed</span>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={styles.empty}>No tasks found</div>}
        </div>
      )}

      {/* Update Modal */}
      {updating && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Update: {updating.title}</h3>
            <form onSubmit={handleUpdate} style={styles.modalForm}>
              <div style={styles.field}>
                <label style={styles.label}>Status</label>
                <select value={updateForm.status} onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })} style={styles.input}>
                  {['pending', 'in-progress', 'completed'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Progress Notes</label>
                <textarea value={updateForm.progressNotes} onChange={(e) => setUpdateForm({ ...updateForm, progressNotes: e.target.value })} style={{ ...styles.input, height: 80, resize: 'vertical' }} placeholder="What did you work on?" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Actual Hours Spent</label>
                <input type="number" value={updateForm.actualHours} onChange={(e) => setUpdateForm({ ...updateForm, actualHours: e.target.value })} style={styles.input} placeholder="4" min="0" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>GitHub Commit Hash (optional - auto-verifies task)</label>
                <input value={updateForm.githubCommitHash} onChange={(e) => setUpdateForm({ ...updateForm, githubCommitHash: e.target.value })} style={styles.input} placeholder="abc1234..." />
              </div>
              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={() => setUpdating(null)}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>Save Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 20 },
  header: {},
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#111827' },
  subtitle: { color: '#6b7280', fontSize: '0.875rem', marginTop: 4 },
  searchWrap: { position: 'relative', maxWidth: 360 },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' },
  searchInput: { width: '100%', padding: '10px 14px 10px 38px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: '0.875rem', background: 'white', boxSizing: 'border-box' },
  loading: { textAlign: 'center', padding: 60, color: '#6b7280' },
  taskGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  taskCard: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '18px', display: 'flex', flexDirection: 'column', gap: 12 },
  taskTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  taskTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#111827' },
  taskProject: { fontSize: '0.75rem', color: '#6b7280', marginTop: 2 },
  taskDesc: { fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.5 },
  taskMeta: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  metaItem: { fontSize: '0.8rem', color: '#6b7280' },
  verified: { display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#10b981', fontWeight: 600 },
  taskFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #f3f4f6' },
  updateBtn: { padding: '6px 14px', background: '#1a56db', color: 'white', border: 'none', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },
  completedBadge: { display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#10b981', fontWeight: 600 },
  empty: { gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#9ca3af' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'white', borderRadius: 16, padding: '28px', width: '100%', maxWidth: 460 },
  modalTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: 20 },
  modalForm: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#374151' },
  input: { padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: '0.875rem', color: '#111827', background: '#f9fafb', boxSizing: 'border-box' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 },
  cancelBtn: { padding: '9px 18px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 8, fontWeight: 600, cursor: 'pointer', color: '#374151' },
  submitBtn: { padding: '9px 18px', background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
};

export default TaskUpdate;
