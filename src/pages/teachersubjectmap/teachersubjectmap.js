import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import loading from "../../assets/images/common/loading.gif";
import { Form, Modal, Col, Row,OverlayTrigger } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { ToastContainer, toast } from 'react-toastify';
import Tooltip from "@mui/material/Tooltip";
import { MdEdit } from "react-icons/md";
import { MdDelete,MdAddCircle } from "react-icons/md";
import { MdFilterList } from "react-icons/md";
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";

const Teachersubjectmap = () => {
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => setShowFilterModal(true);
    const [isLoading, setIsLoading] = useState(true);
    const [teachersubjectsmaps, setTeacherssubjectmap] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [academic, setAcademic] = useState([]);
    const [sections, setSection] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
 
    const fetchAllData = async () => {
        try {
            const [classesRes, sectionsRes, subjectsRes, academicRes, teachersRes] = await Promise.all([
                axios.post(baseUrl + "/classes/", { action: "READ" }),
                axios.post(baseUrl + "/AcademicYear/", { action: "READ" }),
                axios.post(baseUrl + "/Users/", { action: "TREAD" })
            ]);
            setClasses(classesRes.data);
            setSection(sectionsRes.data);
            setSubjects(subjectsRes.data);
            setAcademic(academicRes.data);
            setTeachers(teachersRes.data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };
 
    
         
       
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
    
   
    const fetchData = async () => {
        try {
            const response = await axios.post(baseUrl + "/teacherssubjectsmap/", {
                action: "READ"
            });
            setTeacherssubjectmap(response.data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };
 
    useEffect(() => {
        fetchsubjects();
        fetchAllData();
    }, []);
 
    useEffect(() => {
        setIsLoading(true);
        fetchData().finally(() => setIsLoading(false));
    }, []);
 
    useEffect(() => {
        fetchData();
    }, []);
 
    const columns = [
        {
            name: "Academic Year ",
            selector: (row) => row.academic_year_name,
            cell: row => <Tooltip title={row.academic_year_name}><span>{row.academic_year_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: "Class ",
            selector: (row) => row.class_name,
            cell: row => <Tooltip title={row.class_name}><span>{row.class_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: "Section ",
            selector: (row) => row.section_name,
            cell: row => <Tooltip title={row.section_name}><span>{row.section_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: "Subject ",
            selector: (row) => row.subject_name,
            cell: row => <Tooltip title={row.subject_name}><span>{row.subject_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: "Teacher ",
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
            name: "Is Active ",
            selector: (row) => row.is_active,
            cell: row => <Tooltip title={row.is_active}><span>{row.is_active}</span></Tooltip>,
            sortable: true,
        },
         {
                            name: "Actions",
                            cell: (row) =>
                                filteredRecords.length > 0 ? (
                                    <div className='tableActions'>
                                        <Tooltip title="Edit" arrow>
                                            <a className='commonActionIcons' onClick={() => handleEditClick(row.teacher_subject_id)}>
                                                <span><MdEdit /></span>
                                            </a>
                                        </Tooltip>
                                        <Tooltip title="Delete" arrow>
                                            <a className='commonActionIcons' onClick={() => handleDeleteClick(row.teacher_subject_id)}>
                                                <span><MdDelete /></span>
                                            </a>
                                        </Tooltip>
                                    </div>
                                ) : null, 
                           
                        },
            ];
 
    const handleEditClick = (teacher_subject_id) => {
        const employeemasterToEdit = teachersubjectsmaps.find(teachersubject => teachersubject.teacher_subject_id === teacher_subject_id);
        if (employeemasterToEdit) {
            navigate("/addteachersubjectmap", { state: { teachersubjectData: employeemasterToEdit } });
        }
    };

    const handleDeleteClick = async (teacher_subject_id) => {
        const confirmDelete = window.confirm("Are you sure you want change the status?");
 
        if (!confirmDelete) {
            return;
        }
        const requestBody = {
            teacher_subject_id: teacher_subject_id,
            action: "DELETE"
        };
        try {
            const response = await axios.post(baseUrl + '/teacherssubjectsmap/', requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            toast.success("Record Set to InActive");
            fetchData();
        } catch (error) {
            console.error('Error:', error);
        }
    };
  
    const searchableColumns = [
        (row) => row.class_name,
        (row) => row.section_name,
        (row) => row.subject_name,
        (row) => row.academic_year_name,
        (row) => row.user_name,
        (row) => row.isClassTeacher,
        (row) => row.is_active,

    ];
    

    const filteredRecords = (teachersubjectsmaps || []).filter((teachersubjectsmaps) =>
        searchableColumns.some((selector) => {
            const value = selector(teachersubjectsmaps);
            const stringValue = String(value || "").toLowerCase();
            const normalizedValue = stringValue.replace(/[-\s]+/g, "");
            const normalizedQuery = searchQuery.toLowerCase().replace(/[-\s]+/g, "");
    
            return normalizedValue.includes(normalizedQuery);
        })
    );
    const [filter, setFilter] = useState({
        class_id: 0,
        section_id: 0,
        subject_id: 0,
        academic_year_id: 0,
        userid: 0,
        isClassTeacher: "",
    });
    useEffect(() => {
            fetchSections(filter.class_id || 0);

    }, [filter.class_id]);
    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            class_id: filter.class_id || 0,
            section_id: filter.section_id || 0,
            subject_id: filter.subject_id || 0,
            academic_year_id: filter.academic_year_id || 0,
            userid: filter.userid || 0,
            school_id: userObj.school_id || 0,
            isClassTeacher: filter.isClassTeacher || "",
            action: "FILTER",
        };
  
        try {
            const response = await axios.post(baseUrl + "/teacherssubjectsmap/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
   
 
            const filterData = response.data || [];
 
            if (filterData.length === 0) {
                setTeacherssubjectmap([]);
            } else {
                setTeacherssubjectmap(filterData);
            }
            setShowFilterModal(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            if (error.response && error.response.status === 404) {
                setTeacherssubjectmap([]);
 
            } else {
                toast.error("Failed to fetch filtered data");
            }
        }
    };
    const handleFilterReset = async () => {
        setFilter({
            class_id: 0,
            section_id: 0,
            subject_id: 0,
            academic_year_id: 0,
            userid: 0,
            isClassTeacher: "",
            action: "FILTER"
        });
 
         fetchData("/teachersubjectmap", setTeacherssubjectmap);
 
    }
 
 
    return (
        <Container fluid>
            <ToastContainer />
            <div className="pageMain">
                <LeftNav />
                <div className="pageRight">
                    <div className="pageHead">
                        <Header />
                    </div>
                    <br />
                    <div className="pageBody pt-0">
                    <div className="commonDataTableHead">
                            <div className="d-flex justify-content-between align-items-center w-100">                        
                                <h6 className="commonTableTitle">Academic Class Setup</h6>
                                <div className="d-flex align-items-center">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        className="searchInput"
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ marginLeft: '10px' }}
                                    />
                                </div>
                                <div className="d-flex align-items-center" style={{ gap: "6px" }}>
                                    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}>
                                        <Button className="secondaryBtn" variant="secondary" onClick={handleShowFilterModal}>
                                            <MdFilterList />
                                        </Button>
                                    </OverlayTrigger>
 
                                    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add</Tooltip>}>
                                                                        <Button className="primaryBtn" variant="primary" onClick={() => navigate("/addteachersubjectmap")}>
                                                                            <MdAddCircle />
                                                                        </Button>
                                                                    </OverlayTrigger>
                                </div>
                            </div>
                        </div>
 
                        <div className="commonTable height100">
                        <div className="tableBody">
                            {isLoading ? (
                                <div className="loadingContainer">
                                    <img src={loading} alt="Loading..." className="loadingGif" />
                                </div>
                            ) : (
                                <DataTable
                                className="custom-table"
                                columns={columns}
                                data={filteredRecords.length > 0 ? filteredRecords : [{ is_active: 'No records found', is_active: 'No records found' }]}
                                pagination={Array.isArray(filteredRecords) && filteredRecords.length > 0} 
                                highlightOnHover
                                responsive
                                fixedHeader
                                fixedHeaderScrollHeight="calc(100vh - 170px)"
                                conditionalRowStyles={[
                                    {
                                        when: (row) => row.is_active === "No records found",
                                        style: { textAlign: 'center', fontSize: '16px', color: 'red', backgroundColor: '#f9f9f9' },
                                    },
                                ]}
                            />
                            )}
                        </div> 
                    </div>
                    </div>
                </div>
            </div>
            <Modal show={showFilterModal} onHide={handleCloseFilterModal} className="commonFilterModal">
                <Modal.Header closeButton className="modalHeaderFixed">
                    <Modal.Title>Filter</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBodyScrollable">
                    <Form id="filterForm" onSubmit={handleFilterSubmit}>
                        <Row>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="academic">
                                        <Form.Label>Academic Year</Form.Label>
                                        <Form.Select
                                            name="academic_year_name"
                                            id="academic_year_id"
                                            value={filter.academic_year_id}
                                            onChange={(e) => setFilter({ ...filter, academic_year_id: e.target.value })}>
                                            <option value="">Select Academic Year</option>
                                            {(academic || []).map((academic) => (
                                                <option key={academic.academic_year_id} value={academic.academic_year_id}>
                                                    {academic.academic_year_name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="class">
                                        <Form.Label>Class</Form.Label>
                                        <Form.Select
                                            name="class_id"
                                            id="class_id"
                                            value={filter.class_id}
                                            onChange={(e) => setFilter({ ...filter, class_id: e.target.value })}>
                                            <option value="">Select Class</option>
                                            {(classes || [])
                                            .filter((classItem) => classItem.is_active === "Active")
                                            .map((classes) => (
                                                <option key={classes.class_id} value={classes.class_id}>
                                                    {classes.class_name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="section">
                                        <Form.Label>Section </Form.Label>
                                        <Form.Select
                                            name="section_name"
                                            id="section_id"
                                            value={filter.section_id}
                                            onChange={(e) => setFilter({ ...filter, section_id: e.target.value })}>
                                            <option value="">Select Section</option>
                                            {(sections || [])
                                             .filter((section) => section.is_active==="Active")
                                            .map((section) => (
                                                <option key={section.section_id} value={section.section_id}>
                                                    {section.section_name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="subject">
                                        <Form.Label>Subject</Form.Label>
                                        <Form.Select
                                            name="subject_name"
                                            id="subject_id"
                                            value={filter.subject_id}
                                            onChange={(e) => setFilter({ ...filter, subject_id: e.target.value })}>
                                            <option value="">Select Subject</option>
                                            {(subjects || [])
                                            .filter((subject) => subject.is_active==="Active")
                                            .map((subject) => (
                                                <option key={subject.subject_id} value={subject.subject_id}>
                                                    {subject.subject_name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </Col>
 
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="username">
                                        <Form.Label>Teacher</Form.Label>
                                        <Form.Select
                                            name="user_name"
                                            id="userid"
                                            value={filter.userid}
                                            onChange={(e) => setFilter({ ...filter, userid: e.target.value })}>
                                            <option value="">Select Teacher</option>
                                            {(teachers ).map((teachers) => (
                                                <option key={teachers.userid} value={teachers.userid}>
                                                    {teachers.surname + " " + teachers.firstname}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12} >
                                <div className='commonInput'>
                                    <Form.Group controlId="is_current_year">
                                        <Form.Label>Is Class Teacher </Form.Label>
                                        <Form.Select
                                            type="text"
                                            name="isClassTeacher "
                                            value={filter.isClassTeacher}
                                            onChange={(e) => setFilter({ ...filter, isClassTeacher: e.target.value })}
                                        >
                                            <option value="">Select Is Class Teacher</option>
                                            <option value="Y">Yes</option>
                                            <option value="N">No</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </Col>
 
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modalFooterFixed">
                    <Button
                        variant="secondary"
                        className="btn-info clearBtn"
                        onClick={handleFilterReset} 
                    >
                        Reset
                    </Button>
 
                    <div>
                        <Button
                            variant="secondary"
                            className="btn-danger secondaryBtn me-2"
                            onClick={() => { handleCloseFilterModal(); }}
                        >
                            Cancel
                        </Button>
 
                        <Button
                            variant="primary"
                            type="submit"
                            className="btn-success primaryBtn"
                            form="filterForm"
                            onClick={handleFilterSubmit}
                        >
                            Search
                        </Button>
                    </div>
                </Modal.Footer>
 
            </Modal>
        </Container>
    );
};
export default Teachersubjectmap;
 