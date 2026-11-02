import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, ClipboardCheck, FileText, Layers, Target } from 'lucide-react'
import { useManifest, asset } from '@/lib/data'
import { useProgress } from '@/lib/store'
import { courseStats } from '@/lib/stats'
import type { CourseMeta } from '@/lib/types'
import { Logo } from '@/components/shelf/Logo'
import { Bar } from '@/components/shelf/Stat'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  const { data, error } = useManifest()
  return (
    <div className="min-h-dvh">
      <div className="relative overflow-hidden bg-[#17324a] text-white">
        <svg className="absolute -right-10 -top-10 h-[130%] opacity-[.13]" viewBox="0 0 200 200" aria-hidden>
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={20 + i * 19} y={40 + ((i * 37) % 50)} width="13" height={150 - ((i * 37) % 50)} rx="3" fill="none" stroke="#7fd1c5" strokeWidth="1.4" />
          ))}
        </svg>
        <div className="relative mx-auto max-w-5xl px-5 pb-14 pt-10 sm:pt-14">
          <div className="flex items-center gap-2.5 text-sm font-semibold tracking-[.14em] text-[#9fdcd2]">
            <Logo className="size-7" /> STUDY SHELF
          </div>
          <h1 className="mt-5 max-w-2xl font-heading text-4xl font-bold leading-[1.08] sm:text-5xl">Everything you need for the exam, on one shelf.</h1>
          <p className="mt-4 max-w-xl text-base text-[#d7ecea] sm:text-lg">
            Read the lessons, print the guide, practise with instant feedback, and take mock exams. Your progress is saved on this device.
          </p>
        </div>
      </div>

      <main className="mx-auto -mt-8 max-w-5xl px-4 pb-20">
        {error && <p className="rounded-xl border bg-card p-6 text-muted-foreground">Could not load the course list ({error}).</p>}
        {!data && !error && <div className="h-48 animate-pulse rounded-2xl border bg-card" />}
        <div className="grid gap-5 md:grid-cols-2">
          {data?.courses.map(c => <CourseCard key={c.id} c={c} />)}
        </div>
        <p className="mt-10 text-center text-xs text-muted-foreground">
          Study guides made from the course slides. Progress is stored only in this browser — nothing is uploaded.
        </p>
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
    { icon: ClipboardCheck, n: c.counts.exams, l: tr ? 'deneme' : 'mock exams' },
    { icon: Layers, n: c.counts.cards, l: tr ? 'kart' : 'cards' },
  ]
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      style={{ ['--course' as string]: c.color, ['--course-soft' as string]: c.soft }}>
      <div className="h-1.5 bg-course" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-course-soft font-semibold text-course">{c.code}</Badge>
          <span className="text-xs text-muted-foreground">{tr ? 'Türkçe' : 'English'}</span>
        </div>
        <h2 className="mt-3 font-heading text-2xl font-bold leading-tight">
          <Link to={`/c/${c.id}`} className="after:absolute after:inset-0">{c.title}</Link>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{c.blurb}</p>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {items.map(({ icon: Icon, n, l }) => (
            <div key={l} className="rounded-lg bg-secondary/70 px-1 py-2">
              <Icon className="mx-auto size-4 text-course" />
              <div className="mt-0.5 text-sm font-bold tabular-nums">{n}</div>
              <div className="text-[11px] leading-tight text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Bar value={s.overall} className="flex-1" />
          <span className="w-10 text-right text-xs font-semibold tabular-nums text-muted-foreground">{s.overall}%</span>
        </div>
        <div className="relative z-10 mt-4 flex items-center justify-between gap-2">
          {c.pdf ? (
            <a href={asset(c.pdf)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
              <FileText className="size-4" /> PDF
            </a>
          ) : <span />}
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-course">
            {tr ? 'Derse git' : 'Open course'} <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </div>
  )
}
