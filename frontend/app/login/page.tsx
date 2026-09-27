'use client'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, MessageSquareText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/components/providers'
import { TopBar } from '@/components/topbar'
import { Aurora, Button, Card, Logo, Spinner } from '@/components/ui'
import { ApiError, api, setToken } from '@/lib/api'
import { type Key, toAscii } from '@/lib/i18n'

export default function Login() {
  const { t, n } = useApp()
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [demo, setDemo] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [left, setLeft] = useState(0)
  const codeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!left) return
    const id = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(id)
  }, [left])

  const fail = (e: unknown) => setErr(`err.${e instanceof ApiError ? e.message : 'network'}`)

  async function sendCode() {
    if (!phone) return setErr('err.empty')
    if (!/^09\d{9}$/.test(phone)) return setErr('err.phone')
    setBusy(true); setErr('')
    try {
      const r = await api<{ dev_code?: string; ttl: number }>('/api/auth/otp', { phone })
      setDemo(r.dev_code ?? ''); setLeft(60); setCode(''); setStep('code')
      setTimeout(() => codeRef.current?.focus(), 350)
    } catch (e) { fail(e) } finally { setBusy(false) }
  }

  async function verify(c = code) {
    if (c.length !== 5) return setErr('err.otp_invalid')
    setBusy(true); setErr('')
    try {
      const r = await api<{ token: string }>('/api/auth/verify', { phone, code: c })
      setToken(r.token)
      router.replace('/dashboard')
    } catch (e) { fail(e); setCode(''); setBusy(false) }
  }

  const errText = err && (t(err as Key) || t('err.network'))

  return (
    <>
      <Aurora />
      <TopBar links={false} />
      <main className="grid min-h-[calc(100dvh-4rem)] place-items-center px-4 pb-16">
        <Card className="w-full max-w-[420px] overflow-hidden p-7 sm:p-9">
          <div className="grid size-14 place-items-center rounded-2xl shadow-[0_12px_40px_-10px_var(--glow)]"><Logo className="size-14" /></div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.form key={step} onSubmit={(e) => { e.preventDefault(); step === 'phone' ? sendCode() : verify() }}
              initial={{ opacity: 0, x: step === 'code' ? 40 : -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: step === 'code' ? -40 : 40 }}
              className="mt-6" noValidate>
              {step === 'phone' ? (
                <>
                  <h1 className="text-2xl sm:text-3xl font-black">{t('login.title')}</h1>
                  <p className="mt-2 text-muted leading-relaxed">{t('login.sub')}</p>
                  <label className="mt-8 block text-sm font-medium" htmlFor="phone">{t('login.phone')}</label>
                  <input id="phone" dir="ltr" inputMode="numeric" autoComplete="tel" placeholder="09123456789" maxLength={11} autoFocus
                    value={phone} onChange={(e) => { setPhone(toAscii(e.target.value).replace(/\D/g, '')); setErr('') }}
                    aria-invalid={!!err} aria-describedby="err"
                    className="mt-2 h-14 w-full rounded-2xl border border-stroke bg-solid/70 px-4 text-center text-xl tracking-[.2em] tabular-nums outline-none transition focus:border-a2 focus:ring-4 focus:ring-a2/15 aria-[invalid=true]:border-hot" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl sm:text-3xl font-black">{t('login.codeTitle')}</h1>
                  <p className="mt-2 text-muted leading-relaxed">{t('login.codeSub', { phone: `\u2068${phone}\u2069` })}</p>
                  <OtpInput inputRef={codeRef} value={code} invalid={!!err}
                    onChange={(v) => { setCode(v); setErr(''); if (v.length === 5) verify(v) }} />
                  {demo && (
                    <button type="button" onClick={() => { setCode(demo); verify(demo) }}
                      className="press mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-a3/12 py-3 text-sm font-semibold text-a3 cursor-pointer">
                      <MessageSquareText className="size-4" />{t('login.demo', { code: [...demo].map((d) => n(+d, 0)).join('') })}
                    </button>
                  )}
                </>
              )}
              <p id="err" role="alert" className="mt-3 min-h-5 text-sm text-hot">{errText}</p>
              <Button type="submit" disabled={busy} className="mt-3 w-full h-14 text-base">
                {busy ? <Spinner /> : <>{t(step === 'phone' ? 'login.send' : 'login.verify')}<ArrowLeft className="size-4 ltr:-scale-x-100" /></>}
              </Button>
              {step === 'code' && (
                <div className="mt-4 flex items-center justify-between text-sm">
                  <button type="button" onClick={() => { setStep('phone'); setErr('') }} className="press text-a2 font-medium cursor-pointer">{t('login.edit')}</button>
                  <button type="button" disabled={left > 0} onClick={sendCode}
                    className="press text-a2 font-medium disabled:text-muted cursor-pointer disabled:cursor-default">
                    {left ? t('login.resendIn', { s: n(left, 0) }) : t('login.resend')}
                  </button>
                </div>
              )}
            </motion.form>
          </AnimatePresence>
          <p className="mt-8 text-center text-xs leading-relaxed text-muted">{t('login.terms')}</p>
        </Card>
      </main>
    </>
  )
}

/** One hidden input drives five visual cells — keeps paste, autofill (one-time-code) and IME working. */
function OtpInput({ value, onChange, invalid, inputRef }:
  { value: string; onChange: (v: string) => void; invalid: boolean; inputRef: React.RefObject<HTMLInputElement | null> }) {
  const { n } = useApp()
  return (
    <label className="relative mt-8 flex justify-between gap-2" dir="ltr">
      <input ref={inputRef} value={value} inputMode="numeric" autoComplete="one-time-code" maxLength={5} aria-label="OTP"
        onChange={(e) => onChange(toAscii(e.target.value).replace(/\D/g, '').slice(0, 5))}
        className="peer absolute inset-0 opacity-0 caret-transparent" />
      {Array.from({ length: 5 }, (_, i) => (
        <motion.span key={i} animate={invalid ? { x: [0, -8, 8, -5, 5, 0] } : { scale: value[i] ? [1.12, 1] : 1 }}
          transition={{ duration: 0.35 }}
          className={`grid h-16 flex-1 place-items-center rounded-2xl border bg-solid/70 text-2xl font-bold tabular-nums transition-colors
            ${invalid ? 'border-hot' : i === value.length ? 'border-a2 ring-4 ring-a2/15 peer-focus:border-a2' : 'border-stroke'}`}>
          {value[i] ? n(+value[i], 0) : ''}
        </motion.span>
      ))}
    </label>
  )
}
