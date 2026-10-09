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

-- 2. RLS Policies for Products Table
-- Anyone can view products (Public Read)
CREATE POLICY "Public Read Access"
ON public.products
FOR SELECT
USING (true);

-- Only authenticated users (Admin) can insert products
CREATE POLICY "Admin Insert Products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only authenticated users (Admin) can update products
CREATE POLICY "Admin Update Products"
ON public.products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Only authenticated users (Admin) can delete products
CREATE POLICY "Admin Delete Products"
ON public.products
FOR DELETE
TO authenticated
USING (true);

-- 3. Storage Bucket for Product Images
-- Note: You can also create this manually in Storage -> New Bucket -> 'product-images' (Public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage Policies
-- Allow public to view product images
CREATE POLICY "Public Images View"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated admin to upload images
CREATE POLICY "Admin Upload Images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated admin to update images
CREATE POLICY "Admin Update Images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- Allow authenticated admin to delete images
CREATE POLICY "Admin Delete Images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- ==========================================================
-- 5. Create Updates Table (Store Announcements & News)
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

-- Enable RLS for Updates
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

-- Anyone can view updates
CREATE POLICY "Public Read Updates"
ON public.updates
FOR SELECT
USING (true);

-- Authenticated admin can manage updates
CREATE POLICY "Admin Insert Updates"
ON public.updates
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admin Update Updates"
ON public.updates
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin Delete Updates"
ON public.updates
FOR DELETE
TO authenticated
USING (true);

-- ==========================================================
-- 6. Create Hero Showcase Table ("Little things. Big smiles.")
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

-- Enable RLS for Hero Showcase
ALTER TABLE public.hero_showcase ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Hero Showcase"
ON public.hero_showcase
FOR SELECT
USING (true);

CREATE POLICY "Admin Upsert Hero Showcase"
ON public.hero_showcase
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==========================================================
-- 7. Create Finance Transactions Table (Income & Expenses)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.finance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'income' or 'expense'
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'Cash', -- 'Cash', 'UPI', 'Card', 'Bank Transfer'
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT DEFAULT '',
    reference TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin Manage Finance Transactions"
ON public.finance_transactions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==========================================================
-- 8. Create Finance Purchases Table (Stock & Supplier Invoices)
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
    status TEXT DEFAULT 'Paid', -- 'Paid', 'Partial', 'Pending'
    invoice_ref TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.finance_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin Manage Finance Purchases"
ON public.finance_purchases
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);



