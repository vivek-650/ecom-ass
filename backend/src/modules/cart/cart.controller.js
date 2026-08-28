import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import * as cartService from './cart.service.js';

export const getCart = asyncHandler(async (req, res) => {
  const items = await cartService.getCart(req.user.id);
  new ApiResponse(200, items).send(res);
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) throw ApiError.badRequest('productId is required');
  const items = await cartService.addToCart(req.user.id, productId, Number(quantity) || 1);
  new ApiResponse(201, items, 'Added to cart').send(res);
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const items = await cartService.updateCartItem(req.user.id, req.params.itemId, Number(req.body.quantity));
  new ApiResponse(200, items, 'Cart updated').send(res);
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const items = await cartService.removeCartItem(req.user.id, req.params.itemId);
  new ApiResponse(200, items, 'Item removed').send(res);
});
