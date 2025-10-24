import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import "bootstrap/dist/css/bootstrap.min.css";
import "./StudentManagement.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [strands, setStrands] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    username: "",
    name: "",
    password: "",
    teacher_id: "",
    strand_id: "",
    section_id: "",
    grade_level: "",
  });
  const [filterStrand, setFilterStrand] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [searchName, setSearchName] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchTeachers(), fetchStrands(), fetchStudents()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) fetchStudents();
  }, [filterStrand, filterSection]);

  useEffect(() => {
    if (filterStrand) fetchSections(Number(filterStrand));
    else setSections([]);
    setFilterSection("");
  }, [filterStrand]);

  useEffect(() => {
    if (formData.strand_id) fetchSections(Number(formData.strand_id));
    else setSections([]);
  }, [formData.strand_id]);

  const fetchStudents = async () => {
    try {
      const params = [];
      if (filterStrand) params.push(`strandId=${filterStrand}`);
      if (filterSection) params.push(`sectionId=${filterSection}`);
      const url = params.length
        ? `/admin_students?${params.join("&")}`
        : "/admin_students";
      const res = await api.get(url);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get("/admin_teachers");
      setTeachers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStrands = async () => {
    try {
      const res = await api.get("/strands");
      setStrands(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSections = async (strandId) => {
    try {
      const res = await api.get(`/sections?strandId=${strandId}`);
      setSections(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (formData.id) await api.put(`/admin_students/${formData.id}`, payload);
      else await api.post("/admin_students", payload);
      alert(formData.id ? "Student updated" : "Student added");
      setFormData({
        id: null,
        username: "",
        name: "",
        password: "",
        teacher_id: "",
        strand_id: "",
        section_id: "",
        grade_level: "",
      });
      setShowForm(false);
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleEdit = async (student) => {
    setFormData({
      id: student.user_id,
      username: student.username || "",
      name: student.name,
      password: "",
      teacher_id: student.teacher_id || "",
      strand_id: student.strand_id || "",
      section_id: student.section_id || "",
      grade_level: student.grade_level || "",
    });
    if (student.strand_id) {
      const res = await api.get(`/sections?strandId=${student.strand_id}`);
      setSections(res.data);
    }
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/admin_students/${id}`);
      alert("Deleted");
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  const formatDate = (dateStr) =>
    !dateStr ? "-" : new Date(dateStr).toLocaleString();

  const filteredStudents = students.filter(
    (s) =>
      !searchName || s.name.toLowerCase().includes(searchName.toLowerCase())
  );

  return (
    <div className="container mt-4" style={{ color: "#800000" }}>
      <div
        className="p-3 mb-4 rounded shadow-sm"
        style={{
          backgroundColor: "#fff",
          borderRadius: "0.6rem",
          borderTop: "5px solid #800000",
        }}
      >
        <h2 className="text-center mb-3 fw-bold" style={{ color: "#800000" }}>
          Student Management
        </h2>

        {/* ================================= Filters and Search ===================================*/}
        {loading ? (
          <Skeleton height={40} count={2} className="mb-3" />
        ) : (
          <div className="d-flex gap-2 mb-3 flex-wrap">
            <button
              className="btn"
              style={{ backgroundColor: "#800000", color: "#fff" }}
              onClick={() => setShowForm(true)}
            >
              Add Student
            </button>
            <select
              value={filterStrand}
              onChange={(e) => setFilterStrand(e.target.value)}
              className="form-select"
              style={{ maxWidth: "200px", borderColor: "#800000" }}
            >
              <option value="">All Strands</option>
              {strands.map((s) => (
                <option key={s.strand_id} value={s.strand_id}>
                  {s.strand_name}
                </option>
              ))}
            </select>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="form-select"
              style={{ maxWidth: "200px", borderColor: "#800000" }}
              disabled={!filterStrand}
            >
              <option value="">All Sections</option>
              {sections.map((sec) => (
                <option key={sec.section_id} value={sec.section_id}>
                  {sec.section_name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search by name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="form-control"
              style={{ maxWidth: "200px", borderColor: "#800000" }}
            />
          </div>
        )}

        {/*======================== Skeleton Loader for Tables =============================*/}
        {loading ? (
          <>
            <Skeleton height={40} width="40%" />
            <Skeleton height={300} className="mt-2" />
          </>
        ) : (
          <>
            <div className="table-responsive mb-3">
              <h5
                className="fw-semibold mb-2"
                style={{
                  color: "#800000",
                  borderBottom: "2px solid #800000",
                  paddingBottom: "4px",
                }}
              >
                Students per Strand & Section
              </h5>
              <table
                className="table table-bordered"
                style={{ fontSize: ".8rem" }}
              >
                <thead style={{ backgroundColor: "#800000", color: "#fff" }}>
                  <tr>
                    <th>Strand</th>
                    <th>Section</th>
                    <th>Total Students</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    students.reduce((acc, s) => {
                      const key = `${s.strand_name || "N/A"}-${
                        s.section_name || "N/A"
                      }`;
                      acc[key] = (acc[key] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([key, count], idx) => {
                    const [strand, section] = key.split("-");
                    return (
                      <tr key={idx}>
                        <td>{strand}</td>
                        <td>{section}</td>
                        <td>{count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              className="p-3 rounded shadow-sm"
              style={{
                backgroundColor: "#fff",
                borderRadius: "0.6rem",
                borderTop: "5px solid #800000",
              }}
            >
              <div className="table-responsive">
                <table
                  className="table table-bordered align-middle"
                  style={{ fontSize: ".8rem" }}
                >
                  <thead style={{ backgroundColor: "#800000", color: "#fff" }}>
                    <tr>
                      <th>#</th>
                      <th>Username</th>
                      <th>Name</th>
                      <th>Grade Level</th>
                      <th>Strand</th>
                      <th>Section</th>
                      <th>Teacher</th>
                      <th>Date Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center text-muted">
                          No students found
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s, index) => (
                        <tr key={s.user_id}>
                          <td>{index + 1}</td>
                          <td>{s.username}</td>
                          <td>{s.name}</td>
                          <td>{s.grade_level}</td>
                          <td>{s.strand_name || "-"}</td>
                          <td>{s.section_name || "-"}</td>
                          <td>
                            {teachers.find((t) => t.user_id === s.teacher_id)
                              ?.name || "-"}
                          </td>
                          <td>{formatDate(s.created_at)}</td>
                          <td>
                            <button
                              className="btn btn-sm me-2"
                              style={{
                                backgroundColor: "#ffc107",
                                color: "#800000",
                              }}
                              onClick={() => handleEdit(s)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{
                                backgroundColor: "#800000",
                                color: "#fff",
                              }}
                              onClick={() => handleDelete(s.user_id)}
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
          </>
        )}
      </div>



      {/* ========================== Add/Edit Form Modal ==========================*/}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              borderTop: "5px solid #800000",
              borderRadius: "0.6rem",
            }}
          >
            <h5 style={{ color: "#800000" }}>
              {formData.id ? "Edit Student" : "Add Student"}
            </h5>
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-2">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-control"
                style={{ borderColor: "#800000" }}
              />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-control"
                style={{ borderColor: "#800000" }}
              />
              <select
                name="strand_id"
                value={formData.strand_id}
                onChange={handleChange}
                className="form-select"
                required
                style={{ borderColor: "#800000" }}
              >
                <option value="">Select Strand</option>
                {strands.map((s) => (
                  <option key={s.strand_id} value={s.strand_id}>
                    {s.strand_name}
                  </option>
                ))}
              </select>
              <select
                name="section_id"
                value={formData.section_id}
                onChange={handleChange}
                className="form-select"
                required
                disabled={!formData.strand_id}
                style={{ borderColor: "#800000" }}
              >
                <option value="">Select Section</option>
                {sections.map((sec) => (
                  <option key={sec.section_id} value={sec.section_id}>
                    {sec.section_name}
                  </option>
                ))}
              </select>
              <select
                name="grade_level"
                value={formData.grade_level}
                onChange={handleChange}
                className="form-select"
                required
                style={{ borderColor: "#800000" }}
              >
                <option value="">Select Grade Level</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
              <select
                name="teacher_id"
                value={formData.teacher_id}
                onChange={handleChange}
                className="form-select"
                style={{ borderColor: "#800000" }}
              >
                <option value="">Assign Teacher (optional)</option>
                {teachers.map((t) => (
                  <option key={t.user_id} value={t.user_id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {!formData.id && (
                <input
                  type="text"
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
                  className="flex-grow-1 btn"
                  style={{
                    backgroundColor: "#800000",
                    color: "#fff",
                  }}
                >
                  {formData.id ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="flex-grow-1 btn"
                  style={{
                    backgroundColor: "#ccc",
                    color: "#800000",
                  }}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentManagement;
