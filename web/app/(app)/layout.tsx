import BottomNav from "@/components/BottomNav";

// Layout de las páginas privadas. El grupo (app) no aparece en la URL:
// solo sirve para compartir este layout sin afectar a /login.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* pb deja lugar para que la barra fija no tape el final del contenido */}
      <div className="pb-28">{children}</div>
      <BottomNav />
    </>
  );
}
