"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconFuel, IconHistory, IconScan } from "@/components/icons";

const ITEMS = [
  { href: "/saldo", label: "Saldo", Icon: IconFuel },
  { href: "/historial", label: "Historial", Icon: IconHistory },
  { href: "/escanear", label: "Escanear", Icon: IconScan },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 flex border-t border-neutral-100 bg-white/95 backdrop-blur">
      {ITEMS.map(({ href, label, Icon }) => {
        const activo = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium ${
              activo ? "text-brand-green-600" : "text-neutral-400"
            }`}
          >
            <Icon color={activo ? "#78BE20" : "#A3A3A3"} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
