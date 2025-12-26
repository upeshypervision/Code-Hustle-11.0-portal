from pydantic import BaseModel

class SelectProblemRequest(BaseModel):
    problem_statement_id: int
class CreateProblemRequest(BaseModel):
    title: str
    description: str | None = None
    max_teams: int
