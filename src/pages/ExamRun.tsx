import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Clock, Eye, Lightbulb, ListChecks, Play, Trash2, Trophy } from 'lucide-react'
import { useCourseCtx } from '@/components/shelf/CourseShell'
import { QuestionView } from '@/components/shelf/QuestionView'
import { Html } from '@/components/shelf/Html'
import { Confirm } from '@/components/shelf/Confirm'
import { Button } from '@/components/ui/button'
import { fmtTime } from '@/lib/stats'
import type { Attempt, ExamRun as Run } from '@/lib/store'
import type { Problem } from '@/lib/types'
import type { Strings } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const newRun = (): Run => ({ startedAt: Date.now(), answers: {}, marks: {}, shown: {}, hints: {} })

export default function ExamRun() {
  const { course: c, t, p, update } = useCourseCtx()
  const { examId } = useParams()
  const [params, setParams] = useSearchParams()
  const exam = c.exams.find(e => e.id === examId)
  const st = exam ? p.exams[exam.id] : undefined
  const run = st?.run
  const last = st?.attempts.at(-1)
  const reviewing = !run && params.get('review') === '1' && !!last

  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!run) return
    const h = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(h)
  }, [run])

  if (!exam) return <p className="py-16 text-center"><Link to=".." relative="path" className="underline">{t.quitExam}</Link></p>

  const set = (fn: (r: Run) => void) => update(d => {
    const e = (d.exams[exam.id] ??= { attempts: [] })
    if (!e.run) e.run = newRun()
    fn(e.run)
  })
  const start = () => { update(d => { (d.exams[exam.id] ??= { attempts: [] }).run = newRun() }); setParams({}) }
  const discard = () => update(d => { delete d.exams[exam.id].run })
  const finish = () => {
    if (!run) return
    const secs = (Date.now() - run.startedAt) / 1000
    let score = 0, max = 0
    if (exam.kind === 'mcq') { max = exam.items.length; score = exam.items.filter(q => run.answers[q.id] === q.a).length }
    else { max = exam.items.reduce((s, x) => s + x.points, 0); score = exam.items.reduce((s, x) => s + (run.marks[x.id] ?? 0), 0) }
    const a: Attempt = { at: Date.now(), score, max, secs, answers: run.answers, marks: run.marks }
    update(d => { const e = d.exams[exam.id]; e.attempts.push(a); delete e.run })
    setParams({ review: '1' })
    window.scrollTo(0, 0)
  }

  const back = <Link to=".." relative="path" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />{t.quitExam}</Link>

  // Intro screen
  if (!run && !reviewing) {
    return (
      <div className="mx-auto max-w-2xl">
        {back}
        <div className="tile p-7 text-center sm:p-10">
          <div className="press mx-auto mb-4 grid size-16 place-items-center rounded-3xl bg-course text-white"><ListChecks className="size-8" /></div>
          <h1 className="display text-3xl font-bold">{exam.title}</h1>
          <p className="mt-3 text-muted-foreground">{exam.blurb}</p>
          <div className="mt-4 flex justify-center gap-4 text-sm font-medium">
            <span className="inline-flex items-center gap-1"><ListChecks className="size-4" />{exam.kind === 'written' ? t.problems(exam.items.length) : t.questions(exam.items.length)}</span>
            <span className="inline-flex items-center gap-1"><Clock className="size-4" />{t.minutes(exam.minutes)}</span>
          </div>
          <p className="mx-auto mt-5 max-w-md text-sm text-muted-foreground">{exam.kind === 'written' ? t.writtenHow : t.mcqHow}</p>
          <Button variant="course" size="xl" className="mt-7 w-full max-w-xs" onClick={start}><Play className="size-5" />{t.start}</Button>
        </div>
      </div>
    )
  }

  // Result + review of the last attempt
  if (reviewing && last) {
    const pct = Math.round((100 * last.score) / Math.max(1, last.max))
    return (
      <div className="mx-auto max-w-3xl">
        {back}
        <div className="tile p-7 text-center animate-pop">
          <Trophy className="mx-auto size-9 text-course" />
          <div className="mt-2 text-sm font-semibold uppercase tracking-widest text-course">{t.score}</div>
          <div className="display text-6xl font-bold tabular-nums text-course">{pct}%</div>
          <div className="mt-1 text-sm text-muted-foreground tabular-nums">{last.score} / {last.max} · {fmtTime(last.secs)}</div>
          <Button variant="course" size="xl" className="mt-6" onClick={start}><Play className="size-5" />{t.retake}</Button>
        </div>
        <h2 className="mb-4 mt-10 font-heading text-2xl font-bold">{t.review}</h2>
        <div className="space-y-5">
          {exam.kind === 'mcq'
            ? exam.items.map((q, i) => (
              <div key={q.id} className="tile p-4 sm:p-5">
                <QuestionView q={q} number={`${i + 1}`} picked={last.answers?.[q.id]} reveal sourceLabel={t.source} />
              </div>))
            : exam.items.map((x, i) => (
              <ProblemCard key={x.id} x={x} i={i} t={t} shown={x.steps.length} hint marks={last.marks?.[x.id]} readOnly />
            ))}
        </div>
      </div>
    )
  }

  // Running
  const r = run!
  const elapsed = (now - r.startedAt) / 1000
  const left = exam.minutes * 60 - elapsed
  const unanswered = exam.kind === 'mcq' ? exam.items.filter(q => r.answers[q.id] === undefined).length : exam.items.filter(x => r.marks[x.id] === undefined).length
  return (
    <div className="mx-auto max-w-3xl">
      {back}
      <h1 className="display text-3xl font-bold">{exam.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{exam.kind === 'written' ? t.writtenHow : t.mcqHow}</p>
      <div className="mt-6 space-y-5">
        {exam.kind === 'mcq'
          ? exam.items.map((q, i) => (
            <div key={q.id} className="tile p-4 sm:p-5">
              <QuestionView q={q} number={`${i + 1}`} picked={r.answers[q.id]} reveal={false}
                onPick={k => set(run => { run.answers[q.id] = k })} />
            </div>))
          : exam.items.map((x, i) => (
            <ProblemCard key={x.id} x={x} i={i} t={t} shown={r.shown[x.id] ?? 0} hint={!!r.hints[x.id]} marks={r.marks[x.id]}
              onShow={n => set(run => { run.shown[x.id] = n })} onHint={() => set(run => { run.hints[x.id] = true })}
              onMark={m => set(run => { run.marks[x.id] = m })} />
          ))}
      </div>

      <div className="sticky bottom-3 z-20 mt-8">
        <div className="tile flex items-center gap-2 bg-card/95 p-2.5 shadow-lg backdrop-blur">
          <span className={cn('inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold tabular-nums', left < 0 ? 'bg-bad/10 text-bad' : left < 300 ? 'bg-amber-100 text-amber-900' : 'bg-secondary')}>
            <Clock className="size-4" />{fmtTime(Math.abs(left))}<span className="hidden font-medium sm:inline">{left >= 0 ? t.timeLeft : t.overtime}</span>
          </span>
          <span className="text-sm font-semibold text-muted-foreground tabular-nums">{exam.items.length - unanswered}/{exam.items.length}</span>
          <div className="ml-auto flex items-center gap-1">
            <Confirm destructive trigger={<Button variant="ghost" size="icon" aria-label={t.abandon}><Trash2 className="size-4" /></Button>}
              title={t.abandonQ} body={t.abandonBody} ok={t.abandon} cancel={t.cancel} onOk={discard} />
            <Confirm trigger={<Button variant="course" size="lg" className="h-11 rounded-xl px-4"><span className="sm:hidden">{t.finishShort}</span><span className="hidden sm:inline">{t.submit}</span></Button>}
              title={t.submitQ} body={t.submitBody(unanswered)} ok={t.submit} cancel={t.cancel} onOk={finish} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ProblemCard({ x, i, t, shown, hint, marks, onShow, onHint, onMark, readOnly }: {
  x: Problem; i: number; t: Strings; shown: number; hint: boolean; marks?: number
  onShow?: (n: number) => void; onHint?: () => void; onMark?: (m: number) => void; readOnly?: boolean
}) {
  const all = shown >= x.steps.length
  const opts: [number, string][] = [[0, t.zero], [Math.round(x.points / 2), t.half], [x.points, t.full]]
  return (
    <div className="tile p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-heading text-lg font-bold text-course">{i + 1}.</span>
        <span className="ml-auto text-xs font-semibold text-muted-foreground">{x.points} {t.points}</span>
      </div>
      <Html html={x.q} className="lesson mt-1 text-[1.02rem]" />
      {x.hint && (hint ? (
        <div className="mt-3 flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-950"><Lightbulb className="mt-0.5 size-4 shrink-0" /><Html html={x.hint} className="lesson text-sm" /></div>
      ) : !readOnly && (
        <Button variant="outline" size="sm" className="mt-3" onClick={onHint}><Lightbulb className="size-4" />{t.hint}</Button>
      ))}
      {shown > 0 && (
        <div className="mt-4 border-t pt-3">
          <div className="text-xs font-bold uppercase tracking-widest text-course">{t.solution}</div>
          <ol className="mt-2 space-y-2">
            {x.steps.slice(0, shown).map((s, k) => (
              <li key={k} className="flex gap-3">
                <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-course-soft text-xs font-bold text-course">{k + 1}</span>
                <Html html={s} className="lesson min-w-0 flex-1 text-[0.98rem]" />
              </li>
            ))}
          </ol>
          {all && <div className="mt-3 rounded-xl bg-course-soft px-4 py-2.5"><div className="text-[11px] font-bold uppercase tracking-widest text-course">{t.answer}</div><Html html={x.answer} className="lesson" /></div>}
        </div>
      )}
      {!readOnly && !all && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => onShow?.(shown + 1)}><Eye className="size-4" />{t.showStep}</Button>
          <Button variant="ghost" size="sm" onClick={() => onShow?.(x.steps.length)}>{t.showAll}</Button>
        </div>
      )}
      {(all || readOnly) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">{t.markYourself}</span>
          {opts.map(([v, l]) => (
            <button key={l} type="button" disabled={readOnly} onClick={() => onMark?.(v)}
              className={cn('rounded-xl border-2 px-3 py-1.5 text-sm font-semibold transition', marks === v ? 'border-course bg-course text-white shadow-[0_3px_0_0_var(--course-edge)]' : 'border-border bg-card shadow-[0_3px_0_0_var(--border)] hover:bg-secondary', readOnly && marks !== v && 'opacity-50')}>
              {l} · {v}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

