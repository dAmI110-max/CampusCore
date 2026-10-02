-- ==========================================================
-- CAMPUSCORE PRODUCTION FIXES  (run ONCE in Supabase SQL editor, AFTER schema.sql)
-- Safe to re-run. Fixes: product/hostel visibility, escrow orders,
-- privilege-escalation holes, public data leaks, storage policies.
-- ==========================================================

-- ---------- helper: admin check without RLS recursion ----------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN','SUPER_ADMIN'));
$$;

-- ---------- SECURITY: signup trigger no longer trusts metadata role ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_super_admin BOOLEAN;
  initial_role TEXT;
  user_full_name TEXT;
  user_username TEXT;
BEGIN
  -- Designate Super Admin based on explicit authorized addresses
  is_super_admin := (lower(NEW.email) = 'davesbrown88@gmail.com' OR lower(NEW.email) = 'bhadmusoluwadamilare@gmail.com');
  
  IF is_super_admin THEN
    initial_role := 'SUPER_ADMIN';
  ELSE
    initial_role := 'STUDENT'; -- SECURITY: never trust client-supplied role metadata
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
    NEW.raw_user_meta_data->>'avatar_url',
    initial_role,
    CASE WHEN is_super_admin THEN 'VERIFIED_SELLER' ELSE 'NOT_SELLER' END,
    is_super_admin,
    NEW.raw_user_meta_data->>'university_id',
    NEW.raw_user_meta_data->>'university_name',
    NEW.raw_user_meta_data->>'campus_id',
    NEW.raw_user_meta_data->>'campus_name',
    NEW.raw_user_meta_data->>'faculty_id',
    NEW.raw_user_meta_data->>'faculty_name',
    NEW.raw_user_meta_data->>'department_id',
    NEW.raw_user_meta_data->>'department_name',
    NEW.raw_user_meta_data->>'level',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'whatsapp',
    COALESCE(NEW.raw_user_meta_data->>'bio', CASE WHEN is_super_admin THEN 'CampusCore Super Administrator' ELSE NULL END),
    CASE WHEN is_super_admin THEN 'trusted_seller' ELSE 'unverified' END,
    'active'
  )
  -- DO NOTHING on conflict so existing profile updates and edits are never overwritten
  ON CONFLICT (id) DO NOTHING;

  -- If super admin, record in admin_users if not already present
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ---------- SECURITY: users cannot grant themselves roles/status/ratings ----------
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN RETURN NEW; END IF;  -- service role / admins
  IF TG_OP = 'INSERT' THEN
    NEW.role := 'STUDENT'; NEW.seller_status := 'NOT_SELLER'; NEW.account_status := 'active';
    NEW.verification_badge := 'unverified'; NEW.rating := 5.0; NEW.total_ratings := 0;
    NEW.total_completed_sales := 0; NEW.total_orders_bought := 0; NEW.seller_onboarding_completed := FALSE;
    RETURN NEW;
  END IF;
  NEW.role := OLD.role; NEW.account_status := OLD.account_status; NEW.verification_badge := OLD.verification_badge;
  NEW.email := OLD.email; NEW.rating := OLD.rating; NEW.total_ratings := OLD.total_ratings;
  NEW.total_completed_sales := OLD.total_completed_sales; NEW.total_orders_bought := OLD.total_orders_bought;
  -- the only self-service seller transition: NOT_SELLER -> SELLER (onboarding)
  IF NEW.seller_status IS DISTINCT FROM OLD.seller_status
     AND NOT (OLD.seller_status = 'NOT_SELLER' AND NEW.seller_status = 'SELLER') THEN
    NEW.seller_status := OLD.seller_status;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS protect_profile_columns_trg ON public.profiles;
CREATE TRIGGER protect_profile_columns_trg BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();

-- ---------- SECURITY: profiles held emails/phones publicly. Lock down, expose safe view ----------
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile, admins view all" ON public.profiles;
CREATE POLICY "Users can view own profile, admins view all" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT id, full_name, username, avatar_url, campus_name, verification_badge, seller_status, rating, total_ratings, total_completed_sales
  FROM public.profiles WHERE account_status = 'active';
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- username-login helper (replaces the anonymous SELECT on profiles; returns one email, never a list)
CREATE OR REPLACE FUNCTION public.resolve_login_email(p_username TEXT)
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT email FROM public.profiles WHERE username = lower(trim(p_username)) AND account_status = 'active' LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.resolve_login_email(TEXT) TO anon, authenticated;

-- ---------- LISTINGS: only active sellers can post; seller_id can't be hijacked ----------
DROP POLICY IF EXISTS "Public can view active listings" ON public.listings;
CREATE POLICY "Public can view active listings" ON public.listings
  FOR SELECT USING (status = 'active' OR auth.uid() = seller_id OR public.is_admin());
DROP POLICY IF EXISTS "Authenticated sellers can insert listings" ON public.listings;
CREATE POLICY "Authenticated sellers can insert listings" ON public.listings
  FOR INSERT WITH CHECK (
    auth.uid() = seller_id AND EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.account_status = 'active'
      AND (p.seller_status IN ('SELLER','VERIFIED_SELLER') OR p.role IN ('ADMIN','SUPER_ADMIN'))));
DROP POLICY IF EXISTS "Sellers and Admins can update listings" ON public.listings;
CREATE POLICY "Sellers and Admins can update listings" ON public.listings
  FOR UPDATE USING (auth.uid() = seller_id OR public.is_admin())
  WITH CHECK (auth.uid() = seller_id OR public.is_admin());
DROP POLICY IF EXISTS "Sellers and Admins can delete listings" ON public.listings;
CREATE POLICY "Sellers and Admins can delete listings" ON public.listings
  FOR DELETE USING (auth.uid() = seller_id OR public.is_admin());
CREATE INDEX IF NOT EXISTS listings_status_created_idx ON public.listings (status, created_at DESC);

-- A seller must not be able to pause/re-list/sell-out an item that a buyer has already paid for
CREATE OR REPLACE FUNCTION public.guard_listing_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN RETURN NEW; END IF;
  IF NEW.status IS DISTINCT FROM OLD.status AND EXISTS (
    SELECT 1 FROM public.orders o WHERE o.listing_id = OLD.id AND o.status IN ('escrow_funded','item_delivered','disputed')
  ) THEN
    RAISE EXCEPTION 'This item has a paid order in progress and cannot be changed.';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_listing_status_trg ON public.listings;
CREATE TRIGGER guard_listing_status_trg BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.guard_listing_status();

-- ---------- ACCOMMODATIONS (hostel agents) : previously NO table, so posts never left the browser ----------
CREATE TABLE IF NOT EXISTS public.accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  owner_name TEXT NOT NULL, owner_avatar TEXT, owner_phone TEXT, owner_whatsapp TEXT,
  title TEXT NOT NULL, description TEXT NOT NULL, location TEXT NOT NULL, distance_to_campus TEXT,
  campus_id TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  rental_period TEXT NOT NULL DEFAULT 'Per Session', room_type TEXT NOT NULL DEFAULT 'Self-contain',
  available BOOLEAN NOT NULL DEFAULT TRUE, verified_lodge BOOLEAN NOT NULL DEFAULT FALSE, featured BOOLEAN NOT NULL DEFAULT FALSE,
  images TEXT[] NOT NULL DEFAULT '{}', amenities TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','occupied','paused','removed')),
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "accom_select" ON public.accommodations;
CREATE POLICY "accom_select" ON public.accommodations FOR SELECT
  USING (status IN ('active','occupied') OR auth.uid() = owner_id OR public.is_admin());
DROP POLICY IF EXISTS "accom_insert" ON public.accommodations;
CREATE POLICY "accom_insert" ON public.accommodations FOR INSERT WITH CHECK (
  auth.uid() = owner_id AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.account_status = 'active'));
DROP POLICY IF EXISTS "accom_update" ON public.accommodations;
CREATE POLICY "accom_update" ON public.accommodations FOR UPDATE
  USING (auth.uid() = owner_id OR public.is_admin()) WITH CHECK (auth.uid() = owner_id OR public.is_admin());
DROP POLICY IF EXISTS "accom_delete" ON public.accommodations;
CREATE POLICY "accom_delete" ON public.accommodations FOR DELETE USING (auth.uid() = owner_id OR public.is_admin());
CREATE INDEX IF NOT EXISTS accommodations_status_created_idx ON public.accommodations (status, created_at DESC);

CREATE OR REPLACE FUNCTION public.protect_accommodation_flags()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN NEW.verified_lodge := FALSE; NEW.featured := FALSE;
  ELSE NEW.verified_lodge := OLD.verified_lodge; NEW.featured := OLD.featured; NEW.owner_id := OLD.owner_id; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS protect_accommodation_flags_trg ON public.accommodations;
CREATE TRIGGER protect_accommodation_flags_trg BEFORE INSERT OR UPDATE ON public.accommodations
  FOR EACH ROW EXECUTE FUNCTION public.protect_accommodation_flags();

-- ---------- ORDERS: server-only writes (Paystack-verified). Clients may only READ their own ----------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_campus TEXT, ADD COLUMN IF NOT EXISTS delivery_location TEXT, ADD COLUMN IF NOT EXISTS delivery_notes TEXT,
  ADD COLUMN IF NOT EXISTS platform_fee NUMERIC NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS seller_receives NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS escrow_status TEXT NOT NULL DEFAULT 'held',
  ADD COLUMN IF NOT EXISTS buyer_avatar TEXT, ADD COLUMN IF NOT EXISTS buyer_campus TEXT,
  ADD COLUMN IF NOT EXISTS seller_avatar TEXT, ADD COLUMN IF NOT EXISTS seller_campus TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ, ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payout_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'pending_payment';
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Involved parties and admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers, sellers, and admins can view orders" ON public.orders;
CREATE POLICY "Buyers, sellers, and admins can view orders" ON public.orders FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR public.is_admin());
CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_reference_uidx ON public.orders (payment_reference) WHERE payment_reference IS NOT NULL;

-- ---------- Other policies that duplicated the recursive admin check ----------
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (public.is_admin());

-- ---------- STORAGE: users write only inside their own folder; type + size limits ----------
UPDATE storage.buckets SET file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif'] WHERE id IN ('avatars','listings','accommodations');
DO $$ DECLARE b TEXT; BEGIN
  FOREACH b IN ARRAY ARRAY['avatars','listings','accommodations'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'Public can view '||b||' images');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'cc_'||b||'_read');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'cc_'||b||'_insert');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'cc_'||b||'_update');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', 'cc_'||b||'_delete');
    EXECUTE format('CREATE POLICY %I ON storage.objects FOR SELECT USING (bucket_id = %L)', 'cc_'||b||'_read', b);
    EXECUTE format('CREATE POLICY %I ON storage.objects FOR INSERT WITH CHECK (bucket_id = %L AND auth.role() = ''authenticated'' AND (storage.foldername(name))[1] = auth.uid()::text)', 'cc_'||b||'_insert', b);
    EXECUTE format('CREATE POLICY %I ON storage.objects FOR UPDATE USING (bucket_id = %L AND (storage.foldername(name))[1] = auth.uid()::text)', 'cc_'||b||'_update', b);
    EXECUTE format('CREATE POLICY %I ON storage.objects FOR DELETE USING (bucket_id = %L AND (storage.foldername(name))[1] = auth.uid()::text)', 'cc_'||b||'_delete', b);
  END LOOP;
END $$;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view listing images" ON storage.objects;

-- ---------- REALTIME so every device sees new posts immediately ----------
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['listings','accommodations','orders'] LOOP
    BEGIN EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END;
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
