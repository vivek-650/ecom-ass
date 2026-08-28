import { useUsers, useUpdateUserRole } from '@/hooks/useUsers';
import { PageSpinner } from '@/components/ui/Spinner';
import type { Role } from '@/types';

const ROLE_OPTIONS: Role[] = ['user', 'sales_person', 'admin'];

export function AdminUsersTab() {
  const { data: users, isLoading } = useUsers();
  const updateRole = useUpdateUserRole();

  if (isLoading) return <PageSpinner />;

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-ink-muted">
            <th className="px-5 py-3 font-normal">Name</th>
            <th className="px-5 py-3 font-normal">Email</th>
            <th className="px-5 py-3 font-normal">Joined</th>
            <th className="px-5 py-3 font-normal">Role</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user.id} className="border-b border-ink/5 last:border-0">
              <td className="px-5 py-3 font-medium text-ink">{user.full_name || '—'}</td>
              <td className="px-5 py-3 text-ink-muted">{user.email}</td>
              <td className="px-5 py-3 text-ink-muted">{new Date(user.created_at).toLocaleDateString()}</td>
              <td className="px-5 py-3">
                <select
                  value={user.role}
                  onChange={(e) => updateRole.mutate({ id: user.id, role: e.target.value as Role })}
                  className="rounded-full border border-ink/15 bg-paper px-3 py-1.5 font-mono text-xs uppercase tracking-widest focus:border-gold focus:outline-none"
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
        </tbody>
      </table>
    </div>
  );
}
