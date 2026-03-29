import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Loader2, Trash2, CheckCheck, Image, Package, X, Search } from "lucide-react";
import { toast } from "sonner";
import ChatImageViewer from "@/components/ChatImageViewer";

interface Conversation {
  id: string;
  visitor_id: string;
  visitor_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
}

interface ChatMsg {
  id: string;
  conversation_id: string;
  sender_type: string;
  sender_name: string;
  message: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
}

// Render message with image/link/product support
function renderMessageContent(message: string, onImageClick?: (url: string) => void) {
  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(message.trim()) || message.startsWith("[img]")) {
    const imgUrl = message.startsWith("[img]") ? message.replace("[img]", "").replace("[/img]", "").trim() : message.trim();
    return (
      <button onClick={() => onImageClick?.(imgUrl)} className="block">
        <img src={imgUrl} alt="Shared image" className="max-w-full rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity" />
      </button>
    );
  }

  const newProductMatch = message.match(/^\[product\|\|\|(.*?)\|\|\|(.*?)\|\|\|(.*?)(?:\|\|\|(.*?))?\]$/);
  const legacyProductMatch = !newProductMatch ? message.match(/^\[product:(.*?):(.*?):(.*?)(?::(.*?))?\]$/) : null;
  const productMatch = newProductMatch || legacyProductMatch;
  if (productMatch) {
    const [, name, price, imageUrl] = productMatch;
    return (
      <div className="bg-background/50 rounded-lg border border-border overflow-hidden max-w-[220px]">
        {imageUrl && imageUrl !== "null" && (
          <div className="w-full h-36 overflow-hidden">
            <img
              src={imageUrl} alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-2.5">
          <p className="font-semibold text-xs leading-tight">{name}</p>
          <p className="text-primary font-bold text-sm mt-1">৳{Number(price).toLocaleString()}</p>
        </div>
      </div>
    );
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = message.split(urlRegex);
  if (parts.length <= 1) return <p className="whitespace-pre-wrap break-words">{message}</p>;

  return (
    <p className="whitespace-pre-wrap break-words">
      {parts.map((part, i) =>
        urlRegex.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300 break-all">
            {part.length > 40 ? part.substring(0, 40) + "..." : part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

const AdminChat: React.FC = () => {
  const { language } = useLanguage();
  const { profile } = useAuth();
  const { siteInfo } = useSiteSettings();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productsLoading, setProductsLoading] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adminName = profile?.full_name || "Admin";

  const loadConversations = useCallback(async () => {
    const { data } = await supabase
      .from("chat_conversations").select("*").eq("status", "active").order("updated_at", { ascending: false });
    if (data) {
      const convs = await Promise.all(
        data.map(async (conv) => {
          const { data: msgs } = await supabase
            .from("chat_messages").select("message, sender_type").eq("conversation_id", conv.id).order("created_at", { ascending: false }).limit(1);
          return { ...conv, last_message: msgs?.[0]?.message || "" } as Conversation;
        })
      );
      setConversations(convs);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-chat-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_conversations" }, () => loadConversations())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const newMsg = payload.new as ChatMsg;
        if (newMsg.conversation_id === selectedConv) {
          setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
        loadConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConv, loadConversations]);

  const selectConversation = async (convId: string) => {
    setSelectedConv(convId);
    setMsgsLoading(true);
    setShowProducts(false);
    const { data } = await supabase
      .from("chat_messages").select("*").eq("conversation_id", convId).order("created_at", { ascending: true });
    if (data) setMessages(data);
    setMsgsLoading(false);
    setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); inputRef.current?.focus(); }, 100);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedConv || sending) return;
    const msg = input.trim();
    setInput("");
    setSending(true);
    await supabase.from("chat_messages").insert({
      conversation_id: selectedConv, sender_type: "admin", sender_name: adminName, message: msg,
    });
    await supabase.from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", selectedConv);
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConv) return;
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
    const path = `${selectedConv}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("chat-images").upload(path, file);
    if (error) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("chat-images").getPublicUrl(path);
    await supabase.from("chat_messages").insert({
      conversation_id: selectedConv, sender_type: "admin", sender_name: adminName, message: urlData.publicUrl,
    });
    await supabase.from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", selectedConv);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadProducts = async () => {
    setProductsLoading(true);
    const { data } = await supabase.from("products").select("id, name, price, image_url").eq("status", "active").order("name").limit(50);
    if (data) setProducts(data);
    setProductsLoading(false);
  };

  const toggleProducts = () => {
    if (!showProducts) loadProducts();
    setShowProducts(!showProducts);
  };

  const sendProductCard = async (product: Product) => {
    if (!selectedConv) return;
    const msg = `[product|||${product.name}|||${product.price}|||${product.image_url || "null"}|||${product.id}]`;
    await supabase.from("chat_messages").insert({
      conversation_id: selectedConv, sender_type: "admin", sender_name: adminName, message: msg,
    });
    await supabase.from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", selectedConv);
    setShowProducts(false);
    toast.success("Product sent!");
  };

  const closeConversation = async (convId: string) => {
    await supabase.from("chat_conversations").update({ status: "closed" }).eq("id", convId);
    toast.success("Chat closed");
    if (selectedConv === convId) { setSelectedConv(null); setMessages([]); }
    loadConversations();
  };

  const deleteMessage = async (msgId: string) => {
    const { error } = await supabase.from("chat_messages").delete().eq("id", msgId);
    if (error) {
      toast.error("Delete failed");
      return;
    }
    setMessages(prev => prev.filter(m => m.id !== msgId));
    toast.success("Message deleted for everyone");
  };

  const getMessageStatus = (msg: ChatMsg, index: number) => {
    if (msg.sender_type !== "admin") return null;
    const hasCustomerReplyAfter = messages.slice(index + 1).some(m => m.sender_type === "customer");
    if (hasCustomerReplyAfter) return "seen";
    return "delivered";
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedConvData = conversations.find(c => c.id === selectedConv);

  return (
    <>
    <div className="h-[calc(100vh-8rem)] flex border border-border rounded-xl overflow-hidden bg-card">
      {/* Conversations List */}
      <div className={`${selectedConv ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 border-r border-border`}>
        <div className="px-4 py-3 border-b border-border" style={{ background: "linear-gradient(135deg, #1a2744 0%, #243352 100%)" }}>
          <h2 className="font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center overflow-hidden ring-1 ring-white/20">
              {siteInfo.logo_url ? (
                <img src={siteInfo.logo_url} alt="SB" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-white text-xs font-bold">SB</span>
              )}
            </div>
            <div>
              <span className="text-sm">{language === "bn" ? "লাইভ চ্যাট" : "Live Chats"}</span>
              {conversations.length > 0 && (
                <Badge className="ml-2 text-[10px] bg-[#c0392b] text-white border-0">{conversations.length}</Badge>
              )}
            </div>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm px-4">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
              {language === "bn" ? "কোনো সক্রিয় চ্যাট নেই" : "No active chats"}
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors ${selectedConv === conv.id ? "bg-muted" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ring-2 ring-border shrink-0" style={{ background: "linear-gradient(135deg, #c0392b, #e74c3c)" }}>
                    {conv.visitor_name?.charAt(0)?.toUpperCase() || "G"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground truncate">{conv.visitor_name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(conv.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.last_message}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedConv ? "flex" : "hidden md:flex"} flex-1 flex-col`}>
        {selectedConv && selectedConvData ? (
          <>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between" style={{ background: "linear-gradient(135deg, #1a2744 0%, #243352 100%)" }}>
              <div className="flex items-center gap-2.5">
                <button onClick={() => setSelectedConv(null)} className="md:hidden p-1 hover:bg-white/10 rounded-lg mr-1 text-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ring-2 ring-white/20" style={{ background: "linear-gradient(135deg, #c0392b, #e74c3c)" }}>
                  {selectedConvData.visitor_name?.charAt(0)?.toUpperCase() || "G"}
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{selectedConvData.visitor_name}</p>
                  <p className="text-[10px] text-white/60 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online • {new Date(selectedConvData.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => closeConversation(selectedConv)} className="text-white/70 hover:text-white hover:bg-white/10 gap-1 text-xs">
                <Trash2 className="h-3.5 w-3.5" /> Close
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f0f2f5] dark:bg-background relative">
              {msgsLoading ? (
                <div className="flex items-center justify-center h-full"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : (
                messages.map((msg, index) => {
                  const isAdmin = msg.sender_type === "admin";
                  const status = getMessageStatus(msg, index);
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"} gap-1.5 group`}>
                      {!isAdmin && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-auto text-white text-[10px] font-bold" style={{ background: "linear-gradient(135deg, #c0392b, #e74c3c)" }}>
                          {selectedConvData.visitor_name?.charAt(0)?.toUpperCase() || "G"}
                        </div>
                      )}
                      <div className="relative">
                        <div className={`max-w-full px-3 py-2 text-sm leading-relaxed shadow-sm ${
                          isAdmin
                            ? "bg-[#1a2744] text-white rounded-2xl rounded-br-md"
                            : "bg-white dark:bg-card text-foreground rounded-2xl rounded-bl-md"
                        }`}>
                          {!isAdmin && (
                            <p className="text-[10px] font-semibold opacity-70 mb-0.5">{msg.sender_name}</p>
                          )}
                          {renderMessageContent(msg.message, setViewImage)}
                          <div className={`flex items-center gap-1 mt-0.5 ${isAdmin ? "justify-end" : ""}`}>
                            <p className={`text-[9px] ${isAdmin ? "text-white/60" : "text-muted-foreground/60"}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                            {isAdmin && status && (
                              status === "seen" ? <CheckCheck className="h-3 w-3 text-blue-400" /> : <CheckCheck className="h-3 w-3 text-white/50" />
                            )}
                          </div>
                        </div>
                        {/* Delete for everyone */}
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className={`absolute top-1 ${isAdmin ? "-left-6" : "-right-6"} opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-destructive/20 text-destructive`}
                          title="Delete for everyone"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      {isAdmin && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden mt-auto ring-1 ring-border" style={{ background: "#1a2744" }}>
                          {siteInfo.logo_url ? (
                            <img src={siteInfo.logo_url} alt="SB" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span className="text-white text-[10px] font-bold">SB</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />

              {/* Products Panel */}
              {showProducts && (
                <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border shadow-xl rounded-t-xl max-h-[60%] flex flex-col z-10 animate-in slide-in-from-bottom-4 duration-200">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                    <h3 className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                      <Package className="h-3.5 w-3.5" />
                      {language === "bn" ? "প্রোডাক্ট পাঠান" : "Send Product"}
                    </h3>
                    <button onClick={() => setShowProducts(false)} className="p-1 hover:bg-muted rounded-lg">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="px-3 py-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        placeholder={language === "bn" ? "প্রোডাক্ট খুঁজুন..." : "Search products..."}
                        className="pl-8 h-8 text-xs rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto px-2 pb-2">
                    {productsLoading ? (
                      <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
                    ) : filteredProducts.length === 0 ? (
                      <p className="text-center text-xs text-muted-foreground py-4">No products</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        {filteredProducts.map(p => (
                          <button
                            key={p.id}
                            onClick={() => sendProductCard(p)}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left border border-border/50"
                          >
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0">
                              {p.image_url ? (
                                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-medium truncate text-foreground">{p.name}</p>
                              <p className="text-[10px] font-bold text-primary">৳{p.price}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
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
                  disabled={uploading}
                  className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                  title="Send image"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
                </button>
                <button
                  onClick={toggleProducts}
                  className={`p-2 rounded-xl transition-colors ${showProducts ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}
                  title="Send product"
                >
                  <Package className="h-4 w-4" />
                </button>
                <Input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder={language === "bn" ? "উত্তর লিখুন..." : "Type a reply..."} className="flex-1 text-sm rounded-xl" />
                <Button onClick={handleSend} disabled={!input.trim() || sending} size="icon" className="shrink-0 rounded-xl text-white" style={{ background: "#1a2744" }}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #1a2744, #c0392b)" }}>
                {siteInfo.logo_url ? (
                  <img src={siteInfo.logo_url} alt="SB" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-white text-xl font-bold">SB</span>
                )}
              </div>
              <p className="font-semibold text-foreground">{siteInfo.shop_name_en}</p>
              <p className="text-xs mt-1">{language === "bn" ? "একটি চ্যাট সিলেক্ট করুন" : "Select a chat to start replying"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
    {viewImage && <ChatImageViewer src={viewImage} onClose={() => setViewImage(null)} />}
    </>
  );
};

export default AdminChat;
