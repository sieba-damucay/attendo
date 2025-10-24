import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { FaUserGraduate, FaPrint, FaFileImport, FaGraduationCap } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


function MyStudents({ userId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [strands, setStrands] = useState([]);
  const teacherId = userId;

  useEffect(() => {
    fetchStudents();
    fetchTeachersAndStrands();
  }, [teacherId]);

  const fetchStudents = async () => {
    try {
      const res = await api.get(`/my-students?teacherId=${teacherId}`);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachersAndStrands = async () => {
    try {
      const teachersRes = await api.get("/admin_teachers");
      const strandsRes = await api.get("/strands");
      setTeachers(teachersRes.data);
      setStrands(strandsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("students-table").outerHTML;
    const newWindow = window.open("", "", "width=900,height=700");
    newWindow.document.write(`
      <html>
        <head>
          <title>My Students</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #800000; }
            h2 { text-align: center; margin-bottom: 20px; color: #800000; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #800000; padding: 8px; text-align: left; }
            th { background-color: #800000; color: white; }
            .text-center { text-align: center; }
          </style>
        </head>
        <body>
          <h2>My Students</h2>
          ${printContent}
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first.");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("teacherId", teacherId);
    try {
      await api.post("/my-students/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Students imported successfully");
      setFile(null);
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to import students");
    }
  };

  const AddStudentForm = ({ refresh, close, teachers, strands }) => {
    const [formData, setFormData] = useState({
      id: null,
      username: "",
      name: "",
      password: "",
      teacher_id: teacherId || "",
      strand_id: "",
      section_id: "",
      grade_level: "",
    });
    const [sections, setSections] = useState([]);

    useEffect(() => {
      const fetchSections = async () => {
        if (!formData.strand_id) {
          setSections([]);
          setFormData((prev) => ({ ...prev, section_id: "" }));
          return;
        }
        try {
          const res = await api.get(`/sections?strandId=${formData.strand_id}`);
          setSections(res.data);
          setFormData((prev) => ({ ...prev, section_id: "" }));
        } catch (err) {
          console.error(err);
        }
      };
      fetchSections();
    }, [formData.strand_id]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await api.post("/admin_students", formData);
        alert("Student added successfully");
        refresh();
        close();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || "Failed to add student");
      }
    };

    return (
      <div className="overlay d-flex justify-content-center align-items-center">
        <div
          className="card p-4 w-100"
          style={{
            maxWidth: "500px", 
            margin: "0 1rem",  
            borderRadius: "0.5rem",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
          }}
        >
          <h5 className="mb-3 text-center" style={{ color: "#800000" }}>Add New Student</h5>
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-2">
            <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required className="form-control" />
            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="form-control" />
            <input type="text" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="form-control" />
            <select name="strand_id" value={formData.strand_id} onChange={handleChange} required className="form-select">
              <option value="">Select Strand</option>
              {strands.map((s) => <option key={s.strand_id} value={s.strand_id}>{s.strand_name}</option>)}
            </select>
            <select name="section_id" value={formData.section_id} onChange={handleChange} required className="form-select" disabled={!formData.strand_id}>
              <option value="">Select Section</option>
              {sections.map((sec) => <option key={sec.section_id} value={sec.section_id}>{sec.section_name}</option>)}
            </select>
            <select name="grade_level" value={formData.grade_level} onChange={handleChange} required className="form-select">
              <option value="">Select Grade Level</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
            <select name="teacher_id" value={formData.teacher_id} onChange={handleChange} className="form-select">
              <option value="">Assign Teacher (optional)</option>
              {teachers.map((t) => <option key={t.user_id} value={t.user_id}>{t.name}</option>)}
            </select>
            <div className="d-flex gap-2 mt-2 flex-wrap">
              <button type="submit" className="btn" style={{ backgroundColor: "#800000", color: "white", flex: 1 }}>Add Student</button>
              <button type="button" className="btn btn-secondary flex-1" onClick={close}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <h2 className="mb-3 d-flex align-items-center gap-2" style={{ color: "#800000" }}>
          <FaUserGraduate /> My Students
        </h2>
        <div className="d-grid gap-2 gap-md-3">
          <button className="btn d-flex align-items-center justify-content-center gap-2 w-100" style={{ backgroundColor: "#800000", color: "white" }} onClick={handlePrint}>
            <FaPrint /> Print Students
          </button>
          <form onSubmit={handleImport} className="d-grid gap-2">
            <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={(e) => setFile(e.target.files[0])} className="form-control" />
            <button type="submit" className="btn d-flex align-items-center justify-content-center gap-2 w-100" style={{ backgroundColor: "#800000", color: "white" }}>
              <FaFileImport /> Import CSV/Excel
            </button>
          </form>
          <button className="btn w-100" style={{ backgroundColor: "#800000", color: "white" }} onClick={() => setShowAddStudentForm(true)}>
            Add Student
          </button>
        </div>
      </div>

      {showAddStudentForm && <AddStudentForm refresh={fetchStudents} close={() => setShowAddStudentForm(false)} teachers={teachers} strands={strands} />}

      {loading ? (
      <div className="mt-3">
          <Skeleton height={30} width={200} style={{ marginBottom: "10px" }} />
          <table className="table table-bordered">
            <thead>
              <tr>
                {Array(6)
                  .fill()
                  .map((_, i) => (
                    <th key={i}>
                      <Skeleton height={20} />
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {Array(6)
                .fill()
                .map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {Array(6)
                      .fill()
                      .map((_, colIndex) => (
                        <td key={colIndex}>
                          <Skeleton height={20} />
                        </td>
                      ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>      ) : (
        <table id="students-table" className="table table-striped table-bordered table-responsive">
          <thead style={{ backgroundColor: "#800000", color: "white" }}>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Username</th>
              <th>Grade</th>
              <th>Section</th>
              <th>Strand</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted">No students found</td>
              </tr>
            ) : (
              students.map((s, idx) => (
                <tr key={s.user_id}>
                  <td>{idx + 1}</td>
                  <td>{s.name}</td>
                  <td>{s.username}</td>
                  <td>{s.grade_level}</td>
                  <td>{s.section_name || "N/A"}</td>
                  <td>{s.strand_name || "N/A"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyStudents;
