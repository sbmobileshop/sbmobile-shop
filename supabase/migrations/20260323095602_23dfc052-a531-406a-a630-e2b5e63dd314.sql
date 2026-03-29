INSERT INTO storage.buckets (id, name, public) VALUES ('chat-images', 'chat-images', true);

CREATE POLICY "Anyone can upload chat images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'chat-images');

CREATE POLICY "Anyone can view chat images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'chat-images');

CREATE POLICY "Admins can delete chat images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'chat-images' AND public.has_role(auth.uid(), 'admin'::app_role));