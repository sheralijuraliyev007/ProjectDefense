import { useState, useCallback, useEffect } from 'react';
import { Button, Input, Select, SelectItem } from '@heroui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MagnifyingGlassIcon, PencilIcon } from '@heroicons/react/24/outline';
import { z } from 'zod';
import DataTable from '../../components/shared/DataTable';
import Toolbar from '../../components/shared/Toolbar';
import lookupApi from '../../api/lookupApi';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Options list for "One of Many" attribute type (create + edit)
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

  // Derive the "One of Many" type's code from the lookup data itself,
  // instead of hardcoding a numeric constant that could drift from the DB.
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
      setFormError(extractErrorMessage(err, 'Could not save this attribute.'));
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
      setDeleteError(extractErrorMessage(err, 'Could not delete one or more attributes.'));
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'categoryName', label: 'Category', renderCell: (item) => <span className="text-default-500">{item.categoryName}</span> },
    { key: 'dtypeName', label: 'Type', renderCell: (item) => <span className="text-default-500">{item.dtypeName}</span> },
    { key: 'description', label: 'Description', renderCell: (item) => <span className="text-default-400">{item.description || '—'}</span> },
  ];

  const toolbarActions = [
    { label: 'Edit', requiresSelection: true, onClick: handleEdit },
    { label: 'Delete', color: 'danger', requiresSelection: true, onClick: handleDelete },
    { label: 'Clear form', requiresSelection: false, onClick: clearForm },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Attributes</h1>
        <p className="text-sm text-default-500">Reusable fields used across positions and CVs.</p>
      </div>

      {/* Always-visible create/edit form */}
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
                {editingAttribute ? editingAttribute.name : 'Create a new attribute'}
              </h2>
              <p className="text-xs text-default-500">
                {editingAttribute
                  ? 'You are editing an existing attribute from the list below.'
                  : 'Fill in the fields below to add a reusable attribute to the library.'}
              </p>
            </div>
          </div>
          {editingAttribute && (
            <Button size="sm" variant="flat" color="warning" onPress={clearForm}>
              Cancel edit
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('name')}
            variant="bordered"
            label="Name"
            placeholder="e.g. English Level"
            isInvalid={!!errors.name}
            errorMessage={errors.name?.message}
          />
          <Select
            variant="bordered"
            label="Category"
            placeholder="Choose a category"
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
            label="Type"
            placeholder="Choose a type"
            selectedKeys={currentType ? [currentType] : []}
            onSelectionChange={(keys) => setValue('dtypeCode', Array.from(keys)[0], { shouldValidate: true })}
            isInvalid={!!errors.dtypeCode}
            errorMessage={errors.dtypeCode?.message}
            isDisabled={!!editingAttribute}
            description={editingAttribute ? "Type can't change once values exist." : undefined}
          >
            {types.map((t) => (
              <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>
            ))}
          </Select>
          <Input
            {...register('description')}
            variant="bordered"
            label="Description"
            placeholder="What is this attribute for?"
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
            <Button variant="light" onPress={clearForm}>Cancel</Button>
          )}
          <Button
            type="submit"
            color={editingAttribute ? 'warning' : 'primary'}
            isLoading={isSubmitting}
          >
            {editingAttribute ? 'Save changes' : 'Create attribute'}
          </Button>
        </div>
      </form>

      <div className="flex items-center gap-3">
        <Input
          size="sm"
          variant="flat"
          radius="sm"
          className="max-w-xs"
          placeholder="Search attributes"
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
          placeholder="All categories"
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

        <DataTable
          columns={columns}
          data={attributes}
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          isLoading={isLoading}
          removeWrapper
          emptyContent="No attributes yet."
        />
      </div>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete attribute?"
        message={
          selectedIds.length > 1
            ? `This will permanently delete ${selectedIds.length} attributes.`
            : 'This will permanently delete this attribute.'
        }
        confirmColor="danger"
        error={deleteError}
      />
    </div>
  );
}