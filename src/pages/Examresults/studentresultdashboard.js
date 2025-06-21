// StudentClassDashboard.js
import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const dummyStudents = [
  {
    id: 3,
    name: "Anjali",
    year: 2025,
    grade: "Grade 2",
    section: "A",
    gender: "Female",
    subjects: {
      Science: { score: 88, participated: true, result: "Pass" },
      English: { score: 90, participated: true, result: "Pass" },
      "Phys. Ed": { score: 85, participated: true, result: "Pass" },
      Maths: { score: 82, participated: true, result: "Pass" },
      Arts: { score: 50, participated: true, result: "Pass" },
    },
  },
  {
    id: 4,
    name: "Sonia",
    year: 2025,
    grade: "Grade 2",
    section: "B",
    gender: "Female",
    subjects: {
      Science: { score: 75, participated: true, result: "Pass" },
      English: { score: 80, participated: true, result: "Pass" },
      "Phys. Ed": { score: 70, participated: true, result: "Pass" },
      Maths: { score: 60, participated: true, result: "Fail" },
      Arts: { score: 85, participated: true, result: "Pass" },
    },
  },
  {
    id: 5,
    name: "Priya",
    year: 2025,
    grade: "Grade 3",
    section: "A",
    gender: "Female",
    subjects: {
      Science: { score: 95, participated: true, result: "Pass" },
      English: { score: 92, participated: true, result: "Pass" },
      "Phys. Ed": { score: 89, participated: true, result: "Pass" },
      Maths: { score: 93, participated: true, result: "Pass" },
      Arts: { score: 94, participated: true, result: "Pass" },
    },
  },
  {
    id: 6,
    name: "Meena",
    year: 2025,
    grade: "Grade 3",
    section: "B",
    gender: "Female",
    subjects: {
      Science: { score: 80, participated: true, result: "Pass" },
      English: { score: 83, participated: true, result: "Pass" },
      "Phys. Ed": { score: 88, participated: true, result: "Pass" },
      Maths: { score: 77, participated: true, result: "Pass" },
      Arts: { score: 85, participated: true, result: "Pass" },
    },
  },
  {
    id: 7,
    name: "Riya",
    year: 2025,
    grade: "Grade 1",
    section: "B",
    gender: "Female",
    subjects: {
      Science: { score: 78, participated: true, result: "Pass" },
      English: { score: 79, participated: true, result: "Pass" },
      "Phys. Ed": { score: 82, participated: true, result: "Pass" },
      Maths: { score: 68, participated: true, result: "Fail" },
      Arts: { score: 90, participated: true, result: "Pass" },
    },
  },
  {
    id: 8,
    name: "Kavya",
    year: 2025,
    grade: "Grade 1",
    section: "C",
    gender: "Female",
    subjects: {
      Science: { score: 85, participated: true, result: "Pass" },
      English: { score: 88, participated: true, result: "Pass" },
      "Phys. Ed": { score: 80, participated: true, result: "Pass" },
      Maths: { score: 76, participated: true, result: "Pass" },
      Arts: { score: 84, participated: true, result: "Pass" },
    },
  },
  {
    id: 9,
    name: "Sneha",
    year: 2025,
    grade: "Grade 4",
    section: "A",
    gender: "Female",
    subjects: {
      Science: { score: 92, participated: true, result: "Pass" },
      English: { score: 90, participated: true, result: "Pass" },
      "Phys. Ed": { score: 87, participated: true, result: "Pass" },
      Maths: { score: 91, participated: true, result: "Pass" },
      Arts: { score: 86, participated: true, result: "Pass" },
    },
  },
  {
    id: 10,
    name: "Pooja",
    year: 2025,
    grade: "Grade 4",
    section: "B",
    gender: "Female",
    subjects: {
      Science: { score: 65, participated: true, result: "Fail" },
      English: { score: 70, participated: true, result: "Pass" },
      "Phys. Ed": { score: 72, participated: true, result: "Pass" },
      Maths: { score: 60, participated: true, result: "Fail" },
      Arts: { score: 75, participated: true, result: "Pass" },
    },
  },
  {
    id: 11,
    name: "Nisha",
    year: 2025,
    grade: "Grade 2",
    section: "C",
    gender: "Female",
    subjects: {
      Science: { score: 89, participated: true, result: "Pass" },
      English: { score: 87, participated: true, result: "Pass" },
      "Phys. Ed": { score: 84, participated: true, result: "Pass" },
      Maths: { score: 81, participated: true, result: "Pass" },
      Arts: { score: 82, participated: true, result: "Pass" },
    },
  },
  {
    id: 12,
    name: "Lakshmi",
    year: 2025,
    grade: "Grade 3",
    section: "C",
    gender: "Female",
    subjects: {
      Science: { score: 90, participated: true, result: "Pass" },
      English: { score: 91, participated: true, result: "Pass" },
      "Phys. Ed": { score: 89, participated: true, result: "Pass" },
      Maths: { score: 85, participated: true, result: "Pass" },
      Arts: { score: 87, participated: true, result: "Pass" },
    },
  },
  {
    id: 1,
    name: "Dev",
    year: 2025,
    grade: "Grade 1",
    section: "A",
    gender: "Male",
    subjects: {
      Science: { score: 92.25, participated: true, result: "Pass" },
      English: { score: 91.25, participated: true, result: "Pass" },
      "Phys. Ed": { score: 90.88, participated: true, result: "Pass" },
      Maths: { score: 84.25, participated: true, result: "Fail" },
      Arts: { score: 79.88, participated: false, result: "Not Attended" },
    },
  },
  {
    id: 2,
    name: "Vivek",
    year: 2025,
    grade: "Grade 1",
    section: "A",
    gender: "Male",
    subjects: {
      Science: { score: 87.0, participated: true, result: "Pass" },
      English: { score: 85.0, participated: true, result: "Pass" },
      "Phys. Ed": { score: 90.0, participated: true, result: "Pass" },
      Maths: { score: 70.0, participated: true, result: "Fail" },
      Arts: { score: 75.0, participated: false, result: "Not Attended" },
    },
  },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const cardStyle = {
  background: "#ffffff",
  padding: "16px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  flex: "1 1 150px",
};

const containerStyle = {
  display: "flex",
  gap: "20px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const StudentClassDashboard = () => {
  const [view, setView] = useState("student");
  const [selectedStudentId, setSelectedStudentId] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedGrade, setSelectedGrade] = useState("Grade 1");
  const [selectedSection, setSelectedSection] = useState("A");

  const selectedStudent = dummyStudents.find((s) => s.id === selectedStudentId);
  const studentsInClass = dummyStudents.filter(
    (s) =>
      s.year === selectedYear &&
      s.grade === selectedGrade &&
      s.section === selectedSection
  );

  const studentOptions = dummyStudents.map((s) => (
    <option key={s.id} value={s.id}>{s.name} (ID: {s.id})</option>
  ));

  const yearOptions = [...new Set(dummyStudents.map((s) => s.year))].map((year) => (
    <option key={year} value={year}>{year}</option>
  ));

  const classOptions = [...new Set(dummyStudents.map((s) => s.grade))].map((grade) => (
    <option key={grade} value={grade}>{grade}</option>
  ));

  const sectionOptions = [...new Set(dummyStudents.map((s) => s.section))].map((sec) => (
    <option key={sec} value={sec}>{sec}</option>
  ));

  const genderData = [
    {
      name: "Male",
      value: studentsInClass.filter((s) => s.gender === "Male").length,
    },
    {
      name: "Female",
      value: studentsInClass.filter((s) => s.gender === "Female").length,
    },
  ];

  const avgScores = selectedStudent
    ? Object.keys(selectedStudent.subjects).map((subject) => ({
        subject,
        score: selectedStudent.subjects[subject].score,
      }))
    : [];

  const participationData = selectedStudent
    ? Object.keys(selectedStudent.subjects).map((subject) => ({
        subject,
        participation: selectedStudent.subjects[subject].participated ? 100 : 0,
      }))
    : [];

  const examResultData = selectedStudent
    ? Object.keys(selectedStudent.subjects).map((subject) => {
        const status = selectedStudent.subjects[subject].result;
        return {
          subject,
          Pass: status === "Pass" ? 1 : 0,
          Fail: status === "Fail" ? 1 : 0,
          "Not Attended": status === "Not Attended" ? 1 : 0,
        };
      })
    : [];

  return (
    <div style={{ padding: "24px", fontFamily: "'Segoe UI', sans-serif", background: "#f0f2f5" }}>
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setView("student")} style={{ marginRight: "10px" }}>
          Student Wise
        </button>
        <button onClick={() => setView("class")}>Class Wise</button>
      </div>

      {view === "student" ? (
        <>
          <div style={containerStyle}>
            <div style={cardStyle}>
              <label><strong>Select Student:</strong></label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(parseInt(e.target.value))}
                style={{ width: "100%", padding: "6px", marginTop: "6px" }}
              >
                {studentOptions}
              </select>
            </div>
          </div>

          <div style={containerStyle}>
            <div style={{ ...cardStyle, flex: "1 1 220px" }}>
              <h3 style={{ marginBottom: "10px" }}>🎓 Student Profile</h3>
              <p><strong>Name:</strong> {selectedStudent.name}</p>
              <p><strong>ID:</strong> {selectedStudent.id}</p>
              <p><strong>Grade:</strong> {selectedStudent.grade}</p>
              <p><strong>Section:</strong> {selectedStudent.section}</p>
            </div>
            {avgScores.map((item) => (
              <div key={item.subject} style={cardStyle}>
                <h4 style={{ marginBottom: "8px" }}>{item.subject}</h4>
                <p style={{ fontSize: "20px", fontWeight: "bold" }}>{item.score}</p>
              </div>
            ))}
          </div>

          <div style={containerStyle}>
            <div style={{ ...cardStyle, flex: "1 1 500px", height: "300px" }}>
              <h4>📊 Participation Rate</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={participationData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="subject" />
                  <Bar dataKey="participation" fill="#ffc107" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ ...cardStyle, flex: "1 1 500px", height: "300px" }}>
              <h4>📋 Exam Results</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={examResultData}>
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Pass" fill="green" />
                  <Bar dataKey="Fail" fill="red" />
                  <Bar dataKey="Not Attended" fill="orange" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={containerStyle}>
            <div style={cardStyle}>
              <label><strong>Select Year:</strong></label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} style={{ width: "100%", padding: "6px", marginTop: "6px" }}>
                {yearOptions}
              </select>
            </div>
            <div style={cardStyle}>
              <label><strong>Select Grade:</strong></label>
              <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} style={{ width: "100%", padding: "6px", marginTop: "6px" }}>
                {classOptions}
              </select>
            </div>
            <div style={cardStyle}>
              <label><strong>Select Section:</strong></label>
              <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} style={{ width: "100%", padding: "6px", marginTop: "6px" }}>
                {sectionOptions}
              </select>
            </div>
          </div>

          <h2 style={{ marginTop: "10px", marginBottom: "20px" }}>📘 Class Dashboard - {selectedGrade} {selectedSection}</h2>
          <div style={{ ...cardStyle, width: "300px", height: "300px" }}>
            <h4>👥 Gender Breakdown</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" outerRadius={80}>
                  {genderData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentClassDashboard;
