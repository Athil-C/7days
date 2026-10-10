-- =======================================================================
-- 7DAYS TOYS & BABYSHOP - ONE-CLICK FIX FOR SUPABASE PERMISSIONS (RLS)
-- Copy and paste all of this into:
-- Supabase Dashboard -> SQL Editor -> New Query -> Click "Run"
-- =======================================================================

-- 1. FIX PRODUCTS TABLE
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access" ON public.products;
DROP POLICY IF EXISTS "Admin Insert Products" ON public.products;
DROP POLICY IF EXISTS "Admin Update Products" ON public.products;
DROP POLICY IF EXISTS "Admin Delete Products" ON public.products;
DROP POLICY IF EXISTS "Allow All Operations on Products" ON public.products;

CREATE POLICY "Allow All Operations on Products"
ON public.products
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 2. FIX PRODUCT IMAGES STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Images View" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Storage Operations" ON storage.objects;

CREATE POLICY "Allow All Storage Operations"
ON storage.objects
FOR ALL
TO anon, authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- 3. FIX UPDATES TABLE
ALTER TABLE IF EXISTS public.updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Updates" ON public.updates;
DROP POLICY IF EXISTS "Admin Insert Updates" ON public.updates;
DROP POLICY IF EXISTS "Admin Update Updates" ON public.updates;
DROP POLICY IF EXISTS "Admin Delete Updates" ON public.updates;
DROP POLICY IF EXISTS "Allow All Operations on Updates" ON public.updates;

CREATE POLICY "Allow All Operations on Updates"
ON public.updates
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. FIX HERO SHOWCASE TABLE
ALTER TABLE IF EXISTS public.hero_showcase ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Hero Showcase" ON public.hero_showcase;
DROP POLICY IF EXISTS "Admin Upsert Hero Showcase" ON public.hero_showcase;
DROP POLICY IF EXISTS "Allow All Operations on Hero Showcase" ON public.hero_showcase;

CREATE POLICY "Allow All Operations on Hero Showcase"
ON public.hero_showcase
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 5. CREATE & FIX STAFF TABLES IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.staff_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Sales Staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin Manage Staff Members" ON public.staff_members;

CREATE POLICY "Admin Manage Staff Members"
ON public.staff_members
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_key TEXT NOT NULL,
    ledger_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(month_key)
);

ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin Manage Staff Attendance" ON public.staff_attendance;

CREATE POLICY "Admin Manage Staff Attendance"
ON public.staff_attendance
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
