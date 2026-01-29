"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type ImageData = {
    id: string;
    s3Url: string;
    userId: string;
    prompt: string;
    likeCount: number;
    remixCount: number;
    createdAt: Date;
};

export default function HomePage() {
    const [images, setImages] = useState<ImageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/all-images");
            const data = await response.json();

            if (data.success) {
                setImages(data.data || []);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to fetch images");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (userId: string, isFollowing: boolean) => {
        try {
            const response = await fetch("/api/update-follower", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    action: isFollowing ? "unfollow" : "follow",
                }),
            });

            const data = await response.json();

            if (data.success) {
                console.log(data.message);
                // You can update UI state here
            } else {
                console.error(data.message);
            }
        } catch (err) {
            console.error("Failed to follow/unfollow user", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#151515] flex items-center justify-center">
                <div className="text-white text-xl">Loading images...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#151515] flex items-center justify-center">
                <div className="text-red-500 text-xl">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#151515] py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8 text-center">
                    Discover AI Images
                </h1>

                {images.length === 0 ? (
                    <div className="text-center text-gray-400 text-lg">
                        No images found. Share some images to see them here!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images.map((image) => (
                            <div
                                key={image.id}
                                className="bg-[#1f1f1f] rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
                            >
                                <div className="relative aspect-square">
                                    <Image
                                        src={image.s3Url}
                                        alt={image.prompt}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    />
                                </div>

                                <div className="p-4">
                                    <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                                        {image.prompt}
                                    </p>

                                    <div className="flex items-center justify-between text-gray-400 text-xs mb-3">
                                        <span className="flex items-center gap-1">
                                            ❤️ {image.likeCount}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            🔄 {image.remixCount}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => handleFollow(image.userId, false)}
                                        className="w-full bg-white text-black py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200 font-medium"
                                    >
                                        Follow Creator
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
