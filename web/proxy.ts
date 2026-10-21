import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "./lib/api";

// Corre antes de cada request a las rutas del matcher. Es un chequeo rápido
// (¿hay cookie?): la validación real del token la hace la API en cada request.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (request.nextUrl.pathname === "/login") {
    if (!hasSession) return;

    // apiGet manda acá con ?expired cuando la API rechazó el token. Hay que borrar
    // la cookie: si no, /login redirigiría a / y / de vuelta a /login, sin fin.
    if (request.nextUrl.searchParams.has("expired")) {
      const response = NextResponse.next();
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }

    // Con sesión no tiene sentido ver el login.
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Protege todo salvo los archivos estáticos (JS, CSS, imágenes y los .svg de
// public/): una página nueva queda protegida sin acordarse de agregarla acá.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.svg$).*)"],
};
