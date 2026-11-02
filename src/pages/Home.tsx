import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, ClipboardCheck, FileText, Layers, Target } from 'lucide-react'
import { useManifest, asset } from '@/lib/data'
import { readProgress, useProgress } from '@/lib/store'
import { courseStats } from '@/lib/stats'
import type { CourseMeta } from '@/lib/types'
import { Logo } from '@/components/shelf/Logo'
import { CourseArt, Ring } from '@/components/shelf/Art'
import { Bar } from '@/components/shelf/Stat'

const cssVars = (c: CourseMeta) => ({ ['--course' as string]: c.color, ['--course-soft' as string]: c.soft })

function lastActive(c: CourseMeta) {
  const p = readProgress(c.id)
  const times = [...Object.values(p.quiz).map(v => v.at), ...Object.values(p.cards).map(v => v.at), ...Object.values(p.read),
    ...Object.values(p.exams).flatMap(e => [e.run?.startedAt ?? 0, ...e.attempts.map(a => a.at)])]
  return times.length ? Math.max(...times) : 0
}

export default function Home() {
  const { data, error } = useManifest()
  const recent = data?.courses.map(c => [c, lastActive(c)] as const).filter(([, at]) => at > 0).sort((a, b) => b[1] - a[1])[0]?.[0]
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center gap-2.5 px-4 pt-5">
        <Logo className="size-9" />
        <span className="font-heading text-xl font-bold tracking-tight">Study Shelf</span>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16">
        <section className="pb-6 pt-8 sm:pt-12">
          <h1 className="display max-w-3xl text-[2.6rem] font-bold sm:text-6xl">
            Learn it. Practise it. <span className="text-[#e07a3f]">Pass it.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
            Lessons in plain language, printable guides, practice questions with instant feedback, and timed mock exams. Your progress stays on this device.
          </p>
        </section>

        {recent && (
          <Link to={`/c/${recent.id}`} style={cssVars(recent)} className="tile mb-8 flex items-center gap-4 p-4 sm:p-5">
            <CourseArt id={recent.id} code={recent.code} className="size-14 shrink-0 rounded-2xl [&>span]:bottom-0 [&>span]:left-1.5 [&>span]:text-[2rem]" />
            <div className="min-w-0 flex-1">
              <div className="eyebrow-label text-muted-foreground">{recent.lang === 'tr' ? 'Kaldığın yerden devam et' : 'Continue where you left off'}</div>
              <div className="truncate font-heading text-lg font-bold">{recent.title}</div>
            </div>
            <span className="press grid size-11 shrink-0 place-items-center rounded-2xl bg-course text-white"><ArrowRight className="size-5" /></span>
          </Link>
        )}

        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-heading text-2xl font-bold">Courses</h2>
          {data && <span className="text-sm text-muted-foreground">{data.courses.length}</span>}
        </div>
        {error && <p className="tile p-6 text-muted-foreground">Could not load the course list ({error}).</p>}
        {!data && !error && <div className="grid gap-5 md:grid-cols-2"><div className="h-80 animate-pulse rounded-3xl bg-secondary" /><div className="h-80 animate-pulse rounded-3xl bg-secondary" /></div>}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data?.courses.map(c => <CourseCard key={c.id} c={c} />)}
        </div>
        <p className="mt-12 text-center text-xs text-muted-foreground">Made from the course slides. Progress is stored only in this browser. Nothing is uploaded.</p>
      </main>
    </div>
  )
}

function CourseCard({ c }: { c: CourseMeta }) {
  const [p] = useProgress(c.id)
  const s = courseStats(c, p)
  const tr = c.lang === 'tr'
  const items = [
    { icon: BookOpen, n: c.counts.chapters, l: tr ? 'bölüm' : 'lessons' },
    { icon: Target, n: c.counts.questions, l: tr ? 'soru' : 'questions' },
    { icon: ClipboardCheck, n: c.counts.exams, l: tr ? 'deneme' : 'exams' },
    { icon: Layers, n: c.counts.cards, l: tr ? 'kart' : 'cards' },
  ]
  return (
    <div style={cssVars(c)} className="tile group relative flex flex-col overflow-hidden transition-transform active:translate-y-0.5">
      <CourseArt id={c.id} code={c.code} className="h-32" />
      <span className="absolute right-3 top-3 rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-bold tracking-wider text-white backdrop-blur-sm">{c.code}</span>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-[1.4rem] font-bold leading-tight">
          <Link to={`/c/${c.id}`} className="outline-none after:absolute after:inset-0 after:rounded-[1.1rem] focus-visible:after:ring-4 focus-visible:after:ring-course/30">{c.title}</Link>
        </h3>
        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{c.blurb}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] font-medium text-muted-foreground">
          {items.map(({ icon: Icon, n, l }) => <span key={l} className="inline-flex items-center gap-1.5"><Icon className="size-4 text-course" /><b className="text-foreground">{n}</b> {l}</span>)}
        </div>
        <div className="mt-auto flex items-center gap-3 pt-5">
          <Ring value={s.overall} size={44} stroke={5} className="text-course"><span className="text-[11px] font-bold tabular-nums">{s.overall}%</span></Ring>
          <div className="min-w-0 flex-1">
            <Bar value={s.overall} className="h-2.5" />
            <div className="mt-1 text-xs text-muted-foreground">{s.overall ? (tr ? 'İlerlemen' : 'Your progress') : (tr ? 'Henüz başlamadın' : 'Not started yet')}</div>
          </div>
          {c.pdf && (
            <a href={asset(c.pdf)} target="_blank" rel="noreferrer" aria-label="PDF"
              className="relative z-10 grid size-10 place-items-center rounded-xl border-2 border-border bg-card text-muted-foreground hover:text-foreground">
              <FileText className="size-[18px]" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
