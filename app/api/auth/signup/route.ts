import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { SignupSchemaRequest, SignupSchemaResponse } from "./signupSchema";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<SignupSchemaResponse>> {
  try {
    const body = await req.json();
    const { name, email, password }: SignupSchemaRequest = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        {
          status: 400,
        },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
        },
        {
          status: 400,
        },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email already exists!!",
        },
        {
          status: 400,
        },
      );
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        avatar: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const userToBeSent = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully!!",
        data: userToBeSent,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Error while registering the user", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error while registering the user",
      },
      {
        status: 500,
      },
    );
  }
}
