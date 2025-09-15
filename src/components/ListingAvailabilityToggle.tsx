import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  CircleDot, 
  CheckCircle, 
  XCircle, 
  Wrench, 
  ChevronDown,
  Plus,
  Loader2
} from 'lucide-react';

interface ListingAvailabilityToggleProps {
  listingId: string;
  listingTitle: string;
  spaceStatus: {
    status: 'no_spaces' | 'available' | 'booked' | 'mixed';
    hasSpaces: boolean;
    availableCount: number;
    totalCount: number;
  };
  onCreateSpace: (listingId: string) => Promise<{ success: boolean }>;
  onUpdateStatus: (spaceId: string, status: 'available' | 'booked' | 'maintenance' | 'reserved', reason?: string) => Promise<{ success: boolean }>;
  spaces: Array<{
    space_id: string;
    space_status: string;
    space_number: string;
  }>;
}

export const ListingAvailabilityToggle = ({
  listingId,
  listingTitle,
  spaceStatus,
  onCreateSpace,
  onUpdateStatus,
  spaces
}: ListingAvailabilityToggleProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusBadge = () => {
    if (!spaceStatus.hasSpaces) {
      return (
        <Badge variant="secondary" className="text-xs">
          <CircleDot className="h-3 w-3 mr-1" />
          No Spaces
        </Badge>
      );
    }

    switch (spaceStatus.status) {
      case 'available':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Available ({spaceStatus.availableCount})
          </Badge>
        );
      case 'booked':
        return (
          <Badge variant="destructive" className="text-xs">
            <XCircle className="h-3 w-3 mr-1" />
            Booked ({spaceStatus.totalCount})
          </Badge>
        );
      case 'mixed':
        return (
          <Badge variant="secondary" className="text-xs">
            <CircleDot className="h-3 w-3 mr-1" />
            Mixed ({spaceStatus.availableCount}/{spaceStatus.totalCount})
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleCreateSpace = async () => {
    setIsUpdating(true);
    try {
      await onCreateSpace(listingId);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'available' | 'booked' | 'maintenance') => {
    if (spaces.length === 0) return;
    
    setIsUpdating(true);
    try {
      // Update all spaces to the new status
      for (const space of spaces) {
        await onUpdateStatus(space.space_id, newStatus);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (!spaceStatus.hasSpaces) {
    return (
      <div className="flex items-center gap-2">
        {getStatusBadge()}
        <Button
          size="sm"
          variant="outline"
          onClick={handleCreateSpace}
          disabled={isUpdating}
          className="text-xs h-7"
        >
          {isUpdating ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Plus className="h-3 w-3 mr-1" />
          )}
          Create Space
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {getStatusBadge()}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            disabled={isUpdating}
            className="text-xs h-7"
          >
            {isUpdating ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <>
                Quick Toggle
                <ChevronDown className="h-3 w-3 ml-1" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleStatusUpdate('available')}>
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            Set Available
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusUpdate('booked')}>
            <XCircle className="h-4 w-4 mr-2 text-red-500" />
            Set Booked
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusUpdate('maintenance')}>
            <Wrench className="h-4 w-4 mr-2 text-orange-500" />
            Set Maintenance
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};