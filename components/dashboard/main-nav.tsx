import Link from "next/link"

import { cn } from "@/lib/utils"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/dashboard"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        ホーム
      </Link>
      <Link
        href="/meal-analysis"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        食事分析
      </Link>
      <Link
        href="/meal-history"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        食事履歴
      </Link>
    </nav>
  )
}

