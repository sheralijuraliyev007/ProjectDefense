import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { ChartBarIcon, UsersIcon, BriefcaseIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { t } = useTranslation();

  const stats = [
    { label: 'Total Users', value: '0', icon: UsersIcon, color: 'primary' },
    { label: 'Total Positions', value: '0', icon: BriefcaseIcon, color: 'secondary' },
    { label: 'Total CVs', value: '0', icon: DocumentTextIcon, color: 'success' },
    { label: 'CVs Today', value: '0', icon: ChartBarIcon, color: 'warning' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('nav.dashboard')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardBody className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
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