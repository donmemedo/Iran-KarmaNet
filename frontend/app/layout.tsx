import type { Metadata, Viewport } from 'next'
import { Inter, Vazirmatn } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const vazir = Vazirmatn({ subsets: ['arabic', 'latin'], variable: '--font-vazir', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'کارمانت · KarmaNet — دیتای شما نمی‌سوزد',
  description: 'هات‌اسپات همراه با کیف پول دیتای بدون انقضا و پهنای‌باند اجتماعی. Pay-as-you-go hotspot with a data wallet that never expires.',
  applicationName: 'KarmaNet',
}
export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, viewportFit: 'cover',
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#f5f5f7' }, { media: '(prefers-color-scheme: dark)', color: '#000000' }],
}

// Runs before paint: no theme/locale flash.
const boot = `try{var s=localStorage,t=s.getItem('theme')||'system',l=s.getItem('locale')||'fa',d=document.documentElement;d.dataset.theme=t==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;d.lang=l;d.dir=l==='fa'?'rtl':'ltr';if(l!=='fa')d.classList.add('i18n-pending')}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={`${vazir.variable} ${inter.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: boot }} /></head>
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
