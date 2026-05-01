import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  MessageCircle, X, Send, Minimize2, Maximize2, Sparkles, UserRound,
  Plus, History, ArrowLeft, CheckCircle2, Clock, UserCheck, AlertCircle, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import supportAvatar from "@/assets/online-support-agent.jpg";

interface Message {
  id: string;
  message: string;
  from_admin: boolean;
  is_ai?: boolean;
  read_status: boolean;
  created_at: string;
  session_id?: string | null;
  handoff_requested?: boolean | null;
  pending?: boolean;
}

interface SessionSummary {
  session_id: string;
  last_message: string;
  last_at: string;
  count: number;
  has_handoff: boolean;
}

const STARTERS = [
  { icon: "🅿️", label: "List my space", prompt: "I'd like to list my parking space. How do I get started?" },
  { icon: "💳", label: "Payments & payouts", prompt: "Can you explain how payments and payouts work on Shazam Parking?" },
  { icon: "🙋", label: "Talk to a human", prompt: "I'd like to speak with a human agent please." },
];

const STORAGE_SESSION_KEY = "shazam_chat_session_id";
const SUPPORT_EMAIL = "support@shazamparking.ae";

const buildMailto = (subject: string, body: string) =>
  `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

const ChatWidget = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Always start a brand-new session id when the widget mounts (per user's request).
  useEffect(() => {
    const fresh = crypto.randomUUID();
    setSessionId(fresh);
    sessionStorage.setItem(STORAGE_SESSION_KEY, fresh);
  }, [user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { if (messages.length) scrollToBottom(); }, [messages, thinking]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_messages")
      .select("id, message, from_admin, is_ai, read_status, created_at, session_id, handoff_requested")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    const list = (data as any as Message[]) ?? [];
    setAllMessages(list);
    setUnread(list.filter((m) => m.from_admin && !m.read_status).length);
  }, [user]);

  // Filter visible messages by current session
  useEffect(() => {
    if (!sessionId) { setMessages([]); return; }
    setMessages(allMessages.filter((m) => m.session_id === sessionId));
  }, [allMessages, sessionId]);

  useEffect(() => {
    if (!user) return;
    fetchAll();
    const channel = supabase
      .channel("chat-messages-widget")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_messages", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setAllMessages((prev) => prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]);
          if (newMsg.from_admin && !isOpen) setUnread((p) => p + 1);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, isOpen, fetchAll]);

  // Build session history list (grouped)
  const sessions: SessionSummary[] = useMemo(() => {
    const groups = new Map<string, Message[]>();
    for (const m of allMessages) {
      const sid = m.session_id || "legacy";
      if (!groups.has(sid)) groups.set(sid, []);
      groups.get(sid)!.push(m);
    }
    const list: SessionSummary[] = [];
    groups.forEach((msgs, sid) => {
      if (sid === sessionId) return; // current session lives in main view
      const last = msgs[msgs.length - 1];
      list.push({
        session_id: sid,
        last_message: last?.message?.slice(0, 80) ?? "",
        last_at: last?.created_at ?? "",
        count: msgs.length,
        has_handoff: msgs.some((m) => m.handoff_requested),
      });
    });
    list.sort((a, b) => (b.last_at || "").localeCompare(a.last_at || ""));
    return list;
  }, [allMessages, sessionId]);

  const conversationStatus = useMemo(() => {
    if (!messages.length) return { label: "Online now", color: "bg-emerald-400", icon: CheckCircle2 };
    const last = messages[messages.length - 1];
    if (messages.some((m) => m.handoff_requested)) {
      return { label: "Awaiting human agent", color: "bg-amber-500", icon: UserCheck };
    }
    if (last.from_admin && !last.is_ai) return { label: "Replied by team", color: "bg-emerald-500", icon: CheckCircle2 };
    if (last.from_admin && last.is_ai) return { label: "Active conversation", color: "bg-emerald-400", icon: CheckCircle2 };
    if (thinking) return { label: "Typing…", color: "bg-primary", icon: Clock };
    return { label: "Waiting for reply", color: "bg-amber-500", icon: Clock };
  }, [messages, thinking]);

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
    setView("chat");
    setUnread(0);
    markAllRead();
  };

  // Allow MobileBottomNav (and any other UI) to open the chat via a global event
  useEffect(() => {
    const open = () => handleOpen();
    window.addEventListener("open-support-chat", open);
    return () => window.removeEventListener("open-support-chat", open);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewChat = () => {
    const fresh = crypto.randomUUID();
    setSessionId(fresh);
    sessionStorage.setItem(STORAGE_SESSION_KEY, fresh);
    setView("chat");
    setInput("");
  };

  const openSession = (sid: string) => {
    setSessionId(sid);
    setView("chat");
  };

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || !user || thinking) return;
    setInput("");
    setThinking(true);

    const tempId = `tmp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId, message: text, from_admin: false, is_ai: false,
      read_status: true, created_at: new Date().toISOString(),
      session_id: sessionId, pending: true,
    };
    setAllMessages((prev) => [...prev, optimistic]);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/support-chat`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text, mode: "reply", sessionId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      if (data.handoff) {
        toast({
          title: "Connecting you with a human",
          description: "Our team has been notified by email and will follow up shortly.",
        });
      }
      await fetchAll();
    } catch (e: any) {
      console.error("Chat send failed", e);
      toast({
        title: "Couldn't reach support",
        description: e?.message || "Please try again in a moment.",
        variant: "destructive",
      });
      setAllMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setThinking(false);
    }
  };

  if (!user) return null;

  // ---------- Launcher ----------
  if (!isOpen) {
    return (
      <div className="hidden md:block fixed bottom-6 right-6 z-50">
        <button
          onClick={handleOpen}
          aria-label="Open online support chat"
          className="group relative flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full bg-gradient-to-br from-primary via-primary to-primary-deep text-white shadow-[0_12px_28px_-8px_hsl(var(--primary)/0.55),0_4px_12px_-4px_hsl(var(--primary-deep)/0.4),inset_0_1px_0_0_hsl(0_0%_100%/0.3)] hover:shadow-[0_16px_32px_-8px_hsl(var(--primary)/0.65),inset_0_1px_0_0_hsl(0_0%_100%/0.4)] hover:-translate-y-0.5 transition-all duration-300 ring-1 ring-white/30"
        >
          <span className="relative">
            <img
              src={supportAvatar}
              alt="Online Support agent"
              width={32}
              height={32}
              loading="lazy"
              className="relative w-8 h-8 rounded-full object-cover ring-2 ring-white/80"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-200">Live</span>
            <span className="text-[13px] font-bold whitespace-nowrap">Support</span>
          </span>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white">
              {unread}
            </span>
          )}
        </button>
      </div>
    );
  }

  // ---------- Window sizing: full-screen takeover when expanded on large viewports ----------
  const windowSize = isExpanded
    ? "fixed inset-2 sm:inset-6 lg:inset-10 xl:inset-16"
    : "fixed inset-x-3 bottom-3 top-20 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[640px]";

  const StatusIcon = conversationStatus.icon;

  return (
    <div className={`${windowSize} z-50 flex flex-col`}>
      <Card className="h-full flex flex-col shadow-[0_25px_60px_-12px_hsl(var(--primary-deep)/0.45)] border-primary/15 overflow-hidden rounded-2xl bg-gradient-to-b from-white to-surface">
        {/* Header */}
        <div className="relative flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-primary to-primary-deep text-white">
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_20%_50%,white,transparent_60%)]" />
          {view === "history" ? (
            <Button variant="ghost" size="icon" onClick={() => setView("chat")} className="relative h-9 w-9 text-white hover:bg-white/15" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : (
            <div className="relative">
              <img src={supportAvatar} alt="Online Support agent" width={40} height={40}
                className="relative w-10 h-10 rounded-full object-cover ring-2 ring-white/80" loading="lazy" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-primary-deep" />
            </div>
          )}
          <div className="flex-1 min-w-0 relative">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm sm:text-base truncate">
                {view === "history" ? "Chat history" : "Online Support"}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs opacity-95">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${conversationStatus.color}`} />
              <StatusIcon className="h-3 w-3" />
              <span className="truncate">{conversationStatus.label}</span>
            </div>
          </div>
          <div className="relative flex items-center gap-1">
            {view === "chat" && messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={startNewChat}
                className="h-8 px-2 sm:px-3 text-white hover:bg-white/15 gap-1" aria-label="Start new chat" title="Start new chat">
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs font-semibold">New</span>
              </Button>
            )}
            <a
              href={buildMailto(
                "Support request - Shazam Parking",
                `Hi Shazam Parking team,\n\n[Please describe your question here]\n\n- Sent from in-app support (${user?.email ?? ""})`
              )}
              className="hidden sm:inline-flex items-center gap-1 h-8 px-3 rounded-md text-white hover:bg-white/15 text-xs font-semibold transition-colors"
              title={`Email ${SUPPORT_EMAIL}`}
            >
              <Mail className="h-3.5 w-3.5" />
              Email us
            </a>
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded((v) => !v)}
              className="h-8 w-8 text-white hover:bg-white/15 hidden sm:inline-flex" aria-label={isExpanded ? "Shrink" : "Expand"}>
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-white hover:bg-white/15" aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body - chat view */}
        {view === "chat" && (
          <>
            <div className={`flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3 bg-gradient-to-b from-white to-surface/40 ${isExpanded ? "lg:px-12 xl:px-24" : ""}`}>
              {messages.length === 0 && (
                <div className="text-center pt-3 pb-1">
                  <div className="relative inline-block mb-2.5">
                    <img src={supportAvatar} alt="Online Support agent"
                      width={isExpanded ? 88 : 64} height={isExpanded ? 88 : 64}
                      className={`relative ${isExpanded ? "w-22 h-22" : "w-16 h-16"} rounded-full object-cover ring-2 ring-primary/15 shadow-md`}
                      style={{ width: isExpanded ? 88 : 64, height: isExpanded ? 88 : 64 }}
                      loading="lazy" />
                    <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
                  </div>
                  <p className={`${isExpanded ? "text-xl" : "text-base"} font-bold text-foreground leading-tight`}>How can we help?</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Online Support · Available now</p>
                  <p className={`${isExpanded ? "text-sm mt-2 max-w-md" : "text-[11px] mt-1.5 max-w-[280px]"} text-muted-foreground mx-auto leading-snug`}>
                    Type below or pick a quick prompt. We&apos;ll loop in a teammate by email if needed.
                  </p>
                </div>
              )}

              {/* Handoff confirmation banner */}
              {messages.some((m) => m.handoff_requested) && (
                <div className="mx-auto max-w-[420px] rounded-xl border border-amber-300 bg-amber-50 p-3 flex items-start gap-3">
                  <UserCheck className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-amber-900">A human teammate has been notified</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      We typically reply within a few business hours. Want to add details by email?
                    </p>
                    <a
                      href={buildMailto(
                        "Follow-up on my support chat - Shazam Parking",
                        `Hi Shazam Parking team,\n\nFollowing up on my in-app chat. Additional details:\n\n[Add details here]\n\n- ${user?.email ?? ""}`
                      )}
                      className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-amber-900 underline underline-offset-2 hover:text-amber-700"
                    >
                      <Mail className="h-3 w-3" /> Email {SUPPORT_EMAIL}
                    </a>
                  </div>
                </div>
              )}

              {messages.map((msg) => {
                const isMe = !msg.from_admin;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2`}>
                    {!isMe && (
                      <img src={supportAvatar} alt="" width={28} height={28}
                        className="w-7 h-7 rounded-full object-cover mt-auto flex-shrink-0" loading="lazy" />
                    )}
                    <div className={`${isExpanded ? "max-w-[70%]" : "max-w-[82%]"} px-4 py-2.5 rounded-2xl text-sm shadow-sm break-words ${
                      isMe
                        ? "bg-gradient-to-br from-primary to-primary-deep text-white rounded-br-md"
                        : "bg-white border border-border/60 text-foreground rounded-bl-md"
                    } ${msg.pending ? "opacity-70" : ""}`}>
                      {!isMe && (
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
                            Online Support
                          </span>
                          {msg.handoff_requested && (
                            <Badge variant="outline" className="h-4 px-1.5 text-[9px] border-amber-400 text-amber-700 bg-amber-50">
                              <UserCheck className="h-2.5 w-2.5 mr-0.5" />Human notified
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
                  <img src={supportAvatar} alt="" width={28} height={28}
                    className="w-7 h-7 rounded-full object-cover mt-auto flex-shrink-0" loading="lazy" />
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

            {/* Conversation starters - only when empty */}
            {messages.length === 0 && !thinking && (
              <div className={`px-3 sm:px-4 pb-3 ${isExpanded ? "lg:px-12 xl:px-24" : ""}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 text-center">
                  Quick start
                </p>
                <div className={`grid gap-2 ${isExpanded ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-2"}`}>
                  {STARTERS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => send(s.prompt)}
                      className="group flex items-center gap-2 px-2.5 py-2.5 rounded-xl text-xs font-medium bg-white text-foreground border border-border/60 hover:border-primary hover:bg-primary/5 hover:shadow-md hover:-translate-y-0.5 transition-all text-left active:scale-95"
                    >
                      <span className="text-base flex-shrink-0">{s.icon}</span>
                      <span className="truncate group-hover:text-primary transition-colors">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Composer */}
            <div className={`border-t border-border/60 p-3 bg-white ${isExpanded ? "lg:px-12 xl:px-24" : ""}`}>
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
                <Button onClick={() => send()} disabled={!input.trim() || thinking} size="icon"
                  className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-deep hover:opacity-90 shadow-md flex-shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 px-1 gap-2 flex-wrap">
                <button
                  onClick={() => setView("history")}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  <History className="h-3 w-3" />
                  History {sessions.length > 0 && `(${sessions.length})`}
                </button>
                <a
                  href={buildMailto(
                    "Support request - Shazam Parking",
                    `Hi Shazam Parking team,\n\n[Please describe your question here]\n\n- Sent from in-app support (${user?.email ?? ""})`
                  )}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium"
                  title={`Email ${SUPPORT_EMAIL}`}
                >
                  <Mail className="h-3 w-3" />
                  Email support
                </a>
                {messages.length > 0 && (
                  <button
                    onClick={startNewChat}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    <Plus className="h-3 w-3" />
                    Clear / New chat
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Body - history view */}
        {view === "history" && (
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-surface/40">
            <p className="text-xs text-muted-foreground mb-3">
              Pick a past conversation to view it, or start fresh.
            </p>
            <Button onClick={() => { startNewChat(); }} className="w-full mb-4 bg-gradient-to-r from-primary to-primary-deep">
              <Plus className="h-4 w-4 mr-1.5" /> Start a new chat
            </Button>
            {sessions.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                No past conversations yet.
              </div>
            )}
            <div className="space-y-2">
              {sessions.map((s) => (
                <button
                  key={s.session_id}
                  onClick={() => openSession(s.session_id)}
                  className="w-full text-left p-3 rounded-xl bg-white border border-border/60 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {new Date(s.last_at).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <div className="flex items-center gap-1">
                      {s.has_handoff && (
                        <Badge variant="outline" className="h-4 px-1.5 text-[9px] border-amber-400 text-amber-700 bg-amber-50">
                          <UserCheck className="h-2.5 w-2.5 mr-0.5" />Human
                        </Badge>
                      )}
                      <Badge variant="outline" className="h-4 px-1.5 text-[9px]">{s.count} msgs</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">{s.last_message || "(empty)"}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChatWidget;
