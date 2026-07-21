import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import authApi from '../../api/authApi';

function extractErrorMessage(err, fallback) {
  const errors = err.response?.data?.errors ?? err.response?.data;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0];
    if (typeof first === 'string') return first;
    return first?.errorResult?.errorMessage ?? first?.errorMessage ?? first?.message ?? fallback;
  }
  return err.response?.data?.message || fallback;
}

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setError(t('auth.missingToken', 'Missing verification token.'));
      return;
    }

    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setError(extractErrorMessage(err, t('auth.verificationFailed', 'Verification failed.')));
      });
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center" style={{ backgroundColor: '#FAF8F5' }}>
      <div className="w-full max-w-sm text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border-2"
          style={{ borderColor: status === 'success' ? '#2D5F5D' : status === 'error' ? '#D85A30' : '#C99A3F' }}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold tracking-widest"
            style={{
              backgroundColor: status === 'success' ? '#2D5F5D' : status === 'error' ? '#D85A30' : '#C99A3F',
              color: '#FAF8F5',
            }}
          >
            CV
          </div>
        </div>

        {status === 'verifying' && (
          <h2 className="text-2xl mb-2" style={{ fontFamily: "'Zilla Slab', 'Georgia', serif", color: '#1B2A4A' }}>
            {t('auth.verifying', 'Verifying your email…')}
          </h2>
        )}

        {status === 'success' && (
          <>
            <h2 className="text-2xl mb-2" style={{ fontFamily: "'Zilla Slab', 'Georgia', serif", color: '#1B2A4A' }}>
              {t('auth.verified', 'Email verified')}
            </h2>
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
              {t('auth.verifiedBody', 'You can now sign in to your account.')}
            </p>
            <Link to="/login">
              <Button fullWidth style={{ backgroundColor: '#1B2A4A', color: '#FAF8F5' }}>
                {t('auth.login')}
              </Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-2xl mb-2" style={{ fontFamily: "'Zilla Slab', 'Georgia', serif", color: '#1B2A4A' }}>
              {t('auth.verificationFailed', 'Verification failed')}
            </h2>
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>{error}</p>
            <Link to="/login">
              <Button variant="bordered" fullWidth>
                {t('auth.login')}
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}