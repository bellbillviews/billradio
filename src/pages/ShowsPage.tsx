import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ShowCard } from "@/components/ShowCard";
import { PageAds } from "@/components/ads/PageAds";
import { useShows } from "@/hooks/useAdminData";
import { useSiteSettings } from "@/hooks/useSiteData";
import { Radio, Loader2 } from "lucide-react";

export default function ShowsPage() {
  const { data: shows, isLoading } = useShows();
  const { data: settings } = useSiteSettings();
  const activeShows = shows?.filter(show => show.is_active) || [];
  const getSetting = (key: string) => settings?.find(s => s.setting_key === key)?.setting_value || "";
  const showsBg = getSetting("bg_image_shows") || "/images/bg-shows.jpg";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={showsBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 glass-dark rounded-full mb-6 animate-fade-in">
              <Radio className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary tracking-wider">Our Programs</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Radio <span className="text-gold-shimmer">Shows</span>
            </h1>
            <p className="text-lg text-white/60 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Discover our lineup of engaging programs.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6"><PageAds placement="shows" maxAds={1} /></div>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : activeShows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeShows.map((show, i) => (
                <div key={show.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <ShowCard show={{ id: show.id, name: show.name, host: show.host, description: show.description || "", schedule: show.schedule || "", time: show.time || "", imageUrl: show.image_url || undefined }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Radio className="w-10 h-10 text-primary/30" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 font-display">Shows Coming Soon</h3>
              <p className="text-muted-foreground">We're preparing an exciting lineup.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center glass rounded-3xl p-8 border border-primary/20">
            <h3 className="text-xl font-semibold text-foreground mb-3 font-display">Programming Schedule</h3>
            <p className="text-muted-foreground">
              All times are in WAT. Want to be a guest? <a href="/contact" className="text-primary hover:underline">Contact us</a>!
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
