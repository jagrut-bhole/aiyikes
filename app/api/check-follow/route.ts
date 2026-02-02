import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelper";
import { isFollowing } from "@/helpers/followHelper";
import { CheckFollowResponse } from "./checkFollowSchema";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<CheckFollowResponse>> {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
          data: undefined,
        },
        {
          status: 401,
        },
      );
    }

    const body = await req.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json(
        {
          success: false,
          message: "targetUserId is required",
          data: undefined,
        },
        {
          status: 400,
        },
      );
    }

    const following = await isFollowing(user.id, targetUserId);

    return NextResponse.json(
      {
        success: true,
        message: "Follow status retrieved successfully",
        isFollowing: following,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error checking follow status: ", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while checking follow status",
        data: undefined,
      },
      {
        status: 500,
      },
    );
  }
}
