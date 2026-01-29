import { UpdateFollowerResponse, UpdateFollowerRequest } from "./updateFollowerSchema";
import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelper";
import { toggleFollow } from "@/helpers/followHelper";

export async function POST(req: NextRequest): Promise<NextResponse<UpdateFollowerResponse>> {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                    data: {}
                },
                {
                    status: 401
                }
            )
        }

        const body: UpdateFollowerRequest = await req.json();
        const { userId, action } = body;

        // Validate request body
        if (!userId || !action) {
            return NextResponse.json(
                {
                    success: false,
                    message: "userId and action are required",
                    data: {}
                },
                {
                    status: 400
                }
            )
        }

        // Use the helper function to handle follow/unfollow logic
        const result = await toggleFollow(user.id, userId, action);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: result.message,
                    data: {}
                },
                {
                    status: 400
                }
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: result.message,
                data: {
                    isFollowing: result.isFollowing
                }
            },
            {
                status: 200
            }
        )

    } catch (error) {
        console.error("Error updating followers: ", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error while updating followers",
                data: {}
            },
            {
                status: 500
            }
        )
    }
}
