import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

// Floating Label Input Component
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

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await api.createMessage({
        sender: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });

      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. I'll get back to you shortly.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
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

  return (
    <section id="contact" className="py-24 bg-muted/30 relative">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left: Info */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Let's <span className="text-primary">Talk</span></h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Have a project in mind or just want to say hi? I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.
              </p>
            </motion.div>

            <div className="space-y-6 pt-4">
              {[
                { icon: Mail, label: "Email", value: "loideveloper@example.com" },
                { icon: Phone, label: "Phone", value: "+84 123 456 789" },
                { icon: MapPin, label: "Address", value: "Ho Chi Minh City, Vietnam" },
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

            {/* Social Links */}
            <div className="pt-8">
                <h3 className="text-lg font-bold mb-4">Follow Me</h3>
                <div className="flex gap-4">
                  {[
                    { name: "Facebook", color: "hover:text-blue-600" },
                    { name: "Twitter", color: "hover:text-sky-500" },
                    { name: "Instagram", color: "hover:text-pink-500" },
                    { name: "LinkedIn", color: "hover:text-blue-700" }
                  ].map((social, i) => (
                    <motion.a
                      key={i}
                      href="#"
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                      className={`w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground ${social.color} transition-colors shadow-sm`}
                    >
                      <span className="sr-only">{social.name}</span>
                      {/* Using a generic icon for now as lucide doesn't have all brand icons in this specific import set easily available without checking */}
                      <div className="w-4 h-4 bg-current rounded-full" /> 
                    </motion.a>
                  ))}
                </div>
            </div>
          </div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card p-8 md:p-10 rounded-3xl border border-border/50 shadow-xl backdrop-blur-sm relative overflow-hidden"
          >
             {/* Decorative background blob */}
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
             
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
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

              <Button 
                type="submit" 
                size="lg" 
                className="w-full rounded-full h-12 text-base font-medium relative overflow-hidden group" 
                disabled={isSubmitting}
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
