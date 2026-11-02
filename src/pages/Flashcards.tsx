import { useEffect, useMemo, useState } from 'react'
import { Check, PartyPopper, RotateCcw, Shuffle } from 'lucide-react'
import { useCourseCtx } from '@/components/shelf/CourseShell'
import { Html } from '@/components/shelf/Html'
import { TopicChips } from '@/components/shelf/TopicChips'
import { Bar } from '@/components/shelf/Stat'
import { Button } from '@/components/ui/button'
import { readProgress } from '@/lib/store'
import { cn } from '@/lib/utils'

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

export default function Flashcards() {
  const { course: c, t, p, update } = useCourseCtx()
  const [topics, setTopics] = useState<string[]>([])
  const [onlyUnknown, setOnlyUnknown] = useState(true)
  const [round, setRound] = useState(0)
  const [i, setI] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const cardTopics = useMemo(() => c.topics.filter(tp => c.cards.some(x => x.topic === tp)), [c])
  const queue = useMemo(() => {
    const prog = readProgress(c.id)
    const pool = c.cards.filter(x => !topics.length || topics.includes(x.topic))
    const q = onlyUnknown ? pool.filter(x => !prog.cards[x.id]?.known) : pool
    return shuffle(q).sort((a, b) => Number(!!prog.cards[a.id]) - Number(!!prog.cards[b.id])) // unseen first
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.id, c.cards, topics, onlyUnknown, round])
  useEffect(() => { setI(0); setFlipped(false) }, [queue])

  const card = queue[i]
  const mark = (known: boolean) => {
    if (!card) return
    update(d => { const o = d.cards[card.id]; d.cards[card.id] = { known, seen: (o?.seen ?? 0) + 1, at: Date.now() } })
    setFlipped(false)
    setI(x => x + 1)
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card) return
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped(f => !f) }
      else if (flipped && (e.key === 'ArrowRight' || e.key === '2')) mark(true)
      else if (flipped && (e.key === 'ArrowLeft' || e.key === '1')) mark(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const scope = c.cards.filter(x => !topics.length || topics.includes(x.topic))
  const known = scope.filter(x => p.cards[x.id]?.known).length

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h1 className="text-3xl font-bold">{t.cards}</h1>
        <span className="text-sm text-muted-foreground tabular-nums">{known}/{scope.length}</span>
      </div>
      <Bar value={(100 * known) / Math.max(1, scope.length)} className="mb-5" />
      <TopicChips topics={cardTopics} selected={topics} onChange={setTopics} allLabel={t.all} />
      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" checked={onlyUnknown} onChange={e => setOnlyUnknown(e.target.checked)} className="size-4 accent-[var(--course)]" />
        {t.onlyUnknown}
      </label>

      <div className="mt-6">
        {!card ? (
          <div className="rounded-3xl border bg-card p-10 text-center">
            <PartyPopper className="mx-auto size-10 text-course" />
            <p className="mt-3 text-lg font-semibold">{t.cardsDoneT}</p>
            <p className="mt-1 text-muted-foreground">{t.cardsDone(known, scope.length)}</p>
            <Button className="mt-5" onClick={() => setRound(r => r + 1)}><Shuffle className="size-4" />{t.shuffleRound}</Button>
          </div>
        ) : (
          <>
            <button type="button" onClick={() => setFlipped(f => !f)} aria-label={t.flip}
              className="group block w-full [perspective:1400px]">
              <div className={cn('relative min-h-64 w-full transition-transform duration-500 [transform-style:preserve-3d]', flipped && '[transform:rotateY(180deg)]')}>
                <div className="absolute inset-0 flex flex-col rounded-3xl border bg-card p-6 shadow-sm [backface-visibility:hidden]">
                  <span className="self-start rounded-full bg-course-soft px-2.5 py-0.5 text-xs font-medium text-course">{card.topic}</span>
                  <Html html={card.front} className="lesson my-auto py-4 text-center font-heading text-2xl font-semibold leading-snug" />
                  <span className="text-center text-xs text-muted-foreground">{t.flip}</span>
                </div>
                <div className="absolute inset-0 flex flex-col overflow-auto rounded-3xl border-2 border-course bg-course-soft p-6 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <Html html={card.back} className="lesson my-auto py-2 text-center text-lg" />
                  {card.src && <span className="text-center text-xs text-muted-foreground">{t.source}: {card.src}</span>}
                </div>
              </div>
            </button>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button variant="outline" size="lg" disabled={!flipped} onClick={() => mark(false)}><RotateCcw className="size-4" />{t.again}</Button>
              <Button size="lg" disabled={!flipped} onClick={() => mark(true)} className="bg-good text-white hover:bg-good/90"><Check className="size-4" />{t.knew}</Button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">{t.cardsLeft(queue.length - i)}</p>
          </>
        )}
      </div>
    </div>
  )
}
