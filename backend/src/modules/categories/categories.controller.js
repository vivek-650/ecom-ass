import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import * as categoriesService from './categories.service.js';

export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await categoriesService.listCategories();
  new ApiResponse(200, categories).send(res);
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoriesService.createCategory(req.body.name);
  new ApiResponse(201, category, 'Category created').send(res);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoriesService.updateCategory(req.params.id, req.body.name);
  new ApiResponse(200, category, 'Category updated').send(res);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoriesService.deleteCategory(req.params.id);
  new ApiResponse(200, null, 'Category deleted').send(res);
});
