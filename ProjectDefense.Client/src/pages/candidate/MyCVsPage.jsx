import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Chip,
  Card,
  CardBody,
  useDisclosure,
} from '@heroui/react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';
import cvApi from '../../api/cvApi';
import DataTable from '../../components/shared/DataTable';
import Toolbar from '../../components/shared/Toolbar';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

export default function MyCVsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [cvs, setCvs] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const fetchCVs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await cvApi.search({
        page: 1,
        pageSize: 50,
        myCvs: true,
      });
      setCvs(response.data.data.items);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCVs();
  }, [fetchCVs]);

  const selectedIds = Array.from(selectedKeys).map(Number);

  const handleDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => cvApi.delete(id)));
      setSelectedKeys(new Set());
      fetchCVs();
    } finally {
      onDeleteClose();
    }
  };

  const handlePublish = async (id) => {
    try {
      await cvApi.publish(id);
      fetchCVs();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    {
      key: 'position',
      label: t('positions.title_col'),
      renderCell: (item) => (
        <div>
          <p className="font-medium">{item.positionTitle}</p>
          <p className="text-xs text-default-500">{item.positionCompany}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: t('cvs.status'),
      renderCell: (item) => (
        <Chip
          size="sm"
          color={item.isPublished ? 'success' : 'default'}
          variant="flat"
        >
          {item.isPublished ? t('cvs.published') : t('cvs.draft')}
        </Chip>
      ),
    },
    {
      key: 'likes',
      label: t('cvs.likes'),
      renderCell: (item) => item.likesCount || 0,
    },
    {
      key: 'updatedAt',
      label: t('positions.updatedAt'),
      renderCell: (item) => new Date(item.updatedAt).toLocaleDateString(),
    },
  ];

  const toolbarActions = [
    {
      label: t('common.view'),
      icon: <EyeIcon className="w-4 h-4" />,
      color: 'primary',
      requiresSelection: true,
      onClick: () => navigate(`/cvs/${selectedIds[0]}`),
    },
    {
      label: t('common.edit'),
      icon: <PencilIcon className="w-4 h-4" />,
      color: 'secondary',
      requiresSelection: true,
      onClick: () => navigate(`/cvs/${selectedIds[0]}/edit`),
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
      label: t('cvs.create'),
      icon: <PlusIcon className="w-4 h-4" />,
      color: 'primary',
      requiresSelection: false,
      onClick: () => navigate('/positions'),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('cvs.myCvs')}</h1>
      
      <Toolbar
        actions={toolbarActions}
        selectedCount={selectedKeys.size}
      />

      <DataTable
        columns={columns}
        data={cvs}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        isLoading={isLoading}
        emptyContent={t('cvs.noCvs')}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDelete}
        title={t('common.delete')}
        message={t('cvs.confirmDelete')}
        confirmColor="danger"
      />
    </div>
  );
}