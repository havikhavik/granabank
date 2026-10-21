"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// Client Component porque reacciona a lo que se tipea. No pide datos: solo
// cambia ?q= en la URL y la página (Server Component) vuelve a buscar.
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

  // Debounce: cada tecla cancela el timer anterior, así solo se navega cuando
  // el usuario deja de tipear por 300 ms (y no se pide a la API por cada letra).
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
    <label className="flex h-[60px] items-center gap-4 rounded-2xl bg-white px-4 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
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
