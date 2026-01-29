import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
    const url = req.nextUrl;

    return NextResponse.next();
}

export const config = {
    matcher: "/api/:path*",
};
