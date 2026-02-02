import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/helpers/authHelper";
import { updateUserAvatar } from "@/helpers/userHelper";

export async function POST(request: Request) {
    try {
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        let formData: FormData;
        try {
            formData = await request.formData();
        } catch (e) {
            console.error("Error parsing FormData:", e);
            return NextResponse.json(
                { success: false, message: "Failed to parse form data. File may be too large." },
                { status: 400 }
            );
        }

        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { success: false, message: "No file provided" },
                { status: 400 }
            );
        }

        // Check file size (max 5MB for avatars)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, message: "File too large. Maximum size is 5MB." },
                { status: 400 }
            );
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");
        const dataURI = `data:${file.type};base64,${base64}`;

        // Prepare upload to Cloudinary
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            throw new Error("Cloudinary credentials not configured");
        }

        // Create signature for authenticated upload
        const timestamp = Math.round(new Date().getTime() / 1000);
        const crypto = require("crypto");

        const params = {
            timestamp: timestamp.toString(),
            folder: "aiyikes/avatars",
            public_id: `avatar_${user.id}`,
            overwrite: "true",
        };

        const signature = crypto
            .createHash("sha256")
            .update(
                `folder=${params.folder}&overwrite=${params.overwrite}&public_id=${params.public_id}&timestamp=${params.timestamp}${apiSecret}`
            )
            .digest("hex");

        // Upload to Cloudinary
        const uploadFormData = new FormData();
        uploadFormData.append("file", dataURI);
        uploadFormData.append("api_key", apiKey);
        uploadFormData.append("timestamp", params.timestamp);
        uploadFormData.append("signature", signature);
        uploadFormData.append("folder", params.folder);
        uploadFormData.append("public_id", params.public_id);
        uploadFormData.append("overwrite", params.overwrite);

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const uploadResponse = await fetch(cloudinaryUrl, {
            method: "POST",
            body: uploadFormData,
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error("Cloudinary error:", errorText);
            throw new Error("Failed to upload to Cloudinary");
        }

        const uploadData = await uploadResponse.json();

        // Update avatar in database
        const updated = await updateUserAvatar(user.id, uploadData.secure_url);

        if (!updated) {
            return NextResponse.json(
                { success: false, message: "Failed to update avatar in database" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Avatar uploaded successfully",
            avatarUrl: uploadData.secure_url,
        });
    } catch (error) {
        console.error("Error uploading avatar:", error);
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : "Failed to upload avatar" },
            { status: 500 }
        );
    }
}
