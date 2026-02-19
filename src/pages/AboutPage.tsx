import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Target, Eye, Heart, Users, Radio, Globe, Headphones, MessageSquare } from "lucide-react";
import { useSiteSettings, usePresenters } from "@/hooks/useSiteData";
import { PresenterCard } from "@/components/PresenterCard";

export default function AboutPage() {
  const { data: settings } = useSiteSettings();
  const { data: presenters } = usePresenters();
  const getSetting = (key: string) => settings?.find(s => s.setting_key === key)?.setting_value || "";
  const stationName = getSetting("station_name") || "Bellbill Radio";
  const aboutContent = getSetting("about_us");
  const aboutBg = getSetting("bg_image_about") || "/images/bg-about.jpg";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={aboutBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 glass-dark rounded-full mb-6 animate-fade-in">
              <Radio className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary tracking-wider">Our Story</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              About <span className="text-gold-shimmer">{stationName}</span>
            </h1>
            <p className="text-lg text-white/60 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              The Sound of Culture, Voice, and Music
            </p>
          </div>
        </div>
      </section>

      {aboutContent && (
        <section className="py-16 bg-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-neutral max-w-none text-muted-foreground prose-headings:text-foreground prose-headings:font-display prose-a:text-primary" dangerouslySetInnerHTML={{ __html: aboutContent }} />
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground font-display">Our <span className="text-gold-shimmer">Journey</span></h2>
              <p className="text-muted-foreground leading-relaxed">Born in Nigeria, {stationName} emerged from a vision to celebrate African culture, amplify authentic voices, and deliver music that moves souls.</p>
              <p className="text-muted-foreground leading-relaxed">We broadcast 24/7, featuring diverse shows from morning motivation to late-night grooves. Our dedicated hosts bring authenticity to every broadcast.</p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden glass border border-primary/20 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
                  <Radio className="w-16 h-16 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Our Mission", desc: "Leading voice of African culture through digital broadcasting." },
              { icon: Eye, title: "Our Vision", desc: "Africa's most influential digital radio network." },
              { icon: Heart, title: "Our Values", desc: "Authenticity. Community. Excellence. Passion." },
            ].map((item, i) => (
              <div key={i} className="glass glass-hover rounded-3xl p-8 border border-primary/10">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 font-display">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display">What We <span className="text-gold-shimmer">Do</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Headphones, title: "Live Radio", desc: "24/7 live broadcasting" },
              { icon: MessageSquare, title: "Talk Shows", desc: "Engaging conversations" },
              { icon: Users, title: "Community", desc: "Building connections" },
              { icon: Globe, title: "Global Reach", desc: "Connecting the diaspora" },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 glass glass-hover rounded-3xl border border-primary/10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 font-display">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {presenters && presenters.length > 0 && (
        <section className="py-16 bg-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display">Meet Our <span className="text-gold-shimmer">Team</span></h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {presenters.map((p) => <PresenterCard key={p.id} presenter={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 border border-primary/20 glow-gold-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-display">
              Ready to <span className="text-gold-shimmer">Tune In</span>?
            </h2>
            <p className="text-muted-foreground mb-8">Join thousands of listeners who have made {stationName} their go-to station.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full glow-gold-sm">
                <Link to="/listen">Listen Live Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-primary/30">
                <Link to="/contact">Partner With Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
