import React, { useState, useEffect } from 'react';
import loading from "../../assets/images/common/loading.gif";
import { Form, Modal, Col, Row, OverlayTrigger, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import Tooltip from "@mui/material/Tooltip";
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { MdEdit, MdDelete } from "react-icons/md";
import { MdFilterList, MdAddCircle } from "react-icons/md";
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";

const Syllabus = () => {
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [syllabusmaps, setSyllabusmap] = useState([]);
    const [academic, setAcademic] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSection] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [months, setMonths] = useState([]);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const handleCloseModal = () => { setOpenModal(false); };
    const [openModal, setOpenModal] = useState(false);
    const [selectedPortion, setSelectedPortion] = useState('');
    const [modalData, setModalData] = useState({});
    const handleOpenModal = (row) => {
        setSelectedPortion(row.portion_alloted);
        setModalData(row);
        setOpenModal(true);
    };

    const fetchSyllabus = async () => {
        try {
            const response = await axios.post(baseUrl + '/syllabusplan/', { action: 'READ' });
            setSyllabusmap(response.data);
        } catch (error) {
            console.error('Error fetching academic data:', error);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchSyllabus();
    }, []);

    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => {
        if (academic.length === 0) {
            fetchAcademicYears();
        }
        if (months.length === 0) {
            fetchMonths();
        }
        if (classes.length === 0) {
            fetchDropdownData('/classes/', setClasses);
            fetchSections();
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
        academic_year_id: 0,
        class_id: 0,
        section_id: 0,
        subject_id: 0,
        userid: 0,
        is_completed: '',
        month_id: 0,
        action: 'FILTER',
    });

    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        const isOnlyFilterAction = (
            filter.action?.toUpperCase() === "FILTER" &&
            filter.class_id === 0 &&
            filter.section_id === 0 &&
            filter.subject_id === 0 &&
            filter.userid === 0 &&
            filter.is_completed === "" &&
            filter.month_id === 0
        );
        if (isOnlyFilterAction) {
            handleFilterClear();
            handleCloseFilterModal();

            return;
        }
        try {
            const response = await axios.post(baseUrl + '/syllabusplan/', filter, {
                headers: { 'Content-Type': 'application/json' },
            });
            setSyllabusmap(response.data || []);
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
            is_completed: "",
            month_id: 0,
            action: "FILTER"
        });
        fetchSyllabus();
    }

    const searchableColumns = [
        (row) => row.class_name,
        (row) => row.section_name,
        (row) => row.subject_name,
        (row) => row.academic_year_name,
        (row) => row.user_name,
        (row) => row.month_name,
        (row) => row.remarks,
        (row) => row.portion_alloted,
    ];

    const filteredRecords = (syllabusmaps || []).filter((syllabusmaps) =>
        searchableColumns.some((selector) => {
            const value = selector(syllabusmaps);
            return String(value || "").toLowerCase().includes(searchQuery.toLowerCase());
        })
    );

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleStatusToggle = async (row, newStatus) => {
        const requestBody = {
            syllabus_plan_id: row.syllabus_plan_id || 0,
            userid: row.userid,
            academic_year_id: row.academic_year_id,
            subject_id: row.subject_id,
            is_completed: newStatus,
            school_id: row.school_id,
            class_id: row.class_id,
            section_id: row.section_id,
            action: "UPDATE"
        };
        try {
            const response = await axios.post(baseUrl + "/syllabusplan/", requestBody, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.status >= 200 && response.status < 300) {
                toast.success("Updated successfully");
                fetchSyllabus();
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error("Failed to update ");
        }
    };

    const handleCreateRecord = async (row) => {
        try {
            const requestBody = {
                syllabus_plan_id: row.syllabus_plan_id || 0,
                class_id: row.class_id || 0,
                section_id: row.section_id || 0,
                subject_id: row.subject_id || 0,
                academic_year_id: userObj.academic_year_id || 0,
                userid: row.userid || 0,
                month_id: row.month_id || 0,
                portion_alloted: row.portion_alloted,
                school_id: userObj.school_id,
                is_completed: "Y",
                action: "UPDATE"
            };
            const response = await axios.post(`${baseUrl}/syllabusplan/`, requestBody, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.status >= 200 && response.status < 300) {
                toast.success("Syllabus added successfully");
                fetchSyllabus();
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to create record");
        }
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

    const fetchMonths = async () => {
        try {
            const response = await axios.post(baseUrl + "/months/", {
                action: "READ"
            });
            setMonths(response.data)
        } catch (error) {
            console.log("Error fetching months :", error)

        }
    };
    const fetchDropdownData = async (endpoint, setter) => {
        try {
            const response = await axios.post(baseUrl + endpoint, { action: 'READ', });
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
            const response = await axios.post(baseUrl + "/teacherssubjectsmap/", {
                action: "FILTER",
                school_id: userObj?.school_id || 0,
                academic_year_id: userObj.academic_year_id,
                class_id: filter.class_id,
            });
            setSubjects(response?.data || []);
        } catch (error) {
            console.error("Error fetching Subjects!", error);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await axios.post(baseUrl + "/Users/", {
                action: "TREAD"
            });
            setTeachers(response.data)

        } catch (error) {
            console.log("Error fetching students name:", error)
        }
    };

    const handleEditClick = (syllabus_plan_id) => {
        const employeemasterToEdit = syllabusmaps.find(syllabus => syllabus.syllabus_plan_id === syllabus_plan_id);
        if (employeemasterToEdit) {
            navigate("/addsyllabus", { state: { syllabusData: employeemasterToEdit } });
        } else {
            console.error(`Academic Year with ID ${syllabus_plan_id} not found.`);
        }
    };

    const handleDeleteClick = async (syllabus_plan_id) => {
        if (!window.confirm('Are you sure you want to change the status?')) return;
        try {
            const response = await axios.post(baseUrl + '/syllabusplan/', { syllabus_plan_id: syllabus_plan_id, action: 'DELETE' }, {
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.status >= 200 && response.status < 300) {
                toast.success('Record Set to InActive');
                fetchSyllabus();
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const columns = [
        {
            name: "Academic Year",
            selector: (row) => row.academic_year_name,
            cell: row => <Tooltip title={row.academic_year_name}><span>{row.academic_year_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: "Month ",
            selector: (row) => row.month_name,
            cell: row => <Tooltip title={row.month_name}><span>{row.month_name}</span></Tooltip>,
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
            name: 'Portion Alloted',
            selector: (row) => row.portion_alloted,
            cell: (row) => (
                <Tooltip title={row.portion_alloted}>
                    <span
                        style={{
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '200px'
                        }}
                        onClick={() => handleOpenModal(row)}>
                        {row.portion_alloted}
                    </span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Is Completed",
            selector: (row) => row.is_completed,
            cell: (row) => (<Tooltip title={row.is_completed}>
                <div style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', fontWeight: 'normal', }}>
                    {row.is_completed === 'Yes' ? (<span style={{ color: 'green', fontWeight: 'bold' }} onClick={() => handleStatusToggle(row, 'N')} > ✔ </span>) : row.is_completed === 'No' ? (
                        <span style={{ color: 'red' }} onClick={() => handleStatusToggle(row, 'Y')}>✘</span>
                    ) : (
                        filteredRecords.length > 0 && row.syllabus_plan_id !== "No Records Found" ? (
                            <span style={{ color: "#aaa", fontSize: "18px", cursor: "pointer" }} onClick={() => handleCreateRecord(row, 'Y')}><Tooltip title="Add">+</Tooltip> </span>
                        ) : null
                    )}
                </div></Tooltip>),
            sortable: true,
        },
        {
            name: "Actions",
            cell: (row) => row.syllabus_plan_id !== "No Records Found" ? (
                <div className='tableActions'>
                    <Tooltip title="Edit" arrow>
                        <a className='commonActionIcons' style={{ cursor: 'pointer' }} onClick={() => handleEditClick(row.syllabus_plan_id)}>
                            <span><MdEdit /></span>  </a>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                        <a className='commonActionIcons' style={{ cursor: 'pointer' }} onClick={() => handleDeleteClick(row.syllabus_plan_id)}>
                            <span><MdDelete /></span> </a>
                    </Tooltip>
                </div>
            ) : null
        },
    ];
    return (
        <div className="pageMain">
            <LeftNav />
            <ToastContainer />
            <div className="pageRight">
                <div className="pageHead">
                    <Header />
                </div>
                <div className="pageBody">
                    <div className="commonDataTableHead">
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                                <h6 className="commonTableTitle">Syllabus Plan</h6>
                            </div>
                            <div className="">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    className="searchInput"
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <div className="d-flex align-items-center" style={{ gap: 6 }}>
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}>
                                    <Button className="secondaryBtn" variant="secondary" onClick={handleShowFilterModal}>
                                        <MdFilterList />
                                    </Button>
                                </OverlayTrigger>
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add</Tooltip>}>
                                    <Button className="primaryBtn" variant="primary" onClick={() => navigate("/addsyllabus")}>
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
                                    data={(Array.isArray(filteredRecords) && filteredRecords.length > 0)
                                        ? filteredRecords
                                        : [{
                                            syllabus_plan_id: "No Records Found",
                                            subject_name: "No Records Found",
                                        }]
                                    }
                                    pagination={Array.isArray(filteredRecords) && filteredRecords.length > 0}
                                    highlightOnHover
                                    responsive
                                    fixedHeader
                                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                                    conditionalRowStyles={[
                                        {
                                            when: (row) => row.userid === "No Records Found",
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
            </div>

            <Dialog open={openModal} onClose={handleCloseModal}>
                <DialogTitle>Portion Alloted</DialogTitle>
                <DialogContent>
                    <p style={{ fontSize: '14px', fontWeight: 'normal' }}>
                        <strong style={{ fontWeight: 'normal' }}>Portion Alloted:</strong> {selectedPortion}
                    </p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

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
                                        <Form.Label>AcademicYear</Form.Label>
                                        <Form.Select
                                            name="academic_year_name"
                                            id="academic_year_id"
                                            value={filter.academic_year_id}
                                            onChange={(e) => setFilter({ ...filter, academic_year_id: e.target.value })}>
                                            <option value="">Select Academic</option>
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
                                    <Form.Group controlId="month_name">
                                        <Form.Label>Month</Form.Label>
                                        <Form.Select
                                            name="month_name"
                                            id="month_name"
                                            value={filter.month_id}
                                            onChange={(e) => setFilter({ ...filter, month_id: e.target.value })}>
                                            <option value="">Select Month</option>
                                            {(months || []).map((month) => (
                                                <option key={month.month_id} value={month.month_id}>
                                                    {month.month_name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group>
                                        <Form.Label> Class </Form.Label>
                                        <select
                                            type="number"
                                            className="form-select"
                                            id="class_id"
                                            value={filter.class_id}
                                            onChange={(e) => setFilter({ ...filter, class_id: e.target.value })}
                                        >
                                            <option value="0">Select Class</option>
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
                                            <option value="">Select Subject</option>
                                            {(subjects || [])  .filter((subject) => subject.is_active === "Active").map((subject,index) => (
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
                                    <Form.Group controlId="is_completed">
                                        <Form.Label>Is Completed </Form.Label>
                                        <Form.Select
                                            type="text"
                                            name="is_completed "
                                            value={filter.is_completed}
                                            onChange={(e) => setFilter({ ...filter, is_completed: e.target.value })}>
                                            <option value="">Select Is Completed</option>
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
                    <Button variant="secondary" className="btn-info clearBtn me-2" onClick={handleFilterClear}>
                        Reset
                    </Button>
                    <div>
                        <Button variant="secondary" className="btn-danger secondaryBtn me-2" onClick={handleCloseFilterModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="btn-success primaryBtn" form="filterForm" onClick={handleCloseFilterModal}>
                            Search
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    )
};
export default Syllabus;
