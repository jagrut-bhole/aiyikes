import axios from "axios";
import { AuthSchemaRequest } from "@/types/authSchema/AuthSchema";
import { SignupSchemaResponse } from "@/app/api/auth/signup/signupSchema";

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
