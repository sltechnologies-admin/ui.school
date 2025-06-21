import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import loading from "../../assets/images/common/loading.gif";
import { Form, Modal, Col, Row, OverlayTrigger } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { ToastContainer, toast } from 'react-toastify';
import Tooltip from "@mui/material/Tooltip";
import { MdEdit } from "react-icons/md";
import { MdDelete, MdAddCircle } from "react-icons/md";
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

    const fetchData = async () => {
        try {
            const response = await axios.post(baseUrl + "/teacherssubjectsmap/", {
                action: "READ",
                school_id:userObj.school_id
            });
            setTeacherssubjectmap(response.data);
        } catch (error) {
            console.log("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => {
        if (academic.length === 0) {
            fetchAcademicYears();
        }
        if (classes.length===0){
            fetchDropdownData('/classes/', setClasses);
        
        }
        if (subjects.length === 0) {
            fetchSubjects();
        }
        if (teachers.length === 0) {
            fetchTeachers();
        }
        setShowFilterModal(true);
    }
    const [filter, setFilter] = useState({
        class_id: 0,
        section_id: 0,
        subject_id: 0,
        academic_year_id: 0,
        userid: 0,
        isClassTeacher: "",
        action: 'FILTER'
    });

    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        const isOnlyFilterAction = (
            filter.action?.toUpperCase() === "FILTER" &&
            filter.class_id === 0 &&
            filter.section_id === 0 &&
            filter.subject_id === 0 &&
            filter.userid === 0 &&
            filter.is_completed === ""
        );
        if (isOnlyFilterAction) {
            handleFilterClear();
            handleCloseFilterModal();
            return;
        }
        try {
            const response = await axios.post(baseUrl + '/teacherssubjectsmap/', filter, {
                headers: { 'Content-Type': 'application/json' },
            });
            setTeacherssubjectmap(response.data || []);
            handleCloseFilterModal();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleFilterClear = async () => {
        setFilter({
            class_id: 0,
            section_id: 0,
            subject_id: 0,
            academic_year_id: 0,
            userid: 0,
            isClassTeacher: "",
            action: "FILTER"
        });
        fetchData();
    }
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

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const fetchAcademicYears = async () => {
        try {
            const response = await axios.post(baseUrl + "/AcademicYear/", {
                action: "READ",
                school_id: userObj.school_id
            });
            setAcademic(response.data)
        } catch (error) {
            console.log("Error fetching academicyears:", error)
        }
    };
    const fetchDropdownData = async (endpoint, setter) => {
        try {
            const response = await axios.post(baseUrl + endpoint, { action: 'READ',school_id:userObj.school_id });
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
        }
    };
    useEffect(() => {
        if (filter.class_id != 0) {
            fetchSections(filter.class_id || 0);
        }
        else {
            setSection()
        }
    }, [filter.class_id]);

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
        if (Number(filter.class_id) > 0 && Number(filter.section_id) > 0) {
         fetchSubjects(filter.academic_year_id, filter.class_id);
        }
    }, [filter.academic_year_id, filter.class_id]);
        
        const fetchSubjects = async () => {
            try {
                const response = await axios.post(baseUrl + "/subjectmaster/", {
                    action: "READ",
                    school_id: userObj?.school_id || 0,
                });
                setSubjects(response?.data || []);
            } catch (error) {
                console.error("Error fetching Subjects!", error);
            }
        };
        const fetchTeachers = async () => {
            try {
                const response = await axios.post(baseUrl + "/Users/", {
                    action: "TREAD",
                    school_id:userObj.school_id
                    
                });
                setTeachers(response.data)
    
            } catch (error) {
                console.log("Error fetching students name:", error)
            }
        };
    const handleEditClick = (teacher_subject_id) => {
        const employeemasterToEdit = teachersubjectsmaps.find(teachersubject => teachersubject.teacher_subject_id === teacher_subject_id);
        if (employeemasterToEdit) {
            navigate("/academicyear", { state: { teachersubjectData: employeemasterToEdit } });
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
    name: "Subject",
    selector: (row) => row.subject_name,
    sortable: true,
    cell: (row) => {
        if (!row || !row.subject_name) {
            return <div className="noDataMessage">No Records Found</div>;
        }

        const displayText =
            row.subject_name.length > 15
                ? `${row.subject_name.slice(0, 15)}...`
                : row.subject_name;

        return (
            <Tooltip title={row.subject_name}>
                <span>{displayText}</span>
            </Tooltip>
        );
    },
}

,
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
            name: "Status",
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

    return (
        <Container fluid>
            <ToastContainer />
         
                    <br />
                    <div className="">
                        {/* <div className="commonDataTableHead">
                            <div className="d-flex justify-content-between align-items-center w-100">
                                <h6 className="commonTableTitle">Academic Class Setup</h6>
                                <div className="d-flex align-items-center">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        className="searchInput"
                                        onChange={handleSearchChange}
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
                        </div> */}
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
                                        data={(Array.isArray(filteredRecords) && filteredRecords.length > 0)
                                            ? filteredRecords
                                            : [{
                                                userid: "No records found",
                                                role_name: "No records found",
                                            }]
                                        }
                                        pagination={Array.isArray(filteredRecords) && filteredRecords.length > 0}
                                        highlightOnHover
                                        responsive
                                        fixedHeader
                                        fixedHeaderScrollHeight="calc(100vh - 170px)"
                                        conditionalRowStyles={[
                                            {
                                                when: (row) => row.userid === "No records found",
                                                style: {
                                                    textAlign: "center",
                                                    fontSize: "16px",
                                                    color: "red",
                                                    backgroundColor: "#f9f9f9"
                                                },
                                            },
                                        ]}
                                    />
                                )}
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
                                            {(academic || [])
                                            .filter((classItem) => classItem.is_active === "Active")
                                            .map((academic) => (
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
                                    <Form.Group>
                                        <Form.Label>Section</Form.Label>
                                        <select
                                            className="form-select"
                                            id="section_id"
                                            value={filter.section_id}
                                            onChange={(e) => setFilter({ ...filter, section_id: e.target.value })}
                                        >
                                            <option value="0">Select Section</option>
                                            {(sections || []).map((section, index) => (
                                                <option key={index} value={section.section_id}>
                                                    {section.section_name}
                                                </option>
                                            ))}
                                        </select>
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group>
                                        <Form.Label>Subject</Form.Label>
                                        <select
                                            className="form-select"
                                            id="subject_id"
                                            value={filter.subject_id}
                                            onChange={(e) => setFilter({ ...filter, subject_id: e.target.value })}>
                                            <option value="0">Select Subject</option>
                                            {(subjects || []).map((subject, index) => (
                                                <option key={index} value={subject.subject_id}>
                                                    {subject.subject_name}
                                                </option>
                                            ))}
                                        </select>
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
                                            {(teachers || []).map((teachers) => (
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
                                            onChange={(e) => setFilter({ ...filter, isClassTeacher: e.target.value })} >
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
                        onClick={handleFilterClear} >
                        Reset
                    </Button>
                    <div>
                        <Button
                            variant="secondary"
                            className="btn-danger secondaryBtn me-2"
                            onClick={handleCloseFilterModal} >
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
