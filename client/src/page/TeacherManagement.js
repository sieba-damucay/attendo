import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./TeacherManagement.css";

function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin_teachers");
      setTeachers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) await api.put(`/admin_teachers/${formData.id}`, formData);
      else await api.post("/admin_teachers", formData);
      alert(formData.id ? "Teacher updated successfully" : "Teacher added successfully");
      setFormData({ id: null, name: "", email: "", password: "" });
      setShowForm(false);
      fetchTeachers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Operation failed");
    }
  };

  const handleEdit = (teacher) => {
    setFormData({
      id: teacher.user_id,
      name: teacher.name,
      email: teacher.email,
      password: "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    try {
      await api.delete(`/admin_teachers/${id}`);
      alert("Teacher deleted successfully");
      fetchTeachers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete teacher");
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      !searchTerm ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4" style={{ color: "#800000" }}>
      <div
        className="p-3 mb-4 rounded shadow-sm"
        style={{
          backgroundColor: "#fff",
          borderTop: "5px solid #800000",
        }}
      >
        <h2 className="mb-3 text-center">Teacher Management</h2>

        <div className="d-flex gap-2 mb-3 flex-wrap">
          <button
            className="btn"
            style={{ backgroundColor: "#800000", color: "#fff" }}
            onClick={() => setShowForm(true)}
          >
            Add Teacher
          </button>
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ maxWidth: "250px", borderColor: "#800000" }}
          />
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ borderColor: "#800000" }}
            >
              <h5 style={{ color: "#800000" }}>
                {formData.id ? "Edit Teacher" : "Add Teacher"}
              </h5>
              <form
                onSubmit={handleSubmit}
                className="d-flex flex-column gap-2"
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-control"
                  style={{ borderColor: "#800000" }}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-control"
                  style={{ borderColor: "#800000" }}
                />
                {!formData.id && (
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-control"
                    style={{ borderColor: "#800000" }}
                  />
                )}
                <div className="d-flex gap-2 mt-2">
                  <button
                    type="submit"
                    className="flex-grow-1"
                    style={{ backgroundColor: "#800000", color: "#fff" }}
                  >
                    {formData.id ? "Update" : "Add"}
                  </button>
                  <button
                    type="button"
                    className="flex-grow-1"
                    style={{ backgroundColor: "#ccc", color: "#800000" }}
                    onClick={() => {
                      setShowForm(false);
                      setFormData({
                        id: null,
                        name: "",
                        email: "",
                        password: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table or Skeleton */}
        <div className="table-responsive">
          <table className="table table-bordered table-striped" style={{ fontSize: ".8rem" }}>
            <thead style={{ backgroundColor: "#800000", color: "#fff" }}>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Date Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // 🦴 Skeleton Rows
                Array(5)
                  .fill()
                  .map((_, index) => (
                    <tr key={index}>
                      <td><Skeleton width={20} /></td>
                      <td><Skeleton width={120} /></td>
                      <td><Skeleton width={180} /></td>
                      <td><Skeleton width={150} /></td>
                      <td><Skeleton width={100} /></td>
                    </tr>
                  ))
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No teachers found
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t, index) => (
                  <tr key={t.user_id}>
                    <td>{index + 1}</td>
                    <td>{t.name}</td>
                    <td>{t.email}</td>
                    <td>{formatDate(t.created_at)}</td>
                    <td>
                      <button
                        className="btn btn-sm me-2"
                        style={{ backgroundColor: "#ffc107", color: "#800000" }}
                        onClick={() => handleEdit(t)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ backgroundColor: "#800000", color: "#fff" }}
                        onClick={() => handleDelete(t.user_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TeacherManagement;
