import crypto from 'node:crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Stripe/Razorpay-style idempotency: a client retrying a request (double
 * "Checkout" click, a timeout that fires before the response arrives, a
 * mobile network retry) sends the same `Idempotency-Key` header and gets
 * the exact same response replayed — the underlying side effect (creating
 * a Razorpay order + snapshotting the cart) runs at most once. Must be
 * mounted after `requireAuth` — it keys on req.user.id.
 *
 * Known limitation: if the process crashes mid-request, that key's row is
 * left `processing` forever and blocks retries. A production deployment
 * would reap stale `processing` rows (e.g. older than a few minutes) on a
 * schedule; out of scope for this project's size.
 */
export const idempotent = () =>
  asyncHandler(async (req, res, next) => {
    const key = req.headers['idempotency-key'];
    if (!key || typeof key !== 'string') {
      throw ApiError.badRequest('Idempotency-Key header is required for this operation');
    }

    const path = req.originalUrl.split('?')[0];
    const requestHash = crypto.createHash('sha256').update(JSON.stringify(req.body ?? {})).digest('hex');

    const { data: existing } = await supabaseAdmin
      .from('idempotency_keys')
      .select('status, request_hash, response_status, response_body')
      .eq('idempotency_key', key)
      .eq('user_id', req.user.id)
      .eq('method', req.method)
      .eq('path', path)
      .maybeSingle();

    if (existing) {
      if (existing.request_hash !== requestHash) {
        throw new ApiError(422, 'This Idempotency-Key was already used with a different request body');
      }
      if (existing.status === 'processing') {
        throw new ApiError(409, 'A request with this Idempotency-Key is already being processed');
      }
      res.status(existing.response_status).json(existing.response_body);
      return;
    }

    const { error: insertError } = await supabaseAdmin.from('idempotency_keys').insert({
      idempotency_key: key,
      user_id: req.user.id,
      method: req.method,
      path,
      request_hash: requestHash,
    });

    if (insertError) {
      // Unique-constraint race: a concurrent request with the same key won the insert.
      if (insertError.code === '23505') {
        throw new ApiError(409, 'A request with this Idempotency-Key is already being processed');
      }
      throw ApiError.internal(insertError.message);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      supabaseAdmin
        .from('idempotency_keys')
        .update({ status: 'completed', response_status: res.statusCode, response_body: body })
        .eq('idempotency_key', key)
        .eq('user_id', req.user.id)
        .eq('method', req.method)
        .eq('path', path)
        .then(({ error }) => {
          if (error) req.log?.error({ err: error }, 'Failed to persist idempotency response');
        });
      return originalJson(body);
    };

    next();
  });
