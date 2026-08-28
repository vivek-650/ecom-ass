import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import * as ordersService from './orders.service.js';

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const order = await ordersService.createRazorpayOrder(req.user.id);
  new ApiResponse(201, order, 'Razorpay order created').send(res);
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw ApiError.badRequest('Missing Razorpay verification fields');
  }
  const order = await ordersService.verifyAndFinalizeOrder(req.user.id, {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });
  new ApiResponse(200, order, 'Payment verified — order placed').send(res);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await ordersService.getMyOrders(req.user.id);
  new ApiResponse(200, orders).send(res);
});

export const getSellerOrders = asyncHandler(async (req, res) => {
  const orders = await ordersService.getSellerOrders(req.user.id);
  new ApiResponse(200, orders).send(res);
});

export const getAllOrders = asyncHandler(async (_req, res) => {
  const orders = await ordersService.getAllOrders();
  new ApiResponse(200, orders).send(res);
});

export const getSalesStats = asyncHandler(async (_req, res) => {
  const stats = await ordersService.getSalesStats();
  new ApiResponse(200, stats).send(res);
});
