import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function GithubCallbackPage() {
  const [searchParams] = useSearchParams();
  const { socialLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const code = searchParams.get('code');
    if (!code) {
      setError('Missing GitHub authorization code.');
      return;
    }

    socialLogin('GitHub', code)
      .then(() => navigate('/'))
      .catch(() => setError('GitHub login failed.'));
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      {error ? <p className="text-danger">{error}</p> : <p>Signing you in with GitHub…</p>}
    </div>
  );
}