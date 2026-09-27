'use client'
import { motion } from 'motion/react'
import { ArrowLeft, Ban, Building2, Check, Flame, Gift, Infinity as Inf, Sparkles, Users, Wallet, Wifi } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useApp } from '@/components/providers'
import { TopBar } from '@/components/topbar'
import { Aurora, Button, Card, CountUp, Logo, Orb, Reveal, Segmented, ThemeSwitch, cx } from '@/components/ui'
import { api, getToken, type Plan } from '@/lib/api'

const OP_PER_GB = 35_000 // avg. price of an expiring operator pack, Toman/GB
const KARMA_PER_GB = 42_000 // KarmaNet 10GB pack rate

const Arrow = () => <ArrowLeft className="size-4 ltr:-scale-x-100" />

export default function Landing() {
  const { t } = useApp()
  return (
    <>
      <Aurora />
      <TopBar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <Hero />
        <Features />
        <Calculator />
        <Device />
        <Pricing />
        <Business />
        <Reveal className="py-24 sm:py-32 text-center">
          <h2 className="text-4xl sm:text-6xl font-black">{t('end.title')}</h2>
          <Button href="/login" className="mt-10 h-14 px-9 text-lg">{t('nav.start')} <Arrow /></Button>
        </Reveal>
      </main>
      <footer className="border-t border-stroke">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 sm:px-6 py-8 text-sm text-muted">
          <Logo className="size-6" /> {t('foot')}
          <div className="ms-auto"><ThemeSwitch /></div>
        </div>
      </footer>
    </>
  )
}

function Hero() {
  const { t, data } = useApp()
  return (
    <section className="grid items-center gap-10 pt-10 pb-20 lg:grid-cols-[1.1fr_1fr] lg:pt-20 lg:pb-28">
      <div className="text-center lg:text-start">
        <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-muted">
          <Sparkles className="size-4 text-a1" />{t('hero.badge')}
        </motion.span>
        <motion.h1 initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ type: 'spring', bounce: 0, duration: 1.1, delay: 0.1 }}
          className="mt-6 text-[clamp(3rem,11vw,6.5rem)] font-black leading-[1.05]">
          {t('hero.t1')}<br /><span className="grad-text">{t('hero.t2')}</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.8 }}
          className="mx-auto lg:mx-0 mt-6 max-w-xl text-lg sm:text-xl leading-relaxed text-muted">{t('hero.sub')}</motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-9 flex flex-wrap justify-center lg:justify-start gap-3">
          <Button href="/login" className="h-14 px-8 text-base">{t('nav.start')} <Arrow /></Button>
          <Button href="#calc" variant="glass" className="h-14 px-8 text-base">{t('hero.cta2')}</Button>
        </motion.div>
        <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-muted">
          {(['hero.s1', 'hero.s2', 'hero.s3'] as const).map((k) => (
            <span key={k} className="flex items-center gap-1.5"><Check className="size-4 text-a3" />{t(k)}</span>
          ))}
        </div>
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.2, duration: 1.2, delay: 0.2 }} className="relative">
        <Orb size={380} guests={4} />
        <Card className="float absolute top-[6%] start-0 sm:start-[4%] flex items-center gap-3 rounded-2xl px-4 py-3">
          <span className="grid size-9 place-items-center rounded-xl bg-a3/15"><Gift className="size-5 text-a3" /></span>
          <span className="text-sm font-semibold">{t('hero.gift')}</span>
        </Card>
        <Card className="float absolute bottom-[8%] end-0 sm:end-[2%] rounded-2xl px-4 py-3 [animation-delay:-3s]">
          <div className="flex items-center gap-2 text-xs text-muted"><Inf className="size-4 text-a1" />{t('d.noexp')}</div>
          <div className="mt-0.5 text-xl font-bold tabular-nums">{data(24.5 * 1024)}</div>
        </Card>
        <Card className="float absolute bottom-[2%] start-[12%] hidden sm:flex items-center gap-2 rounded-full px-3 py-2 text-xs [animation-delay:-1.5s]">
          <span className="size-2 rounded-full bg-a3 shadow-[0_0_10px_var(--a3)]" />{t('hero.guest')}
        </Card>
      </motion.div>
    </section>
  )
}

function Features() {
  const { t, n, data } = useApp()
  return (
    <section id="features" className="scroll-mt-20 py-16">
      <Reveal><h2 className="mb-10 max-w-2xl text-3xl sm:text-5xl font-black">{t('f.title')}</h2></Reveal>
      <div className="grid gap-4 md:grid-cols-3">
        <Reveal className="md:col-span-2">
          <Card className="group relative h-full overflow-hidden p-8 sm:p-10">
            <Inf strokeWidth={1.2} className="absolute -bottom-10 end-[-2rem] size-72 text-a1/15 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6" />
            <Wallet className="size-8 text-a1" />
            <h3 className="mt-5 text-2xl sm:text-3xl font-bold">{t('f1.t')}</h3>
            <p className="mt-3 max-w-md text-muted leading-relaxed">{t('f1.d')}</p>
          </Card>
        </Reveal>
        <Reveal delay={0.08}>
          <Card className="h-full p-8">
            <div className="text-6xl font-black grad-text">{n(0)}</div>
            <h3 className="mt-4 text-xl font-bold">{t('f2.t')}</h3>
            <p className="mt-2 text-muted leading-relaxed">{t('f2.d')}</p>
          </Card>
        </Reveal>
        <Reveal>
          <Card className="h-full p-8">
            <div className="flex -space-x-3 rtl:space-x-reverse">
              {['#6d4aff', '#0a84ff', '#0fbf88', '#ff9f0a'].map((c, i) => (
                <span key={c} className="grid size-11 place-items-center rounded-full border-2 border-solid text-white font-bold" style={{ background: c }}>
                  {['S', 'R', 'M', 'A'][i]}
                </span>
              ))}
              <span className="ms-4 self-center rounded-full bg-a3/15 px-3 py-1 text-sm font-bold text-a3">+{data(300)}</span>
            </div>
            <h3 className="mt-6 text-xl font-bold">{t('f3.t')}</h3>
            <p className="mt-2 text-muted leading-relaxed">{t('f3.d')}</p>
          </Card>
        </Reveal>
        <Reveal delay={0.08} className="md:col-span-2">
          <Card className="grid h-full gap-8 p-8 sm:grid-cols-2 sm:items-center">
            <div>
              <Users className="size-8 text-a2" />
              <h3 className="mt-5 text-2xl font-bold">{t('f4.t')}</h3>
              <p className="mt-2 text-muted leading-relaxed">{t('f4.d')}</p>
            </div>
            <div className="space-y-3">
              {[['iPhone 15', 72], ['Galaxy S24', 38], ['MacBook Air', 100]].map(([name, p], i) => (
                <div key={name} className="rounded-2xl bg-stroke/60 p-3">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span dir="ltr">{name}</span>{i === 2 && <Ban className="size-4 text-hot" />}
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stroke">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${p}%` }} viewport={{ once: true }}
                      transition={{ type: 'spring', bounce: 0, duration: 1.4, delay: 0.2 + i * 0.1 }}
                      className={cx('h-full rounded-full', i === 2 ? 'bg-hot' : 'grad')} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  )
}

function Slider({ label, value, min, max, onChange, fmt }:
  { label: string; value: number; min: number; max: number; onChange: (v: number) => void; fmt: (v: number) => string }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between"><span className="text-muted">{label}</span><b className="text-lg tabular-nums">{fmt(value)}</b></div>
      <input type="range" className="slider mt-4" min={min} max={max} value={value} onChange={(e) => onChange(+e.target.value)}
        style={{ '--p': `${((value - min) / (max - min)) * 100}%` } as React.CSSProperties} />
    </label>
  )
}

function Calculator() {
  const { t, data, toman } = useApp()
  const [use, setUse] = useState(8)
  const [pack, setPack] = useState(20)
  const p = Math.max(pack, use)
  const burned = 12 * (p - use)
  const op = 12 * p * OP_PER_GB
  const karma = 12 * use * KARMA_PER_GB
  const saved = Math.max(0, op - karma)
  const gb = (v: number) => data(v * 1024)
  return (
    <section id="calc" className="scroll-mt-20 py-16">
      <Reveal>
        <Card className="grid gap-10 p-6 sm:p-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black">{t('calc.title')}</h2>
            <p className="mt-3 text-muted leading-relaxed">{t('calc.sub')}</p>
            <div className="mt-10 space-y-8">
              <Slider label={t('calc.use')} value={use} min={1} max={60} onChange={setUse} fmt={gb} />
              <Slider label={t('calc.pack')} value={p} min={5} max={100} onChange={(v) => { setPack(v); if (v < use) setUse(v) }} fmt={gb} />
            </div>
            <p className="mt-8 text-xs text-muted">{t('calc.note')}</p>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <div className="rounded-3xl bg-hot/10 p-6">
              <div className="flex items-center gap-2 text-muted"><Flame className="flame size-5 text-hot" />{t('calc.burned')}</div>
              <div className="mt-1 text-4xl sm:text-5xl font-black burn-text"><CountUp value={burned} format={(v) => gb(Math.round(v))} /></div>
            </div>
            <div className="rounded-3xl bg-a3/10 p-6">
              <div className="text-muted">{t('calc.saved')}</div>
              <div className="mt-1 text-4xl sm:text-5xl font-black grad-text">
                {saved ? <CountUp value={saved} format={(v) => toman(Math.round(v / 1000) * 1000)} /> : t('calc.even')}
              </div>
              <div className="mt-6 space-y-3 text-sm">
                {[[t('calc.op'), op, 'bg-hot'], [t('brand'), karma, 'grad']].map(([label, v, c]) => (
                  <div key={label as string}>
                    <div className="flex justify-between text-muted"><span>{label}</span><span className="tabular-nums">{toman(v as number)}</span></div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stroke">
                      <motion.div animate={{ width: `${((v as number) / Math.max(op, karma)) * 100}%` }} className={cx('h-full rounded-full', c as string)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </Reveal>
    </section>
  )
}

function Device() {
  const { t } = useApp()
  const [mode, setMode] = useState<'buy' | 'rent'>('buy')
  return (
    <section className="py-16">
      <Reveal>
        <Card className="grid overflow-hidden lg:grid-cols-2">
          <div className="relative grid min-h-72 place-items-center bg-[radial-gradient(circle_at_50%_60%,color-mix(in_oklab,var(--a2)_30%,transparent),transparent_65%)] p-10">
            <motion.div whileHover={{ rotate: -4, scale: 1.04 }} transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
              className="relative h-44 w-72 rounded-[36px] bg-gradient-to-br from-[#2a2a33] to-[#0c0c10] shadow-[0_30px_80px_-20px_var(--glow),inset_0_1px_0_rgb(255_255_255/.15)]">
              <div className="absolute inset-x-8 top-8 flex items-center justify-between text-white/80">
                <Logo className="size-9" /><span className="text-xs font-semibold tracking-widest" dir="ltr">K1 · 4.5G</span>
              </div>
              <div className="absolute bottom-8 start-8 flex items-end gap-1" dir="ltr">
                {[8, 13, 18, 24].map((h, i) => <span key={h} className="w-2 rounded-sm bg-a3 animate-pulse" style={{ height: h, animationDelay: `${i * 0.2}s` }} />)}
              </div>
              <Wifi className="absolute bottom-7 end-8 size-6 text-a2" />
            </motion.div>
          </div>
          <div className="p-8 sm:p-10">
            <h2 className="text-3xl font-black">{t('dev.title')}</h2>
            <p className="mt-3 text-muted leading-relaxed">{t('dev.sub')}</p>
            <Segmented className="mt-8 max-w-xs" value={mode} onChange={setMode}
              options={[{ value: 'buy', label: t('dev.buy') }, { value: 'rent', label: t('dev.rent') }]} />
            <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <div className="text-4xl font-black">{t(mode === 'buy' ? 'dev.buyPrice' : 'dev.rentPrice')}</div>
              <div className="mt-1 text-muted">{t(mode === 'buy' ? 'dev.buyNote' : 'dev.rentNote')}</div>
            </motion.div>
            <ul className="mt-6 space-y-2">
              {(['dev.p1', 'dev.p2', 'dev.p3'] as const).map((k) => <li key={k} className="flex items-center gap-2"><Check className="size-4 text-a3" />{t(k)}</li>)}
            </ul>
            <Button href="/login" className="mt-8">{t('nav.start')} <Arrow /></Button>
          </div>
        </Card>
      </Reveal>
    </section>
  )
}

function Pricing() {
  const { t, data, toman } = useApp()
  const [plans, setPlans] = useState<Plan[]>([])
  const [href, setHref] = useState('/login')
  useEffect(() => {
    api<Plan[]>('/api/plans').then(setPlans).catch(() => {})
    if (getToken()) setHref('/dashboard#topup')
  }, [])
  return (
    <section id="pricing" className="scroll-mt-20 py-16">
      <Reveal className="text-center">
        <h2 className="text-3xl sm:text-5xl font-black">{t('pr.title')}</h2>
        <p className="mt-3 text-muted">{t('pr.sub')}</p>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(plans.length ? plans : Array.from({ length: 4 }, () => null)).map((p, i) => (
          <Reveal key={p?.id ?? i} delay={i * 0.06}>
            {p ? (
              <div className={cx('h-full rounded-[30px] p-px', p.popular ? 'grad shadow-[0_20px_60px_-20px_var(--glow)]' : 'bg-transparent')}>
                <Card className={cx('relative flex h-full flex-col p-7', p.popular && 'bg-solid! border-transparent')}>
                  {p.popular && <span className="absolute top-5 end-5 rounded-full grad px-3 py-1 text-xs font-bold text-white">{t('pr.popular')}</span>}
                  <div className="text-4xl font-black">{data(p.mb)}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-a3"><Inf className="size-4" />{t('d.noexp')}</div>
                  <div className="mt-8 text-2xl font-bold tabular-nums">{toman(p.price)}</div>
                  <div className="text-sm text-muted">{toman(Math.round(p.price / (p.mb / 1024)))} {t('pr.perGb')}</div>
                  <Button href={href} variant={p.popular ? 'primary' : 'glass'} className="mt-8 w-full">{t('pr.buy')}</Button>
                </Card>
              </div>
            ) : <Card className="h-72 animate-pulse" />}
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Business() {
  const { t } = useApp()
  return (
    <section id="business" className="scroll-mt-20 py-16">
      <Reveal>
        <Card className="relative overflow-hidden p-8 sm:p-12">
          <div className="absolute -top-24 end-[-6rem] size-80 rounded-full grad opacity-25 blur-3xl" />
          <Building2 className="size-10 text-a2" />
          <h2 className="mt-5 max-w-2xl text-3xl sm:text-4xl font-black">{t('biz.title')}</h2>
          <p className="mt-3 max-w-2xl text-muted leading-relaxed">{t('biz.sub')}</p>
          <p className="mt-6 font-semibold">{t('biz.price')}</p>
          <Button href="mailto:sales@karmanet.ir" variant="glass" className="mt-8">{t('biz.cta')} <Arrow /></Button>
        </Card>
      </Reveal>
    </section>
  )
}
