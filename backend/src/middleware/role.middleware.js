import { ApiError } from '../utils/ApiError.js';

/**
 * restrictTo('admin', 'sales_person') -> 403s any role not in the list.
 * Must run after requireAuth. This is the actual permission boundary for
 * the whole API — the frontend hiding a button is UX, not security.
 */
export const restrictTo =
  (...allowedRoles) =>
  (req, _res, next) => {
    if (!req.user) throw ApiError.unauthorized();
    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden(`This action requires one of these roles: ${allowedRoles.join(', ')}`);
    }
    next();
  };
