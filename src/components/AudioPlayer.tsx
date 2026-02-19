import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Radio, Loader2, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useStreamUrl } from "@/hooks/useStreamUrl";
import { useLiveOnAir } from "@/hooks/useLiveOnAir";
import { useSiteSettings } from "@/hooks/useSiteData";

interface AudioPlayerProps {
  streamUrl?: string;
  size?: "compact" | "large";
  showNowPlaying?: boolean;
  className?: string;
}

export function AudioPlayer({ streamUrl: propStreamUrl, size = "compact", showNowPlaying = true, className }: AudioPlayerProps) {
  const { data: dbStreamUrl } = useStreamUrl();
  const { data: settings } = useSiteSettings();
  const getSetting = (key: string) => settings?.find(s => s.setting_key === key)?.setting_value || "";
  const radiocoUrl = getSetting("radioco_stream_url");
  const streamUrl = propStreamUrl || radiocoUrl || dbStreamUrl || "";
  const logoUrl = getSetting("logo_url");
  const { data: liveOnAir } = useLiveOnAir();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState([100]);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
  }, [volume, isMuted]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (!streamUrl) { setError("Stream not available."); return; }
    setError(null);
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else {
      setIsLoading(true);
      try { await audioRef.current.play(); setIsPlaying(true); }
      catch { setError("Unable to play."); }
      finally { setIsLoading(false); }
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const handleVolumeChange = (v: number[]) => { setVolume(v); if (v[0] > 0 && isMuted) setIsMuted(false); };

  if (size === "large") {
    return (
      <div className={cn("relative w-full max-w-2xl mx-auto", className)}>
        <audio ref={audioRef} src={streamUrl} preload="none" />
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <div className={cn("absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/5 transition-all duration-1000", isPlaying && "from-primary/20 via-secondary/10 to-primary/10")} />
            <div className="absolute inset-0 glass-dark rounded-3xl flex flex-col items-center justify-center p-6">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

              {/* Live Badge */}
              <div className="mb-4">
                <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-500",
                  isPlaying ? "bg-primary/20 border-primary/40 glow-gold-sm" : "bg-white/5 border-white/10"
                )}>
                  <span className={cn("w-2 h-2 rounded-full", isPlaying ? "bg-red-500 animate-pulse" : "bg-white/30")} />
                  <span className={cn("text-xs font-bold uppercase tracking-widest", isPlaying ? "text-primary" : "text-white/40")}>
                    {isPlaying ? "On Air" : "Off Air"}
                  </span>
                </div>
              </div>

              {/* Dial with logo fallback */}
              <div className="mb-4">
                <div className={cn("relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-700", isPlaying && "glow-gold")}>
                  <div className={cn("absolute inset-0 rounded-full border-2 border-dashed transition-all duration-500", isPlaying ? "border-primary/50 animate-[spin_8s_linear_infinite]" : "border-white/10")} />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/10 via-secondary/30 to-primary/5 border border-white/10" />
                  {liveOnAir?.presenterImage && isPlaying ? (
                    <img src={liveOnAir.presenterImage} alt="" className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover border-2 border-primary/50" />
                  ) : logoUrl ? (
                    <img src={logoUrl} alt="" className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover border-2 border-white/20" />
                  ) : (
                    <Radio className={cn("relative w-10 h-10", isPlaying ? "text-primary" : "text-white/20")} />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="text-center mb-3 space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-white font-display">{liveOnAir?.showName || "Live Radio"}</h2>
                {liveOnAir?.presenterName && <p className="text-sm text-primary font-medium flex items-center justify-center gap-1.5"><Mic2 className="w-3.5 h-3.5" />{liveOnAir.presenterName}</p>}
                <p className="text-xs text-white/40">{isPlaying ? "Streaming Live" : "Press play"}</p>
              </div>

              {/* Wave */}
              {isPlaying && (
                <div className="flex items-center justify-center gap-1 mb-3">
                  {[...Array(7)].map((_, i) => <div key={i} className="w-1 rounded-full bg-primary animate-sound-wave" style={{ animationDelay: `${i * 0.08}s` }} />)}
                </div>
              )}

              {/* Play */}
              <div className="mb-4">
                <Button onClick={togglePlay} size="lg" className={cn("w-16 h-16 sm:w-20 sm:h-20 rounded-full border-0",
                  isPlaying ? "bg-primary/80 hover:bg-primary/90 glow-gold" : "bg-primary/80 hover:bg-primary/90 glow-gold animate-pulse-glow"
                )} disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </Button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-4 w-full max-w-xs px-4 py-2.5 bg-white/5 rounded-2xl border border-white/10">
                <button onClick={toggleMute} className="text-white/50 hover:text-white transition-colors">
                  {isMuted || volume[0] === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <Slider value={isMuted ? [0] : volume} onValueChange={handleVolumeChange} max={100} step={1} className="flex-1" />
                <span className="text-sm text-white/40 w-8 text-right">{isMuted ? 0 : volume[0]}%</span>
              </div>

              {error && <p className="text-center text-red-400 text-sm mt-3">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact
  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative rounded-2xl overflow-hidden glass-dark">
        <div className="relative p-4 flex items-center gap-4">
          <audio ref={audioRef} src={streamUrl} preload="none" />
          <Button onClick={togglePlay} size="icon" className={cn("w-12 h-12 rounded-full flex-shrink-0 border-0 bg-primary/80 hover:bg-primary/90 glow-gold-sm")} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{liveOnAir?.showName || "Live Radio"}</p>
            <p className="text-xs text-white/50 truncate">{isPlaying ? (liveOnAir?.presenterName ? `🎙 ${liveOnAir.presenterName}` : "Now Playing") : "Click to listen"}</p>
          </div>
          {isPlaying && (
            <div className="hidden sm:flex items-center gap-0.5">
              {[...Array(4)].map((_, i) => <div key={i} className="w-0.5 rounded-full bg-primary animate-sound-wave" style={{ animationDelay: `${i * 0.1}s` }} />)}
            </div>
          )}
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={toggleMute} className="text-white/50 hover:text-white transition-colors">
              {isMuted || volume[0] === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <Slider value={isMuted ? [0] : volume} onValueChange={handleVolumeChange} max={100} step={1} className="w-20" />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
