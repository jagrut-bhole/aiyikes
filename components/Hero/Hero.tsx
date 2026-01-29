"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X, ArrowRight } from "lucide-react";
import { AnimatedGroup } from "@/components/ui/animated-group";
import Link from "next/link";
import { FlipWords } from "@/components/ui/flip-words";

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: "blur(12px)",
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            transition: {
                type: "spring" as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
};

export function Hero() {
    const words = ["Masterpieces", "Stunning Art", "Visual Magic", "Reality"];

    return (
        <>
            <HeroHeader />
            <motion.div
                initial={{ opacity: 0.0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 0.3,
                    duration: 0.8,
                    ease: "easeInOut",
                }}
                className="relative inset-0 bg-transparent min-h-screen flex flex-col gap-4 items-center justify-center px-6"
            >
                <div className="mx-auto max-w-7xl px-6 w-full">
                    <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                        <AnimatedGroup variants={transitionVariants}>
                            <a
                                href="#link"
                                className="hover:bg-white/10 bg-black/20 group mx-auto flex w-fit items-center gap-4 rounded-full border border-white/20 p-1 pl-4 shadow-md transition-all duration-300 my-10"
                            >
                                <span className="text-white text-sm">
                                    Powered by Pollination AI
                                </span>
                                <span className="block h-4 w-0.5 border-l bg-white/30"></span>

                                <div className="bg-white/10 group-hover:bg-white/20 size-6 overflow-hidden rounded-full duration-500">
                                    <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                        <span className="flex size-6">
                                            <ArrowRight className="m-auto size-3 text-white" />
                                        </span>
                                        <span className="flex size-6">
                                            <ArrowRight className="m-auto size-3 text-white" />
                                        </span>
                                    </div>
                                </div>
                            </a>

                            <h1 className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem] text-white">
                                <span className="block">From Thoughts to</span>
                                <span className="inline-block min-w-48 h-[1.2em] align-middle">
                                    <FlipWords words={words} />
                                </span>
                            </h1>
                            <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-white/90">
                                Unleash your wildest ideas with cutting-edge AI. Type any vision, and watch it materialize into breathtaking, professional-grade imagery in seconds.
                            </p>
                        </AnimatedGroup>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}
                            className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
                        >
                            <div
                                key={1}
                                className="bg-white/10 rounded-[14px] border border-white/20 p-0.5"
                            >
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 rounded-xl px-5 text-base bg-white text-black hover:bg-white/90"
                                >
                                    <span className="text-wrap">Get Started</span>
                                </Link>
                            </div>
                            <Link
                                key={2}
                                href="/login"
                                className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10.5 rounded-xl px-5 text-white border border-white/20 hover:bg-white/10"
                            >
                                <span className="text-nowrap">Sign In</span>
                            </Link>
                        </AnimatedGroup>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

const menuItems = [
    { name: "Features", href: "#features" },
    { name: "Styles", href: "#styles" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "About Us", href: "#about" },
];

const HeroHeader = () => {
    const [menuState, setMenuState] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    return (
        <header>
            <nav
                data-state={menuState && "active"}
                className="fixed z-20 w-full px-2 group"
            >
                <div
                    className={cn(
                        "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
                        isScrolled &&
                        "bg-black/50 max-w-4xl rounded-2xl border border-white/20 backdrop-blur-lg lg:px-5"
                    )}
                >
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <a
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2"
                            >
                                <Logo />
                            </a>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
                            >
                                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 text-white duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 text-white -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <a
                                            href={item.href}
                                            className="text-white hover:text-white/80 block duration-150"
                                        >
                                            <span>{item.name}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-black/50 group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-white/20 p-6 shadow-2xl md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <a
                                                href={item.href}
                                                className="text-white hover:text-white/80 block duration-150"
                                            >
                                                <span>{item.name}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                <Link
                                    href="/login"
                                    className={cn(
                                        isScrolled && "lg:hidden",
                                        "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md px-3 text-xs text-white border border-white/20 hover:bg-white/10"
                                    )}
                                >
                                    <span>Login</span>
                                </Link>
                                <Link
                                    href="/register"
                                    className={cn(
                                        isScrolled && "lg:hidden",
                                        "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md px-3 text-xs bg-white text-black hover:bg-white/90"
                                    )}
                                >
                                    <span>Sign Up</span>
                                </Link>
                                <Link
                                    href="#"
                                    className={cn(
                                        isScrolled ? "lg:inline-flex" : "hidden",
                                        "items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md px-3 text-xs bg-white text-black hover:bg-white/90"
                                    )}
                                >
                                    <span>Get Started</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <span className="text-2xl font-bold text-white">AIYIKES</span>
        </div>
    );
};
