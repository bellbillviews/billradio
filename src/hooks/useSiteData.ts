import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Presenter {
  id: string;
  name: string;
  bio: string | null;
  image_url: string | null;
  email: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
}

// Fetch social links with auto-refresh
export function useSocialLinks(refetchInterval = 5000) {
  return useQuery({
    queryKey: ["public_social_links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as SocialLink[];
    },
    refetchInterval,
  });
}

// Fetch presenters with auto-refresh
export function usePresenters(refetchInterval = 5000) {
  return useQuery({
    queryKey: ["public_presenters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("presenters")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Presenter[];
    },
    refetchInterval,
  });
}

// Fetch site settings with auto-refresh
export function useSiteSettings(refetchInterval = 5000) {
  return useQuery({
    queryKey: ["public_site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");
      if (error) throw error;
      return data as SiteSetting[];
    },
    refetchInterval,
  });
}

// Helper to get a specific setting value
export function useSettingValue(key: string, refetchInterval = 5000) {
  const { data: settings } = useSiteSettings(refetchInterval);
  return settings?.find((s) => s.setting_key === key)?.setting_value || "";
}
