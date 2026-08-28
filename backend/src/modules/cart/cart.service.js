import { supabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../utils/ApiError.js';

const CART_SELECT = `
  id, quantity, created_at,
  product:products ( id, name, price, image_url, stock, owner_id, category:categories(name) )
`;

/** Flattens the embedded { category: { name } } object into a plain string, matching products.service.js. */
function flattenCartItem(row) {
  return { ...row, product: { ...row.product, category: row.product.category?.name ?? null } };
}

export async function getCart(userId) {
  const { data, error } = await supabaseAdmin
    .from('cart_items')
    .select(CART_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw ApiError.internal(error.message);
  return data.map(flattenCartItem);
}

/** Adding an item already in the cart increments its quantity instead of duplicating the row. */
export async function addToCart(userId, productId, quantity = 1) {
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('id, stock')
    .eq('id', productId)
    .single();
  if (productError || !product) throw ApiError.notFound('Product not found');

  const { data: existing } = await supabaseAdmin
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  const nextQuantity = (existing?.quantity ?? 0) + quantity;
  if (nextQuantity > product.stock) throw ApiError.badRequest('Not enough stock available');

  const { error } = await supabaseAdmin
    .from('cart_items')
    .upsert(
      { user_id: userId, product_id: productId, quantity: nextQuantity },
      { onConflict: 'user_id,product_id' }
    );
  if (error) throw ApiError.internal(error.message);

  return getCart(userId);
}

export async function updateCartItem(userId, itemId, quantity) {
  if (quantity < 1) throw ApiError.badRequest('Quantity must be at least 1');

  // The frontend already caps quantity at product.stock client-side, but
  // that's UX, not enforcement -- addToCart validates stock server-side, so
  // this path needs the same check rather than trusting whatever number a
  // direct API call sends.
  const { data: item, error: itemError } = await supabaseAdmin
    .from('cart_items')
    .select('product:products(stock)')
    .eq('id', itemId)
    .eq('user_id', userId)
    .maybeSingle();
  if (itemError) throw ApiError.internal(itemError.message);
  if (!item) throw ApiError.notFound('Cart item not found');
  if (quantity > item.product.stock) throw ApiError.badRequest('Not enough stock available');

  const { data, error } = await supabaseAdmin
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    .eq('user_id', userId)
    .select('id')
    .single();
  if (error || !data) throw ApiError.notFound('Cart item not found');

  return getCart(userId);
}

export async function removeCartItem(userId, itemId) {
  const { error } = await supabaseAdmin.from('cart_items').delete().eq('id', itemId).eq('user_id', userId);
  if (error) throw ApiError.internal(error.message);
  return getCart(userId);
}

export async function clearCart(userId) {
  const { error } = await supabaseAdmin.from('cart_items').delete().eq('user_id', userId);
  if (error) throw ApiError.internal(error.message);
}
