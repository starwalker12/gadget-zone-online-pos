-- PROPOSED — NOT APPLIED (For human review / manual application in Supabase dashboard)
-- Migration: Create public.user_ui_preferences table for per-user dashboard and sidebar customization.

CREATE TABLE IF NOT EXISTS public.user_ui_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  dashboard_layout JSONB,
  sidebar_preferences JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_ui_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

CREATE POLICY "Users can select their own UI preferences"
  ON public.user_ui_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own UI preferences"
  ON public.user_ui_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own UI preferences"
  ON public.user_ui_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own UI preferences"
  ON public.user_ui_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at on modifications
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_ui_preferences_updated_at
  BEFORE UPDATE ON public.user_ui_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
