const Card = ({ children, darkMode, style }) => (
  <div style={{
    background: darkMode ? '#1f2937' : '#fff',
    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    ...style,
  }}>
    {children}
  </div>
);

export default Card;
