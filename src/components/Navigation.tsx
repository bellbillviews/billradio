import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Radio, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/useSiteData";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Listen", path: "/listen" },
  { name: "Shows", path: "/shows" },
  { name: "Events", path: "/events" },
  { name: "Billboard", path: "/billboard" },
  { name: "Contact", path: "/contact" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { data: settings } = useSiteSettings();

  const getSetting = (key: string) => settings?.find(s => s.setting_key === key)?.setting_value || "";
  const logoUrl = getSetting("logo_url");
  const stationName = getSetting("station_name") || "Bellbill Radio";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3 group">
            {logoUrl ? (
              <img src={logoUrl} alt={stationName} className="w-10 h-10 rounded-full object-cover border-2 border-primary/50 glow-gold-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center glow-gold-sm">
                <Radio className="w-5 h-5 text-primary" />
              </div>
            )}
            <span className="text-xl font-bold text-white font-display">
              {stationName}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  location.pathname === link.path
                    ? "text-primary bg-primary/10 border border-primary/30"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-6 glow-gold-sm">
              <Link to="/listen">
                <Headphones className="w-4 h-4 mr-2" />
                Listen Live
              </Link>
            </Button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white rounded-full bg-white/10"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass-dark border-t border-white/10 animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-2xl text-sm font-medium transition-all",
                  location.pathname === link.path
                    ? "text-primary bg-primary/10"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Button asChild className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full glow-gold-sm">
              <Link to="/listen" onClick={() => setIsOpen(false)}>
                <Headphones className="w-4 h-4 mr-2" />
                Listen Live
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
