import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Input,
  Button,
  Avatar,
  Chip,
  Badge,
} from '@heroui/react';
import {
  UserIcon,
  InformationCircleIcon,
  FolderIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useDebounce } from '../../hooks/useDebounce';
import { useAutoSave } from '../../hooks/useAutoSave';
import MarkdownEditor from '../../components/shared/MarkdownEditor';
import TagInput from '../../components/shared/TagInput';
import DataTable from '../../components/shared/DataTable';
import Toolbar from '../../components/shared/Toolbar';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { useDisclosure } from '@heroui/react';

// API imports (you'll need to create these)
const profileApi = {
  getProfile: () => Promise.resolve({}),
  saveProfile: (data, version) => Promise.resolve({ newVersion: version + 1 }),
  getAvailableAttributes: () => Promise.resolve([]),
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('me');
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    location: '',
    photoUrl: '',
    infoAttributes: [],
    projects: [],
    cvs: [],
  });
  const [version, setVersion] = useState(0);
  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [selectedProjectKeys, setSelectedProjectKeys] = useState(new Set());
  const [editingProject, setEditingProject] = useState(null);

  // Auto-save hook
  const { isSaving, lastSaved, conflict, resolveConflict } = useAutoSave(
    async (data, ver) => {
      const result = await profileApi.saveProfile(data, ver);
      setVersion(result.newVersion);
      return result;
    },
    profile,
    { delay: 7000, version }
  );

  // Fetch profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      const data = await profileApi.getProfile();
      setProfile(data);
      setVersion(data.version || 0);
    };
    loadProfile();
  }, []);

  // Fetch available attributes for "Info" tab
  useEffect(() => {
    const loadAttributes = async () => {
      const attrs = await profileApi.getAvailableAttributes();
      setAvailableAttributes(attrs);
    };
    loadAttributes();
  }, []);

  const updateProfile = useCallback((updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  // ─── ME SECTION ───
  const MeSection = () => (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Avatar
          src={profile.photoUrl}
          name={`${profile.firstName} ${profile.lastName}`}
          className="w-24 h-24 text-2xl"
        />
        <div>
          <h3 className="text-lg font-semibold">{t('profile.me')}</h3>
          <p className="text-default-500 text-sm">{t('profile.autoSave')}</p>
          {isSaving && <Badge color="warning" size="sm">{t('profile.saving')}</Badge>}
          {lastSaved && <Badge color="success" size="sm">{t('profile.saved')}</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('profile.firstName')}
          value={profile.firstName}
          onChange={(e) => updateProfile({ firstName: e.target.value })}
        />
        <Input
          label={t('profile.lastName')}
          value={profile.lastName}
          onChange={(e) => updateProfile({ lastName: e.target.value })}
        />
      </div>
      <Input
        label={t('profile.location')}
        value={profile.location}
        onChange={(e) => updateProfile({ location: e.target.value })}
      />
      <Input
        label={t('profile.photo')}
        value={profile.photoUrl}
        onChange={(e) => updateProfile({ photoUrl: e.target.value })}
        placeholder="https://..."
      />
    </div>
  );

  // ─── INFO SECTION ───
  const InfoSection = () => {
    const [selectedAttrKeys, setSelectedAttrKeys] = useState(new Set());
    const { isOpen: isRemoveOpen, onOpen: onRemoveOpen, onClose: onRemoveClose } = useDisclosure();

    const handleAddAttribute = async (attributeId) => {
      const attr = availableAttributes.find(a => a.id === Number(attributeId));
      if (!attr) return;
      
      updateProfile({
        infoAttributes: [
          ...profile.infoAttributes,
          { ...attr, value: null }
        ]
      });
    };

    const handleRemoveAttributes = () => {
      const idsToRemove = Array.from(selectedAttrKeys).map(Number);
      updateProfile({
        infoAttributes: profile.infoAttributes.filter(a => !idsToRemove.includes(a.id))
      });
      setSelectedAttrKeys(new Set());
      onRemoveClose();
    };

    const handleValueChange = (attrId, value) => {
      updateProfile({
        infoAttributes: profile.infoAttributes.map(a =>
          a.id === attrId ? { ...a, value } : a
        )
      });
    };

    const renderAttributeInput = (attr) => {
      switch (attr.dataType) {
        case 'string':
          return (
            <Input
              value={attr.value || ''}
              onChange={(e) => handleValueChange(attr.id, e.target.value)}
              placeholder={attr.name}
            />
          );
        case 'numeric':
          return (
            <Input
              type="number"
              value={attr.value || ''}
              onChange={(e) => handleValueChange(attr.id, Number(e.target.value))}
              placeholder={attr.name}
            />
          );
        case 'boolean':
          return (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!attr.value}
                onChange={(e) => handleValueChange(attr.id, e.target.checked)}
                className="w-4 h-4"
              />
              <span>{attr.name}</span>
            </div>
          );
        case 'dropdown':
          return (
            <select
              value={attr.value || ''}
              onChange={(e) => handleValueChange(attr.id, e.target.value)}
              className="w-full p-2 rounded-lg border border-default-200 bg-background"
            >
              <option value="">Select...</option>
              {/* Options would come from attribute definition */}
            </select>
          );
        case 'date':
          return (
            <Input
              type="date"
              value={attr.value || ''}
              onChange={(e) => handleValueChange(attr.id, e.target.value)}
            />
          );
        default:
          return <Input value={attr.value || ''} readOnly placeholder="Not supported yet" />;
      }
    };

    const attrColumns = [
      { key: 'name', label: t('attributes.name') },
      { key: 'category', label: t('attributes.category') },
      {
        key: 'value',
        label: 'Value',
        renderCell: (item) => renderAttributeInput(item),
      },
    ];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <select
            onChange={(e) => handleAddAttribute(e.target.value)}
            className="p-2 rounded-lg border border-default-200 bg-background"
            value=""
          >
            <option value="">{t('profile.addAttribute')}</option>
            {availableAttributes
              .filter(a => !profile.infoAttributes.some(ia => ia.id === a.id))
              .map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.category})</option>
              ))}
          </select>
        </div>

        <Toolbar
          actions={[
            {
              label: t('profile.removeAttribute'),
              icon: <TrashIcon className="w-4 h-4" />,
              color: 'danger',
              variant: 'flat',
              requiresSelection: true,
              onClick: onRemoveOpen,
            },
          ]}
          selectedCount={selectedAttrKeys.size}
        />

        <DataTable
          columns={attrColumns}
          data={profile.infoAttributes}
          selectedKeys={selectedAttrKeys}
          onSelectionChange={setSelectedAttrKeys}
          selectionMode="multiple"
        />

        <ConfirmDialog
          isOpen={isRemoveOpen}
          onClose={onRemoveClose}
          onConfirm={handleRemoveAttributes}
          title={t('profile.removeAttribute')}
          message="Remove selected attributes?"
          confirmColor="danger"
        />
      </div>
    );
  };

  // ─── PROJECTS SECTION ───
  const ProjectsSection = () => {
    const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    const handleSaveProject = (projectData) => {
      if (editingProject) {
        updateProfile({
          projects: profile.projects.map(p =>
            p.id === editingProject.id ? { ...projectData, id: p.id } : p
          )
        });
      } else {
        updateProfile({
          projects: [...profile.projects, { ...projectData, id: Date.now() }]
        });
      }
      setEditingProject(null);
      onFormClose();
    };

    const handleDeleteProjects = () => {
      const idsToRemove = Array.from(selectedProjectKeys).map(Number);
      updateProfile({
        projects: profile.projects.filter(p => !idsToRemove.includes(p.id))
      });
      setSelectedProjectKeys(new Set());
      onDeleteClose();
    };

    const projectColumns = [
      { key: 'name', label: t('profile.projectName') },
      {
        key: 'period',
        label: t('profile.period'),
        renderCell: (item) => `${item.startDate} - ${item.endDate || 'Present'}`,
      },
      {
        key: 'tags',
        label: t('profile.technologyTags'),
        renderCell: (item) => (
          <div className="flex gap-1 flex-wrap">
            {item.tags.map(tag => (
              <Chip key={tag} size="sm" variant="flat">{tag}</Chip>
            ))}
          </div>
        ),
      },
    ];

    return (
      <div className="space-y-4">
        <Toolbar
          actions={[
            {
              label: t('common.edit'),
              icon: <PencilIcon className="w-4 h-4" />,
              color: 'secondary',
              requiresSelection: true,
              onClick: () => {
                const id = Array.from(selectedProjectKeys)[0];
                setEditingProject(profile.projects.find(p => p.id === Number(id)));
                onFormOpen();
              },
            },
            {
              label: t('common.delete'),
              icon: <TrashIcon className="w-4 h-4" />,
              color: 'danger',
              variant: 'flat',
              requiresSelection: true,
              onClick: onDeleteOpen,
            },
            {
              label: t('profile.addProject'),
              icon: <PlusIcon className="w-4 h-4" />,
              color: 'primary',
              requiresSelection: false,
              onClick: () => {
                setEditingProject(null);
                onFormOpen();
              },
            },
          ]}
          selectedCount={selectedProjectKeys.size}
        />

        <DataTable
          columns={projectColumns}
          data={profile.projects}
          selectedKeys={selectedProjectKeys}
          onSelectionChange={setSelectedProjectKeys}
          selectionMode="multiple"
        />

        {/* Project Form Modal */}
        <ProjectFormModal
          isOpen={isFormOpen}
          onClose={onFormClose}
          onSave={handleSaveProject}
          initialData={editingProject}
        />

        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          onConfirm={handleDeleteProjects}
          title={t('common.delete')}
          message="Delete selected projects?"
          confirmColor="danger"
        />
      </div>
    );
  };

  // ─── CVs SECTION ───
  const CVsSection = () => {
    const cvColumns = [
      { key: 'positionTitle', label: t('positions.title_col') },
      {
        key: 'status',
        label: t('cvs.status'),
        renderCell: (item) => (
          <Chip color={item.isPublished ? 'success' : 'default'} size="sm">
            {item.isPublished ? t('cvs.published') : t('cvs.draft')}
          </Chip>
        ),
      },
      { key: 'updatedAt', label: t('positions.updatedAt') },
    ];

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('profile.cvs')}</h3>
        <DataTable
          columns={cvColumns}
          data={profile.cvs}
          emptyContent={t('cvs.noCvs')}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('user.profile')}</h1>
        <div className="flex items-center gap-2">
          {isSaving && <Chip size="sm" color="warning">{t('profile.saving')}</Chip>}
          {lastSaved && (
            <Chip size="sm" color="success">
              {t('profile.saved')} {lastSaved.toLocaleTimeString()}
            </Chip>
          )}
          {conflict && (
            <Chip size="sm" color="danger">
              {t('profile.saveError')}
            </Chip>
          )}
        </div>
      </div>

      <Tabs selectedKey={activeTab} onSelectionChange={setActiveTab}>
        <Tab key="me" title={<div className="flex items-center gap-2"><UserIcon className="w-4 h-4" /> {t('profile.me')}</div>}>
          <Card><CardBody><MeSection /></CardBody></Card>
        </Tab>
        <Tab key="info" title={<div className="flex items-center gap-2"><InformationCircleIcon className="w-4 h-4" /> {t('profile.info')}</div>}>
          <Card><CardBody><InfoSection /></CardBody></Card>
        </Tab>
        <Tab key="projects" title={<div className="flex items-center gap-2"><FolderIcon className="w-4 h-4" /> {t('profile.projects')}</div>}>
          <Card><CardBody><ProjectsSection /></CardBody></Card>
        </Tab>
        <Tab key="cvs" title={<div className="flex items-center gap-2"><DocumentTextIcon className="w-4 h-4" /> {t('profile.cvs')}</div>}>
          <Card><CardBody><CVsSection /></CardBody></Card>
        </Tab>
      </Tabs>
    </div>
  );
}

// Project Form Modal Component
function ProjectFormModal({ isOpen, onClose, onSave, initialData }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    tags: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: '', startDate: '', endDate: '', description: '', tags: [] });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {initialData ? t('profile.editProject') : t('profile.addProject')}
          </ModalHeader>
          <ModalBody className="gap-4">
            <Input
              label={t('profile.projectName')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div className="flex gap-2">
              <Input
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              <Input
                type="date"
                label="End Date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <MarkdownEditor
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder={t('profile.projectDescription')}
            />
            <TagInput
              tags={formData.tags}
              onChange={(tags) => setFormData({ ...formData, tags })}
              placeholder="React, TypeScript, Node.js..."
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>{t('common.cancel')}</Button>
            <Button type="submit" color="primary">{t('common.save')}</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}