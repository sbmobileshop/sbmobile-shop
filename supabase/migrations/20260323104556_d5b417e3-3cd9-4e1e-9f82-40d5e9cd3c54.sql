
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'physical';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS digital_file_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS digital_note text;
