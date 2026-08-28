import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import * as authService from './auth.service.js';

export const getMe = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.id);
  new ApiResponse(200, profile).send(res);
});
