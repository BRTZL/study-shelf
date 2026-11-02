import { cn } from '@/lib/utils'

/** Single-row, swipeable on phones; wraps on wider screens. */
export function TopicChips({ topics, selected, onChange, allLabel, counts }: {
  topics: string[]; selected: string[]; onChange: (s: string[]) => void; allLabel: string; counts?: Record<string, string>
}) {
  const chip = (active: boolean) => cn('shrink-0 rounded-xl border-2 px-3 py-1.5 text-sm font-semibold transition',
    active ? 'border-course bg-course-soft text-course-ink' : 'border-border bg-card text-muted-foreground hover:text-foreground')
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      <button type="button" className={chip(selected.length === 0)} onClick={() => onChange([])}>{allLabel}</button>
      {topics.map(tp => {
        const on = selected.includes(tp)
        return (
          <button key={tp} type="button" className={chip(on)} onClick={() => onChange(on ? selected.filter(x => x !== tp) : [...selected, tp])}>
            {tp}{counts?.[tp] && <span className="ml-1.5 text-xs font-medium opacity-70">{counts[tp]}</span>}
          </button>
        )
      })}
    </div>
  )
}
