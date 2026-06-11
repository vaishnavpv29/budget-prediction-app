import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { taskAPI, projectAPI, userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

const AssignTask = () => {
  const [form, setForm] = useState({
    title: '', description: '', project: '', assignedTo: '',
    priority: 'medium', dueDate: '', estimatedHours: '', tags: '',
  });
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const projectId = searchParams.get('project');
    if (projectId) setForm((prev) => ({ ...prev, project: projectId }));

    Promise.all([
      projectAPI.getAll(),
      userAPI.getAll({ role: 'employee' }),
    ]).then(([projRes, empRes]) => {
      setProjects(projRes.data);
      setEmployees(empRes.data);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await taskAPI.create({
        ...form,
        estimatedHours: Number(form.estimatedHours) || 0,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
      });
      toast.success('Task assigned successfully!');
      navigate(form.project ? `/admin/projects/${form.project}` : '/admin/tasks');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <FiArrowLeft size={16} /> Back
        </button>
        <h1 style={styles.title}>Assign New Task</h1>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.card}>
          <div style={styles.grid}>
            <div style={styles.field}>
              <label style={styles.label}>Task Title *</label>
              <input name="title" value={form.title} onChange={handleChange} style={styles.input} placeholder="e.g. Implement user authentication" required />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Project *</label>
              <select name="project" value={form.project} onChange={handleChange} style={styles.input} required>
                <option value="">Select project...</option>
                {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Assign To *</label>
              <select name="assignedTo" value={form.assignedTo} onChange={handleChange} style={styles.input} required>
                <option value="">Select employee...</option>
                {employees.map((e) => <option key={e._id} value={e._id}>{e.name} ({e.email})</option>)}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} style={styles.input}>
                {['low', 'medium', 'high', 'critical'].map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Due Date *</label>
              <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} style={styles.input} required />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Estimated Hours</label>
              <input name="estimatedHours" type="number" value={form.estimatedHours} onChange={handleChange} style={styles.input} placeholder="8" min="0" />
            </div>

            <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
              <label style={styles.label}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} style={{ ...styles.input, height: 100, resize: 'vertical' }} placeholder="Detailed task description..." />
            </div>

            <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
              <label style={styles.label}>Tags (comma-separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange} style={styles.input} placeholder="frontend, react, auth" />
            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" style={styles.cancelBtn} onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? <span className="spinner" /> : <><FiSave size={16} /> Assign Task</>}
            </button>
          </div>
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
  card: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '28px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#374151' },
  input: { padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: '0.875rem', color: '#111827', background: '#f9fafb', width: '100%', boxSizing: 'border-box' },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 20, borderTop: '1px solid #f3f4f6' },
  cancelBtn: { padding: '10px 24px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, fontWeight: 600, cursor: 'pointer', color: '#374151' },
  submitBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' },
};

export default AssignTask;
