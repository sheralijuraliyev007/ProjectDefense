import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Input, Select, SelectItem, Switch, Chip, Pagination } from '@heroui/react';
import { PencilIcon, TrashIcon, DocumentDuplicateIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DataTable from '../../components/shared/DataTable';
import Toolbar from '../../components/shared/Toolbar';
import positionApi from '../../api/positionApi';

const positionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  shortDescription: z.string().min(1, 'Short description is required'),
  isPublic: z.boolean(),
  maxProjects: z.coerce.number().int().min(0),
});

// Turns an axios error into a message worth showing the user.
//
// IMPORTANT: if err.response is missing entirely, the request never reached
// the server (or never got a response back) — that's a network/CORS/wrong-port
// problem, not something the user did wrong. We say so explicitly instead of
// falling back to a generic "could not save" message that hides the real cause.
function extractErrorMessage(err, fallback) {
  if (!err.response) {
    return 'Could not reach the server. Check that the API is running and that the frontend is pointed at the right URL (see axiosConfig.js baseURL).';
  }

  const errors = err.response.data?.errors ?? err.response.data;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0];
    if (typeof first === 'string') return first;
    return first?.errorMessage ?? first?.message ?? fallback;
  }
  return err.response.data?.message || fallback;
}

export default function PositionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [positions, setPositions] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const [editingPosition, setEditingPosition] = useState(null);
  const [formError, setFormError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(positionSchema),
    defaultValues: { title: '', shortDescription: '', isPublic: true, maxProjects: 5 },
  });

  const currentIsPublic = watch('isPublic');

  const fetchPositions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await positionApi.search({ page, pageSize });
      const data = response.data.data; // PaginationModel<PositionDto>: { rows, pageIndex, pageSize, total }
      setPositions(data?.rows ?? []);
      setTotalPages(Math.max(1, Math.ceil((data?.total ?? 0) / pageSize)));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const selectedIds = Array.from(selectedKeys).map(Number);

  const clearForm = () => {
    setEditingPosition(null);
    setFormError('');
    reset({ title: '', shortDescription: '', isPublic: true, maxProjects: 5 });
  };

  const handleEdit = () => {
    const pos = positions.find((p) => p.id === selectedIds[0]);
    if (!pos) return;
    setEditingPosition(pos);
    setFormError('');
    reset({
      title: pos.title,
      shortDescription: pos.shortDescription,
      isPublic: pos.isPublic,
      maxProjects: pos.maxProjects,
    });
  };

  const onSubmit = async (data) => {
    setFormError('');
    try {
      if (editingPosition) {
        await positionApi.update(editingPosition.id, {
          title: data.title,
          shortDescription: data.shortDescription,
          isPublic: data.isPublic,
          maxProjects: data.maxProjects,
          version: editingPosition.version,
        });
      } else {
        await positionApi.create({
          title: data.title,
          shortDescription: data.shortDescription,
          isPublic: data.isPublic,
          maxProjects: data.maxProjects,
          attributeIds: [],
          projectTagLabels: [],
        });
      }
      clearForm();
      setSelectedKeys(new Set());
      fetchPositions();
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Could not save this position.'));
    }
  };

  const handleDelete = async () => {
    const message =
      selectedIds.length > 1
        ? `Delete ${selectedIds.length} positions?`
        : t('positions.confirmDelete');
    if (!window.confirm(message)) return;

    setDeleteError('');
    try {
      await Promise.all(selectedIds.map((id) => positionApi.delete(id)));
      setSelectedKeys(new Set());
      clearForm();
      fetchPositions();
    } catch (err) {
      setDeleteError(extractErrorMessage(err, 'Could not delete one or more positions.'));
    }
  };

  const handleDuplicate = async () => {
    if (!window.confirm('Duplicate this position?')) return;

    try {
      await positionApi.duplicate(selectedIds[0]);
      fetchPositions();
    } finally {
      setSelectedKeys(new Set());
    }
  };

  const columns = [
    { key: 'title', label: t('positions.title_col') },
    { key: 'shortDescription', label: t('positions.description') },
    {
      key: 'isPublic',
      label: t('positions.accessRules'),
      renderCell: (item) => (
        <Chip size="sm" color={item.isPublic ? 'success' : 'warning'} variant="flat">
          {item.isPublic ? t('positions.public') : t('positions.restricted')}
        </Chip>
      ),
    },
    { key: 'maxProjects', label: t('positions.maxProjects') },
    { key: 'cvCount', label: t('positions.cvsCount') },
    { key: 'statusName', label: t('common.status') },
  ];

  const toolbarActions = [
    {
      label: t('positions.manage'),
      icon: <Cog6ToothIcon className="w-4 h-4" />,
      color: 'primary',
      requiresSelection: true,
      onClick: () => navigate(`/recruiter/positions/${selectedIds[0]}`),
    },
    {
      label: t('common.edit'),
      icon: <PencilIcon className="w-4 h-4" />,
      color: 'secondary',
      requiresSelection: true,
      onClick: handleEdit,
    },
    {
      label: t('positions.duplicate'),
      icon: <DocumentDuplicateIcon className="w-4 h-4" />,
      color: 'default',
      requiresSelection: true,
      onClick: handleDuplicate,
    },
    {
      label: t('common.delete'),
      icon: <TrashIcon className="w-4 h-4" />,
      color: 'danger',
      variant: 'flat',
      requiresSelection: true,
      onClick: handleDelete,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <h1 className="text-2xl font-bold">{t('positions.title')}</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`border-l-4 rounded-md p-5 space-y-4 transition-colors ${
          editingPosition ? 'border-warning bg-warning-50/50' : 'border-primary bg-primary-50/50'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={`text-base font-semibold ${editingPosition ? 'text-warning-700' : 'text-primary-700'}`}>
              {editingPosition ? editingPosition.title : t('positions.createNew')}
            </h2>
            <p className="text-xs text-default-500">
              {editingPosition
                ? 'Editing an existing position. Attributes, rules, and project tags are managed separately.'
                : 'Basic info only — you can add attributes and rules after creating it.'}
            </p>
          </div>
          {editingPosition && (
            <Button size="sm" variant="flat" color="warning" onPress={clearForm}>Cancel edit</Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('title')}
            variant="bordered"
            label="Title"
            placeholder="e.g. Backend Developer"
            isInvalid={!!errors.title}
            errorMessage={errors.title?.message}
          />
          <Input
            {...register('maxProjects')}
            type="number"
            variant="bordered"
            label="Max projects in generated CV"
            isInvalid={!!errors.maxProjects}
            errorMessage={errors.maxProjects?.message}
          />
          <Input
            {...register('shortDescription')}
            variant="bordered"
            label="Short description"
            className="sm:col-span-2"
            isInvalid={!!errors.shortDescription}
            errorMessage={errors.shortDescription?.message}
          />
          <div className="sm:col-span-2 flex items-center gap-3">
            <Switch
              isSelected={currentIsPublic}
              onValueChange={(val) => setValue('isPublic', val, { shouldValidate: true })}
            />
            <span className="text-sm">
              {currentIsPublic ? 'Public — visible to all authenticated users' : 'Restricted — needs access rules'}
            </span>
          </div>
        </div>

        {formError && <p className="text-danger text-sm">{formError}</p>}

        <div className="flex justify-end gap-2">
          {editingPosition && <Button variant="light" onPress={clearForm}>Cancel</Button>}
          <Button type="submit" color={editingPosition ? 'warning' : 'primary'} isLoading={isSubmitting}>
            {editingPosition ? 'Save changes' : 'Create position'}
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-default-200">
          <Toolbar actions={toolbarActions} selectedCount={selectedKeys.size} />
        </div>
        {deleteError && <p className="text-danger text-sm">{deleteError}</p>}

        <DataTable
          columns={columns}
          data={positions}
          keyField="id"
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          isLoading={isLoading}
          removeWrapper
          emptyContent={t('positions.noPositions')}
          bottomContent={
            <div className="flex justify-center">
              <Pagination total={totalPages} page={page} onChange={setPage} />
            </div>
          }
        />
      </div>
    </div>
  );
}