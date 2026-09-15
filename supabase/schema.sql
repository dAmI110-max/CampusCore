-- ==========================================================
-- CAMPUSPLUG PRODUCTION DATABASE & AUTHENTICATION SCHEMA
-- Designed for Supabase PostgreSQL & Row Level Security (RLS)
-- ==========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Connected to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'SELLER', 'ADMIN', 'SUPER_ADMIN', 'USER')),
  seller_status TEXT NOT NULL DEFAULT 'NOT_SELLER' CHECK (seller_status IN ('NOT_SELLER', 'SELLER', 'VERIFIED_SELLER', 'RESTRICTED_SELLER', 'SUSPENDED_SELLER')),
  university_id TEXT DEFAULT 'uni-uniosun',
  university_name TEXT DEFAULT 'Osun State University',
  campus_id TEXT DEFAULT 'campus-osogbo',
  campus_name TEXT DEFAULT 'Osogbo Main Campus',
  faculty_id TEXT,
  faculty_name TEXT,
  department_id TEXT,
  department_name TEXT,
  level TEXT DEFAULT '100L',
  phone TEXT,
  whatsapp TEXT,
  telegram TEXT,
  bio TEXT DEFAULT 'CampusPlug Student',
  show_phone_publicly BOOLEAN DEFAULT TRUE,
  show_department_publicly BOOLEAN DEFAULT TRUE,
  verification_badge TEXT DEFAULT 'unverified' CHECK (verification_badge IN ('unverified', 'verified_student', 'trusted_seller')),
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'restricted', 'banned')),
  seller_onboarding_completed BOOLEAN DEFAULT FALSE,
  seller_bio TEXT,
  rating NUMERIC DEFAULT 5.0,
  total_ratings INTEGER DEFAULT 0,
  total_completed_sales INTEGER DEFAULT 0,
  total_orders_bought INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SELLERS TABLE
CREATE TABLE IF NOT EXISTS public.sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  seller_name TEXT NOT NULL,
  seller_bio TEXT,
  profile_image TEXT,
  phone TEXT,
  whatsapp TEXT,
  faculty TEXT,
  department TEXT,
  campus_id TEXT DEFAULT 'campus-osogbo',
  pickup_locations TEXT[] DEFAULT '{}',
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified_student', 'trusted_seller')),
  seller_status TEXT DEFAULT 'SELLER' CHECK (seller_status IN ('SELLER', 'VERIFIED_SELLER', 'RESTRICTED_SELLER', 'SUSPENDED_SELLER')),
  rating NUMERIC DEFAULT 5.0,
  total_sales INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MARKETPLACE LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_name TEXT NOT NULL,
  seller_avatar TEXT,
  seller_campus TEXT NOT NULL DEFAULT 'Osogbo Main Campus',
  seller_phone TEXT,
  seller_whatsapp TEXT,
  category_id TEXT NOT NULL,
  category_name TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  original_price NUMERIC,
  condition TEXT NOT NULL DEFAULT 'Used' CHECK (condition IN ('New', 'Like New', 'Used', 'Fair', 'Refurbished')),
  campus_id TEXT NOT NULL DEFAULT 'campus-osogbo',
  images TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold', 'paused', 'removed', 'pending')),
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  negotiable BOOLEAN DEFAULT FALSE,
  delivery_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LISTING IMAGES TABLE (Optional for multi-image relational mapping)
CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDERS & ESCROW TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_name TEXT NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  listing_title TEXT NOT NULL,
  listing_image TEXT,
  amount NUMERIC NOT NULL,
  delivery_fee NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'escrow_funded' CHECK (status IN ('pending_payment', 'escrow_funded', 'item_dispatched', 'item_delivered', 'completed', 'disputed', 'cancelled', 'refunded')),
  payment_method TEXT DEFAULT 'paystack',
  payment_reference TEXT,
  pickup_location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reporter_name TEXT,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_name TEXT,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  listing_title TEXT,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolution_notes TEXT
);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_name TEXT NOT NULL,
  admin_email TEXT,
  action TEXT NOT NULL,
  target_id TEXT,
  target_type TEXT NOT NULL DEFAULT 'user' CHECK (target_type IN ('user', 'listing', 'report', 'order', 'finance', 'system')),
  reason TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ADMIN MANAGEMENT TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'SUPER_ADMIN')),
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_by_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (
    auth.uid() = id 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- Sellers Policies
CREATE POLICY "Public can view active sellers" 
  ON public.sellers FOR SELECT USING (true);

CREATE POLICY "Sellers can create their own seller profile" 
  ON public.sellers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can update their own seller profile" 
  ON public.sellers FOR UPDATE USING (auth.uid() = user_id);

-- Listings Policies
CREATE POLICY "Public can view active listings" 
  ON public.listings FOR SELECT USING (
    status = 'active' 
    OR auth.uid() = seller_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

CREATE POLICY "Authenticated sellers can insert listings" 
  ON public.listings FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers and Admins can update listings" 
  ON public.listings FOR UPDATE USING (
    auth.uid() = seller_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

CREATE POLICY "Sellers and Admins can delete listings" 
  ON public.listings FOR DELETE USING (
    auth.uid() = seller_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- Orders Policies
CREATE POLICY "Buyers, sellers, and admins can view orders" 
  ON public.orders FOR SELECT USING (
    auth.uid() = buyer_id 
    OR auth.uid() = seller_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

CREATE POLICY "Buyers can create orders" 
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Involved parties and admins can update orders" 
  ON public.orders FOR UPDATE USING (
    auth.uid() = buyer_id 
    OR auth.uid() = seller_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- Reports Policies
CREATE POLICY "Authenticated users can submit reports" 
  ON public.reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Reporters and Admins can view reports" 
  ON public.reports FOR SELECT USING (
    auth.uid() = reporter_id 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

CREATE POLICY "Admins can update reports" 
  ON public.reports FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- Audit Logs Policies
CREATE POLICY "Admins can view audit logs" 
  ON public.audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

CREATE POLICY "Admins can insert audit logs" 
  ON public.audit_logs FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
  );

-- Admin Users Policies
CREATE POLICY "Admins viewable by authenticated users" 
  ON public.admin_users FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Super Admins can manage admin users"
  ON public.admin_users FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

-- ==========================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ==========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_super_admin BOOLEAN;
  initial_role TEXT;
  user_full_name TEXT;
  user_username TEXT;
BEGIN
  is_super_admin := (NEW.email = 'bhadmusoluwadamilare@gmail.com' OR NEW.email = 'davesbrown88@gmail.com');
  
  IF is_super_admin THEN
    initial_role := 'SUPER_ADMIN';
  ELSE
    initial_role := COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT');
  END IF;

  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  user_username := COALESCE(NEW.raw_user_meta_data->>'username', lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g')));

  INSERT INTO public.profiles (
    id,
    auth_user_id,
    email,
    full_name,
    username,
    avatar_url,
    role,
    seller_status,
    seller_onboarding_completed,
    university_id,
    university_name,
    campus_id,
    campus_name,
    faculty_id,
    faculty_name,
    department_id,
    department_name,
    level,
    phone,
    whatsapp,
    bio,
    verification_badge,
    account_status
  ) VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    user_full_name,
    user_username,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'),
    initial_role,
    CASE WHEN is_super_admin THEN 'VERIFIED_SELLER' ELSE 'NOT_SELLER' END,
    is_super_admin,
    COALESCE(NEW.raw_user_meta_data->>'university_id', 'uni-uniosun'),
    COALESCE(NEW.raw_user_meta_data->>'university_name', 'Osun State University'),
    COALESCE(NEW.raw_user_meta_data->>'campus_id', 'campus-osogbo'),
    COALESCE(NEW.raw_user_meta_data->>'campus_name', 'Osogbo Main Campus'),
    NEW.raw_user_meta_data->>'faculty_id',
    NEW.raw_user_meta_data->>'faculty_name',
    NEW.raw_user_meta_data->>'department_id',
    NEW.raw_user_meta_data->>'department_name',
    COALESCE(NEW.raw_user_meta_data->>'level', '100L'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'whatsapp',
    CASE WHEN is_super_admin THEN 'Founder & Super Administrator of CampusPlug by Ace Tech.' ELSE 'Student at Osun State University.' END,
    CASE WHEN is_super_admin THEN 'trusted_seller' ELSE 'unverified' END,
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  -- If super admin, also record in admin_users
  IF is_super_admin THEN
    INSERT INTO public.admin_users (
      user_id,
      email,
      full_name,
      role,
      status
    ) VALUES (
      NEW.id,
      NEW.email,
      user_full_name,
      'SUPER_ADMIN',
      'active'
    ) ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage Buckets Setup (Avatars & Listings)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true), ('listings', 'listings', true), ('accommodations', 'accommodations', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Public can view avatar images" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Public can view listing images" ON storage.objects FOR SELECT USING (bucket_id = 'listings');
CREATE POLICY "Authenticated users can upload listing images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listings' AND auth.role() = 'authenticated');
