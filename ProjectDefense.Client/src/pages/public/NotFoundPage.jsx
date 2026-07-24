import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';
import { HomeIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const {t} = useTranslation();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-default-300 mb-4">{t('notFound.title')}</h1>
      <h2 className="text-2xl font-semibold mb-2">{t('notFound.heading')}</h2>
      <p className="text-default-500 mb-6">{t('notFound.message')}</p>
      <Button as={Link} to="/" color="primary" startContent={<HomeIcon className="w-4 h-4" />}>
        {t('notFound.goHome')}
      </Button>
    </div>
  );
}