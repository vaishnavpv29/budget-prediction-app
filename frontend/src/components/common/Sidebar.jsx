import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiFolder, FiCheckSquare, FiFileText,
  FiUsers, FiDatabase, FiGithub, FiTrendingUp, FiBarChart2,
} from 'react-icons/fi';

const adminLinks = [
  { to: '/admin/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/admin/projects', icon: FiFolder, label: 'Projects' },
  { to: '/admin/tasks', icon: FiCheckSquare, label: 'Tasks' },
  { to: '/admin/employees', icon: FiUsers, label: 'Employees' },
  { to: '/admin/reports', icon: FiFileText, label: 'Reports' },
  { to: '/admin/historical', icon: FiDatabase, label: 'Historical Data' },
  { to: '/admin/predictions', icon: FiTrendingUp, label: 'Predictions' },
  { to: '/admin/risk', icon: FiBarChart2, label: 'Risk Analysis' },
  { to: '/admin/github', icon: FiGithub, label: 'GitHub Tracker' },
];

const employeeLinks = [
  { to: '/employee/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/employee/tasks', icon: FiCheckSquare, label: 'My Tasks' },
  { to: '/employee/projects', icon: FiFolder, label: 'My Projects' },
  { to: '/employee/reports', icon: FiFileText, label: 'Weekly Reports' },
  { to: '/employee/github', icon: FiGithub, label: 'GitHub Activity' },
];

const Sidebar = ({ open }) => {
  const { user } = useAuth();
  const links = user?.role === 'admin' ? adminLinks : employeeLinks;

  return (
    <aside style={{ ...styles.sidebar, transform: open ? 'translateX(0)' : 'translateX(-100%)' }}>
      <nav style={styles.nav}>
        <div style={styles.section}>
          <p style={styles.sectionLabel}>MENU</p>
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.activeLink : {}),
              })}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div style={styles.footer}>
        <div style={styles.footerCard}>
          <p style={styles.footerTitle}>ESTIMATRIX</p>
          <p style={styles.footerSub}>v1.0.0 · AI-Powered PM</p>
        </div>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: 'var(--sidebar-width)',
    height: '100vh',
    background: 'var(--gray-900)',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 99,
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease',
    paddingTop: 'var(--header-height)',
    overflowY: 'auto',
  },
  nav: { flex: 1, padding: '16px 12px' },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#6b7280',
    letterSpacing: '0.1em',
    padding: '0 12px',
    marginBottom: 8,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 8,
    color: '#9ca3af',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: 2,
    transition: 'all 0.15s',
    textDecoration: 'none',
  },
  activeLink: {
    background: 'rgba(26, 86, 219, 0.2)',
    color: '#60a5fa',
  },
  footer: { padding: '16px 12px 24px' },
  footerCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: '12px 16px',
  },
  footerTitle: { color: '#e5e7eb', fontWeight: 700, fontSize: '0.875rem' },
  footerSub: { color: '#6b7280', fontSize: '0.75rem', marginTop: 2 },
};

export default Sidebar;
