import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Chip,
  Avatar,
  useDisclosure,
} from '@heroui/react';
import {
  ShieldCheckIcon,
  UserIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import DataTable from '../../components/shared/DataTable';
import Toolbar from '../../components/shared/Toolbar';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import userApi from '../../api/userApi';

export default function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { isOpen: isBlockOpen, onOpen: onBlockOpen, onClose: onBlockClose } = useDisclosure();
  const { isOpen: isUnblockOpen, onOpen: onUnblockOpen, onClose: onUnblockClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isRoleOpen, onOpen: onRoleOpen, onClose: onRoleClose } = useDisclosure();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userApi.search({
        page,
        pageSize: 10,
      });
      setUsers(response.data.data.items);
      setTotalPages(response.data.data.totalPages);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const selectedIds = Array.from(selectedKeys).map(id => 
    id.includes('-') ? id : Number(id) // Handle GUIDs
  );

  const handleBlock = async () => {
    try {
      await userApi.block(selectedIds);
      fetchUsers();
      setSelectedKeys(new Set());
    } finally {
      onBlockClose();
    }
  };

  const handleUnblock = async () => {
    try {
      await userApi.unblock(selectedIds);
      fetchUsers();
      setSelectedKeys(new Set());
    } finally {
      onUnblockClose();
    }
  };

  const handleDelete = async () => {
    try {
      await userApi.delete(selectedIds);
      fetchUsers();
      setSelectedKeys(new Set());
    } finally {
      onDeleteClose();
    }
  };

  const handleAssignRole = async (roleCode) => {
    try {
      await userApi.assignRole(selectedIds, roleCode);
      fetchUsers();
      setSelectedKeys(new Set());
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    {
      key: 'user',
      label: 'User',
      renderCell: (item) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={item.photoUrl}
            name={`${item.firstName} ${item.lastName}`}
            className="w-10 h-10"
          />
          <div>
            <p className="font-medium">{item.firstName} {item.lastName}</p>
            <p className="text-xs text-default-500">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      label: t('user.role'),
      renderCell: (item) => (
        <div className="flex gap-1 flex-wrap">
          {item.roles?.map(role => (
            <Chip
              key={role}
              size="sm"
              color={role === 'Administrator' ? 'danger' : role === 'Recruiter' ? 'primary' : 'default'}
              variant="flat"
            >
              {role}
            </Chip>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      label: t('user.status'),
      renderCell: (item) => (
        <Chip
          size="sm"
          color={item.isBlocked ? 'danger' : 'success'}
          variant="flat"
          startContent={item.isBlocked ? <NoSymbolIcon className="w-3 h-3" /> : <CheckCircleIcon className="w-3 h-3" />}
        >
          {item.isBlocked ? 'Blocked' : 'Active'}
        </Chip>
      ),
    },
    {
      key: 'createdAt',
      label: 'Registered',
      renderCell: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
  ];

  const toolbarActions = [
    {
      label: t('admin.block'),
      icon: <NoSymbolIcon className="w-4 h-4" />,
      color: 'warning',
      requiresSelection: true,
      onClick: onBlockOpen,
    },
    {
      label: t('admin.unblock'),
      icon: <CheckCircleIcon className="w-4 h-4" />,
      color: 'success',
      requiresSelection: true,
      onClick: onUnblockOpen,
    },
    {
      label: 'Make Recruiter',
      icon: <UserGroupIcon className="w-4 h-4" />,
      color: 'primary',
      requiresSelection: true,
      onClick: () => handleAssignRole(2), // Recruiter role code
    },
    {
      label: 'Make Admin',
      icon: <ShieldCheckIcon className="w-4 h-4" />,
      color: 'danger',
      requiresSelection: true,
      onClick: () => handleAssignRole(1), // Admin role code
    },
    {
      label: t('common.delete'),
      icon: <TrashIcon className="w-4 h-4" />,
      color: 'danger',
      variant: 'flat',
      requiresSelection: true,
      onClick: onDeleteOpen,
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('admin.users')}</h1>
      
      <Toolbar
        actions={toolbarActions}
        selectedCount={selectedKeys.size}
      />

      <DataTable
        columns={columns}
        data={users}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        isLoading={isLoading}
        emptyContent="No users found"
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
        isOpen={isBlockOpen}
        onClose={onBlockClose}
        onConfirm={handleBlock}
        title={t('admin.block')}
        message={t('admin.confirmBlock')}
        confirmColor="warning"
      />

      <ConfirmDialog
        isOpen={isUnblockOpen}
        onClose={onUnblockClose}
        onConfirm={handleUnblock}
        title={t('admin.unblock')}
        message="Unblock selected users?"
        confirmColor="success"
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDelete}
        title={t('common.delete')}
        message={t('admin.confirmDelete')}
        confirmColor="danger"
      />
    </div>
  );
}