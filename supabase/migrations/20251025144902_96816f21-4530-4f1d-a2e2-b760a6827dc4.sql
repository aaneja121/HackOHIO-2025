-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'patient', 'clinician');

-- Create profiles table for extended user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  surgery_type TEXT,
  surgery_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table (security definer pattern)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create wound_assessments table
CREATE TABLE public.wound_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
  ai_analysis TEXT,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wound_assessments ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clinicians can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for wound_assessments
CREATE POLICY "Patients can view own assessments"
  ON public.wound_assessments FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert own assessments"
  ON public.wound_assessments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Clinicians can view all assessments"
  ON public.wound_assessments FOR SELECT
  USING (public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clinicians can update assessments"
  ON public.wound_assessments FOR UPDATE
  USING (public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for wound images
INSERT INTO storage.buckets (id, name, public)
VALUES ('wound-images', 'wound-images', true);

-- Storage policies for wound images
CREATE POLICY "Patients can upload wound images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'wound-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own wound images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'wound-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Clinicians can view all wound images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'wound-images'
    AND (public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'admin'))
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();