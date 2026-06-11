import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiBell, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuToggle, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <button style={styles.menuBtn} onClick={onMenuToggle}>
          {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
        <div style={styles.logo}>
          <span style={styles.logoText}>ESTIMATRIX</span>
          <span style={styles.logoBadge}>{user?.role === 'admin' ? 'Admin' : 'Employee'}</span>
        </div>
      </div>

      <div style={styles.right}>
        <button style={styles.iconBtn}>
          <FiBell size={18} />
        </button>

        <div style={{ position: 'relative' }}>
          <button style={styles.userBtn} onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div style={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user?.name}</span>
              <span style={styles.userRole}>{user?.role}</span>
            </div>
          </button>

          {dropdownOpen && (
            <div style={styles.dropdown}>
              <button style={styles.dropdownItem} onClick={() => { navigate('/profile'); setDropdownOpen(false); }}>
                <FiUser size={14} /> Profile
              </button>
              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '4px 0' }} />
              <button style={{ ...styles.dropdownItem, color: '#ef4444' }} onClick={handleLogout}>
                <FiLogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    height: 'var(--header-height)',
    background: 'var(--white)',
    borderBottom: '1px solid var(--gray-200)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: 'var(--shadow-sm)',
  },
  left: { display: 'flex', alignItems: 'center', gap: 16 },
  menuBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--gray-600)',
    padding: 8,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8 },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px',
  },
  logoBadge: {
    background: 'var(--primary-light)',
    color: 'var(--primary)',
    fontSize: '0.7rem',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 9999,
    textTransform: 'uppercase',
  },
  right: { display: 'flex', alignItems: 'center', gap: 8 },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--gray-500)',
    padding: 8,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'none',
    border: '1px solid var(--gray-200)',
    borderRadius: 10,
    padding: '6px 12px',
    cursor: 'pointer',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.875rem',
  },
  userInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  userName: { fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-800)' },
  userRole: { fontSize: '0.7rem', color: 'var(--gray-500)', textTransform: 'capitalize' },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '110%',
    background: 'white',
    border: '1px solid var(--gray-200)',
    borderRadius: 10,
    boxShadow: 'var(--shadow-md)',
    minWidth: 160,
    padding: '4px',
    zIndex: 200,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    borderRadius: 6,
    fontSize: '0.875rem',
    color: 'var(--gray-700)',
    cursor: 'pointer',
    textAlign: 'left',
  },
};

export default Navbar;
