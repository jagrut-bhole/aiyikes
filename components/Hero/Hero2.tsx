"use client";

import { 
    BentoCell, 
    BentoGrid, 
    ContainerScale, 
    ContainerScroll } from "@/components/ui/hero-gallery-scroll-animation"

import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

const IMAGES = [
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2388&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://res.cloudinary.com/dbeky551a/image/upload/v1770046407/ifacusAi-jn715yt782dhs9p8rjz9m2dfsh80d4kw-A-warrior-amazon-woman-stands-_dcxfle.jpg",
    "https://res.cloudinary.com/dbeky551a/image/upload/v1770045825/maxi33-jn721zvs7qd26h9nw02ersm16n800tvx-in-a-cosmic-expanse-of-dark-bl_rqzltb.jpg",
    "https://res.cloudinary.com/dbeky551a/image/upload/v1770045982/able-jealous-artist-jn79r7025ypkgqmar8sy8gh7kh80dke2-a-romantic-city-bathed-by-a-ri_amxon2.jpg",
    "https://res.cloudinary.com/dbeky551a/image/upload/v1770046284/tender-zealous-bird-1-jn75ab31cgcvp2h1p7962rx1hn80dwzw-one-lady-cooking-in-her-beauti_kf6caj.jpg",
]

export default function Hero2() {
    const router = useRouter();
    return (
        <>
            <ContainerScroll className="h-[350vh]">
                <BentoGrid className="sticky left-0 top-0 z-0 h-screen w-full p-4">
                    {IMAGES.map((imageUrl, index) => (
                        <BentoCell
                            key={index}
                            className="overflow-hidden rounded-xl shadow-xl"
                        >
                            <img
                                className="size-full object-cover object-center"
                                src={imageUrl}
                                alt=""
                            />
                        </BentoCell>
                    ))}
                </BentoGrid>

                <ContainerScale className="relative z-10 text-center">
                    <h1 className="max-w-xl text-5xl font-bold tracking-tighter text-gray-200 ">
                        AIYIKES
                    </h1>
                    <p className="my-6 max-w-xl text-sm text-gray-200 md:text-base">
                        Unleash your wildest ideas with cutting-edge AI. Type any vision, and watch it materialize into breathtaking, professional-grade imagery in seconds
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Button className="bg-gray-200 px-4 py-2 font-medium text-gray-800 cursor-pointer hover:bg-gray-300 hover:text-black"
                            onClick={() => router.push("/register")}
                        >
                            Get Started
                        </Button>
                        <Button
                            variant="link"
                            className="bg-transparent text-gray-200 px-4 py-2 font-medium cursor-pointer"
                        >
                            Learn more
                        </Button>
                    </div>
                </ContainerScale>
            </ContainerScroll>
        </>
    )
}