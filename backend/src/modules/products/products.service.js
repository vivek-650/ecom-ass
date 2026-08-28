import { supabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../utils/constants.js';
import { deleteCloudinaryImage, uploadBufferToCloudinary } from '../upload/upload.service.js';

const PRODUCT_COLUMNS =
  'id, owner_id, name, description, price, stock, image_url, created_at, updated_at, category:categories(id, name)';

/**
 * category comes back from Supabase as a nested { id, name } object (an
 * embedded resource via the FK) — flattened here so the API keeps
 * returning `category` as a plain string, matching the shape every
 * existing frontend call site already expects, while `category_id` is
 * exposed alongside it for the admin product form's category picker.
 */
function flattenProduct(row) {
  if (!row) return row;
  const { category, ...rest } = row;
  return { ...rest, category: category?.name ?? null, category_id: category?.id ?? null };
}

/**
 * Public catalogue query — search by keyword, filter by category / price range,
 * paginated. Used by the storefront grid and search bar.
 */
export async function listProducts({ search, category, minPrice, maxPrice, page = 1, limit = 12 }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin.from('products').select(PRODUCT_COLUMNS, { count: 'exact' });

  if (search) query = query.ilike('name', `%${search}%`);
  if (minPrice !== undefined) query = query.gte('price', minPrice);
  if (maxPrice !== undefined) query = query.lte('price', maxPrice);

  if (category) {
    const { data: categoryRow } = await supabaseAdmin.from('categories').select('id').eq('name', category).maybeSingle();
    if (!categoryRow) return { items: [], total: 0, page: Number(page), limit: Number(limit) };
    query = query.eq('category_id', categoryRow.id);
  }

  const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
  if (error) throw ApiError.internal(error.message);

  return { items: data.map(flattenProduct), total: count, page: Number(page), limit: Number(limit) };
}

export async function getProductById(id) {
  const { data, error } = await supabaseAdmin.from('products').select(PRODUCT_COLUMNS).eq('id', id).single();
  if (error || !data) throw ApiError.notFound('Product not found');
  return flattenProduct(data);
}

export async function listMyProducts(ownerId) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw ApiError.internal(error.message);
  return data.map(flattenProduct);
}

async function assertCategoryExists(categoryId) {
  const { data, error } = await supabaseAdmin.from('categories').select('id').eq('id', categoryId).maybeSingle();
  if (error) throw ApiError.internal(error.message);
  if (!data) throw ApiError.badRequest('Selected category does not exist');
}

export async function createProduct(owner, payload, imageFile) {
  await assertCategoryExists(payload.categoryId);

  let image_url = null;
  let image_public_id = null;

  if (imageFile) {
    const uploaded = await uploadBufferToCloudinary(imageFile.buffer);
    image_url = uploaded.url;
    image_public_id = uploaded.publicId;
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      owner_id: owner.id,
      name: payload.name,
      description: payload.description ?? null,
      price: payload.price,
      category_id: payload.categoryId,
      stock: payload.stock ?? 0,
      image_url,
      image_public_id,
    })
    .select(PRODUCT_COLUMNS)
    .single();

  if (error) throw ApiError.internal(error.message);
  return flattenProduct(data);
}

/** Admin can edit any product; a Sales Person may only edit their own. */
async function assertOwnershipOrAdmin(productId, requester) {
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select('id, owner_id, image_public_id')
    .eq('id', productId)
    .single();

  if (error || !product) throw ApiError.notFound('Product not found');

  const isOwner = product.owner_id === requester.id;
  const isAdmin = requester.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) throw ApiError.forbidden('You can only manage products you own');

  return product;
}

export async function updateProduct(id, requester, payload, imageFile) {
  const existing = await assertOwnershipOrAdmin(id, requester);
  if (payload.categoryId !== undefined) await assertCategoryExists(payload.categoryId);

  const updates = {
    ...(payload.name !== undefined && { name: payload.name }),
    ...(payload.description !== undefined && { description: payload.description }),
    ...(payload.price !== undefined && { price: payload.price }),
    ...(payload.categoryId !== undefined && { category_id: payload.categoryId }),
    ...(payload.stock !== undefined && { stock: payload.stock }),
    updated_at: new Date().toISOString(),
  };

  if (imageFile) {
    const uploaded = await uploadBufferToCloudinary(imageFile.buffer);
    updates.image_url = uploaded.url;
    updates.image_public_id = uploaded.publicId;
    await deleteCloudinaryImage(existing.image_public_id);
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updates)
    .eq('id', id)
    .select(PRODUCT_COLUMNS)
    .single();

  if (error) throw ApiError.internal(error.message);
  return flattenProduct(data);
}

export async function deleteProduct(id, requester) {
  const existing = await assertOwnershipOrAdmin(id, requester);
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
  if (error) throw ApiError.internal(error.message);
  await deleteCloudinaryImage(existing.image_public_id);
}
