import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tabs, Tab, Card, CardBody, Chip, Spinner } from '@heroui/react';
import { UserIcon, InformationCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import DataTable from '../../components/shared/DataTable';
import Toolbar from '../../components/shared/Toolbar';
import AttributeValueField from '../../components/profile/AttributeValueField';
import { useProfileAttributes } from '../../hooks/useProfileAttributes';

export default function ProfilePage() {
  const { userId: targetUserId } = useParams(); // undefined on /profile, set on /admin/users/:userId/profile
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('me');
  const [selectedAttrKeys, setSelectedAttrKeys] = useState(new Set());

  const {
    isLoading,
    meAttributes,
    infoAttributes,
    addableAttributes,
    attributeMetaById,
    savingIds,
    conflictIds,
    imageErrors,
    markDirty,
    getPendingValue,
    addAttribute,
    removeAttributes,
    uploadImage,
  } = useProfileAttributes(targetUserId);

  const renderField = (attr) => (
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
  );

  const handleRemoveSelected = async () => {
    await removeAttributes(Array.from(selectedAttrKeys).map(Number));
    setSelectedAttrKeys(new Set());
  };

  const infoColumns = [
    { key: 'attributeName', label: t('profile.name') },
    { key: 'value', label: t('profile.value'), renderCell: renderField },
    {
      key: 'isFilled',
      label: '',
      renderCell: (item) => !item.isFilled && <Chip size="sm" color="danger" variant="flat">{t('profile.empty')}</Chip>,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">{t('profile.profile')}</h1>

      {targetUserId && (
        <div className="bg-warning-50 border border-warning-200 text-warning-700 text-sm rounded-lg px-4 py-2">
          You're editing another user's profile as an administrator.
        </div>
      )}

      <Tabs selectedKey={activeTab} onSelectionChange={setActiveTab}>
        <Tab key="me" title={<div className="flex items-center gap-2"><UserIcon className="w-4 h-4" /> {t('profile.me')}</div>}>
          <Card>
            <CardBody>
              <div className="space-y-5 max-w-xl">
                {isLoading && <Spinner size="sm" />}
                {!isLoading && meAttributes.length === 0 && (
                  <p className="text-default-500 text-sm">Nothing here yet — these fields will appear once your profile has some.</p>
                )}
                {meAttributes.map((attr) => (
                  <div key={attr.attributeId} className="border border-default-200 rounded-xl p-4 bg-content1">
                    <label className="text-sm font-medium text-default-700 mb-2 block">{attr.attributeName}</label>
                    {renderField(attr)}
                    {!attr.isFilled && <p className="text-danger text-xs mt-2">Not filled in yet</p>}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="info" title={<div className="flex items-center gap-2"><InformationCircleIcon className="w-4 h-4" /> {t('profile.info')}</div>}>
          <Card>
            <CardBody className="space-y-4">
              <div className="border border-default-300 bg-content1 rounded-xl p-4">
                <label className="text-sm font-medium text-default-700 mb-2 block">{t('profile.addAttribute')}</label>
                <div className="flex gap-2">
                  <select
                    id="add-attribute-select"
                    className="flex-1 p-2 rounded-lg border border-default-300 bg-background text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    defaultValue=""
                  >
                    <option value="" disabled>{t('profile.chooseAttribute')}…</option>
                    {addableAttributes.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      const select = document.getElementById('add-attribute-select');
                      if (select.value) {
                        addAttribute(select.value);
                        select.value = '';
                      }
                    }}
                  >
                    {t('profile.add')}
                  </button>
                </div>
              </div>

              <div className="border-b border-default-200 pb-3">
                <Toolbar
                  actions={[
                    {
                      label: t('profile.removeAttribute'),
                      icon: <TrashIcon className="w-4 h-4" />,
                      color: 'danger',
                      variant: 'flat',
                      requiresSelection: true,
                      onClick: handleRemoveSelected,
                    },
                  ]}
                  selectedCount={selectedAttrKeys.size}
                />
              </div>

              <DataTable
                columns={infoColumns}
                data={infoAttributes}
                keyField="attributeId"
                selectedKeys={selectedAttrKeys}
                onSelectionChange={setSelectedAttrKeys}
                isLoading={isLoading}
                removeWrapper
                emptyContent="Nothing added here yet — pick an attribute above to get started."
              />
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}