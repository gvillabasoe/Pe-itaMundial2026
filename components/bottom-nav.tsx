"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Trophy, TrendingUp, Shield } from "lucide-react";

/**
 * Bottom navigation. Resultados is the unified screen (Resultados + Mundial).
 * /mundial-2026 redirects to /resultados.
 */
const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/clasificacion", label: "Ranking", icon: BarChart3 },
  { href: "/resultados", label: "Resultados", icon: Trophy },
  { href: "/probabilidades", label: "En vivo", icon: TrendingUp },
  { href: "/mi-club", label: "Mi Club", icon: Shield },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="nav-bottom" aria-label="Navegación principal">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href) ||
              (item.href === "/resultados" && pathname.startsWith("/mundial-2026"));

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[10px] transition-all no-underline ${
              isActive ? "text-gold" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <item.icon size={20} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
