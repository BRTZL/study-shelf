import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, Download, ExternalLink, FileText, Layers, RotateCcw, Target, Trophy } from 'lucide-react'
import { useCourseCtx } from '@/components/shelf/CourseShell'
import { Bar, Stat } from '@/components/shelf/Stat'
import { CourseArt } from '@/components/shelf/Art'
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
  const topics = c.topics.map(tp => {
    const qs = c.quiz.filter(q => q.topic === tp)
    const done = qs.filter(q => p.quiz[q.id])
    return { tp, total: qs.length, done: done.length, right: done.filter(q => p.quiz[q.id].ok).length }
  }).filter(x => x.total > 0)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="relative overflow-hidden rounded-[1.75rem] text-white" style={{ boxShadow: '0 5px 0 0 var(--course-edge)' }}>
        <CourseArt id={c.id} code={c.code} className="absolute inset-0 [&>span]:-right-2 [&>span]:left-auto [&>span]:bottom-[-1.2rem] [&>span]:text-[9rem] [&>span]:text-white/15" />
        <div className="relative p-6 sm:p-8">
          <div className="eyebrow-label text-white/75">{s.read ? t.continueReading : t.startReading}</div>
          <div className="mt-2 font-heading text-[1.75rem] font-extrabold leading-tight sm:text-4xl">{nextCh ? nextCh.title : c.title}</div>
          {nextCh && <div className="mt-1 text-sm font-medium text-white/80">{t.chapter} {nextCh.n} / {c.chapters.length}</div>}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button asChild variant="tactile" size="xl" className="border-transparent text-course-ink [--edge:rgba(0,0,0,.18)]">
              <Link to={`learn/${nextCh?.n}`}><BookOpen className="size-5" />{t.continueBtn}</Link>
            </Button>
            {c.pdf && (
              <a href={asset(c.pdf)} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white/15 px-4 text-[15px] font-semibold backdrop-blur hover:bg-white/25">
                <Download className="size-5" />PDF{c.pdfPages ? <span className="text-white/70">· {c.pdfPages}</span> : null}
              </a>
            )}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/20"><div className="h-full rounded-full bg-white" style={{ width: `${Math.max(s.overall ? 3 : 0, s.overall)}%` }} /></div>
            <span className="text-sm font-bold tabular-nums">{s.overall}%</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={BookOpen} label={t.chaptersRead} value={`${s.read}/${c.chapters.length}`} />
        <Stat icon={Target} label={t.answered} value={`${s.answered}/${c.quiz.length}`} />
        <Stat icon={CheckCircle2} label={t.accuracy} value={s.accuracy === null ? '–' : `${s.accuracy}%`} />
        <Stat icon={Trophy} label={t.bestExam} value={s.best === null ? '–' : `${s.best}%`} />
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { to: 'practice', icon: Target, title: t.practice, sub: missed ? t.missedCount(missed) : t.questions(c.quiz.length) },
          { to: 'exams', icon: ClipboardCheck, title: t.exams, sub: t.examCount(c.exams.length) },
          { to: 'cards', icon: Layers, title: t.cards, sub: `${s.known} / ${c.cards.length}` },
        ].map(({ to, icon: Icon, title, sub }) => (
          <Link key={to} to={to} className="tile group flex items-center gap-3.5 p-4">
            <div className="press grid size-12 shrink-0 place-items-center rounded-2xl bg-course text-white"><Icon className="size-6" /></div>
            <div className="min-w-0 flex-1">
              <div className="font-heading text-[17px] font-bold">{title}</div>
              <div className="truncate text-sm text-muted-foreground">{sub}</div>
            </div>
            <ArrowRight className="size-5 text-muted-foreground transition group-hover:translate-x-0.5" />
          </Link>
        ))}
      </section>

      <section className="tile p-5 sm:p-6">
        <h2 className="font-heading text-xl font-bold">{t.topicMastery}</h2>
        <div className="mt-4 space-y-3.5">
          {topics.map(x => {
            const acc = x.done ? Math.round((100 * x.right) / x.done) : null
            return (
              <Link key={x.tp} to={`practice?topic=${encodeURIComponent(x.tp)}`} className="group block">
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-semibold group-hover:text-course">{x.tp}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">{x.done}/{x.total}{acc !== null && <> · <b className={acc >= 70 ? 'text-good' : acc >= 40 ? 'text-amber-600' : 'text-bad'}>{acc}%</b></>}</span>
                </div>
                <Bar value={(100 * x.done) / x.total} className="h-2.5" />
              </Link>
            )
          })}
        </div>
      </section>

      {c.extras?.length ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {c.extras.map(x => (
            <a key={x.href} href={asset(x.href)} target="_blank" rel="noreferrer" className="tile flex items-start gap-3 p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-course-soft text-course"><ExternalLink className="size-5" /></div>
              <div><div className="font-semibold">{x.label}</div><div className="text-sm text-muted-foreground">{x.blurb}</div></div>
            </a>
          ))}
        </section>
      ) : null}

      {c.notes ? (
        <section className="tile p-5">
          <h2 className="mb-2 flex items-center gap-2 font-heading text-lg font-bold"><FileText className="size-5 text-course" />{t.notes}</h2>
          <Html html={c.notes} className="lesson text-[15px]" />
        </section>
      ) : null}

      <footer className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-muted-foreground">
        <span>{t.saved}</span>
        <Confirm destructive trigger={<Button variant="ghost" size="sm"><RotateCcw className="size-4" />{t.resetAll}</Button>}
          title={t.resetAllQ} body={t.resetAllBody} ok={t.reset} cancel={t.cancel} onOk={() => resetProgress(c.id)} />
      </footer>
    </div>
  )
}
