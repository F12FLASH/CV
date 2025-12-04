import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { upload, uploadsDir, generateCleanFilename } from "../utils/upload";
import * as fs from "fs";
import * as path from "path";

const router = Router();

router.post("/upload/file", requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file;
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

    const fileUrl = `/uploads/${subDir}/${file.filename}`;

    const mediaItem = await storage.createMedia({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: fileUrl,
      alt: req.body.alt || null,
    });

    res.status(201).json(mediaItem);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/upload/files", requireAuth, upload.array('files', 20), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const mediaItems = [];

    for (const file of files) {
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

      const fileUrl = `/uploads/${subDir}/${file.filename}`;

      const mediaItem = await storage.createMedia({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: fileUrl,
        alt: null,
      });

      mediaItems.push(mediaItem);
    }

    res.status(201).json(mediaItems);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/upload/image", requireAuth, async (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ message: "No image data provided" });
    }

    const imagesDir = path.join(process.cwd(), "uploads", "images");
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    if (image.startsWith("data:")) {
      const matches = image.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ message: "Invalid base64 image format" });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");

      let ext = ".png";
      if (mimeType === "image/jpeg" || mimeType === "image/jpg") ext = ".jpg";
      else if (mimeType === "image/gif") ext = ".gif";
      else if (mimeType === "image/webp") ext = ".webp";
      else if (mimeType === "image/svg+xml") ext = ".svg";

      const originalName = filename || `image${ext}`;
      const finalFilename = generateCleanFilename(originalName, "images");
      const filePath = path.join(imagesDir, finalFilename);

      const resolvedPath = path.resolve(filePath);
      const resolvedUploadsDir = path.resolve(imagesDir);
      if (!resolvedPath.startsWith(resolvedUploadsDir)) {
        return res.status(400).json({ message: "Invalid file path" });
      }

      fs.writeFileSync(filePath, buffer);

      const savedUrl = `/uploads/images/${finalFilename}`;

      try {
        await storage.createMedia({
          filename: finalFilename,
          originalName: originalName,
          mimeType: mimeType,
          size: buffer.length,
          url: savedUrl,
          alt: null,
        });
      } catch (dbError) {
        console.error("Failed to save media to database:", dbError);
      }

      res.json({ url: savedUrl, path: savedUrl });
    } else if (image.startsWith("http://") || image.startsWith("https://")) {
      res.json({ url: image, path: image });
    } else {
      return res.status(400).json({ message: "Invalid image format. Must be base64 data URL or HTTP URL" });
    }
  } catch (error: any) {
    console.error("Upload image error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/media", requireAuth, async (req, res) => {
  try {
    const media = await storage.getAllMedia();
    res.json(media);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/media", requireAuth, async (req, res) => {
  try {
    const { filename, originalName, mimeType, size, url, alt } = req.body;
    if (!filename || !originalName || !mimeType || !url) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const safeFilename = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!safeFilename || safeFilename.startsWith('.')) {
      return res.status(400).json({ message: "Invalid filename" });
    }

    let savedUrl = url;

    if (url.startsWith("data:")) {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      let subDir = "media";
      if (mimeType.startsWith("image/")) {
        subDir = "images";
      } else if (
        mimeType === "application/pdf" ||
        mimeType === "application/msword" ||
        mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        mimeType === "application/vnd.ms-excel" ||
        mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        mimeType === "application/vnd.ms-powerpoint" ||
        mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
        mimeType === "text/plain"
      ) {
        subDir = "documents";
      }

      const targetDir = path.join(uploadsDir, subDir);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const base64Data = url.split(",")[1];
      if (!base64Data) {
        return res.status(400).json({ message: "Invalid base64 data" });
      }

      const buffer = Buffer.from(base64Data, "base64");
      const filePath = path.join(targetDir, safeFilename);

      const resolvedPath = path.resolve(filePath);
      const resolvedTargetDir = path.resolve(targetDir);
      if (!resolvedPath.startsWith(resolvedTargetDir)) {
        return res.status(400).json({ message: "Invalid file path" });
      }

      fs.writeFileSync(filePath, buffer);
      savedUrl = `/uploads/${subDir}/${safeFilename}`;
    }

    const mediaItem = await storage.createMedia({
      filename: safeFilename,
      originalName,
      mimeType,
      size: size || 0,
      url: savedUrl,
      alt: alt || null,
    });
    res.status(201).json(mediaItem);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/media/:id", requireAuth, async (req, res) => {
  try {
    const mediaItem = await storage.getMedia(parseInt(req.params.id));
    if (!mediaItem) {
      return res.status(404).json({ message: "Media not found" });
    }
    res.json(mediaItem);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/media/:id", requireAuth, async (req, res) => {
  try {
    const { alt } = req.body;
    const mediaItem = await storage.updateMedia(parseInt(req.params.id), { alt });
    if (!mediaItem) {
      return res.status(404).json({ message: "Media not found" });
    }
    res.json(mediaItem);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/media/:id", requireAuth, async (req, res) => {
  try {
    const mediaItem = await storage.getMedia(parseInt(req.params.id));
    if (!mediaItem) {
      return res.status(404).json({ message: "Media not found" });
    }

    if (mediaItem.url.startsWith("/uploads/")) {
      const relativePath = mediaItem.url.replace(/^\//, "");
      const filePath = path.join(process.cwd(), relativePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const success = await storage.deleteMedia(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Failed to delete media record" });
    }
    res.json({ message: "Media deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/media/sync", requireAuth, async (req, res) => {
  try {
    const folders = ["images", "documents", "media"];
    const syncedFiles: any[] = [];
    const skippedFiles: string[] = [];

    const existingMedia = await storage.getAllMedia();
    const existingUrls = new Set(existingMedia.map(m => m.url));

    for (const folder of folders) {
      const folderPath = path.join(uploadsDir, folder);
      if (!fs.existsSync(folderPath)) continue;

      const files = fs.readdirSync(folderPath);
      for (const filename of files) {
        const filePath = path.join(folderPath, filename);
        const stat = fs.statSync(filePath);

        if (!stat.isFile()) continue;

        const url = `/uploads/${folder}/${filename}`;

        if (existingUrls.has(url)) {
          skippedFiles.push(filename);
          continue;
        }

        const ext = path.extname(filename).toLowerCase();
        let mimeType = "application/octet-stream";
        const mimeTypes: Record<string, string> = {
          ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
          ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml",
          ".pdf": "application/pdf", ".doc": "application/msword",
          ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ".xls": "application/vnd.ms-excel",
          ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ".txt": "text/plain", ".mp4": "video/mp4", ".mp3": "audio/mpeg"
        };
        if (mimeTypes[ext]) mimeType = mimeTypes[ext];

        const mediaItem = await storage.createMedia({
          filename,
          originalName: filename,
          mimeType,
          size: stat.size,
          url,
          alt: null
        });
        syncedFiles.push(mediaItem);
      }
    }

    res.json({
      message: `Synced ${syncedFiles.length} files, skipped ${skippedFiles.length} existing files`,
      synced: syncedFiles,
      skipped: skippedFiles
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
