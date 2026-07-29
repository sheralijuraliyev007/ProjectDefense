import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Chip, Spinner, Button } from '@heroui/react';
import AttributeValueField from '../../components/profile/AttributeValueField';
import { useCvAttributes } from '../../hooks/useCvAttributes';
import { useCvStatusCodes } from '../../hooks/useCvStatusCodes';
import cvApi from '../../api/cvApi';

export default function CVEditPage() {
  const { cvId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [cv, setCv] = useState(null);
  const [publishError, setPublishError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const {
  attributes,
  attributeMetaById,
  isLoading,
  savingIds,
  conflictIds,
  imageErrors,
  markDirty,
  getPendingValue,
  uploadImage,
} = useCvAttributes(cvId);
  const { published: publishedStatusCode } = useCvStatusCodes();

  useEffect(() => {
    cvApi.getById(cvId).then((res) => setCv(res.data.data));
  }, [cvId]);

  const handlePublish = async () => {
    setPublishError('');
    setIsPublishing(true);
    try {
      await cvApi.publish(cvId);
      const res = await cvApi.getById(cvId);
      setCv(res.data.data);
    } catch (err) {
      setPublishError(extractErrorMessage(err, t('cvs.publishFailed', 'Could not publish this CV.')));
  }   
    finally {
      setIsPublishing(false);
    }
  };

  function extractErrorMessage(err, fallback) {
  const errors = err.response?.data?.errors ?? err.response?.data;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0];
    if (typeof first === 'string') return first;
    return first?.errorResult?.errorMessage ?? first?.errorMessage ?? first?.message ?? fallback;
  }
  return err.response?.data?.message || fallback;
}

  const missingCount = attributes.filter((a) => !a.isFilled).length;
  const isPublished = cv?.statusCode === publishedStatusCode;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{cv?.positionTitle ?? t('cvs.editTitle', 'Edit CV')}</h1>
          <p className="text-sm text-default-500">
            {t('cvs.autoFillNote', 'Filled in from your profile — editing a field here updates your profile too.')}
          </p>
        </div>
        <Chip color={isPublished ? 'success' : 'default'} size="sm">
          {isPublished ? t('cvs.published', 'Published') : t('cvs.draft', 'Draft')}
        </Chip>
      </div>

      <Card>
        <CardBody className="space-y-5">
          {isLoading && <Spinner size="sm" />}
          {!isLoading && attributes.length === 0 && (
            <p className="text-default-500 text-sm">
              {t('cvs.noAttributes', 'This position has no required attributes.')}
            </p>
          )}
          {attributes.map((attr) => (
            <div key={attr.attributeId} className="border border-default-200 rounded-xl p-4 bg-content1">
              <label className="text-sm font-medium text-default-700 mb-2 block">{attr.attributeName}</label>
              <AttributeValueField
                attr={attr}
                attributeMetaById={attributeMetaById}
                isSaving={savingIds.has(attr.attributeId)}
                hasConflict={conflictIds.has(attr.attributeId)}
                imageError={imageErrors[attr.attributeId]}
                pendingValue={getPendingValue(attr.attributeId)}
                onChange={(rawValue) => markDirty(attr, rawValue)}
                onImageUpload={(file) => uploadImage(attr, file)}
              />
              {!attr.isFilled && <p className="text-danger text-xs mt-2">{t('cvs.emptyField', 'Not filled in')}</p>}
            </div>
          ))}
        </CardBody>
      </Card>

      <div className="flex items-center gap-3">
        <Button
          color="primary"
          isDisabled={isPublished || missingCount > 0}
          isLoading={isPublishing}
          onPress={handlePublish}
        >
          {isPublished ? t('cvs.alreadyPublished', 'Already published') : t('cvs.publish', 'Publish CV')}
        </Button>
        {missingCount > 0 && !isPublished && (
          <span className="text-sm text-default-500">
            {t('cvs.missingCount', `${missingCount} field(s) still empty`)}
          </span>
        )}
        {publishError && <span className="text-danger text-sm">{publishError}</span>}
        <Button variant="light" onPress={() => navigate('/profile/cvs')}>
          {t('common.back', 'Back')}
        </Button>
      </div>
    </div>
  );
}