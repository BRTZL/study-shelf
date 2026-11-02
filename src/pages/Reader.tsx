import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, List } from 'lucide-react'
import { useCourseCtx } from '@/components/shelf/CourseShell'
import { Html } from '@/components/shelf/Html'
import { Button } from '@/components/ui/button'

function useScrollProgress() {
  const [v, set] = useState(0)
  useEffect(() => {
    const on = () => {
      const h = document.documentElement
      set(Math.min(1, h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)))
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return v
}

export default function Reader() {
  const { course: c, t, p, update } = useCourseCtx()
  const { n } = useParams()
  const nav = useNavigate()
  const progress = useScrollProgress()
  const i = c.chapters.findIndex(ch => String(ch.n) === n)
  const ch = c.chapters[i]
  if (!ch) return <p className="py-16 text-center text-muted-foreground"><Link to=".." relative="path" className="underline">{t.backToLessons}</Link></p>
  const prev = c.chapters[i - 1], next = c.chapters[i + 1]
  const done = !!p.read[ch.n]
  const finish = () => {
    update(d => { d.read[ch.n] = Date.now() })
    nav(next ? `../${next.n}` : '..', { relative: 'path' })
  }
  return (
    <article className="mx-auto max-w-[44rem]">
      <div className="fixed inset-x-0 top-14 z-20 h-1 bg-transparent"><div className="h-full bg-course transition-[width] duration-150" style={{ width: `${progress * 100}%` }} /></div>
      <Link to=".." relative="path" className="mb-4 inline-flex items-center gap-1.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground"><List className="size-4" />{t.backToLessons}</Link>
      <header className="mb-8">
        <div className="eyebrow-label text-course">{t.chapter} {ch.n} / {c.chapters.length}</div>
        <h1 className="display mt-2 text-[2.1rem] font-extrabold sm:text-5xl">{ch.title}</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{ch.lead}</p>
        {ch.src && <p className="mt-3 inline-block rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">{ch.src}</p>}
      </header>
      <Html html={ch.html} className="lesson" />
      <div className="tile mt-14 flex flex-col items-center gap-4 p-6 text-center">
        <div className="font-heading text-lg font-bold">{next ? next.title : t.finishedAll}</div>
        <Button variant="course" size="xl" onClick={finish} className="w-full max-w-xs">
          {done ? (next ? <>{t.nextChapter}<ArrowRight className="size-5" /></> : <><Check className="size-5" />{t.backToLessons}</>) : <><Check className="size-5" />{t.markRead}</>}
        </Button>
        {prev && <Link to={`../${prev.n}`} relative="path" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />{t.prevChapter}</Link>}
      </div>
    </article>
  )
}
