import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const registerSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

function extractErrorMessage(err, fallback) {
  const errors = err.response?.data?.errors ?? err.response?.data;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0];
    return typeof first === 'string' ? first : first?.errorMessage ?? first?.message ?? fallback;
  }
  return err.response?.data?.message || fallback;
}

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    try {
      const { confirmPassword, ...payload } = data;
      await registerUser(payload);
      setSubmitted(true);
    } catch (err) {
      setError(extractErrorMessage(err, 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex" style={{ backgroundColor: '#FAF8F5' }}>
      <div
        className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12"
        style={{ backgroundColor: '#1B2A4A' }}
      >
        <div className="flex items-center gap-2" style={{ color: '#FAF8F5' }}>
          <span className="text-lg font-semibold tracking-tight">{t('app.name', 'CV Manager')}</span>
        </div>

        <div>
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
            One profile.
            <br />
            Every position.
          </h1>
          <p className="text-sm max-w-xs" style={{ color: '#8FA3C4' }}>
            Fill in your attributes and projects once — generate a tailored CV for each role you apply to.
          </p>
        </div>

        <p className="text-xs" style={{ color: '#5A6D8F' }}>
          © {new Date().getFullYear()} {t('app.name', 'CV Manager')}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {submitted ? (
            <div>
              <h2
                className="text-2xl mb-2"
                style={{ fontFamily: "'Zilla Slab', 'Georgia', serif", color: '#1B2A4A' }}
              >
                {t('auth.checkYourEmail', 'Check your email')}
              </h2>
              <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                {t('auth.verificationSent', "We've sent a verification link to your email. Confirm it, then sign in.")}
              </p>
              <Link to="/login">
                <Button fullWidth style={{ backgroundColor: '#1B2A4A', color: '#FAF8F5' }}>
                  {t('auth.login')}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h2
                className="text-2xl mb-1"
                style={{ fontFamily: "'Zilla Slab', 'Georgia', serif", color: '#1B2A4A' }}
              >
                {t('auth.register')}
              </h2>
              <p className="text-sm mb-8" style={{ color: '#6B7280' }}>
                {t('auth.createProfile', 'Create your profile to start building CVs.')}
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <Input
                    {...register('firstName')}
                    label={t('auth.firstName')}
                    isInvalid={!!errors.firstName}
                    errorMessage={errors.firstName?.message}
                  />
                  <Input
                    {...register('lastName')}
                    label={t('auth.lastName')}
                    isInvalid={!!errors.lastName}
                    errorMessage={errors.lastName?.message}
                  />
                </div>
                <Input
                  {...register('email')}
                  type="email"
                  label={t('auth.email')}
                  isInvalid={!!errors.email}
                  errorMessage={errors.email?.message}
                />
                <Input
                  {...register('password')}
                  type="password"
                  label={t('auth.password')}
                  isInvalid={!!errors.password}
                  errorMessage={errors.password?.message}
                />
                <Input
                  {...register('confirmPassword')}
                  type="password"
                  label={t('auth.confirmPassword')}
                  isInvalid={!!errors.confirmPassword}
                  errorMessage={errors.confirmPassword?.message}
                />
                {error && <p className="text-danger text-sm">{error}</p>}
                <Button
                  type="submit"
                  isLoading={isLoading}
                  fullWidth
                  style={{ backgroundColor: '#1B2A4A', color: '#FAF8F5' }}
                >
                  {t('auth.register')}
                </Button>
              </form>

              <p className="text-center text-sm mt-8" style={{ color: '#6B7280' }}>
                {t('auth.hasAccount')}{' '}
                <Link to="/login" className="font-medium hover:underline" style={{ color: '#2D5F5D' }}>
                  {t('auth.login')}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}