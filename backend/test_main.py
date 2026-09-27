"""Smoke check: python test_main.py"""
import os, tempfile
os.environ["DB_PATH"] = tempfile.mktemp(suffix=".db")
from fastapi.testclient import TestClient
from app.main import app

c = TestClient(app)

def login(phone):
    code = c.post("/api/auth/otp", json={"phone": phone}).json()["dev_code"]
    assert c.post("/api/auth/verify", json={"phone": phone, "code": "00000" if code != "00000" else "11111"}).status_code == 400
    r = c.post("/api/auth/verify", json={"phone": phone, "code": code}).json()
    return {"Authorization": f"Bearer {r['token']}"}

a, b = login("09120000001"), login("09120000002")
me_a = c.get("/api/me", headers=a).json()
bal_a, bal_b = me_a["balance_mb"], c.get("/api/me", headers=b).json()["balance_mb"]
assert 0 < bal_a < 10240 and len(me_a["guests"]) == 3 and len(me_a["usage"]) == 14
assert c.post("/api/auth/otp", json={"phone": "123"}).status_code == 422
assert c.get("/api/me").status_code == 401
assert c.post("/api/topup", json={"plan_id": "gb10"}, headers=a).json()["balance_mb"] == bal_a + 10240
assert c.post("/api/invite/redeem", json={"code": me_a["invite_code"]}, headers=a).status_code == 400
assert c.post("/api/invite/redeem", json={"code": me_a["invite_code"]}, headers=b).json()["balance_mb"] == bal_b + 300
assert c.post("/api/invite/redeem", json={"code": me_a["invite_code"]}, headers=b).status_code == 409
assert c.get("/api/me", headers=a).json()["balance_mb"] == bal_a + 10240 + 300
g = me_a["guests"][0]["id"]
assert c.patch(f"/api/guests/{g}", json={"blocked": True}, headers=a).json()["guests"][0]["blocked"] == 1
assert c.patch(f"/api/guests/{g}", json={"blocked": True}, headers=b).status_code == 404
assert c.patch("/api/device", json={"hotspot_on": False, "guest_cap_mb": 800}, headers=a).json()["device"]["hotspot_on"] == 0
print("ok")
