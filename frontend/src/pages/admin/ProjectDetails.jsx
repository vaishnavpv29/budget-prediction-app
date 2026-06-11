import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, taskAPI, githubAPI } from '../../services/api';
import { FiArrowLeft, FiGithub, FiAlertTriangle, FiCheckCircle, FiClock, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatINR } from '../../utils/currency';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, tasksRes] = await Promise.all([
          projectAPI.getById(id),
          taskAPI.getAll({ project: id }),
        ]);
        setProject(projRes.data);
        setTasks(tasksRes.data);

        if (projRes.data.githubRepo && projRes.data.githubOwner) {
          try {
            const contribRes = await githubAPI.getContributors(id);
            setContributors(contribRes.data);
          } catch {}
        }
      } catch {
        toast.error('Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div style={styles.loading}>Loading project...</div>;
  if (!project) return <div style={styles.loading}>Project not found</div>;

  const daysRemaining = Math.ceil(
    (new Date(project.expectedDeadline) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/admin/projects')}>
          <FiArrowLeft size={16} /> Back
        </button>
        <div style={styles.headerRight}>
          <span className={`badge badge-${project.riskLevel === 'high' ? 'danger' : project.riskLevel === 'medium' ? 'warning' : 'success'}`}>
            {project.riskLevel} risk
          </span>
          <button style={styles.editBtn} onClick={() => navigate(`/admin/projects/${id}/edit`)}>
            Edit Project
          </button>
        </div>
      </div>

      <div style={styles.titleRow}>
        <div>
          <h1 style={styles.title}>{project.name}</h1>
          <p style={styles.subtitle}>{project.description || 'No description provided'}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <FiDollarSign size={20} color="#1a56db" />
          <div>
            <p style={styles.metricLabel}>Budget</p>
            <p style={styles.metricValue}>{formatINR(project.budget)}</p>
          </div>
        </div>
        <div style={{ ...styles.metricCard, borderColor: project.costRisk ? '#fee2e2' : '#d1fae5' }}>
          <FiDollarSign size={20} color={project.costRisk ? '#ef4444' : '#10b981'} />
          <div>
            <p style={styles.metricLabel}>Predicted Cost</p>
            <p style={{ ...styles.metricValue, color: project.costRisk ? '#ef4444' : '#10b981' }}>
              {formatINR(project.predictedCost)}</p>
          </div>
        </div>
        <div style={styles.metricCard}>
          <FiClock size={20} color="#f59e0b" />
          <div>
            <p style={styles.metricLabel}>Days Remaining</p>
            <p style={{ ...styles.metricValue, color: daysRemaining < 7 ? '#ef4444' : '#111827' }}>
              {daysRemaining > 0 ? daysRemaining : 'Overdue'}
            </p>
          </div>
        </div>
        <div style={styles.metricCard}>
          <FiCheckCircle size={20} color="#10b981" />
          <div>
            <p style={styles.metricLabel}>Completion</p>
            <p style={styles.metricValue}>{project.completionPercentage || 0}%</p>
          </div>
        </div>
      </div>

      {/* Risk Alerts */}
      {(project.costRisk || project.timeRisk) && (
        <div style={styles.riskAlert}>
          <FiAlertTriangle size={18} color="#ef4444" />
          <div>
            <p style={styles.riskTitle}>Risk Detected</p>
            {project.costRisk && <p style={styles.riskText}>⚠ Predicted cost exceeds budget by {formatINR(project.predictedCost - project.budget)}</p>}
            {project.timeRisk && <p style={styles.riskText}>⚠ Predicted timeline ({project.predictedTimeline} days) exceeds expected deadline</p>}
          </div>
        </div>
      )}

      <div style={styles.twoCol}>
        {/* Tasks */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Tasks ({tasks.length})</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {tasks.length > 0 && (
                <span style={styles.aiTag}>🤖 AI Generated</span>
              )}
              <button style={styles.addBtn} onClick={() => navigate(`/admin/tasks/new?project=${id}`)}>
                + Add Task
              </button>
            </div>
          </div>
          <div style={styles.taskList}>
            {tasks.map((t) => (
              <div key={t._id} style={styles.taskItem}>
                <div style={{ ...styles.taskDot, background: t.status === 'completed' ? '#10b981' : t.status === 'in-progress' ? '#1a56db' : t.status === 'overdue' ? '#ef4444' : '#9ca3af' }} />
                <div style={styles.taskInfo}>
                  <p style={styles.taskTitle}>{t.title}</p>
                  <p style={styles.taskMeta}>{t.assignedTo?.name} · Due {new Date(t.dueDate).toLocaleDateString()}</p>
                </div>
                <span className={`badge badge-${t.status === 'completed' ? 'success' : t.status === 'in-progress' ? 'info' : t.status === 'overdue' ? 'danger' : 'gray'}`}>
                  {t.status}
                </span>
              </div>
            ))}
            {tasks.length === 0 && <p style={styles.empty}>No tasks yet</p>}
          </div>
        </div>

        {/* Team & GitHub */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Team Members</h3>
            <div style={styles.memberList}>
              {project.teamMembers?.map((m) => (
                <div key={m._id} style={styles.memberItem}>
                  <div style={styles.memberAvatar}>{m.name.charAt(0)}</div>
                  <div>
                    <p style={styles.memberName}>{m.name}</p>
                    {m.githubUsername && <p style={styles.memberGithub}>@{m.githubUsername}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {project.githubRepo && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}><FiGithub size={16} /> GitHub</h3>
              </div>
              <p style={styles.repoLink}>
                <a href={`https://github.com/${project.githubOwner}/${project.githubRepo}`} target="_blank" rel="noreferrer" style={{ color: '#1a56db' }}>
                  {project.githubOwner}/{project.githubRepo}
                </a>
              </p>
              {contributors.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <p style={styles.metricLabel}>Top Contributors</p>
                  {contributors.slice(0, 5).map((c) => (
                    <div key={c.login} style={styles.contributor}>
                      <img src={c.avatar_url} alt={c.login} style={styles.contributorAvatar} />
                      <span style={styles.contributorName}>{c.login}</span>
                      <span style={styles.contributorCommits}>{c.contributions} commits</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 20 },
  loading: { textAlign: 'center', padding: 60, color: '#6b7280' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: '#374151', fontSize: '0.875rem' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  editBtn: { padding: '8px 16px', background: '#1a56db', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: 4 },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  metricCard: { background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: '16px', display: 'flex', alignItems: 'center', gap: 12 },
  metricLabel: { fontSize: '0.75rem', color: '#6b7280' },
  metricValue: { fontSize: '1.25rem', fontWeight: 700, color: '#111827' },
  riskAlert: { background: '#fff5f5', border: '1px solid #fee2e2', borderRadius: 10, padding: '16px', display: 'flex', gap: 12, alignItems: 'flex-start' },
  riskTitle: { fontWeight: 700, color: '#991b1b', marginBottom: 4 },
  riskText: { fontSize: '0.875rem', color: '#b91c1c' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 },
  card: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  cardTitle: { fontSize: '1rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 },
  addBtn: { background: 'none', border: '1px solid #1a56db', color: '#1a56db', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  taskList: { display: 'flex', flexDirection: 'column', gap: 8 },
  taskItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px', background: '#f9fafb', borderRadius: 8 },
  taskDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: '0.875rem', fontWeight: 600, color: '#111827' },
  taskMeta: { fontSize: '0.75rem', color: '#6b7280', marginTop: 2 },
  empty: { color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: 20 },
  aiTag: { background: '#eff6ff', color: '#1e40af', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 9999, border: '1px solid #bfdbfe' },
  memberList: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 },
  memberItem: { display: 'flex', alignItems: 'center', gap: 10 },
  memberAvatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' },
  memberName: { fontSize: '0.875rem', fontWeight: 600, color: '#111827' },
  memberGithub: { fontSize: '0.75rem', color: '#1a56db' },
  repoLink: { fontSize: '0.875rem', marginTop: 8 },
  contributor: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #f3f4f6' },
  contributorAvatar: { width: 24, height: 24, borderRadius: '50%' },
  contributorName: { flex: 1, fontSize: '0.8rem', fontWeight: 600, color: '#374151' },
  contributorCommits: { fontSize: '0.75rem', color: '#6b7280' },
};

export default ProjectDetails;
