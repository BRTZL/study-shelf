import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, PartyPopper, RotateCcw } from 'lucide-react'
import { useCourseCtx } from '@/components/shelf/CourseShell'
import { QuestionView } from '@/components/shelf/QuestionView'
import { TopicChips } from '@/components/shelf/TopicChips'
import { Confirm } from '@/components/shelf/Confirm'
import { Bar } from '@/components/shelf/Stat'
import { Button } from '@/components/ui/button'
import { readProgress, resetProgress } from '@/lib/store'
import { cn } from '@/lib/utils'

type Mode = 'new' | 'missed' | 'all'
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

export default function Practice() {
  const { course: c, t, p, update } = useCourseCtx()
  const [topics, setTopics] = useState<string[]>([])
  const [mode, setMode] = useState<Mode>('new')
  const [round, setRound] = useState(0)
  const [i, setI] = useState(0)

  // Snapshot the queue when filters change, so answering doesn't reshuffle it under you.
  const queue = useMemo(() => {
    const prog = readProgress(c.id)
    const pool = c.quiz.filter(q => !topics.length || topics.includes(q.topic))
    if (mode === 'missed') return shuffle(pool.filter(q => prog.quiz[q.id] && !prog.quiz[q.id].ok))
    if (mode === 'all') return shuffle(pool)
    const rank = (id: string) => (!prog.quiz[id] ? 0 : !prog.quiz[id].ok ? 1 : 2)
    return shuffle(pool).sort((a, b) => rank(a.id) - rank(b.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.id, c.quiz, topics, mode, round])
  useEffect(() => setI(0), [queue])

  const q = queue[i]
  const rec = q ? p.quiz[q.id] : undefined
  const [answeredNow, setAnsweredNow] = useState<string | null>(null)
  const reveal = !!q && answeredNow === q.id
  const pick = (k: number) => {
    if (!q || reveal) return
    update(d => { const old = d.quiz[q.id]; d.quiz[q.id] = { pick: k, ok: k === q.a, tries: (old?.tries ?? 0) + 1, at: Date.now() } })
    setAnsweredNow(q.id)
  }
  const next = () => { setAnsweredNow(null); setI(x => x + 1) }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('input,textarea')) return
      const k = Number(e.key) - 1
      if (q && !reveal && k >= 0 && k < q.o.length) pick(k)
      else if (reveal && (e.key === 'Enter' || e.key === 'ArrowRight')) next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const counts = useMemo(() => Object.fromEntries(c.topics.map(tp => {
    const qs = c.quiz.filter(q => q.topic === tp)
    return [tp, `${qs.filter(q => p.quiz[q.id]).length}/${qs.length}`]
  })), [c, p.quiz])
  const inScope = c.quiz.filter(q => !topics.length || topics.includes(q.topic))
  const done = inScope.filter(q => p.quiz[q.id]).length
  const right = inScope.filter(q => p.quiz[q.id]?.ok).length
  const missed = inScope.filter(q => p.quiz[q.id] && !p.quiz[q.id].ok).length

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold">{t.practice}</h1>
        <div className="text-sm text-muted-foreground tabular-nums">
          {done}/{inScope.length} · {t.accuracy.toLowerCase()} {done ? Math.round((100 * right) / done) : 0}%
        </div>
      </div>
      <Bar value={(100 * done) / Math.max(1, inScope.length)} className="mb-5" />
      <div className="space-y-3">
        <TopicChips topics={c.topics.filter(tp => c.quiz.some(q => q.topic === tp))} selected={topics} onChange={s => { setTopics(s); setAnsweredNow(null) }} allLabel={t.all} counts={counts} />
        <div className="inline-flex rounded-full border bg-card p-1 text-sm">
          {([['new', t.modeNew], ['missed', `${t.modeMissed}${missed ? ` (${missed})` : ''}`], ['all', t.modeAll]] as [Mode, string][]).map(([m, l]) => (
            <button key={m} type="button" onClick={() => { setMode(m); setAnsweredNow(null) }}
              className={cn('rounded-full px-3 py-1 transition', mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>{l}</button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
        {!queue.length ? (
          <p className="py-10 text-center text-muted-foreground">{t.noQuestions}</p>
        ) : !q ? (
          <div className="py-10 text-center">
            <PartyPopper className="mx-auto size-10 text-course" />
            <p className="mt-3 text-lg font-semibold">{t.allDone}</p>
            <Button className="mt-4" onClick={() => { setRound(r => r + 1); setAnsweredNow(null) }}><RotateCcw className="size-4" />{t.restart}</Button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-course-soft px-2.5 py-0.5 font-medium text-course">{q.topic}</span>
              <span className="tabular-nums">{t.question} {i + 1} {t.of} {queue.length}{rec && !reveal ? (rec.ok ? ' · ✓' : ' · ✗') : ''}</span>
            </div>
            <QuestionView key={q.id} q={q} picked={reveal ? rec?.pick : undefined} onPick={reveal ? undefined : pick} reveal={reveal} sourceLabel={t.source} />
            {reveal && (
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className={cn('font-semibold', rec?.ok ? 'text-good' : 'text-bad')}>{rec?.ok ? t.correct : t.wrong}</span>
                <Button onClick={next} size="lg" className="bg-course hover:bg-course/90">{t.next}<ArrowRight className="size-4" /></Button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <Confirm destructive trigger={<Button variant="ghost" size="sm"><RotateCcw className="size-4" />{t.resetPractice}</Button>}
          title={t.resetQ} body={t.resetBody} ok={t.reset} cancel={t.cancel} onOk={() => { resetProgress(c.id, 'quiz'); setRound(r => r + 1) }} />
      </div>
    </div>
  )
}
