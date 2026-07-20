import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Input,
  Badge,
  Divider,
  Tooltip,
  Spinner,
} from '@heroui/react';
import {
  ArrowLeftIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';
import cvApi from '../../api/cvApi';
import positionApi from '../../api/positionApi';
import MarkdownEditor from '../../components/shared/MarkdownEditor';
import TagInput from '../../components/shared/TagInput';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';


export default function CVEditPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  
  const [cv, setCv] = useState(null);
  const [position, setPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [cvResponse, positionResponse] = await Promise.all([
          cvApi.getById(id),
          cvApi.getAttributes(id).then(async (attrRes) => {
            // Get position details from CV data
            const cvData = cvResponse.data.data;
            return positionApi.getById(cvData.positionId);
          }),
        ]);
        
        setCv(cvResponse.data.data);
        setPosition(positionResponse?.data?.data);
      } catch (err) {
        addNotification('Failed to load CV', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const updateCvField = useCallback((field, value) => {
    setCv(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const updateAttributeValue = useCallback((attributeId, value) => {
    setCv(prev => ({
      ...prev,
      attributes: prev.attributes.map(attr =>
        attr.id === attributeId ? { ...attr, value } : attr
      ),
    }));
    setHasChanges(true);
  }, []);

  const updateProjectSelection = useCallback((projectId, selected) => {
    setCv(prev => ({
      ...prev,
      selectedProjects: selected
        ? [...prev.selectedProjects, projectId]
        : prev.selectedProjects.filter(id => id !== projectId),
    }));
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await cvApi.update(id, {
        attributes: cv.attributes,
        selectedProjects: cv.selectedProjects,
        customValues: cv.customValues,
      });
      setHasChanges(false);
      addNotification('CV saved successfully', 'success');
    } catch (err) {
      if (err.response?.status === 409) {
        addNotification('Version conflict - please refresh', 'error');
      } else {
        addNotification('Save failed', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    // Check if all required attributes are filled
    const emptyRequired = cv.attributes.filter(
      attr => attr.isRequired && !attr.value && attr.value !== 0 && attr.value !== false
    );
    
    if (emptyRequired.length > 0) {
      addNotification(t('cvs.publishWarning'), 'warning');
      return;
    }

    setIsPublishing(true);
    try {
      await cvApi.publish(id);
      setCv(prev => ({ ...prev, status: 'Published', isPublished: true }));
      addNotification('CV published successfully', 'success');
    } catch (err) {
      addNotification('Publish failed', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const renderAttributeInput = (attr) => {
    const isEmpty = !attr.value && attr.value !== 0 && attr.value !== false;
    const baseClass = isEmpty ? 'border-danger text-danger' : '';

    switch (attr.dataType) {
      case 'string':
        return (
          <Input
            value={attr.value || ''}
            onChange={(e) => updateAttributeValue(attr.id, e.target.value)}
            className={baseClass}
            placeholder={isEmpty ? t('cvs.emptyValue') : ''}
          />
        );
      case 'text':
        return (
          <MarkdownEditor
            value={attr.value || ''}
            onChange={(value) => updateAttributeValue(attr.id, value)}
          />
        );
      case 'numeric':
        return (
          <Input
            type="number"
            value={attr.value ?? ''}
            onChange={(e) => updateAttributeValue(attr.id, e.target.value === '' ? null : Number(e.target.value))}
            className={baseClass}
            placeholder={isEmpty ? t('cvs.emptyValue') : ''}
          />
        );
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!attr.value}
              onChange={(e) => updateAttributeValue(attr.id, e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <span className={isEmpty ? 'text-danger' : ''}>
              {isEmpty ? t('cvs.emptyValue') : (attr.value ? 'Yes' : 'No')}
            </span>
          </div>
        );
      case 'date':
        return (
          <Input
            type="date"
            value={attr.value || ''}
            onChange={(e) => updateAttributeValue(attr.id, e.target.value)}
            className={baseClass}
          />
        );
      case 'dropdown':
        return (
          <select
            value={attr.value || ''}
            onChange={(e) => updateAttributeValue(attr.id, e.target.value || null)}
            className={`w-full p-2 rounded-lg border bg-background ${isEmpty ? 'border-danger text-danger' : 'border-default-200'}`}
          >
            <option value="">{t('cvs.emptyValue')}</option>
            {attr.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'image':
        return (
          <div className="space-y-2">
            {attr.value ? (
              <div className="relative">
                <img src={attr.value} alt={attr.name} className="max-h-32 rounded-lg" />
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={() => updateAttributeValue(attr.id, null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${isEmpty ? 'border-danger' : 'border-default-200'}`}>
                <p className="text-sm text-default-500">Drag & drop or click to upload</p>
                <p className="text-xs text-danger">{isEmpty ? t('cvs.emptyValue') : ''}</p>
              </div>
            )}
          </div>
        );
      default:
        return <Input value={attr.value || ''} readOnly />;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Spinner size="lg" /></div>;
  }

  if (!cv) return null;

  const emptyAttributesCount = cv.attributes.filter(
    attr => !attr.value && attr.value !== 0 && attr.value !== false
  ).length;

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button isIconOnly variant="light" onPress={() => navigate(-1)}>
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{position?.title}</h1>
            <p className="text-default-500 text-sm">{position?.company} • {position?.level}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge color="warning" size="sm">Unsaved changes</Badge>
          )}
          <Chip
            color={cv.isPublished ? 'success' : 'default'}
            variant="flat"
            startContent={cv.isPublished ? <CheckCircleIcon className="w-4 h-4" /> : <ExclamationCircleIcon className="w-4 h-4" />}
          >
            {cv.isPublished ? t('cvs.published') : t('cvs.draft')}
          </Chip>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end gap-2">
        <Button
          variant="flat"
          onPress={handleSave}
          isLoading={isSaving}
          isDisabled={!hasChanges}
        >
          {t('common.save')}
        </Button>
        {!cv.isPublished && (
          <Button
            color="success"
            onPress={handlePublish}
            isLoading={isPublishing}
            startContent={<DocumentArrowUpIcon className="w-4 h-4" />}
          >
            {t('cvs.publish')}
          </Button>
        )}
      </div>

      {/* Empty Values Warning */}
      {emptyAttributesCount > 0 && (
        <Card className="bg-danger-50 border-danger-200">
          <CardBody className="flex items-center gap-2 text-danger">
            <ExclamationCircleIcon className="w-5 h-5" />
            <span>{emptyAttributesCount} attribute(s) not filled. Fill all to publish.</span>
          </CardBody>
        </Card>
      )}

      {/* CV Sections */}
      <div className="space-y-6">
        {/* Built-in Profile Section */}
        <Card>
          <CardHeader className="text-lg font-semibold">Profile Information</CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-default-500">First Name</label>
                <p className="font-medium">{user?.firstName}</p>
              </div>
              <div>
                <label className="text-sm text-default-500">Last Name</label>
                <p className="font-medium">{user?.lastName}</p>
              </div>
              <div>
                <label className="text-sm text-default-500">Location</label>
                <p className="font-medium">{user?.location || '-'}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Position Attributes */}
        <Card>
          <CardHeader className="text-lg font-semibold">Position Attributes</CardHeader>
          <CardBody className="space-y-6">
            {cv.attributes.map((attr) => {
              const isEmpty = !attr.value && attr.value !== 0 && attr.value !== false;
              return (
                <div key={attr.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className={`font-medium ${isEmpty ? 'text-danger' : ''}`}>
                      {attr.name}
                    </label>
                    {attr.isRequired && <Chip size="sm" color="danger" variant="flat">Required</Chip>}
                    {attr.source === 'profile' && (
                      <Tooltip content={t('cvs.autoFill')}>
                        <Chip size="sm" color="success" variant="flat">From Profile</Chip>
                      </Tooltip>
                    )}
                  </div>
                  {attr.description && (
                    <p className="text-xs text-default-400">{attr.description}</p>
                  )}
                  {renderAttributeInput(attr)}
                </div>
              );
            })}
          </CardBody>
        </Card>

        {/* Projects Selection */}
        <Card>
          <CardHeader className="text-lg font-semibold">
            Projects
            <span className="text-sm text-default-500 ml-2">
              ({cv.selectedProjects?.length || 0} / {position?.maxProjects || '∞'})
            </span>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {cv.availableProjects?.map((project) => {
                const isSelected = cv.selectedProjects?.includes(project.id);
                return (
                  <div
                    key={project.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      isSelected ? 'border-primary bg-primary-50' : 'border-default-200 hover:border-default-400'
                    }`}
                    onClick={() => updateProjectSelection(project.id, !isSelected)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-default-500">
                          {project.startDate} - {project.endDate || 'Present'}
                        </p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {project.tags.map(tag => (
                            <Chip key={tag} size="sm" variant="flat">{tag}</Chip>
                          ))}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-5 h-5 mt-1"
                      />
                    </div>
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-primary-200">
                        <div className="markdown-content text-sm" dangerouslySetInnerHTML={{
                          __html: project.description?.replace(/\n/g, '<br>') || ''
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}