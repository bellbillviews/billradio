import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";

export interface ListenerSession {
  id: string;
  session_id: string;
  started_at: string;
  last_heartbeat: string;
  ended_at: string | null;
  duration_seconds: number;
  user_agent: string | null;
  country: string | null;
  city: string | null;
  device_type: string | null;
  listening_mode: string;
}

// Admin: get current listeners (heartbeat within last 2 min)
export function useCurrentListeners(refetchInterval = 10000) {
  return useQuery({
    queryKey: ["current_listeners"],
    queryFn: async () => {
      const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const { data, error, count } = await supabase
        .from("listener_sessions")
        .select("*", { count: "exact" })
        .gte("last_heartbeat", twoMinAgo)
        .is("ended_at", null);
      if (error) throw error;
      return { sessions: data as ListenerSession[], count: count || 0 };
    },
    refetchInterval,
  });
}

// Admin: get all sessions for analytics
export function useListenerHistory(days = 30) {
  return useQuery({
    queryKey: ["listener_history", days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("listener_sessions")
        .select("*")
        .gte("started_at", since)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data as ListenerSession[];
    },
  });
}

// Frontend: track listener session
export function useListenerTracking(isPlaying: boolean, mode: "audio" | "video") {
  const sessionIdRef = useRef<string>("");
  const dbIdRef = useRef<string>("");

  useEffect(() => {
    if (!isPlaying) return;

    const sessionId = `ls_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    sessionIdRef.current = sessionId;

    const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";

    // Create session
    supabase
      .from("listener_sessions")
      .insert({
        session_id: sessionId,
        user_agent: navigator.userAgent.substring(0, 200),
        device_type: deviceType,
        listening_mode: mode,
      })
      .select("id")
      .single()
      .then(({ data }) => {
        if (data) dbIdRef.current = data.id;
      });

    // Heartbeat every 30s
    const interval = setInterval(() => {
      if (dbIdRef.current) {
        supabase
          .from("listener_sessions")
          .update({ last_heartbeat: new Date().toISOString() })
          .eq("id", dbIdRef.current)
          .then(() => {});
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      if (dbIdRef.current) {
        supabase
          .from("listener_sessions")
          .update({
            ended_at: new Date().toISOString(),
            last_heartbeat: new Date().toISOString(),
          })
          .eq("id", dbIdRef.current)
          .then(() => {});
      }
    };
  }, [isPlaying, mode]);
}
