"""KarmaNet API — pay-as-you-go hotspot, non-expiring data wallet, social bandwidth."""
import os
import random
import re
import secrets
import sqlite3
import time
from contextlib import contextmanager
from datetime import date, timedelta

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB_PATH = os.getenv("DB_PATH", "karma.db")
DEMO_OTP = os.getenv("DEMO_OTP", "1") == "1"  # ponytail: returns OTP in response; wire an SMS provider before prod
INVITE_MB = 300
INVITE_MONTHLY_CAP = 10
DEVICE_START_MB = 10 * 1024

PLANS = [
    {"id": "gb1", "mb": 1024, "price": 50_000},
    {"id": "gb10", "mb": 10 * 1024, "price": 420_000},
    {"id": "gb30", "mb": 30 * 1024, "price": 1_150_000, "popular": True},
    {"id": "gb100", "mb": 100 * 1024, "price": 3_400_000},
]
PLAN_BY_ID = {p["id"]: p for p in PLANS}

SCHEMA = """
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, phone TEXT UNIQUE, name TEXT DEFAULT '',
  invite_code TEXT UNIQUE, invited_by INTEGER, balance_mb INTEGER DEFAULT 0, created_at REAL);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER);
CREATE TABLE IF NOT EXISTS otps(phone TEXT PRIMARY KEY, code TEXT, expires REAL, tries INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS devices(user_id INTEGER PRIMARY KEY, model TEXT, hotspot_on INTEGER DEFAULT 1,
  guest_cap_mb INTEGER DEFAULT 500, battery INTEGER, signal INTEGER);
CREATE TABLE IF NOT EXISTS guests(id INTEGER PRIMARY KEY, user_id INTEGER, device TEXT, used_mb INTEGER,
  cap_mb INTEGER, blocked INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS usage(user_id INTEGER, day TEXT, own_mb INTEGER, guest_mb INTEGER);
CREATE TABLE IF NOT EXISTS txns(id INTEGER PRIMARY KEY, user_id INTEGER, kind TEXT, ref TEXT, mb INTEGER,
  amount INTEGER DEFAULT 0, created_at REAL);
"""


@contextmanager
def db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    try:
        yield con
        con.commit()
    finally:
        con.close()


with db() as _c:
    _c.executescript(SCHEMA)

app = FastAPI(title="KarmaNet API")
app.add_middleware(CORSMiddleware, allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
                   allow_methods=["*"], allow_headers=["*"])


def add_txn(con, uid, kind, mb, amount=0, ref=""):
    con.execute("UPDATE users SET balance_mb = balance_mb + ? WHERE id=?", (mb, uid))
    con.execute("INSERT INTO txns(user_id,kind,ref,mb,amount,created_at) VALUES(?,?,?,?,?,?)",
                (uid, kind, ref, mb, amount, time.time()))


def seed_user(con, uid):
    """New account = device bundle with 10GB credit, plus demo guests and history."""
    rnd = random.Random(uid)
    add_txn(con, uid, "device", DEVICE_START_MB, 4_900_000, "k1")
    con.execute("INSERT INTO devices VALUES(?,?,?,?,?,?)", (uid, "Karma K1 · 4.5G", 1, 500, rnd.randint(55, 95), 4))
    for dev in ("iPhone 15", "Galaxy S24", "MacBook Air"):
        con.execute("INSERT INTO guests(user_id,device,used_mb,cap_mb) VALUES(?,?,?,?)",
                    (uid, dev, rnd.randint(40, 460), 500))
    today, used = date.today(), 0
    for i in range(13, -1, -1):
        own, guest = rnd.randint(40, 380), rnd.randint(0, 160)
        used += own + guest
        con.execute("INSERT INTO usage VALUES(?,?,?,?)", (uid, (today - timedelta(days=i)).isoformat(), own, guest))
    con.execute("UPDATE users SET balance_mb = balance_mb - ? WHERE id=?", (used, uid))


def user_id(authorization: str = Header("")) -> int:
    token = authorization.removeprefix("Bearer ").strip()
    with db() as con:
        row = con.execute("SELECT user_id FROM sessions WHERE token=?", (token,)).fetchone()
    if not row:
        raise HTTPException(401, "unauthorized")
    return row["user_id"]


class PhoneIn(BaseModel):
    phone: str = Field(pattern=r"^09\d{9}$")


class VerifyIn(PhoneIn):
    code: str = Field(pattern=r"^\d{5}$")


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/plans")
def plans():
    return PLANS


@app.post("/api/auth/otp")
def send_otp(body: PhoneIn):
    code = f"{secrets.randbelow(100000):05d}"
    with db() as con:
        con.execute("INSERT OR REPLACE INTO otps VALUES(?,?,?,0)", (body.phone, code, time.time() + 120))
    return {"sent": True, "ttl": 120, **({"dev_code": code} if DEMO_OTP else {})}


@app.post("/api/auth/verify")
def verify(body: VerifyIn):
    with db() as con:
        otp = con.execute("SELECT * FROM otps WHERE phone=?", (body.phone,)).fetchone()
        if not otp or otp["expires"] < time.time() or otp["tries"] >= 5:
            raise HTTPException(410, "otp_expired")
        if not secrets.compare_digest(otp["code"], body.code):
            con.execute("UPDATE otps SET tries = tries + 1 WHERE phone=?", (body.phone,))
            raise HTTPException(400, "otp_invalid")
        con.execute("DELETE FROM otps WHERE phone=?", (body.phone,))
        user = con.execute("SELECT id FROM users WHERE phone=?", (body.phone,)).fetchone()
        is_new = user is None
        if is_new:
            uid = con.execute("INSERT INTO users(phone,invite_code,created_at) VALUES(?,?,?)",
                              (body.phone, secrets.token_hex(3).upper(), time.time())).lastrowid
            seed_user(con, uid)
        else:
            uid = user["id"]
        token = secrets.token_urlsafe(32)
        con.execute("INSERT INTO sessions VALUES(?,?)", (token, uid))
    return {"token": token, "new": is_new}


@app.post("/api/auth/logout")
def logout(authorization: str = Header("")):
    with db() as con:
        con.execute("DELETE FROM sessions WHERE token=?", (authorization.removeprefix("Bearer ").strip(),))
    return {"ok": True}


@app.get("/api/me")
def me(uid: int = Depends(user_id)):
    with db() as con:
        u = dict(con.execute("SELECT id,phone,name,invite_code,invited_by,balance_mb FROM users WHERE id=?",
                             (uid,)).fetchone())
        u["device"] = dict(con.execute("SELECT * FROM devices WHERE user_id=?", (uid,)).fetchone())
        u["guests"] = [dict(r) for r in con.execute("SELECT * FROM guests WHERE user_id=? ORDER BY id", (uid,))]
        u["usage"] = [dict(r) for r in con.execute("SELECT day,own_mb,guest_mb FROM usage WHERE user_id=? "
                                                   "ORDER BY day DESC LIMIT 14", (uid,))][::-1]
        u["txns"] = [dict(r) for r in con.execute("SELECT * FROM txns WHERE user_id=? ORDER BY id DESC LIMIT 50",
                                                  (uid,))]
        u["invites"] = con.execute("SELECT COUNT(*) FROM txns WHERE user_id=? AND kind='invite'",
                                   (uid,)).fetchone()[0]
    return u


class TopUpIn(BaseModel):
    plan_id: str


@app.post("/api/topup")
def topup(body: TopUpIn, uid: int = Depends(user_id)):
    plan = PLAN_BY_ID.get(body.plan_id)
    if not plan:
        raise HTTPException(404, "plan_not_found")
    # ponytail: mock gateway, payment always succeeds; plug a PSP callback here before prod
    with db() as con:
        add_txn(con, uid, "topup", plan["mb"], plan["price"], plan["id"])
    return me(uid)


class DeviceIn(BaseModel):
    hotspot_on: bool | None = None
    guest_cap_mb: int | None = Field(None, ge=50, le=5000)


@app.patch("/api/device")
def update_device(body: DeviceIn, uid: int = Depends(user_id)):
    with db() as con:
        if body.hotspot_on is not None:
            con.execute("UPDATE devices SET hotspot_on=? WHERE user_id=?", (int(body.hotspot_on), uid))
        if body.guest_cap_mb is not None:
            con.execute("UPDATE devices SET guest_cap_mb=? WHERE user_id=?", (body.guest_cap_mb, uid))
            con.execute("UPDATE guests SET cap_mb=? WHERE user_id=?", (body.guest_cap_mb, uid))
    return me(uid)


class GuestIn(BaseModel):
    blocked: bool


@app.patch("/api/guests/{gid}")
def update_guest(gid: int, body: GuestIn, uid: int = Depends(user_id)):
    with db() as con:
        cur = con.execute("UPDATE guests SET blocked=? WHERE id=? AND user_id=?", (int(body.blocked), gid, uid))
    if not cur.rowcount:
        raise HTTPException(404, "guest_not_found")
    return me(uid)


class RedeemIn(BaseModel):
    code: str = Field(min_length=4, max_length=12)


@app.post("/api/invite/redeem")
def redeem(body: RedeemIn, uid: int = Depends(user_id)):
    with db() as con:
        owner = con.execute("SELECT id FROM users WHERE invite_code=?", (body.code.upper(),)).fetchone()
        if not owner:
            raise HTTPException(404, "invite_invalid")
        if owner["id"] == uid:
            raise HTTPException(400, "invite_self")
        if con.execute("SELECT invited_by FROM users WHERE id=?", (uid,)).fetchone()["invited_by"]:
            raise HTTPException(409, "invite_used")
        con.execute("UPDATE users SET invited_by=? WHERE id=?", (owner["id"], uid))
        add_txn(con, uid, "welcome", INVITE_MB, ref=body.code.upper())
        month_ago = time.time() - 30 * 86400
        earned = con.execute("SELECT COUNT(*) FROM txns WHERE user_id=? AND kind='invite' AND created_at>?",
                             (owner["id"], month_ago)).fetchone()[0]
        if earned < INVITE_MONTHLY_CAP:  # anti-abuse: owner reward is capped monthly
            add_txn(con, owner["id"], "invite", INVITE_MB)
    return me(uid)
