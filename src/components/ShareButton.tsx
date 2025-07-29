import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Share2, Copy, MessageCircle, Mail, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  price?: number;
  location?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export const ShareButton = ({ 
  title, 
  description, 
  url = window.location.href, 
  price, 
  location,
  className,
  size = "default",
  variant = "outline"
}: ShareButtonProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Generate share text
  const shareText = description || `Check out this parking space: ${title}${price ? ` for AED ${price}/month` : ''}${location ? ` in ${location}` : ''} - via ShazamParking`;
  
  // Check if Web Share API is supported
  const isWebShareSupported = navigator?.share !== undefined;

  const handleNativeShare = async () => {
    if (isWebShareSupported) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: url,
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    }
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
    }
    setIsOpen(false);
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${url}`)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const handleEmailShare = () => {
    const emailSubject = encodeURIComponent(`Parking Space: ${title}`);
    const emailBody = encodeURIComponent(`${shareText}\n\nView details: ${url}`);
    const emailUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;
    window.location.href = emailUrl;
    setIsOpen(false);
  };

  const handleTwitterShare = () => {
    const twitterText = encodeURIComponent(`${shareText} #DubaiParking #ShazamParking`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={cn("gap-2", className)}
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {isWebShareSupported && (
          <DropdownMenuItem onClick={handleNativeShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share via device
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsAppShare} className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Share on WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEmailShare} className="gap-2">
          <Mail className="h-4 w-4" />
          Share via Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare} className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Share on Twitter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};