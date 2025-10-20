import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import api from "../api/axiosConfig";

function Profile({ userId }) {
  const [profile, setProfile] = useState({ name: "", email: "", password: "" });

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/profile/${userId}`);
      setProfile({ ...res.data, password: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to fetch profile");
    }
  };

  useEffect(() => { fetchProfile(); }, [userId]);

  const handleChange = (e) => { setProfile({ ...profile, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/profile/${userId}`, profile);
      alert("✅ Profile updated successfully");
      setProfile({ ...profile, password: "" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container d-flex justify-content-center mt-5">
      <div className="card p-4" style={{ width: "100%", maxWidth: "500px", borderRadius: "0.5rem", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
        <h2 className="text-center mb-4" style={{ color: "#800000" }}><FaUserCircle className="me-2" />My Profile</h2>
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <input type="text" name="name" placeholder="Name" value={profile.name} onChange={handleChange} required className="form-control" />
          <input type="email" name="email" placeholder="Email" value={profile.email} onChange={handleChange} required className="form-control" />
          <input type="password" name="password" placeholder="New Password (leave blank to keep)" value={profile.password} onChange={handleChange} className="form-control" />
          <button type="submit" className="btn" style={{ backgroundColor: "#800000", color: "#fff" }}>Update Profile</button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
