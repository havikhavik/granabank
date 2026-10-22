import { notFound } from "next/navigation";
import BackLink from "@/components/BackLink";
import { getTypeStyle } from "@/components/MovementItem";
import { apiGet, type MovementDetail } from "@/lib/api";
import { formatAmount, formatDateTime } from "@/lib/format";

export default async function MovementDetailPage({ params }: PageProps<"/movimientos/[id]">) {
  const { id } = await params;

  // /movimientos/abc no puede existir: se responde 404 sin llamar a la API.
  if (!/^\d+$/.test(id)) notFound();

  // Si la API responde 404 (inexistente o ajeno), apiGet llama a notFound().
  const movement = await apiGet<MovementDetail>(`/movements/${id}`);
  const { Icon, text, bg } = getTypeStyle(movement.type.code);

  return (
    <main className="px-5 pt-7">
      <BackLink />

      <section className="mt-6 flex flex-col items-center rounded-2xl bg-white px-6 py-8 text-center shadow-card">
        <span className={`flex size-16 items-center justify-center rounded-2xl ${bg} ${text}`}>
          <Icon size={28} strokeWidth={2.75} />
        </span>
        <h1 className="mt-4 text-xl font-medium text-ink-soft">{movement.counterparty}</h1>
        <p className="text-sm text-muted">{movement.type.label}</p>
        <p className={`mt-4 text-3xl font-semibold ${text}`}>
          {movement.type.isNegative ? "-" : "+"} {formatAmount(movement.amount)}
        </p>
      </section>

      <dl className="mt-4 divide-y divide-gray-100 rounded-2xl bg-white px-6 shadow-card">
        <Row label="Fecha">{formatDateTime(movement.occurredAt)}</Row>
        <Row label="Tarjeta">
          {movement.card.brand === "VISA" ? "Visa" : "Mastercard"} •••• {movement.card.last4}
        </Row>
        {movement.description && <Row label="Descripción">{movement.description}</Row>}
      </dl>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{children}</dd>
    </div>
  );
}
