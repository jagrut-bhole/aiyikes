import { prisma } from "@/lib/prisma";
import { ProfileSchemaResponse } from "./profileSchema";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelper";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ProfileSchemaResponse>> {
  try {

    const user = await getAuthenticatedUser();

    if (!user) {
        return NextResponse.json(
            {
                success: false,
                message: "User not found"
            },
            {
                status: 404,
            }
        )
    }

    const profile = await prisma.user.findUnique({
        where : {
            id : user.id
        },
        select : {
            id: true,
            name : true,
            email : true,
            avatar : true,
            createdAt : true,
            generatedImages : {
                select : {
                    id : true,
                    prompt : true,
                    likeCount : true,
                    remixCount : true,
                    createdAt : true
                }
            }
        }
    });

    if (!profile) {
        return NextResponse.json(
            {
                success: false,
                message: "User not found"
            },
            {
                status: 404,
            }
        )
    }

    return NextResponse.json(
        {
            success: true,
            message: "Profile fetched successfully",
            data: profile
        },
        {
            status: 200,
        }
    )
  } catch (error) {
    console.error(
      "Internal Server Error in Fetching the user profile: ",
      error,
    );
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error in Fetching the user profile",
      },
      {
        status: 500,
      },
    );
  }
}
