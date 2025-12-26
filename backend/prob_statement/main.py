from fastapi import FastAPI, Depends, HTTPException, Header, WebSocket
from sqlalchemy.orm import Session
import secrets

from database import SessionLocal, engine
import models, schemas

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------- AUTH --------------------

def get_current_team(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")

    token = authorization.replace("Bearer ", "")
    team = db.query(models.Team).filter(models.Team.api_key == token).first()

    if not team:
        raise HTTPException(status_code=401, detail="Invalid API key")

    return team

def admin_auth(x_admin_key: str = Header(...)):
    if x_admin_key != "SECRET_ADMIN_KEY":
        raise HTTPException(status_code=403, detail="Unauthorized")

# -------------------- WEBSOCKET --------------------

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for ws in self.active_connections:
            await ws.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/problems")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        manager.disconnect(websocket)


@app.get("/")
def root():
    return {"status": "Backend running"}

# -------- TEAM --------

@app.post("/team/create")
def create_team(team_name: str, db: Session = Depends(get_db)):
    api_key = secrets.token_hex(16)
    team = models.Team(team_name=team_name, api_key=api_key)
    db.add(team)
    db.commit()
    return {"api_key": api_key}

# -------- PROBLEMS --------

@app.get("/problem-statements")
def get_problem_statements(db: Session = Depends(get_db)):
    return db.query(models.ProblemStatement).all()

@app.post("/select-problem")
async def select_problem(
    data: schemas.SelectProblemRequest,
    team: models.Team = Depends(get_current_team),
    db: Session = Depends(get_db)
):
    
    if team.problem_statement_id:
        raise HTTPException(status_code=400, detail="Team already selected")

   
    problem = db.query(models.ProblemStatement).filter(
        models.ProblemStatement.id == data.problem_statement_id,
        models.ProblemStatement.is_locked == False
    ).first()

    if not problem or problem.selected_teams >= problem.max_teams:
        raise HTTPException(status_code=400, detail="Problem full or locked")

    
    team.problem_statement_id = problem.id
    problem.selected_teams += 1

    if problem.selected_teams >= problem.max_teams:
        problem.is_locked = True

    db.commit()

    # Real-time update
    await manager.broadcast({
        "problem_id": problem.id,
        "selected_teams": problem.selected_teams,
        "is_locked": problem.is_locked
    })

    return {
        "message": "Problem selected successfully",
        "problem_id": problem.id,
        "selected_teams": problem.selected_teams,
        "is_locked": problem.is_locked
    }

# -------- ADMIN --------

@app.post("/admin/problem")
def create_problem(
    data: schemas.CreateProblemRequest,
    _: None = Depends(admin_auth),
    db: Session = Depends(get_db)
):
    problem = models.ProblemStatement(
        title=data.title,
        description=data.description,
        max_teams=data.max_teams
    )
    db.add(problem)
    db.commit()
    return {"message": "Problem statement created"}
