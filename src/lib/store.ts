import { useCallback, useSyncExternalStore } from 'react'

/** Everything we remember for one course. Stored under one namespaced, versioned key. */
export interface Progress {
  v: 1
  quiz: Record<string, { pick: number; ok: boolean; tries: number; at: number }>
  cards: Record<string, { known: boolean; seen: number; at: number }>
  read: Record<string, number>
  exams: Record<string, { run?: ExamRun; attempts: Attempt[] }>
}
export interface ExamRun {
  startedAt: number
  answers: Record<string, number> // MCQ: question id -> chosen option (index in the data, not on screen)
  marks: Record<string, number> // written: problem id -> points given by the student
  shown: Record<string, number> // written: problem id -> number of solution steps revealed
  hints: Record<string, boolean>
}
export interface Attempt {
  at: number; score: number; max: number; secs: number
  answers?: Record<string, number>; marks?: Record<string, number> // kept so the last attempt can be reviewed
}

const empty = (): Progress => ({ v: 1, quiz: {}, cards: {}, read: {}, exams: {} })
const key = (course: string) => `studyshelf:${course}:v1`

const mem = new Map<string, Progress>()
const subs = new Map<string, Set<() => void>>()

function load(course: string): Progress {
  const hit = mem.get(course)
  if (hit) return hit
  let p = empty()
  try {
    const raw = localStorage.getItem(key(course))
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.v === 1) p = { ...empty(), ...parsed }
    }
  } catch { /* private mode or corrupt data: start fresh */ }
  mem.set(course, p)
  return p
}

function save(course: string, p: Progress) {
  mem.set(course, p)
  try { localStorage.setItem(key(course), JSON.stringify(p)) } catch { /* quota or disabled storage */ }
  subs.get(course)?.forEach(f => f())
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', e => {
    const m = e.key?.match(/^studyshelf:(.+):v1$/)
    if (!m) return
    mem.delete(m[1])
    subs.get(m[1])?.forEach(f => f())
  })
}

export function useProgress(course: string) {
  const subscribe = useCallback((f: () => void) => {
    if (!subs.has(course)) subs.set(course, new Set())
    subs.get(course)!.add(f)
    return () => { subs.get(course)!.delete(f) }
  }, [course])
  const p = useSyncExternalStore(subscribe, () => load(course))
  const update = useCallback((fn: (draft: Progress) => void) => {
    const next: Progress = structuredClone(load(course))
    fn(next)
    save(course, next)
  }, [course])
  return [p, update] as const
}

export const readProgress = load
export function resetProgress(course: string, part?: keyof Omit<Progress, 'v'>) {
  const next = part ? { ...structuredClone(load(course)), [part]: {} } : empty()
  save(course, next)
}
