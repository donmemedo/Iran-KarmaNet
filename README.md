# KarmaNet · کارمانت

Pay-as-you-go 4.5G hotspot + non-expiring data wallet + social bandwidth (from `32_Karma.pdf` and the Iran business plan).

- `frontend/` Next.js 16 (static export) · Tailwind 4 · Motion · fa/en (RTL/LTR) · light/dark/auto
- `backend/` FastAPI · SQLite

## Run
```bash
docker compose up --build        # app → http://localhost:3032 · API docs → http://localhost:8032/docs
```
Log in with any `09xxxxxxxxx` number; in demo mode the verification code is shown on screen.

## Dev
```bash
cd backend && python -m venv .venv && .venv/bin/pip install -r requirements.txt && .venv/bin/uvicorn app.main:app --port 8032
cd frontend && npm i && NEXT_PUBLIC_API_URL=http://localhost:8032 npm run dev   # http://localhost:3032
cd backend && .venv/bin/python test_main.py   # API smoke check
```

The frontend is a static export, so the same `out/` build can be wrapped for PWA / Capacitor (APK, IPA) later.
