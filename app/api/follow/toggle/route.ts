import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelper";
import { toggleFollow } from "@/helpers/followHelper";
import { followToggleSchema, FollowToggleResponse } from "./schema";

export async function POST(request: Request): Promise<NextResponse<FollowToggleResponse>> {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized"
                },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = followToggleSchema.parse(body);

        const result = await toggleFollow(
            user.id,
            validatedData.targetUserId,
            validatedData.action
        );

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: result.message
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result.message,
            isFollowing: result.isFollowing,
        });
    } catch (error) {
        console.error("Error in follow toggle endpoint:", error);

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
