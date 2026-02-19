import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackAdEvent } from "@/lib/adTracking";
import { AdNetworkScript } from "./AdNetworkScript";

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

interface PageAdsProps {
  placement: string;
  className?: string;
  maxAds?: number;
}

export function PageAds({ placement, className = "", maxAds = 3 }: PageAdsProps) {
  const { data: ads } = useQuery({
    queryKey: ["page_ads", placement],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("billboard_ads")
        .select("*")
        .eq("is_active", true)
        .or(`placement.eq.${placement},placement.eq.all`)
        .order("priority", { ascending: false })
        .limit(maxAds);
      if (error) throw error;
      return data as BillboardAd[];
    },
    refetchInterval: 60000,
  });

  const { data: adNetworks } = useQuery({
    queryKey: ["page_ad_networks", placement],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_networks")
        .select("*")
        .eq("is_active", true)
        .or(`placement.eq.${placement},placement.eq.all`);
      if (error) throw error;
      return (data || []).map(n => ({
        ...n,
        slot_ids: (n.slot_ids as Record<string, string>) || {},
        config: (n.config as Record<string, unknown>) || {},
      }));
    },
  });

  useEffect(() => {
    ads?.forEach(ad => trackAdEvent(ad.id, "view"));
  }, [ads]);

  if ((!ads || ads.length === 0) && (!adNetworks || adNetworks.length === 0)) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {ads?.map(ad => (
        <a
          key={ad.id}
          href={ad.link_url || "#"}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => trackAdEvent(ad.id, "click")}
          className="group block bg-card/50 backdrop-blur border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300"
        >
          <div className="flex items-center gap-4 p-3">
            {ad.image_url && (
              <img
                src={ad.image_url}
                alt={ad.title}
                className="max-w-[200px] max-h-[120px] w-auto h-auto rounded-lg object-contain flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground group-hover:text-primary transition-colors text-sm truncate">
                {ad.title}
              </h4>
              {ad.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{ad.description}</p>
              )}
              <p className="text-[10px] text-muted-foreground/60 mt-1">Sponsored</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
          </div>
        </a>
      ))}
      {adNetworks?.map(network => (
        <AdNetworkScript key={network.id} network={network} placement={placement} />
      ))}
    </div>
  );
}
