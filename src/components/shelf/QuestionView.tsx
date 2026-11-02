import { Check, X } from 'lucide-react'
import type { Question } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Html } from './Html'

const L = 'ABCDE'

/** One multiple-choice question with tactile options. `reveal` colours right/wrong and shows the explanation. */
export function QuestionView({ q, picked, onPick, reveal, number, sourceLabel, explain = true }: {
  q: Question; picked?: number; onPick?: (i: number) => void; reveal: boolean; number?: string; sourceLabel?: string; explain?: boolean
}) {
  return (
    <div>
      <div className="flex gap-3">
        {number && <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-course-soft font-heading text-sm font-extrabold text-course">{number}</span>}
        <Html html={q.q} className="lesson min-w-0 flex-1 text-[1.06rem] font-semibold leading-relaxed" />
      </div>
      <div className="mt-5 grid gap-2.5">
        {q.o.map((o, i) => {
          const isPicked = picked === i, isRight = q.a === i
          const state = reveal ? (isRight ? 'right' : isPicked ? 'wrong' : 'idle') : isPicked ? 'picked' : 'idle'
          return (
            <button key={i} type="button" disabled={!onPick} onClick={() => onPick?.(i)} aria-pressed={isPicked}
              className={cn('flex w-full items-center gap-3 rounded-2xl border-2 bg-card px-3.5 py-3 text-left transition-[transform,box-shadow,background-color,border-color] duration-100',
                onPick && 'active:translate-y-[2px] active:shadow-none',
                state === 'idle' && 'border-border shadow-[0_3px_0_0_var(--border)]',
                state === 'idle' && onPick && 'hover:bg-secondary/60',
                state === 'picked' && 'border-course bg-course-soft shadow-[0_3px_0_0_var(--course)]',
                state === 'right' && 'border-good bg-good-soft shadow-[0_3px_0_0_var(--good)]',
                state === 'wrong' && 'border-bad bg-bad-soft shadow-[0_3px_0_0_var(--bad)]',
                reveal && state === 'idle' && 'opacity-60')}>
              <span className={cn('grid size-8 shrink-0 place-items-center rounded-xl border-2 text-sm font-extrabold',
                state === 'right' ? 'border-good bg-good text-white' : state === 'wrong' ? 'border-bad bg-bad text-white'
                  : state === 'picked' ? 'border-course bg-course text-white' : 'border-border text-muted-foreground')}>
                {state === 'right' ? <Check className="size-4" strokeWidth={3} /> : state === 'wrong' ? <X className="size-4" strokeWidth={3} /> : L[i]}
              </span>
              <Html html={o} className="lesson min-w-0 flex-1 text-[1rem] font-medium leading-snug" />
            </button>
          )
        })}
      </div>
      {reveal && explain && q.why && (
        <div className="mt-4 rounded-2xl bg-secondary px-4 py-3">
          <Html html={q.why} className="lesson text-[0.95rem]" />
          {q.src && <div className="mt-1.5 text-xs font-medium text-muted-foreground">{sourceLabel}: {q.src}</div>}
        </div>
      )}
    </div>
  )
}
