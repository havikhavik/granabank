import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// next/font descarga la fuente en el build y la sirve desde el mismo dominio.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "GranaBank",
  description: "Con cada compra, sumás orgullo granate",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${poppins.variable} antialiased`}>
      <body className="font-sans">
        {/* El diseño es mobile: en pantallas grandes se centra en una columna. */}
        <div className="mx-auto min-h-dvh max-w-[414px]">{children}</div>
      </body>
    </html>
  );
}
