import { Link } from 'react-router-dom'
import { ChevronRight, Clock, History, ListChecks, PenLine } from 'lucide-react'
import { useCourseCtx } from '@/components/shelf/CourseShell'
import { Ring } from '@/components/shelf/Art'

export default function Exams() {
  const { course: c, t, p } = useCourseCtx()
  const date = (ms: number) => new Date(ms).toLocaleDateString(c.lang === 'tr' ? 'tr-TR' : 'en-GB', { day: 'numeric', month: 'short' })
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="display text-4xl font-extrabold">{t.exams}</h1>
      <div className="mt-6 space-y-3.5">
        {c.exams.map(e => {
          const st = p.exams[e.id]
          const attempts = st?.attempts ?? []
          const best = attempts.length ? Math.max(...attempts.map(a => Math.round((100 * a.score) / Math.max(1, a.max)))) : null
          return (
            <div key={e.id} className="tile overflow-hidden">
              <Link to={e.id} className="flex items-center gap-4 p-4 sm:p-5">
                <Ring value={best ?? 0} size={58} stroke={6} className={best === null ? 'text-muted-foreground' : 'text-course'}>
                  {best === null
                    ? (e.kind === 'written' ? <PenLine className="size-5 text-muted-foreground" /> : <ListChecks className="size-5 text-muted-foreground" />)
                    : <span className="text-sm font-extrabold tabular-nums text-foreground">{best}</span>}
                </Ring>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-lg font-bold leading-tight">{e.title}</h2>
                    {st?.run && <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-800">{t.inProgress}</span>}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{e.blurb}</p>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 text-xs font-semibold text-muted-foreground">
                    <span>{e.kind === 'written' ? t.problems(e.items.length) : t.questions(e.items.length)}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{t.minutes(e.minutes)}</span>
                  </div>
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
              </Link>
              {attempts.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto border-t-2 border-border bg-secondary/50 px-4 py-2.5 text-xs [scrollbar-width:none]">
                  <History className="size-3.5 shrink-0 text-muted-foreground" />
                  {attempts.slice(-5).reverse().map(a => (
                    <span key={a.at} className="shrink-0 rounded-lg bg-card px-2 py-0.5 font-semibold tabular-nums">{date(a.at)} · {Math.round((100 * a.score) / Math.max(1, a.max))}%</span>
                  ))}
                  <Link to={`${e.id}?review=1`} className="ml-auto shrink-0 pl-2 font-bold text-course">{t.review}</Link>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
