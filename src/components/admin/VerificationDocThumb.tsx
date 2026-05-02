import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Image as ImageIcon, ZoomIn, ShieldAlert, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  verificationId: string;
  alt?: string;
  className?: string;
  onClick?: (url: string) => void;
}

/**
 * Inline thumbnail for an admin to preview a verification document
 * without leaving the card. Uses the existing `admin-get-document`
 * edge function. Click to open the full-size dialog.
 */
export function VerificationDocThumb({ verificationId, alt = 'Verification document', className, onClick }: Props) {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fnErr } = await supabase.functions.invoke('admin-get-document', {
          body: { verification_id: verificationId },
        });
        if (cancel) return;
        if (fnErr) throw fnErr;
        if (data?.signed_url) setUrl(data.signed_url);
        else setError('No document');
      } catch (e: any) {
        if (!cancel) setError(e?.message || 'Failed to load');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [verificationId]);

  return (
    <button
      type="button"
      onClick={() => url && onClick?.(url)}
      className={cn(
        'group relative w-full overflow-hidden rounded-xl border-2 border-primary/20 bg-muted/30 transition-all hover:border-primary/60 hover:shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.4)]',
        'aspect-[4/3]',
        className
      )}
      aria-label={alt}
    >
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-[11px]">Loading preview…</span>
        </div>
      )}
      {!loading && error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-600 gap-1.5 px-2 text-center">
          <ShieldAlert className="h-5 w-5" />
          <span className="text-[11px] font-medium">Preview unavailable</span>
          <span className="text-[10px] text-muted-foreground line-clamp-1">{error}</span>
        </div>
      )}
      {!loading && url && (
        <>
          <img
            src={url}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">
              <ImageIcon className="h-3 w-3" /> ID
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">
              <ZoomIn className="h-3 w-3" /> Zoom
            </span>
          </div>
        </>
      )}
    </button>
  );
}

export default VerificationDocThumb;
