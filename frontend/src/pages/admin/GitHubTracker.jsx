import { useEffect, useState } from 'react';
import { projectAPI, userAPI, githubAPI } from '../../services/api';
import { FiGithub, FiGitCommit, FiGitPullRequest, FiRefreshCw, FiChevronDown, FiChevronUp, FiExternalLink } from 'react-icons/fi';

const GitHubTracker = () => {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [commits, setCommits] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [expandedAuthor, setExpandedAuthor] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load projects and employees on mount
  useEffect(() => {
    Promise.all([projectAPI.getAll(), userAPI.getAll({ role: 'employee' })]).then(([pRes, eRes]) => {
      const repoProjects = pRes.data.filter((p) => p.githubOwner && p.githubRepo);
      setProjects(repoProjects);
      setEmployees(eRes.data);
      if (repoProjects.length > 0) setSelectedProject(repoProjects[0]._id);
      setLoadingProjects(false);
    });
  }, []);

  // Fetch commits when project changes
  useEffect(() => {
    if (selectedProject) fetchCommits(selectedProject);
  }, [selectedProject]);

  const fetchCommits = async (projectId) => {
    setLoading(true);
    setCommits([]);
    setContributors([]);
    try {
      const [commitsRes, contribRes] = await Promise.all([
        githubAPI.getCommits(projectId),
        githubAPI.getContributors(projectId),
      ]);
      setCommits(commitsRes.data || []);
      setContributors(contribRes.data || []);
    } catch (e) {
      setCommits([]);
      setContributors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCommits(selectedProject);
  };

  const project = projects.find((p) => p._id === selectedProject);

  // Group commits by author login
  const commitsByAuthor = commits.reduce((acc, c) => {
    const login = c.author?.login || c.commit?.author?.name || 'Unknown';
    if (!acc[login]) acc[login] = { login, avatar: c.author?.avatar_url || '', commits: [] };
    acc[login].commits.push(c);
    return acc;
  }, {});

  // Match GitHub login to ESTIMATRIX employee
  const matchEmployee = (login) =>
    employees.find((e) => e.githubUsername?.toLowerCase() === login?.toLowerCase());

  const authorList = Object.values(commitsByAuthor).sort((a, b) => b.commits.length - a.commits.length);

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>GitHub Commit Tracker</h1>
          <p style={styles.subtitle}>View commits per person on each project repository</p>
        </div>
        <button style={styles.refreshBtn} onClick={handleRefresh} disabled={refreshing || !selectedProject}>
          <FiRefreshCw size={14} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Project Selector */}
      {loadingProjects ? (
        <div style={styles.loading}>Loading projects...</div>
      ) : projects.length === 0 ? (
        <div style={styles.noRepo}>
          <FiGithub size={40} color="#d1d5db" />
          <p style={styles.noRepoTitle}>No projects with GitHub repo</p>
          <p style={styles.noRepoText}>Go to Admin → Projects → Edit a project and add GitHub Owner + Repository name.</p>
        </div>
      ) : (
        <>
          <div style={styles.projectTabs}>
            {projects.map((p) => (
              <button
                key={p._id}
                style={{ ...styles.tab, ...(selectedProject === p._id ? styles.tabActive : {}) }}
                onClick={() => setSelectedProject(p._id)}
              >
                <FiGithub size={13} />
                {p.name}
              </button>
            ))}
          </div>

          {project && (
            <div style={styles.repoInfo}>
              <FiGithub size={16} color="#1a56db" />
              <a
                href={`https://github.com/${project.githubOwner}/${project.githubRepo}`}
                target="_blank" rel="noreferrer"
                style={styles.repoLink}
              >
                github.com/{project.githubOwner}/{project.githubRepo}
              </a>
              <FiExternalLink size={13} color="#1a56db" />
              <span style={styles.commitCount}>{commits.length} commits loaded</span>
            </div>
          )}

          {/* Summary Cards */}
          {!loading && authorList.length > 0 && (
            <div style={styles.summaryGrid}>
              {authorList.map((author) => {
                const emp = matchEmployee(author.login);
                return (
                  <div key={author.login} style={styles.summaryCard}>
                    <div style={styles.summaryTop}>
                      {author.avatar ? (
                        <img src={author.avatar} alt={author.login} style={styles.ghAvatar} />
                      ) : (
                        <div style={styles.ghAvatarFallback}>{author.login.charAt(0).toUpperCase()}</div>
                      )}
                      <div style={styles.summaryInfo}>
                        <p style={styles.summaryLogin}>
                          <a href={`https://github.com/${author.login}`} target="_blank" rel="noreferrer" style={{ color: '#1a56db', textDecoration: 'none', fontWeight: 700 }}>
                            @{author.login}
                          </a>
                        </p>
                        {emp && <p style={styles.summaryEmp}>👤 {emp.name} · {emp.department}</p>}
                        {!emp && <p style={styles.summaryNoMatch}>Not matched to employee</p>}
                      </div>
                    </div>
                    <div style={styles.summaryStats}>
                      <div style={styles.summaryStat}>
                        <span style={styles.summaryStatVal}>{author.commits.length}</span>
                        <span style={styles.summaryStatLabel}>Commits</span>
                      </div>
                      <div style={styles.progressBarWrap}>
                        <div style={{
                          ...styles.progressFill,
                          width: `${Math.min(100, (author.commits.length / (authorList[0]?.commits.length || 1)) * 100)}%`
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Detailed Commits per Author */}
          {loading ? (
            <div style={styles.loading}>Fetching commits from GitHub...</div>
          ) : authorList.length === 0 ? (
            <div style={styles.noCommits}>
              <FiGitCommit size={32} color="#d1d5db" />
              <p>No commits found in this repository yet.</p>
            </div>
          ) : (
            <div style={styles.authorList}>
              <h3 style={styles.sectionTitle}>Commit Details by Person</h3>
              {authorList.map((author) => {
                const emp = matchEmployee(author.login);
                const isExpanded = expandedAuthor === author.login;
                return (
                  <div key={author.login} style={styles.authorCard}>
                    {/* Author Header */}
                    <div style={styles.authorHeader} onClick={() => setExpandedAuthor(isExpanded ? null : author.login)}>
                      <div style={styles.authorLeft}>
                        {author.avatar ? (
                          <img src={author.avatar} alt={author.login} style={styles.ghAvatar} />
                        ) : (
                          <div style={styles.ghAvatarFallback}>{author.login.charAt(0).toUpperCase()}</div>
                        )}
                        <div>
                          <div style={styles.authorName}>
                            <a href={`https://github.com/${author.login}`} target="_blank" rel="noreferrer"
                              style={{ color: '#1a56db', fontWeight: 700, textDecoration: 'none' }}
                              onClick={(e) => e.stopPropagation()}>
                              @{author.login}
                            </a>
                            {emp && (
                              <span style={styles.empTag}>👤 {emp.name}</span>
                            )}
                          </div>
                          <p style={styles.authorSub}>{author.commits.length} commits · click to {isExpanded ? 'collapse' : 'expand'}</p>
                        </div>
                      </div>
                      <div style={styles.authorRight}>
                        <span style={styles.commitBadge}>{author.commits.length} commits</span>
                        {isExpanded ? <FiChevronUp size={18} color="#6b7280" /> : <FiChevronDown size={18} color="#6b7280" />}
                      </div>
                    </div>

                    {/* Commit List */}
                    {isExpanded && (
                      <div style={styles.commitList}>
                        {author.commits.map((c, i) => (
                          <div key={i} style={styles.commitItem}>
                            <FiGitCommit size={14} color="#1a56db" style={{ flexShrink: 0, marginTop: 2 }} />
                            <div style={styles.commitInfo}>
                              <p style={styles.commitMsg}>{c.commit?.message?.split('\n')[0]}</p>
                              <div style={styles.commitMeta}>
                                <span>{new Date(c.commit?.author?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                <span style={styles.commitHash}>
                                  <a href={c.html_url} target="_blank" rel="noreferrer" style={{ color: '#1a56db', textDecoration: 'none' }}>
                                    {c.sha?.slice(0, 7)}
                                  </a>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 24 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#111827' },
  subtitle: { color: '#6b7280', fontSize: '0.875rem', marginTop: 4 },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', color: '#374151' },
  loading: { textAlign: 'center', padding: 60, color: '#6b7280' },
  noRepo: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 60, background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', textAlign: 'center' },
  noRepoTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#374151' },
  noRepoText: { fontSize: '0.875rem', color: '#9ca3af', maxWidth: 400 },
  projectTabs: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  tab: { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', color: '#6b7280' },
  tabActive: { background: '#eff6ff', border: '1.5px solid #1a56db', color: '#1a56db' },
  repoInfo: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#f0f9ff', borderRadius: 10, border: '1px solid #bae6fd' },
  repoLink: { color: '#1a56db', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' },
  commitCount: { marginLeft: 'auto', fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 },
  summaryCard: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 },
  summaryTop: { display: 'flex', alignItems: 'center', gap: 10 },
  ghAvatar: { width: 36, height: 36, borderRadius: '50%', flexShrink: 0 },
  ghAvatarFallback: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#1a56db,#0ea5e9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 },
  summaryInfo: { flex: 1 },
  summaryLogin: { fontSize: '0.875rem', marginBottom: 2 },
  summaryEmp: { fontSize: '0.75rem', color: '#10b981', fontWeight: 600 },
  summaryNoMatch: { fontSize: '0.72rem', color: '#9ca3af' },
  summaryStats: { display: 'flex', alignItems: 'center', gap: 10 },
  summaryStat: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 },
  summaryStatVal: { fontSize: '1.25rem', fontWeight: 800, color: '#1a56db' },
  summaryStatLabel: { fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase' },
  progressBarWrap: { flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg,#1a56db,#0ea5e9)', borderRadius: 3, transition: 'width 0.5s ease' },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: 4 },
  authorList: { display: 'flex', flexDirection: 'column', gap: 12 },
  authorCard: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' },
  authorHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', userSelect: 'none' },
  authorLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  authorName: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem' },
  empTag: { background: '#d1fae5', color: '#065f46', fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 9999 },
  authorSub: { fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 },
  authorRight: { display: 'flex', alignItems: 'center', gap: 10 },
  commitBadge: { background: '#eff6ff', color: '#1e40af', fontSize: '0.8rem', fontWeight: 700, padding: '3px 12px', borderRadius: 9999 },
  commitList: { borderTop: '1px solid #f3f4f6', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto', background: '#fafafa' },
  commitItem: { display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 10px', background: 'white', borderRadius: 8, border: '1px solid #f3f4f6' },
  commitInfo: { flex: 1 },
  commitMsg: { fontSize: '0.875rem', fontWeight: 600, color: '#111827', lineHeight: 1.4 },
  commitMeta: { display: 'flex', gap: 12, marginTop: 4, fontSize: '0.75rem', color: '#9ca3af' },
  commitHash: { fontFamily: 'monospace', background: '#f3f4f6', padding: '1px 6px', borderRadius: 4 },
  noCommits: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 60, background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', color: '#9ca3af' },
};

export default GitHubTracker;
