import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, List } from 'lucide-react'
import { useCourseCtx } from '@/components/shelf/CourseShell'
import { Html } from '@/components/shelf/Html'
import { Button } from '@/components/ui/button'

export default function Reader() {
  const { course: c, t, p, update } = useCourseCtx()
  const { n } = useParams()
  const nav = useNavigate()
  const i = c.chapters.findIndex(ch => String(ch.n) === n)
  const ch = c.chapters[i]
  if (!ch) return <p className="py-16 text-center text-muted-foreground"><Link to=".." relative="path" className="underline">{t.backToLessons}</Link></p>
  const prev = c.chapters[i - 1], next = c.chapters[i + 1]
  const done = !!p.read[ch.n]
  const finish = () => {
    update(d => { d.read[ch.n] = Date.now() })
    if (next) nav(`../${next.n}`, { relative: 'path' })
  }
  return (
    <article className="mx-auto max-w-3xl">
      <Link to=".." relative="path" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><List className="size-4" />{t.backToLessons}</Link>
      <header className="mb-8 rounded-3xl bg-course-soft p-6 sm:p-8">
        <div className="text-xs font-bold uppercase tracking-[.16em] text-course">{t.chapter} {ch.n}</div>
        <h1 className="mt-2 font-heading text-3xl font-bold leading-tight sm:text-4xl">{ch.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{ch.lead}</p>
        {ch.src && <p className="mt-2 text-xs text-muted-foreground">{ch.src}</p>}
      </header>
      <Html html={ch.html} className="lesson" />
      <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
        {prev ? <Button variant="ghost" asChild><Link to={`../${prev.n}`} relative="path"><ArrowLeft className="size-4" />{t.prevChapter}</Link></Button> : <span />}
        <Button size="lg" onClick={finish} className="bg-course hover:bg-course/90">
          {done && !next ? <><Check className="size-4" />{t.finishedAll}</> : next ? <>{done ? t.nextChapter : t.markRead} <ArrowRight className="size-4" /></> : <><Check className="size-4" />{t.markRead}</>}
        </Button>
      </div>
    </article>
  )
}
