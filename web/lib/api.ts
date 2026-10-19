import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Nombre de la cookie httpOnly donde se guarda el JWT.
export const SESSION_COOKIE = "session";

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
  type: { code: "SUBSCRIPTION" | "CASH_IN" | "CASH_OUT"; label: string; isNegative: boolean };
};

export type MovementList = {
  items: Movement[];
  total: number;
};

// GET a la API con el token de la cookie. Solo corre en el servidor:
// el token nunca llega al JavaScript del navegador.
export async function apiGet<T>(path: string): Promise<T> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  const res = await fetch(`${process.env.API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    // Datos personales y dinámicos: nunca se cachean.
    cache: "no-store",
  });

  // Token vencido o inválido: hay que volver a iniciar sesión.
  if (res.status === 401) {
    redirect("/login");
  }

  if (!res.ok) {
    throw new Error(`La API respondió ${res.status} en ${path}`);
  }

  return res.json();
}
