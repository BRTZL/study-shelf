import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

export function Stat({ label, value, sub, icon: Icon, className }: { label: string; value: string; sub?: string; icon?: ComponentType<{ className?: string }>; className?: string }) {
  return (
    <div className={cn('tile flex items-center gap-3 px-3.5 py-3.5 sm:px-4', className)}>
      {Icon && <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-course-soft text-course sm:size-10"><Icon className="size-[18px]" /></div>}
      <div className="min-w-0">
        <div className="font-heading text-2xl font-bold leading-none tabular-nums">{value}</div>
        <div className="mt-1 text-xs font-medium leading-tight text-muted-foreground">{label}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  )
}

export function Bar({ value, className, tone = 'course' }: { value: number; className?: string; tone?: 'course' | 'good' }) {
  return (
    <div className={cn('h-3 overflow-hidden rounded-full bg-black/[.07]', className)}>
      <div className={cn('relative h-full rounded-full transition-[width] duration-500', tone === 'good' ? 'bg-good' : 'bg-course')}
        style={{ width: `${Math.max(value > 0 ? 4 : 0, Math.min(100, value))}%` }}>
        <div className="absolute inset-x-2 top-[3px] h-[3px] rounded-full bg-white/30" />
      </div>
    </div>
  )
}
