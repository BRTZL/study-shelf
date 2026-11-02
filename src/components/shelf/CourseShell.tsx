import { useEffect, type CSSProperties } from 'react'
import { Link, NavLink, Outlet, useLocation, useOutletContext, useParams } from 'react-router-dom'
import { BookOpen, ChevronLeft, ClipboardCheck, House, Layers, Target } from 'lucide-react'
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
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  useEffect(() => {
    if (!course) return
    document.title = `${course.code} · Study Shelf`
    document.documentElement.lang = course.lang
    return () => { document.title = 'Study Shelf'; document.documentElement.lang = 'en' }
  }, [course])

  const t = strings(course?.lang ?? 'en')
  const style = course ? ({ '--course': course.color, '--course-soft': course.soft } as CSSProperties) : undefined
  const focus = /\/exams\/[^/]+$/.test(pathname) // exam in progress: no distractions
  const tabs = [
    { to: '', end: true, label: t.overview, short: t.overview, icon: House },
    { to: 'learn', label: t.lessons, short: t.lessons, icon: BookOpen },
    { to: 'practice', label: t.practice, short: t.practice, icon: Target },
    { to: 'exams', label: t.exams, short: t.examsShort, icon: ClipboardCheck },
    { to: 'cards', label: t.cards, short: t.cards, icon: Layers },
  ]

  return (
    <div style={style} className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b-2 border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4">
          <Link to="/" className="-ml-1 flex items-center gap-1 rounded-xl p-1 text-muted-foreground hover:text-foreground" aria-label={t.allCourses}>
            <ChevronLeft className="size-5 sm:hidden" /><Logo className="size-7" />
          </Link>
          <div className="min-w-0 leading-tight">
            {course?.code.toLocaleLowerCase(course.lang) !== course?.title.toLocaleLowerCase(course?.lang) && <div className="eyebrow-label text-course">{course?.code ?? '…'}</div>}
            <div className="truncate font-heading text-[15px] font-bold">{course?.title}</div>
          </div>
          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {tabs.map(({ to, end, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => cn('flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                  isActive ? 'bg-course-soft text-course-ink' : 'text-muted-foreground hover:bg-secondary hover:text-foreground')}>
                <Icon className="size-4" />{label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className={cn('mx-auto max-w-5xl px-4 pt-6', focus ? 'pb-10' : 'pb-32 md:pb-16')}>
        {error && <p className="py-20 text-center text-muted-foreground">{t.failed} <span className="text-xs">({error})</span></p>}
        {!course && !error && <div className="mx-auto mt-6 h-56 max-w-3xl animate-pulse rounded-3xl bg-secondary" />}
        {course && <Outlet context={{ course, t, p, update } satisfies CourseCtx} />}
      </main>

      {!focus && (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
          <div className="mx-auto grid h-16 max-w-lg grid-cols-5">
            {tabs.map(({ to, end, short, icon: Icon }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => cn('relative flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold',
                  isActive ? 'text-course' : 'text-muted-foreground')}>
                {({ isActive }) => (<>
                  {isActive && <span className="absolute inset-x-5 top-0 h-[3px] rounded-b-full bg-course" />}
                  <span className={cn('grid h-7 w-11 place-items-center rounded-xl transition', isActive && 'bg-course-soft')}><Icon className="size-[19px]" /></span>
                  <span className="max-w-full truncate px-0.5">{short}</span>
                </>)}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
