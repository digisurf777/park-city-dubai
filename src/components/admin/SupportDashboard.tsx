import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Mail, MailOpen, Sparkles, Send, Search, Clock, Inbox,
  CheckCircle2, MessageSquare, RefreshCw, AlertCircle, User,
  Filter, TrendingUp, Loader2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface UserMessage {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  from_admin: boolean;
  is_ai: boolean;
  read_status: boolean;
  handoff_requested: boolean;
  created_at: string;
  session_id: string | null;
}

interface ProfileLite {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

type Filter = "all" | "unread" | "feedback" | "handoff";

const isFeedback = (m: UserMessage) => m.subject?.toLowerCase().startsWith("[feedback]");

const SupportDashboard = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("unread");
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    void load();
    const channel = supabase
      .channel("admin-support-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_messages" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const load = async () => {
    try {
      const { data: msgs, error } = await supabase
        .from("user_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      const list = (msgs ?? []) as UserMessage[];
      setMessages(list);

      const ids = Array.from(new Set(list.map((m) => m.user_id)));
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, full_name, email, phone")
          .in("user_id", ids);
        const map: Record<string, ProfileLite> = {};
        (profs ?? []).forEach((p: any) => (map[p.user_id] = p));
        setProfiles(map);
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to load support inbox", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ------------ Stats ------------
  const stats = useMemo(() => {
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Group by user; latest message per user
    const byUser: Record<string, UserMessage[]> = {};
    messages.forEach((m) => {
      (byUser[m.user_id] ||= []).push(m);
    });

    const conversations = Object.values(byUser);
    // "Pending" = newest message in convo is from user (not admin) and unread
    const pending = conversations.filter((conv) => {
      const newest = conv[0]; // already sorted desc
      return newest && !newest.from_admin;
    });

    const sentToday = messages.filter((m) => m.from_admin && !m.is_ai && new Date(m.created_at).getTime() > dayAgo).length;
    const sentWeek = messages.filter((m) => m.from_admin && !m.is_ai && new Date(m.created_at).getTime() > weekAgo).length;

    // Avg response time: for each user msg followed by admin reply within same session/user
    const responseTimes: number[] = [];
    Object.values(byUser).forEach((conv) => {
      const asc = [...conv].reverse();
      for (let i = 0; i < asc.length - 1; i++) {
        if (!asc[i].from_admin) {
          // find next admin reply
          const next = asc.slice(i + 1).find((x) => x.from_admin);
          if (next) {
            responseTimes.push(new Date(next.created_at).getTime() - new Date(asc[i].created_at).getTime());
          }
        }
      }
    });
    const avgMs = responseTimes.length ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;
    const avgHours = avgMs / 3_600_000;

    const feedbackCount = messages.filter((m) => isFeedback(m)).length;
    const contactCount = messages.filter((m) => !isFeedback(m) && !m.from_admin).length;
    const handoffCount = messages.filter((m) => m.handoff_requested).length;

    return {
      pendingConvos: pending.length,
      sentToday,
      sentWeek,
      avgHours,
      feedbackCount,
      contactCount,
      handoffCount,
      totalConvos: conversations.length,
    };
  }, [messages]);

  // ------------ Conversations list (one row per user) ------------
  const conversations = useMemo(() => {
    const byUser: Record<string, UserMessage[]> = {};
    messages.forEach((m) => {
      (byUser[m.user_id] ||= []).push(m);
    });

    let entries = Object.entries(byUser).map(([userId, msgs]) => {
      const newest = msgs[0];
      const unreadFromUser = msgs.filter((m) => !m.from_admin && !m.read_status).length;
      const isPending = newest && !newest.from_admin;
      const hasFeedback = msgs.some(isFeedback);
      const hasHandoff = msgs.some((m) => m.handoff_requested);
      return { userId, msgs, newest, unreadFromUser, isPending, hasFeedback, hasHandoff };
    });

    if (filter === "unread") entries = entries.filter((e) => e.isPending || e.unreadFromUser > 0);
    if (filter === "feedback") entries = entries.filter((e) => e.hasFeedback);
    if (filter === "handoff") entries = entries.filter((e) => e.hasHandoff);

    if (search.trim()) {
      const q = search.toLowerCase();
      entries = entries.filter((e) => {
        const p = profiles[e.userId];
        return (
          p?.full_name?.toLowerCase().includes(q) ||
          p?.email?.toLowerCase().includes(q) ||
          e.newest?.message?.toLowerCase().includes(q) ||
          e.newest?.subject?.toLowerCase().includes(q)
        );
      });
    }

    entries.sort((a, b) => new Date(b.newest.created_at).getTime() - new Date(a.newest.created_at).getTime());
    return entries;
  }, [messages, profiles, filter, search]);

  const selectedConvo = useMemo(
    () => conversations.find((c) => c.userId === selectedUserId) ?? null,
    [conversations, selectedUserId]
  );

  // Auto-select first conversation when none selected
  useEffect(() => {
    if (!selectedUserId && conversations.length > 0) {
      setSelectedUserId(conversations[0].userId);
    }
  }, [conversations, selectedUserId]);

  // Mark inbound as read when opened
  useEffect(() => {
    if (!selectedConvo) return;
    const unreadIds = selectedConvo.msgs
      .filter((m) => !m.from_admin && !m.read_status)
      .map((m) => m.id);
    if (unreadIds.length === 0) return;
    void supabase.from("user_messages").update({ read_status: true }).in("id", unreadIds);
  }, [selectedConvo?.userId]);

  // ------------ AI draft ------------
  const generateDraft = async () => {
    if (!selectedConvo) return;
    setDrafting(true);
    try {
      const { data, error } = await supabase.functions.invoke("support-chat", {
        body: { mode: "draft", targetUserId: selectedConvo.userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setReply(data?.reply || "");
      toast({ title: "AI draft ready", description: "Review, edit, then send." });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Draft failed",
        description: e.message?.includes("402")
          ? "AI credits exhausted. Add funds in workspace settings."
          : e.message?.includes("429")
          ? "Rate limited. Try again in a moment."
          : e.message,
        variant: "destructive",
      });
    } finally {
      setDrafting(false);
    }
  };

  // ------------ Send reply ------------
  const sendReply = async () => {
    if (!selectedConvo || !reply.trim()) return;
    setSending(true);
    try {
      const subject = selectedConvo.newest.subject?.startsWith("Re:")
        ? selectedConvo.newest.subject
        : `Re: ${selectedConvo.newest.subject || "Your message"}`;

      const { error: insertError } = await supabase.from("user_messages").insert({
        user_id: selectedConvo.userId,
        subject,
        message: reply.trim(),
        from_admin: true,
        is_ai: false,
        read_status: false,
      });
      if (insertError) throw insertError;

      // Email notification (don't block on failure)
      const profile = profiles[selectedConvo.userId];
      if (profile?.email) {
        await supabase.functions
          .invoke("send-user-reply-notification", {
            body: {
              userEmail: profile.email,
              userName: profile.full_name || "there",
              subject,
              adminMessage: reply.trim(),
            },
          })
          .catch((err) => console.warn("Email notification failed:", err));
      }

      setReply("");
      toast({ title: "Reply sent", description: "User will see it in their inbox and get an email." });
      void load();
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to send", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  // ------------ Render ------------
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Support Inbox
          </h2>
          <p className="text-sm text-muted-foreground">
            Reply to user messages with AI-assisted drafts.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Inbox className="h-4 w-4" />}
          label="Pending replies"
          value={stats.pendingConvos}
          accent={stats.pendingConvos > 0 ? "warning" : "default"}
          hint={`${stats.totalConvos} total conversations`}
        />
        <StatCard
          icon={<Send className="h-4 w-4" />}
          label="Sent today"
          value={stats.sentToday}
          hint={`${stats.sentWeek} this week`}
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Avg response"
          value={stats.avgHours < 1 ? `${Math.round(stats.avgHours * 60)}m` : `${stats.avgHours.toFixed(1)}h`}
          hint="Across all replies"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Categories"
          value={`${stats.contactCount}/${stats.feedbackCount}`}
          hint={`Contact / Feedback${stats.handoffCount ? ` · ${stats.handoffCount} handoff` : ""}`}
        />
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <div className="flex gap-1 items-center bg-muted rounded-lg p-1">
          {(["unread", "all", "feedback", "handoff"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize",
                filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Inbox grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        {/* Conversation list */}
        <Card className="overflow-hidden">
          <CardHeader className="py-3 px-4 border-b bg-muted/30">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="h-3.5 w-3.5" />
              Conversations ({conversations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[560px]">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  <Inbox className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  No conversations match this filter.
                </div>
              ) : (
                <ul className="divide-y">
                  {conversations.map((c) => {
                    const profile = profiles[c.userId];
                    const isActive = c.userId === selectedUserId;
                    return (
                      <li key={c.userId}>
                        <button
                          onClick={() => {
                            setSelectedUserId(c.userId);
                            setReply("");
                          }}
                          className={cn(
                            "w-full text-left p-3 hover:bg-muted/50 transition-colors flex flex-col gap-1",
                            isActive && "bg-primary/5 border-l-2 border-primary"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {c.isPending ? (
                                <Mail className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                              ) : (
                                <MailOpen className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              )}
                              <span className="font-semibold text-sm truncate">
                                {profile?.full_name || profile?.email || "Unknown user"}
                              </span>
                            </div>
                            {c.unreadFromUser > 0 && (
                              <Badge variant="default" className="h-5 min-w-5 px-1.5 text-[10px]">
                                {c.unreadFromUser}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            {c.hasFeedback && (
                              <Badge variant="outline" className="h-4 px-1 text-[9px] font-medium">
                                Feedback
                              </Badge>
                            )}
                            {c.hasHandoff && (
                              <Badge variant="outline" className="h-4 px-1 text-[9px] font-medium border-amber-500 text-amber-700">
                                Handoff
                              </Badge>
                            )}
                            <span className="truncate">{c.newest.subject || "(no subject)"}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {c.newest.from_admin ? "↳ " : ""}{c.newest.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(c.newest.created_at), { addSuffix: true })}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Conversation thread + reply */}
        <Card className="overflow-hidden flex flex-col">
          {!selectedConvo ? (
            <CardContent className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground">
              <div>
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Select a conversation to start replying.</p>
              </div>
            </CardContent>
          ) : (
            <>
              {/* Thread header */}
              <CardHeader className="py-3 px-4 border-b bg-muted/30">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm truncate">
                        {profiles[selectedConvo.userId]?.full_name || "Unknown user"}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground truncate">
                        {profiles[selectedConvo.userId]?.email || "no email"}
                        {profiles[selectedConvo.userId]?.phone ? ` · ${profiles[selectedConvo.userId].phone}` : ""}
                      </p>
                    </div>
                  </div>
                  {selectedConvo.hasHandoff && (
                    <Badge variant="outline" className="border-amber-500 text-amber-700 gap-1">
                      <AlertCircle className="h-3 w-3" /> Handoff requested
                    </Badge>
                  )}
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 max-h-[380px]">
                <div className="space-y-3">
                  {[...selectedConvo.msgs].reverse().map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex flex-col gap-1",
                        m.from_admin ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                          m.from_admin
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted rounded-bl-sm"
                        )}
                      >
                        {m.subject && (
                          <p className={cn("text-[10px] font-bold uppercase tracking-wide mb-1 opacity-70")}>
                            {m.subject}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground px-1">
                        {m.from_admin ? (m.is_ai ? "🤖 AI" : "✓ You") : "User"}
                        {" · "}
                        {format(new Date(m.created_at), "d MMM HH:mm")}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Reply composer */}
              <div className="border-t p-3 space-y-2 bg-muted/20">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-xs font-semibold text-muted-foreground">Your reply</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generateDraft}
                    disabled={drafting}
                    className="h-7 text-xs"
                  >
                    {drafting ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    {drafting ? "Drafting…" : "Generate AI draft"}
                  </Button>
                </div>
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply, or click 'Generate AI draft' to start with a suggestion…"
                  rows={4}
                  className="resize-none text-sm bg-background"
                />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] text-muted-foreground">
                    {reply.length} chars · sent in-app + email notification
                  </p>
                  <Button
                    size="sm"
                    onClick={sendReply}
                    disabled={!reply.trim() || sending}
                  >
                    {sending ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Send reply
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

// ----- Stat card -----
const StatCard = ({
  icon, label, value, hint, accent = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  hint?: string;
  accent?: "default" | "warning";
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <span
          className={cn(
            "h-7 w-7 rounded-lg flex items-center justify-center",
            accent === "warning" ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
          )}
        >
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold mt-1.5">{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
    </CardContent>
  </Card>
);

export default SupportDashboard;
