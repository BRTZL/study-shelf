import { useEffect, useState } from 'react'
import type { Course, Lang, Manifest } from './types'

const base = import.meta.env.BASE_URL // './' — relative, so the build works under any path
export const asset = (p: string) => `${base}${p}`.replace(/^\.\/\.\//, './')

const cache = new Map<string, Promise<unknown>>()
function getJSON<T>(path: string): Promise<T> {
  if (!cache.has(path)) {
    cache.set(path, fetch(asset(path)).then(r => {
      if (!r.ok) throw new Error(`${path}: ${r.status}`)
      return r.json()
    }).catch(e => { cache.delete(path); throw e }))
  }
  return cache.get(path) as Promise<T>
}

type State<T> = { data?: T; error?: string }

function useJSON<T>(path: string | null): State<T> {
  const [s, set] = useState<State<T>>({})
  useEffect(() => {
    if (!path) return
    let live = true
    set({})
    getJSON<T>(path).then(d => live && set({ data: d }), e => live && set({ error: String(e.message ?? e) }))
    return () => { live = false }
  }, [path])
  return s
}

export const useManifest = () => useJSON<Manifest>('courses/index.json')
/** Loads the course in the reader's chosen language (falls back to the course's own language). */
export function useCourse(id: string | undefined, pref: Lang | null) {
  const { data: manifest, error } = useManifest()
  const meta = manifest?.courses.find(c => c.id === id)
  const langs = meta ? (meta.langs ?? [meta.lang]) : []
  const lang = meta ? (pref && langs.includes(pref) ? pref : meta.lang) : null
  const path = id && meta && lang ? `courses/${id}/course${lang === meta.lang ? '' : `.${lang}`}.json` : null
  const course = useJSON<Course>(path)
  return { ...course, error: course.error ?? (manifest && !meta ? 'unknown course' : error), langs, lang }
}
