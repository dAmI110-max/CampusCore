-- ==========================================================
-- CAMPUSCORE: SERVER-BACKED SERVICES  (run ONCE in Supabase SQL editor, after production_fixes.sql)
-- Safe to re-run. Adds: services, service_requests (escrowed via Paystack), service_bookings.
-- ==========================================================

-- ---------- 1. SERVICE LISTINGS ----------
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider_name TEXT NOT NULL, provider_avatar TEXT, provider_campus TEXT, provider_university TEXT,
  provider_verification TEXT NOT NULL DEFAULT 'unverified',
  provider_phone TEXT, provider_whatsapp TEXT,
  category_id TEXT NOT NULL, category_name TEXT NOT NULL,
  title TEXT NOT NULL, slug TEXT, description TEXT NOT NULL,
  starting_price NUMERIC NOT NULL CHECK (starting_price >= 0),
  pricing_model TEXT NOT NULL DEFAULT 'fixed', delivery_method TEXT NOT NULL DEFAULT 'online',
  estimated_delivery_days INTEGER NOT NULL DEFAULT 2, turnaround_time TEXT,
  packages JSONB, location TEXT, campus_id TEXT NOT NULL, university_id TEXT,
  portfolio_images TEXT[] NOT NULL DEFAULT '{}', features TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','draft','under_review','removed')),
  views INTEGER NOT NULL DEFAULT 0, featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "services_select" ON public.services;
CREATE POLICY "services_select" ON public.services FOR SELECT
  USING (status = 'active' OR auth.uid() = provider_id OR public.is_admin());
DROP POLICY IF EXISTS "services_insert" ON public.services;
CREATE POLICY "services_insert" ON public.services FOR INSERT WITH CHECK (
  auth.uid() = provider_id AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.account_status = 'active'));
DROP POLICY IF EXISTS "services_update" ON public.services;
CREATE POLICY "services_update" ON public.services FOR UPDATE
  USING (auth.uid() = provider_id OR public.is_admin()) WITH CHECK (auth.uid() = provider_id OR public.is_admin());
DROP POLICY IF EXISTS "services_delete" ON public.services;
CREATE POLICY "services_delete" ON public.services FOR DELETE USING (auth.uid() = provider_id OR public.is_admin());
CREATE INDEX IF NOT EXISTS services_status_created_idx ON public.services (status, created_at DESC);

-- providers can't self-feature or self-verify
CREATE OR REPLACE FUNCTION public.protect_service_flags()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.featured := FALSE; NEW.views := 0;
    NEW.provider_verification := COALESCE((SELECT verification_badge FROM public.profiles WHERE id = NEW.provider_id), 'unverified');
  ELSE
    NEW.featured := OLD.featured; NEW.provider_verification := OLD.provider_verification;
    NEW.provider_id := OLD.provider_id; NEW.views := OLD.views;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS protect_service_flags_trg ON public.services;
CREATE TRIGGER protect_service_flags_trg BEFORE INSERT OR UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.protect_service_flags();

-- ---------- 2. SERVICE REQUESTS (quote -> Paystack escrow -> delivery -> release) ----------
-- Clients can only READ. All changes go through the server API so nobody can fake "paid" or "approved".
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  service_title TEXT NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL, client_avatar TEXT, client_campus TEXT,
  provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider_name TEXT NOT NULL, provider_avatar TEXT,
  description TEXT NOT NULL, reference_images TEXT[] NOT NULL DEFAULT '{}',
  budget NUMERIC NOT NULL CHECK (budget > 0), deadline_date TEXT,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN
    ('requested','quoted','accepted','declined','in_progress','ready_for_review','revision_requested','completed','disputed','cancelled','refunded')),
  quote_amount NUMERIC, quote_delivery_days INTEGER, quote_terms TEXT,
  payment_reference TEXT UNIQUE, escrow_status TEXT NOT NULL DEFAULT 'none',
  platform_fee NUMERIC NOT NULL DEFAULT 0, provider_receives NUMERIC NOT NULL DEFAULT 0, paid_at TIMESTAMPTZ,
  revisions_used INTEGER NOT NULL DEFAULT 0, max_revisions INTEGER NOT NULL DEFAULT 2,
  delivery_work_urls TEXT[] NOT NULL DEFAULT '{}', delivery_notes TEXT, dispute_reason TEXT,
  payout_status TEXT NOT NULL DEFAULT 'none', completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "srv_req_select" ON public.service_requests;
CREATE POLICY "srv_req_select" ON public.service_requests FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = provider_id OR public.is_admin());
CREATE INDEX IF NOT EXISTS service_requests_client_idx ON public.service_requests (client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS service_requests_provider_idx ON public.service_requests (provider_id, created_at DESC);

-- ---------- 3. SERVICE BOOKINGS (appointments) ----------
CREATE TABLE IF NOT EXISTS public.service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT UNIQUE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  service_title TEXT NOT NULL,
  provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider_name TEXT NOT NULL, provider_avatar TEXT,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL, customer_avatar TEXT, customer_phone TEXT,
  campus_id TEXT, location_venue TEXT, date TEXT NOT NULL, time_slot TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price NUMERIC NOT NULL CHECK (price >= 0), total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('requested','pending','confirmed','in_progress','completed','cancelled','no_show','disputed')),
  notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "srv_book_select" ON public.service_bookings;
CREATE POLICY "srv_book_select" ON public.service_bookings FOR SELECT
  USING (auth.uid() = customer_id OR auth.uid() = provider_id OR public.is_admin());
DROP POLICY IF EXISTS "srv_book_insert" ON public.service_bookings;
CREATE POLICY "srv_book_insert" ON public.service_bookings FOR INSERT WITH CHECK (
  auth.uid() = customer_id AND customer_id <> provider_id AND status = 'confirmed');
-- the database itself prevents two people booking the same provider slot
CREATE UNIQUE INDEX IF NOT EXISTS service_bookings_slot_uidx
  ON public.service_bookings (provider_id, date, time_slot) WHERE status <> 'cancelled';

-- ---------- realtime ----------
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['services','service_requests','service_bookings'] LOOP
    BEGIN EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END;
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
