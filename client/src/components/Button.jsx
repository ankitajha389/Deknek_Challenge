const Button = ({ children, loading, variant = 'primary', fullWidth, style, ...props }) => {
  const base = {
    padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 15,
    cursor: loading || props.disabled ? 'not-allowed' : 'pointer',
    border: 'none', transition: 'opacity 0.15s, transform 0.1s',
    width: fullWidth ? '100%' : 'auto',
    opacity: loading || props.disabled ? 0.7 : 1,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    ...style,
  };

  const variants = {
    primary: { background: '#4f46e5', color: '#fff' },
    danger:  { background: '#ef4444', color: '#fff' },
    ghost:   { background: 'transparent', color: '#4f46e5', border: '1.5px solid #4f46e5' },
    success: { background: '#16a34a', color: '#fff' },
  };

  return (
    <button {...props} disabled={loading || props.disabled} style={{ ...base, ...variants[variant] }}>
      {loading ? '⏳ Loading...' : children}
    </button>
  );
};

export default Button;
