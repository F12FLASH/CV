import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { locale, namespace } = req.query;
    
    if (!locale) {
      return res.status(400).json({ message: "Locale is required" });
    }
    
    const translations = await storage.getTranslationsByLocale(
      locale as string, 
      namespace as string | undefined
    );
    
    const translationMap: Record<string, string> = {};
    for (const t of translations) {
      translationMap[t.key] = t.value;
    }
    
    res.json(translationMap);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/all", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { locale, namespace } = req.query;
    
    if (locale) {
      const translations = await storage.getTranslationsByLocale(
        locale as string, 
        namespace as string | undefined
      );
      return res.json(translations);
    }
    
    const enTranslations = await storage.getTranslationsByLocale('en');
    const viTranslations = await storage.getTranslationsByLocale('vi');
    
    res.json({
      en: enTranslations,
      vi: viTranslations,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { key, locale, value, namespace } = req.body;
    
    if (!key || !locale || !value) {
      return res.status(400).json({ message: "Key, locale, and value are required" });
    }
    
    const translation = await storage.upsertTranslation({
      key,
      locale,
      value,
      namespace: namespace || 'common',
    });
    
    res.json(translation);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/bulk", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { translations, locale, namespace } = req.body;
    
    if (!translations || !locale || typeof translations !== 'object') {
      return res.status(400).json({ message: "Translations object and locale are required" });
    }
    
    const results = [];
    for (const [key, value] of Object.entries(translations)) {
      if (typeof value === 'string') {
        const translation = await storage.upsertTranslation({
          key,
          locale,
          value,
          namespace: namespace || 'common',
        });
        results.push(translation);
      }
    }
    
    res.json({ updated: results.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteTranslation(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Translation not found" });
    }
    
    res.json({ message: "Translation deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/export", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { locale } = req.query;
    
    if (!locale) {
      return res.status(400).json({ message: "Locale is required" });
    }
    
    const translations = await storage.getTranslationsByLocale(locale as string);
    
    const exportData: Record<string, Record<string, string>> = {};
    for (const t of translations) {
      const ns = t.namespace || 'common';
      if (!exportData[ns]) {
        exportData[ns] = {};
      }
      exportData[ns][t.key] = t.value;
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=translations-${locale}.json`);
    res.json(exportData);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/import", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { locale, data } = req.body;
    
    if (!locale || !data) {
      return res.status(400).json({ message: "Locale and data are required" });
    }
    
    let imported = 0;
    
    for (const [namespace, translations] of Object.entries(data)) {
      if (typeof translations === 'object' && translations !== null) {
        for (const [key, value] of Object.entries(translations as Record<string, string>)) {
          if (typeof value === 'string') {
            await storage.upsertTranslation({
              key,
              locale,
              value,
              namespace,
            });
            imported++;
          }
        }
      }
    }
    
    res.json({ message: `Imported ${imported} translations`, imported });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
