export type Lang = 'en' | 'tr'

export interface CourseMeta {
  id: string
  code: string
  title: string
  blurb: string
  lang: Lang
  color: string
  soft: string
  pdf?: string
  pdfPages?: number
  counts: { chapters: number; questions: number; cards: number; exams: number }
  updated: string
}

export interface Manifest { courses: CourseMeta[] }

export interface Chapter { n: number; title: string; lead: string; src?: string; html: string }

export interface Question {
  id: string
  topic: string
  q: string // HTML
  o: string[] // HTML
  a: number
  why: string // HTML
  src?: string
  lvl?: number
}

export interface Card { id: string; topic: string; front: string; back: string; src?: string }

export interface Problem {
  id: string
  topic: string
  points: number
  q: string
  hint?: string
  steps: string[]
  answer: string
  src?: string
}

export type Exam =
  | { id: string; kind: 'mcq'; title: string; blurb: string; minutes: number; items: Question[] }
  | { id: string; kind: 'written'; title: string; blurb: string; minutes: number; items: Problem[] }

export interface Extra { label: string; href: string; blurb: string }

export interface Course extends CourseMeta {
  chapters: Chapter[]
  topics: string[]
  quiz: Question[]
  cards: Card[]
  exams: Exam[]
  extras?: Extra[]
  notes?: string // HTML shown on the overview (e.g. slide errata)
}
