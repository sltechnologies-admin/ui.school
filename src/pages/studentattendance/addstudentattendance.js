import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { fetchDataRead } from "../../Utility";

function AddStudentAttendance() {
    const [editId, setEditId] = useState(null);
    const routeLocation = useLocation();
    const [schools, setSchools] = useState([]);
    const [students, setStudents] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [filteredSections, setFilteredSections] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);

    const userData = sessionStorage.getItem('user');
   const userObj = userData ? JSON.parse(userData) : {};
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    const [form, setForm] = useState({
        attendance_id: 0,
        student_id: 0,
        attendace_date: "",
        is_present: "",
        absent_reason: "",
        academic_year_id: 0,
        school_id: userObj.school_id,
        class_id: 0,
        section_id: 0,
        action: "",
    });
    const fetchsections = async (userId,class_id ) => {
        try {
            const response = await axios.post(baseUrl + "/Sections/", {
                action: "READ",
                school_id: userId,
                class_id: class_id,
            });
            setFilteredSections(response.data);
        } catch (error) {
            console.error("Error fetching item combination:", error);
        }
    };
    const fetchstudents = async (userId, section_id) => {
        try {
            const response = await axios.post(baseUrl + "/students/", {
                action: "READ",
                school_id: userId,
                section_id: section_id,
            });
            setFilteredStudents(response.data);
        } catch (error) {
            console.error("Error fetching item combination:", error);
        }
    };

    useEffect(() => {
        document.title = "Add Attendance";
        fetchDataRead("/schoolmaster", setSchools, userObj.school_id);
        fetchDataRead("/AcademicYear", setAcademicYears, userObj.school_id);

        // Fetch all classes, sections, and students
        fetchDataRead("/classes", setClasses, userObj.school_id);
        fetchDataRead("/Sections", setSections, userObj.school_id);
        fetchDataRead("/students", setStudents, userObj.school_id);
        
    }, []);

    useEffect(() => {
        if (routeLocation.state?.userData) {
            const userData = routeLocation.state.userData;
            // console.log("edit",userData)

            setForm(userData);
            setEditId(userData.attendance_id);
            fetchsections(userData.school_id, userData.class_id);
            fetchstudents(userData.school_id,userData.section_id)
        }
        
    }, [routeLocation]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;

        setForm((prevForm) => ({
            ...prevForm,
            [id]: value
        }));

      
        if (id === "class_id") {
            const filtered = sections.filter(section => section.class_id === parseInt(value));
            setFilteredSections(filtered);
            setForm((prevForm) => ({
                ...prevForm,
                section_id: "",
                student_id: "" 
            }));
            setFilteredStudents([]);
        }
        if (id === "section_id") {
            const filtered = students.filter(student => student.section_id === parseInt(value));
            setFilteredStudents(filtered);
            setForm((prevForm) => ({
                ...prevForm,
                student_id: "" 
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            attendance_id: editId,
            student_id: form.student_id,
            attendace_date: form.attendace_date,
            is_present: form.is_present === "true",
            absent_reason: form.absent_reason,
            academic_year_id: form.academic_year_id,
            school_id: userObj.school_id,
            class_id: form.class_id,
            section_id: form.section_id,
            action: editId !== null ? "UPDATE" : "CREATE",
        };
        // console.log('====================================');
        // console.log(formData);
        // console.log('====================================');

        try {
            await axios.post(`${baseUrl}/StudentAttendance/`, formData, {
                headers: { "Content-Type": "application/json" },
            });

            toast.success(editId ? "Record updated successfully" : "Record added successfully");
            setEditId(null);

            setForm({
                attendance_id: "",
                student_id: "",
                attendace_date: "",
                is_present: "",
                absent_reason: "",
                academic_year_id: "",
                school_id: userObj.school_id,
                class_id: "",
                section_id: "",
                action: "",
            });

            setFilteredSections([]);
            setFilteredStudents([]);

        } catch (error) {
            console.error("Error submitting data:", error.response?.data || error.message);

           
            if (error.response) {
                if (error.response.status === 400) {
                    toast.error("Attendance alread added");
                } else if (error.response.status === 404) {
                    toast.error("Data not found: " + error.response.data.detail);
                } else if (error.response.status === 500) {
                    toast.error("Server error, please try again later.");
                } else {
                    toast.error("Unexpected error: " + error.response.data.detail);
                }
            } else {
                toast.error("Network error, please check your connection.");
            }
        }
    };
    return (
        <Container fluid>
            <ToastContainer />
            <div className="pageMain">
                <LeftNav />
                <div className="pageRight">
                    <div className="pageHead">
                        <Header />
                    </div>
                    <div className="pageBody">
                        <div className='height100 innerPage'>     
                            <Card>
                                <Card.Body>
                                    <form onSubmit={handleSubmit}>
                                        <div className='innerPageBody'>
                                        <Row>
                                            <Col xs={12}>
                                                <h6 className='commonSectionTitle'>Add Attendance</h6>
                                            </Col>
                                        </Row>

                                            <Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <Form.Group>
                                                            <Form.Label>Academic Year <span className="requiredStar">*</span></Form.Label>
                                                            <Form.Select
                                                                id="academic_year_id"
                                                                name="academic_year_id"
                                                                value={form.academic_year_id}
                                                                disabled={editId !== null}
                                                                onChange={handleInputChange}
                                                                required
                                                            >
                                                                <option value="">Select Academic Year</option>
                                                                {(academicYears || []).map(year => (
                                                                    <option key={year.academic_year_id} value={year.academic_year_id}>
                                                                        {year.academic_year_name}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                            <Form.Control.Feedback type="invalid">Please select an academic year.</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                            {/* Class Dropdown */}
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <Form.Group>
                                                        <Form.Label>Class <span className="requiredStar">*</span></Form.Label>
                                                        <Form.Select
                                                                id="class_id"
                                                                name="class_id"
                                                                value={form.class_id}
                                                                disabled={editId !== null}
                                                            onChange={handleInputChange}
                                                            required
                                                        >
                                                            <option value="">Select Class</option>
                                                                {(classes || []).map(cls => (
                                                                <option key={cls.class_id} value={cls.class_id}>
                                                                    {cls.class_name}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                        <Form.Control.Feedback type="invalid">Please select a class.</Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                            </Col>

                                            {/* Section Dropdown */}
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <Form.Group>
                                                        <Form.Label>Section <span className="requiredStar">*</span></Form.Label>
                                                        <Form.Select
                                                            id="section_id"
                                                             name="section_id"
                                                                value={form.section_id}
                                                                disabled={editId !== null}
                                                            onChange={handleInputChange}
                                                            required
                                                        >
                                                            <option value="">Select Section</option>
                                                            {(filteredSections||[]).map(section => (
                                                                <option key={section.section_id} value={section.section_id}>
                                                                    {section.section_name}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                        <Form.Control.Feedback type="invalid">Please select a section.</Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                            </Col>

                                            {/* Student Dropdown */}
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <Form.Group>
                                                        <Form.Label>Student Name <span className="requiredStar">*</span></Form.Label>
                                                        <Form.Select
                                                                id="student_id"
                                                                name="student_id"
                                                                disabled={editId !== null}
                                                            value={form.student_id}
                                                            onChange={handleInputChange}
                                                            required
                                                        >
                                                            <option value="">Select Student</option>
                                                                {(filteredStudents||[]).map(student => (
                                                                    <option key={student.student_id} value={student.student_id}>
                                                                        {student.student_first_name} {student.student_last_name}
                                                                    </option>
                                                                ))}

                                                        </Form.Select>
                                                        {/* <Form.Control.Feedback type="invalid">Please select a student.</Form.Control.Feedback> */}
                                                    </Form.Group>
                                                </div>
                                            </Col>

                                            {/* Academic Year Dropdown */}
                                            
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                    <Form.Group>
                                                        <Form.Label>Attendance Date <span className="requiredStar">*</span></Form.Label>
                                                        <Form.Control
                                                            type="date" 
                                                            id="attendace_date"       
                                                                name="attendace_date"
                                                                      disabled={editId !== null}
                                                            value={form.attendace_date}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                        {/* <Form.Control.Feedback type="invalid">
                                                            Please select an attendance date.
                                                        </Form.Control.Feedback> */}
                                                        </Form.Group>
                                                        </div>
                                                </Col>

                                            {/* Is Present Dropdown */}
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <Form.Group>
                                                        <Form.Label>Is Present <span className="requiredStar">*</span></Form.Label>
                                                        <Form.Select
                                                                id="is_present"
                                                                name="is_present"
                                                            value={form.is_present}
                                                            onChange={handleInputChange}
                                                            required
                                                        >
                                                            <option value="">Select</option>
                                                            <option value="true">Present</option>
                                                            <option value="false">Absent</option>
                                                        </Form.Select>
                                                        <Form.Control.Feedback type="invalid">Please select attendance status.</Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                      <div className="d-flex justify-content-end mt-3">
                                                          <Button type="submit" className=' me-2 btn btn-success'>
                                                            Submit
                                                          </Button>
                                            <Button
                                                type="button"
                                                className="me-2 btn btn-info"
                                                onClick={() => setForm({
                                                    attendance_id: "",
                                                    student_id: "",
                                                    attendace_date: "",
                                                    is_present: "",
                                                    absent_reason: "",
                                                    academic_year_id: "",
                                                    school_id: userObj.school_id,
                                                    class_id: "",
                                                    section_id: "",
                                                    action: "",
                                                })}
                                            >
                                                Reset
                                            </Button>

                                                          <Button
                                                            type="button"
                                                            variant="primary"
                                                            className='btn-danger'
                                                            onClick={() => window.history.back()}
                                                          >
                                                            Cancel
                                                          </Button>
                                                        </div>
                                                      </form>
                                                    </Card.Body>
                                                  </Card>
                                </div>
                       
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default AddStudentAttendance;
