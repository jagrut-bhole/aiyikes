import { NextResponse, NextRequest } from "next/server";
import { AllImageSchemaResponse } from "./allImageSchema";
import { getAuthenticatedUser } from "@/helpers/authHelper";
import { getAllImages } from "@/helpers/imageHelper";

export async function GET(
  req: NextRequest,
): Promise<NextResponse<AllImageSchemaResponse>> {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    const images = await getAllImages();

    if (images === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Error fetching images",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          images.length > 0
            ? "Images fetched successfully!!"
            : "No images found",
        data: images,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log("Error fetching the images :", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching the images",
      },
      { status: 500 },
    );
  }
}
