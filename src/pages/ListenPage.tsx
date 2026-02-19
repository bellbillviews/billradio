import { Link } from "react-router-dom";
import { Share2, Facebook, Twitter, MessageCircle, Copy, Check, Headphones, Tv, Radio, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { StickyPlayer } from "@/components/StickyPlayer";
import { DynamicSocialLinks } from "@/components/DynamicSocialLinks";
import { ListenerRequestForm } from "@/components/ListenerRequestForm";
import { PageAds } from "@/components/ads/PageAds";
import { useSiteSettings } from "@/hooks/useSiteData";
import { useBroadcastSettings } from "@/hooks/useBroadcastSettings";
import { useBroadcastQueue } from "@/hooks/useBroadcastQueue";
import { useCurrentScheduledMedia } from "@/hooks/useScheduledMedia";
import { useListenerTracking } from "@/hooks/useListenerAnalytics";
import { cn } from "@/lib/utils";

export default function ListenPage() {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"audio" | "video">("audio");
  const { data: settings } = useSiteSettings();
  const { data: broadcast } = useBroadcastSettings();
  const { data: queue } = useBroadcastQueue("broadcast");
  const { data: scheduledMedia } = useCurrentScheduledMedia();
  const [isPlaying, setIsPlaying] = useState(false);

  // Track listener sessions
  useListenerTracking(isPlaying, mode);
  const getSetting = (key: string) => settings?.find(s => s.setting_key === key)?.setting_value || "";
  const stationName = getSetting("station_name") || "Bellbill Radio";
  const logoUrl = getSetting("logo_url");
  const listenBg = getSetting("bg_image_listen") || "/images/bg-listen.jpg";
  const requestBg = getSetting("bg_image_section_request");
  const aboutBroadcastBg = getSetting("bg_image_section_about_broadcast");

  // Radio.co settings
  const radiocoStreamUrl = getSetting("radioco_stream_url");
  const radiocoPlayerEmbed = getSetting("radioco_player_embed");
  const radiocoEnabled = getSetting("radioco_enabled") === "true";

  // YouTube Live
  const isYouTubeLive = broadcast?.broadcastEnabled && broadcast?.youtubeVideoId;

  // Queue repeat
  const queueRepeatAll = getSetting("queue_repeat_all") !== "false";

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `🎧 Tune in to ${stationName} Live!`;

  const copyToClipboard = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const shareLinks = [
    { name: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}` },
    { name: "Twitter", icon: Twitter, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
    { name: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
  ];

  // Determine fallback state
  const audioLive = radiocoEnabled && !!radiocoStreamUrl;
  const videoLive = !!isYouTubeLive;
  const activeQueue = queue?.filter(q => q.is_active) || [];
  const audioQueue = activeQueue.filter(q => q.file_type === "audio");
  const videoQueue = activeQueue.filter(q => q.file_type === "video");

  // Check if scheduled media should override
  const hasScheduledMedia = scheduledMedia && scheduledMedia.file_url;
  const scheduledMatchesMode = hasScheduledMedia && scheduledMedia.file_type === mode;

  const showFallback = !scheduledMatchesMode && ((mode === "audio" && !audioLive) || (mode === "video" && !videoLive));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-24 md:pb-0">
        <div className="absolute inset-0 z-0">
          <img src={listenBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center animate-fade-in">
              <p className="text-sm text-primary font-bold uppercase tracking-[0.2em] mb-4">Welcome to</p>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4">
                <span className="text-gold-shimmer">{stationName}</span> <span className="text-white">Live</span>
              </h1>
              <p className="text-lg text-white/60 max-w-md mx-auto">
                Experience the rhythm of Nigeria. Stream our live broadcast 24/7.
              </p>
            </div>

            {/* Audio / Video Toggle */}
            <div className="flex justify-center animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <div className="inline-flex items-center gap-1 p-1.5 glass-dark rounded-full">
                <button
                  onClick={() => setMode("audio")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                    mode === "audio" ? "bg-primary text-primary-foreground glow-gold-sm" : "text-white/50 hover:text-white"
                  }`}
                >
                  <Headphones className="w-4 h-4" />Audio
                </button>
                <button
                  onClick={() => setMode("video")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                    mode === "video" ? "bg-primary text-primary-foreground glow-gold-sm" : "text-white/50 hover:text-white"
                  }`}
                >
                  <Tv className="w-4 h-4" />Video
                </button>
              </div>
            </div>

            {/* Player */}
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              {scheduledMatchesMode ? (
                /* SCHEDULED MEDIA: Override everything */
                <ScheduledPlayer media={scheduledMedia!} mode={mode} logoUrl={logoUrl} onPlayChange={setIsPlaying} />
              ) : showFallback ? (
                /* FALLBACK: Autoplay queue inline */
                <FallbackPlayer
                  items={mode === "audio" ? audioQueue : videoQueue}
                  mode={mode}
                  logoUrl={logoUrl}
                  loop={queueRepeatAll}
                  onPlayChange={setIsPlaying}
                />
              ) : mode === "video" ? (
                /* VIDEO MODE: YouTube Live only — straightforward */
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${extractVideoId(broadcast?.youtubeVideoId || "")}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                    className="absolute inset-0 w-full h-full rounded-3xl"
                    title="YouTube Live"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    frameBorder="0"
                    onLoad={() => setIsPlaying(true)}
                  />
                </div>
              ) : (
                /* AUDIO MODE: Radio.co stream only */
                <RadioCoPlayer streamUrl={radiocoStreamUrl} playerEmbed={radiocoPlayerEmbed} logoUrl={logoUrl} stationName={stationName} onPlayChange={setIsPlaying} />
              )}
            </div>

            {/* Share */}
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <p className="text-sm text-white/40 mb-4 flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />Share with friends
              </p>
              <div className="flex items-center justify-center gap-3">
                {shareLinks.map((link) => (
                  <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer"
                    className="p-3 rounded-full glass-dark text-white/50 hover:text-primary transition-all duration-300"
                    aria-label={`Share on ${link.name}`}>
                    <link.icon className="w-5 h-5" />
                  </a>
                ))}
                <button onClick={copyToClipboard}
                  className={`p-3 rounded-full glass-dark transition-all duration-300 ${copied ? "text-primary glow-gold-sm" : "text-white/50 hover:text-white"}`}
                  aria-label="Copy link">
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Button asChild variant="outline" className="glass-dark text-white border-white/20 hover:bg-white/10 rounded-full">
                <Link to="/shows">View Our Shows</Link>
              </Button>
            </div>

            <div className="flex justify-center animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <DynamicSocialLinks iconSize="md" />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6"><PageAds placement="listen" maxAds={2} /></div>

      {/* Song Request */}
      <section className={cn("py-16 section-bg", !requestBg && "bg-secondary/5")}>
        {requestBg && <div className="section-bg-img"><img src={requestBg} alt="" /><div className="absolute inset-0 hero-overlay" /></div>}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl mx-auto"><ListenerRequestForm /></div>
        </div>
      </section>

      <section className={cn("py-16 section-bg", !aboutBroadcastBg && "")}>
        {aboutBroadcastBg && <div className="section-bg-img"><img src={aboutBroadcastBg} alt="" /><div className="absolute inset-0 hero-overlay" /></div>}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-display">
              About Our <span className="text-gold-shimmer">Broadcast</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {stationName} is Nigeria's premier digital radio station, broadcasting 24/7 from the heart of Lagos.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you're in Lagos, London, or Los Angeles, tune in and feel the vibe.
            </p>
          </div>
        </div>
      </section>

      <Footer />
      <StickyPlayer />
    </div>
  );
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

/* Radio.co Player — 16:9 responsive with logo fallback */
function RadioCoPlayer({ streamUrl, playerEmbed, logoUrl, stationName, onPlayChange }: { streamUrl: string; playerEmbed?: string; logoUrl?: string; stationName: string; onPlayChange?: (p: boolean) => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const togglePlay = async () => {
    if (!audioRef.current || !streamUrl) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); onPlayChange?.(false); }
    else {
      setIsLoading(true);
      try { await audioRef.current.play(); setIsPlaying(true); onPlayChange?.(true); }
      catch { }
      finally { setIsLoading(false); }
    }
  };

  return (
    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
      <audio ref={audioRef} src={streamUrl} preload="none" />
      <div className="absolute inset-0 rounded-3xl overflow-hidden glass-dark flex flex-col items-center justify-center p-6">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(210_20%_90%)] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(210_15%_80%/0.3)] to-transparent" />

        <div className="mb-4">
          <div className={cn("relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-700", isPlaying && "glow-gold")}>
            <div className={cn("absolute inset-0 rounded-full border-2 border-dashed transition-all duration-500", isPlaying ? "border-primary/50 animate-[spin_8s_linear_infinite]" : "border-white/10")} />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/10 via-secondary/30 to-primary/5 border border-white/10" />
            {logoUrl ? (
              <img src={logoUrl} alt="" className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white/20" />
            ) : (
              <Radio className={cn("relative w-10 h-10", isPlaying ? "text-primary" : "text-white/20")} />
            )}
          </div>
        </div>

        <div className="text-center mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-white font-display">{stationName}</h2>
          <p className="text-xs text-white/40">{isPlaying ? "🔴 Streaming Live" : "Press play to listen"}</p>
        </div>

        {isPlaying && (
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(7)].map((_, i) => <div key={i} className="w-1 rounded-full bg-primary animate-sound-wave" style={{ animationDelay: `${i * 0.08}s` }} />)}
          </div>
        )}

        <div className="mb-4">
          <Button onClick={togglePlay} size="lg" className={cn("w-16 h-16 sm:w-20 sm:h-20 rounded-full border-0",
            isPlaying ? "bg-primary/80 hover:bg-primary/90 glow-gold" : "bg-primary/80 hover:bg-primary/90 glow-gold animate-pulse-glow"
          )} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : isPlaying ? (
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current ml-1"><path d="M8 5.14v14l11-7-11-7z" /></svg>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-3 w-full max-w-xs px-4 py-2.5 bg-white/5 rounded-2xl border border-white/10">
          <input type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="flex-1 accent-[hsl(43_96%_56%)]" />
          <span className="text-xs text-white/40 w-8 text-right">{volume}%</span>
        </div>
      </div>
    </div>
  );
}

/* Fallback Player — autoplay queue items inline, no titles displayed, 16:9, loop */
function FallbackPlayer({ items, mode, logoUrl, loop, onPlayChange }: { items: { id: string; title: string; file_url: string | null; file_type: string }[]; mode: "audio" | "video"; logoUrl?: string; loop: boolean; onPlayChange?: (p: boolean) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const playableItems = items.filter(i => i.file_url);

  const handleEnded = useCallback(() => {
    if (playableItems.length === 0) return;
    const next = currentIndex + 1;
    if (next < playableItems.length) setCurrentIndex(next);
    else if (loop) setCurrentIndex(0);
  }, [currentIndex, playableItems.length, loop]);

  useEffect(() => {
    if (playableItems.length === 0) return;
    const el = mode === "video" ? videoRef.current : audioRef.current;
    if (el) {
      el.src = playableItems[currentIndex]?.file_url || "";
      el.play().then(() => onPlayChange?.(true)).catch(() => {});
    }
  }, [currentIndex, playableItems, mode]);

  if (playableItems.length === 0) {
    return (
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <div className="absolute inset-0 rounded-3xl glass-dark flex flex-col items-center justify-center">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(210_20%_90%/0.3)] to-transparent" />
          {logoUrl ? <img src={logoUrl} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-white/10 mb-4" /> : <Radio className="w-12 h-12 text-white/20 mb-4" />}
          <p className="text-white/40 text-sm">Station is currently offline. Check back soon!</p>
        </div>
      </div>
    );
  }

  if (mode === "video") {
    return (
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <video ref={videoRef} className="absolute inset-0 w-full h-full rounded-3xl object-cover bg-black" autoPlay onEnded={handleEnded} playsInline />
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
      <audio ref={audioRef} autoPlay onEnded={handleEnded} />
      <div className="absolute inset-0 rounded-3xl glass-dark flex flex-col items-center justify-center">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(210_20%_90%/0.3)] to-transparent" />
        {logoUrl ? <img src={logoUrl} alt="" className="w-24 h-24 rounded-full object-cover border-2 border-white/10 mb-4 glow-silver" /> : <Radio className="w-16 h-16 text-primary/40 mb-4" />}
        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, i) => <div key={i} className="w-1 rounded-full bg-primary animate-sound-wave" style={{ animationDelay: `${i * 0.1}s` }} />)}
        </div>
      </div>
    </div>
  );
}

/* Scheduled Media Player — plays admin-scheduled content at specific times */
function ScheduledPlayer({ media, mode, logoUrl, onPlayChange }: { media: { file_url: string | null; file_type: string; title: string }; mode: "audio" | "video"; logoUrl?: string; onPlayChange?: (p: boolean) => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = media.file_type === "video" ? videoRef.current : audioRef.current;
    if (el && media.file_url) {
      el.src = media.file_url;
      el.play().then(() => onPlayChange?.(true)).catch(() => {});
    }
  }, [media.file_url]);

  if (media.file_type === "video") {
    return (
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <video ref={videoRef} className="absolute inset-0 w-full h-full rounded-3xl object-cover bg-black" autoPlay playsInline controls />
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
      <audio ref={audioRef} autoPlay />
      <div className="absolute inset-0 rounded-3xl glass-dark flex flex-col items-center justify-center">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(210_20%_90%/0.3)] to-transparent" />
        {logoUrl ? <img src={logoUrl} alt="" className="w-24 h-24 rounded-full object-cover border-2 border-white/10 mb-4 glow-gold" /> : <Radio className="w-16 h-16 text-primary/40 mb-4" />}
        <div className="flex items-center gap-1 mt-2">
          {[...Array(7)].map((_, i) => <div key={i} className="w-1 rounded-full bg-primary animate-sound-wave" style={{ animationDelay: `${i * 0.08}s` }} />)}
        </div>
      </div>
    </div>
  );
}
