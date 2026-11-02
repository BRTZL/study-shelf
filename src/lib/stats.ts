import type { Course } from './types'
import type { Progress } from './store'

export function courseStats(c: Pick<Course, 'id' | 'counts'> & Partial<Course>, p: Progress) {
  const quizIds = c.quiz ? new Set(c.quiz.map(q => q.id)) : null
  const answered = Object.entries(p.quiz).filter(([id]) => !quizIds || quizIds.has(id))
  const right = answered.filter(([, v]) => v.ok).length
  const known = Object.values(p.cards).filter(v => v.known).length
  const read = Object.keys(p.read).length
  let best: number | null = null
  for (const e of Object.values(p.exams)) for (const a of e.attempts) {
    const pct = a.max ? Math.round((100 * a.score) / a.max) : 0
    best = best === null ? pct : Math.max(best, pct)
  }
  const { chapters, questions, cards } = c.counts
  // Overall bar: equal parts reading, practice coverage, cards known.
  const parts = [chapters ? read / chapters : 0, questions ? answered.length / questions : 0, cards ? known / cards : 0]
  const overall = Math.round((100 * parts.reduce((a, b) => a + b, 0)) / parts.length)
  return {
    read, answered: answered.length, right, known, best, overall: Math.min(100, overall),
    accuracy: answered.length ? Math.round((100 * right) / answered.length) : null,
  }
}

export const fmtTime = (secs: number) => {
  const s = Math.max(0, Math.floor(secs))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}
