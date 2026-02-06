from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()

from .database import Base, engine, SessionLocal
from .models import Employee, Attendance
from .schemas import (
    EmployeeIn,
    Employee as EmployeeOut,
    AttendanceIn,
    Attendance as AttendanceOut,
    AttendanceList,
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(title="HRMS Lite API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# Database Dependency
# ------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------------
# Health Check
# ------------------------
@app.get("/api/health")
def health_check():
    return {"status": "ok"}


# ------------------------
# Employees APIs
# ------------------------
@app.post("/api/employees", response_model=EmployeeOut, status_code=201)
def create_employee(employee: EmployeeIn, db: Session = Depends(get_db)):

    # Check if employee already exists
    existing_employee = db.query(Employee).filter(
        (Employee.employee_id == employee.employee_id)
        | (Employee.email == employee.email)
    ).first()

    if existing_employee:
        raise HTTPException(
            status_code=409,
            detail="Employee ID or email already exists"
        )

    # Create new employee
    new_employee = Employee(
        employee_id=employee.employee_id.strip(),
        full_name=employee.full_name.strip(),
        email=employee.email.strip().lower(),
        department=employee.department.strip(),
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return new_employee


@app.get("/api/employees", response_model=list[EmployeeOut])
def get_all_employees(db: Session = Depends(get_db)):
    employees = db.query(Employee).order_by(Employee.created_at.desc()).all()
    return employees


@app.delete("/api/employees/{employee_id}", status_code=204)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):

    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    db.delete(employee)
    db.commit()

    return None


# ------------------------
# Attendance APIs
# ------------------------
@app.post("/api/attendance", response_model=AttendanceOut, status_code=201)
def mark_attendance(attendance: AttendanceIn, db: Session = Depends(get_db)):

    # Check employee exists
    employee = db.query(Employee).filter(
        Employee.employee_id == attendance.employee_id
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Check duplicate attendance
    existing_record = db.query(Attendance).filter(
        Attendance.employee_id == attendance.employee_id,
        Attendance.date == attendance.date,
    ).first()

    if existing_record:
        raise HTTPException(
            status_code=409,
            detail="Attendance already marked for this date"
        )

    # Create attendance record
    new_record = Attendance(
        employee_id=attendance.employee_id,
        date=attendance.date,
        status=attendance.status,
    )

    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return new_record


@app.get("/api/employees/{employee_id}/attendance", response_model=AttendanceList)
def get_employee_attendance(employee_id: str, db: Session = Depends(get_db)):

    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    records = db.query(Attendance).filter(
        Attendance.employee_id == employee_id
    ).order_by(Attendance.date.desc()).all()

    return {
        "employee_id": employee_id,
        "records": records
    }


# ------------------------
# Summary API
# ------------------------
@app.get("/api/summary")
def get_summary(db: Session = Depends(get_db)):
    total_employees = db.query(Employee).count()
    total_attendance = db.query(Attendance).count()

    return {
        "employees": total_employees,
        "attendance_records": total_attendance,
    }
