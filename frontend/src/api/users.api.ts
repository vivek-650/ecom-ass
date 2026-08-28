import { axiosClient, unwrap } from './axiosClient';
import type { Profile, Role } from '@/types';

export const usersApi = {
  list: () => unwrap<Profile[]>(axiosClient.get('/users')),
  updateRole: (id: string, role: Role) => unwrap<Profile>(axiosClient.patch(`/users/${id}/role`, { role })),
};
