import { Link } from 'react-router-dom'
import { CheckCircle2, Circle } from 'lucide-react'
import { useCourseCtx } from '@/components/shelf/CourseShell'
import { Bar } from '@/components/shelf/Stat'

export default function Lessons() {
  const { course: c, t, p } = useCourseCtx()
  const read = c.chapters.filter(ch => p.read[ch.n]).length
  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <h1 className="text-3xl font-bold">{t.lessons}</h1>
        <div className="w-40 text-right text-sm text-muted-foreground">
          {read}/{c.chapters.length}<Bar value={(100 * read) / Math.max(1, c.chapters.length)} className="mt-1" />
        </div>
      </div>
      <ol className="space-y-2.5">
        {c.chapters.map(ch => {
          const done = !!p.read[ch.n]
          return (
            <li key={ch.n}>
              <Link to={`${ch.n}`} className="group flex items-start gap-4 rounded-2xl border bg-card p-4 transition hover:border-course/40 hover:shadow-sm">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-course-soft font-heading text-lg font-bold text-course">{ch.n}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-snug group-hover:text-course">{ch.title}</span>
                  <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">{ch.lead}</span>
                </span>
                {done ? <CheckCircle2 className="mt-1 size-5 shrink-0 text-good" aria-label={t.readDone} /> : <Circle className="mt-1 size-5 shrink-0 text-muted-foreground/40" />}
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
