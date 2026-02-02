import axios from "axios";

export interface GalleryImageCreator {
    id: string;
    name: string;
    avatar: string | null;
}

export interface GalleryImage {
    id: string;
    prompt: string;
    s3Url: string;
    pollinationUrl: string | null;
    model: string;
    seed: number;
    isPublic: boolean;
    likeCount: number;
    remixCount: number;
    createdAt: string;
    user: GalleryImageCreator;
    isLiked: boolean;
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

export interface UserImageLikeResponse {
    success: boolean,
    message: string,
    isLiked: boolean,
    likeCount: number,
}

export const userImageLike = async (imageId: string): Promise<UserImageLikeResponse> => {
    try {
        const response = await axios.post('/api/image/like', {
            imageId
        });
        return response.data;
    } catch (error) {
        console.log("Error while sending like to image: ", error);
        throw error;
    }
}

interface FollowToggleResponse {
    success: boolean,
    message: string,
    isFollowing?: boolean,
}

export const toggleUserFollow = async (targetUserId: string, action: "follow" | "unfollow"): Promise<FollowToggleResponse> => {
    try {
        const response = await axios.post('/api/follow/toggle', {
            targetUserId,
            action
        });
        return response.data;
    } catch (error) {
        console.log("Error while toggling follow: ", error);
        throw error;
    }
}

interface CheckFollowResponse {
    success: boolean,
    message: string,
    isFollowing?: boolean,
}

export const checkFollowStatus = async (targetUserId: string): Promise<CheckFollowResponse> => {
    try {
        const response = await axios.post('/api/check-follow', {
            targetUserId
        });
        return response.data;
    } catch (error) {
        console.log("Error while checking follow status: ", error);
        throw error;
    }
}

export interface RemixImageResponse {
    success: boolean;
    message: string;
    data?: {
        id: string;
        remixPrompt: string;
        originalPrompt: string;
        imageUrl: string;
        pollinationUrl: string;
    };
}

export const remixImage = async (originalImageId: string, remixPrompt: string): Promise<RemixImageResponse> => {
    try {
        const response = await axios.post('/api/remix-image', {
            originalImageId,
            remixPrompt,
        });
        return response.data;
    } catch (error: any) {
        console.log("Error while remixing image: ", error);
        return {
            success: false,
            message: error?.response?.data?.message || "Failed to remix image",
        };
    }
}

export interface UserRemix {
    id: string;
    remixPrompt: string;
    originalPrompt: string;
    s3Url: string;
    pollinationUrl: string;
    seed: number;
    createdAt: string;
    originalImage: {
        id: string;
        s3Url: string;
        prompt: string;
        model: string;
        user: {
            id: string;
            name: string;
            avatar: string | null;
        };
    };
}

export interface UserRemixesResponse {
    success: boolean;
    message: string;
    data?: UserRemix[];
}

export const getUserRemixes = async (): Promise<UserRemixesResponse> => {
    try {
        const response = await axios.get('/api/user/remixes');
        return response.data;
    } catch (error) {
        console.log("Error while fetching user remixes: ", error);
        throw error;
    }
}