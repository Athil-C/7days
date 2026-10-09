# 7Days Toys & Babyshop - Supabase Setup Guide
(Step-by-step guide to connect the dynamic admin portal)

---

## Step 1: Create a Free Supabase Account
1. Visit [supabase.com](https://supabase.com) and click **Start your project** to create a free account.
2. Click **New Project**:
   - **Name**: `7days-toys`
   - **Database Password**: Set a strong database password.
   - **Region**: Select India (Mumbai) or Singapore.
   - Click **Create new project**.

---

## Step 2: Setup Database Tables & Storage (1-Click SQL)
1. Open the **SQL Editor** from the left sidebar of the Supabase Dashboard.
2. Click **New Query**.
3. Copy all the SQL code from [`supabase_schema.sql`](./supabase_schema.sql) in this repository and paste it into the editor.
4. Click the **Run** button at the bottom right.
   > This automatically configures the `products` table, the `product-images` storage bucket for photo uploads, and all Row Level Security (RLS) policies.

---

## Step 3: Create Admin Login User
1. Navigate to **Authentication** -> **Users** from the left menu.
2. Click **Add user** -> **Create user**.
3. Enter your admin email (e.g. `admin@7days.com`) and a strong password.
4. Check **Auto Confirm User?**, then click **Create user**.

---

## Step 4: Configure API Keys in Project
1. Go to **Project Settings** (Gear icon) -> **API** in the left menu.
2. Copy:
   - **Project URL**
   - **Project API Keys** -> `anon` / `public` key
3. Open the [`.env`](./.env) file in your project folder and set:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
4. If deploying on Vercel:
   - Go to Vercel Dashboard -> Project -> **Settings** -> **Environment Variables**.
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## How to Use the Admin Portal
- Go to `/admin` or click **Admin Portal** in the website footer.
- Log in with your admin credentials.
- Click **Add New Product** to upload photos directly from mobile or desktop.
- Fill in product details, pricing, discount, and save.
- All products automatically have instant **WhatsApp Direct Order** integration enabled!
