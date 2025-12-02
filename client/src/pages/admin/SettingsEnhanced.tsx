import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Save,
  Upload,
  Mail,
  Database,
  Zap,
  Key,
  Plug,
  Bell,
  Code2,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  DollarSign,
  Hash,
  Languages,
  HardDrive,
  RefreshCw,
  Download,
  Trash2,
  Terminal,
  Bug,
  Gauge,
  Server,
  X,
  ImageIcon,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { SettingsPerformance } from "./SettingsPerformance";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StorageTab } from "@/components/admin/StorageTab";
import { DatabaseTab } from "@/components/admin/DatabaseTab";
import { LoggingTab } from "@/components/admin/LoggingTab";
import { useSiteSettings } from "@/context/SiteContext";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface EmailTemplate {
  subject: string;
  body: string;
}

export default function AdminSettingsEnhanced() {
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const [cvFileUploading, setCVFileUploading] = useState(false);
  const [brandingUploading, setBrandingUploading] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const cvFileInputRef = useRef<HTMLInputElement>(null);
  const { settings, updateSettings, saveSettings, isSaving } =
    useSiteSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch email templates with TanStack Query
  const { data: emailTemplates = {}, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/email/templates'],
    queryFn: () => api.getEmailTemplates()
  });

  // Mutation for updating email templates
  const updateTemplateMutation = useMutation({
    mutationFn: ({ name, data }: { name: string; data: { subject: string; body: string } }) =>
      api.updateEmailTemplate(name, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email/templates'] });
      toast({ title: "Success", description: "Email template saved successfully" });
      setEditingTemplate(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const openTemplateEditor = (templateName: string) => {
    const template = emailTemplates[templateName];
    if (template) {
      setTemplateSubject(template.subject);
      setTemplateBody(template.body);
    } else {
      setTemplateSubject("");
      setTemplateBody("");
    }
    setEditingTemplate(templateName);
  };

  const saveTemplate = () => {
    if (!editingTemplate) return;
    updateTemplateMutation.mutate({
      name: editingTemplate,
      data: { subject: templateSubject, body: templateBody }
    });
  };

  const templateLabels: Record<string, string> = {
    welcome: "Welcome Email",
    notification: "Notification Email",
    newsletter: "Newsletter Template",
    contact: "Contact Form Email",
    comment: "Comment Notification"
  };

  const handleBrandingUpload = async (
    file: File,
    settingKey: "logoUrl" | "faviconUrl"
  ) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setBrandingUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Upload failed");
      }

      const data = await response.json();
      updateSettings({ [settingKey]: data.url });
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setBrandingUploading(false);
    }
  };

  const handleProfileImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        title: "Error",
        description: `File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        variant: "destructive",
      });
      return;
    }

    setProfileImageUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        updateSettings({ aboutImage: base64 });
        toast({ title: "Success", description: `Image uploaded successfully (${(file.size / 1024).toFixed(2)}KB)` });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setProfileImageUploading(false);
    }
  };

  const handleCVFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.type !== "application/pdf") {
      toast({
        title: "Error",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_PDF_SIZE) {
      toast({
        title: "Error",
        description: `File size exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        variant: "destructive",
      });
      return;
    }

    setCVFileUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        updateSettings({ cvFileUrl: base64 });
        toast({
          title: "Success",
          description: `CV file uploaded successfully (${(file.size / 1024).toFixed(2)}KB)`,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload CV file",
        variant: "destructive",
      });
    } finally {
      setCVFileUploading(false);
    }
  };

  const handleSave = async () => {
    console.log("handleSave called with current settings:", settings);
    const result = await saveSettings();
    console.log("Save result:", result);
    if (result?.success) {
      toast({ 
        title: "Thành công ✓", 
        description: "Cài đặt được lưu thành công" 
      });
    } else {
      toast({
        title: "Lỗi",
        description: result?.error || "Không thể lưu cài đặt",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your website configuration
            </p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <div className="w-full overflow-x-auto">
            <TabsList className="inline-flex gap-1 h-auto p-1 min-w-full">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="developer">Developer</TabsTrigger>
              <TabsTrigger value="localization">Localization</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="logging">Logging</TabsTrigger>
            </TabsList>
          </div>

          {/* GENERAL TAB */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>
                  Basic information about your portfolio website.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Site Title (Homepage & Admin)</Label>
                  <Input
                    value={settings.siteTitle}
                    onChange={(e) =>
                      updateSettings({ siteTitle: e.target.value })
                    }
                    placeholder="e.g., Loi Developer - Full-stack Creative"
                    data-testid="input-site-title"
                  />
                  <p className="text-xs text-muted-foreground">
                    Appears in browser tab and header
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input
                    value={settings.tagline}
                    onChange={(e) =>
                      updateSettings({ tagline: e.target.value })
                    }
                    placeholder="e.g., Building digital experiences with code."
                    data-testid="input-tagline"
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>
                  Main heading and call-to-action on homepage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Hero Title</Label>
                  <Input
                    value={settings.heroTitle}
                    onChange={(e) =>
                      updateSettings({ heroTitle: e.target.value })
                    }
                    placeholder="e.g., Hello, I'm Loi Developer"
                    data-testid="input-hero-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero Subtitle</Label>
                  <Textarea
                    value={settings.heroSubtitle}
                    onChange={(e) =>
                      updateSettings({ heroSubtitle: e.target.value })
                    }
                    placeholder="e.g., Full-stack Developer | UI/UX Enthusiast"
                    rows={2}
                    data-testid="input-hero-subtitle"
                  />
                </div>
                <div className="space-y-2">
                  <Label>View Projects CTA Button Text</Label>
                  <Input
                    value={settings.heroCTA}
                    onChange={(e) =>
                      updateSettings({ heroCTA: e.target.value })
                    }
                    placeholder="e.g., View My Work"
                    data-testid="input-hero-cta"
                  />
                </div>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    CV File Management
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Upload a PDF or paste a link for your CV Download button
                  </p>
                  {settings.cvFileUrl && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 flex-shrink-0 text-primary" />
                        <span
                          className="text-sm font-medium truncate"
                          data-testid="text-cv-file-name"
                        >
                          {settings.cvFileUrl.startsWith("data:")
                            ? "CV.pdf"
                            : settings.cvFileUrl.split("/").pop() || "CV file"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateSettings({ cvFileUrl: "" })}
                        data-testid="button-remove-cv"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {!settings.cvFileUrl && (
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-3">
                        No CV uploaded
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Upload from device or paste a PDF link
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => cvFileInputRef.current?.click()}
                      disabled={cvFileUploading}
                      data-testid="button-upload-cv"
                    >
                      <Upload className="w-4 h-4 mr-2" />{" "}
                      {cvFileUploading ? "Uploading..." : "Upload PDF"}
                    </Button>
                    <input
                      ref={cvFileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleCVFileUpload}
                      className="hidden"
                      data-testid="input-cv-file-upload"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Or Paste PDF URL</Label>
                    <Input
                      value={settings.cvFileUrl}
                      onChange={(e) =>
                        updateSettings({ cvFileUrl: e.target.value })
                      }
                      placeholder="e.g., https://example.com/CV.pdf or /uploads/CV.pdf"
                      data-testid="input-cv-file-url"
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste a direct link to your CV PDF file
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About Me Section</CardTitle>
                <CardDescription>
                  Complete information about yourself with professional
                  formatting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={settings.aboutTitle}
                    onChange={(e) =>
                      updateSettings({ aboutTitle: e.target.value })
                    }
                    placeholder="e.g., About Me"
                    data-testid="input-about-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Profile Image</Label>
                  <div className="flex flex-col gap-3">
                    {settings.aboutImage && (
                      <div className="relative w-full max-w-xs">
                        <img
                          src={settings.aboutImage}
                          alt="Profile preview"
                          className="w-full h-64 object-cover rounded-lg border border-border"
                        />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => updateSettings({ aboutImage: "" })}
                          data-testid="button-remove-profile-image"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {!settings.aboutImage && (
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-3">
                          No image selected
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => profileImageInputRef.current?.click()}
                      disabled={profileImageUploading}
                      data-testid="button-upload-profile-image"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                    <input
                      ref={profileImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileImageUpload}
                      data-testid="input-profile-image-file"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Or paste image URL</Label>
                    <Input
                      value={settings.aboutImage}
                      onChange={(e) =>
                        updateSettings({ aboutImage: e.target.value })
                      }
                      placeholder="e.g., https://example.com/image.jpg or /uploads/profile.jpg"
                      data-testid="input-about-image-url"
                    />
                    <p className="text-xs text-muted-foreground">
                      Supports any image format (JPG, PNG, GIF, WebP, etc.)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input
                    value={settings.aboutName}
                    onChange={(e) =>
                      updateSettings({ aboutName: e.target.value })
                    }
                    placeholder="e.g., Nguyen Thanh Loi"
                    data-testid="input-about-name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From (Location)</Label>
                    <Input
                      value={settings.aboutLocation}
                      onChange={(e) =>
                        updateSettings({ aboutLocation: e.target.value })
                      }
                      placeholder="e.g., Ho Chi Minh City"
                      data-testid="input-about-location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Freelance Status</Label>
                    <Input
                      value={settings.aboutFreelance}
                      onChange={(e) =>
                        updateSettings({ aboutFreelance: e.target.value })
                      }
                      placeholder="e.g., Available"
                      data-testid="input-about-freelance"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={settings.aboutSubtitle}
                    onChange={(e) =>
                      updateSettings({ aboutSubtitle: e.target.value })
                    }
                    placeholder="e.g., Full-stack Developer based in Vietnam"
                    data-testid="input-about-subtitle"
                  />
                </div>

                <div className="space-y-2">
                  <Label>First Paragraph (Description)</Label>
                  <p className="text-sm text-muted-foreground">
                    Use the rich text editor to format your content with
                    headings, lists, links, and more.
                  </p>
                  <RichTextEditor
                    value={settings.aboutDescription}
                    onChange={(value) =>
                      updateSettings({ aboutDescription: value })
                    }
                    placeholder="Write your first paragraph about yourself..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Second Paragraph (Philosophy/Additional Info)</Label>
                  <p className="text-sm text-muted-foreground">
                    Add your philosophy or additional information in the second
                    paragraph.
                  </p>
                  <RichTextEditor
                    value={settings.aboutDescription2}
                    onChange={(value) =>
                      updateSettings({ aboutDescription2: value })
                    }
                    placeholder="Write your philosophy or additional information..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Section</CardTitle>
                <CardDescription>
                  Contact form and information display.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={settings.contactTitle}
                    onChange={(e) =>
                      updateSettings({ contactTitle: e.target.value })
                    }
                    placeholder="e.g., Let's Talk"
                    data-testid="input-contact-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Section Subtitle</Label>
                  <Textarea
                    value={settings.contactSubtitle}
                    onChange={(e) =>
                      updateSettings({ contactSubtitle: e.target.value })
                    }
                    placeholder="e.g., Have a project in mind?"
                    rows={2}
                    data-testid="input-contact-subtitle"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) =>
                      updateSettings({ contactEmail: e.target.value })
                    }
                    placeholder="e.g., hello@example.com"
                    data-testid="input-contact-email"
                  />
                  <p className="text-xs text-muted-foreground">
                    This email is used in both About and Contact sections
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={settings.contactPhone}
                      onChange={(e) =>
                        updateSettings({ contactPhone: e.target.value })
                      }
                      placeholder="e.g., +84 123 456 789"
                      data-testid="input-contact-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={settings.contactAddress}
                      onChange={(e) =>
                        updateSettings({ contactAddress: e.target.value })
                      }
                      placeholder="e.g., Ho Chi Minh City, Vietnam"
                      data-testid="input-contact-address"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media Links (Follow Me)</CardTitle>
                <CardDescription>
                  Add your social media profiles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input
                    value={settings.socialFacebook}
                    onChange={(e) =>
                      updateSettings({ socialFacebook: e.target.value })
                    }
                    placeholder="https://facebook.com/username"
                    data-testid="input-social-facebook"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter/X URL</Label>
                  <Input
                    value={settings.socialTwitter}
                    onChange={(e) =>
                      updateSettings({ socialTwitter: e.target.value })
                    }
                    placeholder="https://twitter.com/username"
                    data-testid="input-social-twitter"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input
                    value={settings.socialInstagram}
                    onChange={(e) =>
                      updateSettings({ socialInstagram: e.target.value })
                    }
                    placeholder="https://instagram.com/username"
                    data-testid="input-social-instagram"
                  />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={settings.socialLinkedin}
                    onChange={(e) =>
                      updateSettings({ socialLinkedin: e.target.value })
                    }
                    placeholder="https://linkedin.com/in/username"
                    data-testid="input-social-linkedin"
                  />
                </div>
                <div className="space-y-2">
                  <Label>GitHub URL</Label>
                  <Input
                    value={settings.socialGithub}
                    onChange={(e) =>
                      updateSettings({ socialGithub: e.target.value })
                    }
                    placeholder="https://github.com/username"
                    data-testid="input-social-github"
                  />
                </div>
                <div className="space-y-2">
                  <Label>YouTube URL</Label>
                  <Input
                    value={settings.socialYoutube}
                    onChange={(e) =>
                      updateSettings({ socialYoutube: e.target.value })
                    }
                    placeholder="https://youtube.com/@username"
                    data-testid="input-social-youtube"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Footer</CardTitle>
                <CardDescription>
                  Footer content and copyright information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Footer Text</Label>
                  <Input
                    value={settings.footerText}
                    onChange={(e) =>
                      updateSettings({ footerText: e.target.value })
                    }
                    placeholder="e.g., Crafted with love & countless cups of coffee"
                    data-testid="input-footer-text"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Copyright Notice</Label>
                  <Input
                    value={settings.footerCopyright}
                    onChange={(e) =>
                      updateSettings({ footerCopyright: e.target.value })
                    }
                    placeholder="e.g., 2024 Loi Developer. All rights reserved."
                    data-testid="input-footer-copyright"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Mode</CardTitle>
                <CardDescription>
                  Temporarily disable access to the public site.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Visitors will see a "Coming Soon" page.
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    updateSettings({ maintenanceMode: checked })
                  }
                  data-testid="toggle-maintenance-mode"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* BRANDING TAB */}
          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Logo & Favicon</CardTitle>
                <CardDescription>
                  Upload your site logo and favicon from the uploads folder.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="logo-upload">Site Logo</Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition"
                    onClick={() => {
                      const input = document.getElementById("logo-upload") as HTMLInputElement;
                      input?.click();
                    }}
                  >
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={brandingUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleBrandingUpload(file, "logoUrl");
                        }
                      }}
                      data-testid="input-logo-upload"
                    />
                    {settings.logoUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={settings.logoUrl}
                          alt="Logo"
                          className="h-12 w-auto"
                        />
                        <p className="text-xs text-muted-foreground">
                          {brandingUploading ? "Uploading..." : "Click to replace"}
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">
                          Drop image or click to upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, SVG, JPG (Max 2MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <Label htmlFor="favicon-upload">Favicon</Label>
                  <div className="flex gap-2">
                    <div className="w-16 h-16 rounded-lg border border-border flex items-center justify-center bg-muted overflow-hidden">
                      {settings.faviconUrl ? (
                        <img
                          src={settings.faviconUrl}
                          alt="Favicon"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">✨</span>
                      )}
                    </div>
                    <input
                      id="favicon-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={brandingUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleBrandingUpload(file, "faviconUrl");
                        }
                      }}
                      data-testid="input-favicon-upload"
                    />
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={brandingUploading}
                      onClick={() => {
                        const input = document.getElementById("favicon-upload") as HTMLInputElement;
                        input?.click();
                      }}
                    >
                      {brandingUploading
                        ? "Uploading..."
                        : settings.faviconUrl
                          ? "Change Favicon"
                          : "Upload Favicon"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO TAB */}
          <TabsContent value="seo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SEO Configuration</CardTitle>
                <CardDescription>
                  Optimize your site for search engines.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Meta Description (Default)</Label>
                  <Input
                    placeholder="Describe your website..."
                    value={settings.metaDescription || ""}
                    onChange={(e) =>
                      updateSettings({ metaDescription: e.target.value })
                    }
                    data-testid="input-meta-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Keywords</Label>
                  <Input
                    placeholder="web development, full-stack, react, node.js"
                    value={settings.metaKeywords || ""}
                    onChange={(e) =>
                      updateSettings({ metaKeywords: e.target.value })
                    }
                    data-testid="input-meta-keywords"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Google Analytics ID</Label>
                  <Input
                    placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
                    value={settings.googleAnalyticsId || ""}
                    onChange={(e) =>
                      updateSettings({ googleAnalyticsId: e.target.value })
                    }
                    data-testid="input-google-analytics"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Open Graph & Twitter Cards</CardTitle>
                <CardDescription>
                  Control how your site appears on social media.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Open Graph Image URL</Label>
                  <Input
                    placeholder="https://example.com/og-image.png"
                    value={settings.ogImageUrl || ""}
                    onChange={(e) =>
                      updateSettings({ ogImageUrl: e.target.value })
                    }
                    data-testid="input-og-image"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter Card Type</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={settings.twitterCardType || "summary_large_image"}
                    onChange={(e) =>
                      updateSettings({ twitterCardType: e.target.value })
                    }
                    data-testid="select-twitter-card"
                  >
                    <option value="summary_large_image">
                      summary_large_image
                    </option>
                    <option value="summary">summary</option>
                    <option value="app">app</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Robots.txt & Sitemap</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  data-testid="button-edit-robots"
                >
                  Edit robots.txt
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  data-testid="button-regenerate-sitemap"
                >
                  Regenerate Sitemap
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EMAIL TAB */}
          <TabsContent value="email" className="space-y-4">
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="flex items-center gap-3 py-3">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Configuration Required</p>
                  <p className="text-xs text-muted-foreground">
                    SMTP settings are saved but email sending requires a mail
                    server integration.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" /> SMTP Configuration
                </CardTitle>
                <CardDescription>
                  Configure email settings for notifications and newsletters.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From Name</Label>
                    <Input
                      placeholder="Loi Developer"
                      value={settings.emailFromName || ""}
                      onChange={(e) =>
                        updateSettings({ emailFromName: e.target.value })
                      }
                      data-testid="input-email-from-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>From Email Address</Label>
                    <Input
                      placeholder="noreply@example.com"
                      value={settings.emailFromAddress || ""}
                      onChange={(e) =>
                        updateSettings({ emailFromAddress: e.target.value })
                      }
                      data-testid="input-email-from-address"
                    />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input
                    placeholder="smtp.gmail.com"
                    value={settings.smtpHost || ""}
                    onChange={(e) =>
                      updateSettings({ smtpHost: e.target.value })
                    }
                    data-testid="input-smtp-host"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SMTP Port</Label>
                    <Input
                      placeholder="587"
                      value={settings.smtpPort || ""}
                      onChange={(e) =>
                        updateSettings({ smtpPort: e.target.value })
                      }
                      data-testid="input-smtp-port"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP User</Label>
                    <Input
                      placeholder="your-email@gmail.com"
                      value={settings.smtpUser || ""}
                      onChange={(e) =>
                        updateSettings({ smtpUser: e.target.value })
                      }
                      data-testid="input-smtp-user"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>SMTP Password</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showSmtpPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={settings.smtpPassword || ""}
                      onChange={(e) =>
                        updateSettings({ smtpPassword: e.target.value })
                      }
                      data-testid="input-smtp-password"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      data-testid="button-toggle-smtp-password"
                    >
                      {showSmtpPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Use TLS/SSL</p>
                    <p className="text-xs text-muted-foreground">
                      Encrypt email transmission
                    </p>
                  </div>
                  <Switch
                    checked={settings.smtpSecure ?? true}
                    onCheckedChange={(checked) =>
                      updateSettings({ smtpSecure: checked })
                    }
                    data-testid="switch-smtp-secure"
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  data-testid="button-test-email"
                  onClick={async () => {
                    try {
                      const testEmail = prompt("Enter email address to send test email to:");
                      if (!testEmail) return;
                      
                      await api.sendTestEmail({
                        to: testEmail,
                        subject: "Test Email from Portfolio",
                        body: "<h1>Test Email</h1><p>This is a test email from your portfolio admin panel.</p>"
                      });
                      
                      toast({
                        title: "Success",
                        description: "Test email sent successfully"
                      });
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: error.message || "Failed to send test email",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" /> Send Test Email
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>
                  Customize email templates for different notifications. Use placeholders like {"{{siteName}}"}, {"{{userName}}"}, {"{{date}}"} etc.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {templatesLoading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading templates...</div>
                ) : (
                  Object.entries(templateLabels).map(([key, label]) => (
                    <Button
                      key={key}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => openTemplateEditor(key)}
                      data-testid={`button-edit-${key}-email`}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {label}
                      {emailTemplates[key] && (
                        <Badge variant="secondary" className="ml-auto">Configured</Badge>
                      )}
                    </Button>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Email Template Editor Dialog */}
            <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit {editingTemplate && templateLabels[editingTemplate]}</DialogTitle>
                  <DialogDescription>
                    Customize the email template. Use placeholders that will be replaced with actual values.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      value={templateSubject}
                      onChange={(e) => setTemplateSubject(e.target.value)}
                      placeholder="Email subject..."
                      data-testid="input-template-subject"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body (HTML)</Label>
                    <Textarea
                      value={templateBody}
                      onChange={(e) => setTemplateBody(e.target.value)}
                      placeholder="<h1>Hello {{userName}}</h1>..."
                      className="min-h-[300px] font-mono text-sm"
                      data-testid="input-template-body"
                    />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium mb-2">Available Placeholders:</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">{"{{siteName}}"}</Badge>
                      <Badge variant="outline">{"{{userName}}"}</Badge>
                      <Badge variant="outline">{"{{date}}"}</Badge>
                      <Badge variant="outline">{"{{senderName}}"}</Badge>
                      <Badge variant="outline">{"{{senderEmail}}"}</Badge>
                      <Badge variant="outline">{"{{messageContent}}"}</Badge>
                      <Badge variant="outline">{"{{postTitle}}"}</Badge>
                      <Badge variant="outline">{"{{commentContent}}"}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                      Cancel
                    </Button>
                    <Button onClick={saveTemplate} disabled={updateTemplateMutation.isPending}>
                      {updateTemplateMutation.isPending ? "Saving..." : "Save Template"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* STORAGE TAB */}
          <TabsContent value="storage" className="space-y-4">
            <StorageTab />
          </TabsContent>

          {/* PERFORMANCE TAB */}
          <TabsContent value="performance" className="space-y-4">
            <SettingsPerformance />
          </TabsContent>

          {/* NOTIFICATIONS & ALERTS TAB */}
          <TabsContent value="notifications" className="space-y-4">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-400">Settings Only</p>
                <p className="text-muted-foreground text-xs">Notification preferences are saved. Email notifications require SMTP configuration in the Email tab.</p>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" /> Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Email Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          New contact form submissions
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Receive email when someone contacts you
                        </p>
                      </div>
                      <Switch
                        checked={settings.emailNotifyNewContact ?? true}
                        onCheckedChange={(checked) =>
                          updateSettings({ emailNotifyNewContact: checked })
                        }
                        data-testid="switch-notify-contact"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">New comments</p>
                        <p className="text-xs text-muted-foreground">
                          Get notified when comments are posted
                        </p>
                      </div>
                      <Switch
                        checked={settings.emailNotifyNewComment ?? true}
                        onCheckedChange={(checked) =>
                          updateSettings({ emailNotifyNewComment: checked })
                        }
                        data-testid="switch-notify-comment"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Security alerts</p>
                        <p className="text-xs text-muted-foreground">
                          Important security-related notifications
                        </p>
                      </div>
                      <Switch
                        checked={settings.emailNotifySecurityAlert ?? true}
                        onCheckedChange={(checked) =>
                          updateSettings({ emailNotifySecurityAlert: checked })
                        }
                        data-testid="switch-notify-security"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          Newsletter subscriptions
                        </p>
                        <p className="text-xs text-muted-foreground">
                          When new users subscribe
                        </p>
                      </div>
                      <Switch
                        checked={settings.emailNotifyNewsletter ?? false}
                        onCheckedChange={(checked) =>
                          updateSettings({ emailNotifyNewsletter: checked })
                        }
                        data-testid="switch-notify-newsletter"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          Weekly analytics summary
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Weekly report of site performance
                        </p>
                      </div>
                      <Switch
                        checked={settings.emailNotifyWeeklySummary ?? true}
                        onCheckedChange={(checked) =>
                          updateSettings({ emailNotifyWeeklySummary: checked })
                        }
                        data-testid="switch-notify-weekly"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Push Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          Browser notifications
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Show desktop notifications
                        </p>
                      </div>
                      <Switch
                        checked={settings.pushNotifyBrowser ?? false}
                        onCheckedChange={(checked) =>
                          updateSettings({ pushNotifyBrowser: checked })
                        }
                        data-testid="switch-push-browser"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Mobile push</p>
                        <p className="text-xs text-muted-foreground">
                          Send to mobile devices
                        </p>
                      </div>
                      <Switch
                        checked={settings.pushNotifyMobile ?? false}
                        onCheckedChange={(checked) =>
                          updateSettings({ pushNotifyMobile: checked })
                        }
                        data-testid="switch-push-mobile"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Priority & Routing</CardTitle>
                <CardDescription>
                  Configure notification delivery channels and priority
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    {
                      channel: "Email",
                      priority: 1,
                      enabled: true,
                      desc: "Primary notification channel",
                    },
                    {
                      channel: "Browser Push",
                      priority: 2,
                      enabled: false,
                      desc: "Desktop notifications",
                    },
                    {
                      channel: "SMS",
                      priority: 3,
                      enabled: false,
                      desc: "Text messages for critical alerts",
                    },
                    {
                      channel: "Slack",
                      priority: 4,
                      enabled: true,
                      desc: "Team notifications",
                    },
                    {
                      channel: "Discord",
                      priority: 5,
                      enabled: true,
                      desc: "Community updates",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                          {item.priority}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.channel}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          ↑
                        </Button>
                        <Button variant="ghost" size="sm">
                          ↓
                        </Button>
                        <Switch defaultChecked={item.enabled} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Fallback Routing</p>
                    <p className="text-xs text-muted-foreground">
                      Try next channel if delivery fails
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Thresholds</CardTitle>
                <CardDescription>
                  Set triggers for automatic alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Storage Usage Alert (%)</Label>
                    <Input type="number" defaultValue="80" />
                  </div>
                  <div className="space-y-2">
                    <Label>Failed Login Attempts</Label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Error Rate Threshold (%)</Label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Response Time (ms)</Label>
                    <Input type="number" defaultValue="3000" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    message: "Storage usage reached 75%",
                    time: "2 hours ago",
                    type: "warning",
                  },
                  {
                    message: "Weekly backup completed successfully",
                    time: "Yesterday",
                    type: "success",
                  },
                  {
                    message: "3 failed login attempts detected",
                    time: "2 days ago",
                    type: "error",
                  },
                ].map((notif, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    {notif.type === "warning" && (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                    {notif.type === "success" && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {notif.type === "error" && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{notif.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {notif.time}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DEVELOPER SETTINGS TAB */}
          <TabsContent value="developer" className="space-y-4">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-400">Settings Only</p>
                <p className="text-muted-foreground text-xs">Developer settings are saved to database. Actual logic application requires backend implementation.</p>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="w-5 h-5" /> Debug Mode
                </CardTitle>
                <CardDescription>
                  Enable debugging features for development
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-500/5 border-yellow-500/20">
                  <div>
                    <p className="font-medium text-sm">Enable Debug Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Shows detailed error messages and stack traces
                    </p>
                  </div>
                  <Switch
                    checked={settings.debugMode ?? false}
                    onCheckedChange={(checked) =>
                      updateSettings({ debugMode: checked })
                    }
                    data-testid="switch-debug-mode"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Log to Console</p>
                    <p className="text-xs text-muted-foreground">
                      Output logs to browser/server console
                    </p>
                  </div>
                  <Switch
                    checked={settings.logToConsole ?? true}
                    onCheckedChange={(checked) =>
                      updateSettings({ logToConsole: checked })
                    }
                    data-testid="switch-log-console"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Log to File</p>
                    <p className="text-xs text-muted-foreground">
                      Save logs to file system
                    </p>
                  </div>
                  <Switch
                    checked={settings.logToFile ?? false}
                    onCheckedChange={(checked) =>
                      updateSettings({ logToFile: checked })
                    }
                    data-testid="switch-log-file"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5" /> API Rate Limits
                </CardTitle>
                <CardDescription>
                  Configure rate limiting for API endpoints
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Requests per minute (global)</Label>
                  <Input
                    type="number"
                    value={settings.apiRateLimit ?? 100}
                    onChange={(e) =>
                      updateSettings({
                        apiRateLimit: parseInt(e.target.value) || 100,
                      })
                    }
                    data-testid="input-api-rate-limit"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum API requests per minute across all endpoints
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">
                    Endpoint-specific limits (read-only)
                  </h4>
                  {[
                    { endpoint: "/api/contact", limit: 5, window: "1 hour" },
                    {
                      endpoint: "/api/auth/login",
                      limit: 10,
                      window: "15 mins",
                    },
                    { endpoint: "/api/upload", limit: 20, window: "1 hour" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 border rounded text-sm"
                    >
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {item.endpoint}
                      </code>
                      <span>
                        {item.limit} requests / {item.window}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" /> Advanced Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Enable CORS</p>
                    <p className="text-xs text-muted-foreground">
                      Allow cross-origin requests
                    </p>
                  </div>
                  <Switch
                    checked={settings.corsEnabled ?? true}
                    onCheckedChange={(checked) =>
                      updateSettings({ corsEnabled: checked })
                    }
                    data-testid="switch-cors-enabled"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Allowed Origins (CORS)</Label>
                  <Input
                    placeholder="* (all origins) or https://example.com, https://app.example.com"
                    value={settings.corsOrigins || ""}
                    onChange={(e) =>
                      updateSettings({ corsOrigins: e.target.value })
                    }
                    data-testid="input-cors-origins"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use * to allow all origins, or specify comma-separated
                    domains
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Custom Headers</Label>
                  <Textarea
                    placeholder="X-Custom-Header: value&#10;X-Another-Header: value"
                    className="font-mono text-sm"
                    rows={3}
                    value={settings.customHeaders || ""}
                    onChange={(e) =>
                      updateSettings({ customHeaders: e.target.value })
                    }
                    data-testid="input-custom-headers"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add custom HTTP headers to all responses
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LOCALIZATION TAB (Enhanced) */}
          <TabsContent value="localization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" /> Regional Settings
                </CardTitle>
                <CardDescription>
                  Configure timezone and language preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={settings.timezone || "Asia/Ho_Chi_Minh"}
                    onChange={(e) =>
                      updateSettings({ timezone: e.target.value })
                    }
                    data-testid="select-timezone"
                  >
                    <option value="Asia/Ho_Chi_Minh">
                      UTC+07:00 (Vietnam)
                    </option>
                    <option value="Asia/Shanghai">UTC+08:00 (Shanghai)</option>
                    <option value="Asia/Tokyo">UTC+09:00 (Tokyo)</option>
                    <option value="Europe/London">UTC+00:00 (London)</option>
                    <option value="America/New_York">
                      UTC-05:00 (New York)
                    </option>
                    <option value="America/Los_Angeles">
                      UTC-08:00 (Los Angeles)
                    </option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={settings.language || "en"}
                    onChange={(e) =>
                      updateSettings({ language: e.target.value })
                    }
                    data-testid="select-language"
                  >
                    <option value="en">English</option>
                    <option value="vi">Tiếng Việt</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={settings.dateFormat || "MM/DD/YYYY"}
                    onChange={(e) =>
                      updateSettings({ dateFormat: e.target.value })
                    }
                    data-testid="select-date-format"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Time Format</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={settings.timeFormat || "12h"}
                    onChange={(e) =>
                      updateSettings({ timeFormat: e.target.value })
                    }
                    data-testid="select-time-format"
                  >
                    <option value="12h">12 Hour (AM/PM)</option>
                    <option value="24h">24 Hour</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" /> Custom Translations
                </CardTitle>
                <CardDescription>
                  Manage custom translation strings for multi-language support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm">
                    Import Translations
                  </Button>
                  <Button variant="outline" size="sm">
                    Export Translations
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 p-2 bg-muted rounded text-sm font-medium">
                    <span>Key</span>
                    <span>English</span>
                    <span>Vietnamese</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto space-y-1">
                    {[
                      { key: "site.title", en: "Loi Developer", vi: "Loi Developer" },
                      { key: "site.tagline", en: "Full-stack Developer", vi: "Lập trình viên Full-stack" },
                      { key: "nav.home", en: "Home", vi: "Trang chủ" },
                      { key: "nav.about", en: "About", vi: "Giới thiệu" },
                      { key: "nav.projects", en: "Projects", vi: "Dự án" },
                      { key: "nav.blog", en: "Blog", vi: "Bài viết" },
                      { key: "nav.services", en: "Services", vi: "Dịch vụ" },
                      { key: "nav.contact", en: "Contact", vi: "Liên hệ" },
                      { key: "hero.greeting", en: "Hello, I'm", vi: "Xin chào, tôi là" },
                      { key: "hero.cta", en: "View My Work", vi: "Xem dự án" },
                      { key: "hero.download_cv", en: "Download CV", vi: "Tải CV" },
                      { key: "about.title", en: "About Me", vi: "Về tôi" },
                      { key: "about.experience", en: "Years of Experience", vi: "Năm kinh nghiệm" },
                      { key: "about.projects", en: "Projects Completed", vi: "Dự án hoàn thành" },
                      { key: "projects.title", en: "My Projects", vi: "Dự án của tôi" },
                      { key: "projects.view", en: "View Project", vi: "Xem dự án" },
                      { key: "projects.all", en: "All Projects", vi: "Tất cả" },
                      { key: "blog.title", en: "Latest Posts", vi: "Bài viết mới" },
                      { key: "blog.read_more", en: "Read More", vi: "Đọc thêm" },
                      { key: "services.title", en: "Services", vi: "Dịch vụ" },
                      { key: "services.learn_more", en: "Learn More", vi: "Tìm hiểu thêm" },
                      { key: "contact.title", en: "Get In Touch", vi: "Liên hệ" },
                      { key: "contact.name", en: "Your Name", vi: "Họ tên" },
                      { key: "contact.email", en: "Your Email", vi: "Email" },
                      { key: "contact.message", en: "Your Message", vi: "Nội dung" },
                      { key: "contact.send", en: "Send Message", vi: "Gửi tin nhắn" },
                      { key: "contact.success", en: "Message sent successfully!", vi: "Gửi thành công!" },
                      { key: "footer.copyright", en: "All rights reserved", vi: "Bản quyền thuộc về" },
                      { key: "common.loading", en: "Loading...", vi: "Đang tải..." },
                      { key: "common.error", en: "Something went wrong", vi: "Đã xảy ra lỗi" },
                      { key: "common.save", en: "Save", vi: "Lưu" },
                      { key: "common.cancel", en: "Cancel", vi: "Hủy" },
                      { key: "common.delete", en: "Delete", vi: "Xóa" },
                      { key: "common.edit", en: "Edit", vi: "Sửa" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-3 gap-2 p-2 border rounded text-sm"
                      >
                        <code className="text-xs bg-muted px-2 py-1 rounded truncate">
                          {item.key}
                        </code>
                        <Input defaultValue={item.en} className="h-8" />
                        <Input defaultValue={item.vi} className="h-8" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline">
                    + Add Translation Key
                  </Button>
                  <Button>
                    Save Translations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DATABASE MANAGEMENT TAB */}
          <TabsContent value="database" className="space-y-4">
            <DatabaseTab />
          </TabsContent>

          {/* LOGGING CONFIGURATION TAB */}
          <TabsContent value="logging" className="space-y-4">
            <LoggingTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}