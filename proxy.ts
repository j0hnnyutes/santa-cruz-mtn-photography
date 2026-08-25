import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE, CSRF_COOKIE } from "@/lib/adminSession";

const PUBLIC_ADMIN_PAGES = new Set(["/admin", "/admin/"]);
const PUBLIC_API_ROUTES = new Set(["/api/admin/login", "/api/admin/login/"]);
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthed = verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);

  const isAdminPage = pathname.startsWith("/admin") && !PUBLIC_ADMIN_PAGES.has(pathname);
  const isAdminApi = pathname.startsWith("/api/admin") && !PUBLIC_API_ROUTES.has(pathname);

  if (isAdminPage && !isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  if (isAdminApi) {
    if (!isAuthed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (MUTATING_METHODS.has(req.method)) {
      const csrfCookie = req.cookies.get(CSRF_COOKIE)?.value;
      const csrfHeader = req.headers.get("x-admin-csrf");
      const origin = req.headers.get("origin");

      if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
      }
      if (origin && origin !== req.nextUrl.origin) {
        return NextResponse.json({ error: "Cross-origin request blocked" }, { status: 403 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
