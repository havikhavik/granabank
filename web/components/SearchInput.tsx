"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

// Client Component porque reacciona a lo que se tipea. No pide datos: solo
// cambia ?q= en la URL y la página (Server Component) vuelve a buscar.
export default function SearchInput({ defaultValue, type }: { defaultValue: string; type?: string }) {
  const router = useRouter();
  // Guarda el timer entre renders sin provocar un re-render (no es estado).
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce: cada tecla cancela el timer anterior, así solo se navega cuando
  // el usuario deja de tipear por 300 ms (y no se pide a la API por cada letra).
  function handleChange(value: string) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (value.trim()) params.set("q", value.trim());
      if (type) params.set("type", type); // conserva el filtro activo
      // replace y no push: cada búsqueda no agrega una entrada al historial.
      router.replace(`/movimientos?${params}`, { scroll: false });
    }, 300);
  }

  return (
    <label className="flex h-[60px] items-center gap-4 rounded-2xl bg-white px-4 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
      <Search size={22} className="shrink-0 text-muted" aria-hidden />
      <input
        type="search"
        defaultValue={defaultValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Ingresa un nombre o servicio"
        aria-label="Buscar movimientos"
        className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
      />
    </label>
  );
}
