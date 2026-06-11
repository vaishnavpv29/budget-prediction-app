import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiShield } from 'react-icons/fi';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form.email, form.password, 'admin');
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconBox}>
            <FiShield size={28} color="white" />
          </div>
          <h1 style={styles.title}>Admin Portal</h1>
          <p style={styles.subtitle}>Sign in to manage projects & teams</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrap}>
              <FiMail size={16} style={styles.inputIcon} />
              <input
                type="email"
                placeholder="admin@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <FiLock size={16} style={styles.inputIcon} />
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={styles.input}
                required
              />
            </div>
          </div>

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In as Admin'}
          </button>
        </form>

        <p style={styles.switchText}>
          Are you an employee?{' '}
          <Link to="/employee/login" style={styles.link}>Employee Login</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1a56db 50%, #0ea5e9 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    background: 'white',
    borderRadius: 20,
    padding: '40px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    animation: 'fadeIn 0.4s ease',
  },
  header: { textAlign: 'center', marginBottom: 32 },
  iconBox: {
    width: 64,
    height: 64,
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: 6 },
  subtitle: { color: '#6b7280', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.875rem', fontWeight: 600, color: '#374151' },
  inputWrap: { position: 'relative' },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10,
    fontSize: '0.9rem',
    color: '#111827',
    background: '#f9fafb',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  btn: {
    padding: '13px',
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  switchText: { textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: '#6b7280' },
  link: { color: '#1a56db', fontWeight: 600 },
};

export default AdminLogin;
