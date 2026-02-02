import { NextResponse } from "next/server";
import { toggleImageLike } from "@/helpers/imageLikeHelper";
import { imageLikeSchema } from "./schema";
import { getAuthenticatedUser } from "@/helpers/authHelper";

export async function POST(request: Request) {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized request"
                },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = imageLikeSchema.parse(body);

        const result = await toggleImageLike(user.id, validatedData.imageId);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to toggle like"
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Like toggled successfully",
            isLiked: result.isLiked,
            likeCount: result.likeCount,
        });
    } catch (error) {
        console.error("Error in like endpoint:", error);

        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request data"
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error"
            },
            { status: 500 }
        );
    }
}
