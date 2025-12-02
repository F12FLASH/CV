import { Router } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/auth";
import * as fs from "fs";
import * as path from "path";
import multer from "multer";

const router = Router();

const uploadsDir = path.join(process.cwd(), "uploads");

const fileCounter: Record<string, number> = {};

function generateCleanFilename(originalName: string, subDir: string): string {
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

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = "media";
    if (file.mimetype.startsWith("image/")) {
      subDir = "images";
    } else if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-powerpoint" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      file.mimetype === "text/plain"
    ) {
      subDir = "documents";
    }

    const targetDir = path.join(uploadsDir, subDir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    let subDir = "media";
    if (file.mimetype.startsWith("image/")) subDir = "images";
    else if (["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.mimetype)) subDir = "documents";
    
    const cleanName = generateCleanFilename(file.originalname, subDir);
    cb(null, cleanName);
  }
});

const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFolderSize = (folderPath: string): { size: number; files: number } => {
  let totalSize = 0;
  let fileCount = 0;

  if (!fs.existsSync(folderPath)) {
    return { size: 0, files: 0 };
  }

  const items = fs.readdirSync(folderPath);
  for (const item of items) {
    const itemPath = path.join(folderPath, item);
    const stats = fs.statSync(itemPath);
    if (stats.isFile()) {
      totalSize += stats.size;
      fileCount++;
    } else if (stats.isDirectory()) {
      const subResult = getFolderSize(itemPath);
      totalSize += subResult.size;
      fileCount += subResult.files;
    }
  }
  return { size: totalSize, files: fileCount };
};

router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const uploadsPath = path.join(process.cwd(), "uploads");

    const imagesStats = getFolderSize(path.join(uploadsPath, "images"));
    const documentsStats = getFolderSize(path.join(uploadsPath, "documents"));
    const mediaStats = getFolderSize(path.join(uploadsPath, "media"));

    const totalSize = imagesStats.size + documentsStats.size + mediaStats.size;
    const totalFiles = imagesStats.files + documentsStats.files + mediaStats.files;
    const maxStorage = 10 * 1024 * 1024 * 1024;

    res.json({
      total: {
        size: totalSize,
        sizeFormatted: formatSize(totalSize),
        files: totalFiles,
        maxStorage: maxStorage,
        maxStorageFormatted: formatSize(maxStorage),
        usagePercent: ((totalSize / maxStorage) * 100).toFixed(1)
      },
      folders: {
        images: {
          size: imagesStats.size,
          sizeFormatted: formatSize(imagesStats.size),
          files: imagesStats.files
        },
        documents: {
          size: documentsStats.size,
          sizeFormatted: formatSize(documentsStats.size),
          files: documentsStats.files
        },
        media: {
          size: mediaStats.size,
          sizeFormatted: formatSize(mediaStats.size),
          files: mediaStats.files
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/files", requireAdmin, async (req, res) => {
  try {
    const { folder = "all" } = req.query;
    const uploadsPath = path.join(process.cwd(), "uploads");
    const files: Array<{ name: string; path: string; size: number; sizeFormatted: string; type: string; folder: string; modified: Date }> = [];

    const scanFolder = (folderName: string) => {
      const folderPath = path.join(uploadsPath, folderName);
      if (!fs.existsSync(folderPath)) return;

      const items = fs.readdirSync(folderPath);
      for (const item of items) {
        const itemPath = path.join(folderPath, item);
        const stats = fs.statSync(itemPath);
        if (stats.isFile()) {
          files.push({
            name: item,
            path: `/uploads/${folderName}/${item}`,
            size: stats.size,
            sizeFormatted: formatSize(stats.size),
            type: item.split('.').pop() || 'unknown',
            folder: folderName,
            modified: stats.mtime
          });
        }
      }
    };

    if (folder === "all") {
      scanFolder("images");
      scanFolder("documents");
      scanFolder("media");
    } else {
      scanFolder(folder as string);
    }

    files.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());

    res.json(files);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/files/:folder/:filename", requireAdmin, async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const filePath = path.join(process.cwd(), "uploads", folder, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    fs.unlinkSync(filePath);

    await storage.createActivityLog({
      action: `Deleted file: ${folder}/${filename}`,
      userId: req.session.userId,
      userName: req.session.username,
      type: "warning"
    });

    res.json({ message: "File deleted successfully", success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/upload", requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let subDir = "media";
    if (req.file.mimetype.startsWith("image/")) {
      subDir = "images";
    } else if (
      req.file.mimetype === "application/pdf" ||
      req.file.mimetype.includes("document") ||
      req.file.mimetype.includes("msword") ||
      req.file.mimetype.includes("spreadsheet") ||
      req.file.mimetype.includes("presentation") ||
      req.file.mimetype === "text/plain"
    ) {
      subDir = "documents";
    }

    const mediaItem = await storage.createMedia({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${subDir}/${req.file.filename}`
    });

    res.json(mediaItem);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
