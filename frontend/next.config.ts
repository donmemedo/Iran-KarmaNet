import type { NextConfig } from 'next'

// Static export: served by nginx in Docker, and reusable as-is for PWA / Capacitor (APK, IPA) later.
const config: NextConfig = { output: 'export', images: { unoptimized: true }, trailingSlash: true }
export default config
