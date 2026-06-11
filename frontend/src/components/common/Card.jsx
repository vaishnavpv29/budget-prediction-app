const Card = ({ children, style = {}, className = '' }) => (
  <div style={{ ...cardStyle, ...style }} className={className}>
    {children}
  </div>
);

const cardStyle = {
  background: 'var(--white)',
  borderRadius: 'var(--border-radius)',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--gray-200)',
  padding: '20px',
};

export const StatCard = ({ icon: Icon, label, value, color = '#1a56db', trend, sub }) => (
  <div style={statStyles.card}>
    <div style={{ ...statStyles.iconBox, background: color + '18' }}>
      <Icon size={22} color={color} />
    </div>
    <div style={statStyles.content}>
      <p style={statStyles.label}>{label}</p>
      <p style={statStyles.value}>{value}</p>
      {sub && <p style={statStyles.sub}>{sub}</p>}
    </div>
    {trend !== undefined && (
      <div style={{ ...statStyles.trend, color: trend >= 0 ? '#10b981' : '#ef4444' }}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </div>
    )}
  </div>
);

const statStyles = {
  card: {
    background: 'var(--white)',
    borderRadius: 'var(--border-radius)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--gray-200)',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1 },
  label: { fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 500 },
  value: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', lineHeight: 1.2 },
  sub: { fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 2 },
  trend: { fontSize: '0.8rem', fontWeight: 600 },
};

export default Card;
