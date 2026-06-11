import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={styles.root}>
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <Sidebar open={sidebarOpen} />
      <main
        style={{
          ...styles.main,
          marginLeft: sidebarOpen ? 'var(--sidebar-width)' : 0,
        }}
      >
        <div style={styles.content}>{children}</div>
      </main>
    </div>
  );
};

const styles = {
  root: { minHeight: '100vh', background: 'var(--gray-50)' },
  main: {
    paddingTop: 'var(--header-height)',
    transition: 'margin-left 0.3s ease',
    minHeight: '100vh',
  },
  content: { padding: '28px 32px', maxWidth: 1400, margin: '0 auto' },
};

export default Layout;
