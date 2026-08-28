import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../utils/constants.js';
import * as authService from './auth.service.js';

const SELF_REGISTERABLE_ROLES = [ROLES.USER, ROLES.SALES_PERSON];

export const register = asyncHandler(async (req, res) => {
  const { email, password, fullName, role } = req.body;

  if (!email || !password || !fullName) {
    throw ApiError.badRequest('email, password, and fullName are required');
  }
  if (password.length < 6) throw ApiError.badRequest('Password must be at least 6 characters');
  // Admin is never self-service — see supabase/seed.sql for that promotion path.
  if (!SELF_REGISTERABLE_ROLES.includes(role)) {
    throw ApiError.badRequest(`role must be one of: ${SELF_REGISTERABLE_ROLES.join(', ')}`);
  }

  const user = await authService.registerUser({ email, password, fullName, role });
  new ApiResponse(201, { id: user.id, email: user.email }, 'Account created — you can now sign in').send(res);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw ApiError.badRequest('email and password are required');

  const { user, session } = await authService.loginUser({ email, password });
  new ApiResponse(
    200,
    {
      user: { id: user.id, email: user.email },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
      },
    },
    'Signed in'
  ).send(res);
});

export const getMe = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.id);
  new ApiResponse(200, profile).send(res);
});
