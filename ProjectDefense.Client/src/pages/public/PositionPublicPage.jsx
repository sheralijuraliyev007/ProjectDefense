import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Chip, Button, Spinner } from '@heroui/react';
import { LockClosedIcon, ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import positionApi from '../../api/positionApi';
import cvApi from '../../api/cvApi';
import { useAuth } from '../../contexts/AuthContext';
import { useCvStatusCodes } from '../../hooks/useCvStatusCodes';


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
  const { isAuthenticated, hasRole } = useAuth();
  const { published: publishedStatusCode } = useCvStatusCodes();

  const [position, setPosition] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [myCv, setMyCv] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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

      if (isAuthenticated && hasRole(['Candidate'])) {
        const cvRes = await cvApi.search({ page: 1, pageSize: 1, positionId: Number(id) });
        const existing = cvRes.data.data?.rows?.[0];
        setMyCv(existing ?? null);
      }
    } catch (err) {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [id, isAuthenticated, hasRole]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateCv = async () => {
    setCreateError('');
    setIsCreating(true);
    try {
      const res = await cvApi.create({ positionId: Number(id) });
      navigate(`/candidate/cv/${res.data.data}/edit`);
    } catch (err) {
      setCreateError(err.response?.data?.errors?.[0] || 'Could not create a CV for this position.');
    } finally {
      setIsCreating(false);
    }
  };

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

        {isAuthenticated && hasRole(['Candidate']) && myCv && (
          <Button color="primary" startContent={<DocumentTextIcon className="w-4 h-4" />} onPress={() => navigate(`/candidate/cv/${myCv.id}/edit`)}>
            {myCv.statusCode === publishedStatusCode ? 'View your CV' : 'Continue your CV'}
          </Button>
        )}

        {isAuthenticated && hasRole(['Candidate']) && !myCv && (
          <Button color="primary" isLoading={isCreating} onPress={handleCreateCv}>
            Create CV for this position
          </Button>
        )}
      </div>

      {createError && <p className="text-danger text-sm">{createError}</p>}

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