import { ChevronLeft } from "lucide-react";
import Link from "next/link";

// Encabezado del detalle con el link para volver a la lista.
export default function BackLink() {
  return (
    <Link href="/movimientos" className="inline-flex items-center gap-1 text-ink">
      <ChevronLeft size={22} aria-hidden />
      <span className="text-xl">Detalle</span>
    </Link>
  );
}
