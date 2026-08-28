import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import * as productsService from './products.service.js';

export const getProducts = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, page, limit } = req.query;
  const result = await productsService.listProducts({
    search,
    category,
    minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
    maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 12,
  });
  new ApiResponse(200, result).send(res);
});

export const getMyProducts = asyncHandler(async (req, res) => {
  const products = await productsService.listMyProducts(req.user.id);
  new ApiResponse(200, products).send(res);
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productsService.getProductById(req.params.id);
  new ApiResponse(200, product).send(res);
});

function validateProductPayload(body, { partial = false } = {}) {
  const { name, price, categoryId, stock } = body;
  if (!partial || name !== undefined) {
    if (!name || !name.trim()) throw ApiError.badRequest('Product name is required');
  }
  if (!partial || price !== undefined) {
    if (price === undefined || Number.isNaN(Number(price)) || Number(price) < 0) {
      throw ApiError.badRequest('Price must be a non-negative number');
    }
  }
  if (!partial || categoryId !== undefined) {
    if (!categoryId) throw ApiError.badRequest('Category is required');
  }
  if (stock !== undefined && (Number.isNaN(Number(stock)) || Number(stock) < 0)) {
    throw ApiError.badRequest('Stock must be a non-negative number');
  }
}

export const createProduct = asyncHandler(async (req, res) => {
  validateProductPayload(req.body);
  const product = await productsService.createProduct(
    req.user,
    {
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      categoryId: req.body.categoryId,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : 0,
    },
    req.file
  );
  new ApiResponse(201, product, 'Product created').send(res);
});

export const updateProduct = asyncHandler(async (req, res) => {
  validateProductPayload(req.body, { partial: true });
  const payload = {};
  if (req.body.name !== undefined) payload.name = req.body.name;
  if (req.body.description !== undefined) payload.description = req.body.description;
  if (req.body.price !== undefined) payload.price = Number(req.body.price);
  if (req.body.categoryId !== undefined) payload.categoryId = req.body.categoryId;
  if (req.body.stock !== undefined) payload.stock = Number(req.body.stock);

  const product = await productsService.updateProduct(req.params.id, req.user, payload, req.file);
  new ApiResponse(200, product, 'Product updated').send(res);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productsService.deleteProduct(req.params.id, req.user);
  new ApiResponse(200, null, 'Product deleted').send(res);
});
