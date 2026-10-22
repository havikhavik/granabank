import { SearchX } from "lucide-react";
import Link from "next/link";
import BackLink from "@/components/BackLink";

// Se muestra cuando la página llama a notFound(): el id no existe, no es
// válido o el movimiento es de otro usuario (la API no distingue los casos).
export default function NotFound() {
  return (
    <main className="px-5 pt-7">
      <BackLink />
      <div className="mt-6 flex flex-col items-center rounded-2xl bg-white px-6 py-10 text-center shadow-card">
        <SearchX size={40} className="text-muted" aria-hidden />
        <h1 className="mt-4 text-lg font-medium text-ink">No encontramos el movimiento</h1>
        <p className="mt-1 text-sm text-muted">Puede que no exista o que ya no esté disponible.</p>
        <Link href="/movimientos" className="mt-6 rounded-2xl bg-granate px-6 py-3 text-sm font-semibold text-white">
          Ver movimientos
        </Link>
      </div>
    </main>
  );
}
