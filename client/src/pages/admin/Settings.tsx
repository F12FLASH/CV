import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, Globe, User, Mail, MapPin, Phone, Share2, FileText, Shield, LayoutDashboard, AlertCircle } from "lucide-react";
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
        <div className="flex items-center justify-between gap-4 flex-wrap">
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
          <TabsList className="grid w-full max-w-4xl grid-cols-7 gap-2">
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
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="space-y-6">
              {/* Website Branding */}
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        Website Branding
                      </CardTitle>
                      <CardDescription>
                        Customize the main identity of your website
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="siteTitle" className="font-semibold">
                      Site Title (Browser Tab & Header)
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Displayed in browser tab and as the main site heading throughout your portfolio
                    </p>
                    <Input 
                      id="siteTitle"
                      value={settings.siteTitle}
                      onChange={(e) => handleChange("siteTitle", e.target.value)}
                      placeholder="Your site title"
                      data-testid="input-site-title"
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline" className="font-semibold">
                      Tagline (Subheading)
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      A short, catchy description that complements your site title
                    </p>
                    <Input 
                      id="tagline"
                      value={settings.tagline}
                      onChange={(e) => handleChange("tagline", e.target.value)}
                      placeholder="A short description of your site"
                      data-testid="input-tagline"
                      className="text-base"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Primary Contact Email
                  </CardTitle>
                  <CardDescription>
                    Used for contact forms and general inquiries
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="font-semibold">
                      Email Address
                    </Label>
                    <Input 
                      id="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => handleChange("contactEmail", e.target.value)}
                      placeholder="your@email.com"
                      data-testid="input-contact-email"
                      className="text-base"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Footer Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Footer Information
                  </CardTitle>
                  <CardDescription>
                    Customize the footer section displayed at the bottom of every page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="footerText" className="font-semibold">
                      Footer Text
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Brief tagline or message shown in the footer
                    </p>
                    <Input 
                      id="footerText"
                      value={settings.footerText}
                      onChange={(e) => handleChange("footerText", e.target.value)}
                      placeholder="Crafted with love..."
                      data-testid="input-footer-text"
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footerCopyright" className="font-semibold">
                      Copyright Text
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Your copyright notice and rights statement
                    </p>
                    <Input 
                      id="footerCopyright"
                      value={settings.footerCopyright}
                      onChange={(e) => handleChange("footerCopyright", e.target.value)}
                      placeholder="2024 Your Name. All rights reserved."
                      data-testid="input-footer-copyright"
                      className="text-base"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="bg-card/50 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                    System Status
                  </CardTitle>
                  <CardDescription>
                    Control site availability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                    <div className="space-y-1">
                      <Label className="font-semibold">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">When enabled, visitors see a "Coming Soon" page</p>
                    </div>
                    <Switch 
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => handleChange("maintenanceMode", checked)}
                      data-testid="switch-maintenance-mode"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>The main banner that visitors see first on your homepage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle" className="font-semibold">Hero Title (Your Name)</Label>
                  <p className="text-xs text-muted-foreground mb-2">Your main headline in the hero section</p>
                  <Input 
                    id="heroTitle"
                    value={settings.heroTitle}
                    onChange={(e) => handleChange("heroTitle", e.target.value)}
                    placeholder="NGUYEN THANH LOI"
                    data-testid="input-hero-title"
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle" className="font-semibold">Hero Subtitle (Your Role)</Label>
                  <p className="text-xs text-muted-foreground mb-2">Your profession or main role</p>
                  <Input 
                    id="heroSubtitle"
                    value={settings.heroSubtitle}
                    onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                    placeholder="Full-stack Developer & Security Enthusiast"
                    data-testid="input-hero-subtitle"
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroDescription" className="font-semibold">Hero Description</Label>
                  <p className="text-xs text-muted-foreground mb-2">Brief description about what you do</p>
                  <Textarea 
                    id="heroDescription"
                    value={settings.heroDescription}
                    onChange={(e) => handleChange("heroDescription", e.target.value)}
                    placeholder="A short description about what you do..."
                    className="min-h-[100px]"
                    data-testid="input-hero-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroStatus" className="font-semibold">Status Text</Label>
                  <p className="text-xs text-muted-foreground mb-2">Badge text displayed in hero (e.g., "SYSTEM ONLINE")</p>
                  <Input 
                    id="heroStatus"
                    value={settings.heroStatus}
                    onChange={(e) => handleChange("heroStatus", e.target.value)}
                    placeholder="SYSTEM ONLINE"
                    data-testid="input-hero-status"
                    className="text-base"
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
                  <CardDescription>Tell visitors about yourself and your background.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="aboutTitle" className="font-semibold">Section Title</Label>
                    <Input 
                      id="aboutTitle"
                      value={settings.aboutTitle}
                      onChange={(e) => handleChange("aboutTitle", e.target.value)}
                      placeholder="About Me"
                      data-testid="input-about-title"
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutSubtitle" className="font-semibold">Subtitle</Label>
                    <Input 
                      id="aboutSubtitle"
                      value={settings.aboutSubtitle}
                      onChange={(e) => handleChange("aboutSubtitle", e.target.value)}
                      placeholder="Full-stack Developer based in Vietnam"
                      data-testid="input-about-subtitle"
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutDescription" className="font-semibold">Description Paragraph 1</Label>
                    <Textarea 
                      id="aboutDescription"
                      value={settings.aboutDescription}
                      onChange={(e) => handleChange("aboutDescription", e.target.value)}
                      placeholder="Your story..."
                      className="min-h-[100px]"
                      data-testid="input-about-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutDescription2" className="font-semibold">Description Paragraph 2</Label>
                    <Textarea 
                      id="aboutDescription2"
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
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="aboutName" className="font-semibold">Full Name</Label>
                      <Input 
                        id="aboutName"
                        value={settings.aboutName}
                        onChange={(e) => handleChange("aboutName", e.target.value)}
                        placeholder="Nguyen Thanh Loi"
                        data-testid="input-about-name"
                        className="text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aboutEmail" className="font-semibold">Email</Label>
                      <Input 
                        id="aboutEmail"
                        type="email"
                        value={settings.aboutEmail}
                        onChange={(e) => handleChange("aboutEmail", e.target.value)}
                        placeholder="your@email.com"
                        data-testid="input-about-email"
                        className="text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aboutLocation" className="font-semibold">Location</Label>
                      <Input 
                        id="aboutLocation"
                        value={settings.aboutLocation}
                        onChange={(e) => handleChange("aboutLocation", e.target.value)}
                        placeholder="Ho Chi Minh City"
                        data-testid="input-about-location"
                        className="text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aboutFreelance" className="font-semibold">Freelance Status</Label>
                      <Input 
                        id="aboutFreelance"
                        value={settings.aboutFreelance}
                        onChange={(e) => handleChange("aboutFreelance", e.target.value)}
                        placeholder="Available"
                        data-testid="input-about-freelance"
                        className="text-base"
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
                  <CardDescription>Customize your contact section text and messaging.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="contactTitle" className="font-semibold">Section Title</Label>
                    <Input 
                      id="contactTitle"
                      value={settings.contactTitle}
                      onChange={(e) => handleChange("contactTitle", e.target.value)}
                      placeholder="Let's Talk"
                      data-testid="input-contact-title"
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactSubtitle" className="font-semibold">Section Description</Label>
                    <Textarea 
                      id="contactSubtitle"
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
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone" className="font-semibold flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Phone
                      </Label>
                      <Input 
                        id="contactPhone"
                        value={settings.contactPhone}
                        onChange={(e) => handleChange("contactPhone", e.target.value)}
                        placeholder="+84 123 456 789"
                        data-testid="input-contact-phone"
                        className="text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactAddress" className="font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Address
                      </Label>
                      <Input 
                        id="contactAddress"
                        value={settings.contactAddress}
                        onChange={(e) => handleChange("contactAddress", e.target.value)}
                        placeholder="Ho Chi Minh City, Vietnam"
                        data-testid="input-contact-address"
                        className="text-base"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Your social media profiles displayed in the Follow Me section and footer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="socialFacebook" className="font-semibold">Facebook</Label>
                    <Input 
                      id="socialFacebook"
                      value={settings.socialFacebook}
                      onChange={(e) => handleChange("socialFacebook", e.target.value)}
                      placeholder="https://facebook.com/yourprofile"
                      data-testid="input-social-facebook"
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialTwitter" className="font-semibold">Twitter/X</Label>
                    <Input 
                      id="socialTwitter"
                      value={settings.socialTwitter}
                      onChange={(e) => handleChange("socialTwitter", e.target.value)}
                      placeholder="https://twitter.com/yourprofile"
                      data-testid="input-social-twitter"
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialInstagram" className="font-semibold">Instagram</Label>
                    <Input 
                      id="socialInstagram"
                      value={settings.socialInstagram}
                      onChange={(e) => handleChange("socialInstagram", e.target.value)}
                      placeholder="https://instagram.com/yourprofile"
                      data-testid="input-social-instagram"
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialLinkedin" className="font-semibold">LinkedIn</Label>
                    <Input 
                      id="socialLinkedin"
                      value={settings.socialLinkedin}
                      onChange={(e) => handleChange("socialLinkedin", e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                      data-testid="input-social-linkedin"
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialGithub" className="font-semibold">GitHub</Label>
                    <Input 
                      id="socialGithub"
                      value={settings.socialGithub}
                      onChange={(e) => handleChange("socialGithub", e.target.value)}
                      placeholder="https://github.com/yourprofile"
                      data-testid="input-social-github"
                      className="text-base"
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
                <CardDescription>Optimize your website for search engines.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="metaDescription" className="font-semibold">Meta Description</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Displayed in search engine results (50-160 characters recommended)
                  </p>
                  <Textarea 
                    id="metaDescription"
                    value={settings.metaDescription}
                    onChange={(e) => handleChange("metaDescription", e.target.value)}
                    placeholder="Portfolio of Nguyen Thanh Loi - Full-stack Developer"
                    maxLength={160}
                    className="min-h-[80px]"
                    data-testid="input-meta-description"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {settings.metaDescription.length}/160 characters
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="googleAnalyticsId" className="font-semibold">Google Analytics ID</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Your Google Analytics tracking ID (e.g., G-XXXXXXXXXX)
                  </p>
                  <Input 
                    id="googleAnalyticsId"
                    value={settings.googleAnalyticsId}
                    onChange={(e) => handleChange("googleAnalyticsId", e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    data-testid="input-google-analytics"
                    className="text-base"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Center</CardTitle>
                <CardDescription>Manage security settings and protections.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                  <h3 className="font-semibold text-sm mb-2">Website Security</h3>
                  <p className="text-sm text-muted-foreground">
                    Additional security features and configurations can be added here to protect your website and visitors' data.
                  </p>
                </div>
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">More security options coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
