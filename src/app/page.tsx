import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', textAlign: 'center' }}>
      <div style={{
        width: 80, 
        height: 80, 
        backgroundColor: 'var(--accent)', 
        color: 'white', 
        borderRadius: 24, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 24
      }}>
        K
      </div>
      <h1 style={{ fontSize: 36, fontWeight: 'bold', color: 'var(--accent)', marginBottom: 12 }}>Kenanga Care</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: 500, lineHeight: 1.6, fontSize: 16, marginBottom: 32 }}>
        Buku Kesehatan Ibu dan Anak Digital. Pantau kehamilan, persalinan, nifas, dan tumbuh kembang anak Anda dengan mudah dan aman walau tanpa koneksi internet.
      </p>

      <div style={{ display: 'flex', gap: 16 }}>
        <Link href="/ibu" style={{
          backgroundColor: 'var(--accent)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 8,
          fontWeight: 600,
          textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(234, 41, 134, 0.2)'
        }}>
          Portal Ibu
        </Link>
        <Link href="/kader" style={{
          backgroundColor: 'white',
          color: 'var(--accent)',
          border: '1.5px solid var(--accent)',
          padding: '12px 24px',
          borderRadius: 8,
          fontWeight: 600,
          textDecoration: 'none'
        }}>
          Portal Kader Posyandu
        </Link>
      </div>
    </div>
  );
}
