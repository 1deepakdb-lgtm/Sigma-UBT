import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./student.css";

const emptyStudent = {
  name: "",
  username: "",
  password: "",
  phone: "",
  batch: "",
  status: "Active",
};

function Students() {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState(emptyStudent);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    try {
      const saved =
        localStorage.getItem("sigmaStudents");

      if (saved) {
        const data = JSON.parse(saved);

        if (Array.isArray(data)) {
          setStudents(data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveStudents = (data) => {
    localStorage.setItem(
      "sigmaStudents",
      JSON.stringify(data)
    );

    setStudents(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyStudent);
    setShowForm(true);
  };

  const openEdit = (student) => {
    setEditingId(student.id);

    setForm({
      name: student.name || "",
      username: student.username || "",
      password: student.password || "",
      phone: student.phone || "",
      batch: student.batch || "",
      status: student.status || "Active",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyStudent);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter student name.");
      return;
    }

    if (!form.username.trim()) {
      alert("Please enter username.");
      return;
    }

    if (!form.password.trim()) {
      alert("Please enter password.");
      return;
    }

    if (editingId) {
      const updated = students.map((student) => {
        if (student.id === editingId) {
          return {
            ...student,
            ...form,
            updatedAt: new Date().toISOString(),
          };
        }

        return student;
      });

      saveStudents(updated);

      alert("Student updated successfully.");
    } else {
      const newStudent = {
        id:
          Date.now().toString() +
          Math.random().toString(36).slice(2),

        ...form,

        instituteName:
          localStorage.getItem(
            "loggedInstituteName"
          ) || "Sigma Education",

        createdAt:
          new Date().toISOString(),
      };

      saveStudents([
        ...students,
        newStudent,
      ]);

      alert("Student created successfully.");
    }

    closeForm();
  };

  const deleteStudent = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    const updated = students.filter(
      (student) => student.id !== id
    );

    saveStudents(updated);
  };

  const toggleStatus = (id) => {
    const updated = students.map((student) => {
      if (student.id === id) {
        return {
          ...student,
          status:
            student.status === "Active"
              ? "Inactive"
              : "Active",
        };
      }

      return student;
    });

    saveStudents(updated);
  };

  const filteredStudents = students.filter(
    (student) => {
      const keyword =
        search.toLowerCase().trim();

      if (!keyword) return true;

      return (
        student.name
          ?.toLowerCase()
          .includes(keyword) ||

        student.username
          ?.toLowerCase()
          .includes(keyword) ||

        student.phone
          ?.toLowerCase()
          .includes(keyword) ||

        student.batch
          ?.toLowerCase()
          .includes(keyword)
      );
    }
  );

  return (
    <div className="students-page">

      {/* HEADER */}
      <header className="students-header">

        <div className="brand">

          <img
            src="/sigma-logo.png"
            alt="Sigma Education"
          />

          <div>
            <h1>SIGMA UBT</h1>
            <p>Student Management</p>
          </div>

        </div>

        <Link
          to="/institute"
          className="back-button"
        >
          ← Dashboard
        </Link>

      </header>

      {/* CONTENT */}
      <main className="students-container">

        <div className="students-title">

          <div>
            <h2>Students</h2>

            <p>
              Create and manage your
              institute students.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={openCreate}
          >
            + Create Student
          </button>

        </div>

        {/* SEARCH */}
        <div className="student-search">

          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        {/* DESKTOP TABLE */}
        <div className="students-table-card">

          <div className="table-scroll">

            <table>

              <thead>
                <tr>
                  <th>S.N.</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Phone</th>
                  <th>Batch</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredStudents.length === 0 ? (

                  <tr>
                    <td
                      colSpan="7"
                      className="empty"
                    >
                      No students found.
                    </td>
                  </tr>

                ) : (

                  filteredStudents.map(
                    (student, index) => (

                      <tr key={student.id}>

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          <strong>
                            {student.name}
                          </strong>
                        </td>

                        <td>
                          {student.username}
                        </td>

                        <td>
                          {student.phone || "-"}
                        </td>

                        <td>
                          {student.batch || "-"}
                        </td>

                        <td>

                          <span
                            className={
                              student.status ===
                              "Active"
                                ? "active-status"
                                : "inactive-status"
                            }
                          >
                            {student.status}
                          </span>

                        </td>

                        <td>

                          <div className="actions">

                            <button
                              className="edit-button"
                              onClick={() =>
                                openEdit(student)
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="status-button"
                              onClick={() =>
                                toggleStatus(
                                  student.id
                                )
                              }
                            >
                              {student.status ===
                              "Active"
                                ? "Disable"
                                : "Activate"}
                            </button>

                            <button
                              className="delete-button"
                              onClick={() =>
                                deleteStudent(
                                  student.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* MOBILE */}
        <div className="mobile-students">

          {filteredStudents.map(
            (student, index) => (

              <div
                className="student-card"
                key={student.id}
              >

                <div className="student-card-header">

                  <div>

                    <small>
                      #{index + 1}
                    </small>

                    <h3>
                      {student.name}
                    </h3>

                  </div>

                  <span
                    className={
                      student.status ===
                      "Active"
                        ? "active-status"
                        : "inactive-status"
                    }
                  >
                    {student.status}
                  </span>

                </div>

                <div className="student-info">

                  <p>
                    <b>Username:</b>{" "}
                    {student.username}
                  </p>

                  <p>
                    <b>Phone:</b>{" "}
                    {student.phone || "-"}
                  </p>

                  <p>
                    <b>Batch:</b>{" "}
                    {student.batch || "-"}
                  </p>

                </div>

                <div className="mobile-actions">

                  <button
                    className="edit-button"
                    onClick={() =>
                      openEdit(student)
                    }
                  >
                    ✏ Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteStudent(
                        student.id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            )
          )}

        </div>

      </main>

      {/* CREATE / EDIT MODAL */}
      {showForm && (

        <div className="student-modal-overlay">

          <div className="student-modal">

            <div className="modal-title">

              <div>

                <h2>
                  {editingId
                    ? "Edit Student"
                    : "Create Student"}
                </h2>

                <p>
                  Student login information
                </p>

              </div>

              <button
                onClick={closeForm}
                className="close-button"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
            >

              <div className="student-form-grid">

                <div className="form-group">

                  <label>
                    Student Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter student name"
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Username
                  </label>

                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Student username"
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Password
                  </label>

                  <input
                    type="text"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Student password"
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Phone
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="98XXXXXXXX"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Batch
                  </label>

                  <input
                    type="text"
                    name="batch"
                    value={form.batch}
                    onChange={handleChange}
                    placeholder="Morning / Evening"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                  </select>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  {editingId
                    ? "Save Changes"
                    : "Create Student"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Students;