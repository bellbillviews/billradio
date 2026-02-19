import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BroadcastQueueItem {
  id: string;
  title: string;
  file_url: string | null;
  file_type: string;
  queue_type: string;
  duration_seconds: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useBroadcastQueue(queueType: "broadcast" | "stream" = "broadcast", refetchInterval = 5000) {
  return useQuery({
    queryKey: ["broadcast_queue", queueType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("broadcast_queue")
        .select("*")
        .eq("queue_type", queueType)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as BroadcastQueueItem[];
    },
    refetchInterval,
  });
}

export function useCreateQueueItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<BroadcastQueueItem, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("broadcast_queue").insert(item).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["broadcast_queue"] }),
  });
}

export function useUpdateQueueItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<BroadcastQueueItem> & { id: string }) => {
      const { data, error } = await supabase.from("broadcast_queue").update(item).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["broadcast_queue"] }),
  });
}

export function useDeleteQueueItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("broadcast_queue").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["broadcast_queue"] }),
  });
}

export function useReorderQueue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; sort_order: number }[]) => {
      for (const item of items) {
        const { error } = await supabase
          .from("broadcast_queue")
          .update({ sort_order: item.sort_order })
          .eq("id", item.id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["broadcast_queue"] }),
  });
}
