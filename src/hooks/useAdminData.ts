import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Types
export interface Show {
  id: string;
  name: string;
  host: string;
  description: string | null;
  schedule: string | null;
  time: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface BroadcastPlatform {
  id: string;
  name: string;
  platform_type: string;
  embed_code: string | null;
  stream_url: string | null;
  is_active: boolean;
  is_primary: boolean;
}

export interface StreamSetting {
  id: string;
  name: string;
  stream_type: string;
  stream_url: string | null;
  stream_key: string | null;
  rtmp_url: string | null;
  is_active: boolean;
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

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  image_url: string | null;
  is_active: boolean;
}

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string | null;
  description: string | null;
}

// Shows hooks
export function useShows(refetchInterval = 5000) {
  return useQuery({
    queryKey: ["shows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shows")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Show[];
    },
    refetchInterval,
  });
}

export function useCreateShow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (show: Omit<Show, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("shows").insert(show).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shows"] }),
  });
}

export function useUpdateShow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...show }: Partial<Show> & { id: string }) => {
      const { data, error } = await supabase.from("shows").update(show).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shows"] }),
  });
}

export function useDeleteShow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shows").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shows"] }),
  });
}

// Social Links hooks
export function useSocialLinks(refetchInterval = 5000) {
  return useQuery({
    queryKey: ["social_links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as SocialLink[];
    },
    refetchInterval,
  });
}

export function useUpdateSocialLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...link }: Partial<SocialLink> & { id: string }) => {
      const { data, error } = await supabase.from("social_links").update(link).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social_links"] }),
  });
}

// Broadcast Platforms hooks
export function useBroadcastPlatforms(refetchInterval = 5000) {
  return useQuery({
    queryKey: ["broadcast_platforms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("broadcast_platforms").select("*");
      if (error) throw error;
      return data as BroadcastPlatform[];
    },
    refetchInterval,
  });
}

export function useCreateBroadcastPlatform() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (platform: Omit<BroadcastPlatform, "id">) => {
      const { data, error } = await supabase.from("broadcast_platforms").insert(platform).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["broadcast_platforms"] }),
  });
}

export function useUpdateBroadcastPlatform() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...platform }: Partial<BroadcastPlatform> & { id: string }) => {
      const { data, error } = await supabase.from("broadcast_platforms").update(platform).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["broadcast_platforms"] }),
  });
}

export function useDeleteBroadcastPlatform() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("broadcast_platforms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["broadcast_platforms"] }),
  });
}

// Stream Settings hooks
export function useStreamSettings(refetchInterval = 5000) {
  return useQuery({
    queryKey: ["stream_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stream_settings").select("*");
      if (error) throw error;
      return data as StreamSetting[];
    },
    refetchInterval,
  });
}

export function useCreateStreamSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (setting: Omit<StreamSetting, "id">) => {
      const { data, error } = await supabase.from("stream_settings").insert(setting).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stream_settings"] }),
  });
}

export function useUpdateStreamSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...setting }: Partial<StreamSetting> & { id: string }) => {
      const { data, error } = await supabase.from("stream_settings").update(setting).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stream_settings"] }),
  });
}

export function useDeleteStreamSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("stream_settings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stream_settings"] }),
  });
}

// Presenters hooks
export function usePresenters(refetchInterval = 5000) {
  return useQuery({
    queryKey: ["presenters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("presenters")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Presenter[];
    },
    refetchInterval,
  });
}

export function useCreatePresenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (presenter: Omit<Presenter, "id">) => {
      const { data, error } = await supabase.from("presenters").insert(presenter).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["presenters"] }),
  });
}

export function useUpdatePresenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...presenter }: Partial<Presenter> & { id: string }) => {
      const { data, error } = await supabase.from("presenters").update(presenter).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["presenters"] }),
  });
}

export function useDeletePresenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("presenters").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["presenters"] }),
  });
}

// Events hooks
export function useEvents(refetchInterval = 5000) {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data as Event[];
    },
    refetchInterval,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event: Omit<Event, "id">) => {
      const { data, error } = await supabase.from("events").insert(event).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...event }: Partial<Event> & { id: string }) => {
      const { data, error } = await supabase.from("events").update(event).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

// Site Settings hooks
export function useSiteSettings(refetchInterval = 5000) {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      return data as SiteSetting[];
    },
    refetchInterval,
  });
}

export function useUpdateSiteSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, setting_value }: { id: string; setting_value: string }) => {
      const { data, error } = await supabase
        .from("site_settings")
        .update({ setting_value })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["site_settings"] }),
  });
}

// Helper to get setting by key
export function useSetting(key: string) {
  const { data: settings } = useSiteSettings();
  return settings?.find((s) => s.setting_key === key)?.setting_value || "";
}
