import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

// Nombre de la cookie httpOnly donde se guarda el JWT.
export const SESSION_COOKIE = "session";

// Si la API no responde en este tiempo, el fetch se corta y se muestra el error
// (con "Reintentar") en vez de dejar la página cargando indefinidamente.
export const API_TIMEOUT_MS = 10_000;

// Tipos de las respuestas de la API (ver contrato en el README).
export type Card = {
  id: number;
  holderName: string;
  brand: "VISA" | "MASTERCARD";
  last4: string;
  expMonth: number;
  expYear: number;
  currency: string;
  balance: string;
};

export type Me = {
  user: { id: number; name: string };
  cards: Card[];
};

export type Movement = {
  id: number;
  counterparty: string;
  amount: string;
  occurredAt: string;
  // string y no la unión de los 3 códigos: los tipos viven en una tabla y
  // pueden aparecer otros. La web los muestra con un estilo neutro.
  type: { code: string; label: string; isNegative: boolean };
};

export type MovementList = {
  items: Movement[];
  total: number;
};

export type MovementDetail = Movement & {
  description: string | null;
  card: { brand: Card["brand"]; last4: string };
};

// GET a la API con el token de la cookie. Solo corre en el servidor:
// el token nunca llega al JavaScript del navegador.
export async function apiGet<T>(path: string): Promise<T> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  // El proxy ya lo evita, pero sin cookie no tiene sentido llamar a la API.
  if (!token) redirect("/login");

  const res = await fetch(`${process.env.API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    // Datos personales y dinámicos: nunca se cachean.
    cache: "no-store",
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });

  // Token vencido o inválido: hay que volver a iniciar sesión. ?expired le avisa
  // al proxy que borre la cookie (un Server Component no puede modificarla).
  if (res.status === 401) {
    redirect("/login?expired=1");
  }

  // Recurso inexistente (o ajeno: la API responde 404 igual). Muestra el
  // not-found.tsx más cercano.
  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error(`La API respondió ${res.status} en ${path}`);
  }

  return res.json();
}
