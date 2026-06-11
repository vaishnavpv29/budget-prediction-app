import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../../services/api';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatINR } from '../../utils/currency';

const statusColors = {
  planning: 'badge-gray',
  'in-progress': 'badge-info',
  'on-track': 'badge-success',
  delayed: 'badge-warning',
  'at-risk': 'badge-danger',
  completed: 'badge-success',
};

const riskColors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    projectAPI.getAll().then((r) => { setProjects(r.data); setLoading(false); });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await projectAPI.delete(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Projects</h1>
          <p style={styles.subtitle}>{projects.length} total projects</p>
        </div>
        <button style={styles.createBtn} onClick={() => navigate('/admin/projects/new')}>
          <FiPlus size={16} /> New Project
        </button>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <FiSearch size={16} style={styles.searchIcon} />
          <input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading projects...</div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((p) => (
            <div key={p._id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.projectName}>{p.name}</h3>
                  <p style={styles.projectType}>{p.type} · {p.complexity} complexity</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className={`badge ${statusColors[p.status] || 'badge-gray'}`}>{p.status}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={styles.progressSection}>
                <div style={styles.progressHeader}>
                  <span style={styles.progressLabel}>Completion</span>
                  <span style={styles.progressValue}>{p.completionPercentage || 0}%</span>
                </div>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${p.completionPercentage || 0}%` }} />
                </div>
              </div>

              {/* Prediction Info */}
              <div style={styles.predictionRow}>
                <div style={styles.predItem}>
                  <span style={styles.predLabel}>Budget</span>
                  <span style={styles.predValue}>{formatINR(p.budget)}</span>
                </div>
                <div style={styles.predItem}>
                  <span style={styles.predLabel}>Predicted Cost</span>
                  <span style={{ ...styles.predValue, color: p.costRisk ? '#ef4444' : '#10b981' }}>
                    {formatINR(p.predictedCost)}
                  </span>
                </div>
                <div style={styles.predItem}>
                  <span style={styles.predLabel}>Risk</span>
                  <span style={{ ...styles.predValue, color: riskColors[p.riskLevel] || '#6b7280', fontWeight: 700 }}>
                    {p.riskLevel?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <span style={styles.teamSize}>👥 {p.teamMembers?.length || 0} members</span>
                <div style={styles.actions}>
                  <button style={styles.actionBtn} onClick={() => navigate(`/admin/projects/${p._id}`)}>
                    <FiEye size={14} />
                  </button>
                  <button style={styles.actionBtn} onClick={() => navigate(`/admin/projects/${p._id}/edit`)}>
                    <FiEdit2 size={14} />
                  </button>
                  <button style={{ ...styles.actionBtn, color: '#ef4444' }} onClick={() => handleDelete(p._id)}>
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={styles.empty}>No projects found. <button style={styles.emptyBtn} onClick={() => navigate('/admin/projects/new')}>Create one</button></div>
          )}
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
  createBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
    color: 'white', border: 'none', borderRadius: 10,
    fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
  },
  toolbar: { display: 'flex', gap: 12 },
  searchWrap: { position: 'relative', flex: 1, maxWidth: 360 },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' },
  searchInput: {
    width: '100%', padding: '10px 14px 10px 38px',
    border: '1.5px solid #e5e7eb', borderRadius: 10,
    fontSize: '0.875rem', background: 'white', boxSizing: 'border-box',
  },
  loading: { textAlign: 'center', padding: 60, color: '#6b7280' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  card: {
    background: 'white', borderRadius: 12, border: '1px solid #e5e7eb',
    padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  projectName: { fontSize: '1rem', fontWeight: 700, color: '#111827' },
  projectType: { fontSize: '0.8rem', color: '#6b7280', marginTop: 2, textTransform: 'capitalize' },
  progressSection: {},
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: '0.75rem', color: '#6b7280' },
  progressValue: { fontSize: '0.75rem', fontWeight: 700, color: '#111827' },
  progressBar: { height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #1a56db, #0ea5e9)', borderRadius: 3, transition: 'width 0.5s ease' },
  predictionRow: { display: 'flex', gap: 12 },
  predItem: { flex: 1, background: '#f9fafb', borderRadius: 8, padding: '8px 10px' },
  predLabel: { display: 'block', fontSize: '0.7rem', color: '#9ca3af', marginBottom: 2 },
  predValue: { fontSize: '0.85rem', fontWeight: 700, color: '#111827' },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #f3f4f6' },
  teamSize: { fontSize: '0.8rem', color: '#6b7280' },
  actions: { display: 'flex', gap: 6 },
  actionBtn: {
    background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6,
    padding: '6px 8px', cursor: 'pointer', color: '#374151',
    display: 'flex', alignItems: 'center',
  },
  empty: { gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#9ca3af', fontSize: '0.9rem' },
  emptyBtn: { background: 'none', border: 'none', color: '#1a56db', fontWeight: 600, cursor: 'pointer' },
};

export default ProjectList;
