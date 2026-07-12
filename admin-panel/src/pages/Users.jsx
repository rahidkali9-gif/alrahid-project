import { useEffect, useState, useCallback } from 'react';
import { Search, Trash2, ShieldCheck, UserCog } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Modal from '../components/Modal.jsx';
import Loading from '../components/Loading.jsx';
import { usersApi } from '../api/endpoints.js';
import { useToast } from '../hooks/useToast.js';
import { useAuth } from '../hooks/useAuth.js';
import { formatDate, formatRelative } from '../utils/format.js';

const ROLE_BADGE = {
  super_admin: 'bg-accent-500/15 text-accent-300 border border-accent-500/30',
  admin: 'bg-primary-500/15 text-primary-300 border border-primary-500/30',
  user: 'bg-slate-600/30 text-slate-300 border border-slate-600',
};

function RoleBadge({ role }) {
  return <span className={`badge capitalize ${ROLE_BADGE[role] || ROLE_BADGE.user}`}>{role?.replace('_', ' ')}</span>;
}

export default function Users() {
  const toast = useToast();
  const { user: currentUser } = useAuth();

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [roleModal, setRoleModal] = useState(null);
  const [newRole, setNewRole] = useState('user');
  const [working, setWorking] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    usersApi
      .list({ page, search, role: roleFilter })
      .then((res) => {
        setRows(res?.data || []);
        setMeta(res?.meta || { page, limit: 20, total: 0, totalPages: 0 });
      })
      .catch((err) => toast.error(err?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, [page, search, roleFilter, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const toggleActive = async (u) => {
    setWorking(true);
    try {
      await usersApi.activate(u.id, !u.is_active);
      toast.success(`User ${u.is_active ? 'deactivated' : 'activated'}`);
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to update user status');
    } finally {
      setWorking(false);
    }
  };

  const openRoleModal = (u) => {
    setNewRole(u.role || 'user');
    setRoleModal(u);
  };

  const saveRole = async () => {
    setWorking(true);
    try {
      await usersApi.updateRole(roleModal.id, newRole);
      toast.success('User role updated');
      setRoleModal(null);
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to update role');
    } finally {
      setWorking(false);
    }
  };

  const confirmDeleteUser = async () => {
    setWorking(true);
    try {
      await usersApi.remove(confirmDelete.id);
      toast.success('User deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete user');
    } finally {
      setWorking(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {(u.name || u.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-100 truncate">{u.name || '—'}</p>
            <p className="text-xs text-slate-400 truncate">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => <RoleBadge role={u.role} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => (
        <span
          className={`badge ${
            u.is_active
              ? 'bg-accent-500/15 text-accent-300 border border-accent-500/30'
              : 'bg-red-500/15 text-red-300 border border-red-500/30'
          }`}
        >
          {u.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'last_login_at',
      header: 'Last login',
      render: (u) => <span className="text-slate-400">{formatRelative(u.last_login_at)}</span>,
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (u) => <span className="text-slate-400">{formatDate(u.created_at)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (u) => {
        const isSelf = currentUser?.id === u.id;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => toggleActive(u)}
              disabled={working || isSelf || u.role === 'super_admin'}
              className="btn-ghost px-2.5 py-1.5 text-xs"
              title={u.is_active ? 'Deactivate' : 'Activate'}
            >
              {u.is_active ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={() => openRoleModal(u)}
              disabled={working || isSelf}
              className="btn-ghost px-2 py-1.5"
              title="Change role"
            >
              <UserCog size={16} />
            </button>
            <button
              onClick={() => setConfirmDelete(u)}
              disabled={working || isSelf || u.role === 'super_admin'}
              className="btn-ghost px-2 py-1.5 text-red-400 hover:text-red-300 disabled:opacity-30"
              title="Delete user"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Users</h2>
        <p className="text-sm text-slate-400 mt-0.5">Manage user accounts, roles and status</p>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={onSearch} className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input pl-9"
            placeholder="Search by name or email…"
          />
        </form>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="input sm:w-44"
        >
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        pagination={meta}
        onPageChange={setPage}
        loading={loading}
        emptyLabel="No users match your filters"
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteUser}
        loading={working}
        title="Delete user"
        message={`Are you sure you want to delete ${confirmDelete?.name || confirmDelete?.email}? This action cannot be undone.`}
        confirmLabel="Delete user"
      />

      <Modal
        open={Boolean(roleModal)}
        onClose={() => setRoleModal(null)}
        title="Change user role"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setRoleModal(null)} disabled={working}>
              Cancel
            </button>
            <button className="btn-primary" onClick={saveRole} disabled={working}>
              <ShieldCheck size={16} /> Save role
            </button>
          </>
        }
      >
        {roleModal && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-900/60 border border-slate-700 p-3">
              <p className="text-sm font-medium text-slate-100">{roleModal.name}</p>
              <p className="text-xs text-slate-400">{roleModal.email}</p>
            </div>
            <div>
              <label className="label">Role</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="input">
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">
                Super Admin has full access including destructive actions.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
