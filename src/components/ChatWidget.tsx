import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle, X, Send, Minimize2, Maximize2, Sparkles, UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import supportAvatar from "@/assets/support-avatar.webp";

interface Message {
  id: string;
  message: string;
  from_admin: boolean;
  is_ai?: boolean;
  read_status: boolean;
  created_at: string;
  pending?: boolean;
}

const SUGGESTIONS = [
  "Where is my booking?",
  "How do payments work?",
  "List my parking space",
  "Talk to a human",
];

const ChatWidget = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { if (messages.length) scrollToBottom(); }, [messages, thinking]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_messages")
      .select("id, message, from_admin, is_ai, read_status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setMessages((data as any) ?? []);
    setUnread((data ?? []).filter((m: any) => m.from_admin && !m.read_status).length);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchMessages();
    const channel = supabase
      .channel("chat-messages-widget")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_messages", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Skip if already in list (avoids dup with optimistic insert)
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (newMsg.from_admin && (!isOpen || isMinimized)) {
            setUnread((prev) => prev + 1);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, isOpen, isMinimized, fetchMessages]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("user_messages")
      .update({ read_status: true })
      .eq("user_id", user.id)
      .eq("from_admin", true)
      .eq("read_status", false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnread(0);
    markAllRead();
  };

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || !user || thinking) return;
    setInput("");
    setThinking(true);

    // Optimistic user bubble
    const tempId = `tmp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, message: text, from_admin: false, is_ai: false, read_status: true, created_at: new Date().toISOString(), pending: true },
    ]);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/support-chat`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text, mode: "reply" }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Request failed (${res.status})`);
      }
      // The edge function persists both messages, realtime will deliver them.
      // Refresh to get the persisted IDs and remove the optimistic bubble.
      await fetchMessages();
    } catch (e: any) {
      console.error("Chat send failed", e);
      toast({
        title: "Couldn't reach support",
        description: e?.message || "Please try again in a moment.",
        variant: "destructive",
      });
      // Remove optimistic bubble on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setThinking(false);
    }
  };

  if (!user) return null;

  // ---------- Launcher ----------
  if (!isOpen) {
    return (
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50">
        <button
          onClick={handleOpen}
          aria-label="Open support chat"
          className="group relative flex items-center gap-3 pl-2 pr-4 py-2 rounded-full bg-gradient-to-br from-primary via-primary to-primary-deep text-white shadow-[0_12px_30px_-8px_hsl(var(--primary)/0.55)] hover:shadow-[0_16px_36px_-6px_hsl(var(--primary)/0.7)] hover:-translate-y-0.5 transition-all duration-300"
        >
          <span className="relative">
            <img
              src={supportAvatar}
              alt=""
              width={36}
              height={36}
              loading="lazy"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/70"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
          </span>
          <span className="hidden sm:inline text-sm font-semibold pr-1">Chat with us</span>
          <MessageCircle className="sm:hidden h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white animate-bounce">
              {unread}
            </span>
          )}
        </button>
      </div>
    );
  }

  // ---------- Window ----------
  const windowSize = isExpanded
    ? "fixed inset-x-3 bottom-3 top-3 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[560px] sm:h-[80vh]"
    : "fixed inset-x-3 bottom-3 top-20 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[600px]";

  return (
    <div className={`${windowSize} z-50 flex flex-col`}>
      <Card className="h-full flex flex-col shadow-[0_25px_60px_-12px_hsl(var(--primary-deep)/0.45)] border-primary/15 overflow-hidden rounded-2xl bg-gradient-to-b from-white to-surface">
        {/* Header */}
        <div className="relative flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-primary to-primary-deep text-white">
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_20%_50%,white,transparent_60%)]" />
          <div className="relative">
            <img src={supportAvatar} alt="" width={44} height={44} className="w-11 h-11 rounded-full object-cover ring-2 ring-white/70" loading="lazy" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-primary-deep" />
          </div>
          <div className="flex-1 min-w-0 relative">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm sm:text-base truncate">Layla — Shazam Assistant</h3>
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
            </div>
            <p className="text-[11px] sm:text-xs opacity-90 truncate">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
              Online · usually replies instantly
            </p>
          </div>
          <div className="relative flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded((v) => !v)} className="h-8 w-8 text-white hover:bg-white/15" aria-label={isExpanded ? "Shrink" : "Expand"}>
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-white hover:bg-white/15" aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-3 bg-gradient-to-b from-white to-surface/40">
          {messages.length === 0 && (
            <div className="text-center pt-6 pb-2">
              <img src={supportAvatar} alt="" width={64} height={64} className="w-16 h-16 rounded-full object-cover mx-auto mb-3 ring-2 ring-primary/20" loading="lazy" />
              <p className="text-sm font-semibold text-foreground">Hi! I'm Layla 👋</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[260px] mx-auto">
                I know your bookings, listings and payouts. Ask me anything — I'll loop in a human if needed.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isMe = !msg.from_admin;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2`}>
                {!isMe && (
                  <img src={supportAvatar} alt="" width={28} height={28} className="w-7 h-7 rounded-full object-cover mt-auto flex-shrink-0" loading="lazy" />
                )}
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm shadow-sm break-words ${
                    isMe
                      ? "bg-gradient-to-br from-primary to-primary-deep text-white rounded-br-md"
                      : "bg-white border border-border/60 text-foreground rounded-bl-md"
                  } ${msg.pending ? "opacity-70" : ""}`}
                >
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
                        {msg.is_ai ? "Layla AI" : "Support team"}
                      </span>
                      {msg.is_ai && (
                        <Badge variant="outline" className="h-4 px-1.5 text-[9px] border-primary/30 text-primary/80 bg-primary/5">
                          <Sparkles className="h-2.5 w-2.5 mr-0.5" />AI
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className={`prose prose-sm max-w-none ${isMe ? "prose-invert" : ""} prose-p:my-1 prose-ul:my-1 prose-li:my-0`}>
                    <ReactMarkdown>{msg.message}</ReactMarkdown>
                  </div>
                  <p className={`text-[10px] mt-1 ${isMe ? "text-white/70" : "text-muted-foreground"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {isMe && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-auto flex-shrink-0">
                    <UserRound className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {thinking && (
            <div className="flex justify-start gap-2">
              <img src={supportAvatar} alt="" width={28} height={28} className="w-7 h-7 rounded-full object-cover mt-auto flex-shrink-0" loading="lazy" />
              <div className="bg-white border border-border/60 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick suggestions (only when empty) */}
        {messages.length === 0 && !thinking && (
          <div className="px-3 sm:px-4 pb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary/8 hover:bg-primary/15 text-primary border border-primary/20 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <div className="border-t border-border/60 p-3 bg-white">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Ask Layla anything…"
              className="flex-1 resize-none rounded-xl border border-border/70 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition placeholder:text-muted-foreground"
            />
            <Button
              onClick={() => send()}
              disabled={!input.trim() || thinking}
              size="icon"
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-deep hover:opacity-90 shadow-md flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
            Powered by AI · Your privacy is respected
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ChatWidget;
