import { User } from "lucide-react";
import type { Presenter } from "@/hooks/useSiteData";

interface PresenterCardProps {
  presenter: Presenter;
}

export function PresenterCard({ presenter }: PresenterCardProps) {
  return (
    <div className="group relative rounded-3xl overflow-hidden bg-card border border-border glass glass-hover">
      <div className="aspect-square relative overflow-hidden bg-muted">
        {presenter.image_url ? (
          <img src={presenter.image_url} alt={presenter.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <User className="w-16 h-16 text-muted-foreground/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-transparent to-transparent" />
      </div>
      <div className="relative p-4 text-center">
        <h3 className="font-display font-semibold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">
          {presenter.name}
        </h3>
        {presenter.bio && <p className="text-muted-foreground text-sm line-clamp-2">{presenter.bio}</p>}
      </div>
    </div>
  );
}
