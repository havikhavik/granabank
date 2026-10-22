import { Bell, Search } from "lucide-react";
import Link from "next/link";
import BalanceCard from "@/components/BalanceCard";
import MovementItem from "@/components/MovementItem";
import { apiGet, type Me, type MovementList } from "@/lib/api";

// Server Component: los datos se piden en el servidor y llega el HTML listo.
export default async function HomePage() {
  // Las dos llamadas son independientes: se hacen en paralelo.
  const [me, movements] = await Promise.all([
    apiGet<Me>("/me"),
    apiGet<MovementList>("/movements?limit=4"),
  ]);

  return (
    <main className="px-6 pt-11">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-[15px] text-ink-soft">Hola</p>
          <h1 className="text-xl font-semibold">{me.user.name}</h1>
        </div>
        <div className="mt-2 flex items-center gap-5">
          <Link href="/movimientos" aria-label="Buscar movimientos">
            <Search size={22} strokeWidth={2} className="text-ink" />
          </Link>
          {/* Popover API nativa: abre/cierra sin JS y se cierra solo con Esc o
              al tocar afuera. Se ubica a la derecha de la columna de 430 px. */}
          <button type="button" popoverTarget="notificaciones" aria-label="Notificaciones">
            <Bell size={22} strokeWidth={2} className="text-ink" />
          </button>
          <div
            id="notificaciones"
            popover="auto"
            className="inset-auto top-20 right-[max(1.5rem,calc(50vw-215px+1.5rem))] m-0 rounded-xl bg-white px-4 py-3 text-sm text-ink-soft shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
          >
            No hay notificaciones
          </div>
        </div>
      </header>

      {/* Carrusel solo con CSS: overflow-x para deslizar y scroll snap para que
          cada tarjeta quede alineada al soltar. La siguiente asoma a la derecha.
          scroll-px-6 hace que el snap respete el margen (sin él, la tarjeta
          quedaría pegada al borde de la pantalla). */}
      <section
        aria-label="Tarjetas"
        className="-mx-6 mt-7 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6"
      >
        {me.cards.map((card) => (
          <BalanceCard key={card.id} card={card} />
        ))}
      </section>

      <section className="mt-8">
        <h2 className="text-xl">Últimos movimientos</h2>

        {movements.items.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted">Todavía no tenés movimientos.</p>
        ) : (
          <ul className="mt-5 flex flex-col gap-4">
            {movements.items.map((movement) => (
              <li key={movement.id}>
                <MovementItem movement={movement} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
