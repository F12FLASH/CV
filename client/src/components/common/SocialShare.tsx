import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Link as LinkIcon, Check, X } from "lucide-react";
import { SiFacebook, SiX, SiLinkedin, SiWhatsapp, SiTelegram, SiReddit } from "react-icons/si";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  compact?: boolean;
}

export function SocialShare({ url, title, description, image, compact = false }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || "");

  const shareLinks = [
    {
      name: "Facebook",
      icon: SiFacebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:text-[#1877F2]",
    },
    {
      name: "X",
      icon: SiX,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: "hover:text-foreground",
    },
    {
      name: "LinkedIn",
      icon: SiLinkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:text-[#0A66C2]",
    },
    {
      name: "WhatsApp",
      icon: SiWhatsapp,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: "hover:text-[#25D366]",
    },
    {
      name: "Telegram",
      icon: SiTelegram,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      color: "hover:text-[#26A5E4]",
    },
    {
      name: "Reddit",
      icon: SiReddit,
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      color: "hover:text-[#FF4500]",
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually.",
        variant: "destructive",
      });
    }
  };

  const handleShare = (href: string) => {
    window.open(href, "_blank", "width=600,height=400,noopener,noreferrer");
    setIsOpen(false);
  };

  if (compact) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" data-testid="button-share">
            <Share2 className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="end">
          <div className="flex items-center gap-1">
            {shareLinks.slice(0, 4).map((link) => (
              <Button
                key={link.name}
                variant="ghost"
                size="icon"
                onClick={() => handleShare(link.href)}
                className={`${link.color} transition-colors`}
                data-testid={`button-share-${link.name.toLowerCase()}`}
              >
                <link.icon className="w-4 h-4" />
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              className="transition-colors"
              data-testid="button-copy-link"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground mr-1">Share:</span>
      {shareLinks.map((link) => (
        <Button
          key={link.name}
          variant="ghost"
          size="icon"
          onClick={() => handleShare(link.href)}
          className={`${link.color} transition-colors`}
          title={`Share on ${link.name}`}
          data-testid={`button-share-${link.name.toLowerCase()}`}
        >
          <link.icon className="w-4 h-4" />
        </Button>
      ))}
      <Button
        variant="ghost"
        size="icon"
        onClick={copyToClipboard}
        className="transition-colors"
        title="Copy link"
        data-testid="button-copy-link"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
      </Button>
    </div>
  );
}
