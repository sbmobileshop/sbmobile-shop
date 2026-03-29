
CREATE TABLE public.delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_bn text,
  charge numeric NOT NULL DEFAULT 0,
  advance_amount numeric NOT NULL DEFAULT 100,
  free_delivery_min numeric NOT NULL DEFAULT 5000,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active zones" ON public.delivery_zones FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admins can manage zones" ON public.delivery_zones FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default zones
INSERT INTO public.delivery_zones (name, name_bn, charge, advance_amount, free_delivery_min, sort_order) VALUES
('Inside Sylhet', 'সিলেটের ভিতরে', 60, 100, 5000, 1),
('Outside Sylhet (Inside Dhaka)', 'সিলেটের বাইরে (ঢাকার ভিতরে)', 120, 150, 5000, 2),
('Outside Dhaka', 'ঢাকার বাইরে', 150, 200, 5000, 3);
