import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react";
import Link from "next/link";
import type { Movement } from "@/lib/api";
import { formatAmount } from "@/lib/format";

// Ícono y colores por tipo de movimiento. Las clases van completas (no armadas
// con strings) porque Tailwind solo genera las clases que encuentra literales.
const typeStyles = {
  SUBSCRIPTION: { Icon: ArrowDownUp, text: "text-subscription", bg: "bg-subscription-bg" },
  CASH_IN: { Icon: ArrowDown, text: "text-cash-in", bg: "bg-cash-in-bg" },
  CASH_OUT: { Icon: ArrowUp, text: "text-cash-out", bg: "bg-cash-out-bg" },
};

export default function MovementItem({ movement }: { movement: Movement }) {
  const { Icon, text, bg } = typeStyles[movement.type.code];

  return (
    <Link
      href={`/movimientos/${movement.id}`}
      className="flex items-center gap-4 rounded-2xl bg-white px-4 py-6 shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
    >
      <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${bg} ${text}`}>
        <Icon size={20} strokeWidth={2.75} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-ink-soft">{movement.counterparty}</span>
        <span className="block text-xs text-muted">{movement.type.label}</span>
      </span>

      <span className={`text-sm font-medium ${text}`}>{formatAmount(movement.amount)}</span>
    </Link>
  );
}
