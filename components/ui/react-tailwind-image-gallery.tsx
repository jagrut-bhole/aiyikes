"use client"

import React, { useRef } from "react"
import {
    motion,
    useScroll,
    useTransform,
} from "motion/react"
import { cn } from "@/lib/utils"

type ImageItem = {
    id: number | string
    title: string
    desc: string
    url: string
    span: string
}

interface InteractiveImageBentoGalleryProps {
    imageItems: ImageItem[]
    title: string
    description: string
    onImageClick: (url: string, title: string) => void
}

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
} as const

export const InteractiveImageBentoGallery: React.FC<InteractiveImageBentoGalleryProps> = ({
    imageItems,
    title,
    description,
    onImageClick
}) => {
    const targetRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"],
    })
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
    const y = useTransform(scrollYProgress, [0, 0.2], [30, 0])

    return (
        <section
            ref={targetRef}
            className="relative w-full overflow-hidden bg-[#0a0a0a] py-16 sm:py-24"
        >
            <motion.div
                style={{ opacity, y }}
                className="container mx-auto px-4 text-center"
            >
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {title}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-400">
                    {description}
                </p>
            </motion.div>

            <div className="relative mt-12 w-full px-4 md:px-8">
                <motion.div
                    className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {imageItems.map((item) => (
                        <motion.div
                            key={item.id}
                            variants={itemVariants}
                            className={cn(
                                "group relative flex h-full min-h-[15rem] w-full cursor-pointer items-end overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 p-4 shadow-sm transition-shadow duration-300 ease-in-out hover:shadow-lg hover:shadow-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                                item.span,
                            )}
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            onClick={() => onImageClick(item.url, item.title)}
                            onKeyDown={(e) => e.key === "Enter" && onImageClick(item.url, item.title)}
                            tabIndex={0}
                            aria-label={`View ${item.title}`}
                        >
                            <img
                                src={item.url}
                                alt={item.title}
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="relative z-10 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                                <p className="mt-1 text-sm text-white/80">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
