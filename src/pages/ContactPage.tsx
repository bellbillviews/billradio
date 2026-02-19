import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import { SocialLinks } from "@/components/SocialLinks";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageCircle, MapPin, Handshake, Radio } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteData";

export default function ContactPage() {
  const { data: settings } = useSiteSettings();
  const getSetting = (key: string) => settings?.find(s => s.setting_key === key)?.setting_value || "";
  const contactBg = getSetting("bg_image_contact") || "/images/bg-contact.jpg";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={contactBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 glass-dark rounded-full mb-6 animate-fade-in">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary tracking-wider">Get In Touch</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Contact <span className="text-gold-shimmer">Us</span>
            </h1>
            <p className="text-lg text-white/60 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Have a question, feedback, or partnership idea? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="animate-fade-in">
              <div className="glass rounded-3xl p-6 md:p-8 border border-primary/10">
                <h2 className="text-2xl font-bold text-foreground mb-6 font-display">Send Us a Message</h2>
                <ContactForm />
              </div>
            </div>

            <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6 font-display">Reach Out Directly</h2>
                <div className="space-y-3">
                  {[
                    { href: "mailto:hello@bellbillradio.com", icon: Mail, label: "Email", value: "hello@bellbillradio.com" },
                    { href: "https://wa.me/2348000000000", icon: MessageCircle, label: "WhatsApp", value: "+234 800 000 0000" },
                    { href: "tel:+2348000000000", icon: Phone, label: "Phone", value: "+234 800 000 0000" },
                  ].map((item) => (
                    <a key={item.label} href={item.href} target={item.label === "WhatsApp" ? "_blank" : undefined}
                      className="flex items-center gap-4 p-4 glass glass-hover rounded-2xl border border-primary/10">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="text-foreground font-medium">{item.value}</p>
                      </div>
                    </a>
                  ))}
                  <div className="flex items-center gap-4 p-4 glass rounded-2xl border border-primary/10">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="text-foreground font-medium">Lagos, Nigeria</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 font-display">Follow Us</h3>
                <SocialLinks iconSize="lg" />
              </div>

              <div className="glass rounded-3xl p-6 border border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Handshake className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2 font-display">Partnership & Sponsorship</h3>
                    <p className="text-muted-foreground text-sm mb-4">We offer advertising and sponsorship packages tailored to your brand.</p>
                    <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full glow-gold-sm">
                      <a href="mailto:partnerships@bellbillradio.com">Discuss Partnership</a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="glass rounded-3xl p-6 border border-primary/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Radio className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2 font-display">Be a Guest</h3>
                    <p className="text-muted-foreground text-sm">Have a story? Want to promote your music? Reach out to be featured!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
