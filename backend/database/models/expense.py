from sqlalchemy import Column, Integer #type: ignore

from database.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)