import React, { useState, useEffect } from "react";
import { MessageCircle, Bot, Headphones, X } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import LiveChat from "./LiveChat";

function formatBadge(n: number): string {
  if (n >= 999) return "999+";
  return String(n);
}

const FloatingButtons: React.FC = () => {
  const { siteInfo } = useSiteSettings();
  const [expanded, setExpanded] = useState(false);
  const [liveChatOpen, setLiveChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handler = () => handleLiveChatOpen();
    window.addEventListener("open-live-chat", handler);
    return () => window.removeEventListener("open-live-chat", handler);
  }, []);

  const toggleExpand = () => setExpanded(prev => !prev);

  const handleLiveChatOpen = () => {
    setLiveChatOpen(true);
    setExpanded(false);
  };

  const handleLiveChatClose = () => setLiveChatOpen(false);

  return (
    <>
      <LiveChat
        externalOpen={liveChatOpen}
        onExternalClose={handleLiveChatClose}
        onInteract={() => {}}
        folded={false}
        hideButton
        onUnreadChange={setUnreadCount}
      />

      <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-4 z-50 flex flex-col-reverse items-end gap-2.5">
        {/* Main support button with bounce animation */}
        <button
          onClick={toggleExpand}
          className="group relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 bg-primary"
          aria-label="Support"
          style={{
            animation: expanded ? "none" : "support-bounce 2s ease-in-out infinite",
          }}
        >
          <div className={`transition-transform duration-300 ${expanded ? "rotate-0" : "rotate-0"}`}>
            {expanded ? (
              <X className="h-6 w-6 text-primary-foreground" />
            ) : (
              <Headphones className="h-6 w-6 text-primary-foreground" />
            )}
          </div>
          {!expanded && unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center px-1 border-2 border-background animate-pulse">
              {formatBadge(unreadCount)}
            </span>
          )}
          {!expanded && unreadCount === 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background" />
          )}
        </button>

        {/* Expandable menu items */}
        {[
          {
            label: siteInfo.shop_name_bn ? "লাইভ চ্যাট" : "Live Chat",
            icon: <MessageCircle className="h-5 w-5 text-accent-foreground" />,
            bg: "bg-accent",
            onClick: handleLiveChatOpen,
            delay: 50,
          },
          {
            label: "AI Assistant",
            icon: <Bot className="h-5 w-5 text-white" />,
            bg: "bg-[hsl(220,60%,35%)]",
            href: "https://sbaichat.netlify.app/",
            delay: 120,
          },
          {
            label: "WhatsApp",
            icon: (
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            ),
            bgStyle: { background: "#25D366" },
            href: "https://wa.link/x7j0t2",
            delay: 190,
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-2.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              expanded
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-6 scale-75 pointer-events-none"
            }`}
            style={{ transitionDelay: expanded ? `${item.delay}ms` : "0ms" }}
          >
            <span
              className={`text-xs font-semibold bg-card text-card-foreground px-3 py-1.5 rounded-full shadow-lg border border-border whitespace-nowrap transition-all duration-200 ${
                expanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
              }`}
              style={{ transitionDelay: expanded ? `${item.delay + 40}ms` : "0ms" }}
            >
              {item.label}
            </span>
            {item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-90 transition-all duration-200 ${item.bg || ""}`}
                style={item.bgStyle}
                aria-label={item.label}
              >
                {item.icon}
              </a>
            ) : (
              <button
                onClick={item.onClick}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-90 transition-all duration-200 ${item.bg || ""}`}
                style={item.bgStyle}
                aria-label={item.label}
              >
                {item.icon}
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default FloatingButtons;
