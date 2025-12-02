import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/auth";
import crypto from "crypto";

const router = Router();

function getVisitorId(req: any): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  return crypto.createHash('md5').update(`${ip}-${userAgent}`).digest('hex').substring(0, 16);
}

router.get("/:commentId/likes", async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const visitorId = getVisitorId(req);
    
    const likes = await storage.getCommentLikes(commentId);
    const userLike = await storage.getVisitorCommentLike(commentId, visitorId);
    
    res.json({
      ...likes,
      userVote: userLike ? (userLike.isLike ? 'like' : 'dislike') : null,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:commentId/like", async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const visitorId = getVisitorId(req);
    
    await storage.upsertCommentLike({
      commentId,
      visitorId,
      isLike: true,
    });
    
    const likes = await storage.getCommentLikes(commentId);
    res.json({ ...likes, userVote: 'like' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:commentId/dislike", async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const visitorId = getVisitorId(req);
    
    await storage.upsertCommentLike({
      commentId,
      visitorId,
      isLike: false,
    });
    
    const likes = await storage.getCommentLikes(commentId);
    res.json({ ...likes, userVote: 'dislike' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:commentId/vote", async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const visitorId = getVisitorId(req);
    
    await storage.deleteCommentLike(commentId, visitorId);
    
    const likes = await storage.getCommentLikes(commentId);
    res.json({ ...likes, userVote: null });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:commentId/report", async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const { reason, reporterEmail } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: "Reason is required" });
    }
    
    await storage.createCommentReport({
      commentId,
      reason,
      reporterEmail: reporterEmail || null,
    });
    
    await storage.createActivityLog({
      action: `Comment #${commentId} was reported: ${reason}`,
      type: 'warning'
    });
    
    res.json({ message: "Report submitted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/reports", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    
    if (status === 'pending') {
      const reports = await storage.getPendingCommentReports();
      return res.json(reports);
    }
    
    const reports = await storage.getAllCommentReports();
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/reports/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const reportId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status || !['reviewed', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: "Valid status is required" });
    }
    
    const report = await storage.updateCommentReportStatus(
      reportId, 
      status, 
      (req.session as any).userId!
    );
    
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/reports/:id/delete-comment", requireAdmin, async (req: Request, res: Response) => {
  try {
    const reportId = parseInt(req.params.id);
    
    const report = await storage.getCommentReport(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    
    await storage.deleteComment(report.commentId);
    await storage.updateCommentReportStatus(reportId, 'reviewed', (req.session as any).userId!);
    
    await storage.createActivityLog({
      action: `Deleted comment #${report.commentId} after reviewing report`,
      userId: (req.session as any).userId,
      userName: (req.session as any).username,
      type: 'warning'
    });
    
    res.json({ message: "Comment deleted and report reviewed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
