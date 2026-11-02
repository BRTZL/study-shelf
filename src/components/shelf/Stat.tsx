import { cn } from '@/lib/utils'

export function Stat({ label, value, sub, className }: { label: string; value: string; sub?: string; className?: string }) {
  return (
    <div className={cn('rounded-xl border bg-card px-4 py-3', className)}>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-heading text-2xl font-bold tabular-nums">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  )
}

export function Bar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-secondary', className)}>
      <div className="h-full rounded-full bg-course transition-[width] duration-500" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}
