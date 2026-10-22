"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// Solo cambia ?q= en la URL: la página vuelve a buscar en el servidor.
export default function SearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  // Guarda el timer entre renders sin provocar un re-render (no es estado).
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Si el usuario se va de la página con una búsqueda pendiente, se cancela:
  // si no, el timer dispararía igual y lo traería de vuelta a Movimientos.
  useEffect(() => () => clearTimeout(timer.current), []);

  // El input no es controlado: defaultValue solo se usa al montarlo. Si la URL
  // cambia por otro lado (el link "Movimientos" de la barra inferior la deja sin
  // ?q=), se actualiza a mano. Con una búsqueda pendiente no se toca, porque el
  // usuario está tipeando y se le borraría lo que escribió.
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (input.current && !timer.current && input.current.value.trim() !== defaultValue) {
      input.current.value = defaultValue;
    }
  }, [defaultValue]);

  // Debounce de 300 ms: navega cuando el usuario deja de tipear.
  function handleChange(value: string) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = undefined; // ya no hay búsqueda pendiente
      // Parte de la URL de este momento y no de la del render: si el usuario
      // cambió el filtro mientras tipeaba, se conserva.
      const params = new URLSearchParams(window.location.search);
      if (value.trim()) params.set("q", value.trim());
      else params.delete("q");
      // replace y no push: cada búsqueda no agrega una entrada al historial.
      router.replace(`/movimientos?${params}`, { scroll: false });
    }, 300);
  }

  return (
    // El input no tiene outline: el anillo de foco va en el label, que lo envuelve.
    <label className="flex h-[60px] items-center gap-4 rounded-2xl bg-white px-4 shadow-card focus-within:ring-2 focus-within:ring-granate/30">
      <Search size={22} className="shrink-0 text-muted" aria-hidden />
      <input
        ref={input}
        type="search"
        maxLength={100}
        defaultValue={defaultValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Ingresa un nombre o servicio"
        aria-label="Buscar movimientos"
        className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
      />
    </label>
  );
}
