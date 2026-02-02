import axios from "axios";

export interface UserImage {
    id: string;
    prompt: string;
    s3Url: string;
    model: string;
    seed: number;
    likeCount: number;
    remixCount: number;
    createdAt: string;
}

export async function uploadAvatar(file: File): Promise<{ success: boolean; avatarUrl?: string }> {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post("/api/upload/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.data.success) {
            return {
                success: true,
                avatarUrl: response.data.avatarUrl,
            };
        }

        return { success: false };
    } catch (error) {
        console.error("Error uploading avatar:", error);
        return { success: false };
    }
}

export async function getUserImages(): Promise<{ success: boolean; data?: UserImage[]; message?: string }> {
    try {
        const response = await axios.get("/api/user/images");
        return response.data;
    } catch (error) {
        console.error("Error fetching user images:", error);
        return { success: false, message: "Failed to fetch images" };
    }
}
