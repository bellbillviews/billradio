import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShows, usePresenters, useEvents, useSocialLinks } from "@/hooks/useAdminData";
import { Mic, Users, Calendar, Link as LinkIcon, Radio, Settings, Tv, Video } from "lucide-react";
import { LiveOnAirSettings } from "@/components/admin/LiveOnAirSettings";

export default function AdminDashboard() {
  const { data: shows } = useShows();
  const { data: presenters } = usePresenters();
  const { data: events } = useEvents();
  const { data: socialLinks } = useSocialLinks();

  const stats = [
    { name: "Shows", count: shows?.length || 0, icon: Mic, path: "/admin/shows", color: "text-primary" },
    { name: "Presenters", count: presenters?.length || 0, icon: Users, path: "/admin/presenters", color: "text-secondary" },
    { name: "Events", count: events?.length || 0, icon: Calendar, path: "/admin/events", color: "text-accent" },
    { name: "Social Links", count: socialLinks?.length || 0, icon: LinkIcon, path: "/admin/social-links", color: "text-primary" },
  ];

  const quickActions = [
    { name: "Site Settings", description: "Configure branding & stream URL", icon: Settings, path: "/admin/settings" },
    { name: "Manage Shows", description: "Add or edit radio programs", icon: Mic, path: "/admin/shows" },
    { name: "Broadcast Platforms", description: "Configure Mixlr & embed codes", icon: Tv, path: "/admin/broadcast" },
    { name: "Stream Settings", description: "Setup vMix/OBS streaming", icon: Video, path: "/admin/stream" },
  ];

  return (
    <AdminLayout title="Dashboard" description="Welcome to Bellbill Views Admin Panel">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.name} to={stat.path}>
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.count}</p>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Live On Air Control */}
      <div className="mb-8">
        <LiveOnAirSettings />
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link key={action.name} to={action.path}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <action.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{action.name}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Live Site Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            Live Site
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Your radio station is live! Click below to view your public website.
          </p>
          <div className="flex gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Radio className="w-4 h-4" />
              View Live Site
            </Link>
            <Link
              to="/listen"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Listen Live
            </Link>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
