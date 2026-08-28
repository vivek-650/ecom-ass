import { useMemo, useState } from 'react';
import { useUsers, useUpdateUserRole } from '@/hooks/useUsers';
import { PageSpinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SearchIcon } from '@/components/ui/Icons';
import type { Role } from '@/types';

const ROLE_OPTIONS: Role[] = ['user', 'sales_person', 'admin'];

export function AdminUsersTab() {
  const { data: users, isLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch = !q || u.email.toLowerCase().includes(q) || (u.full_name ?? '').toLowerCase().includes(q);
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <SearchIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as Role | '')} className="w-44">
          <option value="">All roles</option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {role.replace('_', ' ')}
            </option>
          ))}
        </Select>
        <span className="text-xs text-ink-muted">{filtered.length} of {users?.length ?? 0} users</span>
      </div>

      <div className="overflow-x-auto rounded-md border border-ink/10 bg-white">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-ink-muted">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-ink/5 last:border-0">
                <td className="px-5 py-3 font-medium text-ink">{user.full_name || '—'}</td>
                <td className="px-5 py-3 text-ink-muted">{user.email}</td>
                <td className="px-5 py-3 text-ink-muted">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => updateRole.mutate({ id: user.id, role: e.target.value as Role })}
                    className="rounded border border-ink/15 bg-white px-2.5 py-1 text-xs font-medium uppercase tracking-wide focus:border-forest focus:outline-none"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-ink-muted">
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
