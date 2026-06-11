import { useEffect, useState } from 'react';
import { projectAPI } from '../../services/api';
import { FiAlertTriangle, FiAlertCircle, FiCheckCircle, FiClock, FiDollarSign, FiActivity } from 'react-icons/fi';
import { formatINR } from '../../utils/currency';

const RiskAnalysis = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectAPI.getAll().then((r) => { setProjects(r.data); setLoading(false); });
  }, []);

  const getRisks = (p) => {
    const risks = [];
    const daysRemaining = Math.ceil((new Date(p.expectedDeadline) - new Date()) / (1000 * 60 * 60 * 24));

    if (p.costRisk) {
      const overrun = p.predictedCost - p.budget;
      risks.push({ type: 'COST', severity: 'high', icon: FiDollarSign, message: `Predicted cost exceeds budget by ${formatINR(overrun)}` });
    }
    if (p.timeRisk) {
      risks.push({ type: 'TIME', severity: 'high', icon: FiClock, message: `Predicted timeline (${p.predictedTimeline} days) exceeds deadline` });
    }
    if (daysRemaining < 7 && p.completionPercentage < 80) {
      risks.push({ type: 'DEADLINE', severity: 'critical', icon: FiAlertTriangle, message: `Only ${daysRemaining} days left with ${p.completionPercentage}% completion` });
    }
    if (daysRemaining > 0 && p.completionPercentage < 20 && daysRemaining < p.predictedTimeline / 2) {
      risks.push({ type: 'PROGRESS', severity: 'medium', icon: FiActivity, message: 'Progress significantly behind schedule' });
    }
    return risks;
  };

  const highRisk = projects.filter((p) => p.riskLevel === 'high');
  const mediumRisk = projects.filter((p) => p.riskLevel === 'medium');
  const lowRisk = projects.filter((p) => p.riskLevel === 'low');

  const severityStyle = {
    critical: { bg: '#fff1f2', border: '#fecdd3', color: '#be123c', badge: 'badge-danger' },
    high: { bg: '#fff5f5', border: '#fee2e2', color: '#dc2626', badge: 'badge-danger' },
    medium: { bg: '#fffbeb', border: '#fde68a', color: '#d97706', badge: 'badge-warning' },
    low: { bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a', badge: 'badge-success' },
  };

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <h1 style={styles.title}>Risk Analysis</h1>
        <p style={styles.subtitle}>Real-time risk detection across all active projects</p>
      </div>

      <div style={styles.summaryRow}>
        <div style={{ ...styles.summaryCard, borderColor: '#fee2e2', background: '#fff5f5' }}>
          <FiAlertTriangle size={22} color="#ef4444" />
          <div>
            <p style={styles.summaryLabel}>High Risk</p>
            <p style={{ ...styles.summaryValue, color: '#ef4444' }}>{highRisk.length}</p>
          </div>
        </div>
        <div style={{ ...styles.summaryCard, borderColor: '#fde68a', background: '#fffbeb' }}>
          <FiAlertCircle size={22} color="#f59e0b" />
          <div>
            <p style={styles.summaryLabel}>Medium Risk</p>
            <p style={{ ...styles.summaryValue, color: '#f59e0b' }}>{mediumRisk.length}</p>
          </div>
        </div>
        <div style={{ ...styles.summaryCard, borderColor: '#bbf7d0', background: '#f0fdf4' }}>
          <FiCheckCircle size={22} color="#10b981" />
          <div>
            <p style={styles.summaryLabel}>Low Risk</p>
            <p style={{ ...styles.summaryValue, color: '#10b981' }}>{lowRisk.length}</p>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <FiActivity size={22} color="#1a56db" />
          <div>
            <p style={styles.summaryLabel}>Total Projects</p>
            <p style={styles.summaryValue}>{projects.length}</p>
          </div>
        </div>
      </div>

      {loading ? <div style={styles.loading}>Analyzing risks...</div> : (
        <div style={styles.projectList}>
          {projects.map((p) => {
            const risks = getRisks(p);
            const daysRemaining = Math.ceil((new Date(p.expectedDeadline) - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <div key={p._id} style={{ ...styles.projectCard, borderColor: p.riskLevel === 'high' ? '#fee2e2' : p.riskLevel === 'medium' ? '#fde68a' : '#e5e7eb' }}>
                <div style={styles.projectHeader}>
                  <div>
                    <h3 style={styles.projectName}>{p.name}</h3>
                    <p style={styles.projectMeta}>{p.type} · {p.complexity} · {p.teamMembers?.length || 0} members</p>
                  </div>
                  <div style={styles.projectBadges}>
                    <span className={`badge badge-${p.riskLevel === 'high' ? 'danger' : p.riskLevel === 'medium' ? 'warning' : 'success'}`}>
                      {p.riskLevel} risk
                    </span>
                    <span className={`badge badge-${p.status === 'completed' ? 'success' : p.status === 'delayed' ? 'danger' : 'info'}`}>
                      {p.status}
                    </span>
                  </div>
                </div>

                <div style={styles.metricsRow}>
                  <div style={styles.metric}>
                    <span style={styles.metricLabel}>Completion</span>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${p.completionPercentage || 0}%` }} />
                    </div>
                    <span style={styles.metricValue}>{p.completionPercentage || 0}%</span>
                  </div>
                  <div style={styles.metricItem}>
                    <span style={styles.metricLabel}>Days Left</span>
                    <span style={{ ...styles.metricValue, color: daysRemaining < 7 ? '#ef4444' : '#111827' }}>
                      {daysRemaining > 0 ? daysRemaining : 'Overdue'}
                    </span>
                  </div>
                  <div style={styles.metricItem}>
                    <span style={styles.metricLabel}>Budget</span>
                    <span style={styles.metricValue}>{formatINR(p.budget)}</span>
                  </div>
                  <div style={styles.metricItem}>
                    <span style={styles.metricLabel}>Predicted</span>
                    <span style={{ ...styles.metricValue, color: p.costRisk ? '#ef4444' : '#10b981' }}>
                      {formatINR(p.predictedCost)}
                    </span>
                  </div>
                </div>

                {risks.length > 0 && (
                  <div style={styles.risksList}>
                    {risks.map((risk, i) => {
                      const s = severityStyle[risk.severity] || severityStyle.medium;
                      const Icon = risk.icon;
                      return (
                        <div key={i} style={{ ...styles.riskItem, background: s.bg, borderColor: s.border }}>
                          <Icon size={14} color={s.color} />
                          <span style={{ ...styles.riskText, color: s.color }}>{risk.message}</span>
                          <span className={`badge ${s.badge}`}>{risk.severity}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {risks.length === 0 && (
                  <div style={styles.noRisk}>
                    <FiCheckCircle size={14} color="#10b981" />
                    <span style={{ color: '#10b981', fontSize: '0.8rem' }}>No active risks detected</span>
                  </div>
                )}
              </div>
            );
          })}
          {projects.length === 0 && (
            <div style={styles.empty}>No projects to analyze</div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 24 },
  header: {},
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#111827' },
  subtitle: { color: '#6b7280', fontSize: '0.875rem', marginTop: 4 },
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  summaryCard: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px', display: 'flex', alignItems: 'center', gap: 14 },
  summaryLabel: { fontSize: '0.8rem', color: '#6b7280' },
  summaryValue: { fontSize: '1.5rem', fontWeight: 800, color: '#111827' },
  loading: { textAlign: 'center', padding: 60, color: '#6b7280' },
  projectList: { display: 'flex', flexDirection: 'column', gap: 16 },
  projectCard: { background: 'white', borderRadius: 12, border: '1.5px solid #e5e7eb', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 },
  projectHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  projectName: { fontSize: '1rem', fontWeight: 700, color: '#111827' },
  projectMeta: { fontSize: '0.8rem', color: '#6b7280', marginTop: 2, textTransform: 'capitalize' },
  projectBadges: { display: 'flex', gap: 8 },
  metricsRow: { display: 'flex', gap: 20, alignItems: 'center' },
  metric: { flex: 2, display: 'flex', alignItems: 'center', gap: 8 },
  metricItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  metricLabel: { fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' },
  metricValue: { fontSize: '0.9rem', fontWeight: 700, color: '#111827' },
  progressBar: { flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #1a56db, #0ea5e9)', borderRadius: 3 },
  risksList: { display: 'flex', flexDirection: 'column', gap: 8 },
  riskItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: '1px solid' },
  riskText: { flex: 1, fontSize: '0.8rem', fontWeight: 500 },
  noRisk: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8 },
  empty: { textAlign: 'center', padding: 60, color: '#9ca3af' },
};

export default RiskAnalysis;
