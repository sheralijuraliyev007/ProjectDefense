import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '@heroui/react';
import { ChartBarIcon, UsersIcon, BriefcaseIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const STAT_STYLES = {
  primary: 'bg-blue-100 text-blue-600',
  secondary: 'bg-purple-100 text-purple-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-amber-100 text-amber-600',
};

export default function DashboardPage() {
  const { t } = useTranslation();

  const stats = [
    { label: t('admin.totalUsers', 'Total Users'), value: '—', icon: UsersIcon, color: 'primary' },
    { label: t('admin.totalPositions', 'Total Positions'), value: '—', icon: BriefcaseIcon, color: 'secondary' },
    { label: t('admin.totalCvs', 'Total CVs'), value: '—', icon: DocumentTextIcon, color: 'success' },
    { label: t('admin.cvsToday', 'CVs Today'), value: '—', icon: ChartBarIcon, color: 'warning' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('nav.dashboard')}</h1>
      <p className="text-sm text-default-500">
        {t('admin.statsComingSoon', 'Live statistics are not connected yet.')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardBody className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${STAT_STYLES[stat.color]}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-default-500">{stat.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}