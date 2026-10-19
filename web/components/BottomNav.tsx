"use client";

import { House, LogOut, NotepadText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions";

const links = [
  { href: "/", label: "Home", Icon: House },
  { href: "/movimientos", label: "Movimientos", Icon: NotepadText },
];

// Client Component porque usePathname (para resaltar la sección activa) solo
// existe en el navegador.
export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto flex h-[86px] max-w-[414px] items-center justify-around rounded-t-3xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      {links.map(({ href, label, Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`p-2 ${active ? "text-granate" : "text-[#071529]"}`}
          >
            <Icon size={30} strokeWidth={1.75} />
          </Link>
        );
      })}

      {/* Un form que llama a la Server Action: funciona incluso sin JavaScript. */}
      <form action={logout}>
        <button type="submit" aria-label="Cerrar sesión" className="p-2 text-[#071529]">
          <LogOut size={30} strokeWidth={1.75} />
        </button>
      </form>
    </nav>
  );
}
