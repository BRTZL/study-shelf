import { Check, X } from 'lucide-react'
import type { Question } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Html } from './Html'

const L = 'ABCDE'

/** One multiple-choice question. `reveal` shows right/wrong colouring and the explanation. */
export function QuestionView({ q, picked, onPick, reveal, number, sourceLabel, explain = true }: {
  q: Question; picked?: number; onPick?: (i: number) => void; reveal: boolean; number?: string; sourceLabel?: string; explain?: boolean
}) {
  return (
    <div>
      <div className="flex gap-3">
        {number && <span className="font-heading text-lg font-bold text-course">{number}</span>}
        <Html html={q.q} className="lesson flex-1 text-[1.02rem] font-medium leading-relaxed" />
      </div>
      <div className="mt-4 grid gap-2">
        {q.o.map((o, i) => {
          const isPicked = picked === i, isRight = q.a === i
          const state = reveal ? (isRight ? 'right' : isPicked ? 'wrong' : 'idle') : isPicked ? 'picked' : 'idle'
          return (
            <button key={i} type="button" disabled={!onPick} onClick={() => onPick?.(i)}
              className={cn('flex w-full items-start gap-3 rounded-xl border-2 bg-card px-3.5 py-2.5 text-left transition',
                onPick && 'hover:border-course/50 hover:bg-course-soft/40',
                state === 'picked' && 'border-course bg-course-soft/60',
                state === 'right' && 'border-good bg-good/10',
                state === 'wrong' && 'border-bad bg-bad/10',
                state === 'idle' && 'border-border',
                reveal && state === 'idle' && 'opacity-70')}>
              <span className={cn('mt-0.5 grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold',
                state === 'right' ? 'bg-good text-white' : state === 'wrong' ? 'bg-bad text-white' : state === 'picked' ? 'bg-course text-white' : 'bg-secondary text-muted-foreground')}>
                {state === 'right' ? <Check className="size-3.5" /> : state === 'wrong' ? <X className="size-3.5" /> : L[i]}
              </span>
              <Html html={o} className="lesson min-w-0 flex-1 text-[0.98rem]" />
            </button>
          )
        })}
      </div>
      {reveal && explain && q.why && (
        <div className="mt-4 rounded-xl bg-secondary/80 px-4 py-3 text-[0.95rem]">
          <Html html={q.why} className="lesson text-[0.95rem]" />
          {q.src && <div className="mt-1.5 text-xs text-muted-foreground">{sourceLabel}: {q.src}</div>}
        </div>
      )}
    </div>
  )
}
