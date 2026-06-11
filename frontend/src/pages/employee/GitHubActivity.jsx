import { useEffect, useState } from 'react';
import { githubAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiGithub, FiGitCommit, FiGitPullRequest } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const GitHubActivity = () => {
  const { user } = useAuth();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.githubUsername) {
      setLoading(true);
      const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const weekEnd = new Date().toISOString();
      githubAPI.getUserActivity(user.githubUsername, { weekStart, weekEnd })
        .then((r) => setActivity(r.data))
        .catch(() => setActivity(null))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user?.githubUsername) {
    return (
      <div style={styles.page} className="fade-in">
        <h1 style={styles.title}>GitHub Activity</h1>
        <div style={styles.noGithub}>
          <FiGithub size={48} color="#d1d5db" />
          <h3 style={styles.noGithubTitle}>No GitHub account connected</h3>
          <p style={styles.noGithubText}>Add your GitHub username to your profile to track your contributions</p>
          <button style={styles.profileBtn} onClick={() => navigate('/profile')}>Update Profile</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <h1 style={styles.title}>GitHub Activity</h1>
        <a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noreferrer" style={styles.profileLink}>
          <FiGithub size={16} /> @{user.githubUsername}
        </a>
      </div>

      {loading ? (
        <div style={styles.loading}>Fetching GitHub activity...</div>
      ) : activity ? (
        <div style={styles.content}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <FiGitCommit size={24} color="#1a56db" />
              <div>
                <p style={styles.statValue}>{activity.commits}</p>
                <p style={styles.statLabel}>Commits This Week</p>
              </div>
            </div>
            <div style={styles.statCard}>
              <FiGitPullRequest size={24} color="#8b5cf6" />
              <div>
                <p style={styles.statValue}>{activity.pullRequests}</p>
                <p style={styles.statLabel}>Pull Requests</p>
              </div>
            </div>
          </div>

          <div style={styles.infoCard}>
            <FiGithub size={20} color="#1a56db" />
            <div>
              <p style={styles.infoTitle}>Activity tracked for @{user.githubUsername}</p>
              <p style={styles.infoText}>
                Your GitHub activity is automatically included in your weekly reports. Make sure to push commits regularly to keep your progress visible to the admin.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.error}>
          <p>Could not fetch GitHub activity. Check your username or GitHub token configuration.</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 24 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#111827' },
  profileLink: { display: 'flex', alignItems: 'center', gap: 8, color: '#1a56db', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', padding: '8px 16px', border: '1px solid #bfdbfe', borderRadius: 8, background: '#eff6ff' },
  loading: { textAlign: 'center', padding: 60, color: '#6b7280' },
  noGithub: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 60, background: 'white', borderRadius: 12, border: '1px solid #e5e7eb' },
  noGithubTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#374151' },
  noGithubText: { color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center' },
  profileBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' },
  content: { display: 'flex', flexDirection: 'column', gap: 20 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 },
  statCard: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '24px', display: 'flex', alignItems: 'center', gap: 16 },
  statValue: { fontSize: '2rem', fontWeight: 800, color: '#111827' },
  statLabel: { fontSize: '0.875rem', color: '#6b7280', marginTop: 2 },
  infoCard: { display: 'flex', gap: 16, padding: '20px', background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe' },
  infoTitle: { fontWeight: 700, color: '#1e40af', marginBottom: 6 },
  infoText: { fontSize: '0.875rem', color: '#3b82f6', lineHeight: 1.6 },
  error: { padding: 40, background: '#fff5f5', borderRadius: 12, border: '1px solid #fee2e2', color: '#dc2626', textAlign: 'center' },
};

export default GitHubActivity;
