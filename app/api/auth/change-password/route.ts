import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "./changePasswordSchema";
import {
  getAuthenticatedUser,
  invalidateUserCache,
} from "@/helpers/authHelper";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ChangePasswordResponse>> {
  try {
    const user = await getAuthenticatedUser();

    if (!user || !user.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized Request",
        },
        {
          status: 401,
        },
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });

    if (!dbUser || !dbUser.password) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found or invalid account type",
        },
        {
          status: 401,
        },
      );
    }

    const body = await req.json();

    if (!body) {
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

    const { currentPassword, newPassword }: ChangePasswordRequest = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password and new password are required",
        },
        {
          status: 400,
        },
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is incorrect",
        },
        {
          status: 401,
        },
      );
    }

    // Hash and update new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedNewPassword,
      },
    });

    await invalidateUserCache(user.id, dbUser.email);

    return NextResponse.json(
      {
        success: true,
        message: "Password changed successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Internal Server error while changing the password", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server error while changing the password",
      },
      {
        status: 500,
      },
    );
  }
}
