import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Chip, Avatar, Pagination } from '@heroui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

import {
  ShieldCheckIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  TrashIcon,
  UserGroupIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import DataTable from '../../components/shared/DataTable';
import Toolbar from '../../components/shared/Toolbar';
import userApi from '../../api/userApi';
import lookupApi from '../../api/lookupApi';
import { useAuth } from '../../contexts/AuthContext';


const roleStyles = {
  Administrator: 'bg-red-50 text-red-700 border border-red-200',
  Recruiter: 'bg-blue-50 text-blue-700 border border-blue-200',
  Candidate: 'bg-gray-100 text-gray-600 border border-gray-200',
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


export default function UsersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionError, setActionError] = useState('');

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userApi.search({ page, pageSize: 10 });
      const payload = response.data.data;
      setUsers(payload?.rows ?? []);
      setTotalPages(payload?.pageSize ? Math.ceil((payload.total ?? 0) / payload.pageSize) : 1);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    lookupApi.roles().then((res) => setRoles(res.data.data));
  }, []);

  const getRoleCode = (name) => roles.find((r) => r.name === name)?.code;

  const selectedIds = Array.from(selectedKeys).map((id) =>
    id.includes('-') ? id : Number(id)
  );

  const includesSelf = selectedIds.includes(currentUser?.id);

  const runAction = async (action) => {
    setActionError('');
    try {
      await action();
      fetchUsers();
      setSelectedKeys(new Set());
    } catch (err) {
      setActionError(extractErrorMessage(err, t('admin.actionFailed', 'That action could not be completed.')));
    }
  };

  const handleBlock = () => runAction(() => userApi.block(selectedIds));
  const handleUnblock = () => runAction(() => userApi.unblock(selectedIds));
  const handleDelete = () => runAction(() => userApi.delete(selectedIds));

  const handleAssignRole = (roleName) => {
    const code = getRoleCode(roleName);
    if (code === undefined) return;
    runAction(() => userApi.assignRole(selectedIds, code));
  };
  const handleRemoveRole = (userId, roleName) => {
    const code = getRoleCode(roleName);
    if (code === undefined) return;
    runAction(() => userApi.removeRole([userId], code));
  };

  const handleManageProfile = () => {
    navigate(`/admin/users/${selectedIds[0]}/profile`);
  };

  const columns = [
    {
      key: 'user',
      label: t('admin.user', 'User'),
      renderCell: (item) => (
        <div className="flex items-center gap-3">
          <Avatar src={item.photoUrl} name={`${item.firstName} ${item.lastName}`} className="w-10 h-10" />
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
        <div className="flex gap-1.5 flex-wrap">
          {item.roles?.map((role) => (
            <span
              key={role}
              className={`inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full text-xs font-medium ${roleStyles[role] || roleStyles.Candidate}`}
            >
              {role}
              {role !== 'Candidate' && (
                <button
                  type="button"
                  onClick={() => handleRemoveRole(item.id, role)}
                  className="rounded-full p-0.5 hover:bg-black/10 transition-colors"
                  aria-label={t('admin.removeRole', { role, defaultValue: `Remove ${role}` })}
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      label: t('user.status'),
      renderCell: (item) => {
        const isBlocked = item.statusName === 'Blocked';
        return (
          <Chip
            size="sm"
            color={isBlocked ? 'danger' : 'success'}
            variant="flat"
            startContent={isBlocked ? <NoSymbolIcon className="w-3 h-3" /> : <CheckCircleIcon className="w-3 h-3" />}
          >
            {isBlocked ? t('admin.blocked', 'Blocked') : t('admin.active', 'Active')}
          </Chip>
        );
      },
    },
    {
      key: 'createdAt',
      label: t('admin.registered', 'Registered'),
      renderCell: (item) => new Date(item.createdDateTime).toLocaleDateString(),
    },
  ];

  const toolbarActions = [
    {
      label: t('admin.manageProfile', 'Manage Profile'),
      icon: <IdentificationIcon className="w-4 h-4" />,
      color: 'primary',
      requiresSelection: true,
      isDisabled: selectedIds.length !== 1, 
      onClick: handleManageProfile,
    },
    {
      label: t('admin.block'),
      icon: <NoSymbolIcon className="w-4 h-4" />,
      color: 'warning',
      requiresSelection: true,
      isDisabled: includesSelf,
      onClick: handleBlock,
    },
    {
      label: t('admin.unblock'),
      icon: <CheckCircleIcon className="w-4 h-4" />,
      color: 'success',
      requiresSelection: true,
      onClick: handleUnblock,
    },
    {
      label: t('admin.makeRecruiter', 'Make Recruiter'),
      icon: <UserGroupIcon className="w-4 h-4" />,
      color: 'primary',
      requiresSelection: true,
      onClick: () => handleAssignRole('Recruiter'),
    },
    {
      label: t('admin.makeAdmin', 'Make Admin'),
      icon: <ShieldCheckIcon className="w-4 h-4" />,
      color: 'danger',
      requiresSelection: true,
      onClick: () => handleAssignRole('Administrator'),
    },
    {
      label: t('common.delete'),
      icon: <TrashIcon className="w-4 h-4" />,
      color: 'danger',
      variant: 'flat',
      requiresSelection: true,
      isDisabled: includesSelf,
      onClick: handleDelete,
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('admin.users')}</h1>

      {includesSelf && (
        <p className="text-sm text-warning">
          {t('admin.selfSelected', "Your own account is selected — blocking and deleting yourself is disabled.")}
        </p>
      )}

      {actionError && (
        <p className="text-sm text-danger">{actionError}</p>
      )}

      <Toolbar actions={toolbarActions} selectedCount={selectedKeys.size} />

      <DataTable
        columns={columns}
        data={users}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        isLoading={isLoading}
        emptyContent={t('admin.noUsers', 'No users found')}
        bottomContent={
          <div className="flex justify-center">
            <Pagination total={totalPages} page={page} onChange={setPage} />
          </div>
        }
      />
    </div>
  );
}