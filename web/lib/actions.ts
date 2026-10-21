"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_TIMEOUT_MS, SESSION_COOKIE } from "./api";

// Lo que la acción le devuelve al formulario: el error a mostrar y el email
// ingresado, para no borrarlo cuando el login falla.
export type LoginState = { error: string; email: string } | undefined;

const SEVEN_DAYS = 60 * 60 * 24 * 7; // igual a la expiración del JWT

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  if (!email || !password) {
    return { error: "Completá el email y la contraseña.", email };
  }
  if (!email.includes("@")) {
    return { error: "El email tiene que tener una @, por ejemplo nombre@dominio.com.", email };
  }

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
  } catch {
    // La API está caída o no respondió a tiempo.
    return { error: "No pudimos conectarnos. Probá de nuevo en unos minutos.", email };
  }

  if (!res.ok) {
    // 400 y 401 traen un mensaje pensado para el usuario; el resto, uno genérico.
    const body = await res.json().catch(() => null);
    const message =
      res.status === 400 || res.status === 401
        ? body?.error?.message
        : "Ocurrió un error inesperado. Probá de nuevo.";
    return { error: message ?? "Email o contraseña incorrectos", email };
  }

  const { token } = await res.json();

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, // el JavaScript del navegador no puede leerla
    secure: process.env.NODE_ENV === "production", // solo por HTTPS
    sameSite: "lax",
    path: "/",
    // Sin maxAge es una cookie de sesión: se borra al cerrar el navegador.
    maxAge: remember ? SEVEN_DAYS : undefined,
  });

  redirect("/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
