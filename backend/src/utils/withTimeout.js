import { ApiError } from './ApiError.js';

/**
 * Bounds how long we'll wait on an upstream call (Supabase, Cloudinary,
 * Razorpay). Without this, a slow/hung third party makes our own API hang
 * indefinitely too — every upstream call in a production backend needs a
 * ceiling, so a degraded dependency fails fast with a clear error instead
 * of exhausting connections and looking like our server is broken.
 */
export function withTimeout(promise, ms = 12_000, message = 'Upstream service is not responding') {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new ApiError(503, `${message} — please try again shortly`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
