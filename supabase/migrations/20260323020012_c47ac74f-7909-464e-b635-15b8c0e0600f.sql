
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS fraud_score integer DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS fraud_status text DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_zone text DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_charge numeric DEFAULT 0;
