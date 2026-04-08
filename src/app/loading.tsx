export default function Loading() {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
      zIndex: 50
    }}>
      <div style={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        border: '6px solid var(--accent-light)',
        borderTop: '6px solid var(--accent)',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ marginTop: 24, color: 'var(--accent)', fontWeight: 600, fontSize: 18, letterSpacing: '0.5px' }}>
        Memuat Kenanga Care...
      </p>
      {/* Kita mendefinisikan keyframes animasi spin langsung di dalam style */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
