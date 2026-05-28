import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("warga_session")?.value;

  if (!session) {
    const originalUrl = request.nextUrl.pathname + request.nextUrl.search;
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", originalUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/keuangan/:path*",
    "/layanan/administrasi/:path*",
    "/admin/:path*",
    "/surat/:path*",
  ],
};
