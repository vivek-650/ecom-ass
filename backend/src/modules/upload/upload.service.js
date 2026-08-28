import { cloudinary } from '../../config/cloudinary.js';

/**
 * Streams an in-memory file buffer straight to Cloudinary — the raw file
 * never touches this server's disk, only the returned secure URL is
 * persisted to Postgres by the caller.
 */
export function uploadBufferToCloudinary(buffer, { folder = 'lumos-market/products' } = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export function deleteCloudinaryImage(publicId) {
  if (!publicId) return Promise.resolve();
  return cloudinary.uploader.destroy(publicId);
}
