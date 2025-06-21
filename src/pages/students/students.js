import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Modal, Form, Badge, Image, Button, OverlayTrigger } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete, MdAddCircle, MdRemoveRedEye } from "react-icons/md";
import { Tooltip } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import { MdFilterList } from "react-icons/md";
import * as XLSX from 'xlsx';
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import loading from "../../assets/images/common/loading.gif";

const Students = () => {
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};

    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => setShowFilterModal(true);
    const [searchQuery, setSearchQuery] = useState("");
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [users, setUsers] = useState([]);
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        fetchStudents();
        fetchDropdownData('/Users/', setUsers, userObj.school_id);
        fetchDropdownData('/classes/', setClasses, userObj.school_id);
    }, []);

    const fetchDropdownData = async (endpoint, setter) => {
        try {
            let action = 'READ';
            if (endpoint === "/Users/") {
                action = 'TREAD';
            }
            const response = await axios.post(baseUrl + endpoint, { action });
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
        }
    };

    const fetchSections = async (class_id) => {
        try {
            const response = await axios.post(baseUrl + "/getsectionsbyteachersubjectmap/", {
                action: "SECTIONREAD",
                school_id: userObj.school_id,
                class_id: class_id
            });
            setSections(response.data);
        } catch (error) {
            console.error("Error fetching section:", error);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await axios.post(baseUrl + "/students/", {
                action: "READ", school_id: userObj.school_id
            });
            setStudents(response.data);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchStudents().finally(() => setIsLoading(false));
    }, []);

    const formatDate1 = (datetime) => {
        if (!datetime) return "";
        const date = new Date(datetime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}`;
    };

    const handleEditClick = (student_id) => {
        const studentToEdit = students.find(student => student.student_id === student_id);
        if (studentToEdit) {
            navigate("/addstudent", {
                state: {
                    userData: studentToEdit,
                    imgName: studentToEdit.passport_size_photo
                },
            });
        } else {
            console.error(`Student with ID ${student_id} not found.`);
        }
    };

    const handleViewClick = (student_id) => {
        const studentToEdit = students.find(student => student.student_id === student_id);
        if (studentToEdit) {
            navigate("/viewstudents", {
                state: {
                    userData: studentToEdit,
                },
            });
        } else {
            console.error(`Student with ID ${student_id} not found.`);
        }
    };

    const columns = [
        {
            name: "Image",
            selector: (row) => row.passport_size_photo,
            cell: () => null,
            sortable: true,
            omit: true,
        },
        {
            name: "Admission Number",
            selector: row => row.admission_number,
            cell: row => <Tooltip title={row.admission_number}><span>{row.admission_number}</span></Tooltip>,
            sortable: true
        },
        {
            name: "First Name",
            selector: row => row.student_first_name,
            cell: row => <Tooltip title={row.student_first_name}><span>{row.student_first_name}</span></Tooltip>,
            sortable: true,
            width: "120px"
        },
        {
            name: "Surname",
            selector: row => row.student_last_name,
            cell: row => <Tooltip title={row.student_last_name}><span>{row.student_last_name}</span></Tooltip>,
            sortable: true,
            width: "135px"
        },
        {
            name: "Roll Number",
            selector: row => row.roll_no,
            cell: row => <Tooltip title={row.roll_no}><span>{row.roll_no}</span></Tooltip>,
            sortable: true,
            width: "105px"
        },
        {
            name: "DOJ",
            selector: row => formatDate1(row.date_of_join),
            cell: row => <Tooltip title={formatDate1(row.date_of_join)}><span>{formatDate1(row.date_of_join)}</span></Tooltip>,
            sortable: true
        },
        {
            name: "Class",
            selector: row => row.class_name,
            cell: row => <Tooltip title={row.class_name}><span>{row.class_name}</span></Tooltip>,
            sortable: true,
            width: "130px"
        },
        {
            name: "Section",
            selector: row => row.section_name,
            cell: row => <Tooltip title={row.section_name}><span>{row.section_name}</span></Tooltip>,
            sortable: true
        },
        {
            name: "Class Teacher",
            selector: row => row.student_class_teacher_name || " ",
            cell: row => {
                const teacherName = row.student_class_teacher_name || " ";
                return (
                    <Tooltip title={teacherName}>
                        <span>
                            {teacherName.length > 15 ? teacherName.substring(0, 15) + "..." : teacherName}
                        </span>
                    </Tooltip>
                );
            },
            sortable: true,
            width: "135px"
        },
        {
            name: "Gender",
            selector: row => row.gender,
            cell: row => <Tooltip title={row.gender}><span>{row.gender}</span></Tooltip>,
            sortable: true,
            width: "80px"
        },
        {
            name: "Status",
            selector: row => row.status,
            cell: row => <Tooltip title={row.status}><span>{row.status}</span></Tooltip>,
            sortable: true
        },
        {
            name: "Actions",
            cell: row => (
                (filteredRecords || []).length > 0 ? (
                    <div className="tableActions">
                        <Tooltip title="Edit" arrow>
                            <a className="commonActionIcons">
                                <span onClick={() => handleEditClick(row.student_id)}> <MdEdit /></span>
                            </a>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                            <a className="commonActionIcons">
                                <span onClick={() => handleDeleteClick(row.student_id)}><MdDelete /></span>
                            </a>
                        </Tooltip>
                        <Tooltip title="View" arrow>
                            <a className="commonActionIcons">
                                <span onClick={() => handleViewClick(row.student_id)}><MdRemoveRedEye /></span>
                            </a>
                        </Tooltip>
                    </div>
                ) : null
            ),
        },
    ];

    const handleDeleteClick = async (student_id) => {
        const confirmDelete = window.confirm("Are you sure you want change the status?");

        if (!confirmDelete) {
            return;
        }
        const requestBody = {
            student_id: student_id,
            action: "DELETE"
        };
        try {
            const response = await axios.post(baseUrl + "/students/", requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            toast.success("Record Set to InActive");
            fetchStudents();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const searchableColumns = [
        (row) => row.admission_number,
        (row) => row.student_first_name,
        (row) => row.student_last_name,
        (row) => row.roll_no,
        (row) => row.date_of_join,
        (row) => row.class_name,
        (row) => row.section_name,
        (row) => row.student_class_teacher_name,
        (row) => row.gender,
        (row) => row.status,
    ];

    const filteredRecords = (students || []).filter((item) =>
        searchableColumns.some((selector) => {
            const value = selector(item);
            const stringValue = String(value || '').toLowerCase().replace(/[-\s]+/g, '');
            const normalizedQuery = searchQuery.toLowerCase().replace(/[-\s]+/g, '');
            return stringValue.includes(normalizedQuery);
        })
    );

    const [filter, setFilter] = useState({
        student_first_name: "",
        student_last_name: "",
        class_id: 0,
        section_id: 0,
        admission_number: "",
        student_class_teacher_id: 0,
        gender: "",
        date_of_join: "",
        action: "FILTER",
    });

    useEffect(() => {
        if (filter.class_id != 0) {
            fetchSections(filter.class_id || 0);
        }
        else {
            setSections()
        }
    }, [filter.class_id]);

    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(baseUrl + "/students/", filter, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setStudents(response.data || []);
            handleCloseFilterModal();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleFilterClear = async () => {
        setFilter({
            student_first_name: "",
            student_last_name: "",
            class_id: 0,
            section_id: 0,
            admission_number: "",
            student_class_teacher_id: 0,
            gender: "",
            date_of_join: "",
            action: "FILTER",
        });
        fetchStudents();
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const validExtensions = ['.xlsx', '.xls'];
            const extension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.'));
            if (!validExtensions.includes(extension)) {
                toast.warning("Please upload a valid Excel file (.xlsx or .xls)");
                return;
            }
            setFile(selectedFile);
        }
    };

    const generatePassword = () => {
        const length = 10;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*!";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    };

    const columnMappings = [
        { original: 'student_first_name', index: 0 },
        { original: 'student_last_name', index: 1 },
        { original: 'dob', index: 2 },
        { original: 'blood_group_id', index: 3 },
        { original: 'address', index: 4 },
        { original: 'city', index: 5 },
        { original: 'state', index: 6 },
        { original: 'country', index: 7 },
        { original: 'date_of_join', index: 8 },
        { original: 'class_id', index: 9 },
        { original: 'section_id', index: 10 },
        { original: 'student_class_teacher_id', index: 11 },
        { original: 'aadhar_card_no', index: 12 },
        { original: 'birth_certificate_no', index: 13 },
        { original: 'gender', index: 14 },
        { original: 'permanent_address', index: 15 },
        { original: 'caste', index: 16 },
        { original: 'religion_id', index: 17 },
        { original: 'roll_no', index: 18 },
        { original: 'academic_year_id', index: 19 },
        { original: 'admission_number', index: 20 },
        { original: 'mother_tongue', index: 21 },
        { original: 'nationality', index: 22 },
        { original: 'father_occupation', index: 23 },
        { original: 'mother_occupation', index: 24 },
        { original: 'class_last_studied', index: 25 },
        { original: 'previous_school_name', index: 26 },
        { original: 'admission_to', index: 27 },
        { original: 'first_language_id', index: 28 },
        { original: 'second_language_id', index: 29 },
        { original: 'vaccination', index: 30 },
        { original: 'primary_contact', index: 31 },
        { original: 'father_surname', index: 32 },
        { original: 'father_firstname', index: 33 },
        { original: 'mother_surname', index: 34 },
        { original: 'mother_firstname', index: 35 },
        { original: 'father_email', index: 36 },
        { original: 'mother_email', index: 37 },
        { original: 'father_phone_number', index: 38 },
        { original: 'mother_phone_number', index: 39 },
        { original: 'school_id', index: 40 },
        { original: 'father_aadhar_number', index: 41 },
        { original: 'mother_aadhar_number', index: 42 },
        { original: 'sibling1_id', index: 43 },
        { original: 'sibling2_id', index: 44 },
        { original: 'sibling3_id', index: 45 },
        { original: 'third_language_id', index: 46 },
    ];

    const handleUpload = async () => {
        if (!file) {
            toast.warning("Please upload a file");
            return;
        }
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                const dataRows = jsonData.slice(1)
                    .map((row) => {
                        const obj = {};
                        columnMappings.forEach(({ original, index }) => {
                            obj[original] = row[index];
                        });

                        return obj;
                    })
                const defaultObject = {
                    student_id: 0,
                    action: 'CREATE',
                };
                const updatedDataRows = dataRows.map(row => ({
                    ...row,
                    password: generatePassword(),
                    ...defaultObject,
                }));
                const response = await axios.post(baseUrl + "/students/bulk-upload/", updatedDataRows);
                toast.success(response.data.message);
            } catch (error) {
                console.error("Error uploading file:", error);
                toast.error("Error uploading file");
            } finally {
                setFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                fetchStudents();
            }
        };
        reader.readAsArrayBuffer(file);
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
                    <div className="commonDataTableHead">
                        <div className='d-flex justify-content-between align-items-center w-100'>
                            <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                                <h6 className="commonTableTitle">Student Master</h6>
                            </div>
                            <div className="">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    className="searchInput mx-3"
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <div className="d-flex align-items-center" style={{ gap: 6 }}>
                                <div className="fileUploadPart" style={{ gap: 6 }}>
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls"
                                        onChange={handleFileChange}
                                        ref={fileInputRef}
                                        className="form-control form-control-sm commonFileUpload"
                                    />
                                    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Upload</Tooltip>}>
                                        <Button className="btn primaryBtn"
                                            onClick={handleUpload}
                                        >
                                            <span>Upload</span>
                                        </Button>
                                    </OverlayTrigger>
                                </div>
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}>
                                    <Button className="secondaryBtn" variant="Secondary" onClick={handleShowFilterModal}>
                                        <span><MdFilterList /></span>
                                    </Button>
                                </OverlayTrigger>
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add</Tooltip>}>
                                    <Button className="primaryBtn" variant="primary" onClick={() => navigate("/addstudent")}>
                                        <span><MdAddCircle /></span>
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
                                    data={filteredRecords.length > 0 ? filteredRecords : [{ class_name: 'No Records Found'}]}
                                    pagination={filteredRecords.length > 0}
                                    highlightOnHover
                                    responsive
                                    fixedHeader
                                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                                    conditionalRowStyles={[
                                        {
                                            when: (row) => row.class_name === 'No Records Found',
                                            style: { textAlign: 'center', fontSize: '16px', color: 'red', backgroundColor: '#f9f9f9' },
                                        },
                                    ]}
                                />
                            )}
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
                                    <Form.Group controlId="firstName">
                                        <Form.Label>Admission Number</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="admission_number"
                                            placeholder="Enter Admission Number"
                                            value={filter.admission_number}
                                            maxLength={30}
                                            onChange={(e) => setFilter({ ...filter, admission_number: e.target.value.trim() })}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="surName">
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="student_first_name"
                                            placeholder="Enter First Name"
                                            value={filter.student_first_name}
                                            maxLength={30}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                                setFilter({ ...filter, student_first_name: value });
                                            }}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="surName">
                                        <Form.Label>Surname</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="surName"
                                            placeholder="Enter Surname"
                                            value={filter.student_last_name}
                                            maxLength={30}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                                setFilter({ ...filter, student_last_name: value });
                                            }}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="surName">
                                        <Form.Label>DOJ</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="doj"
                                            value={filter.date_of_join}
                                            onChange={(e) => setFilter({ ...filter, date_of_join: e.target.value.trim() })}
                                        />
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
                                                .filter((classItem) => classItem.is_active === "Active") // Filter to include only active classes
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
                                        <Form.Control.Feedback>Required</Form.Control.Feedback>
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group>
                                        <Form.Label>Class Teacher</Form.Label>
                                        <select
                                            className="form-select"
                                            id="student_class_teacher_id"
                                            value={filter.student_class_teacher_id}
                                            onChange={(e) => setFilter({ ...filter, student_class_teacher_id: e.target.value })}
                                        >
                                            <option value="0">Select Class Teacher</option>
                                            {(users || []).map((users) => (
                                                <option key={users.userid} value={users.userid}>
                                                    {users.surname + " " + users.firstname}
                                                </option>
                                            ))}
                                        </select>
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12} >
                                <div className='commonInput'>
                                    <Form.Group controlId="is_current_year">
                                        <Form.Label>Gender</Form.Label>
                                        <Form.Select
                                            type="text"
                                            name="gender"
                                            value={filter.gender}
                                            onChange={(e) => setFilter({ ...filter, gender: e.target.value })}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="M">Male</option>
                                            <option value="F">Female</option>
                                        </Form.Select>
                                        <Form.Control.Feedback>Required</Form.Control.Feedback>
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
                        onClick={handleFilterClear}
                    >
                        Reset
                    </Button>

                    <div className="">
                        <Button variant="secondary" className="btn-danger secondaryBtn"
                            onClick={() => { handleCloseFilterModal(); }}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="btn-success primaryBtn" form="filterForm" onClick={handleCloseFilterModal}>
                            Search
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Students;
