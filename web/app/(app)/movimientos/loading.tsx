import MovementListSkeleton from "@/components/MovementListSkeleton";

// Se muestra al entrar a /movimientos mientras el servidor arma la página.
// Imita el buscador, los filtros y las tarjetas para que nada salte al cargar.
export default function Loading() {
  return (
    <main className="px-5 pt-7">
      <h1 className="text-xl text-ink">Movimientos</h1>
      <div className="mt-5 h-[60px] animate-pulse rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.05)]" />
      <div className="mt-5 flex gap-2 pb-2">
        {[71, 105, 89, 84].map((width) => (
          <div key={width} style={{ width }} className="h-11 shrink-0 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
      <div className="mt-5">
        <MovementListSkeleton />
      </div>
    </main>
  );
}
