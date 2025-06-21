import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from 'react-select';
import { ToastContainer, toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { fetchDataRead } from "../../Utility";

function AddExamResult() {
  const routeLocation = useLocation();
  const userData = sessionStorage.getItem("user");
  const userObj = userData ? JSON.parse(userData) : {};
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const [editId, setEditId] = useState(null);
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [exams, setExams] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [studentMarks, setStudentMarks] = useState([]);

  const [form, setForm] = useState({
    exam_id: 0,
    school_id: userObj.school_id,
    subject_id: 0,
    section_id: 0,
    class_id: 0,
    student_id: 0,
    academic_year_id: 0,
    marks: "",
    remarks: "",
  });

  const init = async () => {
    await fetchDataRead("/classes/", setClasses, userObj.school_id);
    await fetchDataRead("/exammaster/", setExams, userObj.school_id);
    await fetchDataRead("/AcademicYear/", setAcademicYears, userObj.school_id);
    await fetchDataRead("/grades/", setGrades, userObj.school_id);

    if (routeLocation.state) {
      const subjectEntries = Object.values(routeLocation.state).filter((entry) => entry.subject_id);
      if (subjectEntries.length > 0) {
        const first = subjectEntries[0];
        setForm((prev) => ({
          ...prev,
          academic_year_id: first.academic_year_id || 0,
          class_id: first.class_id || 0,
          section_id: first.section_id || 0,
          exam_id: first.exam_id || 0,
          student_id: first.student_id || 0,
          remarks: first.remarks || "",
        }));
        setEditId(first.exam_results_id || null);

        fetchSections(first.class_id);
        fetchStudents(first.class_id, first.section_id);
        fetchSubjects(first.class_id, first.section_id);

        setStudentMarks(subjectEntries.map((entry) => ({
          exam_results_id: entry.exam_results_id,
          student_id: entry.student_id,
          subject_id: entry.subject_id,
          marks: entry.marks,
          grade_id: entry.grade_id,
          remarks: entry.remarks,
        })));
        window.history.replaceState({}, document.title);
      }
    }
  };

  useEffect(() => {
    init();
  }, []);

  const fetchSections = async (class_id) => {
    try {
      const res = await axios.post(`${baseUrl}/Sections/`, {
        action: "DROPDOWNREAD",
        school_id: userObj.school_id,
        class_id,
        academic_year_id: userObj.academic_year_id,
      });
      const data = res.data || [];
      const active = data.filter((item) => item.is_active?.toLowerCase() === "active");
      setSections(active);
      setFilteredSections(active);
    } catch (err) {
      console.error("Error fetching sections", err);
    }
  };

  const fetchStudents = async (class_id, section_id) => {
    try {
      const res = await axios.post(`${baseUrl}/students/`, {
        action: "FILTER",
        school_id: userObj.school_id,
        class_id,
        section_id,
        academic_year_id: userObj.academic_year_id,
      });
      const data = res.data || [];
      const active = data.filter((item) => item.status?.toLowerCase() === "active");
      setFilteredStudents(active);
    } catch (err) {
      console.error("Error fetching students", err);
    }
  };

  const fetchSubjects = async (class_id, section_id) => {
    try {
      const res = await axios.post(`${baseUrl}/teacherssubjectsmap/`, {
        action: "FILTER",
        school_id: userObj.school_id,
        class_id,
        section_id,
        academic_year_id: userObj.academic_year_id,
      });
      setFilteredSubjects(res.data || []);
    } catch (err) {
      console.error("Error fetching subjects", err);
    }
  };
  const studentOptions = (filteredStudents || [])
    .filter((student) => student.status === "Active")
    .map((student) => ({
      value: student.student_id,
      label: `${student.student_first_name} ${student.student_last_name}`,
    }));
  const fetchStudentMarks = async (exam_id, student_id) => {
    try {
      const res = await axios.post(`${baseUrl}/examresults/`, {
        exam_id,
        student_id,
        school_id: userObj.school_id,
        action: "FILTER",
      });
      if (res.data?.length) {
        const first = res.data[0];
        setForm((prev) => ({
          ...prev,
          academic_year_id: first.academic_year_id,
          class_id: first.class_id,
          section_id: first.section_id,
        }));
        setStudentMarks(res.data.map((entry) => ({
          exam_results_id: entry.exam_results_id,
          student_id: entry.student_id,
          subject_id: entry.subject_id,
          marks: entry.marks,
          grade_id: entry.grade_id,
          remarks: entry.remarks,
        })));
        setEditId(first.exam_results_id || null);
      } else {
        setStudentMarks([]);
        setEditId(null);
        toast.info("No marks found for this student");
      }
    } catch (err) {
      console.error("Error fetching student marks", err);
    }
  };

  const handleInputChange = async (e) => {
    const { id, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [id]: value };

      if (id === "class_id") {
        fetchSections(parseInt(value));
        setFilteredStudents([]);
        setFilteredSubjects([]);
      }

      if (id === "section_id") {
        const class_id = parseInt(form.class_id);
        const section_id = parseInt(value);
        fetchStudents(class_id, section_id);
        fetchSubjects(class_id, section_id);
      }

      if (id === "student_id" && form.exam_id) {
        fetchStudentMarks(form.exam_id, parseInt(value));
      }

      return updated;
    });
  };

  const handleMarksChange = (e, studentId, subjectId) => {
    let raw = e.target.value;

    // ✅ Allow empty string for editing
    if (raw === "") {
      updateMarkEntry("", studentId, subjectId);
      return;
    }

    // ❌ Block if not a valid positive integer
    if (!/^\d+$/.test(raw)) return;

    let value = parseInt(raw, 10);

    // ❌ Block values over 100
    if (value > 100) value = 100;

    updateMarkEntry(value, studentId, subjectId);
  };

  const updateMarkEntry = (value, studentId, subjectId) => {
    setStudentMarks((prevMarks) => {
      const updated = [...prevMarks];
      const index = updated.findIndex(
        (mark) => mark.student_id === studentId && mark.subject_id === subjectId
      );
      const existing = updated[index];

      const grade = grades.find(
        (g) =>
          value >= g.min_marks &&
          value <= g.max_marks &&
          g.subject_id === subjectId
      );

      const newEntry = {
        student_id: studentId,
        subject_id: subjectId,
        marks: value,
        grade_id: grade?.grade_id || 0,
        remarks: existing?.remarks || "",
        exam_results_id: existing?.exam_results_id || 0,
      };

      if (index >= 0) updated[index] = newEntry;
      else updated.push(newEntry);

      return updated;
    });
  };


  const handleRemarksChange = (e, studentId, subjectId) => {
    const value = e.target.value;
    setStudentMarks((prevMarks) => {
      const updated = [...prevMarks];
      const index = updated.findIndex(
        (mark) => mark.student_id === studentId && mark.subject_id === subjectId
      );
      if (index >= 0) {
        updated[index] = { ...updated[index], remarks: value };
      } else {
        updated.push({
          student_id: studentId,
          subject_id: subjectId,
          marks: 0,
          grade_id: 0,
          remarks: value,
        });
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const studentId = parseInt(form.student_id);
    const allSubjectsData = filteredSubjects
      .filter((subject) => subject.is_active === "Active")
      .map((subject) => {
        const mark = studentMarks.find(
          (m) => m.student_id === studentId && m.subject_id === subject.subject_id
        );
        const marks = typeof mark?.marks === "number" ? mark.marks : 0;
        const grade = grades.find((g) => marks >= g.min_marks && marks <= g.max_marks);
        return {
          exam_id: form.exam_id,
          school_id: userObj.school_id,
          class_id: form.class_id,
          section_id: form.section_id,
          academic_year_id: userObj.academic_year_id,
          remarks: mark?.remarks || "",
          action: editId !== null ? "UPDATE" : "CREATE",
          subject_id: subject.subject_id,
          student_id: studentId,
          marks: marks,
          grade_id: grade?.grade_id || 0,
          exam_results_id: mark?.exam_results_id || 0,
        };
      });

    try {
      const response = await axios.post(`${baseUrl}/examresults/bulk/`, allSubjectsData, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.status === 201) {
        toast.success(editId ? "Records updated successfully" : "Records added successfully");
        setEditId(null);
        setStudentMarks([]);
        setForm({
          exam_id: 0,
          school_id: userObj.school_id,
          subject_id: 0,
          class_id: 0,
          section_id: 0,
          student_id: 0,
          academic_year_id: 0,
          marks: "",
          remarks: "",
        });
      } else {
        toast.error("Unexpected response from server.");
      }
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.error || "Something went wrong.";
      if (status === 400 && message.includes("Exam schedule not found")) {
        toast.error("Exam schedule not found.");
      } else if (status === 409) {
        toast.error("Record Already Exists, Please Edit");
      } else {
        toast.error(message);
      }
    }
  };
  return (

    <div className="pageMain">
      <ToastContainer />
      <LeftNav />
      <div className="pageRight">
        <div className="pageHead">
          <Header />
        </div>
        <div className="pageBody">
          <Container fluid>
            <Card>
              <Card.Body>
                <form onSubmit={handleSubmit}>
                  <Row>
                    <Col xs={12}>
                      <h6 className="commonSectionTitle">Exam Results Details</h6>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} md={6} lg={4} xxl={3}>
                      <div className="commonInput">
                        <Form.Group>
                          <Form.Label>Academic Year<span className="requiredStar">*</span></Form.Label>
                          <Form.Select required id="academic_year_id" value={form.academic_year_id} onChange={handleInputChange}>
                            <option value="0" disabled hidden>{userObj.academic_year_name}</option>
                            {(academicYears || []).map((aca) => (
                              <option key={aca.academic_year_id} value={aca.academic_year_id}>{aca.academic_year_name}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </Col>
                    <Col xs={12} md={6} lg={4} xxl={3}>
                      <div className="commonInput">
                        <Form.Group>
                          <Form.Label>
                            Exam
                            <span className="requiredStar">*</span>
                          </Form.Label>
                          <Form.Select required id="exam_id" value={form.exam_id} onChange={handleInputChange}>
                            <option value="">Select Exam</option>
                            {(exams || []).filter((exam) => exam.is_active === "Active").map((exam) => (<option key={exam.exam_id} value={exam.exam_id}>  {exam.exam_name} </option>))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </Col>
                    <Col xs={12} md={6} lg={4} xxl={3}>
                      <div className="commonInput">
                        <Form.Group>
                          <Form.Label>
                            Class
                            <span className="requiredStar">*</span>
                          </Form.Label>
                          <Form.Select id="class_id" value={form.class_id} onChange={handleInputChange} required>
                            <option value="">Select Class</option>
                            {(classes || []).filter((classItem) => classItem.is_active === "Active").map((classItem) => (
                              <option key={classItem.class_id} value={classItem.class_id}> {classItem.class_name} </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </Col>
                    <Col xs={12} md={6} lg={4} xxl={3}>
                      <div className="commonInput">
                        <Form.Group>
                          <Form.Label>Section<span className="requiredStar">*</span> </Form.Label>
                          <Form.Select id="section_id" value={form.section_id || ""} onChange={handleInputChange} required disabled={!form.class_id}>
                            <option value="">Select Section</option>
                            {(filteredSections || []).filter((section) => section.is_active === "Active")
                              .map((section) => (<option key={section.section_id} value={section.section_id}> {section.section_name}   </option>
                              ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </Col>
                    <Row className="align-items-start">
                      {/* Student Dropdown */}


                      <Col xs={12} md={4} lg={3}>
                        <div className="commonInput">
                          <Form.Group>
                            <Form.Label>
                              Student <span className="requiredStar">*</span>
                            </Form.Label>
                            <Select
                              id="student_id"
                              options={studentOptions}
                              required
                              value={studentOptions.find((option) => option.value === form.student_id) || null}
                              onChange={(selectedOption) =>
                                handleInputChange({
                                  target: {
                                    id: 'student_id',
                                    value: selectedOption ? selectedOption.value : '',
                                  },
                                })
                              }
                              isClearable
                              placeholder="Select Student"
                            />
                          </Form.Group>
                        </div>
                      </Col>

                      <br />
                      {filteredSubjects.length > 0 && (
                        <Col xs={12} md={8} lg={9}>
                          <div
                            className="border rounded p-2"
                            style={{ maxHeight: "350px", overflowY: "auto", background: "#f9f9f9", }}>
                            <div className="d-none d-md-flex fw-bold border-bottom pb-1 mb-2 text-dark small">
                              <div className="flex-grow-1">Subject</div>
                              <div style={{ width: "80px" }}>Marks</div>
                              <div style={{ width: "80px" }}>Grade</div>
                              <div style={{ width: "300px" }}>Remarks</div>
                            </div>
                            {filteredSubjects
                              .filter((subject) => subject.is_active === "Active")
                              .map((subject) => {
                                const mark = studentMarks.find(
                                  (m) =>
                                    m.student_id === parseInt(form.student_id) &&
                                    m.subject_id === subject.subject_id
                                );
                                const grade = grades.find(
                                  (g) =>
                                    g.subject_id === subject.subject_id &&
                                    mark?.marks >= g.min_marks &&
                                    mark?.marks <= g.max_marks
                                );
                                return (
                                  <div
                                    key={subject.subject_id}
                                    className="d-flex align-items-center mb-2 small"
                                  >
                                    <div className="flex-grow-1 text-truncate">
                                      {subject.subject_name}
                                    </div>

                                    <div style={{ width: "80px" }}>
                                      <Form.Control size="sm" type="number" min="0" max="100" value={mark?.marks ?? 0}
                                        onKeyDown={(e) => {
                                          if (["e", "E", "-"].includes(e.key)) {
                                            e.preventDefault();
                                          }
                                        }}
                                        onChange={(e) =>
                                          handleMarksChange(e, parseInt(form.student_id), subject.subject_id)
                                        }
                                      />

                                    </div>
                                    <input type="hidden" value={mark?.exam_results_id ?? ""} name={`exam_result_id_${subject.subject_id}`} />
                                    <div style={{ width: "80px" }} className="text-center">  {grade?.grade_name ?? "-"} </div>
                                    <div style={{ width: "300px" }}>
                                      <Form.Control size="sm" type="text" maxLength={150} value={mark?.remarks ?? ""}
                                        onChange={(e) =>
                                          handleRemarksChange(e, parseInt(form.student_id), subject.subject_id)
                                        }
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </Col>
                      )}
                    </Row>
                  </Row>
                  <div className="d-flex justify-content-between mt-3">
                    <Button
                      type="button"
                      className="btn btn-info clearBtn"
                      onClick={() => {
                        setForm({
                          exam_id: 0,
                          school_id: userObj.school_id || 0,
                          subject_id: 0,
                          class_id: 0,
                          section_id: 0,
                          student_id: 0,
                          academic_year_id: 0,
                          marks: "",
                          remarks: "",
                        });
                        setStudentMarks([]);
                        setFilteredSubjects([]); // ✅ Clear filteredSubjects
                      }}
                    >
                      Reset
                    </Button>

                    <div>
                      <Button type="button" variant="danger" className="btn-danger secondaryBtn" onClick={() => window.history.back()}>   Cancel  </Button>
                      <Button type="submit" variant="success" className="btn btn-success primaryBtn">   Submit   </Button>
                    </div>
                  </div>
                </form>
              </Card.Body>
            </Card>
          </Container>
        </div>
      </div>
    </div>
  );
}
export default AddExamResult;
