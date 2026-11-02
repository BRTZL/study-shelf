export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#17324a" />
      <rect x="7" y="8" width="4" height="15" rx="1" fill="#7fd1c5" />
      <rect x="12.5" y="6" width="4" height="17" rx="1" fill="#f2b86b" />
      <rect x="18" y="9.5" width="4" height="13.5" rx="1" fill="#e9876b" transform="rotate(-12 20 16)" />
      <rect x="6" y="24" width="20" height="2.2" rx="1.1" fill="#fff" />
    </svg>
  )
}
