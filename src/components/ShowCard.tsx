import { useState } from "react";
import { Clock, User, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface Show {
  id: string;
  name: string;
  host: string;
  description: string;
  schedule: string;
  time: string;
  imageUrl?: string;
}

interface ShowCardProps {
  show: Show;
  className?: string;
}

export function ShowCard({ show, className }: ShowCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "group relative rounded-3xl overflow-hidden cursor-pointer bg-card border border-border glass glass-hover",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <div className="aspect-video bg-muted relative overflow-hidden">
          {show.imageUrl ? (
            <img src={show.imageUrl} alt={show.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <span className="text-5xl font-display font-bold text-primary/20">{show.name.charAt(0)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-transparent to-transparent" />
        </div>

        <div className="relative p-5 space-y-3">
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 font-display">
            {show.name}
          </h3>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4 text-primary" />
            <span className="text-sm">{show.host}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {show.schedule && (
              <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                <Calendar className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">{show.schedule}</span>
              </div>
            )}
            {show.time && (
              <div className="flex items-center gap-1 px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20">
                <Clock className="w-3 h-3 text-foreground/60" />
                <span className="text-xs text-foreground/60">{show.time}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{show.description}</p>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto glass rounded-3xl border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">{show.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {show.imageUrl && <img src={show.imageUrl} alt={show.name} className="w-full rounded-2xl object-cover max-h-64" />}
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4 text-primary" />
              <span className="font-medium">Hosted by {show.host}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {show.schedule && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                  <Calendar className="w-4 h-4 text-primary" /><span className="text-sm">{show.schedule}</span>
                </div>
              )}
              {show.time && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full">
                  <Clock className="w-4 h-4 text-muted-foreground" /><span className="text-sm">{show.time}</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed">{show.description || "No description available."}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
