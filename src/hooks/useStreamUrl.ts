import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useStreamUrl(refetchInterval = 5000) {
  return useQuery({
    queryKey: ["stream_url"],
    queryFn: async () => {
      // First try to get from stream_settings (active stream)
      const { data: streamSettings, error: streamError } = await supabase
        .from("stream_settings")
        .select("stream_url")
        .eq("is_active", true)
        .limit(1)
        .single();

      if (!streamError && streamSettings?.stream_url) {
        return streamSettings.stream_url;
      }

      // Fallback to site_settings stream_url
      const { data: siteSettings, error: siteError } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "stream_url")
        .single();

      if (!siteError && siteSettings?.setting_value) {
        return siteSettings.setting_value;
      }

      return "";
    },
    refetchInterval,
  });
}
