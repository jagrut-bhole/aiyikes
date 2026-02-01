import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import {
  GenerateImageRequestSchema,
  GenerateImageResponse,
} from "./GenerateImageSchema";
import { getAuthenticatedUser } from "@/helpers/authHelper";
import { generateImage } from "@/services/pollinationServices";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<GenerateImageResponse>> {

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
      )
    }

    const body = await req.json();

    const validationResult = GenerateImageRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Request",
        },
        {
          status: 400,
        },
      );
    }

    const seed = Math.floor(Math.random() * 1000000);

    const { prompt, model, isPublic } = body;

    const imageUrl = await generateImage({
      prompt,
      model,
      seed,
    });

    const savedImage = await prisma.image.create({
      data: {
        userId: user.id,
        prompt,
        model,
        seed,
        s3Url: imageUrl,
        isPublic,
        isRemixed: false,
        remixCount: 0,
        likeCount: 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Image generated successfully",
        imageUrl,
        imageId: savedImage.id,
      },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    console.log("Error while generating the image: ", error);
    const errorMessage = error?.message || "Server Error while generating the image";
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      {
        status: 500,
      },
    );
  }
}
