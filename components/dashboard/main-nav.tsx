"use client";

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard"
            ? "text-primary font-bold"
            : "text-muted-foreground"
        )}
      >
        ホーム
      </Link>
      <Link
        href="/meal-management"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/meal-management"
            ? "text-primary font-bold"
            : "text-muted-foreground"
        )}
      >
        食事管理
      </Link>
      <Link
        href="/meal-analysis"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/meal-analysis"
            ? "text-primary font-bold"
            : "text-muted-foreground"
        )}
      >
        食事分析
      </Link>
      <Link
        href="/meal-history"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/meal-history"
            ? "text-primary font-bold"
            : "text-muted-foreground"
        )}
      >
        カレンダー
      </Link>
    </nav>
  )
}

