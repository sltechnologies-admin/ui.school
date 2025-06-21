import React, { useState, useEffect } from 'react'
import { useLocation, Link } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import loading from "../../assets/images/common/loading.gif";
import DataTable from "react-data-table-component";

const StudenthistoryReports = () => {
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const routeLocation = useLocation();
    const [sections, setSection] = useState([]);
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [studenthistorysmaps, setStudenthistorymap] = useState([]);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [submit, setIsSubmitting] = useState(false);
    const [records, setRecords] = useState([]);
    const [column, setColumns] = useState([])

    useEffect(() => {
        if (studenthistorysmaps && studenthistorysmaps.length > 0) {
            setRecords(studenthistorysmaps);
            setColumns(prev =>
                prev.map(col => ({ ...col, hide: false }))
            );
        } else {
            setRecords([]);
        }
        setIsLoading(false);
    }, [studenthistorysmaps]);

    const [form, setForm] = useState({
        class_id: 0,
        section_id: 0,
        roll_no: "",
        userid: 0,
        username: "",
        mobile_number: "",
        school_id: userObj.school_id,
    });

    const fetchDropdownData = async (endpoint, setter) => {
        try {

            const response = await axios.post(baseUrl + endpoint, { action: 'READ', school_id: userObj.school_id });
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
        }
    };
    useEffect(() => {
        if (form.class_id != 0) {
            fetchSections(form.class_id || 0);
        }
        else {
            setSection()
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
            console.error("Error fetching section: ", error);
        }
    };

    useEffect(() => {
        fetchDropdownData('/classes/', setClasses);
        if (routeLocation.state?.studenthistoryData) {
            const studenthistoryData = routeLocation.state.studenthistoryData;
            setForm(studenthistoryData);
        }
    }, [routeLocation]);

    const formatDate1 = (datetime) => {
        if (!datetime) return "";
        const date = new Date(datetime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}`;
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        if (id === "roll_no" || id === "mobile_number") {
            if (/^\d*$/.test(value)) {
                const cleanedValue = value.replace(/^0+/, "");
                setForm((prevForm) => ({
                    ...prevForm,
                    [id]: cleanedValue,
                }));
            }
        } else {
            setForm((prevForm) => ({
                ...prevForm,
                [id]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (!form.class_id && !form.section_id && !form.firstname && !form.surname && !form.roll_no && !form.mobile_number) {
            toast.warning("Please select at least one to proceed.");
            return;
        }
        const formData = {
            class_id: form.class_id,
            section_id: form.section_id,
            fname: form.firstname,
            lname: form.surname,
            roll_no: (form.roll_no && parseInt(form.roll_no) > 0) ? parseInt(form.roll_no) : undefined,
            mobile_number: form.mobile_number,
            school_id: userObj.school_id,
            academic_year_id: userObj.academic_year_id,
            action: 'FILTER'
        };
        try {
            const response = await axios.post(baseUrl + "/student360/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.data && response.data.length > 0) {
                setStudenthistorymap(response.data);
                toast.success("Data fetched successfully!", { position: "top-right" });
            } else {
                toast.warning("No records found matching your search criteria.", { position: "top-right" });
            }
        } catch (error) {
            if (error.response) {
                const { status, data } = error.response;
            } else {
                console.error("There was an error submitting:", error);
                toast.error("Error submitting data: " + error.message, { position: "top-right" });
            }
        }
    };

    const columns = [
        {
            name: <h6 style={{ fontWeight: 'normal' }}>Admission No</h6>,
            selector: (row) => row.admission_number,
            cell: row => <Tooltip title={row.admission_number}><span>{row.admission_number}</span></Tooltip>,
            sortable: true,
        },
        {
            name: <h6 style={{ fontWeight: 'normal' }}>Student Id</h6>,
            selector: (row) => row.student_id,
            cell: row => <Tooltip title={row.student_id}><span>{row.student_id}</span></Tooltip>,
            sortable: true,
            hide: true,
        },
        {
            name: <h6 style={{ fontWeight: 'normal' }}>Student Name</h6>,
            selector: row => `${row.student_first_name} ${row.student_last_name}`,
            cell: row =>
                row.student_id !== "No Records Found" ? (
                    <Tooltip title={`${row.student_first_name} ${row.student_last_name}`}>
                        <Link
                            to={`/StudentDetails/${row.student_id}`}
                            style={{ color: 'blue', textDecoration: 'none' }}
                            onClick={() => setIsLoading(true)}

                        >
                            <span>{`${row.student_first_name} ${row.student_last_name}`}</span>
                        </Link>
                    </Tooltip>
                ) : (
                    <span></span>
                ),
            sortable: true
        },

        {
            name: <h6 style={{ fontWeight: 'normal', textAlign: 'center', width: '100%' }}>Roll No</h6>,
            selector: (row) => row.roll_no,
            cell: row => (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <Tooltip title={row.roll_no}>
                        <span>{row.roll_no}</span>
                    </Tooltip>
                </div>
            ),
            sortable: true,
        },
        {
            name: <h6 style={{ fontWeight: 'normal' }}>DOB</h6>,
            selector: row => formatDate1(row.dob),
            cell: row => <Tooltip title={formatDate1(row.dob)}><span>{formatDate1(row.dob)}</span></Tooltip>,
            sortable: true
        },
        {
            name: <h6 style={{ fontWeight: 'normal' }}>Admission Date</h6>,
            selector: row => formatDate1(row.date_of_join),
            cell: row => <Tooltip title={formatDate1(row.date_of_join)}><span>{formatDate1(row.date_of_join)}</span></Tooltip>,
            sortable: true
        },
        {
            name: <h6 style={{ fontWeight: 'normal' }}>Admitted Class</h6>,
            selector: (row) => row.admission_to,
            cell: row => <Tooltip title={row.admission_to}><span>{row.admission_to}</span></Tooltip>,
            sortable: true,
        },
        {
            name: <h6 style={{ fontWeight: 'normal' }}>Current Class</h6>,
            selector: (row) => row.class_name,
            cell: row => <Tooltip title={row.class_name}><span>{row.class_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: <h6 style={{ fontWeight: 'normal' }}>Current Section</h6>,
            selector: (row) => row.section_name,
            cell: row => <Tooltip title={row.section_name}><span>{row.section_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: <h6 style={{ fontWeight: 'normal' }}>Mobile Number</h6>,
            selector: (row) => row.father_phone_number,
            cell: row => <Tooltip title={row.father_phone_number}><span>{row.father_phone_number}</span></Tooltip>,
            sortable: true,
        },
        {
            name: <h6 style={{ fontWeight: 'normal' }}>Father Name</h6>,
            selector: row => `${row.father_firstname} ${row.father_surname}`,
            cell: row => {
                const hasFatherName = row.father_firstname || row.father_surname;
                return hasFatherName ? (
                    `${row.father_firstname ?? ''} ${row.father_surname ?? ''}`.trim()
                ) : (
                    <></>
                );
            },
            sortable: true,
        },
        {
            name: <h6 style={{ fontWeight: 'normal' }}>Mother Name</h6>,
            selector: (row) => `${row.mother_firstname} ${row.mother_surname}`,
            cell: row => <Tooltip title={row.mother_firstname}><span>{row.mother_firstname}</span></Tooltip>,
            sortable: true,
        },
    ];

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
                                            <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                                                <h6 className="commonTableTitle">Student 360</h6>
                                            </div>
                                            <Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <Form.Group>
                                                            <Form.Label>
                                                                Class
                                                            </Form.Label>
                                                            <select
                                                                className="form-select"
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
                                                                Section
                                                            </Form.Label>
                                                            <select
                                                                className="form-select"

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
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label> First Name </Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="firstname"
                                                                value={form.firstname}
                                                                placeholder="Enter First Name"
                                                                maxLength={30}
                                                                isInvalid={!/^[A-Za-z\s]*$/.test(form.firstname)}
                                                                onChange={(e) => {
                                                                    const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                                                    handleInputChange({ target: { id: 'firstname', value } });
                                                                }} />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label> Surname </Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="surname"
                                                                value={form.surname}
                                                                placeholder="Enter Surname"
                                                                maxLength={30}
                                                                isInvalid={!/^[A-Za-z\s]*$/.test(form.surname)}
                                                                onChange={(e) => {
                                                                    const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                                                    handleInputChange({ target: { id: 'surname', value } });
                                                                }} />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Roll Number</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="roll_no"
                                                                value={form.roll_no}
                                                                placeholder="Enter Roll Number"
                                                                onChange={handleInputChange}
                                                                maxLength={15}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Mobile Number</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="mobile_number"
                                                                value={form.mobile_number}
                                                                placeholder="Enter Contact No"
                                                                maxLength={10}
                                                                onChange={handleInputChange}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col>
                                                    <div className="d-flex justify-content-between mt-3">
                                                        <div> </div>
                                                        <div>
                                                            <Button
                                                                type="button"
                                                                variant="primary"
                                                                className="btn-info clearBtn me-3"
                                                                onClick={() => {
                                                                    setForm({
                                                                        class_id: "",
                                                                        period_id: "",
                                                                    });
                                                                }}
                                                            >
                                                                Reset
                                                            </Button>
                                                            <Button type="submit" variant="primary" className="btn-success primaryBtn"> Search </Button>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </form>
                                    <br></br>
                                    <div className="commonTable height100">
                                        <div className="tableBody">
                                            {isLoading ? (
                                                <div className="loadingContainer">
                                                    <img src={loading} alt="Loading..." className="loadingGif" />
                                                </div>
                                            ) : (
                                                <DataTable
                                                    className="custom-table"
                                                    columns={columns.filter(col => !col.hide)}
                                                    data={
                                                        Array.isArray(records) && records.length > 0
                                                            ? records
                                                            : [{
                                                                student_id: 'No Records Found',
                                                                admission_to: 'No Records Found',
                                                            }]

                                                    }
                                                    pagination={Array.isArray(records) && records.length > 0}
                                                    highlightOnHover
                                                    responsive
                                                    fixedHeader
                                                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                                                    conditionalRowStyles={[
                                                        {
                                                            when: row => row.student_id === 'No Records Found',
                                                            style: {
                                                                textAlign: 'center',
                                                                fontSize: '16px',
                                                                color: 'red',
                                                                backgroundColor: '#f9f9f9',
                                                            },
                                                        },
                                                    ]}
                                                />
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
export default StudenthistoryReports;