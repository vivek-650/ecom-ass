import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import * as usersService from './users.service.js';

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await usersService.listUsers();
  new ApiResponse(200, users).send(res);
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const updated = await usersService.updateUserRole(req.params.id, req.body.role);
  new ApiResponse(200, updated, 'Role updated').send(res);
});
