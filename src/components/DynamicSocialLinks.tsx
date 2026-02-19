import { Instagram, Twitter, Facebook, Youtube, MessageCircle, Globe, Music, Linkedin, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocialLinks } from "@/hooks/useSiteData";
import { Skeleton } from "@/components/ui/skeleton";

interface DynamicSocialLinksProps {
  className?: string;
  iconSize?: "sm" | "md" | "lg";
}

const iconMap: Record<string, LucideIcon> = {
  instagram: Instagram,
  twitter: Twitter,
  x: Twitter,
  facebook: Facebook,
  youtube: Youtube,
  whatsapp: MessageCircle,
  linkedin: Linkedin,
  tiktok: Music,
  website: Globe,
};

const hoverColorMap: Record<string, string> = {
  instagram: "hover:text-pink-500",
  twitter: "hover:text-sky-400",
  x: "hover:text-sky-400",
  facebook: "hover:text-blue-500",
  youtube: "hover:text-red-500",
  whatsapp: "hover:text-green-500",
  linkedin: "hover:text-blue-600",
  tiktok: "hover:text-pink-400",
  website: "hover:text-primary",
};

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

export function DynamicSocialLinks({ className, iconSize = "md" }: DynamicSocialLinksProps) {
  const { data: socialLinks, isLoading } = useSocialLinks();

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="w-10 h-10 rounded-full" />
        ))}
      </div>
    );
  }

  if (!socialLinks || socialLinks.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {socialLinks.map((social) => {
        const platformKey = social.platform.toLowerCase();
        const IconComponent = iconMap[platformKey] || Globe;
        const hoverColor = hoverColorMap[platformKey] || "hover:text-primary";

        return (
          <a
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "rounded-full bg-muted text-muted-foreground transition-all duration-300",
              containerClasses[iconSize],
              hoverColor,
              "hover:bg-muted/80 hover:scale-110"
            )}
            aria-label={social.platform}
          >
            <IconComponent className={sizeClasses[iconSize]} />
          </a>
        );
      })}
    </div>
  );
}
