import { Badge } from "@/components/ui/badge";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

const PreviewModeBanner = () => {
  const { previewMode } = useFeatureFlags();
  if (!previewMode) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mt-2 rounded-md border bg-muted/80 backdrop-blur supports-[backdrop-filter]:bg-muted/60 text-foreground shadow-sm flex items-center gap-3 px-3 py-2">
          <Badge variant="destructive">Preview mode</Badge>
          <span className="text-sm">Bookings temporarily disabled</span>
        </div>
      </div>
    </div>
  );
};

export default PreviewModeBanner;
