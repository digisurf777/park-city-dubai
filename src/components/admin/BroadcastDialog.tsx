import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  totalUsers: number;
}

export function BroadcastDialog({ open, onOpenChange, totalUsers }: Props) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const reset = () => {
    setSubject(''); setMessage(''); setConfirm(false);
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    setSending(true);
    try {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('user_id');
      if (pErr) throw pErr;

      const rows = (profiles || []).map((p) => ({
        user_id: p.user_id,
        subject: subject.trim(),
        message: message.trim(),
        from_admin: true,
        read_status: false,
      }));

      // Batch insert in chunks of 200 to avoid payload limits
      for (let i = 0; i < rows.length; i += 200) {
        const chunk = rows.slice(i, i + 200);
        const { error } = await supabase.from('user_messages').insert(chunk);
        if (error) throw error;
      }

      toast.success(`Broadcast sent to ${rows.length} users`);
      reset();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to broadcast');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!sending) { onOpenChange(v); if (!v) reset(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Broadcast to all users
          </DialogTitle>
          <DialogDescription>
            This message will be delivered to <span className="font-semibold text-foreground">{totalUsers}</span> users' inbox.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="b-subject">Subject</Label>
            <Input
              id="b-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Important update from ShazamParking"
              maxLength={150}
            />
          </div>
          <div>
            <Label htmlFor="b-message">Message</Label>
            <Textarea
              id="b-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message…"
              rows={6}
            />
          </div>

          {!confirm ? (
            <Button
              variant="default"
              className="w-full"
              disabled={!subject.trim() || !message.trim()}
              onClick={() => setConfirm(true)}
            >
              Continue
            </Button>
          ) : (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="text-sm">
                You are about to send this message to <strong>{totalUsers}</strong> users. This action cannot be undone.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); reset(); }} disabled={sending}>
            Cancel
          </Button>
          {confirm && (
            <Button onClick={handleSend} disabled={sending}>
              {sending ? 'Sending…' : `Send to ${totalUsers} users`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
