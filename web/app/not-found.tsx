import { SearchX } from "lucide-react";
import Link from "next/link";

// 404 de cualquier ruta que no existe (reemplaza la página por defecto de Next,
// que está en inglés). Sin sesión no se llega acá: el proxy manda a /login.
export default function NotFound() {
  return (
    <main className="flex flex-col items-center px-5 pt-24 text-center">
      <SearchX size={40} className="text-muted" aria-hidden />
      <h1 className="mt-4 text-lg font-medium text-ink">No encontramos esta página</h1>
      <p className="mt-1 text-sm text-muted">Puede que el link esté mal escrito o que ya no exista.</p>
      <Link href="/" className="mt-6 rounded-2xl bg-granate px-6 py-3 text-sm font-semibold text-white">
        Ir al inicio
      </Link>
    </main>
  );
}
