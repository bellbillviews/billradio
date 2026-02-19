import { Link } from "react-router-dom";
import { Radio, Mail, Phone, MapPin } from "lucide-react";
import { DynamicSocialLinks } from "./DynamicSocialLinks";
import { useSiteSettings } from "@/hooks/useSiteData";
import { useShows } from "@/hooks/useAdminData";

export function Footer() {
  const { data: settings } = useSiteSettings();
  const { data: shows } = useShows();

  const getSetting = (key: string) => settings?.find(s => s.setting_key === key)?.setting_value || "";
  const stationName = getSetting("station_name") || "Bellbill Radio";
  const stationSlogan = getSetting("station_slogan") || "The Sound of Culture, Voice, and Music";
  const contactEmail = getSetting("contact_email") || "hello@bellbillradio.com";
  const contactPhone = getSetting("contact_phone") || "+234 800 000 0000";
  const logoUrl = getSetting("logo_url");
  const footerLogoUrl = getSetting("footer_logo_url") || logoUrl;
  const activeShows = shows?.filter(s => s.is_active)?.slice(0, 4) || [];

  return (
    <footer className="relative bg-secondary text-secondary-foreground">
      <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-5">
            <Link to="/" className="flex items-center gap-3">
              {footerLogoUrl ? (
                <img src={footerLogoUrl} alt={stationName} className="w-10 h-10 rounded-full object-cover border-2 border-primary/40" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-primary" />
                </div>
              )}
              <span className="text-xl font-bold font-display text-white">{stationName}</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">{stationSlogan}</p>
            <DynamicSocialLinks />
          </div>

          <div>
            <h3 className="font-semibold text-primary mb-5 text-sm uppercase tracking-widest">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { to: "/", label: "Home" }, { to: "/listen", label: "Listen Live" },
                { to: "/shows", label: "Shows" }, { to: "/events", label: "Events" },
                { to: "/about", label: "About" }, { to: "/contact", label: "Contact" },
                { to: "/billboard", label: "Advertise" },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-white/50 hover:text-primary transition-colors text-sm">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-primary mb-5 text-sm uppercase tracking-widest">Programs</h3>
            <ul className="space-y-2.5">
              {activeShows.length > 0
                ? activeShows.map(show => <li key={show.id}><span className="text-white/50 text-sm">{show.name}</span></li>)
                : ["Morning Show", "Afternoon Drive", "Evening Vibes"].map(s => <li key={s}><span className="text-white/50 text-sm">{s}</span></li>)
              }
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-primary mb-5 text-sm uppercase tracking-widest">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/50 text-sm">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`mailto:${contactEmail}`} className="hover:text-primary transition-colors">{contactEmail}</a>
              </li>
              <li className="flex items-center gap-3 text-white/50 text-sm">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className="hover:text-primary transition-colors">{contactPhone}</a>
              </li>
              <li className="flex items-center gap-3 text-white/50 text-sm">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">© {new Date().getFullYear()} {stationName}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-white/40 hover:text-primary transition-colors text-sm">Privacy</Link>
            <Link to="/terms" className="text-white/40 hover:text-primary transition-colors text-sm">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
