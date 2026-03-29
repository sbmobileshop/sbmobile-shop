import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { MessageCircle, X, Send, Loader2, Minus, CheckCheck, Image, Link2, ShoppingCart } from "lucide-react";
import ChatImageViewer from "@/components/ChatImageViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  sender_type: string;
  sender_name: string;
  message: string;
  created_at: string;
}

interface LiveChatProps {
  onInteract?: () => void;
  folded?: boolean;
  externalOpen?: boolean;
  onExternalClose?: () => void;
  hideButton?: boolean;
  onUnreadChange?: (count: number) => void;
}

const VISITOR_ID_KEY = "sb_chat_visitor_id";
const CONV_ID_KEY = "sb_chat_conv_id";

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

// Detect URLs and render as clickable links, detect images
function renderMessageContent(message: string, onImageClick?: (url: string) => void, onProductClick?: (productId: string) => void) {
  // Check if message is an image URL
  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(message.trim()) || message.startsWith("[img]")) {
    const imgUrl = message.startsWith("[img]") ? message.replace("[img]", "").replace("[/img]", "").trim() : message.trim();
    return (
      <button onClick={() => onImageClick?.(imgUrl)} className="block">
        <img src={imgUrl} alt="Shared image" className="max-w-full rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity" />
      </button>
    );
  }

  // Check for product card format: [product|||name|||price|||image_url|||id] or legacy [product:name:price:url:id]
  const newProductMatch = message.match(/^\[product\|\|\|(.*?)\|\|\|(.*?)\|\|\|(.*?)(?:\|\|\|(.*?))?\]$/);
  const legacyProductMatch = !newProductMatch ? message.match(/^\[product:(.*?):(.*?):(.*?)(?::(.*?))?\]$/) : null;
  const productMatch = newProductMatch || legacyProductMatch;
  if (productMatch) {
    const [, name, price, imageUrl, productId] = productMatch;
    return (
      <div className="bg-background/50 rounded-lg border border-border overflow-hidden max-w-[200px]">
        {imageUrl && imageUrl !== "null" && (
          <div className="w-full h-32 overflow-hidden">
            <img
              src={imageUrl} alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-2">
          <p className="font-semibold text-xs leading-tight">{name}</p>
          <p className="text-primary font-bold text-sm mt-0.5">৳{Number(price).toLocaleString()}</p>
          {productId && (
            <button
              onClick={() => onProductClick?.(productId)}
              className="mt-1.5 w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-accent text-accent-foreground text-[11px] font-semibold hover:bg-accent/90 transition-colors"
            >
              <ShoppingCart className="h-3 w-3" />
              Buy Now
            </button>
          )}
        </div>
      </div>
    );
  }

  // URL detection for links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = message.split(urlRegex);
  if (parts.length <= 1) return <p className="whitespace-pre-wrap break-words">{message}</p>;

  return (
    <p className="whitespace-pre-wrap break-words">
      {parts.map((part, i) =>
        urlRegex.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline hover:text-blue-600 break-all">
            {part.length > 40 ? part.substring(0, 40) + "..." : part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

const LiveChat: React.FC<LiveChatProps> = ({ onInteract, folded, externalOpen, onExternalClose, hideButton, onUnreadChange }) => {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const { siteInfo } = useSiteSettings();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unread, setUnreadInternal] = useState(0);
  const setUnread = (val: number | ((prev: number) => number)) => {
    setUnreadInternal(prev => {
      const next = typeof val === "function" ? val(prev) : val;
      onUnreadChange?.(next);
      return next;
    });
  };
  const [uploading, setUploading] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visitorId = getVisitorId();
  const visitorName = user ? (profile?.full_name || user.email || "User") : "Guest";
  const avatarUrl = profile?.avatar_url;

  useEffect(() => {
    if (externalOpen) {
      setOpen(true);
      setMinimized(false);
      setUnread(0);
      if (!conversationId) initConversation();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [externalOpen]);

  const handleClose = () => {
    setOpen(false);
    onExternalClose?.();
  };

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  const initConversation = useCallback(async () => {
    setLoading(true);
    const savedConvId = localStorage.getItem(CONV_ID_KEY);

    if (savedConvId) {
      const { data: conv } = await supabase
        .from("chat_conversations").select("id, status").eq("id", savedConvId).maybeSingle();
      if (conv && conv.status === "active") {
        setConversationId(conv.id);
        const { data: msgs } = await supabase
          .from("chat_messages").select("*").eq("conversation_id", conv.id).order("created_at", { ascending: true });
        if (msgs) setMessages(msgs);
        setLoading(false);
        scrollToBottom();
        return;
      }
    }

    const { data: newConv } = await supabase
      .from("chat_conversations")
      .insert({ visitor_id: visitorId, visitor_name: visitorName, user_id: user?.id || null })
      .select("id").single();

    if (newConv) {
      setConversationId(newConv.id);
      localStorage.setItem(CONV_ID_KEY, newConv.id);
      const welcomeMsg = language === "bn"
        ? `আসসালামু আলাইকুম! ${siteInfo.shop_name_bn}-এ স্বাগতম। কিভাবে সাহায্য করতে পারি?`
        : `Welcome to ${siteInfo.shop_name_en}! How can we help you today?`;
      await supabase.from("chat_messages").insert({
        conversation_id: newConv.id, sender_type: "admin", sender_name: "SB Support", message: welcomeMsg,
      });
      const { data: msgs } = await supabase
        .from("chat_messages").select("*").eq("conversation_id", newConv.id).order("created_at", { ascending: true });
      if (msgs) setMessages(msgs);
    }
    setLoading(false);
    scrollToBottom();
  }, [visitorId, visitorName, user, language, scrollToBottom, siteInfo]);

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
          if (!open || minimized) {
            if (newMsg.sender_type === "admin") setUnread(prev => prev + 1);
          }
          scrollToBottom();
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, open, minimized, scrollToBottom]);

  const handleOpen = () => {
    setOpen(true);
    setMinimized(false);
    setUnread(0);
    onInteract?.();
    if (!conversationId) initConversation();
    else scrollToBottom();
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const handleSend = async () => {
    if (!input.trim() || !conversationId || sending) return;
    const msg = input.trim();
    setInput("");
    setSending(true);
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId, sender_type: "customer", sender_name: visitorName, message: msg,
    });
    await supabase.from("chat_conversations")
      .update({ updated_at: new Date().toISOString(), visitor_name: visitorName }).eq("id", conversationId);
    setSending(false);
    scrollToBottom();
    inputRef.current?.focus();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only images are supported");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB image size");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${conversationId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("chat-images").upload(path, file);
    if (error) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("chat-images").getPublicUrl(path);
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId, sender_type: "customer", sender_name: visitorName, message: urlData.publicUrl,
    });
    await supabase.from("chat_conversations")
      .update({ updated_at: new Date().toISOString(), visitor_name: visitorName }).eq("id", conversationId);
    setUploading(false);
    scrollToBottom();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const getMessageStatus = (msg: ChatMessage, index: number) => {
    if (msg.sender_type !== "customer") return null;
    const hasAdminReplyAfter = messages.slice(index + 1).some(m => m.sender_type === "admin");
    if (hasAdminReplyAfter) return "seen";
    return "delivered";
  };

  return (
    <>
      {open && !minimized && (
        <div className="fixed bottom-24 right-4 z-[60] w-[calc(100vw-2rem)] sm:w-[380px] max-h-[80vh] sm:max-h-[500px] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-border"
          style={{
            background: `linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 50%, hsl(var(--background)) 100%)`,
          }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-accent">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-accent-foreground/15 flex items-center justify-center ring-2 ring-accent-foreground/20 overflow-hidden">
                {siteInfo.logo_url ? (
                  <img src={siteInfo.logo_url} alt="SB" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-accent-foreground font-bold text-sm">SB</span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-accent-foreground">{language === "bn" ? siteInfo.shop_name_bn : siteInfo.shop_name_en}</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] text-accent-foreground/70">{language === "bn" ? "অনলাইনে আছি" : "Online now"}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button onClick={() => setMinimized(true)} className="p-1.5 hover:bg-accent-foreground/10 rounded-lg transition-colors text-accent-foreground/70 hover:text-accent-foreground">
                <Minus className="h-4 w-4" />
              </button>
              <button onClick={handleClose} className="p-1.5 hover:bg-accent-foreground/10 rounded-lg transition-colors text-accent-foreground/70 hover:text-accent-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] max-h-[50vh] sm:min-h-[280px] sm:max-h-[350px]"
            style={{
              background: `
                linear-gradient(45deg, hsl(var(--muted) / 0.3) 25%, transparent 25%),
                linear-gradient(-45deg, hsl(var(--muted) / 0.3) 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, hsl(var(--muted) / 0.3) 75%),
                linear-gradient(-45deg, transparent 75%, hsl(var(--muted) / 0.3) 75%),
                linear-gradient(0deg, hsl(var(--accent) / 0.05), hsl(var(--primary) / 0.03))
              `,
              backgroundSize: '20px 20px, 20px 20px, 20px 20px, 20px 20px, 100% 100%',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px, 0 0',
            }}>
            {loading ? (
              <div className="flex items-center justify-center h-full"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : (
              messages.map((msg, index) => {
                const isCustomer = msg.sender_type === "customer";
                const status = getMessageStatus(msg, index);
                return (
                  <div key={msg.id} className={`flex ${isCustomer ? "justify-end" : "justify-start"} gap-1.5`}>
                    {!isCustomer && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden mt-auto bg-primary">
                        {siteInfo.logo_url ? (
                          <img src={siteInfo.logo_url} alt="SB" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="text-primary-foreground text-[10px] font-bold">SB</span>
                        )}
                      </div>
                    )}
                    <div className={`max-w-[78%] px-3 py-2 text-sm leading-relaxed shadow-sm ${
                      isCustomer
                        ? "bg-accent text-accent-foreground rounded-2xl rounded-br-md"
                        : "bg-card text-card-foreground rounded-2xl rounded-bl-md border border-border"
                    }`}>
                      {!isCustomer && (
                        <p className="text-[10px] font-semibold mb-0.5 text-primary">{msg.sender_name}</p>
                      )}
                      {renderMessageContent(msg.message, setViewImage, (pid) => { setOpen(false); navigate(`/product/${pid}`); })}
                      <div className={`flex items-center gap-1 mt-0.5 ${isCustomer ? "justify-end" : ""}`}>
                        <p className={`text-[9px] ${isCustomer ? "text-accent-foreground/60" : "text-muted-foreground/60"}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {isCustomer && status && (
                          status === "seen" ? (
                            <CheckCheck className="h-3 w-3 text-blue-400" />
                          ) : (
                            <CheckCheck className="h-3 w-3 text-accent-foreground/50" />
                          )
                        )}
                      </div>
                    </div>
                    {isCustomer && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden mt-auto bg-primary">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="U" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="text-primary-foreground text-[10px] font-bold">{visitorName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card">
            <div className="flex gap-1.5 items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !conversationId}
                className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                title={language === "bn" ? "ছবি পাঠান" : "Send image"}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
              </button>
              <Input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={language === "bn" ? "মেসেজ লিখুন..." : "Type a message..."}
                className="flex-1 text-[16px] sm:text-sm rounded-xl bg-muted border-0 focus-visible:ring-1 focus-visible:ring-accent/30"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                size="icon"
                className="shrink-0 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[9px] text-center text-muted-foreground/50 mt-1.5">
              Powered by {siteInfo.shop_name_en}
            </p>
          </div>
        </div>
      )}

      {/* Floating Live Chat Button */}
      {!hideButton && (
        <div
          className="fixed z-50 transition-transform duration-500 ease-in-out"
          style={{
            bottom: "148px",
            right: "0px",
            transform: folded ? "translateX(28px)" : "translateX(-20px)",
          }}
          onMouseEnter={onInteract}
          onTouchStart={onInteract}
        >
          <button
            onClick={open && !minimized ? handleClose : handleOpen}
            className="group relative w-[50px] h-[50px] rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center bg-accent"
            aria-label="Live Chat"
          >
            {open && !minimized ? (
              <X className="h-5 w-5 text-accent-foreground" />
            ) : (
              <>
                <MessageCircle className="h-6 w-6 text-accent-foreground" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unread}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      )}
      {viewImage && <ChatImageViewer src={viewImage} onClose={() => setViewImage(null)} />}
    </>
  );
};

export default LiveChat;
