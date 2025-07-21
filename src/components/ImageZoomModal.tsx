import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex: number;
  spotName: string;
}

const ImageZoomModal = ({ isOpen, onClose, images, initialIndex, spotName }: ImageZoomModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (zoom > 1) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      const moveX = (x - 0.5) * (zoom - 1) * 100;
      const moveY = (y - 0.5) * (zoom - 1) * 100;
      
      setPosition({ x: -moveX, y: -moveY });
    }
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
          <div className="text-white bg-black/50 px-3 py-1 rounded">
            <span className="text-sm font-medium">{spotName}</span>
            <span className="text-xs ml-2">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/30 bg-black/70 border-2 border-white/50 hover:border-white/80 h-12 w-12 md:h-10 md:w-10 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110"
            aria-label="Close image viewer"
          >
            <X className="h-7 w-7 md:h-6 md:w-6 stroke-2" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="text-white hover:bg-white/20 bg-black/50"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-white bg-black/50 px-2 py-1 rounded text-sm">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="text-white hover:bg-white/20 bg-black/50"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          {zoom > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetZoom}
              className="text-white hover:bg-white/20 bg-black/50 text-xs"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Image Container */}
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={images[currentIndex]}
            alt={`${spotName} - Image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain cursor-move"
            style={{
              transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
              transition: zoom === 1 ? 'transform 0.3s ease' : 'none'
            }}
            onMouseMove={handleMouseMove}
            onDoubleClick={() => zoom === 1 ? handleZoomIn() : resetZoom()}
          />
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 bg-black/30 h-12 w-12"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 bg-black/30 h-12 w-12"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded text-sm text-center">
          <p>Double-click to zoom • Mouse to pan when zoomed • Use zoom controls or scroll</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageZoomModal;