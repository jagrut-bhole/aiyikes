import React, { useState, useEffect, useCallback } from 'react';
import { Heart, RefreshCw, ChevronDown, ChevronUp, Copy, MoreVertical, Download, Flag, Loader2, ChevronLeft, Share2, User2 } from 'lucide-react';
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
import { GalleryImage, userImageLike, toggleUserFollow, checkFollowStatus, remixImage } from '@/apis/gallery/galleryApi';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ImageDetailModalProps {
  imageData: GalleryImage | null;
  onClose: () => void;
}

const allPrompts = [
  "Add a sunset", "Make it cyberpunk", "Add snow", "Make it vintage",
  "Add neon lights", "Make it dreamy", "Add a rainbow", "Make it dark",
  "Add flowers", "Make it futuristic", "Add stars", "Make it magical"
];

const generateRandomPrompts = () => {
  const shuffled = [...allPrompts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ imageData, onClose }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const currentUserId = session?.user?.id;

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [randomPrompts, setRandomPrompts] = useState<string[]>(generateRandomPrompts);
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [showLikeEffect, setShowLikeEffect] = useState<'like' | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);

  // Carousel state
  const [images, setImages] = useState<{ url: string; isRemix: boolean }[]>([]);
  const [loadingSlides, setLoadingSlides] = useState<Set<number>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  const fullPrompt = imageData ? `${imageData.prompt}` : '';

  // Initialize state when imageData changes
  useEffect(() => {
    if (imageData) {
      setImages([{ url: imageData.s3Url, isRemix: false }]);
      setCurrentIndex(0);
      setRandomPrompts(generateRandomPrompts());
      setShowPrompt(false);
      setCopied(false);
      setPromptInput('');
      setShowLikeEffect(null);
      setLoadingSlides(new Set());
      setIsLiked(imageData.isLiked);
      setLikeCount(imageData.likeCount);
      setIsRemixing(false);

      // Check follow status
      if (currentUserId && imageData.user.id !== currentUserId) {
        checkFollowStatus(imageData.user.id)
          .then((res) => {
            if (res.success) {
              setIsFollowing(res.isFollowing || false);
            }
          })
          .catch(console.error);
      }
    }
  }, [imageData, currentUserId]);

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

  const handleRemix = async (prompt: string) => {
    if (!imageData || isRemixing || !prompt.trim()) return;

    if (!currentUserId) {
      toast.error("Please login to remix images");
      return;
    }

    setIsRemixing(true);
    const newSlideIndex = images.length;

    // Add a loading slide
    setImages(prev => [...prev, { url: '', isRemix: true }]);
    setLoadingSlides(prev => new Set(prev).add(newSlideIndex));

    // Scroll to the new loading slide
    setTimeout(() => {
      if (emblaApi) {
        emblaApi.reInit();
        emblaApi.scrollTo(newSlideIndex);
      }
    }, 50);

    try {
      const result = await remixImage(imageData.id, prompt);

      if (result.success && result.data) {
        // Update the slide with the generated image
        setImages(prev => {
          const updated = [...prev];
          updated[newSlideIndex] = { url: result.data!.imageUrl, isRemix: true };
          return updated;
        });
        setLoadingSlides(prev => {
          const updated = new Set(prev);
          updated.delete(newSlideIndex);
          return updated;
        });
        setPromptInput('');
        toast.success("Remix created successfully! View it in 'Your Remixes'");
      } else {
        // Remove the failed slide
        setImages(prev => prev.filter((_, i) => i !== newSlideIndex));
        setLoadingSlides(prev => {
          const updated = new Set(prev);
          updated.delete(newSlideIndex);
          return updated;
        });
        toast.error(result.message || "Failed to generate remix");
      }
    } catch (error) {
      // Remove the failed slide
      setImages(prev => prev.filter((_, i) => i !== newSlideIndex));
      setLoadingSlides(prev => {
        const updated = new Set(prev);
        updated.delete(newSlideIndex);
        return updated;
      });
      toast.error("Failed to generate remix");
    } finally {
      setIsRemixing(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    handleRemix(prompt);
  };

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRemix(promptInput);
    }
  };

  const handleLike = async () => {
    if (!imageData || isLiking) return;

    setIsLiking(true);
    const newLikedState = !isLiked;

    // Optimistic update
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

    if (newLikedState) {
      setShowLikeEffect('like');
      setTimeout(() => setShowLikeEffect(null), 1000);
    }

    try {
      const result = await userImageLike(imageData.id);
      if (result.success) {
        setIsLiked(result.isLiked);
        setLikeCount(result.likeCount);
      } else {
        // Revert on failure
        setIsLiked(!newLikedState);
        setLikeCount(prev => newLikedState ? prev - 1 : prev + 1);
        toast.error("Failed to update like");
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState);
      setLikeCount(prev => newLikedState ? prev - 1 : prev + 1);
      toast.error("Failed to update like");
    } finally {
      setIsLiking(false);
    }
  };

  const handleFollow = async () => {
    if (!imageData || isFollowLoading || !currentUserId) return;
    if (imageData.user.id === currentUserId) {
      toast.error("You can't follow yourself");
      return;
    }

    setIsFollowLoading(true);
    const action = isFollowing ? "unfollow" : "follow";

    // Optimistic update
    setIsFollowing(!isFollowing);

    try {
      const result = await toggleUserFollow(imageData.user.id, action);
      if (result.success) {
        setIsFollowing(result.isFollowing || false);
        toast.success(result.message);
      } else {
        // Revert on failure
        setIsFollowing(isFollowing);
        toast.error(result.message);
      }
    } catch (error) {
      // Revert on error
      setIsFollowing(isFollowing);
      toast.error("Failed to update follow status");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleRefreshPrompts = () => {
    setRandomPrompts(generateRandomPrompts());
  };

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    toast.success("Prompt copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const currentImage = images[currentIndex];
    if (currentImage?.url) {
      const link = document.createElement('a');
      link.href = currentImage.url;
      link.download = `aiyikes-${imageData?.id || 'image'}-${currentIndex}.jpg`;
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

  if (!imageData) return null;

  const creator = imageData.user;
  const timeAgo = formatTimeAgo(imageData.createdAt);
  const isOwnImage = currentUserId === creator.id;

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
                  {creator.avatar ? (
                    <AvatarImage src={creator.avatar} alt={creator.name} />
                  ) : (
                    <AvatarFallback className="bg-neutral-800">
                      <User2 className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-semibold text-white">{creator.name}</span>
                  <span className="text-white/60">·</span>
                  <span className="text-white/60">{timeAgo}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!isOwnImage && (
                  <Button
                    variant={isFollowing ? "secondary" : "default"}
                    size="sm"
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                    className="rounded-full px-3 h-7 text-xs cursor-pointer bg-[#1B1919] text-white hover:bg-[#1B1919]/80 border border-white/20"
                  >
                    {isFollowLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-white cursor-pointer hover:bg-white/10 hover:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className='bg-[#0a0a0a] border-gray-800 text-gray-200 '>
                    <DropdownMenuItem onClick={handleDownload} className='cursor-pointer hover:text-white'>
                      <Download className="mr-2 h-4 w-4 text-green-500" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/ur-remixes')} className='cursor-pointer hover:text-white'>
                      Your Remixes
                    </DropdownMenuItem>
                    <DropdownMenuItem className='cursor-pointer hover:text-white'>
                      <Flag className="mr-2 h-4 w-4 text-red-500" />
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
              {images.map((image, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0 relative">
                  {loadingSlides.has(index) ? (
                    <div className="w-full h-full bg-muted flex flex-col items-center justify-center bg-neutral-900">
                      <Loader2 className="w-12 h-12 text-white animate-spin mb-3" />
                      <p className="text-white text-sm font-medium">Generating Remix...</p>
                      <p className="text-neutral-400 text-xs mt-1">This may take a moment</p>
                    </div>
                  ) : (
                    <>
                      <img
                        src={image.url}
                        alt={`${imageData.prompt} - version ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {image.isRemix && (
                        <div className="absolute top-12 right-3 bg-white/90 text-black text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          Remix
                        </div>
                      )}
                    </>
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
                disabled={isLiking}
                className="flex items-center gap-1.5 text-white hover:scale-110 transition-transform disabled:opacity-50"
              >
                {isLiked ? (
                  <Heart className="w-5 h-5 fill-red-500 text-red-500 cursor-pointer" />
                ) : (
                  <Heart className="w-5 h-5 cursor-pointer" />
                )}
                <span className="text-sm font-medium">{likeCount}</span>
              </button>
              <button className="text-white hover:scale-110 transition-transform">
                <Share2 className="w-5 h-5 cursor-pointer" />
              </button>
            </div>
          </div>
        </div>

        {/* Action buttons below image */}
        <div className="p-4 bg-[#151515]">
          {/* Remix section header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-white">Remix this image</span>
          </div>

          {/* Random prompts */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {randomPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(prompt)}
                disabled={isRemixing}
                className={cn(
                  "px-3 py-1.5 bg-[#151515] text-white rounded-full text-sm font-medium transition-colors cursor-pointer border border-white/20",
                  isRemixing ? "opacity-50 cursor-not-allowed" : "hover:bg-[#151515]/80 hover:border-white/50"
                )}
              >
                {prompt}
              </button>
            ))}
            <button
              onClick={handleRefreshPrompts}
              disabled={isRemixing}
              className={cn(
                "p-2 rounded-full transition-colors",
                isRemixing ? "opacity-50 cursor-not-allowed" : "hover:bg-secondary"
              )}
              title="Refresh prompts"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Prompt input box */}
          <div className="mb-4 relative">
            <Input
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={handleInputSubmit}
              placeholder="Describe your remix... (Press Enter)"
              disabled={isRemixing}
              className="w-full bg-[#151515] text-white rounded-full text-sm font-medium transition-colors border border-white/20 pr-12"
            />
            {promptInput.trim() && !isRemixing && (
              <button
                onClick={() => handleRemix(promptInput)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/50 hover:bg-white/60 transition-colors"
              >
                Remix
              </button>
            )}
          </div>

          {/* Show/Hide Prompt button */}
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#151515] text-white rounded-full text-sm font-medium transition-colors border border-white/20"
          >
            <span className="text-sm font-medium text-white">
              {showPrompt ? 'Hide Original Prompt' : 'Show Original Prompt'}
            </span>
            {showPrompt ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* Prompt section */}
          {showPrompt && (
            <div className="mt-3 p-4 bg-[#151515] rounded-lg">
              <p className="text-sm text-white mb-3 leading-relaxed break-words">
                {fullPrompt}
              </p>
              <button
                onClick={handleCopyPrompt}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  copied
                    ? "bg-[#151515] text-white border border-white/20"
                    : "bg-green text-white border border-white/20"
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
