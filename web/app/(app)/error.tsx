"use client"; // los error boundaries de React solo existen en el navegador

import { CircleAlert } from "lucide-react";

// Atrapa los errores de las páginas privadas (por ejemplo, la API caída).
// Al estar en (app), reemplaza solo el contenido: la barra de navegación sigue.
// En producción Next no manda el mensaje real al navegador, así que se muestra
// uno genérico.
export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="flex flex-col items-center px-5 pt-24 text-center">
      <CircleAlert size={40} className="text-granate" aria-hidden />
      <h1 className="mt-4 text-lg font-medium text-ink">Algo salió mal</h1>
      <p className="mt-1 text-sm text-muted">No pudimos cargar la información. Probá de nuevo.</p>
      {/* retry vuelve a pedir los datos al servidor y re-renderiza la página. */}
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 rounded-2xl bg-granate px-6 py-3 text-sm font-semibold text-white"
      >
        Reintentar
      </button>
    </main>
  );
}
