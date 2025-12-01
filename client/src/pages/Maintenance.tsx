import { useSiteSettings } from "@/context/SiteContext";
import { AlertTriangle } from "lucide-react";

export default function Maintenance() {
  const { settings } = useSiteSettings();

  const maintenanceTitle = settings.maintenanceTitle || "Under Maintenance";
  const maintenanceMessage = settings.maintenanceMessage || "We're currently performing scheduled maintenance. Please check back soon.";
  const maintenanceEstimate = settings.maintenanceEstimate || "We expect to be back online shortly.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center px-4 max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-yellow-500/10 p-4 border border-yellow-500/20">
            <AlertTriangle className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-3 dark:text-white">
          {maintenanceTitle}
        </h1>
        
        <p className="text-lg text-slate-300 mb-4">
          {maintenanceMessage}
        </p>

        <p className="text-sm text-slate-400 mb-8">
          {maintenanceEstimate}
        </p>

        <div className="pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-500">
            If you have any questions, please contact us at{" "}
            <a
              href={`mailto:${settings.contactEmail || "support@example.com"}`}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {settings.contactEmail || "support@example.com"}
            </a>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-600">
            {settings.footerCopyright || "All rights reserved."}
          </p>
        </div>
      </div>
    </div>
  );
}
