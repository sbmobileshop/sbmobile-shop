
-- Chat conversations table
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  visitor_name text DEFAULT 'Guest',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL DEFAULT 'customer',
  sender_name text NOT NULL DEFAULT 'Guest',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_conversations
CREATE POLICY "Anyone can create conversations" ON public.chat_conversations FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can view own conversations" ON public.chat_conversations FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can update conversations" ON public.chat_conversations FOR UPDATE TO public USING (true);

-- RLS policies for chat_messages
CREATE POLICY "Anyone can insert messages" ON public.chat_messages FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can view messages" ON public.chat_messages FOR SELECT TO public USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;

-- Auto-delete messages older than 7 days (via a scheduled function)
CREATE OR REPLACE FUNCTION public.cleanup_old_chats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.chat_conversations WHERE updated_at < now() - interval '7 days';
END;
$$;
