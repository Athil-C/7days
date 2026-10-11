-- ==========================================================
-- 7DAYS TOYS & BABYSHOP - SUPABASE DATABASE & STORAGE SCHEMA
-- Run this in the Supabase Dashboard -> SQL Editor
-- ==========================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Toys',
    description TEXT DEFAULT '',
    price NUMERIC DEFAULT NULL,
    mrp NUMERIC DEFAULT NULL,
    colors TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    age_group TEXT DEFAULT NULL,
    image TEXT NOT NULL,
    additional_images TEXT[] DEFAULT '{}',
    badge TEXT DEFAULT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migration support if table already exists
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS mrp NUMERIC DEFAULT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS age_group TEXT DEFAULT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS additional_images TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS material TEXT DEFAULT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS item_form TEXT DEFAULT NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS about_item TEXT[] DEFAULT '{}';

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. Storage Bucket for Product Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ==========================================================
-- 3. Create Updates Table (Store Announcements & News)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    title_malayalam TEXT DEFAULT '',
    category TEXT DEFAULT 'Store Notice',
    badge TEXT DEFAULT 'Specialized Service',
    badge_color TEXT DEFAULT 'bg-red-600',
    date TEXT DEFAULT 'Available Now',
    banner_image TEXT NOT NULL,
    description TEXT NOT NULL,
    highlights TEXT[] DEFAULT '{}',
    whatsapp_message TEXT DEFAULT '',
    is_featured BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- 4. Create Hero Showcase Table ("Little things. Big smiles.")
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.hero_showcase (
    slot INT PRIMARY KEY, -- 1, 2, 3
    slot_label TEXT NOT NULL,
    tag TEXT DEFAULT '',
    title TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    image TEXT NOT NULL,
    product_id TEXT DEFAULT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.hero_showcase ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- 5. Create Finance Transactions Table (Income & Expenses)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.finance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'income' or 'expense'
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'Cash',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT DEFAULT '',
    reference TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- 6. Create Finance Purchases Table (Stock & Supplier Invoices)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.finance_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_name TEXT NOT NULL,
    products_purchased TEXT DEFAULT '',
    purchase_amount NUMERIC NOT NULL,
    paid_amount NUMERIC NOT NULL DEFAULT 0,
    pending_amount NUMERIC NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'Bank Transfer',
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Paid',
    invoice_ref TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.finance_purchases ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- 7. Create Staff Members Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.staff_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Sales Staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- 8. Create Staff Attendance Ledger Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_key TEXT NOT NULL, -- e.g. '2026-10'
    ledger_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(month_key)
);

ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- 9. Create Daily Sales Sheets Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.daily_sales_sheets (
    date_str TEXT PRIMARY KEY, -- 'YYYY-MM-DD'
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.daily_sales_sheets ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- 10. Create Admin Login History Table ("Logged Details")
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.admin_login_history (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Super Admin',
    login_timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    formatted_time TEXT,
    formatted_date TEXT,
    browser TEXT,
    os TEXT,
    device_info TEXT,
    user_agent TEXT,
    status TEXT DEFAULT 'Active'
);

ALTER TABLE public.admin_login_history ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- 11. Create Admin Activity Audit Logs Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    details TEXT DEFAULT '',
    email TEXT,
    role TEXT,
    browser TEXT,
    os TEXT,
    device_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    formatted_time TEXT,
    formatted_date TEXT
);

ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- 12. Create Customers Directory Table
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    place TEXT DEFAULT '',
    tag TEXT DEFAULT 'General',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- 13. Create Site Settings Table (Homepage Sections, Configs)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

-- Public Catalog: Anyone can VIEW, only Admin can MODIFY
CREATE POLICY "Public Read Products" ON public.products FOR SELECT TO public USING (true);
CREATE POLICY "Admin Full Access Products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Updates" ON public.updates FOR SELECT TO public USING (true);
CREATE POLICY "Admin Full Access Updates" ON public.updates FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Hero Showcase" ON public.hero_showcase FOR SELECT TO public USING (true);
CREATE POLICY "Admin Full Access Hero Showcase" ON public.hero_showcase FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Site Settings" ON public.site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Admin Full Access Site Settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Private Business Data: ONLY Authenticated Admin can Access (Zero Public Access)
CREATE POLICY "Admin Only Daily Sales Sheets" ON public.daily_sales_sheets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Only Staff Attendance" ON public.staff_attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Only Staff Members" ON public.staff_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Only Finance Transactions" ON public.finance_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Only Finance Purchases" ON public.finance_purchases FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Only Customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Only Login History" ON public.admin_login_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Only Activity Logs" ON public.admin_activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage Policies
CREATE POLICY "Public Read Product Images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'product-images');
CREATE POLICY "Admin Upload Product Images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Admin Manage Product Images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
CREATE POLICY "Admin Delete Product Images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');
