import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ScheduledMedia {
  id: string;
  title: string;
  file_url: string | null;
  file_type: string;
  scheduled_start: string;
  scheduled_end: string | null;
  is_active: boolean;
  repeat_mode: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useScheduledMedia(refetchInterval = 5000) {
  return useQuery({
    queryKey: ["scheduled_media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_media")
        .select("*")
        .order("scheduled_start", { ascending: true });
      if (error) throw error;
      return data as ScheduledMedia[];
    },
    refetchInterval,
  });
}

export function useCurrentScheduledMedia() {
  return useQuery({
    queryKey: ["scheduled_media_current"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("scheduled_media")
        .select("*")
        .eq("is_active", true)
        .lte("scheduled_start", now)
        .or(`scheduled_end.is.null,scheduled_end.gte.${now}`)
        .order("scheduled_start", { ascending: false })
        .limit(1);
      if (error) throw error;
      return (data?.[0] as ScheduledMedia) || null;
    },
    refetchInterval: 10000,
  });
}

export function useCreateScheduledMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<ScheduledMedia, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("scheduled_media").insert(item).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduled_media"] }),
  });
}

export function useUpdateScheduledMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<ScheduledMedia> & { id: string }) => {
      const { data, error } = await supabase.from("scheduled_media").update(item).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduled_media"] }),
  });
}

export function useDeleteScheduledMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("scheduled_media").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduled_media"] }),
  });
}
