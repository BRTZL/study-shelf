import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const GLYPH: Record<string, string> = { csc2201: '{ }', mat2039: '∫', turkdili: 'Ğ' }

/** Decorative course artwork: a big glyph over a subject-specific line pattern. */
export function CourseArt({ id, code, className }: { id: string; code: string; className?: string }) {
  const glyph = GLYPH[id] ?? code.replace(/[^A-ZÇĞİÖŞÜ]/g, '').slice(0, 2)
  return (
    <div className={cn('relative overflow-hidden bg-course text-white', className)}>
      <svg className="absolute inset-0 size-full opacity-25" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" fill="none" stroke="white" strokeWidth="1.2" aria-hidden>
        {id === 'csc2201' && (<>
          <rect x="120" y="14" width="44" height="14" rx="7" /><path d="M142 28v10" /><path d="M128 38h34l-5 12h-34z" /><path d="M142 50v10" />
          <path d="M142 60l18 11-18 11-18-11z" /><path d="M160 71h22V20h-18" /><path d="M142 82v14" /><rect x="124" y="96" width="36" height="12" rx="3" />
        </>)}
        {id === 'mat2039' && Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M-10 ${20 + i * 18} C 40 ${-10 + i * 18}, 80 ${50 + i * 18}, 130 ${20 + i * 18} S 190 ${-5 + i * 18}, 215 ${20 + i * 18}`} />
        ))}
        {id === 'turkdili' && Array.from({ length: 9 }, (_, i) => <circle key={i} cx="175" cy="110" r={14 + i * 13} />)}
        {!GLYPH[id] && Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${i * 28} 0l40 120`} />)}
      </svg>
      <div className="pattern-dots absolute inset-0 opacity-40" />
      <span className="absolute bottom-1 left-4 select-none font-heading text-[5.5rem] font-extrabold leading-none tracking-tighter text-white/90 drop-shadow-[0_4px_0_rgba(0,0,0,.12)]">{glyph}</span>
    </div>
  )
}

export function Ring({ value, size = 56, stroke = 6, children, className }: { value: number; size?: number; stroke?: number; children?: ReactNode; className?: string }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('relative grid shrink-0 place-items-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity=".14" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} className="transition-[stroke-dashoffset] duration-700" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}
