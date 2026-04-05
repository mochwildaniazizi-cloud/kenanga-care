export default function IbuDashboard() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--accent)' }}>Dashboard Ibu</h1>
      <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>
        Selamat datang di Kenanga Care. Ini akan menjadi pusat data kesehatan ibu dan anak Anda.
        Sistem PWA memungkinkan akses bahkan saat offline.
      </p>

      <div style={{
        marginTop: 24,
        padding: 24, 
        backgroundColor: 'white',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid var(--border-color)'
      }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Status Sinkronisasi Data</h2>
        <p style={{ color: 'var(--text-muted)' }}>Aman (Tersimpan Secara Lokal)</p>
      </div>
    </div>
  );
}
