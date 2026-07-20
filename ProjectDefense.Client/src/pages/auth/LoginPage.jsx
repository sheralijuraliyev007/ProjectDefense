import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Card, CardBody, CardHeader, Divider } from '@heroui/react';
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
    return typeof first === 'string' ? first : first?.errorMessage ?? first?.message ?? fallback;
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
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

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

  const handleGoogleCredential = async (response) => {
    setError('');
    try {
      await socialLogin('Google', response.credential);
      navigate('/');
    } catch (err) {
      setError(extractErrorMessage(err, 'Google login failed'));
    }
  };

  const handleGithubLogin = () => {
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
    window.location.href = url;
  };

  useEffect(() => {
    if (!window.google || !GOOGLE_CLIENT_ID) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });

    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 320,
    });
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center">
          <h1 className="text-2xl font-bold">{t('auth.login')}</h1>
        </CardHeader>
        <CardBody className="gap-4">
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
            <Button type="submit" color="primary" isLoading={isLoading} fullWidth>
              {t('auth.login')}
            </Button>
          </form>

          <Divider />

          <div className="flex flex-col gap-2 items-center">
            <p className="text-center text-sm text-default-500">{t('auth.orContinueWith')}</p>
            <div ref={googleButtonRef} />
            <Button variant="bordered" fullWidth onPress={handleGithubLogin}>
              {t('auth.github')}
            </Button>
          </div>

          <p className="text-center text-sm">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-primary hover:underline">
              {t('auth.register')}
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}