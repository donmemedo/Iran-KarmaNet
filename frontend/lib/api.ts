const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

const store = {
  get: (k: string) => { try { return localStorage.getItem(k) } catch { return null } },
  set: (k: string, v: string | null) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v) } catch {} },
}
export { store }
export const getToken = () => store.get('token')
export const setToken = (t: string | null) => store.set('token', t)

export class ApiError extends Error {}

export async function api<T = any>(path: string, body?: unknown, method = body ? 'POST' : 'GET'): Promise<T> {
  const token = getToken()
  let res: Response
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('network')
  }
  const data = await res.json().catch(() => ({}))
  if (res.status === 401) setToken(null)
  if (!res.ok) throw new ApiError(typeof data.detail === 'string' ? data.detail : 'network')
  return data
}

export type Plan = { id: string; mb: number; price: number; popular?: boolean }
export type Guest = { id: number; device: string; used_mb: number; cap_mb: number; blocked: number }
export type Txn = { id: number; kind: 'device' | 'topup' | 'invite' | 'welcome'; ref: string; mb: number; amount: number; created_at: number }
export type Me = {
  phone: string; invite_code: string; invited_by: number | null; balance_mb: number; invites: number
  device: { model: string; hotspot_on: number; guest_cap_mb: number; battery: number; signal: number }
  guests: Guest[]; usage: { day: string; own_mb: number; guest_mb: number }[]; txns: Txn[]
}
