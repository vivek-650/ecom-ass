import crypto from 'node:crypto';
import { supabaseAdmin } from '../../config/supabase.js';
import { razorpay } from '../../config/razorpay.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { ORDER_STATUS } from '../../utils/constants.js';

const ORDER_WITH_ITEMS_SELECT = `
  id, total_amount, status, razorpay_order_id, razorpay_payment_id, created_at,
  order_items ( id, product_id, product_name, quantity, price_at_purchase, seller_id )
`;

/**
 * Step 1 of checkout: snapshot the user's cart into a pending order + order_items
 * (so price/seller are locked in even if the cart changes before payment completes),
 * then ask Razorpay to open a payable order for that amount.
 */
export async function createRazorpayOrder(userId) {
  const { data: cartItems, error: cartError } = await supabaseAdmin
    .from('cart_items')
    .select('quantity, product:products ( id, name, price, stock, owner_id )')
    .eq('user_id', userId);

  if (cartError) throw ApiError.internal(cartError.message);
  if (!cartItems?.length) throw ApiError.badRequest('Your cart is empty');

  for (const item of cartItems) {
    if (item.quantity > item.product.stock) {
      throw ApiError.badRequest(`"${item.product.name}" only has ${item.product.stock} left in stock`);
    }
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(totalAmount * 100), // paise
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
  });

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: userId,
      total_amount: totalAmount,
      status: ORDER_STATUS.CREATED,
      razorpay_order_id: razorpayOrder.id,
    })
    .select('id')
    .single();
  if (orderError) throw ApiError.internal(orderError.message);

  const orderItemsPayload = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    seller_id: item.product.owner_id,
    product_name: item.product.name,
    quantity: item.quantity,
    price_at_purchase: item.product.price,
  }));

  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItemsPayload);
  if (itemsError) throw ApiError.internal(itemsError.message);

  return {
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: env.razorpay.keyId,
    localOrderId: order.id,
  };
}

/**
 * Step 2 of checkout: recompute the HMAC signature server-side and compare
 * it to what Razorpay sent back. This is the check that stops a forged
 * "payment succeeded" callback from ever creating a real order.
 */
export async function verifyAndFinalizeOrder(userId, { razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, status')
    .eq('razorpay_order_id', razorpayOrderId)
    .eq('user_id', userId)
    .single();

  if (error || !order) throw ApiError.notFound('Order not found');
  if (order.status === ORDER_STATUS.PAID) return getOrderById(order.id);

  const expectedSignature = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    await supabaseAdmin.from('orders').update({ status: ORDER_STATUS.FAILED }).eq('id', order.id);
    throw ApiError.badRequest('Payment signature verification failed');
  }

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: ORDER_STATUS.PAID,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    })
    .eq('id', order.id);
  if (updateError) throw ApiError.internal(updateError.message);

  const { data: items } = await supabaseAdmin
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', order.id);

  await Promise.all(
    (items || []).map(async (item) => {
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();
      if (!product) return;
      await supabaseAdmin
        .from('products')
        .update({ stock: Math.max(product.stock - item.quantity, 0) })
        .eq('id', item.product_id);
    })
  );

  await supabaseAdmin.from('cart_items').delete().eq('user_id', userId);

  return getOrderById(order.id);
}

export async function getOrderById(id) {
  const { data, error } = await supabaseAdmin.from('orders').select(ORDER_WITH_ITEMS_SELECT).eq('id', id).single();
  if (error || !data) throw ApiError.notFound('Order not found');
  return data;
}

export async function getMyOrders(userId) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(ORDER_WITH_ITEMS_SELECT)
    .eq('user_id', userId)
    .eq('status', ORDER_STATUS.PAID)
    .order('created_at', { ascending: false });
  if (error) throw ApiError.internal(error.message);
  return data;
}

/** Orders containing at least one of this seller's products. */
export async function getSellerOrders(sellerId) {
  const { data: items, error } = await supabaseAdmin
    .from('order_items')
    .select('id, product_name, quantity, price_at_purchase, order:orders ( id, status, created_at, user_id )')
    .eq('seller_id', sellerId);
  if (error) throw ApiError.internal(error.message);

  return items
    .filter((item) => item.order?.status === ORDER_STATUS.PAID)
    .sort((a, b) => new Date(b.order.created_at) - new Date(a.order.created_at));
}

export async function getAllOrders() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(ORDER_WITH_ITEMS_SELECT)
    .eq('status', ORDER_STATUS.PAID)
    .order('created_at', { ascending: false });
  if (error) throw ApiError.internal(error.message);
  return data;
}

export async function getSalesStats() {
  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('total_amount')
    .eq('status', ORDER_STATUS.PAID);
  if (error) throw ApiError.internal(error.message);

  const { count: productCount } = await supabaseAdmin
    .from('products')
    .select('id', { count: 'exact', head: true });

  const { count: userCount } = await supabaseAdmin
    .from('profiles')
    .select('id', { count: 'exact', head: true });

  return {
    totalOrders: orders.length,
    totalSales: orders.reduce((sum, o) => sum + Number(o.total_amount), 0),
    totalProducts: productCount ?? 0,
    totalUsers: userCount ?? 0,
  };
}
