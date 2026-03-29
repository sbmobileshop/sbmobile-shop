
ALTER TABLE public.product_reviews ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
