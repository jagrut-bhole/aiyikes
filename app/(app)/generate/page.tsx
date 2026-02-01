"use client";

import { useState, useRef } from "react";
import { IMAGE_MODELS } from "@/constants/imageModels";
import { ImageGeneration } from "@/components/ui/ai-chat-image-generation";
import { cn } from "@/lib/utils";
import { Loader2, Wand2, Download, Image as ImageIcon, ChevronDown, Globe, Lock, Check, RefreshCw } from 'lucide-react';
import { generateImage, GenerateImageResponse } from "@/apis/image/imageApi";
import { toast } from "sonner";

export default function GeneratePage() {

    const [prompt, setPrompt] = useState<string>("");
    const [selectedModel, setSelectedModel] = useState<string>("flux");
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [isPublic, setIsPublic] = useState<boolean>(true);

    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [generatedImageId, setGeneratedImageId] = useState<string | null>(null);

    const [error, setError] = useState<string>("");

    const [isProcessActive, setIsProcessActive] = useState<boolean>(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error("Please enter a prompt");
            return;
        }

        setIsGenerating(true);
        setIsProcessActive(true);
        setError("");
        setGeneratedImage(null);
        setGeneratedImageId(null);

        try {
            const response: GenerateImageResponse = await generateImage({
                prompt,
                model: selectedModel,
                isPublic
            });

            if (response.success && response.imageUrl) {
                setGeneratedImage(response.imageUrl);
                setGeneratedImageId(response.imageId || null);
                toast.success("Image generated successfully!");
            } else {
                setError(response.message || "Failed to generate image");
                toast.error(response.message || "Failed to generate image");
                setIsProcessActive(false);
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Error while generating image";
            setError(errorMessage);
            toast.error(errorMessage);
            setIsProcessActive(false);
        } finally {
            setIsGenerating(false);
        }
    }

    const handleDownload = async () => {
        if (!generatedImage) return;

        try {
            const response = await fetch(generatedImage);
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const fileName = generatedImageId
                ? `aiyikes-${generatedImageId}.png`
                : `aiyikes-${Date.now()}.png`;

            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Image downloaded!");
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download image");
        }
    };

    const handleNew = () => {
        setIsProcessActive(false);
        setGeneratedImage(null);
        setGeneratedImageId(null);
        setPrompt("");
        setError("");
    };

    const currentModel = IMAGE_MODELS.find((m) => m.value === selectedModel) || IMAGE_MODELS[0];

    const dropdownRef = useRef<HTMLDivElement>(null);

    return (
        <div className="w-full h-[calc(100vh-80px)] bg-[#050505] overflow-hidden flex flex-col lg:flex-row">

            {/* Left Panel: Prompt Input & Controls */}
            <div className="w-full lg:w-[480px] h-full flex flex-col z-10 bg-[#050505]">
                <div className="flex-1 flex flex-col justify-center px-8 py-8 overflow-y-auto">
                    <header className="mb-8">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Studio</h1>
                        <p className="text-neutral-500 mt-2 font-medium">Transcend boundaries with AIYIKES synthesis.</p>
                    </header>

                    <div className="flex flex-col gap-6">
                        {/* Prompt Area */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-neutral-600 flex justify-between">
                                <span>Vision Prompt</span>
                                <span className={cn("text-[10px]", prompt.length > 0 ? "text-neutral-400" : "text-neutral-700")}>
                                    {prompt.length} chars
                                </span>
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe your masterpiece..."
                                disabled={isGenerating}
                                className="w-full h-48 bg-neutral-900/30 border border-neutral-800 rounded-[1.5rem] p-5 text-white text-lg placeholder:text-neutral-700 focus:ring-1 focus:ring-white focus:outline-none transition-all resize-none shadow-inner leading-relaxed disabled:opacity-50"
                            />
                        </div>

                        {/* Controls Row: Model Dropdown & Public Toggle */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Model Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 mb-2 block">Model</label>
                                <button
                                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                                    disabled={isGenerating}
                                    className="w-full h-14 bg-neutral-900/30 border border-neutral-800 rounded-xl px-4 flex items-center justify-between hover:bg-neutral-900/50 hover:border-neutral-700 transition-all group disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className="text-lg">{currentModel.icon}</span>
                                        <div className="flex flex-col items-start truncate">
                                            <span className="text-sm font-bold text-white leading-none">{currentModel.label}</span>
                                            <span className="text-[10px] text-neutral-500 leading-none mt-1 truncate">{currentModel.description}</span>
                                        </div>
                                    </div>
                                    <ChevronDown className={cn("w-4 h-4 text-neutral-500 transition-transform", isModelDropdownOpen ? "rotate-180" : "")} />
                                </button>

                                {/* Dropdown Menu */}
                                {isModelDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {IMAGE_MODELS.map((model) => (
                                            <button
                                                key={model.value}
                                                onClick={() => {
                                                    setSelectedModel(model.value);
                                                    setIsModelDropdownOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left mb-1 last:mb-0",
                                                    selectedModel === model.value ? "bg-white text-black" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                                                )}
                                            >
                                                <span className="text-lg">{model.icon}</span>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-bold">{model.label}</span>
                                                        {selectedModel === model.value && <Check className="w-3 h-3" />}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Public Toggle */}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 mb-2 block">Visibility</label>
                                <button
                                    onClick={() => setIsPublic(!isPublic)}
                                    disabled={isGenerating}
                                    className="w-full h-14 bg-neutral-900/30 border border-neutral-800 rounded-xl px-4 flex items-center justify-between hover:bg-neutral-900/50 hover:border-neutral-700 transition-all group disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        {isPublic ? <Globe className="w-5 h-5 text-neutral-400" /> : <Lock className="w-5 h-5 text-neutral-400" />}
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-bold text-white leading-none">
                                                {isPublic ? 'Public' : 'Private'}
                                            </span>
                                            <span className="text-[10px] text-neutral-500 leading-none mt-1">
                                                {isPublic ? 'Visible to community' : 'Only you can see'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Switch UI */}
                                    <div className={cn("w-10 h-6 rounded-full p-1 transition-colors flex items-center", isPublic ? "bg-green-500/20" : "bg-neutral-800")}>
                                        <div className={cn("w-4 h-4 rounded-full shadow-sm transition-all", isPublic ? "bg-green-500 translate-x-4" : "bg-neutral-500 translate-x-0")} />
                                    </div>
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-950/20 border border-red-900/40 text-red-400 rounded-2xl text-xs font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt.trim()}
                            className="w-full py-5 bg-white hover:bg-neutral-200 disabled:opacity-20 disabled:cursor-not-allowed text-black font-black text-xl rounded-[1.5rem] transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-[0.98] mt-2"
                        >
                            <div className="flex items-center justify-center gap-3">
                                {isGenerating ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                                ) : (
                                    <><Wand2 className="w-5 h-5" /> Create</>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Partition Line (Desktop) */}
            <div className="hidden lg:block w-px bg-neutral-900 h-full relative z-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-24 bg-neutral-800 rounded-full" />
            </div>

            {/* Right Panel: Display Area (Centered) */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-[#050505] relative overflow-hidden">

                {/* Background Ambient Glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] opacity-20" />
                </div>

                <div className="w-full max-w-xl relative z-10">
                    {!isProcessActive ? (
                        <div className="w-full aspect-square border border-neutral-900 rounded-[3rem] bg-neutral-900/20 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-1000">
                            <div className="w-20 h-20 bg-neutral-900/80 rounded-full flex items-center justify-center border border-neutral-800 shadow-xl">
                                <ImageIcon className="w-8 h-8 text-neutral-600" />
                            </div>
                            <p className="text-neutral-600 font-bold uppercase tracking-widest text-xs text-center px-8 leading-relaxed">
                                Awaiting Input Sequence
                            </p>
                        </div>
                    ) : (
                        <div className="w-full">
                            <ImageGeneration
                                src={generatedImage}
                                isLoading={isGenerating}
                            />

                            {generatedImage && (
                                <div className="flex gap-3 mt-8 w-full animate-in slide-in-from-bottom-4 duration-700 fill-mode-both">
                                    <button
                                        onClick={handleDownload}
                                        className="flex-1 py-4 bg-neutral-900/80 backdrop-blur-md hover:bg-neutral-800 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-bold border border-neutral-800 text-sm"
                                    >
                                        <Download className="w-4 h-4" /> Download
                                    </button>
                                    <button
                                        onClick={handleNew}
                                        className="flex-1 py-4 bg-white text-black hover:bg-neutral-200 rounded-xl transition-all flex items-center justify-center gap-2 font-bold shadow-lg text-sm"
                                    >
                                        <RefreshCw className="w-4 h-4" /> New
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
