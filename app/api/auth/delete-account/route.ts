import { prisma } from "@/lib/prisma";
import {
  DeleteAccountRequest,
  DeleteAccountResponse,
} from "./deleteAccountSchema";
import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import {
  invalidateUserCache,
  getAuthenticatedUser,
} from "@/helpers/authHelper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<DeleteAccountResponse>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
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
          message: "User not found",
        },
        {
          status: 404,
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

    const { password }: DeleteAccountRequest = body;

    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password not set for user",
        },
        {
          status: 400,
        },
      );
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
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

    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User account deleted successfully!!",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Internal Server Error in Deleting the user account: ",
      error,
    );
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error in Deleting the user account",
      },
      {
        status: 500,
      },
    );
  }
}
