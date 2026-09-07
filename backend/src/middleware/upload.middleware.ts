import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary';

const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

export interface UploadResult {
  url: string;
  publicId?: string;
}

export const processUploadedFile = async (req: Request, file: Express.Multer.File): Promise<UploadResult> => {
  if (isCloudinaryConfigured) {
    try {
      const uploadRes = await cloudinary.uploader.upload(file.path, {
        folder: 'prism/profiles',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      });
      // Remove temporary disk file after successful Cloudinary upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return {
        url: uploadRes.secure_url,
        publicId: uploadRes.public_id,
      };
    } catch (error) {
      console.error('Cloudinary upload failed, falling back to local file:', error);
    }
  }

  // Fallback: Local URL
  const host = req.get('host') || 'localhost:5000';
  const protocol = req.protocol;
  const localUrl = `${protocol}://${host}/uploads/${file.filename}`;

  return {
    url: localUrl,
    publicId: file.filename,
  };
};
