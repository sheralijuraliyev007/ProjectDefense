import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Card, CardBody, CardHeader } from '@heroui/react';
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    try {
      const { confirmPassword, ...payload } = data;
      await registerUser(payload);
      navigate('/login');
    } catch (err) {
      setError(extractErrorMessage(err, 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center">
          <h1 className="text-2xl font-bold">{t('auth.register')}</h1>
        </CardHeader>
        <CardBody className="gap-4">
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
              label="Confirm Password"
              isInvalid={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword?.message}
            />
            {error && <p className="text-danger text-sm">{error}</p>}
            <Button type="submit" color="primary" isLoading={isLoading} fullWidth>
              {t('auth.register')}
            </Button>
          </form>

          <p className="text-center text-sm">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}