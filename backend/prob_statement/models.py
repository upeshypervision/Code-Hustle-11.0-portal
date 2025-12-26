from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from database import Base

class ProblemStatement(Base):
    __tablename__ = "problem_statements"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(String)
    max_teams = Column(Integer)
    selected_teams = Column(Integer, default=0)
    is_locked = Column(Boolean, default=False)

class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True)
    selection_deadline = Column(DateTime)


class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True)
    team_name = Column(String, nullable=False)
    api_key = Column(String, unique=True, nullable=False, index=True)
    problem_statement_id = Column(Integer, ForeignKey("problem_statements.id"))
