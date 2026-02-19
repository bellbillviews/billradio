import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PageAds } from "@/components/ads/PageAds";
import { useEvents } from "@/hooks/useAdminData";
import { useSiteSettings } from "@/hooks/useSiteData";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { format, isPast, isFuture } from "date-fns";

export default function EventsPage() {
  const { data: events, isLoading } = useEvents();
  const { data: settings } = useSiteSettings();
  const activeEvents = events?.filter(e => e.is_active) || [];
  const upcoming = activeEvents.filter(e => e.event_date && isFuture(new Date(e.event_date)));
  const past = activeEvents.filter(e => e.event_date && isPast(new Date(e.event_date)));
  const noDate = activeEvents.filter(e => !e.event_date);
  const getSetting = (key: string) => settings?.find(s => s.setting_key === key)?.setting_value || "";
  const eventsBg = getSetting("bg_image_events") || "/images/bg-events.jpg";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={eventsBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 glass-dark rounded-full mb-6 animate-fade-in">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary tracking-wider">Events & Happenings</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Upcoming <span className="text-gold-shimmer">Events</span>
            </h1>
            <p className="text-lg text-white/60 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Join us at live shows, concerts, meetups and special broadcasts.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6"><PageAds placement="events" maxAds={1} /></div>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : activeEvents.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-primary/30" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 font-display">No Events Yet</h3>
              <p className="text-muted-foreground">Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-12">
              {(upcoming.length > 0 || noDate.length > 0) && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2 font-display">
                    <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />Upcoming
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...upcoming, ...noDate].map((event, i) => (
                      <div key={event.id} className="group glass glass-hover rounded-3xl overflow-hidden border border-primary/10 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                        {event.image_url && (
                          <div className="relative aspect-video overflow-hidden">
                            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 to-transparent" />
                          </div>
                        )}
                        <div className="relative p-5 space-y-3">
                          {event.event_date && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                              <Clock className="w-3 h-3 text-primary" />
                              <span className="text-xs font-medium text-primary">{format(new Date(event.event_date), "PPp")}</span>
                            </div>
                          )}
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors font-display">{event.title}</h3>
                          {event.description && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{event.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2 font-display">
                    <span className="w-3 h-3 rounded-full bg-muted-foreground/30" />Past Events
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {past.map((event, i) => (
                      <div key={event.id} className="rounded-3xl overflow-hidden bg-muted/50 opacity-60 border border-border animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                        {event.image_url && (
                          <div className="aspect-video overflow-hidden"><img src={event.image_url} alt={event.title} className="w-full h-full object-cover grayscale" /></div>
                        )}
                        <div className="p-5 space-y-2">
                          {event.event_date && <p className="text-xs text-muted-foreground">{format(new Date(event.event_date), "PPp")}</p>}
                          <h3 className="text-lg font-semibold text-foreground font-display">{event.title}</h3>
                          {event.description && <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
