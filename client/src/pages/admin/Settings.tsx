import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, Globe, User, Mail, MapPin, Phone, Share2, FileText, Shield, LayoutDashboard } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface SiteSettings {
  siteTitle: string;
  tagline: string;
  contactEmail: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroStatus: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutDescription: string;
  aboutDescription2: string;
  aboutName: string;
  aboutEmail: string;
  aboutLocation: string;
  aboutFreelance: string;
  contactTitle: string;
  contactSubtitle: string;
  contactPhone: string;
  contactAddress: string;
  socialFacebook: string;
  socialTwitter: string;
  socialInstagram: string;
  socialLinkedin: string;
  socialGithub: string;
  footerText: string;
  footerCopyright: string;
  metaDescription: string;
  googleAnalyticsId: string;
  maintenanceMode: boolean;
}

const defaultSettings: SiteSettings = {
  siteTitle: "Loi Developer - Full-stack Creative",
  tagline: "Building digital experiences with code.",
  contactEmail: "loideveloper@example.com",
  heroTitle: "NGUYEN THANH LOI",
  heroSubtitle: "Full-stack Developer & Security Enthusiast",
  heroDescription: "Crafting secure & performant digital experiences with code",
  heroStatus: "SYSTEM ONLINE",
  aboutTitle: "About Me",
  aboutSubtitle: "Full-stack Developer based in Vietnam",
  aboutDescription: "I started my coding journey with a curiosity for how things work on the web. Now, I specialize in building modern, scalable, and user-friendly applications using the latest technologies.",
  aboutDescription2: "My philosophy is simple: Code with passion, build with purpose. Whether it's a complex backend system or a pixel-perfect frontend interface, I strive for excellence in every line of code.",
  aboutName: "Nguyen Thanh Loi",
  aboutEmail: "loideveloper@example.com",
  aboutLocation: "Ho Chi Minh City",
  aboutFreelance: "Available",
  contactTitle: "Let's Talk",
  contactSubtitle: "Have a project in mind or just want to say hi? I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.",
  contactPhone: "+84 123 456 789",
  contactAddress: "Ho Chi Minh City, Vietnam",
  socialFacebook: "",
  socialTwitter: "",
  socialInstagram: "",
  socialLinkedin: "",
  socialGithub: "",
  footerText: "Crafted with love & countless cups of coffee",
  footerCopyright: "2024 Loi Developer. All rights reserved.",
  metaDescription: "Portfolio of Nguyen Thanh Loi - Full-stack Developer & Creative Coder",
  googleAnalyticsId: "",
  maintenanceMode: false,
};

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: serverSettings, isLoading } = useQuery<Record<string, any>>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (serverSettings) {
      setSettings({
        ...defaultSettings,
        ...serverSettings,
      });
    }
  }, [serverSettings]);

  const updateMutation = useMutation({
    mutationFn: (newSettings: Partial<SiteSettings>) => api.updateSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Success", description: "Settings saved successfully" });
      setHasChanges(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    },
  });

  const handleChange = (key: keyof SiteSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your website configuration and content</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || updateMutation.isPending}
            data-testid="button-save-settings"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-6">
            <TabsTrigger value="general" className="gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="hero" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Hero</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">About</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">SEO</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Site Information</CardTitle>
                  <CardDescription>Basic information about your portfolio website.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Site Title</Label>
                    <Input 
                      value={settings.siteTitle}
                      onChange={(e) => handleChange("siteTitle", e.target.value)}
                      placeholder="Your site title"
                      data-testid="input-site-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tagline</Label>
                    <Input 
                      value={settings.tagline}
                      onChange={(e) => handleChange("tagline", e.target.value)}
                      placeholder="A short description of your site"
                      data-testid="input-tagline"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input 
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => handleChange("contactEmail", e.target.value)}
                      placeholder="your@email.com"
                      data-testid="input-contact-email"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Footer</CardTitle>
                  <CardDescription>Customize the footer section of your website.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Footer Text</Label>
                    <Input 
                      value={settings.footerText}
                      onChange={(e) => handleChange("footerText", e.target.value)}
                      placeholder="Crafted with love..."
                      data-testid="input-footer-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Copyright Text</Label>
                    <Input 
                      value={settings.footerCopyright}
                      onChange={(e) => handleChange("footerCopyright", e.target.value)}
                      placeholder="2024 Your Name. All rights reserved."
                      data-testid="input-footer-copyright"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Mode</CardTitle>
                  <CardDescription>Temporarily disable access to the public site.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label>Enable Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Visitors will see a "Coming Soon" page.</p>
                  </div>
                  <Switch 
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleChange("maintenanceMode", checked)}
                    data-testid="switch-maintenance-mode"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>The main banner that visitors see first.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Hero Title (Your Name)</Label>
                  <Input 
                    value={settings.heroTitle}
                    onChange={(e) => handleChange("heroTitle", e.target.value)}
                    placeholder="NGUYEN THANH LOI"
                    data-testid="input-hero-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero Subtitle (Your Role)</Label>
                  <Input 
                    value={settings.heroSubtitle}
                    onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                    placeholder="Full-stack Developer & Security Enthusiast"
                    data-testid="input-hero-subtitle"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero Description</Label>
                  <Textarea 
                    value={settings.heroDescription}
                    onChange={(e) => handleChange("heroDescription", e.target.value)}
                    placeholder="A short description about what you do..."
                    className="min-h-[100px]"
                    data-testid="input-hero-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status Text</Label>
                  <Input 
                    value={settings.heroStatus}
                    onChange={(e) => handleChange("heroStatus", e.target.value)}
                    placeholder="SYSTEM ONLINE"
                    data-testid="input-hero-status"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>About Section Content</CardTitle>
                  <CardDescription>Tell visitors about yourself.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input 
                      value={settings.aboutTitle}
                      onChange={(e) => handleChange("aboutTitle", e.target.value)}
                      placeholder="About Me"
                      data-testid="input-about-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Input 
                      value={settings.aboutSubtitle}
                      onChange={(e) => handleChange("aboutSubtitle", e.target.value)}
                      placeholder="Full-stack Developer based in Vietnam"
                      data-testid="input-about-subtitle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description Paragraph 1</Label>
                    <Textarea 
                      value={settings.aboutDescription}
                      onChange={(e) => handleChange("aboutDescription", e.target.value)}
                      placeholder="Your story..."
                      className="min-h-[100px]"
                      data-testid="input-about-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description Paragraph 2</Label>
                    <Textarea 
                      value={settings.aboutDescription2}
                      onChange={(e) => handleChange("aboutDescription2", e.target.value)}
                      placeholder="Your philosophy..."
                      className="min-h-[100px]"
                      data-testid="input-about-description2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your personal details shown in the About section.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input 
                        value={settings.aboutName}
                        onChange={(e) => handleChange("aboutName", e.target.value)}
                        placeholder="Nguyen Thanh Loi"
                        data-testid="input-about-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                        type="email"
                        value={settings.aboutEmail}
                        onChange={(e) => handleChange("aboutEmail", e.target.value)}
                        placeholder="your@email.com"
                        data-testid="input-about-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input 
                        value={settings.aboutLocation}
                        onChange={(e) => handleChange("aboutLocation", e.target.value)}
                        placeholder="Ho Chi Minh City"
                        data-testid="input-about-location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Freelance Status</Label>
                      <Input 
                        value={settings.aboutFreelance}
                        onChange={(e) => handleChange("aboutFreelance", e.target.value)}
                        placeholder="Available"
                        data-testid="input-about-freelance"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Section Content</CardTitle>
                  <CardDescription>Customize your contact section text.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input 
                      value={settings.contactTitle}
                      onChange={(e) => handleChange("contactTitle", e.target.value)}
                      placeholder="Let's Talk"
                      data-testid="input-contact-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section Description</Label>
                    <Textarea 
                      value={settings.contactSubtitle}
                      onChange={(e) => handleChange("contactSubtitle", e.target.value)}
                      placeholder="Have a project in mind..."
                      className="min-h-[100px]"
                      data-testid="input-contact-subtitle"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Your contact details shown on the website.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email
                      </Label>
                      <Input 
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => handleChange("contactEmail", e.target.value)}
                        placeholder="your@email.com"
                        data-testid="input-contact-email-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Phone
                      </Label>
                      <Input 
                        value={settings.contactPhone}
                        onChange={(e) => handleChange("contactPhone", e.target.value)}
                        placeholder="+84 123 456 789"
                        data-testid="input-contact-phone"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Address
                    </Label>
                    <Input 
                      value={settings.contactAddress}
                      onChange={(e) => handleChange("contactAddress", e.target.value)}
                      placeholder="Ho Chi Minh City, Vietnam"
                      data-testid="input-contact-address"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Your social media profiles shown in Follow Me section and footer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Facebook URL</Label>
                    <Input 
                      value={settings.socialFacebook}
                      onChange={(e) => handleChange("socialFacebook", e.target.value)}
                      placeholder="https://facebook.com/yourprofile"
                      data-testid="input-social-facebook"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter/X URL</Label>
                    <Input 
                      value={settings.socialTwitter}
                      onChange={(e) => handleChange("socialTwitter", e.target.value)}
                      placeholder="https://twitter.com/yourprofile"
                      data-testid="input-social-twitter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram URL</Label>
                    <Input 
                      value={settings.socialInstagram}
                      onChange={(e) => handleChange("socialInstagram", e.target.value)}
                      placeholder="https://instagram.com/yourprofile"
                      data-testid="input-social-instagram"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>LinkedIn URL</Label>
                    <Input 
                      value={settings.socialLinkedin}
                      onChange={(e) => handleChange("socialLinkedin", e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                      data-testid="input-social-linkedin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GitHub URL</Label>
                    <Input 
                      value={settings.socialGithub}
                      onChange={(e) => handleChange("socialGithub", e.target.value)}
                      placeholder="https://github.com/yourprofile"
                      data-testid="input-social-github"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Configuration</CardTitle>
                <CardDescription>Optimize your site for search engines.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Meta Description (Default)</Label>
                  <Textarea 
                    value={settings.metaDescription}
                    onChange={(e) => handleChange("metaDescription", e.target.value)}
                    placeholder="Portfolio of..."
                    className="min-h-[80px]"
                    data-testid="input-meta-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Google Analytics ID</Label>
                  <Input 
                    value={settings.googleAnalyticsId}
                    onChange={(e) => handleChange("googleAnalyticsId", e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    data-testid="input-google-analytics"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
