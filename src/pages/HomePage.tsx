import { Link } from "react-router-dom";
import { Radio, Headphones, Users, Heart, ChevronRight, Mic2, Loader2, Calendar, Megaphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AudioPlayer } from "@/components/AudioPlayer";
import { DynamicSocialLinks } from "@/components/DynamicSocialLinks";
import { ShowCard } from "@/components/ShowCard";
import { PresenterCard } from "@/components/PresenterCard";
import { PageAds } from "@/components/ads/PageAds";
import { useShows, usePresenters, useEvents } from "@/hooks/useAdminData";
import { useSiteSettings } from "@/hooks/useSiteData";
import { useLiveOnAir } from "@/hooks/useLiveOnAir";
import { useBroadcastSettings } from "@/hooks/useBroadcastSettings";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { data: shows, isLoading: showsLoading } = useShows();
  const { data: presenters, isLoading: presentersLoading } = usePresenters();
  const { data: events } = useEvents();
  const { data: settings } = useSiteSettings();
  const { data: liveOnAir } = useLiveOnAir();
  const { data: broadcast } = useBroadcastSettings();

  const activeShows = shows?.filter(show => show.is_active) || [];
  const activePresenters = presenters?.filter(p => p.is_active) || [];
  const activeEvents = events?.filter(e => e.is_active) || [];
  const featuredShows = activeShows.slice(0, 3);
  const featuredPresenters = activePresenters.slice(0, 4);

  const getSetting = (key: string) => settings?.find(s => s.setting_key === key)?.setting_value || "";
  const stationName = getSetting("station_name") || "Bellbill Radio";
  const stationSlogan = getSetting("station_slogan") || "The Sound of Culture, Voice, and Music";
  const homeBg = getSetting("bg_image_home") || "/images/bg-home.jpg";
  const nowPlayingBg = getSetting("bg_image_section_nowplaying");
  const showsBg = getSetting("bg_image_section_shows");
  const presentersBg = getSetting("bg_image_section_presenters");
  const statsBg = getSetting("bg_image_section_stats");
  const whyBg = getSetting("bg_image_section_why");
  const partnerBg = getSetting("bg_image_section_partner");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <img src={homeBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full glass-dark glow-gold-sm animate-fade-in`}>
              <span className={`w-2.5 h-2.5 rounded-full ${broadcast?.broadcastEnabled ? "bg-red-500 animate-pulse" : "bg-white/30"}`} />
              <span className={`text-sm font-bold tracking-wider ${broadcast?.broadcastEnabled ? "text-red-400" : "text-white/50"}`}>
                {broadcast?.broadcastEnabled ? "🔴 LIVE NOW" : "OFF AIR"}
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-bold text-white animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <span className="text-gold-shimmer">{stationName}</span>
            </h1>

            <p className="text-xl sm:text-2xl text-white/70 animate-fade-in max-w-2xl mx-auto" style={{ animationDelay: "0.2s" }}>
              {stationSlogan}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 py-7 text-lg rounded-full glow-gold relative overflow-hidden group">
                <Link to="/listen">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Headphones className="w-5 h-5 mr-2" />
                  Listen Live
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="glass-dark text-white border-white/20 font-semibold px-10 py-7 text-lg rounded-full hover:bg-white/10">
                <Link to="/shows">
                  View Programs
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="max-w-md mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <AudioPlayer size="compact" />
            </div>

            <div className="flex justify-center animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <DynamicSocialLinks iconSize="lg" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <div className="w-6 h-10 border-2 border-primary/40 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-primary/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* Now Playing */}
      <section className={cn("py-6 relative section-bg")}>
        {nowPlayingBg && <div className="section-bg-img"><img src={nowPlayingBg} alt="" /><div className="absolute inset-0 hero-overlay" /></div>}
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl glass glass-gold glow-gold-sm">
            <div className="flex items-center gap-4">
              {liveOnAir?.presenterImage ? (
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-primary/30 blur-md animate-pulse" />
                  <img src={liveOnAir.presenterImage} alt="" className="relative w-16 h-16 rounded-full object-cover border-2 border-primary/50" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Radio className="w-8 h-8 text-primary" />
                </div>
              )}
              <div>
                <p className="text-xs text-primary uppercase tracking-[0.2em] mb-1 font-bold">On Air Now</p>
                <h3 className="text-xl font-bold text-foreground font-display">{liveOnAir?.showName || featuredShows[0]?.name || "Live Radio"}</h3>
                <p className="text-sm text-muted-foreground">
                  {liveOnAir?.presenterName ? `with ${liveOnAir.presenterName}` : featuredShows[0]?.host ? `with ${featuredShows[0].host}` : "24/7 Streaming"}
                </p>
              </div>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-8 glow-gold-sm">
              <Link to="/listen"><Headphones className="w-4 h-4 mr-2" />Tune In</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6"><PageAds placement="homepage" maxAds={2} /></div>

      {/* Featured Shows */}
      <section className={cn("py-20 section-bg gradient-gold-silver")}>
        {showsBg && <div className="section-bg-img"><img src={showsBg} alt="" /><div className="absolute inset-0 hero-overlay" /></div>}
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-display">
                Featured <span className="text-gold-shimmer">Shows</span>
              </h2>
              <p className="text-muted-foreground">Discover our most popular programs</p>
            </div>
            <Button asChild variant="outline" className="rounded-full border-primary/30 hover:bg-primary/5">
              <Link to="/shows">View All <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
          {showsLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : featuredShows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredShows.map((show) => (
                <ShowCard key={show.id} show={{ id: show.id, name: show.name, host: show.host, description: show.description || "", schedule: show.schedule || "", time: show.time || "", imageUrl: show.image_url || undefined }} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12"><p className="text-muted-foreground">No shows available yet.</p></div>
          )}
        </div>
      </section>

      {/* Presenters */}
      {featuredPresenters.length > 0 && (
        <section className={cn("py-20 section-bg")}>
          {presentersBg && <div className="section-bg-img"><img src={presentersBg} alt="" /><div className="absolute inset-0 hero-overlay" /></div>}
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display">
                Meet Our <span className="text-gold-shimmer">Presenters</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">The voices behind your favorite shows</p>
            </div>
            {presentersLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredPresenters.map((p) => <PresenterCard key={p.id} presenter={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Events & Billboard */}
      <section className="py-16 gradient-gold-silver">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass glass-hover rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground font-display">Upcoming Events</h3>
                  <p className="text-sm text-muted-foreground">{activeEvents.length} events coming up</p>
                </div>
              </div>
              {activeEvents.slice(0, 2).map(event => (
                <div key={event.id} className="mb-2 p-3 bg-muted/50 rounded-2xl">
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  {event.event_date && <p className="text-xs text-muted-foreground">{new Date(event.event_date).toLocaleDateString()}</p>}
                </div>
              ))}
              <Button asChild variant="outline" size="sm" className="mt-2 w-full rounded-full border-primary/20">
                <Link to="/events">View All Events</Link>
              </Button>
            </div>

            <div className="glass glass-hover rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground font-display">Billboard Advertising</h3>
                  <p className="text-sm text-muted-foreground">Reach thousands of listeners</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Promote your brand to our engaged audience across Africa and beyond.</p>
              <Button asChild size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full glow-gold-sm">
                <Link to="/billboard"><Megaphone className="w-4 h-4 mr-2" />Explore Billboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={cn("py-16 section-bg bg-secondary text-white")}>
        {statsBg && <div className="section-bg-img"><img src={statsBg} alt="" /><div className="absolute inset-0 hero-overlay" /></div>}
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "24/7", label: "Broadcasting", icon: Radio },
              { value: `${activeShows.length || "10"}+`, label: "Shows", icon: Sparkles },
              { value: "50K+", label: "Listeners", icon: Headphones },
              { value: `${activePresenters.length || "15"}+`, label: "Hosts", icon: Mic2 },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-3xl glass-dark">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-3xl md:text-4xl font-bold text-gold-shimmer mb-1 font-display">{stat.value}</div>
                <p className="text-white/50 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className={cn("py-20 section-bg gradient-gold-silver")}>
        {whyBg && <div className="section-bg-img"><img src={whyBg} alt="" /><div className="absolute inset-0 hero-overlay" /></div>}
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display">
              Why <span className="text-gold-shimmer">{stationName.split(" ")[0]}</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">More than just radio — a cultural movement.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Mic2, title: "Authentic Voices", desc: "Real conversations with real people. Unfiltered and unapologetically African." },
              { icon: Users, title: "Community First", desc: "Built by the community, for the community. Your voice matters." },
              { icon: Heart, title: "Culture & Music", desc: "From Afrobeats to highlife. We celebrate African music in all its forms." },
            ].map((item, i) => (
              <div key={i} className="glass glass-hover rounded-3xl p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 font-display">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner CTA */}
      <section className={cn("py-20 relative overflow-hidden section-bg")}>
        {partnerBg && <div className="section-bg-img"><img src={partnerBg} alt="" /><div className="absolute inset-0 hero-overlay" /></div>}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 glow-gold-sm">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display">
              Partner With <span className="text-gold-shimmer">Us</span>
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join hands with {stationName} to reach thousands of engaged listeners.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-8 glow-gold-sm">
                <Link to="/billboard"><Megaphone className="w-5 h-5 mr-2" />Advertise</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-primary/30 hover:bg-primary/5">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
