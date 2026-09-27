'use client'
import { MotionConfig } from 'motion/react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { type Key, type Locale, num, translate } from '@/lib/i18n'
import { store } from '@/lib/api'

export type Theme = 'system' | 'light' | 'dark'
type Ctx = {
  locale: Locale; setLocale: (l: Locale) => void; theme: Theme; setTheme: (t: Theme) => void
  t: (k: Key, v?: Record<string, string | number>) => string; n: (x: number, digits?: number) => string
  data: (mb: number) => string; toman: (x: number) => string
}
const AppCtx = createContext<Ctx>(null!)
export const useApp = () => useContext(AppCtx)

export function Providers({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('fa')
  const [theme, setTheme] = useState<Theme>('system')
  // Hydrate with the static defaults, then adopt stored prefs; skip writes until then so defaults never overwrite them.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setLocale((store.get('locale') as Locale) || 'fa')
    setTheme((store.get('theme') as Theme) || 'system')
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    const el = document.documentElement
    el.lang = locale
    el.dir = locale === 'fa' ? 'rtl' : 'ltr'
    el.classList.remove('i18n-pending')
    store.set('locale', locale)
  }, [locale, ready])

  useEffect(() => {
    if (!ready) return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => (document.documentElement.dataset.theme = theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme)
    apply()
    store.set('theme', theme)
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme, ready])

  const t = useCallback((k: Key, v?: Record<string, string | number>) => translate(locale, k, v), [locale])
  const n = useCallback((x: number, d = 1) => num(x, locale, d), [locale])
  const data = useCallback((mb: number) => (mb >= 1024 ? `${n(mb / 1024)} ${t('u.gb')}` : `${n(mb, 0)} ${t('u.mb')}`), [n, t])
  const toman = useCallback((x: number) => `${n(x, 0)} ${t('u.toman')}`, [n, t])

  return (
    <AppCtx.Provider value={{ locale, setLocale, theme, setTheme, t, n, data, toman }}>
      <MotionConfig reducedMotion="user" transition={{ type: 'spring', bounce: 0, duration: 0.45 }}>
        {children}
      </MotionConfig>
    </AppCtx.Provider>
  )
}
