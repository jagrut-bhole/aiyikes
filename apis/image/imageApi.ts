import axios from "axios";

interface GenerateImageProps {
    prompt: string;
    model: string;
    isPublic: boolean;
}

export interface GenerateImageResponse {
    success: boolean;
    message: string;
    imageUrl?: string;
    imageId?: string;
}

export const generateImage = async (props: GenerateImageProps): Promise<GenerateImageResponse> => {
    try {
        const response = await axios.post("/api/generate-image", {
            prompt: props.prompt,
            model: props.model,
            isPublic: props.isPublic,
        });
        return response.data;
    } catch (error) {
        console.error("Error generating image:", error);
        throw error;
    }
}