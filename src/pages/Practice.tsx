import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CircleCheck, CircleX, Flame, PartyPopper, RotateCcw } from 'lucide-react'
import { useCourseCtx } from '@/components/shelf/CourseShell'
import { QuestionView } from '@/components/shelf/QuestionView'
import { TopicChips } from '@/components/shelf/TopicChips'
import { Confirm } from '@/components/shelf/Confirm'
import { Html } from '@/components/shelf/Html'
import { Bar } from '@/components/shelf/Stat'
import { Button } from '@/components/ui/button'
import { readProgress, resetProgress } from '@/lib/store'
import { cn } from '@/lib/utils'

type Mode = 'new' | 'missed' | 'all'
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

export default function Practice() {
  const { course: c, t, p, update } = useCourseCtx()
  const [params] = useSearchParams()
  const [topics, setTopics] = useState<string[]>(() => params.get('topic') ? [params.get('topic')!] : [])
  const [mode, setMode] = useState<Mode>('new')
  const [round, setRound] = useState(0)
  const [i, setI] = useState(0)
  const [sel, setSel] = useState<number | undefined>()
  const [checked, setChecked] = useState(false)
  const [tally, setTally] = useState({ right: 0, streak: 0 })

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
  useEffect(() => { setI(0); setSel(undefined); setChecked(false); setTally({ right: 0, streak: 0 }) }, [queue])

  const q = queue[i]
  const ok = q && sel === q.a
  const check = () => {
    if (!q || sel === undefined || checked) return
    const good = sel === q.a
    update(d => { const old = d.quiz[q.id]; d.quiz[q.id] = { pick: sel, ok: good, tries: (old?.tries ?? 0) + 1, at: Date.now() } })
    setTally(x => ({ right: x.right + (good ? 1 : 0), streak: good ? x.streak + 1 : 0 }))
    setChecked(true)
  }
  const next = () => { setChecked(false); setSel(undefined); setI(x => x + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!q) return
      const k = Number(e.key) - 1
      if (!checked && k >= 0 && k < q.o.length) setSel(k)
      else if (e.key === 'Enter') { e.preventDefault(); if (checked) next(); else check() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const quizTopics = c.topics.filter(tp => c.quiz.some(q => q.topic === tp))
  const counts = useMemo(() => Object.fromEntries(quizTopics.map(tp => {
    const qs = c.quiz.filter(q => q.topic === tp)
    return [tp, `${qs.filter(q => p.quiz[q.id]).length}/${qs.length}`]
  })), [c, p.quiz, quizTopics])
  const missed = c.quiz.filter(q => (!topics.length || topics.includes(q.topic)) && p.quiz[q.id] && !p.quiz[q.id].ok).length
  const resetFilters = () => { setChecked(false); setSel(undefined) }

  return (
    <div className={cn('mx-auto max-w-2xl', checked ? 'pb-[30rem]' : 'pb-48')}>
      <h1 className="display text-4xl font-extrabold">{t.practice}</h1>
      <div className="mt-4 space-y-3">
        <TopicChips topics={quizTopics} selected={topics} onChange={s => { setTopics(s); resetFilters() }} allLabel={t.all} counts={counts} />
        <div className="inline-flex rounded-2xl border-2 border-border bg-card p-1 text-sm font-semibold">
          {([['new', t.modeNew], ['missed', `${t.modeMissed}${missed ? ` · ${missed}` : ''}`], ['all', t.modeAll]] as [Mode, string][]).map(([m, l]) => (
            <button key={m} type="button" onClick={() => { setMode(m); resetFilters() }}
              className={cn('rounded-xl px-3 py-1.5 transition', mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>{l}</button>
          ))}
        </div>
      </div>

      {!queue.length ? (
        <p className="tile mt-6 p-10 text-center text-muted-foreground">{t.noQuestions}</p>
      ) : !q ? (
        <div className="tile mt-6 p-8 text-center animate-pop">
          <PartyPopper className="mx-auto size-12 text-course" />
          <p className="mt-3 font-heading text-2xl font-bold">{t.sessionDone}</p>
          <p className="mt-1 text-muted-foreground">{t.sessionScore(tally.right, queue.length)}</p>
          <Button variant="course" size="xl" className="mt-6" onClick={() => setRound(r => r + 1)}><RotateCcw className="size-5" />{t.restart}</Button>
        </div>
      ) : (
        <div className="mt-6">
          <div className="mb-5 flex items-center gap-3">
            <Bar value={(100 * i) / queue.length} className="flex-1" />
            <span className="text-sm font-bold tabular-nums text-muted-foreground">{i + 1}/{queue.length}</span>
            {tally.streak >= 2 && <span className="inline-flex items-center gap-1 text-sm font-bold text-orange-500"><Flame className="size-4 fill-current" />{tally.streak}</span>}
          </div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold">
            <span className="rounded-lg bg-course-soft px-2 py-1 text-course-ink">{q.topic}</span>
            {p.quiz[q.id] && !checked && <span className="text-muted-foreground">{p.quiz[q.id].ok ? '✓' : '✗'}</span>}
          </div>
          <QuestionView key={q.id} q={q} picked={sel} onPick={checked ? undefined : setSel} reveal={checked} explain={false} />
        </div>
      )}

      {q && (
        <div className={cn('fixed inset-x-0 bottom-[calc(4rem+2px+env(safe-area-inset-bottom))] z-40 border-t-2 md:bottom-0',
          !checked ? 'border-border bg-card' : ok ? 'animate-slide-up border-good/30 bg-good-soft' : 'animate-slide-up border-bad/30 bg-bad-soft')}>
          <div className="mx-auto max-w-2xl px-4 py-4">
            {checked && (
              <div className="mb-3 flex gap-3">
                {ok ? <CircleCheck className="size-8 shrink-0 text-good" /> : <CircleX className="size-8 shrink-0 text-bad" />}
                <div className="min-w-0 flex-1">
                  <div className={cn('font-heading text-xl font-extrabold', ok ? 'text-good' : 'text-bad')}>{ok ? (tally.streak >= 3 ? t.streakRight(tally.streak) : t.correct) : t.wrong}</div>
                  <div className="max-h-[32vh] overflow-y-auto">
                    {!ok && <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-[0.95rem] font-semibold text-bad"><span>{t.theAnswer}:</span><Html as="span" html={q.o[q.a]} className="lesson inline text-[0.95rem]" /></div>}
                    <Html html={q.why} className="lesson mt-1 text-[0.95rem]" />
                    {q.src && <div className="mt-1 text-xs font-medium text-muted-foreground">{t.source}: {q.src}</div>}
                  </div>
                </div>
              </div>
            )}
            {checked
              ? <Button variant={ok ? 'good' : 'bad'} size="xl" className="w-full" onClick={next}>{t.continueBtn}</Button>
              : <Button variant="course" size="xl" className="w-full" disabled={sel === undefined} onClick={check}>{t.checkBtn}</Button>}
          </div>
        </div>
      )}

      <div className="mt-10 flex justify-end">
        <Confirm destructive trigger={<Button variant="ghost" size="sm"><RotateCcw className="size-4" />{t.resetPractice}</Button>}
          title={t.resetQ} body={t.resetBody} ok={t.reset} cancel={t.cancel} onOk={() => { resetProgress(c.id, 'quiz'); setRound(r => r + 1) }} />
      </div>
    </div>
  )
}
