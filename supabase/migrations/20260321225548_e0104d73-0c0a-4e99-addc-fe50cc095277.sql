
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default payment gateway settings
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
('payment_gateway', '{"provider": "manual", "bkash_api_key": "", "bkash_api_secret": "", "bkash_username": "", "bkash_password": "", "bkash_sandbox": true, "enabled": false}'::jsonb),
('payment_methods', '{"bkash_number": "01773243748", "nagad_number": "01773243748", "rocket_number": "01773243748", "binance_id": "814381686", "binance_name": "MD Shibrul Alom"}'::jsonb);
