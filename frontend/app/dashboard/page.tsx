'use client'
import { AnimatePresence, motion } from 'motion/react'
import {
  BatteryMedium, Check, Copy, Gift, House, Infinity as Inf, Laptop, LogOut, ReceiptText, Share2, SignalHigh,
  Smartphone, Sparkles, Users, Wallet, Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useState } from 'react'
import { useApp } from '@/components/providers'
import { Aurora, Button, Card, CountUp, LangSwitch, Logo, Orb, Sheet, Spinner, Switch, ThemeSwitch, cx } from '@/components/ui'
import { ApiError, api, getToken, setToken, type Me, type Plan, type Txn } from '@/lib/api'
import type { Key } from '@/lib/i18n'

const TABS = [
  { id: 'home', icon: House }, { id: 'guests', icon: Users }, { id: 'topup', icon: Wallet },
  { id: 'invite', icon: Gift }, { id: 'history', icon: ReceiptText },
] as const
type Tab = (typeof TABS)[number]['id']
type Run = (p: Promise<Me>) => Promise<boolean>
type Props = { me: Me; setMe: (m: Me) => void; run: Run; go: (t: Tab) => void }

export default function Dashboard() {
  const { t } = useApp()
  const router = useRouter()
  const [me, setMe] = useState<Me | null>(null)
  const [tab, setTab] = useState<Tab>('home')
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!getToken()) return void router.replace('/login')
    const h = location.hash.slice(1) as Tab
    if (TABS.some((x) => x.id === h)) setTab(h)
    api<Me>('/api/me').then(setMe).catch(() => router.replace('/login'))
  }, [router])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(id)
  }, [toast])

  const run: Run = useCallback(async (p) => {
    try { setMe(await p); return true } catch (e) {
      setToast(`err.${e instanceof ApiError ? e.message : 'network'}`)
      return false
    }
  }, [])

  const go = (id: Tab) => { setTab(id); history.replaceState(null, '', `#${id}`); scrollTo({ top: 0, behavior: 'smooth' }) }
  const logout = async () => { await api('/api/auth/logout', {}).catch(() => {}); setToken(null); router.replace('/') }

  if (!me) return <><Aurora /><div className="grid min-h-dvh place-items-center"><Logo className="size-14 animate-pulse" /></div></>

  const props = { me, setMe, run, go }
  return (
    <>
      <Aurora />
      <div className="mx-auto max-w-6xl gap-8 px-4 sm:px-6 lg:grid lg:grid-cols-[230px_1fr]">
        <aside className="sticky top-0 hidden h-dvh flex-col py-6 lg:flex">
          <Link href="/" className="press flex items-center gap-2.5 px-3 text-lg font-bold"><Logo />{t('brand')}</Link>
          <nav className="mt-10 space-y-1">
            {TABS.map(({ id, icon: Icon }) => (
              <button key={id} onClick={() => go(id)} aria-current={tab === id ? 'page' : undefined}
                className={cx('press relative flex h-11 w-full items-center gap-3 rounded-2xl px-3 font-medium cursor-pointer transition-colors', tab === id ? 'text-fg' : 'text-muted hover:text-fg')}>
                {tab === id && <motion.span layoutId="side" className="glass absolute inset-0 -z-10 rounded-2xl" />}
                <Icon className={cx('size-5', tab === id && 'text-a2')} />{t(`tab.${id}`)}
              </button>
            ))}
          </nav>
          <div className="mt-auto space-y-3 px-1">
            <div className="flex items-center gap-2"><ThemeSwitch /><LangSwitch /></div>
            <button onClick={logout} className="press flex items-center gap-2 px-2 py-2 text-sm text-muted hover:text-hot cursor-pointer">
              <LogOut className="size-4 rtl:-scale-x-100" />{t('d.logout')}
            </button>
          </div>
        </aside>

        <main className="min-w-0 pb-32 lg:pb-12">
          <header className="flex items-center gap-2 py-4 lg:py-8">
            <Link href="/" className="press lg:hidden max-[420px]:hidden"><Logo className="size-9" /></Link>
            <div className="ms-2 lg:ms-0 max-[420px]:ms-0">
              <p className="text-xs text-muted">{t('d.hello')}</p>
              <p className="whitespace-nowrap text-sm font-bold tabular-nums sm:text-base" dir="ltr">{me.phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3')}</p>
            </div>
            <div className="ms-auto flex items-center gap-2 lg:hidden">
              <ThemeSwitch /><LangSwitch />
              <button onClick={logout} aria-label={t('d.logout')} className="press grid size-10 place-items-center rounded-full bg-stroke cursor-pointer">
                <LogOut className="size-4 rtl:-scale-x-100" />
              </button>
            </div>
          </header>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}>
              {tab === 'home' && <Home {...props} />}
              {tab === 'guests' && <Guests {...props} />}
              {tab === 'topup' && <TopUp {...props} />}
              {tab === 'invite' && <Invite {...props} />}
              {tab === 'history' && <History txns={me.txns} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <nav className="bar fixed inset-x-0 bottom-0 z-40 border-t border-stroke pb-safe lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 px-2 pt-2">
          {TABS.map(({ id, icon: Icon }) => (
            <button key={id} onClick={() => go(id)} aria-current={tab === id ? 'page' : undefined}
              className={cx('press relative flex flex-col items-center gap-1 py-1 text-[11px] font-medium cursor-pointer', tab === id ? 'text-a2' : 'text-muted')}>
              <span className="relative grid h-8 w-14 place-items-center">
                {tab === id && <motion.span layoutId="tabpill" className="absolute inset-0 rounded-full bg-a2/12" transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }} />}
                <Icon className="relative size-[22px]" />
              </span>
              {t(`tab.${id}`)}
            </button>
          ))}
        </div>
      </nav>

      <AnimatePresence>
        {toast && (
          <motion.div role="status" initial={{ opacity: 0, y: -30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className="glass fixed inset-x-0 top-4 z-[60] mx-auto w-fit max-w-[90vw] rounded-full px-5 py-3 text-sm font-medium bg-solid/90">
            {t(toast as Key)}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Ring({ value, size = 200, stroke = 16, children }: { value: number; size?: number; stroke?: number; children: React.ReactNode }) {
  const id = useId()
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90 drop-shadow-[0_8px_24px_var(--glow)]">
        <defs><linearGradient id={id}><stop offset="0" stopColor="var(--a1)" /><stop offset=".6" stopColor="var(--a2)" /><stop offset="1" stopColor="var(--a3)" /></linearGradient></defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--stroke)" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - Math.min(1, value)) }}
          transition={{ type: 'spring', bounce: 0, duration: 1.8 }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}

function Home({ me, setMe, run, go }: Props) {
  const { t, n, data } = useApp()
  const on = !!me.device.hotspot_on
  const [speed, setSpeed] = useState(0)
  useEffect(() => {
    if (!on) return setSpeed(0)
    const tick = () => setSpeed(14 + Math.random() * 28) // ponytail: simulated until the device telemetry API exists
    tick()
    const id = setInterval(tick, 1600)
    return () => clearInterval(id)
  }, [on])
  const credited = me.txns.reduce((s, x) => s + x.mb, 0) || 1
  const avg = me.usage.reduce((s, u) => s + u.own_mb + u.guest_mb, 0) / Math.max(1, me.usage.length)
  const live = on ? me.guests.filter((g) => !g.blocked).length : 0
  const toggle = (v: boolean) => {
    setMe({ ...me, device: { ...me.device, hotspot_on: +v } })
    run(api('/api/device', { hotspot_on: v }, 'PATCH'))
  }
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="relative overflow-hidden p-6 sm:p-8 lg:col-span-3">
        <div className="absolute -top-20 end-[-5rem] size-64 rounded-full grad opacity-20 blur-3xl" />
        <div className="flex flex-col items-center gap-8 sm:flex-row">
          <Ring value={me.balance_mb / credited}>
            <div>
              <div className="text-xs text-muted">{t('d.balance')}</div>
              <div className="mt-1 text-3xl font-black"><CountUp value={me.balance_mb} format={(v) => data(v)} /></div>
            </div>
          </Ring>
          <div className="text-center sm:text-start">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-a3/12 px-3 py-1 text-sm font-semibold text-a3"><Inf className="size-4" />{t('d.noexp')}</span>
            <p className="mt-4 text-muted leading-relaxed">{t('d.pace', { d: n(Math.round(me.balance_mb / Math.max(1, avg)), 0) })}</p>
            <Button onClick={() => go('topup')} className="mt-6"><Zap className="size-4" />{t('d.topup')}</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{t('d.hotspot')}</h2>
            <p className={cx('text-sm', on ? 'text-a3' : 'text-muted')}>{on ? t('d.connected', { n: n(live, 0) }) : t('d.off')}</p>
          </div>
          <Switch on={on} onChange={toggle} label={t('d.hotspot')} />
        </div>
        <Orb active={on} guests={live} size={200} />
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            [BatteryMedium, t('d.battery'), `${n(me.device.battery, 0)}٪`],
            [SignalHigh, t('d.signal'), `${n(me.device.signal, 0)}/${n(5, 0)}`],
            [Zap, t('d.speed'), on ? <CountUp key="s" value={speed} format={(v) => n(v, 0)} /> : '—'],
          ].map(([Ic, label, v], i) => { const Icon = Ic as typeof Zap; return (
            <div key={i} className="rounded-2xl bg-stroke/60 px-2 py-3">
              <Icon className="mx-auto size-4 text-muted" />
              <div className="mt-1 font-bold tabular-nums">{v as React.ReactNode}{i === 2 && on && <span className="ms-1 text-xs font-normal text-muted">{t('u.mbps')}</span>}</div>
              <div className="text-[11px] text-muted">{label as string}</div>
            </div>
          ) })}
        </div>
      </Card>

      <UsageChart usage={me.usage} className="lg:col-span-3" />

      <Card className="group relative overflow-hidden p-6 lg:col-span-2">
        <Gift className="absolute -bottom-6 end-[-1rem] size-40 text-a1/10 transition-transform duration-700 group-hover:-rotate-12 group-hover:scale-110" />
        <Sparkles className="size-7 text-a1" />
        <h3 className="mt-4 text-xl font-bold">{t('i.title')}</h3>
        <p className="mt-2 text-muted leading-relaxed">{t('d.inviteCta')}</p>
        <Button variant="glass" onClick={() => go('invite')} className="mt-6">{t('tab.invite')}</Button>
      </Card>
    </div>
  )
}

function UsageChart({ usage, className }: { usage: Me['usage']; className?: string }) {
  const { t, data, locale } = useApp()
  const [sel, setSel] = useState(usage.length - 1)
  const max = Math.max(1, ...usage.map((u) => u.own_mb + u.guest_mb))
  const loc = locale === 'fa' ? 'fa-IR' : 'en-US'
  const day = new Intl.DateTimeFormat(loc, { day: 'numeric' })
  const full = new Intl.DateTimeFormat(loc, { weekday: 'long', day: 'numeric', month: 'long' })
  const u = usage[sel]
  return (
    <Card className={cx('p-6', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{t('d.usage')}</h2>
          {u && <p className="text-sm text-muted">{full.format(new Date(u.day))} · <b className="text-fg">{data(u.own_mb + u.guest_mb)}</b></p>}
        </div>
        <div className="flex gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-a2" />{t('d.you')}</span>
          <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-a1" />{t('d.guests')}</span>
        </div>
      </div>
      <div className="mt-6 flex h-48 items-end gap-1 sm:gap-2" onPointerLeave={() => setSel(usage.length - 1)}>
        {usage.map((x, i) => (
          <button key={x.day} onPointerEnter={() => setSel(i)} onClick={() => setSel(i)} aria-label={full.format(new Date(x.day))}
            className="group flex h-full flex-1 flex-col items-center justify-end gap-2 cursor-pointer">
            <motion.div initial={{ height: 0 }} animate={{ height: `${((x.own_mb + x.guest_mb) / max) * 100}%` }}
              transition={{ type: 'spring', bounce: 0.25, duration: 0.9, delay: i * 0.03 }}
              className={cx('flex w-full max-w-7 flex-col overflow-hidden rounded-lg transition-opacity', i === sel ? 'opacity-100' : 'opacity-45 group-hover:opacity-75')}>
              <div className="bg-a1" style={{ flexGrow: x.guest_mb }} />
              <div className="bg-a2" style={{ flexGrow: x.own_mb }} />
            </motion.div>
            <span className={cx('text-[10px] tabular-nums', i === sel ? 'text-fg font-bold' : 'text-muted')}>{day.format(new Date(x.day))}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}

function Guests({ me, run }: Props) {
  const { t, n, data } = useApp()
  const [cap, setCap] = useState(me.device.guest_cap_mb)
  useEffect(() => {
    if (cap === me.device.guest_cap_mb) return
    const id = setTimeout(() => run(api('/api/device', { guest_cap_mb: cap }, 'PATCH')), 450)
    return () => clearTimeout(id)
  }, [cap, me.device.guest_cap_mb, run])
  return (
    <div className="space-y-4">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-black">{t('tab.guests')}</h1>
        <p className="mt-2 text-muted">{t('g.sub')}</p>
        <label className="mt-8 block">
          <div className="flex items-baseline justify-between"><span className="font-medium">{t('g.cap')}</span><b className="text-lg tabular-nums">{data(cap)}</b></div>
          <input type="range" className="slider mt-4" min={100} max={2000} step={50} value={cap} onChange={(e) => setCap(+e.target.value)}
            style={{ '--p': `${((cap - 100) / 1900) * 100}%` } as React.CSSProperties} />
        </label>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        {me.guests.map((g, i) => {
          const Icon = /mac|book|laptop/i.test(g.device) ? Laptop : Smartphone
          const pct = Math.min(100, (g.used_mb / g.cap_mb) * 100)
          return (
            <motion.div key={g.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className={cx('p-5 transition-opacity', !!g.blocked && 'opacity-60')}>
                <div className="flex items-center gap-3">
                  <span className={cx('grid size-12 place-items-center rounded-2xl', g.blocked ? 'bg-hot/12 text-hot' : 'bg-a2/12 text-a2')}><Icon className="size-6" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 font-semibold"><span dir="ltr" className="truncate">{g.device}</span>
                      {!!g.blocked && <span className="rounded-full bg-hot/12 px-2 py-0.5 text-[11px] text-hot">{t('g.blocked')}</span>}</div>
                    <div className="text-sm text-muted tabular-nums">{data(g.used_mb)} {t('g.of')} {data(g.cap_mb)}</div>
                  </div>
                  <button onClick={() => run(api(`/api/guests/${g.id}`, { blocked: !g.blocked }, 'PATCH'))}
                    className={cx('press h-9 rounded-full px-4 text-sm font-semibold cursor-pointer', g.blocked ? 'bg-stroke' : 'bg-hot/12 text-hot')}>
                    {t(g.blocked ? 'g.unblock' : 'g.block')}
                  </button>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-stroke">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ type: 'spring', bounce: 0, duration: 1.2 }}
                    className={cx('h-full rounded-full', pct > 85 ? 'bg-hot' : 'grad')} />
                </div>
                <div className="mt-1.5 text-end text-[11px] text-muted tabular-nums">{n(pct, 0)}٪</div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function TopUp({ me, run }: Props) {
  const { t, data, toman } = useApp()
  const [plans, setPlans] = useState<Plan[]>([])
  const [sel, setSel] = useState('gb30')
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<'idle' | 'paying' | 'done'>('idle')
  useEffect(() => { api<Plan[]>('/api/plans').then(setPlans).catch(() => {}) }, [])
  const plan = plans.find((p) => p.id === sel)
  const pay = async () => {
    setState('paying')
    setState((await run(api('/api/topup', { plan_id: sel }))) ? 'done' : 'idle')
  }
  const close = () => { setOpen(false); setTimeout(() => setState('idle'), 400) }
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-black">{t('t.title')}</h1>
      <p className="mt-2 text-muted">{t('t.sub')}</p>
      <div role="radiogroup" className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {plans.map((p) => (
          <button key={p.id} role="radio" aria-checked={sel === p.id} onClick={() => setSel(p.id)}
            className={cx('press relative rounded-[26px] p-px text-start cursor-pointer', sel === p.id ? 'grad shadow-[0_16px_40px_-16px_var(--glow)]' : '')}>
            <div className={cx('glass h-full rounded-[25px] p-5', sel === p.id && 'bg-solid border-transparent')}>
              {p.popular && <span className="absolute top-4 end-4 rounded-full grad px-2 py-0.5 text-[10px] font-bold text-white">{t('pr.popular')}</span>}
              <div className="text-2xl sm:text-3xl font-black">{data(p.mb)}</div>
              <div className="mt-6 font-bold tabular-nums">{toman(p.price)}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-a3"><Inf className="size-3.5" />{t('d.noexp')}</div>
              <AnimatePresence>{sel === p.id && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', bounce: 0.5, duration: 0.4 }}
                  className="absolute bottom-4 end-4 grid size-6 place-items-center rounded-full grad text-white"><Check className="size-3.5" /></motion.span>
              )}</AnimatePresence>
            </div>
          </button>
        ))}
      </div>
      <Button onClick={() => setOpen(true)} disabled={!plan} className="mt-6 h-14 w-full sm:w-auto sm:px-12">{t('next')}</Button>

      <Sheet open={open} onClose={close}>
        {plan && (state === 'done' ? (
          <div className="py-6 text-center">
            <motion.svg viewBox="0 0 52 52" className="mx-auto size-24">
              <motion.circle cx="26" cy="26" r="24" fill="none" stroke="var(--a3)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
              <motion.path d="M15 27l7 7 15-15" fill="none" stroke="var(--a3)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.45, duration: 0.4 }} />
            </motion.svg>
            <h2 className="mt-5 text-2xl font-black">{t('t.ok')}</h2>
            <p className="mt-2 text-muted">{t('t.added', { gb: data(plan.mb) })}</p>
            <Button onClick={close} className="mt-8 w-full">{t('done')}</Button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold">{t('t.summary')}</h2>
            <dl className="mt-5 divide-y divide-stroke rounded-2xl bg-stroke/50 px-4">
              {[[t('t.title'), data(plan.mb)], [t('t.after'), data(me.balance_mb + plan.mb)], [t('t.amount'), toman(plan.price)]].map(([k, v], i) => (
                <div key={k} className="flex items-center justify-between py-3.5">
                  <dt className="text-muted">{k}</dt><dd className={cx('tabular-nums', i === 2 ? 'text-lg font-black' : 'font-semibold')}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-center text-xs text-muted">{t('t.gateway')}</p>
            <div className="mt-4 flex gap-3">
              <Button variant="glass" onClick={close} className="flex-1">{t('cancel')}</Button>
              <Button onClick={pay} disabled={state === 'paying'} className="flex-[2]">{state === 'paying' ? <Spinner /> : `${t('t.pay')} ${toman(plan.price)}`}</Button>
            </div>
          </div>
        ))}
      </Sheet>
    </div>
  )
}

function Invite({ me, run }: Props) {
  const { t, n, data } = useApp()
  const [copied, setCopied] = useState(false)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const text = t('i.shareText', { code: me.invite_code })
  const copy = async () => {
    try { await navigator.clipboard.writeText(me.invite_code); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch {}
  }
  const share = () => (navigator.share ? navigator.share({ text }).catch(() => {}) : copy())
  const redeem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setBusy(true); await run(api('/api/invite/redeem', { code: code.trim() })); setBusy(false)
  }
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="relative overflow-hidden p-6 sm:p-10 lg:col-span-3">
        <div className="absolute -top-24 start-1/2 size-80 -translate-x-1/2 rounded-full grad opacity-25 blur-3xl" />
        <motion.div initial={{ rotate: -20, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
          className="relative grid size-16 place-items-center rounded-3xl grad text-white shadow-[0_16px_40px_-12px_var(--glow)]"><Gift className="size-8" /></motion.div>
        <h1 className="relative mt-6 text-2xl sm:text-3xl font-black">{t('i.title')}</h1>
        <p className="relative mt-3 text-muted leading-relaxed">{t('i.sub')}</p>
        <div className="relative mt-8 text-sm text-muted">{t('i.code')}</div>
        <div className="relative mt-2 flex flex-wrap items-center gap-3">
          <div dir="ltr" className="rounded-2xl border border-dashed border-a1/50 bg-a1/8 px-5 py-3 font-mono text-2xl font-black tracking-[.3em]">{me.invite_code}</div>
          <Button variant="glass" onClick={copy} className="h-12">{copied ? <Check className="size-4 text-a3" /> : <Copy className="size-4" />}{t(copied ? 'i.copied' : 'i.copy')}</Button>
          <Button onClick={share} className="h-12"><Share2 className="size-4" />{t('i.share')}</Button>
        </div>
        <p className="relative mt-6 text-xs text-muted">{t('i.cap')}</p>
      </Card>
      <div className="grid gap-4 lg:col-span-2">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5"><div className="text-sm text-muted">{t('i.count')}</div><div className="mt-2 text-3xl font-black">{n(me.invites, 0)}</div></Card>
          <Card className="p-5"><div className="text-sm text-muted">{t('i.earned')}</div><div className="mt-2 text-3xl font-black grad-text">{data(me.invites * 300)}</div></Card>
        </div>
        <Card className="p-6">
          {me.invited_by ? (
            <p className="flex items-center gap-2 font-medium text-a3"><Check className="size-5 shrink-0" />{t('i.applied')}</p>
          ) : (
            <form onSubmit={redeem}>
              <label htmlFor="inv" className="font-bold">{t('i.have')}</label>
              <div className="mt-4 flex gap-2">
                <input id="inv" dir="ltr" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={12} placeholder="A1B2C3"
                  className="h-12 min-w-0 flex-1 rounded-2xl border border-stroke bg-solid/70 px-4 font-mono tracking-widest outline-none focus:border-a2 focus:ring-4 focus:ring-a2/15" />
                <Button type="submit" disabled={busy || !code.trim()} className="h-12">{busy ? <Spinner /> : t('i.apply')}</Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}

function History({ txns }: { txns: Txn[] }) {
  const { t, data, toman, locale } = useApp()
  const fmt = new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })
  const icon = { device: Smartphone, topup: Wallet, invite: Gift, welcome: Sparkles }
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-black">{t('h.title')}</h1>
      <Card className="mt-6 divide-y divide-stroke overflow-hidden">
        {txns.map((x, i) => {
          const Icon = icon[x.kind]
          return (
            <motion.div key={x.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 10) * 0.04 }}
              className="flex items-center gap-4 p-4 sm:p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-a2/10 text-a2"><Icon className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{t(`txn.${x.kind}`, { gb: data(x.mb) })}</div>
                <div className="text-xs text-muted">{fmt.format(new Date(x.created_at * 1000))}</div>
              </div>
              <div className="text-end">
                <div className="font-bold text-a3 tabular-nums">+{data(x.mb)}</div>
                <div className="text-xs text-muted tabular-nums">{x.amount ? toman(x.amount) : t('h.free')}</div>
              </div>
            </motion.div>
          )
        })}
      </Card>
    </div>
  )
}
