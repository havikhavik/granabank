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
          <Bell size={22} strokeWidth={2} className="text-ink" aria-hidden />
        </div>
      </header>

      {/* Si hay más de una tarjeta, se deslizan horizontalmente. */}
      <section aria-label="Tarjetas" className="-mx-6 mt-7 flex snap-x gap-4 overflow-x-auto px-6">
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
