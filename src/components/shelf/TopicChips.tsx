import { cn } from '@/lib/utils'

export function TopicChips({ topics, selected, onChange, allLabel, counts }: {
  topics: string[]; selected: string[]; onChange: (s: string[]) => void; allLabel: string; counts?: Record<string, string>
}) {
  const chip = (active: boolean) => cn('shrink-0 rounded-full border px-3 py-1 text-sm transition',
    active ? 'border-course bg-course text-white' : 'bg-card text-muted-foreground hover:border-course/40 hover:text-foreground')
  return (
    <div className="flex flex-wrap gap-1.5">
      <button type="button" className={chip(selected.length === 0)} onClick={() => onChange([])}>{allLabel}</button>
      {topics.map(tp => {
        const on = selected.includes(tp)
        return (
          <button key={tp} type="button" className={chip(on)} onClick={() => onChange(on ? selected.filter(x => x !== tp) : [...selected, tp])}>
            {tp}{counts?.[tp] && <span className={cn('ml-1.5 text-xs', on ? 'text-white/80' : 'text-muted-foreground/70')}>{counts[tp]}</span>}
          </button>
        )
      })}
    </div>
  )
}
