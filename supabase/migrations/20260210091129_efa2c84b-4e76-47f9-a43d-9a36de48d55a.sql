
-- Add site settings for live on air presenter and show
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description)
VALUES 
  ('live_presenter_id', '', 'text', 'Currently live presenter ID'),
  ('live_show_id', '', 'text', 'Currently live show ID')
ON CONFLICT (setting_key) DO NOTHING;

-- Create unique constraint on setting_key if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'site_settings_setting_key_key'
  ) THEN
    ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_setting_key_key UNIQUE (setting_key);
  END IF;
END $$;
