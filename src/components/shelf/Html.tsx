import { useLayoutEffect, useRef } from 'react'
import renderMathInElement from 'katex/contrib/auto-render'
import { cn } from '@/lib/utils'

const DELIMS = [
  { left: '\\[', right: '\\]', display: true },
  { left: '\\(', right: '\\)', display: false },
]

/** Renders HTML produced by our own build step; TeX in \( \) / \[ \] is typeset with KaTeX on the client. */
export function Html({ html, className, as: Tag = 'div' }: { html: string; className?: string; as?: 'div' | 'span' }) {
  const ref = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    if (ref.current && html.includes('\\')) renderMathInElement(ref.current, { delimiters: DELIMS, throwOnError: false, strict: 'ignore' })
  }, [html])
  return <Tag ref={ref as never} className={cn('rich', className)} dangerouslySetInnerHTML={{ __html: html }} />
}
