import { supabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../utils/ApiError.js';

export async function listCategories() {
  const { data, error } = await supabaseAdmin.from('categories').select('id, name, created_at').order('name');
  if (error) throw ApiError.internal(error.message);
  return data;
}

export async function createCategory(name) {
  const trimmed = name?.trim();
  if (!trimmed) throw ApiError.badRequest('Category name is required');

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({ name: trimmed })
    .select('id, name, created_at')
    .single();

  if (error) {
    if (error.code === '23505') throw ApiError.conflict('A category with this name already exists');
    throw ApiError.internal(error.message);
  }
  return data;
}

export async function updateCategory(id, name) {
  const trimmed = name?.trim();
  if (!trimmed) throw ApiError.badRequest('Category name is required');

  const { data, error } = await supabaseAdmin
    .from('categories')
    .update({ name: trimmed })
    .eq('id', id)
    .select('id, name, created_at')
    .maybeSingle();

  if (error) {
    if (error.code === '23505') throw ApiError.conflict('A category with this name already exists');
    throw ApiError.internal(error.message);
  }
  if (!data) throw ApiError.notFound('Category not found');
  return data;
}

/**
 * Deletion is blocked (with the exact count) rather than cascading or
 * orphaning products — a category rename/delete should never silently
 * take products off the storefront.
 */
export async function deleteCategory(id) {
  const { count, error: countError } = await supabaseAdmin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id);
  if (countError) throw ApiError.internal(countError.message);

  if (count && count > 0) {
    throw ApiError.conflict(
      `${count} product${count === 1 ? '' : 's'} still use this category — reassign or delete them first`
    );
  }

  const { error, count: deletedCount } = await supabaseAdmin
    .from('categories')
    .delete({ count: 'exact' })
    .eq('id', id);
  if (error) throw ApiError.internal(error.message);
  if (!deletedCount) throw ApiError.notFound('Category not found');
}
