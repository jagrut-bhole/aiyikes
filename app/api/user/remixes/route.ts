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

        const remixes = await prisma.remixImage.findMany({
            where: {
                userId: user.id,
            },
            include: {
                originalImage: {
                    select: {
                        id: true,
                        s3Url: true,
                        prompt: true,
                        model: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({
            success: true,
            message: "Remixes fetched successfully",
            data: remixes,
        });
    } catch (error) {
        console.error("Error fetching user remixes:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch remixes" },
            { status: 500 }
        );
    }
}
