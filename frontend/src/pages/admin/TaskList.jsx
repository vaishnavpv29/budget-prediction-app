import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI } from '../../services/api';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const priorityColors = { low: 'badge-gray', medium: 'badge-info', high: 'badge-warning', critical: 'badge-danger' };
const statusColors = { pending: 'badge-gray', 'in-progress': 'badge-info', completed: 'badge-success', overdue: 'badge-danger' };

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    taskAPI.getAll().then((r) => { setTasks(r.data); setLoading(false); });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedTo?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>All Tasks</h1>
          <p style={styles.subtitle}>{tasks.length} total tasks</p>
        </div>
        <button style={styles.createBtn} onClick={() => navigate('/admin/tasks/new')}>
          <FiPlus size={16} /> Assign Task
        </button>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <FiSearch size={16} style={styles.searchIcon} />
          <input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} style={styles.searchInput} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.filterSelect}>
          <option value="">All Status</option>
          {['pending', 'in-progress', 'completed', 'overdue'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? <div style={styles.loading}>Loading tasks...</div> : (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Task', 'Project', 'Assigned To', 'Priority', 'Due Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t._id} style={styles.tr}>
                  <td style={styles.td}>
                    <p style={styles.taskTitle}>{t.title}</p>
                    {t.githubCommitVerified && <span style={styles.verified}>✓ GitHub Verified</span>}
                  </td>
                  <td style={styles.td}>{t.project?.name}</td>
                  <td style={styles.td}>
                    <div style={styles.assignee}>
                      <div style={styles.assigneeAvatar}>{t.assignedTo?.name?.charAt(0)}</div>
                      {t.assignedTo?.name}
                    </div>
                  </td>
                  <td style={styles.td}><span className={`badge ${priorityColors[t.priority]}`}>{t.priority}</span></td>
                  <td style={styles.td}>{new Date(t.dueDate).toLocaleDateString()}</td>
                  <td style={styles.td}><span className={`badge ${statusColors[t.status]}`}>{t.status}</span></td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button style={styles.actionBtn} onClick={() => navigate(`/admin/tasks/${t._id}/edit`)}><FiEdit2 size={13} /></button>
                      <button style={{ ...styles.actionBtn, color: '#ef4444' }} onClick={() => handleDelete(t._id)}><FiTrash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#9ca3af', padding: 40 }}>No tasks found</td></tr>
              )}
            </tbody>
          </table>
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
  toolbar: { display: 'flex', gap: 12 },
  searchWrap: { position: 'relative', flex: 1, maxWidth: 360 },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' },
  searchInput: { width: '100%', padding: '10px 14px 10px 38px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: '0.875rem', background: 'white', boxSizing: 'border-box' },
  filterSelect: { padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: '0.875rem', background: 'white', cursor: 'pointer' },
  loading: { textAlign: 'center', padding: 60, color: '#6b7280' },
  tableCard: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '12px 16px', fontSize: '0.875rem', color: '#374151' },
  taskTitle: { fontWeight: 600, color: '#111827' },
  verified: { fontSize: '0.7rem', color: '#10b981', fontWeight: 600 },
  assignee: { display: 'flex', alignItems: 'center', gap: 8 },
  assigneeAvatar: { width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 },
  actions: { display: 'flex', gap: 6 },
  actionBtn: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center' },
};

export default TaskList;
