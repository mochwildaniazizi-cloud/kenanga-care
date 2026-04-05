export default function KaderDashboard() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--accent)' }}>Dashboard Kader</h1>
      <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>
        Panel pengelolaan data Posyandu. Saat koneksi terputus, data Ibu dan Anak akan tersimpan ke dalam penyimpanan lokal, 
        dan akan otomatis disinkronkan ke database utama saat online.
      </p>

      <div style={{
        marginTop: 24,
        padding: 24, 
        backgroundColor: 'white',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid var(--border-color)'
      }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Cek Data Offline</h2>
        <button style={{
          backgroundColor: 'var(--accent)',
          border: 'none',
          color: 'white',
          padding: '10px 20px',
          borderRadius: 8,
          cursor: 'pointer',
          fontWeight: 600
        }}>
          Sinkronasikan 0 Data Tertunda
        </button>
      </div>
    </div>
  );
}
