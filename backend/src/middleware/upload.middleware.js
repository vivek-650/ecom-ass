import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

// In-memory storage: the file buffer is streamed straight to Cloudinary
// (see modules/upload/upload.service.js) — it never touches disk.
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(ApiError.badRequest('Only image files are allowed'));
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('image');
