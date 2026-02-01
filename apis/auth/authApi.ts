import axios from "axios";
import { AuthSchemaRequest } from "@/types/authSchema/AuthSchema";
import { SignupSchemaResponse } from "@/app/api/auth/signup/signupSchema";

// Register user api endpoint
type RegisterUser = Pick<AuthSchemaRequest, "name" | "email" | "password">;
export const registerUser = async (
    user: RegisterUser,
): Promise<SignupSchemaResponse> => {
    try {
        const response = await axios.post("/api/auth/signup", {
            name: user.name,
            email: user.email,
            password: user.password,
        });

        return response.data;
    } catch (error) {
        console.log("Error while registering the user: ", error);
        throw error;
    }
};


// user profile api endpoint
import { ProfileSchemaResponse } from "@/app/api/user/profile/profileSchema";
export const userProfile = async (): Promise<ProfileSchemaResponse> => {
    try {
        const response = await axios.get('/api/user/profile');
        return response.data;
    } catch (error) {
        console.log("Error while fetching the user profile: ", error);
        throw error;
    }
}

// user change password api endpoint
interface ChangePasswordParams {
    currentPassword: string;
    newPassword: string;
}

export const changePassword = async (params: ChangePasswordParams) => {
    try {
        const response = await axios.post('/api/auth/change-password', {
            currentPassword: params.currentPassword,
            newPassword: params.newPassword
        });
        return response.data;
    } catch (error) {
        console.log("Error while changing the user password: ", error);
        throw error;
    }
}