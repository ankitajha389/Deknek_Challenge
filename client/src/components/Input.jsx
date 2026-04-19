const Input = ({ label, error, darkMode, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    {label && (
      <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14, color: darkMode ? '#d1d5db' : '#374151' }}>
        {label}
      </label>
    )}
    <input
      {...props}
      style={{
        width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 15,
        border: `1.5px solid ${error ? '#ef4444' : (darkMode ? '#374151' : '#d1d5db')}`,
        background: darkMode ? '#1f2937' : '#fff',
        color: darkMode ? '#f9fafb' : '#111827',
        outline: 'none', boxSizing: 'border-box',
        transition: 'border-color 0.15s',
        ...props.style,
      }}
    />
    {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{error}</p>}
  </div>
);

export default Input;
