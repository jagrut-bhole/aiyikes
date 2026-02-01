import { AllImageSchemaResponse } from "./allImageSchema";
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from "next/server";
import { getAllImages } from "@/helpers/imageHelper";
import { getAuthenticatedUser } from "@/helpers/authHelper";

export async function GET(req: NextRequest): Promise<NextResponse<AllImageSchemaResponse>> {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized Request"
        },
        {
          status: 401
        }
      );
    };

    const images = await getAllImages();

    if (!images) {
      return NextResponse.json(
        {
          success: false,
          message: "No images found"
        },
        {
          status: 401
        }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: images.length > 0 ? "Images fetched successfully" : "No images found",
        data: images
      }
    )
  } catch (error) {
    console.log("Server Error while fecthing the images: ",error);
    return NextResponse.json(
      {
        success : false,
        message: "Server Error in fetching the images"
      },
      {
        status : 500
      }
    )
  }
}