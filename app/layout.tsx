import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Peñita Mundial · IV Edición",
  description:
    "Porra del Mundial 2026 — Seguimiento, clasificación y predicciones",
  icons: { icon: "/logo-porra.webp" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050608" },
    { media: "(prefers-color-scheme: light)", color: "#F5F7FA" },
  ],
  width: "device-width",
  initialScale: 1,
};

const themeInitScript = `
(function(){try{var t=localStorage.getItem('penita-theme');if(t==='light'){document.documentElement.classList.add('light');}}catch(e){}})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-bg-0 text-text-primary">
        <ThemeProvider>
          <AuthProvider>
            <ThemeToggle />
            <main className="pb-20">{children}</main>
            <BottomNav />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
