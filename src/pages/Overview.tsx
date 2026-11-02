import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, ClipboardCheck, Download, ExternalLink, Layers, RotateCcw, Target } from 'lucide-react'
import { useCourseCtx } from '@/components/shelf/CourseShell'
import { Bar, Stat } from '@/components/shelf/Stat'
import { Confirm } from '@/components/shelf/Confirm'
import { Html } from '@/components/shelf/Html'
import { Button } from '@/components/ui/button'
import { asset } from '@/lib/data'
import { resetProgress } from '@/lib/store'
import { courseStats } from '@/lib/stats'

export default function Overview() {
  const { course: c, t, p } = useCourseCtx()
  const s = courseStats(c, p)
  const nextCh = c.chapters.find(ch => !p.read[ch.n]) ?? c.chapters[0]
  const missed = c.quiz.filter(q => p.quiz[q.id] && !p.quiz[q.id].ok).length
  const actions = [
    { to: `learn/${nextCh?.n}`, icon: BookOpen, title: s.read ? t.continueReading : t.startReading, sub: nextCh ? `${t.chapter} ${nextCh.n}: ${nextCh.title}` : '' },
    { to: 'practice', icon: Target, title: t.practice, sub: missed ? t.missedCount(missed) : t.questions(c.quiz.length) },
    { to: 'exams', icon: ClipboardCheck, title: t.exams, sub: t.examCount(c.exams.length) },
    { to: 'cards', icon: Layers, title: t.cards, sub: `${s.known} / ${c.cards.length}` },
  ]
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-course-soft p-6 sm:p-8">
        <div className="text-xs font-bold uppercase tracking-[.16em] text-course">{c.code}</div>
        <h1 className="mt-2 font-heading text-3xl font-bold leading-tight sm:text-4xl">{c.title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{c.blurb}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {c.pdf && (
            <Button asChild size="lg" className="bg-course hover:bg-course/90">
              <a href={asset(c.pdf)} target="_blank" rel="noreferrer"><Download className="size-4" />{t.openPdf}</a>
            </Button>
          )}
          {c.pdfPages ? <span className="text-sm text-muted-foreground">{t.pdfPages(c.pdfPages)}</span> : null}
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Bar value={s.overall} className="h-2.5 flex-1 bg-white/70" />
          <span className="text-sm font-semibold tabular-nums">{s.overall}%</span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label={t.chaptersRead} value={`${s.read}/${c.chapters.length}`} />
        <Stat label={t.answered} value={`${s.answered}/${c.quiz.length}`} />
        <Stat label={t.accuracy} value={s.accuracy === null ? '–' : `${s.accuracy}%`} />
        <Stat label={t.bestExam} value={s.best === null ? '–' : `${s.best}%`} />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {actions.map(({ to, icon: Icon, title, sub }) => (
          <Link key={to} to={to} className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition hover:border-course/40 hover:shadow-sm">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-course-soft text-course"><Icon className="size-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{title}</div>
              <div className="truncate text-sm text-muted-foreground">{sub}</div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-course" />
          </Link>
        ))}
      </section>

      {c.extras?.length ? (
        <section>
          <h2 className="mb-3 text-xl font-bold">{t.extras}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {c.extras.map(x => (
              <a key={x.href} href={asset(x.href)} target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-2xl border bg-card p-4 hover:border-course/40">
                <ExternalLink className="mt-0.5 size-4 shrink-0 text-course" />
                <div><div className="font-semibold">{x.label}</div><div className="text-sm text-muted-foreground">{x.blurb}</div></div>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {c.notes ? (
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-2 text-lg font-bold">{t.notes}</h2>
          <Html html={c.notes} className="lesson text-[15px]" />
        </section>
      ) : null}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-sm text-muted-foreground">
        <span>{t.saved}</span>
        <Confirm destructive trigger={<Button variant="ghost" size="sm"><RotateCcw className="size-4" />{t.resetAll}</Button>}
          title={t.resetAllQ} body={t.resetAllBody} ok={t.reset} cancel={t.cancel} onOk={() => resetProgress(c.id)} />
      </footer>
    </div>
  )
}
