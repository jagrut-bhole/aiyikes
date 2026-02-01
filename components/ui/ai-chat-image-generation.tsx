"use client"

import * as React from "react"
import { motion } from "motion/react";
import Image from "next/image";

export interface ImageGenerationProps {
    src: string | null;
    isLoading?: boolean;
}

export const ImageGeneration = ({ src, isLoading = true }: ImageGenerationProps) => {
    const [progress, setProgress] = React.useState(0);
    const [loadingState, setLoadingState] = React.useState<
        "starting" | "generating" | "completed"
    >("starting");
    const [imageLoaded, setImageLoaded] = React.useState(false);

    // Reset state when a new generation starts
    React.useEffect(() => {
        if (isLoading && !src) {
            setProgress(0);
            setLoadingState("starting");
            setImageLoaded(false);
        }
    }, [isLoading, src]);

    // When image is received, complete the loading
    React.useEffect(() => {
        if (src && !isLoading) {
            setProgress(100);
            setLoadingState("completed");
        }
    }, [src, isLoading]);

    // Simulate progress while loading
    React.useEffect(() => {
        if (!isLoading || src) return;

        const startingTimeout = setTimeout(() => {
            setLoadingState("generating");

            const startTime = Date.now();
            const duration = 60000; // Max 60 seconds

            const interval = setInterval(() => {
                const elapsedTime = Date.now() - startTime;
                // Slow down progress as it approaches 95%
                const progressPercentage = Math.min(
                    95,
                    (elapsedTime / duration) * 100
                );

                setProgress(progressPercentage);

                if (progressPercentage >= 95) {
                    clearInterval(interval);
                }
            }, 100);

            return () => clearInterval(interval);
        }, 1000);

        return () => clearTimeout(startingTimeout);
    }, [isLoading, src]);

    return (
        <div className="flex flex-col gap-4">
            <motion.span
                className="text-sm font-medium text-neutral-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {loadingState === "starting" && "Getting started..."}
                {loadingState === "generating" && "Creating your masterpiece. This may take a moment..."}
                {loadingState === "completed" && imageLoaded && "Image created successfully!"}
                {loadingState === "completed" && !imageLoaded && "Loading image..."}
            </motion.span>

            <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden aspect-square w-full">
                {src ? (
                    <>
                        <Image
                            src={src}
                            alt="Generated image"
                            fill
                            className="object-cover"
                            unoptimized
                            onLoad={() => setImageLoaded(true)}
                            priority
                        />
                        {/* Only show overlay if image hasn't loaded yet */}
                        {!imageLoaded && (
                            <div className="absolute inset-0 bg-neutral-900/90 flex items-center justify-center z-10">
                                <div className="w-16 h-16 border-4 border-neutral-700 border-t-white rounded-full animate-spin" />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-16 h-16 border-4 border-neutral-700 border-t-white rounded-full animate-spin" />
                    </div>
                )}

                {/* Animated blur overlay - only show while generating, hide when completed */}
                {loadingState !== "completed" && (
                    <motion.div
                        className="absolute w-full h-full top-0 left-0 pointer-events-none backdrop-blur-3xl bg-neutral-900/50 z-20"
                        initial={false}
                        animate={{
                            clipPath: `polygon(0 ${progress}%, 100% ${progress}%, 100% 100%, 0 100%)`,
                        }}
                        style={{
                            clipPath: `polygon(0 ${progress}%, 100% ${progress}%, 100% 100%, 0 100%)`,
                        }}
                    />
                )}
            </div>
        </div>
    );
};