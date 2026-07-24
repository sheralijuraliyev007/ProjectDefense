import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Badge,
} from '@heroui/react';
import {
  BriefcaseIcon,
  UsersIcon,
  DocumentTextIcon,
  ClockIcon,
  FireIcon,
  TagIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import positionApi from '../../api/positionApi';
import cvApi from '../../api/cvApi';

export default function MainPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [latestPositions, setLatestPositions] = useState([]);
  const [popularPositions, setPopularPositions] = useState([]);
  const [statistics, setStatistics] = useState({
    cvsLast24h: 0,
    totalPositions: 0,
    totalCandidates: 0,
    totalRecruiters: 0,
    totalCvs: 0,
  });
  const [tagCloud, setTagCloud] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [latestRes, popularRes, statsRes] = await Promise.all([
          positionApi.search({ page: 1, pageSize: 5, sortBy: 'updatedAt', sortDirection: 'descending' }),
          positionApi.search({ page: 1, pageSize: 5, sortBy: 'cvsCount', sortDirection: 'descending' }),
          
        ]);
        
        setLatestPositions(latestRes.data.data.items);
        setPopularPositions(popularRes.data.data.items);
        
        
        
        setTagCloud([
          { tag: 'React', count: 45, size: 'large' },
          { tag: 'TypeScript', count: 38, size: 'large' },
          { tag: 'Node.js', count: 32, size: 'medium' },
          { tag: 'Python', count: 28, size: 'medium' },
          { tag: 'AWS', count: 25, size: 'medium' },
          { tag: 'Docker', count: 20, size: 'small' },
          { tag: 'Kubernetes', count: 18, size: 'small' },
          { tag: 'GraphQL', count: 15, size: 'small' },
          { tag: 'PostgreSQL', count: 12, size: 'small' },
          { tag: 'MongoDB', count: 10, size: 'small' },
        ]);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <Card className="bg-default-50">
      <CardBody className="flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-default-500">{label}</p>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="space-y-8">
      
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FireIcon className="w-5 h-5 text-danger" />
          {t('mainPage.statistics')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            icon={ClockIcon}
            label={t('mainPage.cvsLast24h')}
            value={statistics.cvsLast24h}
            color="warning"
          />
          <StatCard
            icon={BriefcaseIcon}
            label={t('mainPage.totalPositions')}
            value={statistics.totalPositions}
            color="primary"
          />
          <StatCard
            icon={UsersIcon}
            label={t('mainPage.totalCandidates')}
            value={statistics.totalCandidates}
            color="success"
          />
          <StatCard
            icon={UsersIcon}
            label={t('mainPage.totalRecruiters')}
            value={statistics.totalRecruiters}
            color="secondary"
          />
          <StatCard
            icon={DocumentTextIcon}
            label={t('mainPage.totalCvs')}
            value={statistics.totalCvs}
            color="default"
          />
        </div>
      </section>

  
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-primary" />
            {t('mainPage.latestPositions')}
          </h2>
          <Button variant="light" size="sm" onPress={() => navigate('/positions')}>
            View All <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {latestPositions.map(pos => (
            <Card
              key={pos.id}
              isPressable
              onPress={() => navigate(`/positions/${pos.id}`)}
              className="hover:bg-default-100 transition-colors"
            >
              <CardBody className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{pos.title}</p>
                  <p className="text-sm text-default-500">{pos.company} • {pos.level}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Chip size="sm" variant="flat" color="primary">{pos.cvsCount} CVs</Chip>
                  <span className="text-xs text-default-400">
                    {new Date(pos.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FireIcon className="w-5 h-5 text-danger" />
          {t('mainPage.popularPositions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {popularPositions.slice(0, 5).map((pos, idx) => (
            <Card
              key={pos.id}
              isPressable
              onPress={() => navigate(`/positions/${pos.id}`)}
              className="hover:scale-105 transition-transform"
            >
              <CardBody className="text-center py-6">
                <Badge color="danger" content={idx + 1} placement="top-right">
                  <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-full flex items-center justify-center">
                    <BriefcaseIcon className="w-6 h-6 text-primary" />
                  </div>
                </Badge>
                <p className="font-medium text-sm line-clamp-2">{pos.title}</p>
                <p className="text-xs text-default-500 mt-1">{pos.cvsCount} CVs</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-secondary" />
          {t('mainPage.tagCloud')}
        </h2>
        <Card>
          <CardBody className="flex flex-wrap gap-3 justify-center p-6">
            {tagCloud.map(({ tag, count, size }) => (
              <Button
                key={tag}
                variant="flat"
                size={size === 'large' ? 'lg' : size === 'medium' ? 'md' : 'sm'}
                color="primary"
                className={`${size === 'large' ? 'text-lg font-bold' : size === 'medium' ? 'text-base' : 'text-sm'}`}
                onPress={() => navigate(`/positions?tag=${encodeURIComponent(tag)}`)}
              >
                {tag}
                <Badge size="sm" color="default" variant="flat">{count}</Badge>
              </Button>
            ))}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}