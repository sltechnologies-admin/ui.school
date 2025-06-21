import React, { useState, useEffect } from 'react'
import { useLocation } from "react-router-dom";
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import loading from "../../assets/images/common/loading.gif";
 import { MdEdit } from "react-icons/md";
 import { useNavigate } from "react-router-dom";
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
const AddTeachersubjectmap = () => {
    const routeLocation = useLocation();
    const [editId, setEditId] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [academic, setAcademic] = useState([]);
    const [sections, setSection] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [teachersubjectsmaps, setTeacherssubjectmap] = useState([]);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [searchQuery, setSearchQuery] = useState("");
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const navigate = useNavigate();
 
    const [form, setForm] = useState({
        teacher_subject_id: "",
        teacher_subject_name: "",
        subject_id: "",
        subject_name: "",
        userid: "",
        username: "",
        academic_year_id: userObj.academic_year_id,
        academic_year_name: "",
        isClassTeacher: "Y"
    });

     const handleEditClick = (teacher_subject_id) => {
            const employeemasterToEdit = teachersubjectsmaps.find(teachersubject => teachersubject.teacher_subject_id === teacher_subject_id);
            if (employeemasterToEdit) {
                navigate("/addteachersubjectmap", { state: { teachersubjectData: employeemasterToEdit } });
            }
        };
     
 
    const columns = [
        {
            name: "Academic Year Name",
            selector: (row) => row.academic_year_name,
            cell: row => <Tooltip title={row.academic_year_name}><span>{row.academic_year_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: "Class Name",
            selector: (row) => row.class_name,
            cell: row => <Tooltip title={row.class_name}><span>{row.class_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: "Section Name",
            selector: (row) => row.section_name,
            cell: row => <Tooltip title={row.section_name}><span>{row.section_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: "Subject Name",
            selector: (row) => row.subject_name,
            cell: row => <Tooltip title={row.subject_name}><span>{row.subject_name}</span></Tooltip>,
            sortable: true,
        },
 
        {
            name: "Teacher Name",
            selector: (row) => row.user_name,
            cell: row => <Tooltip title={row.user_name}><span>{row.user_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: "Is Class Teacher",
            selector: (row) => row.isClassTeacher,
            cell: row => <Tooltip title={row.isClassTeacher}><span>{row.isClassTeacher}</span></Tooltip>,
            sortable: true,
        },
        {
                    name: "Actions",
                    cell: (row) => (
                        <div className='tableActions'>
                            <Tooltip title="Edit" arrow>
                                <a className='commonActionIcons' style={{ cursor: 'pointer' }} onClick={() => handleEditClick(row.teacher_subject_id)}>
                                    <span><MdEdit /></span>  </a>
                            </Tooltip>
                        </div>
                    ),
                },
    ];
 
 
    const fetchClasses = async () => {
        try {
            const response = await axios.post(baseUrl + "/classes/", {
                action: "READ"
            });
            setClasses(response.data)
        } catch (error) {
            console.log("Error fetching class name:", error)
 
        }
    };

    useEffect(() => {
        
            fetchSections(form.class_id || 0);
    }, [form.class_id]);
    
    
    const fetchSections = async (class_id) => {
        try {
            const response = await axios.post(baseUrl + "/Sections/", {
                action: "DROPDOWNREAD",
                class_id:class_id
            });
            setSection(response.data)
        } catch (error) {
            console.log("Error fetching section name:", error)
 
        }
    };
    const fetchsubjects = async () => {
        try {
            const response = await axios.post(baseUrl + "/subjectmaster/", { action: "READ",school_id:userObj.school_id });
            setSubjects(response.data);
        } catch (error) {
            console.log("Error fetching data:", error);
 
        }
    };
    const fetchAcademicYears = async () => {
        try {
            const response = await axios.post(baseUrl + "/AcademicYear/", {
                action: "CURRENTREAD",
                school_id:userObj.school_id
            });
            setAcademic(response.data)
        } catch (error) {
            console.log("Error fetching academic name:", error)
 
        }
    };
    const fetchTeachers = async () => {
        try {
            const response = await axios.post(baseUrl + "/Users/", {
                action: "TREAD"
            });
            setTeachers(response.data)
        } catch (error) {
            console.log("Error fetching teacher name:", error)
 
        }
    };
 
    useEffect(() => {
        fetchClasses();
        fetchSections();
        fetchsubjects();
        fetchAcademicYears();
        fetchTeachers();
        fetchData();
    }, []);
 
    useEffect(() => {
        if (routeLocation.state?.teachersubjectData) {
            const teachersubjectData = routeLocation.state.teachersubjectData;
            setForm(teachersubjectData);
            setEditId(teachersubjectData.teacher_subject_id);
        }
    }, [routeLocation]);
 
    const handleInputChange = (e) => {
        const { id, value} = e.target;
        
       
        setForm((prevForm) => ({
            ...prevForm,
            [id]: value,
        }));
 
        
 
    };
 
 
    const searchableColumns = [
        (row) => row.class_name,
        (row) => row.section_name,
        (row) => row.academic_year_name,
        (row) => row.subject_name,
        (row) => row.user_name,
        (row) => row.isClassTeacher,
    ];
 
    const filteredRecords = (teachersubjectsmaps || []).filter((teachersubjectsmaps) =>
        searchableColumns.some((selector) => {
            const value = selector(teachersubjectsmaps);
            return String(value || "").toLowerCase().includes(searchQuery.toLowerCase());
        })
    );
 
    const fetchData = async () => {
        if (form.academic_year_id && form.class_id && form.section_id) {
            try {
                const response = await axios.post(baseUrl + "/teacherssubjectsmap/", {
                    action: "FILTER",
                    academic_year_id: userObj.academic_year_id,
                    class_id: form.class_id,
                    section_id: form.section_id,
                });
                setTeacherssubjectmap(response.data);
            }
            catch (error) {
                console.log("Error fetching data:", error);
            }
        }
    };
 
    useEffect(() => {
        if (form.academic_year_id && form.class_id && form.section_id) {
            fetchData();
        }
    }, [form.academic_year_id, form.class_id, form.section_id]);
 
 
    const handleRadioChange = (e) => {
        setForm((prevForm) => ({
            ...prevForm,
            isClassTeacher: e.target.value
        }));
    };
 
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const approveStatus = { 'Yes': 'Y', 'No': 'N' };
        const selectedStatus = approveStatus[form.isClassTeacher] || form.isClassTeacher;
    
        const formData = {
            class_id: form.class_id,
            section_id: form.section_id,
            subject_id: form.subject_id,
            academic_year_id: userObj.academic_year_id,
            userid: form.userid,
            isClassTeacher: selectedStatus,
            school_id: userObj.school_id,
            action: editId !== null ? 'UPDATE' : 'CREATE'
        };
    
        if (editId !== null) {
            formData.teacher_subject_id = editId;
        }
    
        try {
           
            const response = await axios.post(baseUrl + "/teacherssubjectsmap/", formData, {
                headers: { "Content-Type": "application/json" },
            });
    
            if (response.status >= 200 && response.status < 300) {
                toast.success(editId !== null ? "Record Updated Successfully" : "Record Added Successfully", { position: "top-right" });
    
                setEditId(null);
                setForm({
                    teacher_subject_id: "",
                    class_id: "",
                    section_id: "",
                    subject_id: "",
                    academic_year_id: "",
                    userid: "",
                    isClassTeacher: "Y", 
                });
            }
        } catch (error) {
            if (error.response) {
                const { status, data } = error.response;
    
                if (status === 400) {
                    toast.error("Record Already Exists");
                } else if (status === 402) {
                    toast.error("Class Teacher Is Already Assigned To This Class And Section", { position: "top-right" });
                } else if (status === 401) {
                    toast.error("The Subject Is Already Assigned To This Class And Section", { position: "top-right" });
                } else if (status === 500) {
                    toast.error("Error submitting data: " + (data.error || error.message), { position: "top-right" });
                } else {
                    toast.error("Unexpected error occurred", { position: "top-right" });
                }
            } else {
                console.error("There was an error submitting:", error);
                toast.error("Error submitting data: " + error.message, { position: "top-right" });
            }
        }
    };
       
 
 
 
 
   return (
        
            <div className='pageMain'>
                 <ToastContainer />
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
                                                        <h6 className='commonSectionTitle'>Academic Class Setup</h6>
                                                    </Col>
                                                </Row>
 
                                                <Row>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group>
                                                                <Form.Label>Academic Year<span className='requiredStar'>*</span></Form.Label>
                                                                <select
                                                                    className="form-select"
                                                                    id="academic_year_id"
                                                                    required
                                                                    value={form.academic_year_id}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="0" disabled hidden>
                                                                        {userObj.academic_year_name}
                                                                    </option>
                                                                    {(academic || []).map((academic) => (
                                                                        <option key={academic.academic_year_id} value={academic.academic_year_id}>
                                                                            {academic.academic_year_name}
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
                                                                    <option value="">Select Section</option>
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
                                                            <Form.Label>
                                                                Subject<span className="requiredStar">*</span>
                                                            </Form.Label>
                                                            <select
                                                                className="form-select"
                                                                id="subject_id"
                                                                required
                                                                value={form.subject_id}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="">Select Subject</option>
                                                                {(subjects || [])
                                                                    .filter((subject) => subject.is_active==="Active") // Filter to include only active subjects
                                                                    .map((subject) => (
                                                                        <option key={subject.subject_id} value={subject.subject_id}>
                                                                            {subject.subject_name}
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
                                                                    Teacher<span className="requiredStar">*</span>
                                                                </Form.Label>
                                                                <select
                                                                    className="form-select"
                                                                    id="userid"
                                                                    required
                                                                    value={form.userid}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="">Select Teacher</option>
                                                                    {(teachers || []).map((teachers) => (
                                                                        <option key={teachers.userid} value={teachers.userid}>
                                                                            {teachers.surname + " " + teachers.firstname}
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
                                                                    Is Class Teacher <span className="requiredStar">*</span>
                                                                </Form.Label>
                                                                <div className="d-flex">
                                                                    <div className="form-check">
                                                                        <input
                                                                            className="form-check-input"
                                                                            type="radio"
                                                                            name="isClassTeacher"
                                                                            id="Yes"
                                                                            value="Yes"
                                                                            onChange={handleRadioChange}
                                                                            checked={form.isClassTeacher === "Yes"}
                                                                            required
                                                                        />
                                                                        <label className="form-check-label" htmlFor="Yes">Yes</label>
                                                                    </div>
                                                                    <div className="form-check ms-3">
                                                                        <input
                                                                            className="form-check-input"
                                                                            type="radio"
                                                                            name="isClassTeacher"
                                                                            id="No"
                                                                            value="No"
                                                                            onChange={handleRadioChange}
                                                                            checked={form.isClassTeacher === "No"}
                                                                        />
                                                                        <label className="form-check-label" htmlFor="No">No</label>
                                                                    </div>
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    
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
                                                                userid: "",
                                                                isClassTeacher: ""
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
                                                </Row>
                                            </div>
                                        </form>                                     
                                        <div className="commonTable height100">
                                            <div className="tableBody">
                                                {isLoading ? (
                                                    <div className="loadingContainer">
                                                        <img src={loading} alt="Loading..." className="loadingGif" />
                                                    </div>
                                                ) : (
 
                                                    <table className="table academic-table">
                                                        <thead>
                                                            <tr>
                                                                {columns.map((column, index) => (
                                                                    <th key={index} className="table-header">{column.name}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                        {(teachersubjectsmaps && teachersubjectsmaps.length > 0) ? (
                                                    filteredRecords.map((row, index) => (
                                                        <tr key={index}>
                                                            {columns.map((column, colIndex) => (
                                                                <td key={colIndex}>
                                                                    {column.cell ? column.cell(row) : row[column.selector]}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={columns.length} style={{ textAlign: 'center' }}>
                                                            No Data Available
                                                        </td>
                                                    </tr>
                                                )}

                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                
                                                
                                                
                                                                                    </Card.Body>
                                                                                </Card>
                                                                            </div>
                                                                        </Container>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                    
                                                    );
 
}
export default AddTeachersubjectmap;
 
 
 