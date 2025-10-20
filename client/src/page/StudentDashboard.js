import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

function StudentDashboard({ user }) {
const [attendance, setAttendance] = useState([]);

useEffect(() => {
    const fetchAttendance = async () => {
    const res = await api.get(`/attendance/${user.user_id}`);
    setAttendance(res.data);
    };
    fetchAttendance();
}, [user]);

return (
    <div>
    <h2>Welcome, {user.name}</h2>
    <h3>Your Attendance</h3>
    <ul>
        {attendance.map((a) => (
        <li key={a.attendance_id}>
            {new Date(a.date_scanned).toLocaleString()}
        </li>
        ))}
    </ul>
    </div>
);
}

export default StudentDashboard;
