import React, { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Bot, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AIChatBotProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AIChatBot: React.FC<AIChatBotProps> = ({ open, onOpenChange }) => {
  const { language } = useLanguage();
  const { siteInfo } = useSiteSettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: language === "bn"
          ? `আসসালামু আলাইকুম! আমি ${siteInfo.shop_name_bn} এর AI সহকারী। আপনাকে কিভাবে সাহায্য করতে পারি?`
          : `Hi! I'm the ${siteInfo.shop_name_en} AI assistant. How can I help you today?`
      }]);
    }
  }, [open, language, siteInfo, messages.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open, minimized]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: userMsg.content,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          language,
          shop_name: siteInfo.shop_name_en,
        }
      });

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data?.reply || (language === "bn" ? "দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না।" : "Sorry, I couldn't process that right now.")
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: language === "bn" ? "সার্ভারে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" : "Server error. Please try again later."
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-[140px] right-[70px] z-[60] px-4 py-2 rounded-full shadow-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 hover:shadow-xl active:scale-95 transition-all"
      >
        <Bot className="h-4 w-4" /> AI Chat
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 z-[60] w-[340px] sm:w-[380px] max-h-[480px] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary-foreground/15 flex items-center justify-center ring-2 ring-primary-foreground/20">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary-foreground">AI Assistant</p>
            <p className="text-[10px] text-primary-foreground/60">{language === "bn" ? "সবসময় অনলাইন" : "Always online"}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => setMinimized(true)} className="p-1.5 hover:bg-primary-foreground/10 rounded-lg transition-colors text-primary-foreground/70 hover:text-primary-foreground">
            <Minus className="h-4 w-4" />
          </button>
          <button onClick={() => onOpenChange(false)} className="p-1.5 hover:bg-primary-foreground/10 rounded-lg transition-colors text-primary-foreground/70 hover:text-primary-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[260px] max-h-[330px] bg-muted/50">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-1.5`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-auto">
                <Bot className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            )}
            <div className={`max-w-[80%] px-3 py-2 text-sm leading-relaxed shadow-sm ${
              msg.role === "user"
                ? "bg-accent text-accent-foreground rounded-2xl rounded-br-md"
                : "bg-card text-card-foreground rounded-2xl rounded-bl-md"
            }`}>
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-1.5">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <div className="bg-card rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder={language === "bn" ? "প্রশ্ন করুন..." : "Ask anything..."}
            className="flex-1 text-sm rounded-xl bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            size="icon"
            className="shrink-0 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChatBot;
