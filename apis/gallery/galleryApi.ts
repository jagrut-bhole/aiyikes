import axios from "axios";

export interface GalleryImage {
    id: string;
    prompt: string;
    s3Url: string;
    model: string;
    seed: number;
    isPublic: boolean;
    likeCount: number;
    remixCount: number;
    createdAt: string;
}

export interface GalleryResponse {
    success: boolean;
    message: string;
    data?: GalleryImage[];
}

export const getAllImages = async (): Promise<GalleryResponse> => {
    try {
        const response = await axios.get("/api/all-images");
        return response.data;
    } catch (error) {
        console.error("Error fetching gallery images:", error);
        throw error;
    }
};
