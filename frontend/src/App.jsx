import { useEffect, useState } from "react";
import {
  getEmployees,
  createEmployee,
  deleteEmployee,
  getAttendance,
  markAttendance,
  getSummary
} from "./api";

// Empty form structure
const initialForm = {
  employee_id: "",
  full_name: "",
  email: "",
  department: ""
};

export default function App() {
  // ----------------------
  // State
  // ----------------------
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState({ employees: 0, attendance_records: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [attendanceStatus, setAttendanceStatus] = useState("Present");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");

  // ----------------------
  // Load data on page load
  // ----------------------
  useEffect(() => {
    loadDashboard();
  }, []);

  // ----------------------
  // Load attendance when employee changes
  // ----------------------
  useEffect(() => {
    if (selectedEmployee) {
      loadEmployeeAttendance(selectedEmployee);
    } else {
      setAttendanceRecords([]);
    }
  }, [selectedEmployee]);

  // ----------------------
  // API Functions
  // ----------------------
  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const employeesData = await getEmployees();
      const summaryData = await getSummary();

      setEmployees(employeesData);
      setSummary(summaryData);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function loadEmployeeAttendance(employeeId) {
    setAttendanceLoading(true);
    setAttendanceError("");

    try {
      const data = await getAttendance(employeeId);
      setAttendanceRecords(data.records || []);
    } catch (err) {
      setAttendanceError("Failed to load attendance");
    } finally {
      setAttendanceLoading(false);
    }
  }

  // ----------------------
  // Form Helpers
  // ----------------------
  function handleInputChange(field, value) {
    setForm((prev) => {
      return { ...prev, [field]: value };
    });
  }

  // ----------------------
  // Employees Actions
  // ----------------------
  async function handleAddEmployee(event) {
    event.preventDefault();
    setFormError("");

    if (
      !form.employee_id ||
      !form.full_name ||
      !form.email ||
      !form.department
    ) {
      setFormError("All fields are required");
      return;
    }

    setFormLoading(true);

    try {
      await createEmployee(form);
      setForm(initialForm);
      await loadDashboard();
    } catch (err) {
      setFormError("Failed to add employee");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteEmployee(employeeId) {
    const confirmed = window.confirm("Delete this employee?");
    if (!confirmed) return;

    try {
      await deleteEmployee(employeeId);

      if (selectedEmployee === employeeId) {
        setSelectedEmployee("");
      }

      await loadDashboard();
    } catch (err) {
      alert("Failed to delete employee");
    }
  }

  // ----------------------
  // Attendance Actions
  // ----------------------
  async function handleMarkAttendance(event) {
    event.preventDefault();

    if (!selectedEmployee) {
      setAttendanceError("Please select an employee first");
      return;
    }

    setAttendanceError("");

    try {
      await markAttendance({
        employee_id: selectedEmployee,
        date: attendanceDate,
        status: attendanceStatus
      });

      await loadEmployeeAttendance(selectedEmployee);
      await loadDashboard();
    } catch (err) {
      setAttendanceError("Failed to mark attendance");
    }
  }

  // ----------------------
  // UI
  // ----------------------
  return (
    <div className="page">
      <h1>HRMS Lite</h1>

      <p className="small">
        Employees: {summary.employees} | Attendance records:{" "}
        {summary.attendance_records}
      </p>

      {error && <p className="error">{error}</p>}

      {/* ---------------- Employees Section ---------------- */}
      <div className="section">
        <h2>Employees</h2>

        <form className="form" onSubmit={handleAddEmployee}>
          <input
            placeholder="Employee ID"
            value={form.employee_id}
            onChange={(e) =>
              handleInputChange("employee_id", e.target.value)
            }
          />

          <input
            placeholder="Full Name"
            value={form.full_name}
            onChange={(e) =>
              handleInputChange("full_name", e.target.value)
            }
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              handleInputChange("email", e.target.value)
            }
          />

          <input
            placeholder="Department"
            value={form.department}
            onChange={(e) =>
              handleInputChange("department", e.target.value)
            }
          />

          {formError && <p className="error">{formError}</p>}

          <button disabled={formLoading}>
            {formLoading ? "Adding..." : "Add Employee"}
          </button>
        </form>

        {loading ? (
          <p className="small">Loading employees...</p>
        ) : employees.length === 0 ? (
          <p className="small">No employees found.</p>
        ) : (
          <ul className="list">
            {employees.map((emp) => (
              <li key={emp.employee_id}>
                <div>
                  <strong>{emp.full_name}</strong>
                  <div className="small">
                    {emp.department} • {emp.email} • {emp.employee_id}
                  </div>
                </div>

                <button
                  className="danger"
                  onClick={() => handleDeleteEmployee(emp.employee_id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---------------- Attendance Section ---------------- */}
      <div className="section">
        <h2>Attendance</h2>

        <form className="form" onSubmit={handleMarkAttendance}>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.full_name} ({emp.employee_id})
              </option>
            ))}
          </select>

          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />

          <select
            value={attendanceStatus}
            onChange={(e) => setAttendanceStatus(e.target.value)}
          >
            <option>Present</option>
            <option>Absent</option>
          </select>

          {attendanceError && <p className="error">{attendanceError}</p>}

          <button>Mark Attendance</button>
        </form>

        {!selectedEmployee ? (
          <p className="small">Select an employee to view attendance.</p>
        ) : attendanceLoading ? (
          <p className="small">Loading attendance...</p>
        ) : attendanceRecords.length === 0 ? (
          <p className="small">No attendance records found.</p>
        ) : (
          <ul className="list">
            {attendanceRecords.map((rec, index) => (
              <li key={index}>
                <div>
                  <strong>{rec.date}</strong>
                  <div className="small">Status: {rec.status}</div>
                </div>

                <span
                  className={
                    rec.status === "Present" ? "tag ok" : "tag no"
                  }
                >
                  {rec.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
