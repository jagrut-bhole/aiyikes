import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelper";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const images = await prisma.image.findMany({
            where: {
                userId: user.id,
            },
            select: {
                id: true,
                prompt: true,
                s3Url: true,
                model: true,
                seed: true,
                likeCount: true,
                remixCount: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({
            success: true,
            message: "User images fetched successfully",
            data: images,
        });
    } catch (error) {
        console.error("Error fetching user images:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch images" },
            { status: 500 }
        );
    }
}
