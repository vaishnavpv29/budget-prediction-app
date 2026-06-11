import { useEffect, useState } from 'react';
import { projectAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiDollarSign, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { formatINR, formatINRShort } from '../../utils/currency';

const CostPrediction = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectAPI.getAll().then((r) => { setProjects(r.data); setLoading(false); });
  }, []);

  const chartData = projects.map((p) => ({
    name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
    Budget: p.budget,
    'Predicted Cost': p.predictedCost,
  }));

  const overBudget = projects.filter((p) => p.costRisk);
  const onBudget = projects.filter((p) => !p.costRisk);

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <h1 style={styles.title}>Cost Prediction</h1>
        <p style={styles.subtitle}>AI-powered cost analysis based on historical project data</p>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <FiDollarSign size={24} color="#1a56db" />
          <div>
            <p style={styles.statLabel}>Total Budget</p>
            <p style={styles.statValue}>{formatINR(projects.reduce((s, p) => s + (p.budget || 0), 0))}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <FiDollarSign size={24} color="#f59e0b" />
          <div>
            <p style={styles.statLabel}>Total Predicted Cost</p>
            <p style={styles.statValue}>{formatINR(projects.reduce((s, p) => s + (p.predictedCost || 0), 0))}</p>
          </div>
        </div>
        <div style={{ ...styles.statCard, borderColor: '#fee2e2' }}>
          <FiAlertTriangle size={24} color="#ef4444" />
          <div>
            <p style={styles.statLabel}>Over Budget Projects</p>
            <p style={{ ...styles.statValue, color: '#ef4444' }}>{overBudget.length}</p>
          </div>
        </div>
        <div style={{ ...styles.statCard, borderColor: '#d1fae5' }}>
          <FiCheckCircle size={24} color="#10b981" />
          <div>
            <p style={styles.statLabel}>Within Budget</p>
            <p style={{ ...styles.statValue, color: '#10b981' }}>{onBudget.length}</p>
          </div>
        </div>
      </div>

      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Budget vs Predicted Cost by Project</h3>
        {loading ? <div style={styles.loading}>Loading...</div> : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatINRShort(v)} />
              <Tooltip formatter={(v) => formatINR(v)} />
              <Legend />
              <Bar dataKey="Budget" fill="#1a56db" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Predicted Cost" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <div style={styles.loading}>No project data available</div>}
      </div>

      <div style={styles.tableCard}>
        <h3 style={styles.tableTitle}>Detailed Cost Analysis</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              {['Project', 'Type', 'Complexity', 'Budget', 'Predicted Cost', 'Variance', 'Risk'].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const variance = p.predictedCost - p.budget;
              return (
                <tr key={p._id} style={styles.tr}>
                  <td style={styles.td}><p style={styles.projName}>{p.name}</p></td>
                  <td style={styles.td}><span className="badge badge-info">{p.type}</span></td>
                  <td style={styles.td}><span className={`badge badge-${p.complexity === 'high' || p.complexity === 'critical' ? 'danger' : 'warning'}`}>{p.complexity}</span></td>
                  <td style={styles.td}>{formatINR(p.budget)}</td>
                  <td style={styles.td}>{formatINR(p.predictedCost)}</td>
                  <td style={{ ...styles.td, color: variance > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                    {variance > 0 ? '+' : ''}{formatINR(variance)}
                  </td>
                  <td style={styles.td}>
                    <span className={`badge badge-${p.costRisk ? 'danger' : 'success'}`}>
                      {p.costRisk ? '⚠ Over Budget' : '✓ On Budget'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {projects.length === 0 && (
              <tr><td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#9ca3af', padding: 40 }}>No projects yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 24 },
  header: {},
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#111827' },
  subtitle: { color: '#6b7280', fontSize: '0.875rem', marginTop: 4 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  statCard: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px', display: 'flex', alignItems: 'center', gap: 14 },
  statLabel: { fontSize: '0.8rem', color: '#6b7280' },
  statValue: { fontSize: '1.4rem', fontWeight: 800, color: '#111827' },
  chartCard: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '24px' },
  chartTitle: { fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: 20 },
  loading: { textAlign: 'center', padding: 60, color: '#9ca3af' },
  tableCard: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: '24px' },
  tableTitle: { fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 14px', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '12px 14px', fontSize: '0.875rem', color: '#374151' },
  projName: { fontWeight: 600, color: '#111827' },
};

export default CostPrediction;
