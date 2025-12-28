from fastapi import FastAPI
from database import db
from socketio_instance import sio
import socketio

app = FastAPI()

sio_app = socketio.ASGIApp(sio, other_asgi_app=app)

@app.get("/")
async def root():
    return {"status": "Backend running"}

@app.get("/admin/settings")
async def get_settings():
    settings = await db.settings.find_one({"_id": "global"})
    if not settings:
        settings = {"_id": "global", "psVisible": False}
        await db.settings.insert_one(settings)
    return settings

@app.post("/admin/settings/ps-visibility")
async def set_ps_visibility(visible: bool):
    await db.settings.update_one(
        {"_id": "global"},
        {"$set": {"psVisible": visible}},
        upsert=True
    )

    # 🔥 real-time broadcast
    await sio.emit("PS_VISIBILITY_UPDATED", {"psVisible": visible})
    return {"psVisible": visible}
@app.get("/admin/problem-statements")
async def get_problem_statements():
    ps_list = []
    async for ps in db.problem_statements.find():
        ps["_id"] = str(ps["_id"])  # convert ObjectId to string
        ps_list.append(ps)
    return ps_list
@app.post("/admin/problem-statements")
async def add_problem_statement(ps: dict):
    await db.problem_statements.insert_one({
        "id": ps["id"],
        "title": ps["title"],
        "track": ps.get("track", ""),
        "visible": True,
        "selections": 0,
        "teams": []
    })
    return {"status": "added"}
