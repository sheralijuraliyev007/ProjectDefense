import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Chip,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DataTable from '../../components/shared/DataTable';
import Toolbar from '../../components/shared/Toolbar';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import attributeApi from '../../api/attributeApi';

const attributeTypes = ['string', 'text', 'image', 'numeric', 'date', 'period', 'boolean', 'dropdown'];
const categories = ['Certification', 'Domain Knowledge', 'Personal Information', 'Soft Skills', 'Technical Skills', 'Language'];

const attributeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  dataType: z.string().min(1, 'Type is required'),
});

export default function AttributeLibraryPage() {
  const { t } = useTranslation();
  const [attributes, setAttributes] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searchPrefix, setSearchPrefix] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingAttribute, setEditingAttribute] = useState(null);
  
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(attributeSchema),
  });

  const fetchAttributes = useCallback(async () => {
    setIsLoading(true);
    try {
      let response;
      if (searchPrefix) {
        response = await attributeApi.searchByPrefix(searchPrefix, 50);
      } else {
        response = await attributeApi.search({
          page: 1,
          pageSize: 50,
          category: categoryFilter || undefined,
        });
      }
      setAttributes(response.data.data?.items || response.data.data || []);
    } finally {
      setIsLoading(false);
    }
  }, [searchPrefix, categoryFilter]);

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  const selectedIds = Array.from(selectedKeys).map(Number);

  const handleCreate = () => {
    setEditingAttribute(null);
    reset({});
    onFormOpen();
  };

  const handleEdit = () => {
    const attr = attributes.find(a => a.id === selectedIds[0]);
    setEditingAttribute(attr);
    reset(attr);
    onFormOpen();
  };

  const onSubmit = async (data) => {
    try {
      if (editingAttribute) {
        await attributeApi.update(editingAttribute.id, data);
      } else {
        await attributeApi.create(data);
      }
      onFormClose();
      setSelectedKeys(new Set());
      fetchAttributes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => attributeApi.delete(id)));
      setSelectedKeys(new Set());
      fetchAttributes();
    } finally {
      onDeleteClose();
    }
  };

  const columns = [
    { key: 'name', label: t('attributes.name'), sortable: true },
    {
      key: 'category',
      label: t('attributes.category'),
      renderCell: (item) => (
        <Chip size="sm" color="secondary" variant="flat">{item.category}</Chip>
      ),
    },
    {
      key: 'dataType',
      label: t('attributes.type'),
      renderCell: (item) => (
        <Chip size="sm" color="default" variant="flat">
          {t(`attributes.types.${item.dataType}`)}
        </Chip>
      ),
    },
    { key: 'description', label: t('attributes.description') },
  ];

  const toolbarActions = [
    {
      label: t('common.edit'),
      icon: <PencilIcon className="w-4 h-4" />,
      color: 'secondary',
      requiresSelection: true,
      onClick: handleEdit,
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
      label: t('attributes.create'),
      icon: <PlusIcon className="w-4 h-4" />,
      color: 'primary',
      requiresSelection: false,
      onClick: handleCreate,
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('attributes.title')}</h1>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <Input
          className="max-w-xs"
          placeholder={t('attributes.searchByPrefix')}
          startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
          value={searchPrefix}
          onChange={(e) => setSearchPrefix(e.target.value)}
        />
        <Select
          className="max-w-xs"
          placeholder={t('attributes.allCategories')}
          selectedKeys={categoryFilter ? [categoryFilter] : []}
          onSelectionChange={(keys) => setCategoryFilter(Array.from(keys)[0] || '')}
        >
          {categories.map(cat => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </Select>
      </div>

      <Toolbar
        actions={toolbarActions}
        selectedCount={selectedKeys.size}
      />

      <DataTable
        columns={columns}
        data={attributes}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        isLoading={isLoading}
        emptyContent={t('attributes.noAttributes')}
      />

      {/* Create/Edit Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="lg">
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>
              {editingAttribute ? t('attributes.edit') : t('attributes.create')}
            </ModalHeader>
            <ModalBody className="gap-4">
              <Input
                {...register('name')}
                label={t('attributes.name')}
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message}
              />
              <Select
                label={t('attributes.category')}
                selectedKeys={[]}
                onSelectionChange={(keys) => setValue('category', Array.from(keys)[0])}
                isInvalid={!!errors.category}
              >
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </Select>
              <Select
                label={t('attributes.type')}
                selectedKeys={[]}
                onSelectionChange={(keys) => setValue('dataType', Array.from(keys)[0])}
                isInvalid={!!errors.dataType}
              >
                {attributeTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {t(`attributes.types.${type}`)}
                  </SelectItem>
                ))}
              </Select>
              <Input
                {...register('description')}
                label={t('attributes.description')}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onFormClose}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" color="primary" isLoading={isSubmitting}>
                {t('common.save')}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDelete}
        title={t('common.delete')}
        message={t('attributes.confirmDelete')}
        confirmColor="danger"
      />
    </div>
  );
}