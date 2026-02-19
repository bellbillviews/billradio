import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BroadcastSettings {
  youtubeVideoId: string;
  broadcastEnabled: boolean;
  autoplay: boolean;
  offlineMessage: string;
  youtubePlaylistUrl: string;
}

export function useBroadcastSettings(refetchInterval = 5000) {
  return useQuery({
    queryKey: ["broadcast_settings"],
    queryFn: async () => {
      const keys = [
        "youtube_live_video_id",
        "broadcast_enabled",
        "broadcast_autoplay",
        "broadcast_offline_message",
        "youtube_playlist_url",
      ];

      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", keys);

      if (error) throw error;

      const get = (key: string) => data?.find((s) => s.setting_key === key)?.setting_value || "";

      return {
        youtubeVideoId: get("youtube_live_video_id"),
        broadcastEnabled: get("broadcast_enabled") === "true",
        autoplay: get("broadcast_autoplay") === "true",
        offlineMessage: get("broadcast_offline_message") || "We are currently offline. Check back soon!",
        youtubePlaylistUrl: get("youtube_playlist_url"),
      } as BroadcastSettings;
    },
    refetchInterval,
  });
}
