import { cn } from "@/lib/utils";
import { Radio } from "lucide-react";

interface YouTubeLivePlayerProps {
  videoId: string;
  autoplay?: boolean;
  isLive?: boolean;
  offlineMessage?: string;
  className?: string;
}

function extractVideoId(input: string): string {
  if (!input) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) { const m = input.match(p); if (m) return m[1]; }
  return input.trim();
}

export function YouTubeLivePlayer({ videoId, autoplay = false, isLive = true, offlineMessage = "We are currently offline. Check back soon!", className }: YouTubeLivePlayerProps) {
  const id = extractVideoId(videoId);

  if (!isLive || !id) {
    return (
      <div className={cn("relative w-full", className)} style={{ paddingBottom: "56.25%" }}>
        <div className="absolute inset-0 rounded-3xl glass-dark flex flex-col items-center justify-center">
          <Radio className="w-12 h-12 text-white/20 mb-4" />
          <p className="text-lg font-semibold text-white/80 font-display">Station Offline</p>
          <p className="text-white/40 text-sm max-w-sm text-center">{offlineMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)} style={{ paddingBottom: "56.25%" }}>
      <iframe
        src={`https://www.youtube.com/embed/${id}?autoplay=${autoplay ? "1" : "0"}&rel=0&modestbranding=1&playsinline=1`}
        className="absolute inset-0 w-full h-full rounded-3xl"
        title="YouTube Live"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        frameBorder="0"
      />
    </div>
  );
}
