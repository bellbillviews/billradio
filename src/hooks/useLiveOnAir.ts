import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LiveOnAir {
  presenterName: string | null;
  presenterImage: string | null;
  showName: string | null;
  showTime: string | null;
}

export function useLiveOnAir(refetchInterval = 5000) {
  return useQuery({
    queryKey: ["live_on_air"],
    queryFn: async () => {
      const { data: settings } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["live_presenter_id", "live_show_id"]);

      const presenterId = settings?.find(s => s.setting_key === "live_presenter_id")?.setting_value;
      const showId = settings?.find(s => s.setting_key === "live_show_id")?.setting_value;

      let presenterName: string | null = null;
      let presenterImage: string | null = null;
      let showName: string | null = null;
      let showTime: string | null = null;

      if (presenterId) {
        const { data: presenter } = await supabase
          .from("presenters")
          .select("name, image_url")
          .eq("id", presenterId)
          .single();
        if (presenter) {
          presenterName = presenter.name;
          presenterImage = presenter.image_url;
        }
      }

      if (showId) {
        const { data: show } = await supabase
          .from("shows")
          .select("name, time")
          .eq("id", showId)
          .single();
        if (show) {
          showName = show.name;
          showTime = show.time;
        }
      }

      return { presenterName, presenterImage, showName, showTime } as LiveOnAir;
    },
    refetchInterval,
  });
}
