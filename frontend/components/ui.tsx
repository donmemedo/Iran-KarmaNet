'use client'
import { AnimatePresence, animate, motion, useMotionValue, useSpring, type PanInfo } from 'motion/react'
import { Laptop, Monitor, Moon, Smartphone, Sun, Tablet } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { type Theme, useApp } from './providers'

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')
export { cx }

export const Aurora = () => (
  <div className="aurora" aria-hidden>
    <i /><i /><i />
  </div>
)

export function Logo({ className = 'size-8' }: { className?: string }) {
  const id = useId()
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--a1)" /><stop offset=".55" stopColor="var(--a2)" /><stop offset="1" stopColor="var(--a3)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
      <g fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
        <path d="M9.5 14.5a9 9 0 0 1 13 0" opacity=".55" />
        <path d="M12.3 17.6a5 5 0 0 1 7.4 0" opacity=".8" />
      </g>
      <circle cx="16" cy="21.5" r="2.2" fill="#fff" />
    </svg>
  )
}

export function Button({ variant = 'primary', className, href, ...p }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'glass' | 'ghost'; href?: string }) {
  const cls = cx(
    'press inline-flex items-center justify-center gap-2 rounded-full px-6 h-12 font-semibold text-[15px] cursor-pointer disabled:cursor-not-allowed',
    variant === 'primary' && 'btn-primary',
    variant === 'glass' && 'glass hover:brightness-105',
    variant === 'ghost' && 'text-muted hover:text-fg hover:bg-stroke',
    className,
  )
  return href ? <Link href={href} className={cls}>{p.children}</Link> : <button className={cls} {...p} />
}

export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('glass rounded-[28px]', className)} {...p} />
}

/** Scroll-reveal with a critically damped spring. */
export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring', bounce: 0, duration: 0.9, delay }}>
      {children}
    </motion.div>
  )
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={cx('press relative h-8 w-[52px] shrink-0 rounded-full p-0.5 flex cursor-pointer transition-colors duration-300',
        on ? 'bg-a3 justify-end' : 'bg-stroke justify-start')}>
      <motion.span layout transition={{ type: 'spring', bounce: 0.25, duration: 0.35 }}
        className="size-7 rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0/.25)]" />
    </button>
  )
}

export function Segmented<T extends string>({ value, options, onChange, className }:
  { value: T; options: { value: T; label: React.ReactNode; title?: string }[]; onChange: (v: T) => void; className?: string }) {
  const id = useId()
  return (
    <div role="radiogroup" className={cx('relative flex rounded-full bg-stroke p-1', className)}>
      {options.map((o) => (
        <button key={o.value} role="radio" aria-checked={value === o.value} title={o.title} aria-label={o.title}
          onClick={() => onChange(o.value)}
          className={cx('press relative z-0 flex-1 flex items-center justify-center gap-1.5 rounded-full px-3 h-8 text-sm font-medium cursor-pointer transition-colors',
            value === o.value ? 'text-fg' : 'text-muted hover:text-fg')}>
          {value === o.value && (
            <motion.span layoutId={id} className="absolute inset-0 -z-10 rounded-full bg-solid shadow-[0_2px_8px_rgb(0_0_0/.12)]"
              transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }} />
          )}
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function ThemeSwitch() {
  const { theme, setTheme, t } = useApp()
  const opts: { value: Theme; label: React.ReactNode; title: string }[] = [
    { value: 'light', label: <Sun className="size-4" />, title: t('th.light') },
    { value: 'system', label: <Monitor className="size-4" />, title: t('th.system') },
    { value: 'dark', label: <Moon className="size-4" />, title: t('th.dark') },
  ]
  return <Segmented value={theme} onChange={setTheme} options={opts} className="w-[120px]" />
}

export function LangSwitch() {
  const { locale, setLocale } = useApp()
  return (
    <button onClick={() => setLocale(locale === 'fa' ? 'en' : 'fa')} aria-label="Language / زبان"
      className="press h-10 min-w-10 px-3 rounded-full bg-stroke text-sm font-semibold hover:text-fg cursor-pointer">
      {locale === 'fa' ? 'EN' : 'فا'}
    </button>
  )
}

/** Number that springs to its new value instead of jumping. */
export function CountUp({ value, format }: { value: number; format: (v: number) => string }) {
  const [v, setV] = useState(value)
  const prev = useRef(value)
  useEffect(() => {
    const c = animate(prev.current, value, { type: 'spring', bounce: 0, duration: 1.1, onUpdate: setV })
    prev.current = value
    return () => c.stop()
  }, [value])
  return <span className="tabular-nums">{format(v)}</span>
}

/** The hotspot: pulsing signal rings with guest devices in orbit; tilts toward the pointer. */
export function Orb({ active = true, guests = 3, size = 320 }: { active?: boolean; guests?: number; size?: number }) {
  const rx = useSpring(0, { stiffness: 120, damping: 20 })
  const ry = useSpring(0, { stiffness: 120, damping: 20 })
  const icons = [Smartphone, Laptop, Tablet, Smartphone, Laptop]
  return (
    <motion.div
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 18)
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 18)
      }}
      onPointerLeave={() => { rx.set(0); ry.set(0) }}
      style={{ width: size, height: size, rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className="relative mx-auto max-w-full aspect-square">
      {active && <div className="absolute inset-[18%]"><span className="pulse" /><span className="pulse" /><span className="pulse" /></div>}
      <div className="absolute inset-[6%] rounded-full border border-stroke" />
      <div className="absolute inset-[22%] rounded-full border border-dashed border-stroke" />
      <motion.div animate={{ scale: active ? 1 : 0.86, opacity: active ? 1 : 0.5 }}
        className="absolute inset-[34%] rounded-full grad shadow-[0_0_80px_-10px_var(--glow)]"
        style={{ backgroundSize: '200% 200%' }}>
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgb(255_255_255/.65),transparent_55%)]" />
        <div className="absolute inset-0 grid place-items-center"><Logo className="size-[38%] drop-shadow-lg" /></div>
      </motion.div>
      <div className="orbit absolute inset-[6%]">
        {icons.slice(0, guests).map((Icon, i) => {
          const a = (i / guests) * Math.PI * 2 - Math.PI / 2
          return (
            <div key={i} className="absolute" style={{ left: `${50 + 50 * Math.cos(a)}%`, top: `${50 + 50 * Math.sin(a)}%` }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: active ? 1 : 0.6, opacity: active ? 1 : 0.4 }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.6, delay: 0.3 + i * 0.12 }}
                className="glass -translate-x-1/2 -translate-y-1/2 size-11 rounded-2xl grid place-items-center">
                <Icon className="size-5 text-a2" />
              </motion.div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

/** Bottom sheet on phones, floating panel on desktop. Drag down or flick to dismiss. */
export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const y = useMotionValue(0)
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [open, onClose])
  const end = (_: unknown, i: PanInfo) => (i.offset.y > 120 || i.velocity.y > 600) && onClose()
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div role="dialog" aria-modal style={{ y }} drag="y" dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.7 }} onDragEnd={end}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0.12, duration: 0.5 }}
            className="glass relative w-full sm:max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 pb-safe sm:pb-6 sm:mb-0 bg-solid/90">
            <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-stroke sm:hidden" />
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function Spinner() {
  return <span className="size-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
}
