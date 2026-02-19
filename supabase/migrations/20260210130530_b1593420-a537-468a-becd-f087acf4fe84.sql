
-- Broadcast queue for local files and playlist items
CREATE TABLE public.broadcast_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT NOT NULL DEFAULT 'audio', -- audio or video
  queue_type TEXT NOT NULL DEFAULT 'broadcast', -- broadcast or stream
  duration_seconds INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.broadcast_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage broadcast queue"
ON public.broadcast_queue FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active broadcast queue items"
ON public.broadcast_queue FOR SELECT
USING (is_active = true);

CREATE TRIGGER update_broadcast_queue_updated_at
BEFORE UPDATE ON public.broadcast_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default broadcast settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description) VALUES
  ('youtube_live_video_id', '', 'text', 'YouTube Live Video ID or full embed URL'),
  ('broadcast_enabled', 'false', 'boolean', 'Enable/disable live broadcast'),
  ('broadcast_autoplay', 'false', 'boolean', 'Auto-play the broadcast when page loads'),
  ('broadcast_offline_message', 'We are currently offline. Check back soon for our next live broadcast!', 'text', 'Message shown when broadcast is offline'),
  ('youtube_playlist_url', '', 'text', 'YouTube playlist URL for scheduled playback')
ON CONFLICT (setting_key) DO NOTHING;
