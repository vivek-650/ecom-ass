import { supabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../utils/constants.js';
import { deleteCloudinaryImage, uploadBufferToCloudinary } from '../upload/upload.service.js';

const PRODUCT_COLUMNS =
  'id, owner_id, name, description, price, category, stock, image_url, created_at, updated_at';

/**
 * Public catalogue query — search by keyword, filter by category / price range,
 * paginated. Used by the storefront grid and search bar.
 */
export async function listProducts({ search, category, minPrice, maxPrice, page = 1, limit = 12 }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin.from('products').select(PRODUCT_COLUMNS, { count: 'exact' });

  if (search) query = query.ilike('name', `%${search}%`);
  if (category) query = query.eq('category', category);
  if (minPrice !== undefined) query = query.gte('price', minPrice);
  if (maxPrice !== undefined) query = query.lte('price', maxPrice);

  const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
  if (error) throw ApiError.internal(error.message);

  return { items: data, total: count, page: Number(page), limit: Number(limit) };
}

export async function listCategories() {
  const { data, error } = await supabaseAdmin.from('products').select('category');
  if (error) throw ApiError.internal(error.message);
  return [...new Set(data.map((row) => row.category))].sort();
}

export async function getProductById(id) {
  const { data, error } = await supabaseAdmin.from('products').select(PRODUCT_COLUMNS).eq('id', id).single();
  if (error || !data) throw ApiError.notFound('Product not found');
  return data;
}

export async function listMyProducts(ownerId) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw ApiError.internal(error.message);
  return data;
}

export async function createProduct(owner, payload, imageFile) {
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
      category: payload.category,
      stock: payload.stock ?? 0,
      image_url,
      image_public_id,
    })
    .select(PRODUCT_COLUMNS)
    .single();

  if (error) throw ApiError.internal(error.message);
  return data;
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

  const updates = {
    ...(payload.name !== undefined && { name: payload.name }),
    ...(payload.description !== undefined && { description: payload.description }),
    ...(payload.price !== undefined && { price: payload.price }),
    ...(payload.category !== undefined && { category: payload.category }),
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
  return data;
}

export async function deleteProduct(id, requester) {
  const existing = await assertOwnershipOrAdmin(id, requester);
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
  if (error) throw ApiError.internal(error.message);
  await deleteCloudinaryImage(existing.image_public_id);
}
