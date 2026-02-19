import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Radio, Settings, Mic, Users, Link as LinkIcon, Tv, Video,
  Calendar, LogOut, Menu, X, Home, Upload, MessageSquare, Clock, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const adminLinks = [
  { name: "Dashboard", path: "/admin", icon: Home },
  { name: "Listener Requests", path: "/admin/requests", icon: MessageSquare },
  { name: "Site Settings", path: "/admin/settings", icon: Settings },
  { name: "Shows", path: "/admin/shows", icon: Mic },
  { name: "Presenters", path: "/admin/presenters", icon: Users },
  { name: "Social Links", path: "/admin/social-links", icon: LinkIcon },
  { name: "Audio Broadcast", path: "/admin/broadcast", icon: Tv },
  { name: "Video Stream", path: "/admin/stream", icon: Video },
  { name: "Schedule", path: "/admin/schedule", icon: Clock },
  { name: "Listener Analytics", path: "/admin/analytics", icon: BarChart3 },
  { name: "Events", path: "/admin/events", icon: Calendar },
  { name: "Billboard Ads", path: "/admin/billboard", icon: Radio },
  { name: "Media Library", path: "/admin/media", icon: Upload },
];

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[hsl(0_0%_10%)] border border-[hsl(0_0%_20%)] rounded-lg text-[hsl(0_0%_80%)]"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-[hsl(0_0%_0%/0.8)] backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[hsl(0_0%_6%)] border-r border-[hsl(0_0%_15%)] flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-4 border-b border-[hsl(0_0%_15%)]">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[hsl(43_96%_56%/0.2)] flex items-center justify-center">
              <Radio className="w-5 h-5 text-[hsl(43_96%_56%)]" />
            </div>
            <div>
              <span className="text-lg font-bold text-[hsl(0_0%_95%)] block">
                Bellbill<span className="text-[hsl(43_96%_56%)]">Radio</span>
              </span>
              <span className="text-xs text-[hsl(0_0%_50%)]">Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                location.pathname === link.path
                  ? "text-[hsl(43_96%_56%)] bg-[hsl(43_96%_56%/0.1)]"
                  : "text-[hsl(0_0%_55%)] hover:text-[hsl(0_0%_85%)] hover:bg-[hsl(0_0%_10%)]"
              )}
            >
              <link.icon className="w-5 h-5" />
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[hsl(0_0%_15%)] space-y-2">
          <Button variant="outline" className="w-full justify-start gap-2 border-[hsl(0_0%_20%)] text-[hsl(0_0%_70%)] hover:text-[hsl(0_0%_95%)] hover:bg-[hsl(0_0%_10%)]" asChild>
            <Link to="/"><Radio className="w-4 h-4" />View Live Site</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-[hsl(0_0%_50%)] hover:text-[hsl(0_84%_60%)] hover:bg-[hsl(0_84%_60%/0.05)]"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}
