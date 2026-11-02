import { useEffect, type CSSProperties } from 'react'
import { Link, NavLink, Outlet, useLocation, useOutletContext, useParams } from 'react-router-dom'
import { BookOpen, ClipboardCheck, Home as HomeIcon, Layers, LayoutGrid, Target } from 'lucide-react'
import { useCourse } from '@/lib/data'
import { strings, type Strings } from '@/lib/i18n'
import { useProgress, type Progress } from '@/lib/store'
import type { Course } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'

export interface CourseCtx { course: Course; t: Strings; p: Progress; update: (fn: (d: Progress) => void) => void }
export const useCourseCtx = () => useOutletContext<CourseCtx>()

export default function CourseShell() {
  const { id = '' } = useParams()
  const { data: course, error } = useCourse(id)
  const [p, update] = useProgress(id)
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    document.querySelector('nav a[aria-current="page"]')?.scrollIntoView({ inline: 'nearest', block: 'nearest' })
  }, [pathname])
  useEffect(() => {
    if (course) document.title = `${course.code} · Study Shelf`
    if (course) document.documentElement.lang = course.lang
    return () => { document.title = 'Study Shelf'; document.documentElement.lang = 'en' }
  }, [course])

  const t = strings(course?.lang ?? 'en')
  const style = course ? ({ '--course': course.color, '--course-soft': course.soft } as CSSProperties) : undefined
  const tabs = [
    { to: '', end: true, label: t.overview, icon: LayoutGrid },
    { to: 'learn', label: t.lessons, icon: BookOpen },
    { to: 'practice', label: t.practice, icon: Target },
    { to: 'exams', label: t.exams, icon: ClipboardCheck },
    { to: 'cards', label: t.cards, icon: Layers },
  ]

  return (
    <div style={style} className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 pt-3">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground" aria-label={t.allCourses}>
            <Logo className="size-6" /><span className="hidden sm:inline">Study Shelf</span><HomeIcon className="size-4 sm:hidden" />
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <span className="truncate text-sm font-semibold" style={{ color: course?.color }}>{course?.code ?? '…'}</span>
          <span className="hidden truncate text-sm text-muted-foreground md:inline">{course?.title}</span>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 pb-2 pt-2 [scrollbar-width:none]">
          {tabs.map(({ to, end, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => cn('flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                isActive ? 'bg-course text-white shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground')}>
              <Icon className="size-4" />{label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6">
        {error && <p className="py-20 text-center text-muted-foreground">{t.failed} <span className="text-xs">({error})</span></p>}
        {!course && !error && <p className="py-20 text-center text-muted-foreground">{t.loading}</p>}
        {course && <Outlet context={{ course, t, p, update } satisfies CourseCtx} />}
      </main>
    </div>
  )
}
