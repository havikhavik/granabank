import Image from "next/image";
import type { Card } from "@/lib/api";
import { formatBalance, formatExpiration } from "@/lib/format";

export default function BalanceCard({ card }: { card: Card }) {
  return (
    <article className="flex h-[190px] w-[95%] shrink-0 snap-start flex-col rounded-3xl bg-granate px-6 pt-4 pb-5 text-white">
      <div className="flex items-start justify-between">
        <p className="mt-1 text-sm">Balance</p>
        <Image
          src={card.brand === "VISA" ? "/visa.svg" : "/mastercard.svg"}
          alt={card.brand === "VISA" ? "Visa" : "Mastercard"}
          width={35}
          height={25}
        />
      </div>

      <div className="mt-1 flex items-center gap-3">
        <span className="rounded-md bg-gradient-to-r from-[#f5bc00] to-[#f7dbe9] px-2 py-1 text-xs">
          {card.currency}
        </span>
        <span className="text-xl">{formatBalance(card.balance)}</span>
      </div>

      <p className="mt-5 text-xl tracking-[0.12em]" aria-label={`Tarjeta terminada en ${card.last4}`}>
        **** **** **** {card.last4}
      </p>

      <div className="mt-auto flex items-end justify-between">
        <p>{card.holderName}</p>
        <div className="text-center">
          <p className="text-[10px]">Exp. Date</p>
          <p className="text-sm">{formatExpiration(card.expMonth, card.expYear)}</p>
        </div>
      </div>
    </article>
  );
}
