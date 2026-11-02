import { cn } from '@/lib/utils'

/** Renders HTML produced by our own build step (lessons, questions with prerendered KaTeX). */
export function Html({ html, className, as: Tag = 'div' }: { html: string; className?: string; as?: 'div' | 'span' }) {
  return <Tag className={cn('rich', className)} dangerouslySetInnerHTML={{ __html: html }} />
}
