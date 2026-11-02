import { Link } from 'react-router-dom'
import { Check, Star } from 'lucide-react'
import { useCourseCtx } from '@/components/shelf/CourseShell'
import { Bar } from '@/components/shelf/Stat'
import { cn } from '@/lib/utils'

const words = (html: string) => html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length

export default function Lessons() {
  const { course: c, t, p } = useCourseCtx()
  const read = c.chapters.filter(ch => p.read[ch.n]).length
  const next = c.chapters.find(ch => !p.read[ch.n])
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-2 flex items-end justify-between gap-4">
        <h1 className="display text-4xl font-bold">{t.lessons}</h1>
        <span className="pb-1 text-sm font-semibold tabular-nums text-muted-foreground">{read}/{c.chapters.length}</span>
      </div>
      <Bar value={(100 * read) / Math.max(1, c.chapters.length)} className="mb-8" />
      <ol className="relative">
        {c.chapters.map((ch, i) => {
          const done = !!p.read[ch.n], isNext = next?.n === ch.n
          const mins = Math.max(2, Math.round(words(ch.html) / 200))
          return (
            <li key={ch.n} className="relative pb-4 pl-[4.25rem]">
              {i < c.chapters.length - 1 && <span className={cn('absolute left-[1.6rem] top-14 bottom-0 w-1 rounded-full', done ? 'bg-course' : 'bg-border')} />}
              <span className={cn('absolute left-0 top-1 grid size-[3.25rem] place-items-center rounded-full font-heading text-xl font-bold',
                done ? 'press bg-course text-white' : isNext ? 'press bg-card text-course ring-4 ring-course/25 [--edge:var(--course-edge)]' : 'border-2 border-border bg-card text-muted-foreground [box-shadow:0_3px_0_0_var(--border)]')}>
                {done ? <Check className="size-6" strokeWidth={3} /> : ch.n}
              </span>
              <Link to={`${ch.n}`} className={cn('tile block p-4', isNext && 'border-course/40')}>
                {isNext && <span className="eyebrow-label mb-1 inline-flex items-center gap-1 text-course"><Star className="size-3.5 fill-current" />{read ? t.continueReading : t.startReading}</span>}
                <span className="block font-heading text-[17px] font-bold leading-snug">{ch.title}</span>
                <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">{ch.lead}</span>
                <span className="mt-2 block text-xs font-semibold text-muted-foreground">{t.minRead(mins)}</span>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
