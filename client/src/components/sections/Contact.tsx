import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRecaptcha } from "@/hooks/use-recaptcha";

const FloatingLabelInput = ({ 
  name, 
  value, 
  onChange, 
  label, 
  type = "text", 
  required = false 
}: { 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  label: string; 
  type?: string; 
  required?: boolean; 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative pt-4">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="peer w-full bg-transparent border-b-2 border-border py-2 text-foreground placeholder-transparent focus:outline-none focus:border-primary transition-colors"
        placeholder={label}
        data-testid={`input-contact-${name}`}
      />
      <label
        className={`absolute left-0 top-2 text-sm transition-all duration-300 pointer-events-none
          ${isFocused || value ? "-top-0 text-xs text-primary" : "top-6 text-muted-foreground"}
        `}
      >
        {label}
      </label>
    </div>
  );
};

const FloatingLabelTextarea = ({ 
  name, 
  value, 
  onChange, 
  label, 
  required = false 
}: { 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; 
  label: string; 
  required?: boolean; 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative pt-4">
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="peer w-full bg-transparent border-b-2 border-border py-2 text-foreground placeholder-transparent focus:outline-none focus:border-primary transition-colors min-h-[120px] resize-none"
        placeholder={label}
        data-testid={`textarea-contact-${name}`}
      />
      <label
        className={`absolute left-0 top-2 text-sm transition-all duration-300 pointer-events-none
          ${isFocused || value ? "-top-0 text-xs text-primary" : "top-6 text-muted-foreground"}
        `}
      >
        {label}
      </label>
    </div>
  );
};

function SocialIcon({ name }: { name: string }) {
  switch (name.toLowerCase()) {
    case "facebook":
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case "twitter":
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case "instagram":
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    case "linkedin":
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    default:
      return <div className="w-4 h-4 bg-current rounded-full" />;
  }
}

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [honeypot, setHoneypot] = useState("");
  const turnstileRef = useRef<HTMLDivElement>(null);

  const { 
    isEnabled: captchaEnabled, 
    isLoaded: captchaLoaded,
    captchaType,
    executeRecaptcha, 
    renderTurnstile,
    resetTurnstile,
    honeypotFieldName,
    error: captchaError 
  } = useRecaptcha({ formType: 'contact', action: 'contact_form' });

  const { data: settings } = useQuery<Record<string, any>>({
    queryKey: ["/api/settings"],
    staleTime: 1000 * 60 * 5,
  });

  const contactTitle = settings?.contactTitle || "Let's Talk";
  const contactSubtitle = settings?.contactSubtitle || "Have a project in mind or just want to say hi? I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.";
  const contactEmail = settings?.contactEmail || "loideveloper@example.com";
  const contactPhone = settings?.contactPhone || "+84 123 456 789";
  const contactAddress = settings?.contactAddress || "Ho Chi Minh City, Vietnam";
  const socialFacebook = settings?.socialFacebook || "";
  const socialTwitter = settings?.socialTwitter || "";
  const socialInstagram = settings?.socialInstagram || "";
  const socialLinkedin = settings?.socialLinkedin || "";

  useEffect(() => {
    const prefillData = sessionStorage.getItem('contactFormData');
    if (prefillData) {
      try {
        const data = JSON.parse(prefillData);
        setFormData(prev => ({
          ...prev,
          subject: data.subject || "",
          message: data.message || ""
        }));
        sessionStorage.removeItem('contactFormData');
      } catch (error) {
        console.error('Failed to parse prefill data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const handlePrefill = (event: CustomEvent<{ subject: string; message: string }>) => {
      setFormData(prev => ({
        ...prev,
        subject: event.detail.subject || "",
        message: event.detail.message || ""
      }));
    };

    window.addEventListener('contact:prefill', handlePrefill as EventListener);
    return () => {
      window.removeEventListener('contact:prefill', handlePrefill as EventListener);
    };
  }, []);

  useEffect(() => {
    if (captchaType === 'cloudflare' && captchaLoaded && turnstileRef.current) {
      renderTurnstile('turnstile-container');
    }
  }, [captchaType, captchaLoaded, renderTurnstile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (honeypot) {
      console.log('Honeypot triggered - bot detected');
      toast({
        title: "Message sent!",
        description: "Thank you for reaching out.",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let captchaToken: string | null = null;
      
      if (captchaEnabled) {
        captchaToken = await executeRecaptcha();
        if (captchaError) {
          toast({
            title: "Verification Failed",
            description: captchaError,
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }

      await api.createMessage({
        sender: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        captchaToken: captchaToken || undefined,
        captchaType: captchaType || undefined
      });

      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. I'll get back to you shortly.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      if (captchaType === 'cloudflare') {
        resetTurnstile();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const socialLinks = [
    { name: "Facebook", url: socialFacebook, color: "hover:text-blue-600" },
    { name: "Twitter", url: socialTwitter, color: "hover:text-sky-500" },
    { name: "Instagram", url: socialInstagram, color: "hover:text-pink-500" },
    { name: "LinkedIn", url: socialLinkedin, color: "hover:text-blue-700" }
  ].filter(s => s.url);

  return (
    <section id="contact" className="py-24 bg-muted/30 relative">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                {contactTitle.includes(" ") ? (
                  <>
                    {contactTitle.split(" ").slice(0, -1).join(" ")} <span className="text-primary">{contactTitle.split(" ").slice(-1)}</span>
                  </>
                ) : (
                  <>Let's <span className="text-primary">Talk</span></>
                )}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {contactSubtitle}
              </p>
            </motion.div>

            <div className="space-y-6 pt-4">
              {[
                { icon: Mail, label: "Email", value: contactEmail },
                { icon: Phone, label: "Phone", value: contactPhone },
                { icon: MapPin, label: "Address", value: contactAddress },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-6 group p-4 rounded-xl hover:bg-card transition-colors"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wide font-semibold mb-1">{item.label}</div>
                    <div className="font-medium text-lg">{item.value}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {socialLinks.length > 0 && (
              <div className="pt-8">
                <h3 className="text-lg font-bold mb-4">Follow Me</h3>
                <div className="flex gap-4">
                  {socialLinks.map((social, i) => (
                    <motion.a
                      key={i}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                      className={`w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground ${social.color} transition-colors shadow-sm`}
                      data-testid={`link-social-${social.name.toLowerCase()}`}
                    >
                      <span className="sr-only">{social.name}</span>
                      <SocialIcon name={social.name} />
                    </motion.a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card p-8 md:p-10 rounded-3xl border border-border/50 shadow-xl backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
             
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10" data-testid="form-contact">
              <input
                type="text"
                name={honeypotFieldName}
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                autoComplete="off"
                tabIndex={-1}
                style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
                aria-hidden="true"
              />
              
              <div className="grid md:grid-cols-2 gap-8">
                <FloatingLabelInput
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  label="Full Name"
                  required
                />
                <FloatingLabelInput
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  label="Email Address"
                  type="email"
                  required
                />
              </div>
              
              <FloatingLabelInput
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                label="Subject"
                required
              />
              
              <FloatingLabelTextarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                label="Message"
                required
              />

              {captchaEnabled && captchaType === 'cloudflare' && (
                <div 
                  id="turnstile-container" 
                  ref={turnstileRef}
                  className="flex justify-center"
                  data-testid="turnstile-container"
                />
              )}

              {captchaEnabled && captchaType && captchaType !== 'disabled' && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {captchaType === 'google' && 'Protected by reCAPTCHA'}
                    {captchaType === 'cloudflare' && 'Protected by Cloudflare Turnstile'}
                    {captchaType === 'local' && 'Protected by spam filter'}
                  </span>
                </div>
              )}

              <Button 
                type="submit" 
                size="lg" 
                className="w-full rounded-full h-12 text-base font-medium relative overflow-hidden group" 
                disabled={isSubmitting}
                data-testid="button-submit-contact"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      Send Message <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
