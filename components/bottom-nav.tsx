"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Trophy, Globe, TrendingUp, Shield } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/clasificacion", label: "Ranking", icon: BarChart3 },
  { href: "/resultados", label: "Resultados", icon: Trophy },
  { href: "/mundial-2026", label: "Mundial", icon: Globe },
  { href: "/probabilidades", label: "En vivo", icon: TrendingUp },
  { href: "/mi-club", label: "Mi Club", icon: Shield },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="nav-bottom">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[9px] transition-all no-underline ${
              isActive ? "text-gold" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
