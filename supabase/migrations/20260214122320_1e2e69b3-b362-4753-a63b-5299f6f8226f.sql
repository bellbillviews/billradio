
-- Scheduled media table
CREATE TABLE public.scheduled_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT NOT NULL DEFAULT 'audio',
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  repeat_mode TEXT DEFAULT 'none', -- none, daily, weekly
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scheduled media" ON public.scheduled_media FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view active scheduled media" ON public.scheduled_media FOR SELECT USING (is_active = true);

CREATE TRIGGER update_scheduled_media_updated_at BEFORE UPDATE ON public.scheduled_media
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Listener sessions table for tracking
CREATE TABLE public.listener_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_heartbeat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  listening_mode TEXT DEFAULT 'audio'
);

ALTER TABLE public.listener_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert listener sessions" ON public.listener_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update their own session" ON public.listener_sessions FOR UPDATE USING (true);
CREATE POLICY "Admins can view all listener sessions" ON public.listener_sessions FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete listener sessions" ON public.listener_sessions FOR DELETE USING (is_admin(auth.uid()));
