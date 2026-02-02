import { NextRequest, NextResponse } from "next/server";
import {profileImageDeleteReqSchema, ProfileImageDeleteResponse} from "./profileImageDeleteSchema";
import { getAuthenticatedUser } from "@/helpers/authHelper";
import { getImageById } from "@/helpers/imageHelper";

export async function DELETE(request: NextRequest) {
}
