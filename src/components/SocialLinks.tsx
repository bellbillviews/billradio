import { Instagram, Twitter, Facebook, Youtube, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialLinksProps {
  className?: string;
  iconSize?: "sm" | "md" | "lg";
}

const socialLinks = [
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://instagram.com/bellbillviews",
    hoverColor: "hover:text-pink-500",
  },
  {
    name: "X (Twitter)",
    icon: Twitter,
    href: "https://twitter.com/bellbillviews",
    hoverColor: "hover:text-sky-400",
  },
  {
    name: "Facebook",
    icon: Facebook,
    href: "https://facebook.com/bellbillviews",
    hoverColor: "hover:text-blue-500",
  },
  {
    name: "YouTube",
    icon: Youtube,
    href: "https://youtube.com/@bellbillviews",
    hoverColor: "hover:text-red-500",
  },
  {
    name: "WhatsApp",
    icon: MessageCircle,
    href: "https://wa.me/2348000000000",
    hoverColor: "hover:text-green-500",
  },
];

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const containerClasses = {
  sm: "p-1.5",
  md: "p-2",
  lg: "p-2.5",
};

export function SocialLinks({ className, iconSize = "md" }: SocialLinksProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {socialLinks.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "rounded-full bg-muted text-muted-foreground transition-all duration-300",
            containerClasses[iconSize],
            social.hoverColor,
            "hover:bg-muted/80 hover:scale-110"
          )}
          aria-label={social.name}
        >
          <social.icon className={sizeClasses[iconSize]} />
        </a>
      ))}
    </div>
  );
}
