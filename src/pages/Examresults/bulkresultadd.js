import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form, Table } from "react-bootstrap";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { fetchDataRead } from "../../Utility";
 
function BulkAddExamResult() {
  const routeLocation = useLocation();
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
 
  const userData = sessionStorage.getItem('user');
  const userObj = userData ? JSON.parse(userData) : {};
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
 
  const [form, setForm] = useState({
    exam_id: 0,
    school_id: 0,
    subject_id: 0,
    section_id: 0,
    class_id: 0,
    student_id: 0,
    academic_year_id: 0,
    marks: "",
    remarks: "",
  });
 
  const [studentMarks, setStudentMarks] = useState([]);
 
  useEffect(() => {
    fetchDataRead("/classes", setClasses, userObj.school_id);
    fetchDataRead("/students", setStudents, userObj.school_id);
    fetchDataRead("/subjectmaster", setSubjects, userObj.school_id);
    fetchDataRead("/exammaster", setExams, userObj.school_id);
    fetchDataRead("/grades", setGrades, userObj.school_id);
    fetchDataRead("/Sections", setSections, userObj.school_id);
    fetchDataRead("/AcademicYear", setAcademicYears, userObj.school_id);
  }, []);
 
  useEffect(() => {
    if (routeLocation.state?.userData) {
      const userData = routeLocation.state.userData;
      setForm(userData);
      setEditId(userData.exam_results_id);
 
     
      if (userData.studentMarks && userData.studentMarks.length > 0) {
        setStudentMarks(userData.studentMarks);
      } else {
        setStudentMarks([]);
      }
 
      console.log("Editing Exam Result:", userData);
      window.history.replaceState({}, document.title);
    }
  }, [routeLocation]);
 
 
  useEffect(() => {
    if (form.class_id) {
      const updatedSections = sections.filter(section => section.class_id === parseInt(form.class_id, 10));
      setFilteredSections(updatedSections);
 
      if (!updatedSections.find(sec => sec.section_id === parseInt(form.section_id, 10))) {
        console.warn("Section ID not found in filtered sections:", form.section_id);
      }
    }
  }, [form.class_id, sections]);
  useEffect(() => {
    if (filteredSections.length > 0 && form.section_id) {
      setForm(prev => ({
        ...prev,
        section_id: filteredSections.find(sec => sec.section_id === form.section_id)?.section_id || "",
      }));
    }
  }, [filteredSections]);
 
  useEffect(() => {
    if (form.section_id) {
     
      const updatedStudents = students.filter(student => student.section_id === parseInt(form.section_id, 10));
 
   
      if (editId && routeLocation.state?.userData?.student_id) {
        const { student_id, subject_id, marks } = routeLocation.state.userData;
     
        const studentToEdit = updatedStudents.find(student => student.student_id === student_id);
     
        if (!studentToEdit) {
          console.warn("❌ Student not found");
          return;
        }
     
        const updatedStudent = {
          ...studentToEdit,
          subjects: Array.isArray(studentToEdit.subjects)
            ? studentToEdit.subjects.map(subject => {
                if (subject.subject_id === subject_id) {
                  return { ...subject, marks };
                }
                return subject;
              })
            : [],
        };
     
   
        setStudentMarks([{
          student_id,
          subject_id,
          marks,
        }]);
     
        setFilteredStudents([updatedStudent]);
      }
     
      else {
       
        if (JSON.stringify(updatedStudents) !== JSON.stringify(filteredStudents)) {
          setFilteredStudents(updatedStudents);
        }
      }
 
     
    }
  }, [form.section_id, students, editId, routeLocation.state?.userData]);
 
   
 
  useEffect(() => {
    if (form.exam_id && form.academic_year_id && form.class_id && form.section_id) {
      const updatedSubjects = subjects.filter(subject => subject.class_id === parseInt(form.class_id, 10));
 
   
      if (JSON.stringify(updatedSubjects) !== JSON.stringify(filteredSubjects)) {
        setFilteredSubjects(updatedSubjects);
      }
    }
  }, [form.exam_id, form.academic_year_id, form.class_id, form.section_id, subjects]);
 
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));
  };
  
  useEffect(() => {
    const fetchExistingResults = async () => {
      if (
        form.exam_id &&
        form.academic_year_id &&
        form.class_id &&
        form.section_id
      ) {
        try {
          const response = await axios.post(`${baseUrl}/examresults/filter`, {
            exam_id: form.exam_id,
            academic_year_id: form.academic_year_id,
            class_id: form.class_id,
            section_id: form.section_id,
            school_id: userObj.school_id,
          });
  
          if (response.status === 200 && Array.isArray(response.data)) {
            setStudentMarks(response.data); // Pre-fill marks if available
          } else {
            setStudentMarks([]);
          }
        } catch (error) {
          console.error("Error fetching exam results", error);
          toast.error("Failed to load existing marks.");
        }
      }
    };
  
    fetchExistingResults();
  }, [
    form.exam_id,
    form.academic_year_id,
    form.class_id,
    form.section_id,
    userObj.school_id,
  ]);
  
 
  const handleMarksChange = (e, studentId, subjectId) => {
    let value = e.target.value;
 
 
    value = value === "" ? "" : parseInt(value, 10);
 
 
    const grade = grades.find((grade) => value >= grade.min_marks && value <= grade.max_marks);
 
    if (value === "" || (value >= 0 && value <= 100)) {
      setStudentMarks((prevMarks) => {
        const newMarks = [...prevMarks];
        const studentIndex = newMarks.findIndex(mark => mark.student_id === studentId && mark.subject_id === subjectId);
 
        if (studentIndex >= 0) {
          newMarks[studentIndex].marks = value;
          newMarks[studentIndex].grade_id = grade ? grade.grade_id : 0; // Set grade_id based on grade
        } else {
          newMarks.push({ student_id: studentId, subject_id: subjectId, marks: value, grade_id: grade ? grade.grade_id : 0 });
        }
        return newMarks;
      });
    } else if (value > 100) {
      setStudentMarks((prevMarks) => {
        const newMarks = [...prevMarks];
        const studentIndex = newMarks.findIndex(mark => mark.student_id === studentId && mark.subject_id === subjectId);
 
        if (studentIndex >= 0) {
          newMarks[studentIndex].marks = 100;
          newMarks[studentIndex].grade_id = grades.find(grade => grade.min_marks <= 100 && grade.max_marks >= 100).grade_id;
        } else {
          newMarks.push({ student_id: studentId, subject_id: subjectId, marks: 100, grade_id: grades.find(grade => grade.min_marks <= 100 && grade.max_marks >= 100).grade_id });
        }
        return newMarks;
      });
    }
  };
 
 
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
   
    const bulkData = studentMarks.map((studentMark) => ({
      exam_id: form.exam_id || 0,
      school_id: userObj.school_id,
      class_id: form.class_id || 0,
      section_id: form.section_id || 0,
      academic_year_id: userObj.academic_year_id || 0,
      remarks: form.remarks || "",
      action: editId !== null ? "UPDATE" : "CREATE",
      subject_id: studentMark.subject_id,
      student_id: studentMark.student_id,
      marks: studentMark.marks||0,
      grade_id: studentMark.grade_id || 0,
      exam_results_id: editId !== null ? editId : 0
    }));
 
   
    try {
      const response = await axios.post(`${baseUrl}/examresults/bulk/`, bulkData, {
        headers: { "Content-Type": "application/json" },
      });
 
      if (response.status === 201) {
        toast.success(editId !== null ? "Records updated successfully" : "Records added successfully");
        setEditId(null);
        setStudentMarks([]);
        setForm({
          exam_id: 0,
          school_id: 0,
          subject_id: 0,
          class_id: 0,
          student_id: 0,
          section_id: 0,
          academic_year_id: 0,
          marks: "",
          remarks: "",
          grade_id: 0,
        });
      } else {
        toast.error("Unexpected response from the server. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
 
      if (error.response) {
        const { status, data } = error.response;
        const errorMessage = data?.error || "An error occurred.";
 
        switch (status) {
          case 400:
            toast.error(errorMessage.includes("Exam schedule not found") ? "Exam schedule not found." : "Invalid request. Please check your input.");
            break;
          case 409:
            toast.error("Record already exists for this student and exam.");
            break;
          case 500:
            toast.error("Server error while saving the data. Please try again later.");
            break;
          default:
            toast.error("An unexpected error occurred. Please try again.");
            break;
        }
      } else if (error.request) {
        toast.error("No response from the server. Please check your internet connection.");
      } else {
        toast.error("An error occurred while submitting the data.");
      }
    }
  };
 
  return (
    <Container fluid>
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
                        <h6 className="commonSectionTitle">Results Details</h6>
                      </Col>
                    </Row>
 
                 
                    <Row>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className="commonInput">
                          <Form.Group>
                            <Form.Label>Select Academic Year<span className="requiredStar">*</span></Form.Label>
                            <Form.Select
                              required
                              id="academic_year_id"
                              value={form.academic_year_id}
                              onChange={handleInputChange}
                            >
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
                            <Form.Label>Select Exam<span className="requiredStar">*</span></Form.Label>
                            <Form.Select
                              required
                              id="exam_id"
                              value={form.exam_id}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Exam</option>
                              {(exams || []).filter((exam) => exam.is_active === "Active")
                                .map((exam) => (
                                  <option key={exam.exam_id} value={exam.exam_id}>{exam.exam_name}</option>
                                ))}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </Col>
 
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className="commonInput">
                          <Form.Group>
                            <Form.Label>Select Class<span className="requiredStar">*</span></Form.Label>
                            <Form.Select
                              id="class_id"
                              value={form.class_id}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Class</option>
                              {(classes || []).filter((classItem) => classItem.is_active === "Active")
                                .map((classItem) => (
                                  <option key={classItem.class_id} value={classItem.class_id}>{classItem.class_name}</option>
                                ))}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </Col>
 
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className="commonInput">
                          <Form.Group>
                            <Form.Label>Select Section<span className="requiredStar">*</span></Form.Label>
                            <Form.Select
                              id="section_id"
                              value={form.section_id || ""}
                              onChange={handleInputChange}
                              required
                              disabled={!form.class_id}
                            >
                              <option value="">Select Section</option>
                              {(filteredSections || []).filter((section) => section.is_active === "Active")
                                .map((section) => (
                                  <option key={section.section_id} value={section.section_id}>
                                    {section.section_name}
                                  </option>
                                ))}
                            </Form.Select>
 
                          </Form.Group>
                        </div>
                      </Col>
                    </Row>
 
                 
                    {filteredStudents.length > 0 && subjects.length > 0 && (
                      <Row>
                        <Col xs={12} className="scrollable-table">
                          <Table bordered striped responsive hover>
                            <thead className="thead-light" >
                              <tr>
                                <th>Student Name</th>
                                {subjects
                                  .filter(subject => subject.is_active === "Active")
                                  .map(subject => (
                                    <th key={subject.subject_id}>{subject.subject_name}</th>
                                  ))}
                              </tr>
                            </thead>
                            <tbody>
                              
                              {filteredStudents.map((student) => (
                                <tr key={student.student_id}>
                                  <td>{student.student_first_name} {student.student_last_name}</td>
                                  {subjects
                                    .filter(subject => subject.is_active === "Active")
                                    .map(subject => (
                                      <td key={subject.subject_id}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Form.Control
                                          type="number"
                                          min="0"
                                          max="100"
                                          value={
                                            studentMarks.find(mark =>
                                              mark.student_id === student.student_id &&
                                              mark.subject_id === subject.subject_id
                                            )?.marks || ""
                                          }
                                          onChange={(e) => handleMarksChange(e, student.student_id, subject.subject_id)}
                                          style={{ marginRight: '10px' }}
/>
 
                                          <span className="grade-box">
                                            {studentMarks.map((mark) => {
                                              if (mark.student_id === student.student_id && mark.subject_id === subject.subject_id) {
                                                const grade = grades.find((grade) =>
                                                  mark.marks >= grade.min_marks &&
                                                  mark.marks <= grade.max_marks
                                                );
                                                return grade ? grade.grade_name : "";
                                              }
                                            })}
                                          </span>
                                        </div>
                                      </td>
                                    ))}
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </Col>
                      </Row>
                    )}
 
 
                    <div className="d-flex justify-content-between mt-3">
                      <Button
                        type="button"
                        className="btn btn-info clearBtn"
                        onClick={() => setForm({
                          exam_id: 0,
                          school_id: "",
                          subject_id: 0,
                          class_id: 0,
                          section_id: 0,
                          student_id: 0,
                          academic_year_id: 0,
                          marks: "",
                          remarks: ""
                        })}
                      >
                        Reset
                      </Button>
                      <div>
                        <Button type="button" variant="danger" className="btn-danger secondaryBtn" onClick={() => window.history.back()}>
                          Cancel
                        </Button>
                        <Button type="submit" variant="success" className="btn btn-success primaryBtn">
                          Submit
                        </Button>
                      </div>
                    </div>
                  </form>
                </Card.Body>
              </Card>
            </Container>
          </div>
        </div>
      </div>
    </Container>
  );
}
 
export default BulkAddExamResult;
 
 