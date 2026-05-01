import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  MessageCircle, Search, RefreshCw, Sparkles, UserRound, Bot,
  TrendingUp, Clock, Users, MessagesSquare, AlertCircle,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ChatMsg {
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
}

type Range = "today" | "week" | "month" | "all";

const RANGE_LABELS: Record<Range, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
  all: "All time",
};

const OnlineSupportHistory = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<Range>("week");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    void load();
    const ch = supabase
      .channel("admin-online-support-history")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_messages" },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const load = async () => {
    try {
      // Pull all messages that belong to an online-chat session (session_id set)
      const { data, error } = await supabase
        .from("user_messages")
        .select("*")
        .not("session_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      const list = (data ?? []) as ChatMsg[];
      setMessages(list);

      const ids = Array.from(new Set(list.map((m) => m.user_id)));
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", ids);
        const map: Record<string, ProfileLite> = {};
        (profs ?? []).forEach((p: any) => (map[p.user_id] = p));
        setProfiles(map);
      }
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Failed to load chat history",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sinceMs = (r: Range) => {
    const now = Date.now();
    if (r === "today") return now - 24 * 60 * 60 * 1000;
    if (r === "week") return now - 7 * 24 * 60 * 60 * 1000;
    if (r === "month") return now - 30 * 24 * 60 * 60 * 1000;
    return 0;
  };

  // Group by session_id
  const sessions = useMemo(() => {
    const since = sinceMs(range);
    const inRange = messages.filter(
      (m) => new Date(m.created_at).getTime() >= since
    );

    const bySession: Record<string, ChatMsg[]> = {};
    inRange.forEach((m) => {
      if (!m.session_id) return;
      (bySession[m.session_id] ||= []).push(m);
    });

    let entries = Object.entries(bySession).map(([sid, msgs]) => {
      const sorted = [...msgs].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const userMsgs = sorted.filter((m) => !m.from_admin && !m.is_ai);
      const aiMsgs = sorted.filter((m) => m.is_ai);
      const adminMsgs = sorted.filter((m) => m.from_admin && !m.is_ai);
      const handoff = sorted.some((m) => m.handoff_requested);
      return {
        sessionId: sid,
        userId: first.user_id,
        msgs: sorted,
        first,
        last,
        userMsgs,
        aiMsgs,
        adminMsgs,
        handoff,
        startedAt: first.created_at,
        lastAt: last.created_at,
        total: sorted.length,
      };
    });

    if (search.trim()) {
      const q = search.toLowerCase();
      entries = entries.filter((e) => {
        const p = profiles[e.userId];
        return (
          p?.full_name?.toLowerCase().includes(q) ||
          p?.email?.toLowerCase().includes(q) ||
          e.msgs.some((m) => m.message?.toLowerCase().includes(q))
        );
      });
    }

    entries.sort(
      (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
    );
    return entries;
  }, [messages, profiles, search, range]);

  const stats = useMemo(() => {
    const since = sinceMs(range);
    const inRange = messages.filter(
      (m) => new Date(m.created_at).getTime() >= since
    );
    const sessionIds = new Set(inRange.map((m) => m.session_id).filter(Boolean));
    const userIds = new Set(inRange.map((m) => m.user_id));
    const userMsgs = inRange.filter((m) => !m.from_admin && !m.is_ai).length;
    const aiMsgs = inRange.filter((m) => m.is_ai).length;
    const handoffSessions = sessions.filter((s) => s.handoff).length;

    // Avg messages per session
    const avgPerSession = sessionIds.size
      ? (inRange.length / sessionIds.size).toFixed(1)
      : "0";

    return {
      totalSessions: sessionIds.size,
      uniqueUsers: userIds.size,
      userMsgs,
      aiMsgs,
      handoffSessions,
      avgPerSession,
    };
  }, [messages, range, sessions]);

  const selected = useMemo(
    () => sessions.find((s) => s.sessionId === selectedSession) ?? null,
    [sessions, selectedSession]
  );

  useEffect(() => {
    if (!selectedSession && sessions.length > 0) {
      setSelectedSession(sessions[0].sessionId);
    }
  }, [sessions, selectedSession]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[560px]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <MessagesSquare className="h-5 w-5 text-primary" />
            Online Support — Chat History
          </h2>
          <p className="text-sm text-muted-foreground">
            Every conversation users had with the in-app AI assistant.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 items-center bg-muted rounded-lg p-1">
            {(["today", "week", "month", "all"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                  range === r
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {RANGE_LABELS[r]}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => load()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          icon={<MessagesSquare className="h-4 w-4" />}
          label="Conversations"
          value={stats.totalSessions}
          hint={RANGE_LABELS[range]}
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Unique users"
          value={stats.uniqueUsers}
          hint="Engaged with chat"
        />
        <StatCard
          icon={<UserRound className="h-4 w-4" />}
          label="User messages"
          value={stats.userMsgs}
          hint={`${stats.avgPerSession} msgs / convo`}
        />
        <StatCard
          icon={<Bot className="h-4 w-4" />}
          label="AI replies"
          value={stats.aiMsgs}
          hint="Auto-answered"
        />
        <StatCard
          icon={<AlertCircle className="h-4 w-4" />}
          label="Handoff requests"
          value={stats.handoffSessions}
          hint="Asked for human"
          accent={stats.handoffSessions > 0 ? "warning" : "default"}
        />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by user, email, message…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9"
        />
      </div>

      {/* Sessions grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="py-3 px-4 border-b bg-muted/30">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageCircle className="h-3.5 w-3.5" />
              Sessions ({sessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {sessions.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  <MessagesSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  No chat sessions in this range.
                </div>
              ) : (
                <ul className="divide-y">
                  {sessions.map((s) => {
                    const p = profiles[s.userId];
                    const active = s.sessionId === selectedSession;
                    return (
                      <li key={s.sessionId}>
                        <button
                          onClick={() => setSelectedSession(s.sessionId)}
                          className={cn(
                            "w-full text-left p-3 hover:bg-muted/50 transition-colors flex flex-col gap-1",
                            active && "bg-primary/5 border-l-2 border-primary"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-sm truncate">
                              {p?.full_name || p?.email || "Unknown user"}
                            </span>
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                              {s.total} msgs
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            {s.handoff && (
                              <Badge
                                variant="outline"
                                className="h-4 px-1 text-[9px] font-medium border-amber-500 text-amber-700"
                              >
                                Handoff
                              </Badge>
                            )}
                            <span>
                              {s.userMsgs.length}↑ · {s.aiMsgs.length}↓
                              {s.adminMsgs.length > 0 && ` · ${s.adminMsgs.length} admin`}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {s.first.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(s.lastAt), {
                              addSuffix: true,
                            })}
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

        {/* Conversation transcript */}
        <Card className="overflow-hidden flex flex-col">
          {!selected ? (
            <CardContent className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground">
              <div>
                <MessagesSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Select a session to read the full transcript.</p>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader className="py-3 px-4 border-b bg-muted/30">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-sm">
                      {profiles[selected.userId]?.full_name ||
                        profiles[selected.userId]?.email ||
                        "Unknown user"}
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {profiles[selected.userId]?.email} · session {selected.sessionId.slice(0, 8)}…
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(selected.startedAt), "MMM d, HH:mm")}
                    </span>
                    <span>{selected.total} messages</span>
                    {selected.handoff && (
                      <Badge variant="outline" className="border-amber-500 text-amber-700 h-5">
                        Handoff
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <ScrollArea className="h-[600px] p-4">
                  <div className="space-y-3">
                    {selected.msgs.map((m) => {
                      const isUser = !m.from_admin && !m.is_ai;
                      const isAi = m.is_ai;
                      const isAdmin = m.from_admin && !m.is_ai;
                      return (
                        <div
                          key={m.id}
                          className={cn(
                            "flex gap-2",
                            isUser ? "justify-end" : "justify-start"
                          )}
                        >
                          {!isUser && (
                            <div
                              className={cn(
                                "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
                                isAi
                                  ? "bg-primary/10 text-primary"
                                  : "bg-amber-100 text-amber-700"
                              )}
                            >
                              {isAi ? (
                                <Sparkles className="h-3.5 w-3.5" />
                              ) : (
                                <UserRound className="h-3.5 w-3.5" />
                              )}
                            </div>
                          )}
                          <div
                            className={cn(
                              "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm",
                              isUser
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : isAi
                                ? "bg-muted rounded-bl-sm"
                                : "bg-amber-50 border border-amber-200 rounded-bl-sm"
                            )}
                          >
                            <div className="flex items-center gap-1.5 mb-1 text-[10px] opacity-75">
                              <span className="font-semibold">
                                {isUser ? "User" : isAi ? "AI Assistant" : "Admin"}
                              </span>
                              <span>·</span>
                              <span>
                                {format(new Date(m.created_at), "MMM d, HH:mm")}
                              </span>
                              {m.handoff_requested && (
                                <span className="ml-1">· 🙋 handoff</span>
                              )}
                            </div>
                            <p className="whitespace-pre-wrap break-words">{m.message}</p>
                          </div>
                          {isUser && (
                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                              <UserRound className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  hint?: string;
  accent?: "default" | "warning";
}

const StatCard = ({ icon, label, value, hint, accent = "default" }: StatCardProps) => (
  <Card
    className={cn(
      "overflow-hidden",
      accent === "warning" && "border-amber-300 bg-amber-50/50"
    )}
  >
    <CardContent className="p-3 sm:p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
    </CardContent>
  </Card>
);

export default OnlineSupportHistory;
