import { supabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../utils/ApiError.js';

const WISHLIST_SELECT = `
  id, created_at,
  product:products ( id, name, price, image_url, stock, category )
`;

export async function getWishlist(userId) {
  const { data, error } = await supabaseAdmin
    .from('wishlist_items')
    .select(WISHLIST_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw ApiError.internal(error.message);
  return data;
}

export async function addToWishlist(userId, productId) {
  const { error } = await supabaseAdmin
    .from('wishlist_items')
    .upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id,product_id' });
  if (error) throw ApiError.internal(error.message);
  return getWishlist(userId);
}

export async function removeFromWishlist(userId, productId) {
  const { error } = await supabaseAdmin
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) throw ApiError.internal(error.message);
  return getWishlist(userId);
}
