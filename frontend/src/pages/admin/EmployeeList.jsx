import { useEffect, useState } from 'react';
import { userAPI, authAPI } from '../../services/api';
import { FiPlus, FiSearch, FiTrash2, FiGithub } from 'react-icons/fi';
import toast from 'react-hot-toast';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', githubUsername: '', department: '', skills: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    userAPI.getAll({ role: 'employee' }).then((r) => { setEmployees(r.data); setLoading(false); });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await authAPI.register({
        ...form,
        role: 'employee',
        skills: form.skills ? form.skills.split(',').map((s) => s.trim()) : [],
      });
      toast.success('Employee created!');
      setShowModal(false);
      setForm({ name: '', email: '', password: '', githubUsername: '', department: '', skills: '' });
      const res = await userAPI.getAll({ role: 'employee' });
      setEmployees(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try {
      await userAPI.delete(id);
      setEmployees((prev) => prev.filter((e) => e._id !== id));
      toast.success('Employee deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Employees</h1>
          <p style={styles.subtitle}>{employees.length} team members</p>
        </div>
        <button style={styles.createBtn} onClick={() => setShowModal(true)}>
          <FiPlus size={16} /> Add Employee
        </button>
      </div>

      <div style={styles.searchWrap}>
        <FiSearch size={16} style={styles.searchIcon} />
        <input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} style={styles.searchInput} />
      </div>

      {loading ? <div style={styles.loading}>Loading...</div> : (
        <div style={styles.grid}>
          {filtered.map((emp) => (
            <div key={emp._id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.avatar}>{emp.name.charAt(0).toUpperCase()}</div>
                <div style={styles.info}>
                  <p style={styles.name}>{emp.name}</p>
                  <p style={styles.email}>{emp.email}</p>
                  {emp.department && <p style={styles.dept}>{emp.department}</p>}
                </div>
                <button style={{ ...styles.actionBtn, color: '#ef4444' }} onClick={() => handleDelete(emp._id)}>
                  <FiTrash2 size={14} />
                </button>
              </div>

              {emp.githubUsername && (
                <div style={styles.github}>
                  <FiGithub size={13} />
                  <a href={`https://github.com/${emp.githubUsername}`} target="_blank" rel="noreferrer" style={{ color: '#1a56db', fontSize: '0.8rem' }}>
                    @{emp.githubUsername}
                  </a>
                </div>
              )}

              {emp.skills?.length > 0 && (
                <div style={styles.skills}>
                  {emp.skills.slice(0, 4).map((s) => (
                    <span key={s} style={styles.skill}>{s}</span>
                  ))}
                </div>
              )}

              <div style={styles.cardFooter}>
                <span style={{ fontSize: '0.75rem', color: emp.isActive ? '#10b981' : '#ef4444' }}>
                  ● {emp.isActive ? 'Active' : 'Inactive'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  Joined {new Date(emp.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#9ca3af' }}>
              No employees found
            </div>
          )}
        </div>
      )}

      {/* Create Employee Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Add New Employee</h2>
            <form onSubmit={handleCreate} style={styles.modalForm}>
              {[
                { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
                { name: 'email', label: 'Email', type: 'email', placeholder: 'john@company.com', required: true },
                { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
                { name: 'githubUsername', label: 'GitHub Username', type: 'text', placeholder: 'johndoe' },
                { name: 'department', label: 'Department', type: 'text', placeholder: 'Engineering' },
                { name: 'skills', label: 'Skills (comma-separated)', type: 'text', placeholder: 'React, Node.js, MongoDB' },
              ].map((f) => (
                <div key={f.name} style={styles.field}>
                  <label style={styles.label}>{f.label}</label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name]}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    placeholder={f.placeholder}
                    style={styles.input}
                    required={f.required}
                  />
                </div>
              ))}
              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={styles.submitBtn} disabled={creating}>
                  {creating ? <span className="spinner" /> : 'Create Employee'}
                </button>
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
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#111827' },
  subtitle: { color: '#6b7280', fontSize: '0.875rem', marginTop: 4 },
  createBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' },
  searchWrap: { position: 'relative', maxWidth: 360 },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' },
  searchInput: { width: '100%', padding: '10px 14px 10px 38px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: '0.875rem', background: 'white', boxSizing: 'border-box' },
  loading: { textAlign: 'center', padding: 60, color: '#6b7280' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  card: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 },
  cardTop: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 },
  info: { flex: 1 },
  name: { fontWeight: 700, color: '#111827', fontSize: '0.95rem' },
  email: { fontSize: '0.8rem', color: '#6b7280' },
  dept: { fontSize: '0.75rem', color: '#1a56db', marginTop: 2 },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' },
  github: { display: 'flex', alignItems: 'center', gap: 6 },
  skills: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  skill: { background: '#eff6ff', color: '#1e40af', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 9999 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #f3f4f6' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'white', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: 24 },
  modalForm: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#374151' },
  input: { padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: '0.875rem', color: '#111827', background: '#f9fafb', boxSizing: 'border-box' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  cancelBtn: { padding: '10px 20px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 8, fontWeight: 600, cursor: 'pointer', color: '#374151' },
  submitBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
};

export default EmployeeList;
