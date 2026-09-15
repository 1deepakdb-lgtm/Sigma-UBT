import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./InstituteList.css";

const PACKAGE_OPTIONS = [
  "1 Month",
  "3 Months",
  "6 Months",
  "1 Year",
];

const EXAM_PACKAGE_OPTIONS = [
  "10 Set UBT",
  "20 Set UBT",
  "30 Set UBT",
  "50 Set UBT",
  "80 Set UBT",
  "100 Set UBT",
  "150 Set UBT",
  "200 Set UBT",
  "30 Set Chapter UBT",
  "60 Set Chapter",
  "Final Set UBT",
  "Full Set UBT",
];

function calculateExpireDate(entryDate, packageName) {
  if (!entryDate) return "";

  const date = new Date(entryDate);

  if (packageName === "1 Month") {
    date.setMonth(date.getMonth() + 1);
  }

  if (packageName === "3 Months") {
    date.setMonth(date.getMonth() + 3);
  }

  if (packageName === "6 Months") {
    date.setMonth(date.getMonth() + 6);
  }

  if (packageName === "1 Year") {
    date.setFullYear(date.getFullYear() + 1);
  }

  return date.toISOString().split("T")[0];
}

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-GB");
}

function getInstituteStatus(expireDate, status) {
  if (status === "Inactive") {
    return "Inactive";
  }

  if (!expireDate) {
    return "Active";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expireDate);
  expiry.setHours(0, 0, 0, 0);

  if (expiry < today) {
    return "Expired";
  }

  return "Active";
}

function InstituteList() {
  const [institutes, setInstitutes] = useState([]);
  const [editingInstitute, setEditingInstitute] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadInstitutes();
  }, []);

  const loadInstitutes = () => {
    const savedInstitutes =
      localStorage.getItem("sigmaInstitutes");

    if (!savedInstitutes) {
      setInstitutes([]);
      return;
    }

    try {
      const data = JSON.parse(savedInstitutes);

      if (Array.isArray(data)) {
        setInstitutes(data);
      } else {
        setInstitutes([]);
      }
    } catch (error) {
      console.error("Error loading institutes:", error);
      setInstitutes([]);
    }
  };

  const saveInstitutes = (data) => {
    localStorage.setItem(
      "sigmaInstitutes",
      JSON.stringify(data)
    );

    setInstitutes(data);
  };

  const openEdit = (institute) => {
    const entryDate =
      institute.entryDate ||
      new Date().toISOString().split("T")[0];

    const packageName =
      institute.package || "1 Month";

    setEditingInstitute({
      ...institute,

      instituteName:
        institute.instituteName ||
        institute.name ||
        "",

      username:
        institute.username || "",

      password:
        institute.password || "",

      package: packageName,

      examPackage:
        institute.examPackage ||
        "10 Set UBT",

      entryDate: entryDate,

      expireDate:
        institute.expireDate ||
        calculateExpireDate(
          entryDate,
          packageName
        ),

      status:
        institute.status || "Active",
    });
  };

  const closeEdit = () => {
    setEditingInstitute(null);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditingInstitute((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePackageChange = (event) => {
    const packageName = event.target.value;

    setEditingInstitute((previous) => ({
      ...previous,

      package: packageName,

      expireDate: calculateExpireDate(
        previous.entryDate,
        packageName
      ),
    }));
  };

  const handleEntryDateChange = (event) => {
    const entryDate = event.target.value;

    setEditingInstitute((previous) => ({
      ...previous,

      entryDate,

      expireDate: calculateExpireDate(
        entryDate,
        previous.package
      ),
    }));
  };

  const saveEdit = (event) => {
    event.preventDefault();

    if (
      !editingInstitute.instituteName ||
      !editingInstitute.instituteName.trim()
    ) {
      alert("Please enter institute name.");
      return;
    }

    if (
      !editingInstitute.username ||
      !editingInstitute.username.trim()
    ) {
      alert("Please enter username.");
      return;
    }

    const finalStatus = getInstituteStatus(
      editingInstitute.expireDate,
      editingInstitute.status
    );

    const updatedInstitute = {
      ...editingInstitute,

      name: editingInstitute.instituteName,

      status: finalStatus,

      updatedAt: new Date().toISOString(),
    };

    const updatedList = institutes.map((item) => {
      if (
        String(item.id) ===
        String(editingInstitute.id)
      ) {
        return updatedInstitute;
      }

      return item;
    });

    saveInstitutes(updatedList);

    setEditingInstitute(null);

    alert("Institute updated successfully.");
  };

  const deleteInstitute = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this institute?"
    );

    if (!confirmed) return;

    const updatedList = institutes.filter(
      (item) =>
        String(item.id) !== String(id)
    );

    saveInstitutes(updatedList);
  };

  const toggleStatus = (institute) => {
    const currentStatus = getInstituteStatus(
      institute.expireDate,
      institute.status
    );

    let newStatus = "Active";

    if (currentStatus === "Active") {
      newStatus = "Inactive";
    }

    const updatedList = institutes.map((item) => {
      if (
        String(item.id) === String(institute.id)
      ) {
        return {
          ...item,
          status: newStatus,
        };
      }

      return item;
    });

    saveInstitutes(updatedList);
  };

  const filteredInstitutes =
    institutes.filter((institute) => {
      const keyword =
        search.toLowerCase().trim();

      if (!keyword) return true;

      const instituteName =
        institute.instituteName ||
        institute.name ||
        "";

      const username =
        institute.username || "";

      const examPackage =
        institute.examPackage || "";

      return (
        instituteName
          .toLowerCase()
          .includes(keyword) ||

        username
          .toLowerCase()
          .includes(keyword) ||

        examPackage
          .toLowerCase()
          .includes(keyword)
      );
    });

  return (
    <div className="institute-page">

      {/* HEADER */}
      <header className="institute-header">

        <div className="header-left">

          <img
            src="/sigma-logo.png"
            alt="Sigma Education"
            className="header-logo"
          />

          <div>
            <h1>SIGMA UBT</h1>

            <p>
              Institute Management
            </p>
          </div>

        </div>

        <Link
          to="/admin"
          className="back-dashboard-button"
        >
          ← Dashboard
        </Link>

      </header>

      {/* MAIN CONTENT */}
      <main className="institute-content">

        {/* TITLE */}
        <div className="page-title-row">

          <div>
            <h2>
              Institute List
            </h2>

            <p>
              Manage institutes, packages,
              exam packages and expiry dates.
            </p>
          </div>

          <Link
            to="/admin/create-institute"
            className="create-button"
          >
            + Create Institute
          </Link>

        </div>

        {/* SEARCH */}
        <div className="search-box">

          <input
            type="text"
            placeholder="Search institute, username or exam package..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        {/* DESKTOP TABLE */}
        <div className="table-card">

          <div className="table-wrapper">

            <table className="institute-table">

              <thead>

                <tr>

                  <th>S.N.</th>

                  <th>
                    Institute Name
                  </th>

                  <th>
                    Username
                  </th>

                  <th>
                    Package
                  </th>

                  <th>
                    Exam Package
                  </th>

                  <th>
                    Entry Date
                  </th>

                  <th>
                    Expire Date
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredInstitutes.length === 0 ? (

                  <tr>

                    <td
                      colSpan="9"
                      className="empty-row"
                    >
                      No institutes found.
                    </td>

                  </tr>

                ) : (

                  filteredInstitutes.map(
                    (institute, index) => {

                      const status =
                        getInstituteStatus(
                          institute.expireDate,
                          institute.status
                        );

                      return (

                        <tr
                          key={
                            institute.id ||
                            index
                          }
                        >

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            <strong>
                              {
                                institute.instituteName ||
                                institute.name ||
                                "-"
                              }
                            </strong>
                          </td>

                          <td>
                            {
                              institute.username ||
                              "-"
                            }
                          </td>

                          <td>
                            {
                              institute.package ||
                              "-"
                            }
                          </td>

                          <td>

                            <span className="exam-package">

                              {
                                institute.examPackage ||
                                "-"
                              }

                            </span>

                          </td>

                          <td>
                            {
                              formatDate(
                                institute.entryDate
                              )
                            }
                          </td>

                          <td>
                            {
                              formatDate(
                                institute.expireDate
                              )
                            }
                          </td>

                          <td>

                            <span
                              className={
                                `status-badge ${
                                  status.toLowerCase()
                                }`
                              }
                            >
                              {status}
                            </span>

                          </td>

                          <td>

                            <div className="action-buttons">

                              {/* EDIT */}
                              <button
                                className="edit-button"
                                onClick={() =>
                                  openEdit(
                                    institute
                                  )
                                }
                              >
                                Edit
                              </button>

                              {/* ENABLE / DISABLE */}
                              <button
                                className="status-button"
                                onClick={() =>
                                  toggleStatus(
                                    institute
                                  )
                                }
                              >
                                {status ===
                                "Inactive"
                                  ? "Activate"
                                  : "Disable"}
                              </button>

                              {/* DELETE */}
                              <button
                                className="delete-button"
                                onClick={() =>
                                  deleteInstitute(
                                    institute.id
                                  )
                                }
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>

                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* MOBILE CARDS */}
        <div className="mobile-institute-list">

          {filteredInstitutes.length === 0 ? (

            <div className="mobile-empty">
              No institutes found.
            </div>

          ) : (

            filteredInstitutes.map(
              (institute, index) => {

                const status =
                  getInstituteStatus(
                    institute.expireDate,
                    institute.status
                  );

                return (

                  <div
                    className="institute-mobile-card"
                    key={
                      institute.id ||
                      index
                    }
                  >

                    <div className="mobile-card-top">

                      <div>

                        <span className="mobile-sn">
                          #{index + 1}
                        </span>

                        <h3>
                          {
                            institute.instituteName ||
                            institute.name ||
                            "-"
                          }
                        </h3>

                      </div>

                      <span
                        className={
                          `status-badge ${
                            status.toLowerCase()
                          }`
                        }
                      >
                        {status}
                      </span>

                    </div>

                    <div className="mobile-info">

                      <div>
                        <label>
                          Username
                        </label>

                        <strong>
                          {
                            institute.username ||
                            "-"
                          }
                        </strong>
                      </div>

                      <div>
                        <label>
                          Package
                        </label>

                        <strong>
                          {
                            institute.package ||
                            "-"
                          }
                        </strong>
                      </div>

                      <div>
                        <label>
                          Exam Package
                        </label>

                        <strong>
                          {
                            institute.examPackage ||
                            "-"
                          }
                        </strong>
                      </div>

                      <div>
                        <label>
                          Entry Date
                        </label>

                        <strong>
                          {
                            formatDate(
                              institute.entryDate
                            )
                          }
                        </strong>
                      </div>

                      <div>
                        <label>
                          Expire Date
                        </label>

                        <strong>
                          {
                            formatDate(
                              institute.expireDate
                            )
                          }
                        </strong>
                      </div>

                    </div>

                    <div className="mobile-actions">

                      <button
                        className="edit-button"
                        onClick={() =>
                          openEdit(
                            institute
                          )
                        }
                      >
                        ✏ Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteInstitute(
                            institute.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                );
              }
            )

          )}

        </div>

      </main>

      {/* EDIT MODAL */}
      {editingInstitute && (

        <div
          className="modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeEdit();
            }

          }}
        >

          <div className="edit-modal">

            {/* MODAL HEADER */}
            <div className="modal-header">

              <div>

                <h2>
                  Edit Institute
                </h2>

                <p>
                  Update institute account
                  and package information.
                </p>

              </div>

              <button
                className="close-modal"
                onClick={closeEdit}
              >
                ×
              </button>

            </div>

            {/* EDIT FORM */}
            <form onSubmit={saveEdit}>

              <div className="form-grid">

                {/* Institute Name */}
                <div className="form-group">

                  <label>
                    Institute Name
                  </label>

                  <input
                    type="text"
                    name="instituteName"
                    value={
                      editingInstitute.instituteName
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />

                </div>

                {/* Username */}
                <div className="form-group">

                  <label>
                    Username
                  </label>

                  <input
                    type="text"
                    name="username"
                    value={
                      editingInstitute.username
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                  />

                </div>

                {/* Password */}
                <div className="form-group">

                  <label>
                    Password
                  </label>

                  <input
                    type="text"
                    name="password"
                    value={
                      editingInstitute.password
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

                {/* Package */}
                <div className="form-group">

                  <label>
                    Package
                  </label>

                  <select
                    name="package"
                    value={
                      editingInstitute.package
                    }
                    onChange={
                      handlePackageChange
                    }
                  >

                    {PACKAGE_OPTIONS.map(
                      (option) => (

                        <option
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* Exam Package */}
                <div className="form-group full-width">

                  <label>
                    Exam Package
                  </label>

                  <select
                    name="examPackage"
                    value={
                      editingInstitute.examPackage
                    }
                    onChange={
                      handleEditChange
                    }
                  >

                    {EXAM_PACKAGE_OPTIONS.map(
                      (option) => (

                        <option
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* Entry Date */}
                <div className="form-group">

                  <label>
                    Entry Date
                  </label>

                  <input
                    type="date"
                    name="entryDate"
                    value={
                      editingInstitute.entryDate
                    }
                    onChange={
                      handleEntryDateChange
                    }
                  />

                </div>

                {/* Expire Date */}
                <div className="form-group">

                  <label>
                    Expire Date
                  </label>

                  <input
                    type="date"
                    name="expireDate"
                    value={
                      editingInstitute.expireDate
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                  <small>
                    Package change गर्दा
                    expiry date automatically
                    calculate हुन्छ।
                  </small>

                </div>

                {/* Status */}
                <div className="form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      editingInstitute.status
                    }
                    onChange={
                      handleEditChange
                    }
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

              {/* MODAL FOOTER */}
              <div className="modal-footer">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeEdit}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default InstituteList;