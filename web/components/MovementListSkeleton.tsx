// Placeholder con la misma forma que las tarjetas de movimiento, para que la
// página no "salte" cuando llegan los datos.
export default function MovementListSkeleton() {
  return (
    <ul className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando movimientos">
      {Array.from({ length: 5 }, (_, i) => (
        <li
          key={i}
          className="flex animate-pulse items-center gap-4 rounded-2xl bg-white px-4 py-6 shadow-card"
        >
          <span className="size-11 shrink-0 rounded-xl bg-gray-100" />
          <span className="flex-1 space-y-2">
            <span className="block h-4 w-32 rounded bg-gray-100" />
            <span className="block h-3 w-24 rounded bg-gray-100" />
          </span>
          <span className="h-4 w-10 rounded bg-gray-100" />
        </li>
      ))}
    </ul>
  );
}
