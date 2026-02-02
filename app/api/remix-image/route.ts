import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { RemixImageSchema } from "./schema";
import { getAuthenticatedUser } from "@/helpers/authHelper";
import { generateRemixImage } from "@/services/pollinationServices";

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const body = await request.json();

        const validatedBody = RemixImageSchema.safeParse(body);

        if (!validatedBody.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request payload",
                    issues: validatedBody.error.issues,
                },
                {
                    status: 400,
                }
            );
        }

        const { originalImageId, remixPrompt } = validatedBody.data;

        // Get the original image
        const originalImage = await prisma.image.findUnique({
            where: { id: originalImageId },
            select: {
                id: true,
                prompt: true,
                seed: true,
                pollinationUrl: true,
                s3Url: true,
                model: true,
            },
        });

        if (!originalImage) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Original image not found",
                },
                {
                    status: 404,
                }
            );
        }

        // Check if original image has pollination URL
        // If not, we need to construct it from the original data
        let originalPollinationUrl = originalImage.pollinationUrl;

        if (!originalPollinationUrl) {
            // Construct the pollination URL from original image data
            const encodedPrompt = encodeURIComponent(originalImage.prompt);
            originalPollinationUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?model=${originalImage.model}&seed=${originalImage.seed}`;
        }

        // Generate the remixed image
        const result = await generateRemixImage({
            prompt: remixPrompt,
            originalImageUrl: originalPollinationUrl,
            seed: originalImage.seed,
        });

        // Save the remix to the database
        const savedRemix = await prisma.remixImage.create({
            data: {
                userId: user.id,
                originalImageId: originalImage.id,
                remixPrompt: remixPrompt,
                originalPrompt: originalImage.prompt,
                pollinationUrl: result.pollinationUrl,
                s3Url: result.base64DataUrl,
                seed: originalImage.seed,
            },
        });

        // Update the original image's remix count
        await prisma.image.update({
            where: { id: originalImageId },
            data: {
                remixCount: { increment: 1 },
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Remix generated successfully",
                data: {
                    id: savedRemix.id,
                    remixPrompt: savedRemix.remixPrompt,
                    originalPrompt: savedRemix.originalPrompt,
                    imageUrl: result.base64DataUrl,
                    pollinationUrl: result.pollinationUrl,
                },
            },
            {
                status: 200,
            }
        );
    } catch (error: any) {
        console.error("Error while generating remix image: ", error);
        return NextResponse.json(
            {
                success: false,
                message: error?.message || "Error while generating remix image",
            },
            {
                status: 500,
            }
        );
    }
}
