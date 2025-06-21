import React, { useState, useEffect } from 'react'
import { useLocation } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import axios from "axios";
const AddSyllabus = () => {
    const routeLocation = useLocation();
    const [editId, setEditId] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [academic, setAcademic] = useState([]);
    const [sections, setSection] = useState([]);
    const [classes, setClasses] = useState([]);
    const [months, setMonths] = useState([]);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};

    const [form, setForm] = useState({
        teacher_subject_id: "",
        teacher_subject_name: "",
        subject_id: "",
        subject_name: "",
        userid: "",
        username: "",
        academic_year_id: "",
        academic_year_name: "",
        school_id: userObj.school_id,
        isClassTeacher: "Y",
        is_completed: "Y",
        remarks: "",
        portion_alloted: "",
        month_id: "",
        month_name: ""
    });
    const fetchDropdownData = async (endpoint, setter) => {
        try {
            // console.log(setter)
            console.log(endpoint)
            const response = await axios.post(baseUrl + endpoint, { action:endpoint==='/AcademicYear/'?'CURRENTREAD':'READ' });
            
            console.log(response.data)
            
            setter(response.data);
            console.log(academic);
            // if(endpoint==='/AcademicYear/') {
            //     console.log("err")
                
            // }
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
        }
    };

    useEffect(() => {
        if (Number(form.class_id) > 0 && Number(form.section_id) > 0) {
            fetchSubjects(form.academic_year_id, form.class_id, form.section_id);
        }
    }, [form.academic_year_id, form.class_id, form.section_id]);

    const fetchSubjects = async () => {
        try {
            const response = await axios.post(baseUrl + "/teacherssubjectsmap/", {
                action: "FILTER",
                school_id: userObj?.school_id || 0,
                academic_year_id: userObj.academic_year_id,
                class_id: form.class_id,
                section_id: form.section_id,
            });
            setSubjects(response?.data || []);
        } catch (error) {
            console.error("Error fetching Subjects!", error);
        }
    };

    
    useEffect(() => {
        if( form.class_id !=undefined && form.class_id>0)
        {
        fetchSections(form.class_id || 0);
        }
        else 
        {
            setSection([]);
        }

    }, [form.class_id]);

    const fetchSections = async (class_id) => {
        try {
            const response = await axios.post(baseUrl + "/Sections/", {
                action: "DROPDOWNREAD",
                school_id: userObj.school_id,
                class_id: class_id
            });
            setSection(response.data);
        } catch (error) {
            console.error("Error fetching section:", error);
        }
    };
   
    
    useEffect(() => {    
        fetchDropdownData('/AcademicYear/',setAcademic);   
        fetchDropdownData('/classes/', setClasses);
        fetchDropdownData('/months/', setMonths);
       
        
    }, []);

    useEffect(() => {
        fetchTeacherData();
    }, [form.academic_year_id, form.class_id, form.section_id, form.subject_id]);

    const fetchTeacherData = async () => {
        if (form.class_id && form.section_id && form.subject_id) {
            try {
                const response = await axios.post(baseUrl + "/teacherssubjectsmap/", {
                    action: "FILTER",
                    academic_year_id: userObj.academic_year_id,
                    subject_id: form.subject_id,
                    class_id: form.class_id,
                    section_id: form.section_id,
                });
                if (response.data.length > 0) {
                    const teacher = response.data[0];

                    setForm((prevForm) => ({
                        ...prevForm,
                        userid: teacher.userid,
                        username: teacher.user_name,
                    }));
                } else {

                    setForm((prevForm) => ({
                        ...prevForm,
                        userid: "",
                        username: "",
                    }));
                }
            } catch (error) {
                console.log("Error fetching teacher data:", error);
            }
        }
    };

    useEffect(() => {
        if (routeLocation.state?.syllabusData) {
            const syllabusData = routeLocation.state.syllabusData;
            setForm(syllabusData);
            setEditId(syllabusData.syllabus_plan_id);
        }
    }, [routeLocation]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [id]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            class_id: form.class_id || 0,
            section_id: form.section_id || 0,
            subject_id: form.subject_id || 0,
            academic_year_id: userObj.academic_year_id || 0,
            userid: form.userid || 0,
            month_id: form.month_id || 0,
            portion_alloted: form.portion_alloted,
            teacher_subject_id: form.teacher_subject_id,
            school_id: userObj.school_id,
            action: editId !== null ? 'UPDATE' : 'CREATE'
        };
        if (editId !== null) {
            formData.syllabus_plan_id = editId;
        }
        try {
            const response = await axios.post(baseUrl + "/syllabusplan/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (editId !== null) {
                toast.success("Record updated successfully", { position: "top-right" });
                setEditId(null);

            } else {
                toast.success("Record added successfully", { position: "top-right" });
            }
        }
        catch (error) {
            if (error.response) {
                const { status } = error.response;
                if (status === 400) {
                    toast.error("Record already exists")
                }
                else if (status === 401) {
                    toast.error("No teachersubjectid found", { position: "top-right" });
                }
                else {
                    toast.error("Unexpected error occurred", { position: "top-right" });
                }
            }
            else {
                console.error("There was an error submitting:", error);
                toast.error("Error submitting data: " + error.message, { position: "top-right" });
            }
        }
        setForm({
            teacher_subject_id: "",
            class_id: "",
            section_id: "",
            subject_id: "",
            academic_year_id: "",
            userid: "",
            month_id: "",
            is_completed: "",
            portion_alloted: "",
            remarks: ""
        });
    }
    return (
        <Container fluid>
            <ToastContainer />
            <div className='pageMain'>
                <LeftNav></LeftNav>
                <div className='pageRight'>
                    <div className='pageHead'>
                        <Header></Header>
                    </div>
                    <div className='pageBody'>
                        <Container fluid>
                            <div className=''>
                                <Card>
                                    <Card.Body className="hide-scrollbar">
                                        <form className="" onSubmit={handleSubmit}>
                                            <div className=''>
                                                <Row>
                                                    <Col xs={12}>
                                                        <h6 className='commonSectionTitle'>Syllabus Plan</h6>
                                                    </Col>
                                                </Row>
                                                 <Row>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                         <div className="commonInput">
                                                            <Form.Group>
                                                                <Form.Label>
                                                                    AcademicYear
                                                                </Form.Label>
                                                                <div>
                                                                    <Form.Control
                                                                        type="text"
                                                                        value={academic[0]?.academic_year_name || ''}
                                                                        readOnly
                                                                    />
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className="commonInput">
                                                            <Form.Group>
                                                                <Form.Label>
                                                                    Class<span className="requiredStar">*</span>
                                                                </Form.Label>
                                                                <select
                                                                    className="form-select"
                                                                    required
                                                                    id="class_id"
                                                                    value={form.class_id}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="">Select Class</option>
                                                                    {(classes || [])
                                                                        .filter((classItem) => classItem.is_active === "Active") 
                                                                        .map((classItem) => (
                                                                            <option key={classItem.class_id} value={classItem.class_id}>
                                                                                {classItem.class_name}
                                                                            </option>
                                                                        ))}
                                                                </select>
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className="commonInput">
                                                            <Form.Group>
                                                                <Form.Label>
                                                                    Section<span className="requiredStar">*</span>
                                                                </Form.Label>
                                                                <select
                                                                    className="form-select"
                                                                    required
                                                                    id="section_id"
                                                                    value={form.section_id}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="0">Select Section</option>
                                                                    {(sections || []).map((sections) => (
                                                                        <option key={sections.section_id} value={sections.section_id}>
                                                                            {sections.section_name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className="commonInput">
                                                            <Form.Group>
                                                                <Form.Label> Subject<span className="requiredStar">*</span></Form.Label>
                                                                <Form.Select
                                                                    id="subject_id"
                                                                    value={form.subject_id}
                                                                    onChange={handleInputChange}
                                                                    style={{ maxHeight: "150px", overflowY: "auto" }}
                                                                    required
                                                                >
                                                                    <option value="">Select Subject</option>
                                                                    {(subjects || [])
                                                                        .filter((subject) => subject.is_active === "Active")
                                                                        .map((subject) => (
                                                                            <option key={subject.subject_id} value={subject.subject_id}>
                                                                                {subject.subject_name}
                                                                            </option>
                                                                        ))}
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </div>
                                                    </Col>

                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className="commonInput">
                                                            <Form.Group>
                                                                <Form.Label>
                                                                    Teacher
                                                                </Form.Label>
                                                                <div>
                                                                    <Form.Control
                                                                        type="text"
                                                                        value={form.username || ''}
                                                                        readOnly
                                                                    />
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className="commonInput">
                                                            <Form.Group>
                                                                <Form.Label>
                                                                    Month<span className="requiredStar">*</span>
                                                                </Form.Label>
                                                                <select
                                                                    className="form-select"
                                                                    id="month_id"
                                                                    required
                                                                    value={form.month_id}
                                                                    onChange={handleInputChange}>
                                                                    <option value="">Select Month</option>
                                                                    {(months || []).map((months) => (
                                                                        <option key={months.month_id} value={months.month_id}>
                                                                            {months.month_name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6} lg={6} xxl={6}>
                                                        <div className="commonInput">
                                                            <Form.Group>
                                                                <Form.Label>Portion Alloted <span className="requiredStar">*</span></Form.Label>
                                                                <Form.Control
                                                                    required
                                                                    as="textarea"
                                                                    id="portion_alloted"
                                                                    value={form.portion_alloted}
                                                                    placeholder="Portion Alloted"
                                                                    maxLength={250}
                                                                    rows={4} 
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        if (/^[A-Za-z\s]*$/.test(value)) {
                                                                            handleInputChange(e);
                                                                        }
                                                                    }}
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                </Row>
                                                <div> 
                                                    <Col>
                                                    <div className="d-flex justify-content-between mt-3">
                                                        <div>
                                                            <Button
                                                                type="button"
                                                                variant="primary"
                                                                className="btn-info clearBtn"
                                                                onClick={() => setForm({
                                                                    teacher_subject_id: "",
                                                                    class_id: "",
                                                                    section_id: "",
                                                                    subject_id: "",
                                                                    academic_year_id: "",
                                                                    month_id: "",
                                                                    portion_alloted: "",
                                                                    userid: "",
                                                                    is_completed: "",
                                                                    remarks: ""
                                                                })}
                                                            >
                                                                Reset
                                                            </Button>
                                                        </div>
                                                        <div>
                                                            <Button
                                                                type="button"
                                                                variant="primary"
                                                                className="btn-danger secondaryBtn me-2"
                                                                onClick={() => window.history.back()}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                type="submit"
                                                                variant="primary"
                                                                className="btn-success primaryBtn"
                                                            >
                                                                Submit
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Col>
                                                </div>
                                            </div>
                                        </form>
                                    </Card.Body>
                                </Card>
                            </div>
                        </Container>
                    </div>
                </div>
            </div>
        </Container>
    );
}
export default AddSyllabus;
