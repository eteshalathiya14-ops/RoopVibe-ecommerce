import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GOLD = '#C9A96E';
const GOLD_DARK = '#A07840';
const CHARCOAL = '#1A1A1A';
const MUTED = '#6B6560';

export default function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // ensure top on navigation
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#f5f5f1' }}>
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div style={{ fontSize: 72, fontWeight: 900, color: GOLD_DARK, lineHeight: 1 }}>
          404
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: CHARCOAL, marginTop: 12 }}>
          Page Not Found
        </h1>
        <p style={{ color: MUTED, marginTop: 10 }}>
          The category you’re looking for doesn’t exist.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-8 px-8 py-3 rounded font-bold cursor-pointer"
          style={{ border: `1.5px solid ${GOLD}`, background: 'transparent', color: GOLD_DARK }}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

