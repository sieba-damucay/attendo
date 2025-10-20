import React, { useState, useEffect } from "react";
import { FaQrcode, FaUpload, FaDownload, FaSearch } from "react-icons/fa";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import api from "../api/axiosConfig";

function GeneratorPage() {
  const [activeTab, setActiveTab] = useState("bulk");
  const [file, setFile] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [qrs, setQrs] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 8;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/admin_students");
        setAllStudents(res.data);
      } catch (err) {
        console.error("Failed to fetch students:", err);
      }
    };
    fetchStudents();
  }, []);

  const handleFile = (e) => setFile(e.target.files[0]);

  const handleGenerateBulk = async () => {
    if (!file) return alert("Please select a file!");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/generate-bulk-qr", formData, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "qr-codes.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Failed to generate QR codes. Check backend logs.");
    }
  };

  const handleCheckboxChange = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((sid) => sid !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleSelectAll = () => {
    const pageStudentIds = currentStudents.map((s) => s.user_id.toString());
    const allSelected = pageStudentIds.every((id) => selectedStudentIds.includes(id));
    if (allSelected) {
      setSelectedStudentIds(selectedStudentIds.filter((id) => !pageStudentIds.includes(id)));
    } else {
      setSelectedStudentIds([...new Set([...selectedStudentIds, ...pageStudentIds])]);
    }
  };

  const handleSelectAllGlobal = () => {
    const allIds = filteredStudents.map((s) => s.user_id.toString());
    const allSelected = allIds.every((id) => selectedStudentIds.includes(id));
    if (allSelected) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(allIds);
    }
  };

  const handleGenerateSelected = async () => {
    if (selectedStudentIds.length === 0) return alert("Please select at least 1 student!");
    try {
      const generatedQrs = [];
      for (const id of selectedStudentIds) {
        const student = allStudents.find((s) => s.user_id === parseInt(id));
        const res = await api.get(`/generate-qr/${id}`);
        generatedQrs.push({ name: student?.name || "Unknown", qr: res.data.qr });
      }
      setQrs(generatedQrs);
    } catch (err) {
      console.error(err);
      alert("Failed to generate QR codes");
    }
  };

  const downloadQR = (qrData, filename) => {
    const link = document.createElement("a");
    link.href = qrData;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllAsZip = async () => {
    if (qrs.length === 0) return;
    const zip = new JSZip();
    qrs.forEach((item) => {
      const base64 = item.qr.split(",")[1];
      zip.file(`${item.name}.png`, base64, { base64: true });
    });
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "student-qr-codes.zip");
  };

  const filteredStudents = allStudents.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.username.toLowerCase().includes(search.toLowerCase()));
  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  return (
    <div className="container mt-5">
      <h2 style={{ color: "#800000" }} className="mb-4"><FaQrcode /> QR Code Generator</h2>
      <div className="d-flex gap-3 mb-4">
        <button className={`btn ${activeTab === "bulk" ? "btn-maroon" : "btn-outline-maroon"}`} onClick={() => setActiveTab("bulk")}><FaUpload /> Bulk Upload</button>
        <button className={`btn ${activeTab === "single" ? "btn-maroon" : "btn-outline-maroon"}`} onClick={() => setActiveTab("single")}><FaQrcode /> Select Students</button>
      </div>
      {activeTab === "bulk" && (
        <div className="p-4 shadow-sm bg-white rounded">
          <h4 style={{ color: "#800000" }}>Bulk QR Generator</h4>
          <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFile} className="form-control my-3"/>
          {file && <button className="btn btn-maroon" onClick={handleGenerateBulk}>Generate & Download QR Codes</button>}
        </div>
      )}
      {activeTab === "single" && (
        <div className="p-4 shadow-sm bg-white rounded">
          <h4 style={{ color: "#800000" }}>Generate QR for Students</h4>
          <div className="input-group mb-3">
            <span className="input-group-text"><FaSearch /></span>
            <input type="text" className="form-control" placeholder="Search by name or username" value={search} onChange={(e) => setSearch(e.target.value)}/>
          </div>
          <div className="d-flex gap-4 mb-2">
            <div className="form-check">
              <input type="checkbox" className="form-check-input" onChange={handleSelectAll} checked={currentStudents.length > 0 && currentStudents.every((s) => selectedStudentIds.includes(s.user_id.toString()))}/>
              <label className="form-check-label">Select All on this page</label>
            </div>
            <div className="form-check">
              <input type="checkbox" className="form-check-input" onChange={handleSelectAllGlobal} checked={filteredStudents.length > 0 && filteredStudents.every((s) => selectedStudentIds.includes(s.user_id.toString()))}/>
              <label className="form-check-label">Select All Students</label>
            </div>
          </div>
          <div className="my-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
            {currentStudents.map((s) => (
              <div key={s.user_id} className="form-check">
                <input type="checkbox" className="form-check-input" id={`student-${s.user_id}`} checked={selectedStudentIds.includes(s.user_id.toString())} onChange={() => handleCheckboxChange(s.user_id.toString())}/>
                <label className="form-check-label" htmlFor={`student-${s.user_id}`}>{s.name} ({s.username})</label>
              </div>
            ))}
          </div>
          <nav className="d-flex justify-content-center">
            <ul className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                </li>
              ))}
            </ul>
          </nav>
          <button className="btn btn-maroon mt-3" onClick={handleGenerateSelected}>Generate QR Codes</button>
        </div>
      )}
      {qrs.length > 0 && (
        <div className="mt-4 text-center">
          <h5 style={{ color: "#800000" }}>Generated QR Codes:</h5>
          <div className="d-flex flex-wrap justify-content-center gap-4 mt-3">
            {qrs.map((item, idx) => (
              <div key={idx} className="text-center">
                <img src={item.qr} alt="QR Code" className="img-fluid"/>
                <p className="mt-2">{item.name}</p>
                <button className="btn btn-sm btn-outline-maroon" onClick={() => downloadQR(item.qr, item.name)}><FaDownload /> Download</button>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <button className="btn btn-maroon" onClick={downloadAllAsZip}><FaDownload /> Download All as ZIP</button>
          </div>
        </div>
      )}
      <style>{`
        .btn-maroon { background-color: #800000; color: #fff; border: none; }
        .btn-maroon:hover { background-color: #990000; }
        .btn-outline-maroon { border: 1px solid #800000; color: #800000; background: transparent; }
        .btn-outline-maroon:hover { background-color: #800000; color: #fff; }
        .form-check-input { accent-color: #800000; transform: scale(1.2); }
        .page-link { color: #800000; }
        .page-item.active .page-link { background-color: #800000; border-color: #800000; color: #fff; }
      `}</style>
    </div>
  );
}

export default GeneratorPage;
