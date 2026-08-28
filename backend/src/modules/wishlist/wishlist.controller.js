import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import * as wishlistService from './wishlist.service.js';

export const getWishlist = asyncHandler(async (req, res) => {
  const items = await wishlistService.getWishlist(req.user.id);
  new ApiResponse(200, items).send(res);
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) throw ApiError.badRequest('productId is required');
  const items = await wishlistService.addToWishlist(req.user.id, productId);
  new ApiResponse(201, items, 'Added to wishlist').send(res);
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const items = await wishlistService.removeFromWishlist(req.user.id, req.params.productId);
  new ApiResponse(200, items, 'Removed from wishlist').send(res);
});
