'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getToken } from '@/lib/api'
import { useApp } from './providers'
import { Button, LangSwitch, Logo, ThemeSwitch, cx } from './ui'

export function TopBar({ links = true }: { links?: boolean }) {
  const { t } = useApp()
  const [authed, setAuthed] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    setAuthed(!!getToken())
    const s = () => setScrolled(scrollY > 8)
    s(); addEventListener('scroll', s, { passive: true })
    return () => removeEventListener('scroll', s)
  }, [])
  return (
    <header className={cx('sticky top-0 z-40 transition-[background,box-shadow] duration-300', scrolled && 'bar shadow-[0_1px_0_var(--stroke)]')}>
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="press flex items-center gap-2.5 font-bold text-lg"><Logo />{t('brand')}</Link>
        {links && (
          <div className="ms-6 hidden md:flex items-center gap-1 text-sm text-muted">
            {(['features', 'calc', 'pricing', 'business'] as const).map((k) => (
              <a key={k} href={`/#${k}`} className="press rounded-full px-3 py-2 hover:text-fg hover:bg-stroke">{t(`nav.${k}`)}</a>
            ))}
          </div>
        )}
        <div className="ms-auto flex items-center gap-2">
          <div className="hidden sm:block"><ThemeSwitch /></div>
          <LangSwitch />
          <Button href={authed ? '/dashboard' : '/login'} className="h-10 px-4 text-sm">{t(authed ? 'nav.dashboard' : 'nav.login')}</Button>
        </div>
      </nav>
    </header>
  )
}
