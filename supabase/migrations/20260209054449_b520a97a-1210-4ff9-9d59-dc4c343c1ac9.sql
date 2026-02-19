-- Add new site settings for content pages and logo
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description) VALUES
  ('footer_logo_url', '', 'image', 'Footer logo URL'),
  ('privacy_policy', '', 'textarea', 'Privacy Policy content (HTML/Markdown)'),
  ('terms_of_service', '', 'textarea', 'Terms of Service content (HTML/Markdown)'),
  ('about_us', '', 'textarea', 'About Us page content (HTML/Markdown)'),
  ('faq_content', '', 'textarea', 'FAQ page content (HTML/Markdown)')
ON CONFLICT (setting_key) DO NOTHING;

-- Create billboard_ads table for paid advertising
CREATE TABLE public.billboard_ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  advertiser_name TEXT NOT NULL,
  advertiser_email TEXT,
  advertiser_phone TEXT,
  ad_type TEXT NOT NULL DEFAULT 'banner', -- banner, sidebar, popup, native
  placement TEXT NOT NULL DEFAULT 'homepage', -- homepage, listen, shows, all
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  is_auto_end BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad tracking table for views, clicks, etc
CREATE TABLE public.ad_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES public.billboard_ads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- view, click, impression
  country TEXT,
  city TEXT,
  device_type TEXT, -- mobile, tablet, desktop
  browser TEXT,
  os TEXT,
  referrer TEXT,
  ip_hash TEXT, -- hashed for privacy
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad network integrations table
CREATE TABLE public.ad_networks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  network_type TEXT NOT NULL, -- adsense, adsterra, propellerads, etc
  publisher_id TEXT,
  slot_ids JSONB DEFAULT '{}', -- store multiple slot IDs for different placements
  is_active BOOLEAN DEFAULT false,
  placement TEXT DEFAULT 'all', -- where to show: homepage, listen, shows, all, sidebar
  priority INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}', -- additional configuration
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.billboard_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_networks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for billboard_ads
CREATE POLICY "Admins can manage billboard ads" 
ON public.billboard_ads 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active billboard ads" 
ON public.billboard_ads 
FOR SELECT 
USING (is_active = true AND (end_date IS NULL OR end_date > now()));

-- RLS Policies for ad_analytics - public can insert (for tracking)
CREATE POLICY "Admins can view all ad analytics" 
ON public.ad_analytics 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can insert ad analytics" 
ON public.ad_analytics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can delete ad analytics" 
ON public.ad_analytics 
FOR DELETE 
USING (is_admin(auth.uid()));

-- RLS Policies for ad_networks
CREATE POLICY "Admins can manage ad networks" 
ON public.ad_networks 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active ad networks" 
ON public.ad_networks 
FOR SELECT 
USING (is_active = true);

-- Create indexes for performance
CREATE INDEX idx_ad_analytics_ad_id ON public.ad_analytics(ad_id);
CREATE INDEX idx_ad_analytics_event_type ON public.ad_analytics(event_type);
CREATE INDEX idx_ad_analytics_created_at ON public.ad_analytics(created_at);
CREATE INDEX idx_billboard_ads_active ON public.billboard_ads(is_active, start_date, end_date);
CREATE INDEX idx_billboard_ads_placement ON public.billboard_ads(placement);

-- Trigger for updated_at
CREATE TRIGGER update_billboard_ads_updated_at
BEFORE UPDATE ON public.billboard_ads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ad_networks_updated_at
BEFORE UPDATE ON public.ad_networks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();