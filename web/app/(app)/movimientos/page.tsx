import Link from "next/link";
import { Suspense } from "react";
import MovementItem from "@/components/MovementItem";
import MovementListSkeleton from "@/components/MovementListSkeleton";
import SearchInput from "@/components/SearchInput";
import { apiGet, type Movement, type MovementList } from "@/lib/api";

type MovementType = Movement["type"]["code"];

// Filtros rápidos del diseño. "Todos" no manda type.
const filters: { label: string; type?: MovementType }[] = [
  { label: "Todos" },
  { label: "Débito Aut.", type: "SUBSCRIPTION" },
  { label: "Recibido", type: "CASH_IN" },
  { label: "Enviado", type: "CASH_OUT" },
];

// Por ahora se piden hasta 50 (el máximo de la API), sin paginar.
const LIMIT = 50;

// Arma la URL de la lista con los filtros que tengan valor.
function movementsHref(q: string, type?: MovementType) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (type) params.set("type", type);
  const query = params.toString();
  return query ? `/movimientos?${query}` : "/movimientos";
}

// La búsqueda y el filtro viven en la URL (?q=&type=): se pueden compartir,
// sobreviven a un refresh y el botón "atrás" funciona.
export default async function MovementsPage({ searchParams }: PageProps<"/movimientos">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  // Un type desconocido en la URL se ignora en vez de mandarlo a la API (que daría 400).
  const type = filters.find((f) => f.type && f.type === params.type)?.type;

  return (
    <main className="px-5 pt-7">
      <h1 className="text-xl text-ink">Movimientos</h1>

      <div className="mt-5">
        <SearchInput defaultValue={q} type={type} />
      </div>

      {/* Los 4 filtros entran completos en la columna de 430 px: con mouse el
          scroll horizontal no es evidente. overflow-x-auto queda solo para
          celulares muy angostos. */}
      <nav aria-label="Filtrar por tipo" className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">
        {filters.map((filter) => {
          const active = filter.type === type;
          return (
            <Link
              key={filter.label}
              href={movementsHref(q, filter.type)}
              replace
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-2xl px-3.5 py-3 text-sm font-medium ${
                active ? "bg-granate text-white" : "bg-white text-black shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {/* Solo la lista espera a la API. La key hace que, al cambiar la búsqueda
          o el filtro, se vuelva a mostrar el skeleton mientras llegan los datos. */}
      <section className="mt-5">
        <Suspense key={`${q}|${type}`} fallback={<MovementListSkeleton />}>
          <MovementResults q={q} type={type} />
        </Suspense>
      </section>
    </main>
  );
}

async function MovementResults({ q, type }: { q: string; type?: MovementType }) {
  const params = new URLSearchParams({ limit: String(LIMIT) });
  if (q) params.set("q", q);
  if (type) params.set("type", type);

  const { items, total } = await apiGet<MovementList>(`/movements?${params}`);

  if (items.length === 0) {
    return (
      <p className="mt-10 text-center text-sm text-muted">
        {q ? `No encontramos movimientos para «${q}».` : "No hay movimientos de este tipo."}
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-4">
        {items.map((movement) => (
          <li key={movement.id}>
            <MovementItem movement={movement} />
          </li>
        ))}
      </ul>
      {total > items.length && (
        <p className="mt-6 text-center text-xs text-muted">
          Mostrando los {items.length} más recientes de {total}.
        </p>
      )}
    </>
  );
}
