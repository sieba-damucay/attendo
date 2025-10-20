import React, { useState, useEffect } from "react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import api from "../api/axiosConfig.js";
import "bootstrap/dist/css/bootstrap.min.css";

function AdminStrandSectionManagement() {
  const [strands, setStrands] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedStrand, setSelectedStrand] = useState("");
  const [newStrand, setNewStrand] = useState("");
  const [editStrandId, setEditStrandId] = useState(null);
  const [editStrandName, setEditStrandName] = useState("");
  const [newSection, setNewSection] = useState("");
  const [editSectionId, setEditSectionId] = useState(null);
  const [editSectionName, setEditSectionName] = useState("");

  useEffect(() => { fetchStrands(); }, []);
  useEffect(() => { fetchSections(selectedStrand); }, [selectedStrand]);

  const fetchStrands = async () => {
    try {
      const res = await api.get("/strands");
      setStrands(res.data);
      if (!selectedStrand && res.data.length > 0) setSelectedStrand(res.data[0].strand_id);
    } catch (err) { console.error("Error fetching strands:", err); }
  };

  const fetchSections = async (strandId) => {
    if (!strandId) return setSections([]);
    try {
      const res = await api.get(`/sections?strandId=${strandId}`);
      setSections(res.data);
    } catch (err) { console.error("Error fetching sections:", err); }
  };

  const handleAddStrand = async () => {
    if (!newStrand.trim()) return;
    await api.post("/strands", { strand_name: newStrand });
    setNewStrand("");
    fetchStrands();
  };

  const handleEditStrand = (id, name) => { setEditStrandId(id); setEditStrandName(name); };
  const handleUpdateStrand = async () => {
    if (!editStrandName.trim()) return;
    await api.put(`/strands/${editStrandId}`, { strand_name: editStrandName });
    setEditStrandId(null); setEditStrandName("");
    fetchStrands();
  };

  const handleDeleteStrand = async (id) => {
    if (!window.confirm("Are you sure you want to delete this strand?")) return;
    await api.delete(`/strands/${id}`);
    if (selectedStrand === id) setSelectedStrand("");
    fetchStrands();
  };

  const handleAddSection = async () => {
    if (!newSection.trim() || !selectedStrand) return;
    await api.post("/sections", { section_name: newSection, strand_id: selectedStrand });
    setNewSection("");
    fetchSections(selectedStrand);
  };

  const handleEditSection = (id, name) => { setEditSectionId(id); setEditSectionName(name); };
  const handleUpdateSection = async () => {
    if (!editSectionName.trim()) return;
    await api.put(`/sections/${editSectionId}`, { section_name: editSectionName, strand_id: selectedStrand });
    setEditSectionId(null); setEditSectionName("");
    fetchSections(selectedStrand);
  };

  const handleDeleteSection = async (id) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;
    await api.delete(`/sections/${id}`);
    fetchSections(selectedStrand);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-start py-5"
      style={{
        minHeight: "100vh",
        backgroundColor: "#fdfdfd",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div
        className="card shadow p-4 w-100"
        style={{
          maxWidth: "900px",
          borderRadius: "1rem",
          borderTop: "5px solid #800000",
          backgroundColor: "#fff",
        }}
      >
        <h2
          className="text-center mb-4 fw-bold"
          style={{ color: "#800000", letterSpacing: "0.5px" }}
        >
          Manage Strands & Sections
        </h2>

    
        <div className="mb-5 p-4 rounded shadow-sm" style={{ borderTop: "4px solid #800000", background: "#fff" }}>
          <h4 className="mb-3 fw-semibold" style={{ color: "#800000" }}>Strands</h4>
          <div className="mb-3 d-flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="New strand name..."
              value={newStrand}
              onChange={(e) => setNewStrand(e.target.value)}
              className="form-control flex-grow-1"
              style={{ borderColor: "#800000", borderRadius: "0.5rem" }}
            />
            <button
              className="btn text-white"
              style={{ backgroundColor: "#800000", borderRadius: "0.5rem" }}
              onClick={handleAddStrand}
            >
              Add Strand
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle" style={{fontSize:".8rem"}}>
              <thead className="text-white" style={{ backgroundColor: "#800000" }}>
                <tr>
                  <th>#</th>
                  <th>Strand Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {strands.map((s, idx) => (
                  <tr
                    key={s.strand_id}
                    style={{
                      backgroundColor:
                        selectedStrand === s.strand_id ? "#fff2f2" : "#fff",
                    }}
                  >
                    <td>{idx + 1}</td>
                    <td>
                      {editStrandId === s.strand_id ? (
                        <input
                          value={editStrandName}
                          onChange={(e) => setEditStrandName(e.target.value)}
                          className="form-control"
                          style={{ borderColor: "#800000" }}
                        />
                      ) : (
                        s.strand_name
                      )}
                    </td>
                    <td className="d-flex gap-2 flex-wrap">
                      {editStrandId === s.strand_id ? (
                        <button
                          className="btn btn-sm text-white"
                          style={{ backgroundColor: "#800000" }}
                          onClick={handleUpdateStrand}
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          className="btn btn-warning btn-sm text-white"
                          onClick={() =>
                            handleEditStrand(s.strand_id, s.strand_name)
                          }
                        >
                          <FaEdit /> Edit
                        </button>
                      )}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteStrand(s.strand_id)}
                      >
                        <FaTrashAlt /> Delete
                      </button>
                      <button
                        className="btn btn-sm text-white"
                        style={{ backgroundColor: "#a11b1b" }}
                        onClick={() => setSelectedStrand(s.strand_id)}
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION MANAGEMENT BOX */}
        {selectedStrand && (
          <div className="p-4 rounded shadow-sm" style={{ borderTop: "4px solid #800000", background: "#fff" }}>
            <h4 className="mb-3 fw-semibold" style={{ color: "#800000" }}>
              Sections for "{strands.find((s) => s.strand_id === selectedStrand)?.strand_name}"
            </h4>

            <div className="mb-3 d-flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="New section name..."
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                className="form-control flex-grow-1"
                style={{ borderColor: "#800000", borderRadius: "0.5rem" }}
              />
              <button
                className="btn text-white"
                style={{ backgroundColor: "#800000", borderRadius: "0.5rem" }}
                onClick={handleAddSection}
              >
                Add Section
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle" style={{fontSize:".8rem"}}>
                <thead className="text-white" style={{ backgroundColor: "#800000" }}>
                  <tr>
                    <th>#</th>
                    <th>Section Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((sec, idx) => (
                    <tr key={sec.section_id}>
                      <td>{idx + 1}</td>
                      <td>
                        {editSectionId === sec.section_id ? (
                          <input
                            value={editSectionName}
                            onChange={(e) => setEditSectionName(e.target.value)}
                            className="form-control"
                            style={{ borderColor: "#800000" }}
                          />
                        ) : (
                          sec.section_name
                        )}
                      </td>
                      <td className="d-flex gap-2 flex-wrap">
                        {editSectionId === sec.section_id ? (
                          <button
                            className="btn btn-sm text-white"
                            style={{ backgroundColor: "#800000" }}
                            onClick={handleUpdateSection}
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            className="btn btn-warning btn-sm text-white"
                            onClick={() =>
                              handleEditSection(sec.section_id, sec.section_name)
                            }
                          >
                            <FaEdit /> Edit
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteSection(sec.section_id)}
                        >
                          <FaTrashAlt /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminStrandSectionManagement;
