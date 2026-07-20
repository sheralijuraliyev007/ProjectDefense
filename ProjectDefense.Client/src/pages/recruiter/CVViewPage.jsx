import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Divider,
  Avatar,
  Badge,
} from '@heroui/react';
import {
  ArrowLeftIcon,
  HeartIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import cvApi from '../../api/cvApi';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export default function CVViewPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  
  const [cv, setCv] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    const loadCV = async () => {
      try {
        const response = await cvApi.getById(id);
        const cvData = response.data.data;
        setCv(cvData);
        setIsLiked(cvData.isLikedByCurrentUser);
        setLikesCount(cvData.likesCount);
      } catch (err) {
        addNotification('Failed to load CV', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadCV();
  }, [id]);

  const handleLike = async () => {
    try {
      if (isLiked) {
        // Unlike API call
        await cvApi.unlike(id);
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like API call
        await cvApi.like(id);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (err) {
      addNotification('Action failed', 'error');
    }
  };

  const renderAttributeValue = (attr) => {
    const isEmpty = !attr.value && attr.value !== 0 && attr.value !== false;

    if (isEmpty) {
      return <span className="empty-value">{t('cvs.emptyValue')}</span>;
    }

    switch (attr.dataType) {
      case 'boolean':
        return attr.value ? 'Yes' : 'No';
      case 'image':
        return <img src={attr.value} alt={attr.name} className="max-h-32 rounded-lg" />;
      case 'text':
        return (
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: attr.value.replace(/\n/g, '<br>') }}
          />
        );
      default:
        return String(attr.value);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Spinner size="lg" /></div>;
  }

  if (!cv) return null;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button isIconOnly variant="light" onPress={() => navigate(-1)}>
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">CV for {cv.positionTitle}</h1>
            <p className="text-default-500 text-sm">
              Candidate: {cv.candidateName} • {cv.candidateEmail}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isLiked ? 'solid' : 'flat'}
            color={isLiked ? 'danger' : 'default'}
            onPress={handleLike}
            startContent={<HeartIcon className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />}
          >
            {likesCount} {t('cvs.likes')}
          </Button>
          <Button
            variant="flat"
            startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* CV Content - Read Only */}
      <div className="space-y-6">
        {/* Candidate Profile */}
        <Card>
          <CardHeader className="text-lg font-semibold">Candidate Profile</CardHeader>
          <CardBody>
            <div className="flex items-center gap-4 mb-4">
              <Avatar
                src={cv.candidatePhotoUrl}
                name={cv.candidateName}
                className="w-20 h-20 text-xl"
              />
              <div>
                <h3 className="text-xl font-bold">{cv.candidateName}</h3>
                <p className="text-default-500">{cv.candidateLocation}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Attributes */}
        <Card>
          <CardHeader className="text-lg font-semibold">Attributes</CardHeader>
          <CardBody className="space-y-4">
            {cv.attributes?.map((attr) => {
              const isEmpty = !attr.value && attr.value !== 0 && attr.value !== false;
              return (
                <div key={attr.id} className={`p-3 rounded-lg ${isEmpty ? 'bg-danger-50' : 'bg-default-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-default-600">{attr.name}</span>
                    {isEmpty && <Badge color="danger" size="sm">Empty</Badge>}
                  </div>
                  <div className={isEmpty ? 'text-danger font-medium' : ''}>
                    {renderAttributeValue(attr)}
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        {/* Selected Projects */}
        <Card>
          <CardHeader className="text-lg font-semibold">Projects</CardHeader>
          <CardBody className="space-y-4">
            {cv.projects?.map((project) => (
              <div key={project.id} className="p-4 bg-default-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{project.name}</h4>
                  <span className="text-sm text-default-500">
                    {project.startDate} - {project.endDate || 'Present'}
                  </span>
                </div>
                <div className="flex gap-1 mb-3 flex-wrap">
                  {project.tags.map(tag => (
                    <Chip key={tag} size="sm" variant="flat">{tag}</Chip>
                  ))}
                </div>
                <div
                  className="markdown-content text-sm text-default-600"
                  dangerouslySetInnerHTML={{ __html: project.description?.replace(/\n/g, '<br>') || '' }}
                />
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Status */}
        <Card>
          <CardBody className="flex items-center justify-between">
            <div>
              <span className="text-sm text-default-500">Status: </span>
              <Chip color={cv.isPublished ? 'success' : 'default'} variant="flat">
                {cv.isPublished ? t('cvs.published') : t('cvs.draft')}
              </Chip>
            </div>
            <span className="text-sm text-default-500">
              Last updated: {new Date(cv.updatedAt).toLocaleString()}
            </span>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}