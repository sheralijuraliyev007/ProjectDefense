import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Divider } from '@heroui/react';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;

function extractErrorMessage(err, fallback) {
  const errors = err.response?.data?.errors ?? err.response?.data;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0];
    if (typeof first === 'string') return first;
    return first?.errorResult?.errorMessage ?? first?.errorMessage ?? first?.message ?? fallback;
  }
  return err.response?.data?.message || fallback;
}

export default function LoginPage() {
  const { login, socialLogin } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const googleButtonRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    try {
      await login(data);
      navigate('/');
    } catch (err) {
      setError(extractErrorMessage(err, 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleCredential = useCallback(async (response) => {
    setError('');
    try {
      await socialLogin('Google', response.credential);
      navigate('/');
    } catch (err) {
      setError(extractErrorMessage(err, 'Google login failed'));
    }
  }, [socialLogin, navigate]);

  const handleGithubLogin = () => {
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
    window.location.href = url;
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;

    const tryInit = () => {
      if (cancelled) return;
      if (!window.google?.accounts?.id) {
        setTimeout(tryInit, 100);
        return;
      }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
      });
    };

    tryInit();
    return () => { cancelled = true; };
  }, [handleGoogleCredential]);

  return (
    <div className="min-h-[80vh] flex" style={{ backgroundColor: '#FAF8F5' }}>
      {/* Left panel — identity / credential motif */}
      <div
        className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: '#1B2A4A' }}
      >
        <div className="flex items-center gap-2" style={{ color: '#FAF8F5' }}>
          <span className="text-lg font-semibold tracking-tight">{t('app.name', 'CV Manager')}</span>
        </div>

        <div>
          {/* Signature element: certification stamp */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-8 border-2"
            style={{ borderColor: '#C99A3F' }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xs font-bold tracking-widest"
              style={{ backgroundColor: '#C99A3F', color: '#1B2A4A' }}
            >
              CV
            </div>
          </div>
          <h1
            className="text-4xl leading-tight mb-4"
            style={{ color: '#FAF8F5', fontFamily: "'Zilla Slab', 'Georgia', serif" }}
          >
            Your experience,
            <br />
            structured for review.
          </h1>
          <p className="text-sm max-w-xs" style={{ color: '#8FA3C4' }}>
            Build a reusable profile once, and generate a tailored CV for every position you apply to.
          </p>
        </div>

        <p className="text-xs" style={{ color: '#5A6D8F' }}>
          © {new Date().getFullYear()} {t('app.name', 'CV Manager')}
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <h2
            className="text-2xl mb-1"
            style={{ fontFamily: "'Zilla Slab', 'Georgia', serif", color: '#1B2A4A' }}
          >
            {t('auth.login')}
          </h2>
          <p className="text-sm mb-8" style={{ color: '#6B7280' }}>
            {t('auth.welcomeBack', 'Sign in to continue to your profile.')}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              {...register('email')}
              type="email"
              label={t('auth.email')}
              placeholder="you@example.com"
              startContent={<EnvelopeIcon className="w-4 h-4 text-default-400" />}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
            />
            <Input
              {...register('password')}
              type="password"
              label={t('auth.password')}
              startContent={<LockClosedIcon className="w-4 h-4 text-default-400" />}
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
            />
            {error && <p className="text-danger text-sm">{error}</p>}
            <Button
              type="submit"
              isLoading={isLoading}
              fullWidth
              style={{ backgroundColor: '#1B2A4A', color: '#FAF8F5' }}
            >
              {t('auth.login')}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <Divider className="flex-1" />
            <span className="text-xs uppercase tracking-wide" style={{ color: '#9CA3AF' }}>
              {t('auth.orContinueWith')}
            </span>
            <Divider className="flex-1" />
          </div>

          <div className="flex flex-col gap-2 items-center">
            <div ref={googleButtonRef} />
            <Button variant="bordered" fullWidth onPress={handleGithubLogin}>
              {t('auth.github')}
            </Button>
          </div>

          <p className="text-center text-sm mt-8" style={{ color: '#6B7280' }}>
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-medium hover:underline" style={{ color: '#2D5F5D' }}>
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}