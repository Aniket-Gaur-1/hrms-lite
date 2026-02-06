from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class EmployeeIn(BaseModel):
    employee_id: str = Field(..., min_length=2, max_length=50)
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    department: str = Field(..., min_length=2, max_length=80)


class Employee(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class AttendanceIn(BaseModel):
    employee_id: str = Field(..., min_length=2, max_length=50)
    date: date
    status: str = Field(..., pattern="^(Present|Absent)$")


class Attendance(BaseModel):
    employee_id: str
    date: date
    status: str
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class AttendanceList(BaseModel):
    employee_id: str
    records: List[Attendance]
