import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UserOption { user_id: string; full_name: string | null; email: string | null; }

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  preselectUserId?: string;
}

export function MessageUserDialog({ open, onOpenChange, preselectUserId }: Props) {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<UserOption | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .order('created_at', { ascending: false })
        .limit(2000);
      setUsers(data || []);
      if (preselectUserId) {
        const u = (data || []).find((x) => x.user_id === preselectUserId);
        if (u) setSelected(u);
      }
    })();
  }, [open, preselectUserId]);

  const reset = () => {
    setSelected(null); setSubject(''); setMessage('');
  };

  const handleSend = async () => {
    if (!selected || !subject.trim() || !message.trim()) {
      toast.error('Pick a user and fill subject + message');
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from('user_messages').insert({
        user_id: selected.user_id,
        subject: subject.trim(),
        message: message.trim(),
        from_admin: true,
        read_status: false,
      });
      if (error) throw error;
      toast.success(`Message sent to ${selected.full_name || selected.email}`);
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!sending) { onOpenChange(v); if (!v) reset(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" /> Message a user
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Recipient</Label>
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  {selected ? (
                    <span className="truncate">{selected.full_name || '(no name)'} · {selected.email}</span>
                  ) : (
                    'Search by name or email…'
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Type name or email…" />
                  <CommandList>
                    <CommandEmpty>No user found.</CommandEmpty>
                    <CommandGroup>
                      {users.map((u) => (
                        <CommandItem
                          key={u.user_id}
                          value={`${u.full_name || ''} ${u.email || ''}`}
                          onSelect={() => { setSelected(u); setPickerOpen(false); }}
                        >
                          <Check className={cn('mr-2 h-4 w-4', selected?.user_id === u.user_id ? 'opacity-100' : 'opacity-0')} />
                          <div className="flex flex-col">
                            <span className="font-medium">{u.full_name || '(no name)'}</span>
                            <span className="text-xs text-muted-foreground">{u.email}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="m-subject">Subject</Label>
            <Input id="m-subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} />
          </div>
          <div>
            <Label htmlFor="m-message">Message</Label>
            <Textarea id="m-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); reset(); }} disabled={sending}>Cancel</Button>
          <Button onClick={handleSend} disabled={sending || !selected}>
            {sending ? 'Sending…' : 'Send message'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
