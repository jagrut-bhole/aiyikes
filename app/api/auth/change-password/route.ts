import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    const session = await getServerSession(authOptions);

    if (!session?.user) {
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

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
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

    const { password }: ChangePasswordRequest = body;

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required",
        },
        {
          status: 400,
        },
      );
    }

    const hashedPassword = await bcrypt.compare(password, user.password);

    if (!hashedPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Password",
        },
        {
          status: 401,
        },
      );
    }

    user.password = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: user.password,
      },
    });

    await invalidateUserCache(user.id, user.email);

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
