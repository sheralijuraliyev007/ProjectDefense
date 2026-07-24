import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Select, SelectItem } from '@heroui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MagnifyingGlassIcon, PencilIcon } from '@heroicons/react/24/outline';
import { z } from 'zod';
import DataTable from '../../components/shared/DataTable';
import Toolbar from '../../components/shared/Toolbar';
import lookupApi from '../../api/lookupApi';
import attributeApi from '../../api/attributeApi';

const attributeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  categoryCode: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  dtypeCode: z.string().min(1, 'Type is required'),
});

function extractErrorMessage(err, fallback) {
  const errors = err.response?.data?.errors ?? err.response?.data;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0];
    if (typeof first === 'string') return first;
    return first?.errorMessage ?? first?.message ?? fallback;
  }
  return err.response?.data?.message || fallback;
}

export default function AttributeLibraryPage() {
  const { t } = useTranslation();

  const [attributes, setAttributes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [formError, setFormError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [options, setOptions] = useState(['']);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(attributeSchema) });

  const currentCategory = watch('categoryCode');
  const currentType = watch('dtypeCode');

  useEffect(() => {
    lookupApi.attributeCategories().then((res) => setCategories(res.data.data));
    lookupApi.attributeTypes().then((res) => setTypes(res.data.data));
  }, []);

  const oneOfManyType = types.find((t) =>
    t.name?.toLowerCase().includes('one of many')
  );
  const isOneOfMany =
    !!oneOfManyType && String(currentType) === String(oneOfManyType.code);

  const fetchAttributes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await attributeApi.search({
        page: 1,
        pageSize: 50,
        search: search || undefined,
        categoryCode: categoryFilter ? Number(categoryFilter) : undefined,
      });
      setAttributes(response.data.data?.rows ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchAttributes, 300);
    return () => clearTimeout(timeout);
  }, [fetchAttributes]);

  const selectedIds = Array.from(selectedKeys).map(Number);

  const clearForm = () => {
    setEditingAttribute(null);
    setFormError('');
    setOptions(['']);
    reset({ name: '', categoryCode: '', description: '', dtypeCode: '' });
  };

  const handleEdit = () => {
    const attr = attributes.find((a) => a.id === selectedIds[0]);
    if (!attr) return;
    setEditingAttribute(attr);
    setFormError('');
    setOptions(attr.options?.length ? attr.options.map((o) => o.label) : ['']);
    reset({
      name: attr.name,
      categoryCode: String(attr.categoryCode),
      dtypeCode: String(attr.dtypeCode),
      description: attr.description ?? '',
    });
  };

  const onSubmit = async (data) => {
    setFormError('');
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    try {
      if (editingAttribute) {
        await attributeApi.update(editingAttribute.id, {
          name: data.name,
          description: data.description ?? '',
          categoryCode: Number(data.categoryCode),
          version: editingAttribute.version,
          options: isOneOfMany ? cleanOptions : undefined,
        });
      } else {
        await attributeApi.create({
          name: data.name,
          description: data.description ?? '',
          categoryCode: Number(data.categoryCode),
          dtypeCode: Number(data.dtypeCode),
          options: isOneOfMany ? cleanOptions : [],
        });
      }
      clearForm();
      setSelectedKeys(new Set());
      fetchAttributes();
    } catch (err) {
      setFormError(extractErrorMessage(err, t('attributes.saveError')));
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    try {
      await Promise.all(selectedIds.map((id) => attributeApi.delete(id)));
      setSelectedKeys(new Set());
      clearForm();
      fetchAttributes();
    } catch (err) {
      setDeleteError(extractErrorMessage(err, t('attributes.deleteError')));
    }
  };

  const columns = [
    { key: 'name', label: t('attributes.name'), sortable: true },
    { key: 'categoryName', label: t('attributes.category'), renderCell: (item) => <span className="text-default-500">{item.categoryName}</span> },
    { key: 'dtypeName', label: t('attributes.type'), renderCell: (item) => <span className="text-default-500">{item.dtypeName}</span> },
    { key: 'description', label: t('attributes.description'), renderCell: (item) => <span className="text-default-400">{item.description || '—'}</span> },
  ];

  const toolbarActions = [
    { label: t('common.edit'), requiresSelection: true, onClick: handleEdit },
    { label: t('common.delete'), color: 'danger', requiresSelection: true, onClick: handleDelete },
    { label: t('attributes.clearForm'), requiresSelection: false, onClick: clearForm },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">{t('attributes.title')}</h1>
        <p className="text-sm text-default-500">{t('attributes.subtitle')}</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`border-l-4 rounded-md p-5 space-y-4 transition-colors ${
          editingAttribute
            ? 'border-warning bg-warning-50/50'
            : 'border-primary bg-primary-50/50'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {editingAttribute && (
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-warning-100 text-warning-700 shrink-0">
                <PencilIcon className="w-4 h-4" />
              </span>
            )}
            <div>
              <h2 className={`text-base font-semibold ${editingAttribute ? 'text-warning-700' : 'text-primary-700'}`}>
                {editingAttribute ? editingAttribute.name : t('attributes.create')}
              </h2>
              <p className="text-xs text-default-500">
                {editingAttribute ? t('attributes.editingNotice') : t('attributes.createInfo')}
              </p>
            </div>
          </div>
          {editingAttribute && (
            <Button size="sm" variant="flat" color="warning" onPress={clearForm}>
              {t('attributes.cancelEdit')}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('name')}
            variant="bordered"
            label={t('attributes.name')}
            placeholder={t('attributes.nameEg')}
            isInvalid={!!errors.name}
            errorMessage={errors.name?.message}
          />
          <Select
            variant="bordered"
            label={t('attributes.category')}
            placeholder={t('attributes.categoryChoose')}
            selectedKeys={currentCategory ? [currentCategory] : []}
            onSelectionChange={(keys) => setValue('categoryCode', Array.from(keys)[0], { shouldValidate: true })}
            isInvalid={!!errors.categoryCode}
            errorMessage={errors.categoryCode?.message}
          >
            {categories.map((c) => (
              <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
            ))}
          </Select>
          <Select
            variant="bordered"
            label={t('attributes.type')}
            placeholder={t('attributes.chooseAType')}
            selectedKeys={currentType ? [currentType] : []}
            onSelectionChange={(keys) => setValue('dtypeCode', Array.from(keys)[0], { shouldValidate: true })}
            isInvalid={!!errors.dtypeCode}
            errorMessage={errors.dtypeCode?.message}
            isDisabled={!!editingAttribute}
            description={editingAttribute ? t('attributes.typeLocked') : undefined}
          >
            {types.map((tp) => (
              <SelectItem key={tp.code} value={tp.code}>{tp.name}</SelectItem>
            ))}
          </Select>
          <Input
            {...register('description')}
            variant="bordered"
            label={t('attributes.description')}
            placeholder={t('attributes.descriptionInfo')}
          />

          {isOneOfMany && (
            <div className="sm:col-span-2 space-y-2">
              <p className="text-sm font-medium">Options</p>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    variant="bordered"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) =>
                      setOptions(options.map((o, idx) => (idx === i ? e.target.value : o)))
                    }
                  />
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    isDisabled={options.length <= 1}
                    onPress={() => setOptions(options.filter((_, idx) => idx !== i))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="flat" onPress={() => setOptions([...options, ''])}>
                Add option
              </Button>
            </div>
          )}
        </div>

        {formError && <p className="text-danger text-sm">{formError}</p>}

        <div className="flex justify-end gap-2">
          {editingAttribute && (
            <Button variant="light" onPress={clearForm}>{t('common.cancel')}</Button>
          )}
          <Button
            type="submit"
            color={editingAttribute ? 'warning' : 'primary'}
            isLoading={isSubmitting}
          >
            {editingAttribute ? t('attributes.saveChanges') : t('attributes.createAttribute')}
          </Button>
        </div>
      </form>

      <div className="flex items-center gap-3">
        <Input
          size="sm"
          variant="flat"
          radius="sm"
          className="max-w-xs"
          placeholder={t('attributes.searchAttributes')}
          startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          isClearable
          onClear={() => setSearch('')}
        />
        <Select
          size="sm"
          variant="flat"
          radius="sm"
          className="max-w-xs"
          placeholder={t('attributes.allCategories')}
          selectedKeys={categoryFilter ? [categoryFilter] : []}
          onSelectionChange={(keys) => setCategoryFilter(Array.from(keys)[0] || '')}
        >
          {categories.map((c) => (
            <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
          ))}
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-default-200">
          <Toolbar actions={toolbarActions} selectedCount={selectedKeys.size} />
        </div>

        {deleteError && <p className="text-danger text-sm">{deleteError}</p>}

        <DataTable
          columns={columns}
          data={attributes}
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          isLoading={isLoading}
          removeWrapper
          emptyContent={t('attributes.noAttributes')}
        />
      </div>
    </div>
  );
}