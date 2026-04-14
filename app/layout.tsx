import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "Peñita Mundial · IV Edición",
  description: "Porra del Mundial 2026 — Seguimiento, clasificación y predicciones",
  icons: { icon: "/flags/Logo_Porra_Peñita_Mundial_2026.webp" },
};

export const viewport: Viewport = {
  themeColor: "#050608",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-bg-0 text-text-primary">
        <AuthProvider>
          <main className="pb-20">{children}</main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
