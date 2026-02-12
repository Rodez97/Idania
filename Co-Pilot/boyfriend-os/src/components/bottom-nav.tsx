"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarHeart,
  Calendar,
  BookOpen,
  MessageCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  {
    label: "Hoy",
    href: "/today",
    icon: CalendarHeart,
  },
  {
    label: "Eventos",
    href: "/events",
    icon: Calendar,
  },
  {
    label: "Diario",
    href: "/journal",
    icon: BookOpen,
  },
  {
    label: "Asistente",
    href: "/assistant",
    icon: MessageCircle,
  },
  {
    label: "Perfil",
    href: "/profile",
    icon: User,
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t safe-bottom"
      role="navigation"
      aria-label="Navegacion principal"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "touch-target flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-all duration-200",
                  isActive && "scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
