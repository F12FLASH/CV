import multer from "multer";
import * as fs from "fs";
import * as path from "path";

export const uploadsDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const fileCounter: Record<string, number> = {};

export function generateCleanFilename(originalName: string, subDir: string): string {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const dateStr = `${day}${month}${year}`;
  
  const ext = path.extname(originalName);
  let baseName = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 30);
  
  if (!baseName) baseName = 'file';
  
  const counterKey = `${subDir}_${baseName}_${dateStr}`;
  fileCounter[counterKey] = (fileCounter[counterKey] || 0) + 1;
  const counter = fileCounter[counterKey];
  
  return `${baseName}_${counter}_${dateStr}${ext.toLowerCase()}`;
}

export function getSubdirectory(mimetype: string): string {
  if (mimetype.startsWith("image/")) {
    return "images";
  } else if (
    mimetype === "application/pdf" ||
    mimetype === "application/msword" ||
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimetype === "application/vnd.ms-excel" ||
    mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimetype === "application/vnd.ms-powerpoint" ||
    mimetype === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    mimetype === "text/plain"
  ) {
    return "documents";
  }
  return "media";
}

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = getSubdirectory(file.mimetype);
    const targetDir = path.join(uploadsDir, subDir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const subDir = getSubdirectory(file.mimetype);
    const cleanName = generateCleanFilename(file.originalname, subDir);
    cb(null, cleanName);
  }
});

export const allowedMimeTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain'
];

export const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});
