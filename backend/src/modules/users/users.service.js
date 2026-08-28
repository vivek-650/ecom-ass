import { supabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../utils/constants.js';

export async function listUsers() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false });
  if (error) throw ApiError.internal(error.message);
  return data;
}

export async function updateUserRole(userId, role) {
  if (!Object.values(ROLES).includes(role)) throw ApiError.badRequest('Invalid role');

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select('id, email, full_name, role, created_at')
    .single();

  if (error || !data) throw ApiError.notFound('User not found');
  return data;
}
