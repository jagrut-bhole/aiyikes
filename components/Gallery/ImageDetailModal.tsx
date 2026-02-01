import React, { useState, useEffect, useCallback } from 'react';
import { Heart, RefreshCw, ChevronDown, ChevronUp, Copy, MoreVertical, Download, Flag, Loader2, ChevronLeft, Share2 } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ImageDetailModalProps {
  src: string | null;
  title: string;
  onClose: () => void;
}

const allPrompts = [
  "Neon", "Smiling at sunrise", "Nature-woven dress", "Cyberpunk vibes",
  "Golden hour", "Dreamy aesthetic", "Vintage filter", "Minimalist art",
  "Fantasy realm", "Urban explorer", "Soft pastel", "Bold shadows",
  "Ethereal glow", "Retro future", "Mystical forest", "Ocean breeze"
];

const generateRandomPrompts = () => {
  const shuffled = [...allPrompts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
};

const creatorNames = ["shazi", "alex", "jordan", "sam", "taylor", "morgan"];
const getRandomCreator = () => creatorNames[Math.floor(Math.random() * creatorNames.length)];
const getRandomTime = () => {
  const hours = Math.floor(Math.random() * 48) + 1;
  return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
};

const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ src, title, onClose }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 1);
  const [randomPrompts, setRandomPrompts] = useState<string[]>(generateRandomPrompts);
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [showLikeEffect, setShowLikeEffect] = useState<'like' | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [creator] = useState(getRandomCreator);
  const [timeAgo] = useState(getRandomTime);
  
  
  // Carousel state
  const [images, setImages] = useState<string[]>([]);
  const [loadingSlides, setLoadingSlides] = useState<Set<number>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  const fullPrompt = `A stunning ${title.toLowerCase()} with ${randomPrompts.join(', ').toLowerCase()} style, ultra high quality, detailed composition`;

  // Initialize images array with the source image
  useEffect(() => {
    if (src) {
      setImages([src]);
      setCurrentIndex(0);
      setRandomPrompts(generateRandomPrompts());
      setShowPrompt(false);
      setCopied(false);
      setPromptInput('');
      setShowLikeEffect(null);
      setLoadingSlides(new Set());
    }
  }, [src]);

  // Update current index when carousel scrolls
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Scroll to new image when added
  useEffect(() => {
    if (emblaApi && images.length > 1) {
      emblaApi.reInit();
      emblaApi.scrollTo(images.length - 1);
    }
  }, [images.length, emblaApi]);

  const handleGenerate = (prompt: string) => {
    if (loadingSlides.size > 0 || !prompt.trim()) return;
    
    // Add a new loading slide
    const newSlideIndex = images.length;
    setImages(prev => [...prev, '']); // Add empty placeholder
    setLoadingSlides(prev => new Set(prev).add(newSlideIndex));
    
    // Scroll to the new loading slide
    setTimeout(() => {
      if (emblaApi) {
        emblaApi.reInit();
        emblaApi.scrollTo(newSlideIndex);
      }
    }, 50);
    
    // Simulate generation - after 2 seconds, replace with actual image
    setTimeout(() => {
      setImages(prev => {
        const updated = [...prev];
        updated[newSlideIndex] = src!;
        return updated;
      });
      setLoadingSlides(prev => {
        const updated = new Set(prev);
        updated.delete(newSlideIndex);
        return updated;
      });
      setPromptInput('');
    }, 2000);
  };

  const handlePromptClick = (prompt: string) => {
    handleGenerate(prompt);
  };

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGenerate(promptInput);
    }
  };

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    
    if (newLikedState) {
      setShowLikeEffect('like');
      setTimeout(() => setShowLikeEffect(null), 1000);
    }
  };

  const handleRefreshPrompts = () => {
    setRandomPrompts(generateRandomPrompts());
  };

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const currentImage = images[currentIndex];
    if (currentImage) {
      const link = document.createElement('a');
      link.href = currentImage;
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${currentIndex}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const scrollTo = (index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  };

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg mx-4 bg-card rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image area with overlays */}
        <div className="relative aspect-square">
          {/* Creator header overlay - compact */}
          <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 via-black/50 to-transparent pb-4">
            <div className="flex items-center justify-between px-3 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${creator}`} />
                  <AvatarFallback>{creator[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-semibold text-white">{creator}</span>
                  <span className="text-white/60">·</span>
                  <span className="text-white/60">{timeAgo}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant={isFollowing ? "secondary" : "default"}
                  size="sm"
                  onClick={() => setIsFollowing(!isFollowing)}
                  className="rounded-full px-3 h-7 text-xs"
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/10">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Flag className="mr-2 h-4 w-4" />
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Pagination dots at top */}
            {images.length > 1 && (
              <div className="flex justify-center gap-1.5 pb-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-200",
                      index === currentIndex 
                        ? "bg-white w-2 h-2" 
                        : "bg-white/50 hover:bg-white/70"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Carousel */}
          <div className="overflow-hidden h-full" ref={emblaRef}>
            <div className="flex h-full">
              {images.map((imageSrc, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0 relative">
                  {loadingSlides.has(index) ? (
                    <div className="w-full h-full bg-muted flex flex-col items-center justify-center">
                      <Loader2 className="w-12 h-12 text-muted-foreground animate-spin mb-3" />
                      <p className="text-muted-foreground text-sm font-medium">Generating...</p>
                    </div>
                  ) : (
                    <img
                      src={imageSrc}
                      alt={`${title} - version ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Like animation effect */}
          <div 
            className={cn(
              "absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 z-20",
              showLikeEffect ? "opacity-100" : "opacity-0"
            )}
          >
            {showLikeEffect === 'like' && (
              <Heart 
                className="w-32 h-32 text-red-500 fill-red-500 animate-[scale-in_0.3s_ease-out] drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]" 
              />
            )}
          </div>

          {/* Bottom action overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/70 via-black/40 to-transparent pt-12 pb-3 px-3">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className="flex items-center gap-1.5 text-white hover:scale-110 transition-transform"
              >
                {isLiked ? (
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                ) : (
                  <Heart className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">{likeCount}</span>
              </button>
              <button className="text-white hover:scale-110 transition-transform">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Action buttons below image */}
        <div className="p-4 bg-card">
          {/* Random prompts */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {randomPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(prompt)}
                disabled={loadingSlides.size > 0}
                className={cn(
                  "px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm font-medium transition-colors cursor-pointer",
                  loadingSlides.size > 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-secondary/80"
                )}
              >
                {prompt}
              </button>
            ))}
            <button
              onClick={handleRefreshPrompts}
              disabled={loadingSlides.size > 0}
              className={cn(
                "p-2 rounded-full transition-colors",
                loadingSlides.size > 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-secondary"
              )}
              title="Refresh prompts"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Prompt input box */}
          <div className="mb-4">
            <Input
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={handleInputSubmit}
              placeholder="What to change? (Press Enter)"
              disabled={loadingSlides.size > 0}
              className="w-full bg-muted border-muted-foreground/20"
            />
          </div>

          {/* Show/Hide Prompt button */}
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="w-full flex items-center justify-between px-4 py-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <span className="text-sm font-medium text-secondary-foreground">
              {showPrompt ? 'Hide Prompt' : 'Show Prompt'}
            </span>
            {showPrompt ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* Prompt section */}
          {showPrompt && (
            <div className="mt-3 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {fullPrompt}
              </p>
              <button
                onClick={handleCopyPrompt}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  copied 
                    ? "bg-accent text-accent-foreground" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Prompt'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageDetailModal;
