import { Link } from 'react-router-dom'
import { ClipboardCheck, Clock, History, PenLine, Play } from 'lucide-react'
import { useCourseCtx } from '@/components/shelf/CourseShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function Exams() {
  const { course: c, t, p } = useCourseCtx()
  const date = (ms: number) => new Date(ms).toLocaleDateString(c.lang === 'tr' ? 'tr-TR' : 'en-GB', { day: 'numeric', month: 'short' })
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-5 text-3xl font-bold">{t.exams}</h1>
      <div className="space-y-3">
        {c.exams.map(e => {
          const st = p.exams[e.id]
          const attempts = st?.attempts ?? []
          const best = attempts.length ? Math.max(...attempts.map(a => Math.round((100 * a.score) / Math.max(1, a.max)))) : null
          return (
            <div key={e.id} className="rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-xl font-bold">{e.title}</h2>
                    {st?.run && <Badge className="bg-amber-100 text-amber-900">{t.inProgress}</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{e.blurb}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">{e.kind === 'written' ? <PenLine className="size-4" /> : <ClipboardCheck className="size-4" />}
                      {e.kind === 'written' ? t.problems(e.items.length) : t.questions(e.items.length)}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="size-4" />{t.minutes(e.minutes)}</span>
                    {best !== null && <span className="font-semibold text-course">{t.bestExam}: {best}%</span>}
                  </div>
                </div>
                <Button asChild className="bg-course hover:bg-course/90">
                  <Link to={e.id}><Play className="size-4" />{st?.run ? t.resume : attempts.length ? t.retake : t.start}</Link>
                </Button>
              </div>
              {attempts.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
                  <History className="size-3.5" />{t.attempts}:
                  {attempts.slice(-6).map(a => (
                    <span key={a.at} className="rounded-full bg-secondary px-2 py-0.5 tabular-nums">{date(a.at)} · {Math.round((100 * a.score) / Math.max(1, a.max))}%</span>
                  ))}
                  <Link to={`${e.id}?review=1`} className="ml-auto font-medium text-course hover:underline">{t.review}</Link>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
