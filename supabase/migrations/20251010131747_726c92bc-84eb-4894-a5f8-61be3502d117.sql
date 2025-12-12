-- Create market listings table
CREATE TABLE IF NOT EXISTS public.market_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  crop TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Market listings policies
  DROP POLICY IF EXISTS "Anyone can view market listings" ON public.market_listings;
  DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.market_listings;
  DROP POLICY IF EXISTS "Users can update their own listings" ON public.market_listings;
  DROP POLICY IF EXISTS "Users can delete their own listings" ON public.market_listings;
  
  -- Advisory logs policies
  DROP POLICY IF EXISTS "Users can view their own advisory logs" ON public.advisory_logs;
  DROP POLICY IF EXISTS "Users can create their own advisory logs" ON public.advisory_logs;
  
  -- Crop diagnostics policies
  DROP POLICY IF EXISTS "Users can view their own diagnostics" ON public.crop_diagnostics;
  DROP POLICY IF EXISTS "Users can create their own diagnostics" ON public.crop_diagnostics;
  
  -- Profiles policies
  DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
END $$;

-- Policies for market listings (public read, authenticated write)
CREATE POLICY "Anyone can view market listings"
  ON public.market_listings
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create listings"
  ON public.market_listings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON public.market_listings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON public.market_listings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create advisory log table
CREATE TABLE IF NOT EXISTS public.advisory_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  diagnosis TEXT NOT NULL,
  advice TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advisory_logs ENABLE ROW LEVEL SECURITY;

-- Policies for advisory logs (users can only see their own)
CREATE POLICY "Users can view their own advisory logs"
  ON public.advisory_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own advisory logs"
  ON public.advisory_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create crop diagnostics table for image-based analysis
CREATE TABLE IF NOT EXISTS public.crop_diagnostics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT,
  diagnosis TEXT,
  advice TEXT,
  confidence NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crop_diagnostics ENABLE ROW LEVEL SECURITY;

-- Policies for crop diagnostics
CREATE POLICY "Users can view their own diagnostics"
  ON public.crop_diagnostics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diagnostics"
  ON public.crop_diagnostics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update and delete their own diagnostics
CREATE POLICY "Users can update their own diagnostics"
  ON public.crop_diagnostics
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diagnostics"
  ON public.crop_diagnostics
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  location TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_market_listings_updated_at ON public.market_listings;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_market_listings_updated_at
  BEFORE UPDATE ON public.market_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, full_name)
  VALUES (gen_random_uuid(), NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for crop images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('crop-images', 'crop-images', true)
ON CONFLICT (id) DO NOTHING;

-- Also create a bucket for crop diagnosis images (separate from crop-images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('crop-diagnosis-images', 'crop-diagnosis-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DO $$ 
BEGIN
  -- Crop images bucket policies
  DROP POLICY IF EXISTS "Users can view crop images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload crop images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own crop images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own crop images" ON storage.objects;
END $$;

-- Storage policies for crop images (general crop images bucket)
CREATE POLICY "Users can view crop images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'crop-images');

CREATE POLICY "Authenticated users can upload crop images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'crop-images' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     (storage.foldername(name))[1] IS NULL)
  );

CREATE POLICY "Users can update their own crop images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'crop-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own crop images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'crop-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for crop diagnosis images
CREATE POLICY "Users can view crop diagnosis images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'crop-diagnosis-images');

CREATE POLICY "Authenticated users can upload crop diagnosis images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'crop-diagnosis-images' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     (storage.foldername(name))[1] IS NULL)
  );

CREATE POLICY "Users can update their own crop diagnosis images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'crop-diagnosis-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own crop diagnosis images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'crop-diagnosis-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_market_listings_user_id ON public.market_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_market_listings_crop ON public.market_listings(crop);
CREATE INDEX IF NOT EXISTS idx_market_listings_created_at ON public.market_listings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_advisory_logs_user_id ON public.advisory_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_advisory_logs_created_at ON public.advisory_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crop_diagnostics_user_id ON public.crop_diagnostics(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_diagnostics_created_at ON public.crop_diagnostics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crop_diagnostics_confidence ON public.crop_diagnostics(confidence DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Add foreign key constraints
ALTER TABLE public.market_listings
ADD CONSTRAINT fk_market_listings_user_id
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

ALTER TABLE public.advisory_logs
ADD CONSTRAINT fk_advisory_logs_user_id
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

ALTER TABLE public.crop_diagnostics
ADD CONSTRAINT fk_crop_diagnostics_user_id
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

ALTER TABLE public.profiles
ADD CONSTRAINT fk_profiles_user_id
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;