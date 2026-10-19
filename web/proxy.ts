import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "./lib/api";

// Corre antes de cada request a las rutas del matcher. Es un chequeo rápido
// (¿hay cookie?): la validación real del token la hace la API en cada request.
export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Solo las páginas privadas. /login queda afuera para no entrar en un bucle.
export const config = {
  matcher: ["/", "/movimientos/:path*"],
};
