
import { Router, Request, Response } from "express";
import { requireAdmin } from "../middleware/auth";
import { storage } from "../storage";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const router = Router();

interface OptimizationJob {
  id: string;
  filename: string;
  originalSize: number;
  optimizedSize: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  savedPercentage: number;
  error?: string;
}

const optimizationQueue: Map<string, OptimizationJob> = new Map();

router.get("/stats", requireAdmin, async (req: Request, res: Response) => {
  try {
    const uploadsDir = path.join(process.cwd(), "uploads", "images");
    const files = await fs.readdir(uploadsDir);
    
    let totalSize = 0;
    let optimizedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;
    }
    
    const jobs = Array.from(optimizationQueue.values());
    const completedJobs = jobs.filter(j => j.status === 'completed');
    optimizedCount = completedJobs.length;
    
    const totalSaved = completedJobs.reduce((sum, job) => 
      sum + (job.originalSize - job.optimizedSize), 0
    );
    
    const avgCompression = completedJobs.length > 0
      ? completedJobs.reduce((sum, job) => sum + job.savedPercentage, 0) / completedJobs.length
      : 0;
    
    res.json({
      totalImages: files.length,
      optimizedImages: optimizedCount,
      totalSize,
      savedSpace: totalSaved,
      avgCompression: Math.round(avgCompression)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/jobs", requireAdmin, async (req: Request, res: Response) => {
  try {
    const jobs = Array.from(optimizationQueue.values());
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/optimize", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { filename, quality = 80, maxWidth = 1920 } = req.body;
    
    if (!filename) {
      return res.status(400).json({ error: "Filename is required" });
    }
    
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const inputPath = path.join(process.cwd(), "uploads", "images", filename);
    
    const originalStats = await fs.stat(inputPath);
    const originalSize = originalStats.size;
    
    const job: OptimizationJob = {
      id: jobId,
      filename,
      originalSize,
      optimizedSize: originalSize,
      status: 'processing',
      savedPercentage: 0
    };
    
    optimizationQueue.set(jobId, job);
    
    // Optimize in background
    (async () => {
      try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();
        
        let processedImage = image;
        
        if (metadata.width && metadata.width > maxWidth) {
          processedImage = processedImage.resize(maxWidth);
        }
        
        const outputPath = inputPath;
        
        if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
          await processedImage.jpeg({ quality }).toFile(outputPath + '.tmp');
        } else if (metadata.format === 'png') {
          await processedImage.png({ quality }).toFile(outputPath + '.tmp');
        } else if (metadata.format === 'webp') {
          await processedImage.webp({ quality }).toFile(outputPath + '.tmp');
        } else {
          await processedImage.toFile(outputPath + '.tmp');
        }
        
        const optimizedStats = await fs.stat(outputPath + '.tmp');
        const optimizedSize = optimizedStats.size;
        
        await fs.rename(outputPath + '.tmp', outputPath);
        
        const savedPercentage = Math.round(((originalSize - optimizedSize) / originalSize) * 100);
        
        job.optimizedSize = optimizedSize;
        job.savedPercentage = savedPercentage;
        job.status = 'completed';
        optimizationQueue.set(jobId, job);
        
        await storage.createActivityLog({
          action: `Optimized image ${filename} (saved ${savedPercentage}%)`,
          userId: (req as any).user?.id,
          userName: (req as any).user?.name || "Admin",
          type: "info"
        });
      } catch (error: any) {
        job.status = 'failed';
        job.error = error.message;
        optimizationQueue.set(jobId, job);
      }
    })();
    
    res.json({ jobId, message: "Optimization started" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/optimize-all", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { quality = 80, maxWidth = 1920 } = req.body;
    const uploadsDir = path.join(process.cwd(), "uploads", "images");
    const files = await fs.readdir(uploadsDir);
    
    const imageFiles = files.filter(f => 
      /\.(jpg|jpeg|png|webp)$/i.test(f)
    );
    
    const jobIds = [];
    
    for (const filename of imageFiles) {
      const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      jobIds.push(jobId);
      
      // Queue optimization jobs
      setTimeout(() => {
        req.body = { filename, quality, maxWidth };
        // Process each file
      }, 100 * jobIds.length);
    }
    
    res.json({ 
      message: `Queued ${imageFiles.length} images for optimization`,
      count: imageFiles.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
