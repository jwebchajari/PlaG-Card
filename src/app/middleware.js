import { NextResponse } from "next/server";

export function middleware(req) {
	const session = req.cookies.get("session")?.value;

	const isLoginPage = req.nextUrl.pathname.startsWith("/dashboard/login");

	if (!session && !isLoginPage) {
		return NextResponse.redirect(new URL("/dashboard/login", req.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*"],
};
