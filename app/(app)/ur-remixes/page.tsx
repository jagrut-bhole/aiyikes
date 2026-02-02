"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Gallery/Header";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { getUserRemixes, UserRemix } from "@/apis/gallery/galleryApi";
import { Download, Eye, User2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export default function YourRemixesPage() {
    const router = useRouter();
    const [remixes, setRemixes] = useState<UserRemix[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [selectedOriginal, setSelectedOriginal] = useState<UserRemix | null>(null);

    const fetchRemixes = async () => {
        try {
            setLoading(true);
            const response = await getUserRemixes();
            if (response.success && response.data) {
                setRemixes(response.data);
            } else {
                setError(response.message || "Failed to load remixes");
            }
        } catch (err) {
            console.error("Error loading remixes:", err);
            setError("Failed to load remixes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRemixes();
    }, []);

    const handleDownload = (imageUrl: string, id: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `aiyikes-remix-${id}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-[#030303]">
            <Header />
            <main className="pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white">
                                Your Remixes
                            </h1>
                        </div>
                        <p className="text-neutral-400">
                            View all the images you've remixed from the gallery
                        </p>
                    </motion.div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-32">
                            <OrbitalLoader color="white" message="Loading Remixes..." messagePlacement="bottom" />
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="flex items-center justify-center py-32">
                            <p className="text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && remixes.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-12 text-center"
                        >

                            <h3 className="text-lg font-medium text-white mb-2">
                                No remixes yet
                            </h3>
                            <p className="text-neutral-500 mb-4">
                                Start remixing images from the gallery to see them here
                            </p>
                            <button
                                onClick={() => router.push('/gallery')}
                                className="px-6 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-white/80 transition-colors"
                            >
                                Explore Gallery
                            </button>
                        </motion.div>
                    )}

                    {/* Remix Grid */}
                    {!loading && !error && remixes.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {remixes.map((remix, index) => (
                                <motion.div
                                    key={remix.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * index }}
                                    className="bg-[#0a0a0a] border border-neutral-800 rounded-xl overflow-hidden hover:border-white/50 transition-colors group"
                                >
                                    {/* Remixed Image */}
                                    <div className="aspect-square relative overflow-hidden">
                                        <img
                                            src={remix.s3Url}
                                            alt={remix.remixPrompt}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {/* Remix badge */}
                                        <div className="absolute top-3 right-3 bg-white/90 text-black text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                            Remix
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="p-4 space-y-3">
                                        {/* Original creator info */}
                                        <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
                                            <Avatar className="w-6 h-6">
                                                {remix.originalImage.user.avatar ? (
                                                    <AvatarImage src={remix.originalImage.user.avatar} alt={remix.originalImage.user.name} />
                                                ) : (
                                                    <AvatarFallback className="bg-neutral-800">
                                                        <User2 className="w-3 h-3 text-white" />
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <span className="text-xs text-neutral-400">
                                                Remixed from <span className="text-white font-medium">{remix.originalImage.user.name}</span>
                                            </span>
                                        </div>

                                        {/* Date */}
                                        <span className="text-xs text-neutral-500">
                                            {formatDate(remix.createdAt)}
                                        </span>

                                        {/* Remix Prompt */}
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">Your remix prompt:</p>
                                            <p className="text-sm text-white line-clamp-2">
                                                {remix.remixPrompt}
                                            </p>
                                        </div>

                                        {/* Original Prompt */}
                                        <div>
                                            <p className="text-xs text-neutral-500 mb-1">Original prompt:</p>
                                            <p className="text-sm text-neutral-400 line-clamp-2">
                                                {remix.originalPrompt}
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={() => setSelectedOriginal(remix)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Original
                                            </button>
                                            <button
                                                onClick={() => handleDownload(remix.s3Url, remix.id)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white hover:bg-white/80 text-black text-sm font-medium transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Original Image Modal */}
            {selectedOriginal && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedOriginal(null)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative max-w-lg w-full bg-[#0a0a0a] rounded-xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedOriginal(null)}
                            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>

                        {/* Original Image */}
                        <div className="aspect-square">
                            <img
                                src={selectedOriginal.originalImage.s3Url}
                                alt={selectedOriginal.originalPrompt}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Original Image Details */}
                        <div className="p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                    {selectedOriginal.originalImage.user.avatar ? (
                                        <AvatarImage src={selectedOriginal.originalImage.user.avatar} alt={selectedOriginal.originalImage.user.name} />
                                    ) : (
                                        <AvatarFallback className="bg-neutral-800">
                                            <User2 className="w-4 h-4 text-white" />
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div>
                                    <p className="text-white font-medium text-sm">{selectedOriginal.originalImage.user.name}</p>
                                    <p className="text-neutral-500 text-xs">Original creator</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 mb-1">Original prompt:</p>
                                <p className="text-sm text-white">{selectedOriginal.originalPrompt}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                <span className="px-2 py-1 rounded-full bg-neutral-800">
                                    {selectedOriginal.originalImage.model}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
