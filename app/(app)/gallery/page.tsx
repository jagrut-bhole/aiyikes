"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Gallery/Header";
import { InteractiveImageBentoGallery } from "@/components/ui/react-tailwind-image-gallery";
import ImageDetailModal from "@/components/Gallery/ImageDetailModal";
import { getAllImages, GalleryImage } from "@/apis/gallery/galleryApi";
import { OrbitalLoader } from "@/components/ui/orbital-loader";

interface DisplayImage {
    id: string;
    title: string;
    desc: string;
    url: string;
    span: string;
}

const spanPattern = [
    "md:col-span-2 md:row-span-2",  // 1 (large)
    "md:row-span-1",                 // 2
    "md:row-span-1",                 // 3
    "md:row-span-2",                 // 4 (tall)
    "md:row-span-1",                 // 5
    "md:col-span-2 md:row-span-1",  // 6 (wide)
    "md:row-span-1",                 // 7
    "md:col-span-2 md:row-span-1",  // 8 (wide)
    "md:row-span-2",                 // 9 (tall)
    "md:row-span-1",                 // 10
    "md:col-span-2 md:row-span-2",  // 11 (large)
    "md:row-span-1",                 // 12
];

const getSpanForIndex = (index: number): string => {
    return spanPattern[index % spanPattern.length];
};

export default function GalleryPage() {
    const [images, setImages] = useState<DisplayImage[]>([]);
    const [rawImages, setRawImages] = useState<GalleryImage[]>([]);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const fetchImages = async () => {
        try {
            setLoading(true);
            const response = await getAllImages();

            if (response.success && response.data) {
                setRawImages(response.data);
                const formattedImages: DisplayImage[] = response.data.map(
                    (img: GalleryImage, index: number) => ({
                        id: img.id,
                        title: img.prompt.length > 30
                            ? img.prompt.substring(0, 30) + "..."
                            : img.prompt,
                        desc: `${img.model} • ${img.likeCount} likes`,
                        url: img.s3Url,
                        span: getSpanForIndex(index),
                    })
                );
                setImages(formattedImages);
            } else {
                setError(response.message || "Failed to load images");
            }
        } catch (err) {
            console.error("Error loading gallery:", err);
            setError("Failed to load gallery");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const openModal = (src: string, title: string) => {
        // Find the image by URL to get the ID
        const image = rawImages.find(img => img.s3Url === src);
        if (image) {
            setSelectedImageId(image.id);
        }
    };

    const closeModal = () => {
        setSelectedImageId(null);
        // Don't refetch - too slow! The modal will handle optimistic updates
    };

    // Function to update an image's like count optimistically
    const updateImageLikeCount = (imageId: string, newLikeCount: number) => {
        setRawImages(prev =>
            prev.map(img =>
                img.id === imageId ? { ...img, likeCount: newLikeCount } : img
            )
        );
        setImages(prev =>
            prev.map(img =>
                img.id === imageId
                    ? { ...img, desc: `${rawImages.find(r => r.id === imageId)?.model || ''} • ${newLikeCount} likes` }
                    : img
            )
        );
    };

    const selectedImage = rawImages.find(img => img.id === selectedImageId);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Header />
            <main className="pt-16">
                {/* Loading State */}
                {loading && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
                        <OrbitalLoader message="Loading Gallery..." messagePlacement="bottom" color="white" />
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="flex items-center justify-center py-32">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && images.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32">
                        <p className="text-neutral-400 text-lg">No images found</p>
                        <p className="text-neutral-500 text-sm mt-2">
                            Be the first to generate an image!
                        </p>
                    </div>
                )}

                {/* Gallery Grid */}
                {!loading && !error && images.length > 0 && (
                    <InteractiveImageBentoGallery
                        imageItems={images}
                        title="Community Gallery"
                        description="Explore stunning AI-generated images from our community. Click to expand."
                        onImageClick={openModal}
                    />
                )}

                {/* Image Detail Modal */}
                <ImageDetailModal
                    imageData={selectedImage || null}
                    onClose={closeModal}
                />
            </main>
        </div>
    );
}
