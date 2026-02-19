import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, X, Radio, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLiveOnAir } from "@/hooks/useLiveOnAir";
import { useSiteSettings } from "@/hooks/useSiteData";

interface StickyPlayerProps {
  streamUrl?: string;
  isVisible?: boolean;
  onClose?: () => void;
}

export function StickyPlayer({ streamUrl: propStreamUrl, isVisible = true, onClose }: StickyPlayerProps) {
  const { data: settings } = useSiteSettings();
  const getSetting = (key: string) => settings?.find(s => s.setting_key === key)?.setting_value || "";
  const radiocoUrl = getSetting("radioco_stream_url");
  const streamUrl = propStreamUrl || radiocoUrl || "";
  const { data: liveOnAir } = useLiveOnAir();
  const logoUrl = getSetting("logo_url");

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 1;
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (!streamUrl) { setError("Stream coming soon!"); return; }
    setError(null);
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else {
      setIsLoading(true);
      try { await audioRef.current.play(); setIsPlaying(true); }
      catch (err) { setError("Unable to play"); console.error(err); }
      finally { setIsLoading(false); }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="glass-dark safe-area-bottom">
        <audio ref={audioRef} src={streamUrl} preload="none" />
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="relative flex-shrink-0">
            {isPlaying && <div className="absolute -inset-1 rounded-full bg-primary/30 blur-md animate-pulse" />}
            <div className="relative w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
              {liveOnAir?.presenterImage ? (
                <img src={liveOnAir.presenterImage} alt="" className="w-full h-full object-cover" />
              ) : logoUrl ? (
                <img src={logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <Radio className="w-5 h-5 text-primary" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{liveOnAir?.showName || "Live Radio"}</p>
            <p className="text-xs text-white/50 truncate">
              {error || (isPlaying ? (liveOnAir?.presenterName ? `🎙 ${liveOnAir.presenterName}` : "Live Now") : "Tap to listen")}
            </p>
          </div>

          {isPlaying && (
            <div className="flex items-center gap-0.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-0.5 rounded-full bg-primary animate-sound-wave" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          )}

          <button onClick={toggleMute} className="p-2 text-white/60 hover:text-white transition-colors">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <Button
            onClick={togglePlay}
            size="icon"
            className="w-10 h-10 rounded-full border-0 bg-primary hover:bg-primary/90 glow-gold-sm"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>

          {onClose && (
            <button onClick={onClose} className="p-1 text-white/40 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
