import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Chip,
  useDisclosure,
} from '@heroui/react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import DataTable from '../../components/shared/DataTable';
import Toolbar from '../../components/shared/Toolbar';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import positionApi from '../../api/positionApi';

export default function PositionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [positions, setPositions] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState({ column: 'updatedAt', direction: 'descending' });
  
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isDuplicateOpen, onOpen: onDuplicateOpen, onClose: onDuplicateClose } = useDisclosure();

  const fetchPositions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await positionApi.search({
        page,
        pageSize: 10,
        sortBy: sortDescriptor.column,
        sortDirection: sortDescriptor.direction,
      });
      setPositions(response.data.data.items);
      setTotalPages(response.data.data.totalPages);
    } finally {
      setIsLoading(false);
    }
  }, [page, sortDescriptor]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const selectedIds = Array.from(selectedKeys).map(Number);

  const handleDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => positionApi.delete(id)));
      setSelectedKeys(new Set());
      fetchPositions();
    } finally {
      onDeleteClose();
    }
  };

  const handleDuplicate = async () => {
    const id = selectedIds[0];
    try {
      await positionApi.duplicate(id);
      fetchPositions();
    } finally {
      onDuplicateClose();
      setSelectedKeys(new Set());
    }
  };

  const columns = [
    { key: 'title', label: t('positions.title_col'), sortable: true },
    { key: 'company', label: t('positions.company'), sortable: true },
    {
      key: 'level',
      label: t('positions.level'),
      renderCell: (item) => (
        <Chip size="sm" color="primary" variant="flat">{item.level}</Chip>
      ),
    },
    {
      key: 'isPublic',
      label: t('positions.accessRules'),
      renderCell: (item) => (
        <Chip size="sm" color={item.isPublic ? 'success' : 'warning'} variant="flat">
          {item.isPublic ? t('positions.public') : t('positions.restricted')}
        </Chip>
      ),
    },
    { key: 'cvsCount', label: t('positions.cvsCount'), sortable: true },
    {
      key: 'updatedAt',
      label: t('positions.updatedAt'),
      sortable: true,
      renderCell: (item) => new Date(item.updatedAt).toLocaleDateString(),
    },
  ];

  // ✅ TOOLBAR ACTIONS — NOT buttons in rows!
  const toolbarActions = [
    {
      label: t('common.view'),
      icon: <EyeIcon className="w-4 h-4" />,
      color: 'primary',
      requiresSelection: true,
      onClick: () => navigate(`/recruiter/positions/${selectedIds[0]}`),
    },
    {
      label: t('common.edit'),
      icon: <PencilIcon className="w-4 h-4" />,
      color: 'secondary',
      requiresSelection: true,
      onClick: () => navigate(`/recruiter/positions/${selectedIds[0]}/edit`),
    },
    {
      label: t('positions.duplicate'),
      icon: <DocumentDuplicateIcon className="w-4 h-4" />,
      color: 'default',
      requiresSelection: true,
      onClick: onDuplicateOpen,
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
      label: t('positions.create'),
      icon: <PlusIcon className="w-4 h-4" />,
      color: 'primary',
      requiresSelection: false,
      onClick: () => navigate('/recruiter/positions/new'),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('positions.title')}</h1>
      
      <Toolbar
        actions={toolbarActions}
        selectedCount={selectedKeys.size}
      />

      <DataTable
        columns={columns}
        data={positions}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        isLoading={isLoading}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        emptyContent={t('positions.noPositions')}
        bottomContent={
          <div className="flex justify-center">
            <Pagination
              total={totalPages}
              page={page}
              onChange={setPage}
            />
          </div>
        }
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDelete}
        title={t('common.delete')}
        message={t('positions.confirmDelete')}
        confirmColor="danger"
      />

      <ConfirmDialog
        isOpen={isDuplicateOpen}
        onClose={onDuplicateClose}
        onConfirm={handleDuplicate}
        title={t('positions.duplicate')}
        message={`Duplicate ${selectedIds.length} position(s)?`}
      />
    </div>
  );
}