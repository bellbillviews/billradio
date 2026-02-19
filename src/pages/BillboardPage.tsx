import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Eye, MousePointer } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteData";
import { AdNetworkScript } from "@/components/ads/AdNetworkScript";
import { trackAdEvent } from "@/lib/adTracking";
import type { Json } from "@/integrations/supabase/types";

interface BillboardAd {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  advertiser_name: string;
  ad_type: string;
  placement: string;
  priority: number;
}

interface AdNetwork {
  id: string;
  name: string;
  network_type: string;
  publisher_id: string | null;
  slot_ids: Record<string, string>;
  config: Record<string, unknown>;
  placement: string;
}

export default function BillboardPage() {
  const { data: settings } = useSiteSettings();
  const getSetting = (key: string) => settings?.find(s => s.setting_key === key)?.setting_value || "";
  const stationName = getSetting("station_name") || "Bellbill Views";

  const { data: ads, isLoading } = useQuery({
    queryKey: ["billboard_ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("billboard_ads")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BillboardAd[];
    },
    refetchInterval: 30000,
  });

  const { data: adNetworks } = useQuery({
    queryKey: ["ad_networks_billboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_networks")
        .select("*")
        .eq("is_active", true)
        .or("placement.eq.billboard,placement.eq.all");
      if (error) throw error;
      // Transform JSON types to expected types
      return (data || []).map(n => ({
        ...n,
        slot_ids: (n.slot_ids as Record<string, string>) || {},
        config: (n.config as Record<string, unknown>) || {},
      })) as AdNetwork[];
    },
  });

  // Track view for all visible ads
  useEffect(() => {
    if (ads) {
      ads.forEach(ad => {
        trackAdEvent(ad.id, "view");
      });
    }
  }, [ads]);

  const handleAdClick = (ad: BillboardAd) => {
    trackAdEvent(ad.id, "click");
  };

  const bannerAds = ads?.filter(ad => ad.ad_type === "banner") || [];
  const sidebarAds = ads?.filter(ad => ad.ad_type === "sidebar") || [];
  const nativeAds = ads?.filter(ad => ad.ad_type === "native") || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              <span className="text-primary">Billboard</span> Advertising
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Partner with {stationName} and reach thousands of engaged listeners across Africa and beyond.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted aspect-video rounded-lg"></div>
                  <div className="h-4 bg-muted rounded mt-4 w-3/4"></div>
                  <div className="h-3 bg-muted rounded mt-2 w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Featured Banner Ads */}
              {bannerAds.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Featured Sponsors
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bannerAds.map(ad => (
                      <a
                        key={ad.id}
                        href={ad.link_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        onClick={() => handleAdClick(ad)}
                        className="group block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300"
                      >
                        {ad.image_url && (
                          <div className="overflow-hidden">
                            <img
                              src={ad.image_url}
                              alt={ad.title}
                              className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {ad.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {ad.description}
                              </p>
                              <p className="text-xs text-muted-foreground/70 mt-2">
                                Sponsored by {ad.advertiser_name}
                              </p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* Native Ads Grid */}
              {nativeAds.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <MousePointer className="w-5 h-5 text-primary" />
                    Partner Promotions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nativeAds.map(ad => (
                      <a
                        key={ad.id}
                        href={ad.link_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        onClick={() => handleAdClick(ad)}
                        className="group p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-all"
                      >
                        <div className="flex gap-4">
                          {ad.image_url && (
                            <img
                              src={ad.image_url}
                              alt={ad.title}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                              {ad.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {ad.description}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* Ad Network Placements */}
              {adNetworks?.map(network => (
                <AdNetworkScript key={network.id} network={network} placement="billboard" />
              ))}

              {/* Sidebar Ads */}
              {sidebarAds.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    More from Our Partners
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {sidebarAds.map(ad => (
                      <a
                        key={ad.id}
                        href={ad.link_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        onClick={() => handleAdClick(ad)}
                        className="group text-center"
                      >
                        {ad.image_url ? (
                          <img
                            src={ad.image_url}
                            alt={ad.title}
                            className="w-full h-auto max-h-32 object-contain rounded-lg border border-border group-hover:border-primary/50 transition-all"
                          />
                        ) : (
                          <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-2xl font-bold text-muted-foreground">
                              {ad.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground mt-2 truncate group-hover:text-primary transition-colors">
                          {ad.title}
                        </p>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* CTA for Advertisers */}
              <section className="bg-gradient-to-r from-primary/10 to-accent/10 border border-border rounded-2xl p-8 text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Want to Advertise with Us?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Reach our growing audience of engaged listeners. We offer flexible advertising packages 
                  for businesses of all sizes.
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Contact Us
                  <ExternalLink className="w-4 h-4" />
                </a>
              </section>

              {/* Empty State */}
              {(!ads || ads.length === 0) && !adNetworks?.length && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">
                    No active advertisements at the moment.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
