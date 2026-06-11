import { useEffect, useState } from 'react';
import { historicalAPI } from '../../services/api';
import { FiPlus, FiTrash2, FiDatabase } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatINR } from '../../utils/currency';

const HistoricalData = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'web', complexity: 'medium', teamSize: '',
    actualCost: '', estimatedCost: '', actualDuration: '', estimatedDuration: '',
    wasDelayed: false, wasOverBudget: false, notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    historicalAPI.getAll().then((r) => { setRecords(r.data); setLoading(false); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await historicalAPI.upload({
        ...form,
        teamSize: Number(form.teamSize),
        actualCost: Number(form.actualCost),
        estimatedCost: Number(form.estimatedCost),
        actualDuration: Number(form.actualDuration),
        estimatedDuration: Number(form.estimatedDuration),
      });
      toast.success('Historical data uploaded!');
      setShowModal(false);
      const res = await historicalAPI.getAll();
      setRecords(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await historicalAPI.delete(id);
      setRecords((prev) => prev.filter((r) => r._id !== id));
      toast.success('Record deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Historical Project Data</h1>
          <p style={styles.subtitle}>Used by AI to predict cost & timeline for new projects</p>
        </div>
        <button style={styles.createBtn} onClick={() => setShowModal(true)}>
          <FiPlus size={16} /> Add Record
        </button>
      </div>

      {records.length === 0 && !loading && (
        <div style={styles.emptyState}>
          <FiDatabase size={40} color="#d1d5db" />
          <p style={styles.emptyTitle}>No historical data yet</p>
          <p style={styles.emptyText}>Add past project records to improve AI prediction accuracy</p>
          <button style={styles.createBtn} onClick={() => setShowModal(true)}>Add First Record</button>
        </div>
      )}

      {!loading && records.length > 0 && (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Project', 'Type', 'Complexity', 'Team', 'Est. Cost', 'Actual Cost', 'Est. Days', 'Actual Days', 'Delayed', 'Over Budget', ''].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} style={styles.tr}>
                  <td style={styles.td}><p style={styles.projName}>{r.name}</p></td>
                  <td style={styles.td}><span className="badge badge-info">{r.type}</span></td>
                  <td style={styles.td}><span className={`badge badge-${r.complexity === 'high' || r.complexity === 'critical' ? 'danger' : r.complexity === 'medium' ? 'warning' : 'success'}`}>{r.complexity}</span></td>
                  <td style={styles.td}>{r.teamSize}</td>
                  <td style={styles.td}>{formatINR(r.estimatedCost)}</td>
                  <td style={{ ...styles.td, color: r.wasOverBudget ? '#ef4444' : '#10b981', fontWeight: 600 }}>{formatINR(r.actualCost)}</td>
                  <td style={styles.td}>{r.estimatedDuration}d</td>
                  <td style={{ ...styles.td, color: r.wasDelayed ? '#ef4444' : '#10b981', fontWeight: 600 }}>{r.actualDuration}d</td>
                  <td style={styles.td}>{r.wasDelayed ? '⚠ Yes' : '✓ No'}</td>
                  <td style={styles.td}>{r.wasOverBudget ? '⚠ Yes' : '✓ No'}</td>
                  <td style={styles.td}>
                    <button style={{ ...styles.actionBtn, color: '#ef4444' }} onClick={() => handleDelete(r._id)}><FiTrash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Add Historical Project</h2>
            <form onSubmit={handleSubmit} style={styles.modalForm}>
              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>Project Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={styles.input} placeholder="Old Project Name" required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={styles.input}>
                    {['web', 'mobile', 'desktop', 'api', 'ml', 'other'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Complexity</label>
                  <select value={form.complexity} onChange={(e) => setForm({ ...form, complexity: e.target.value })} style={styles.input}>
                    {['low', 'medium', 'high', 'critical'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Team Size</label>
                  <input type="number" value={form.teamSize} onChange={(e) => setForm({ ...form, teamSize: e.target.value })} style={styles.input} placeholder="5" required min="1" />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Estimated Cost ($)</label>
                  <input type="number" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} style={styles.input} placeholder="50000" required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Actual Cost ($)</label>
                  <input type="number" value={form.actualCost} onChange={(e) => setForm({ ...form, actualCost: e.target.value })} style={styles.input} placeholder="62000" required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Estimated Duration (days)</label>
                  <input type="number" value={form.estimatedDuration} onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })} style={styles.input} placeholder="90" required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Actual Duration (days)</label>
                  <input type="number" value={form.actualDuration} onChange={(e) => setForm({ ...form, actualDuration: e.target.value })} style={styles.input} placeholder="110" required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Notes</label>
                  <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={styles.input} placeholder="Any notes..." />
                </div>
                <div style={{ ...styles.field, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.wasDelayed} onChange={(e) => setForm({ ...form, wasDelayed: e.target.checked })} />
                    Was Delayed
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.wasOverBudget} onChange={(e) => setForm({ ...form, wasOverBudget: e.target.checked })} />
                    Over Budget
                  </label>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={styles.submitBtn} disabled={saving}>
                  {saving ? <span className="spinner" /> : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
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
  createBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 60, background: 'white', borderRadius: 12, border: '1px solid #e5e7eb' },
  emptyTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#374151' },
  emptyText: { color: '#9ca3af', fontSize: '0.875rem' },
  tableCard: { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 900 },
  th: { textAlign: 'left', padding: '12px 14px', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '12px 14px', fontSize: '0.875rem', color: '#374151' },
  projName: { fontWeight: 600, color: '#111827' },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'white', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: 24 },
  modalForm: { display: 'flex', flexDirection: 'column', gap: 16 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#374151' },
  input: { padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: '0.875rem', color: '#111827', background: '#f9fafb', boxSizing: 'border-box' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  cancelBtn: { padding: '10px 20px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 8, fontWeight: 600, cursor: 'pointer', color: '#374151' },
  submitBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
};

export default HistoricalData;
