import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Chip, Button, Spinner } from '@heroui/react';
import { LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import positionApi from '../../api/positionApi';
import { useAuth } from '../../contexts/AuthContext';

function PositionListView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await positionApi.search({ page: 1, pageSize: 50 });
        // Anonymous/candidate users only ever get eligible positions back from the
        // backend (PositionService.GetAllAsync already filters this server-side),
        // so no client-side isPublic filtering needed here.
        setPositions(res.data.data?.rows ?? []);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) return <div className="flex justify-center p-12"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t('positions.title')}</h1>
      <div className="space-y-2">
        {positions.length === 0 && (
          <p className="text-default-500 text-sm">{t('positions.noPositions')}</p>
        )}
        {positions.map((pos) => (
          <Card key={pos.id} isPressable onPress={() => navigate(`/positions/${pos.id}`)}>
            <CardBody className="flex flex-row items-center justify-between">
              <div>
                <p className="font-medium">{pos.title}</p>
                <p className="text-sm text-default-500 line-clamp-1">{pos.shortDescription}</p>
              </div>
              <Chip size="sm" color={pos.isPublic ? 'success' : 'warning'} variant="flat">
                {pos.isPublic ? t('positions.public') : t('positions.restricted')}
              </Chip>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PositionSingleView({ id }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [position, setPosition] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setNotFound(false);
    try {
      const posRes = await positionApi.getById(id);
      const pos = posRes.data.data;
      if (!pos) { setNotFound(true); return; }
      setPosition(pos);

      const attrsRes = await positionApi.getAttributes(id);
      setAttributes(attrsRes.data.data ?? []);
    } catch (err) {
      // 404 (or the backend's access-control "Not found") both land here
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) return <div className="flex justify-center p-12"><Spinner size="lg" /></div>;

  if (notFound || !position) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 text-center py-12">
        <p className="text-default-500">
          {isAuthenticated
            ? "This position isn't available — it may not exist, or you may not meet its requirements."
            : 'This position is restricted. Log in to see if you qualify.'}
        </p>
        {!isAuthenticated && (
          <Button color="primary" onPress={() => navigate('/login')}>Log in</Button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Button variant="light" size="sm" onPress={() => navigate('/positions')} startContent={<ArrowLeftIcon className="w-4 h-4" />}>
        {t('common.back')}
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{position.title}</h1>
          <Chip size="sm" color={position.isPublic ? 'success' : 'warning'} variant="flat" className="mt-2">
            {position.isPublic ? t('positions.public') : t('positions.restricted')}
          </Chip>
        </div>
        {!isAuthenticated && (
          <Button color="primary" startContent={<LockClosedIcon className="w-4 h-4" />} onPress={() => navigate('/login')}>
            Login to Apply
          </Button>
        )}
      </div>

      <Card>
        <CardBody className="space-y-4">
          <p className="text-default-600">{position.shortDescription}</p>
          {attributes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Required Attributes</h3>
              <div className="flex gap-2 flex-wrap">
                {attributes.map((attr) => (
                  <Chip key={attr.id} variant="flat">{attr.name}</Chip>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default function PositionPublicPage() {
  const { id } = useParams();
  return id ? <PositionSingleView id={id} /> : <PositionListView />;
}