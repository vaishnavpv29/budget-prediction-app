import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiGithub, FiSave } from 'react-icons/fi';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    githubUsername: user?.githubUsername || '',
    department: user?.department || '',
    skills: user?.skills?.join(', ') || '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        githubUsername: form.githubUsername,
        department: form.department,
        skills: form.skills ? form.skills.split(',').map((s) => s.trim()) : [],
      };
      if (form.password) payload.password = form.password;

      const res = await authAPI.updateProfile(payload);
      updateUser(res.data);
      toast.success('Profile updated!');
      setForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page} className="fade-in">
      <h1 style={styles.title}>My Profile</h1>

      <div style={styles.layout}>
        <div style={styles.avatarCard}>
          <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          <p style={styles.name}>{user?.name}</p>
          <p style={styles.email}>{user?.email}</p>
          <span className={`badge badge-${user?.role === 'admin' ? 'info' : 'success'}`}>{user?.role}</span>
          {user?.githubUsername && (
            <a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noreferrer" style={styles.githubLink}>
              <FiGithub size={14} /> @{user.githubUsername}
            </a>
          )}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}><FiUser size={16} /> Personal Information</h3>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Department</label>
                <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} style={styles.input} placeholder="Engineering" />
              </div>
              <div style={{ ...styles.field, gridColumn: '1/-1' }}>
                <label style={styles.label}>Skills (comma-separated)</label>
                <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} style={styles.input} placeholder="React, Node.js, MongoDB" />
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}><FiGithub size={16} /> GitHub Integration</h3>
            <div style={styles.field}>
              <label style={styles.label}>GitHub Username</label>
              <input value={form.githubUsername} onChange={(e) => setForm({ ...form, githubUsername: e.target.value })} style={styles.input} placeholder="your-github-username" />
            </div>
            <p style={styles.hint}>Your GitHub username is used to track commits and verify task completion</p>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Change Password</h3>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>New Password</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={styles.input} placeholder="Leave blank to keep current" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Confirm Password</label>
                <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} style={styles.input} placeholder="Confirm new password" />
              </div>
            </div>
          </div>

          <div style={styles.footer}>
            <button type="submit" style={styles.saveBtn} disabled={loading}>
              {loading ? <span className="spinner" /> : <><FiSave size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 24 },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#111827' },
  layout: { display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'start' },
  avatarCard: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  avatar: { width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.75rem' },
  name: { fontWeight: 700, color: '#111827', fontSize: '1rem', textAlign: 'center' },
  email: { fontSize: '0.8rem', color: '#6b7280', textAlign: 'center' },
  githubLink: { display: 'flex', alignItems: 'center', gap: 6, color: '#1a56db', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', marginTop: 4 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  section: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 },
  sectionTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#374151' },
  input: { padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: '0.875rem', color: '#111827', background: '#f9fafb', boxSizing: 'border-box' },
  hint: { fontSize: '0.75rem', color: '#9ca3af' },
  footer: { display: 'flex', justifyContent: 'flex-end' },
  saveBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '11px 28px', background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' },
};

export default Profile;
