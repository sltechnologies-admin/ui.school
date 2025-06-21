import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { ToastContainer, toast } from 'react-toastify';
import loading from "../../assets/images/common/loading.gif";
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import axios from "axios";
import DataTable from 'react-data-table-component';
import * as XLSX from 'xlsx';
import excelIcon from "../../assets/icons/excel.png";
import { Tooltip } from '@mui/material';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa";
const Studentattendancereport = () => {
    const userData = sessionStorage.getItem('user');
    const userObj = JSON.parse(userData);
    const [classes, setClasses] = useState([]);
    const [sections, setSection] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [studentsData, setStudentsData] = useState([]);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [form, setForm] = useState({
        class_id: "",
        section_id: "",
        is_present: "",
        period_id: "",
    });
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const searchableColumns = [
        "admission_number",
        "student_name",
        "class_name",
        "section_name",
        "father_name",
        "dob",
        "date_of_join",
        "gender",
        "caste",
        "primary_contact",
        "attendance_count"
    ];

    const exportToExcel = () => {
        if (studentsData.length === 0) {
            toast.error("No data available to export.");
            return;
        }

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(studentsData);

        // Calculate maximum width for each column
        const columnWidths = studentsData.length > 0
            ? Object.keys(studentsData[0]).map(key => {
                const maxLength = Math.max(
                    key.length, // Get length of header
                    ...studentsData.map(student => (student[key] ? student[key].toString().length : 0)) // Get length of each value
                );
                return { wch: maxLength + 2 }; // Add some padding
            })
            : [];

        // Set the column widths in the worksheet
        worksheet['!cols'] = columnWidths;

        // Create workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Student Attendance Type Report");

        // Write the file
        XLSX.writeFile(workbook, `student_attendance_type_report_${new Date().toISOString()}.xlsx`);
    };


    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredRecords = (studentsData || []).filter((student) => {
        return searchableColumns.some((column) => {
            const value = student[column];

            if (value) {
                // Handle "DOB" by manually formatting it to "DD-MM-YYYY"
                if (column === "dob" && student.dob) {
                    const formattedDOB = student.dob.split(" ")[0].split("-").reverse().join("-");
                    return formattedDOB.includes(searchQuery);
                }
                // Handle "Admission Date" (date_of_join) by manually formatting it to "DD-MM-YYYY"
                if (column === "date_of_join" && student.date_of_join) {
                    const formattedAdmissionDate = student.date_of_join.split(" ")[0].split("-").reverse().join("-");
                    return formattedAdmissionDate.includes(searchQuery);
                }
                // Handle other columns as normal strings
                return String(value).toLowerCase().includes(searchQuery.toLowerCase());
            }
            return false;
        });
    });

    const exportToPDF = () => {
        if (filteredRecords.length === 0) {
            toast.error("No data available to export.");
            return;
        }

        const doc = new jsPDF();
        doc.text("Student Admission Report", 14, 10);

        const tableColumn = ["Admission Number", "Student Name", "Class", "Section", "Admission Date", "DOB", "Gender", "Father Name", "Mobile Number"];
        const tableRows = [];

        filteredRecords.forEach((row) => {
            const formattedDOB = row.dob ? row.dob.split(" ")[0].split("-").reverse().join("-") : "";
            const formattedAdmissionDate = row.date_of_join ? row.date_of_join.split(" ")[0].split("-").reverse().join("-") : "";

            tableRows.push([
                row.admission_number || "",
                row.student_name || "",
                row.class_name || "",
                row.section_name || "",
                formattedAdmissionDate,
                formattedDOB,
                row.gender || "",
                row.father_name || "",
                row.father_phone_number || ""
            ]);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save(`student_attendance_type_report_${new Date().toISOString()}.pdf`);
    };

    const fetchClasses = async () => {
        try {
            const response = await axios.post(baseUrl + "/classes/", {
                action: "READ",
                school_id: userObj.school_id
            });
            setClasses(response.data)
        } catch (error) {
            console.log("Error fetching class name:", error);
        }
    };

    useEffect(() => {
        fetchSections(form.class_id || 0);
    }, [form.class_id]);

    const fetchSections = async (class_id) => {
        try {
            const response = await axios.post(baseUrl + "/Sections/", {
                action: "DROPDOWNREAD",
                class_id: class_id,
                school_id: userObj.school_id
            });
            setSection(response.data);
        } catch (error) {
            console.log("Error fetching section name:", error);
        }
    };

    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${d.getFullYear()}-${month}-${day}`;
    };

    const formatToDDMMYYYY = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getStartAndEndOfWeek = () => {
        const currentDate = new Date();
        const currentDayOfWeek = currentDate.getDay();
        const daysToSubtract = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - daysToSubtract);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return { startOfWeek, endOfWeek };
    };

    const fetchStudentsData = async () => {
        if (form.period_id) {
            let formattedFromDate = null;
            let formattedToDate = null;

            if (form.period_id === "Date Range") {
                formattedFromDate = formatDate(fromDate);
                formattedToDate = formatDate(toDate);
            } else if (form.period_id === "This Week") {
                const { startOfWeek, endOfWeek } = getStartAndEndOfWeek();
                formattedFromDate = formatDate(startOfWeek);
                formattedToDate = formatDate(endOfWeek);
            }

            try {
                const response = await axios.post(baseUrl + "/Studentattdencetypereport/", {
                    action: "FILTER",
                    class_id: form.class_id || null,
                    section_id: form.section_id || null,
                    school_id: userObj.school_id,
                    is_present: form.is_present === "true",
                    type: form.period_id,
                    from_date: formattedFromDate,
                    to_date: formattedToDate
                });

                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    setStudentsData(response.data);
                } else {
                    setStudentsData([]);
                }
            } catch (error) {
                console.log("Error fetching students data:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleInputChange = (event) => {
        const { id, value } = event.target;
        setForm((prevForm) => ({
            ...prevForm,
            [id]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.class_id && !form.period_id) {
            toast.error("Please Select Class Or Period.");
            return;
        }
        fetchStudentsData();
    };

    const columns = [

        {
            name: "Student Name",
            selector: (row) => (
                <Tooltip title={row.student_name}>
                    <span>{row.student_name}</span>
                </Tooltip>
            ),
            sortable: true,

        },
        {
            name: "Class",
            selector: (row) => (
                <Tooltip title={row.class_name}>
                    <span>{row.class_name}</span>
                </Tooltip>
            ),
            sortable: true,

        },
        {
            name: "Section",
            selector: (row) => (
                <Tooltip title={row.section_name}>
                    <span>{row.section_name}</span>
                </Tooltip>
            ),
            sortable: true,

        },
        {
            name: "Father Name",
            selector: (row) => (
                <Tooltip title={row.father_name || ""}>
                    <span>{row.father_name || ""}</span>
                </Tooltip>
            ),
            sortable: true,

        },
        {
            name: "Mobile Number",
            selector: (row) => (
                <Tooltip title={row.father_phone_number}>
                    <span>{row.father_phone_number}</span>
                </Tooltip>
            ),
            sortable: true,

        },
        {
            name: "Working Days",
            selector: (row) => (
                <Tooltip title={row.total_working_days}>
                    <span>{row.total_working_days}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Present",
            selector: (row) => (
                <Tooltip title={row.total_present}>
                    <span>{row.total_present}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Absent",
            selector: (row) => (
                <Tooltip title={row.total_absent}>
                    <span>{row.total_absent}</span>
                </Tooltip>
            ),
            sortable: true,
        },
    ];

    return (

        <div className='pageMain'>
            <ToastContainer />
            <LeftNav />
            <div className='pageRight'>
                <div className='pageHead'>
                    <Header />
                </div>
                <div className='pageBody'>
                    <Container fluid>
                        <Card>
                            <Card.Body className="hide-scrollbar">
                                <form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col xs={12}>
                                            <h6 className='commonSectionTitle'>Attendance Report</h6>
                                        </Col>
                                    </Row>
                                    <Row>

                                        <Col xs={12} md={6} lg={3} xxl={3}>
                                            <div className="commonInput">
                                                <Form.Group>
                                                    <Form.Label>Type</Form.Label>
                                                    <select
                                                        className="form-select"
                                                        id="period_id"
                                                        value={form.period_id}
                                                        onChange={handleInputChange}
                                                        required
                                                    >
                                                        <option value="">Select Type</option>
                                                        <option value="This Week">This Week</option>
                                                        <option value="This Month">This Month</option>
                                                        <option value="This Year">This Year</option>
                                                        <option value="Last Six Months">Last Six Months</option>
                                                    </select>
                                                </Form.Group>
                                            </div>
                                        </Col>
                                        <Col xs={12} md={6} lg={3} xxl={3}>
                                            <div className="commonInput">
                                                <Form.Group>
                                                    <Form.Label>Class</Form.Label>
                                                    <select
                                                        className="form-select"
                                                        id="class_id"
                                                        value={form.class_id}
                                                        onChange={handleInputChange}
                                                        required
                                                    >
                                                        <option value="">Select Class</option>
                                                        {(classes || []).map((classItem) => (
                                                            <option key={classItem.class_id} value={classItem.class_id}>
                                                                {classItem.class_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </Form.Group>
                                            </div>
                                        </Col>
                                        <Col xs={12} md={6} lg={3} xxl={3}>
                                            <div className="commonInput">
                                                <Form.Group>
                                                    <Form.Label>Section</Form.Label>
                                                    <select
                                                        className="form-select"
                                                        id="section_id"
                                                        value={form.section_id}
                                                        onChange={handleInputChange}
                                                        required
                                                    >
                                                        <option value="">Select Section</option>
                                                        {(sections || []).map((sectionItem) => (
                                                            <option key={sectionItem.section_id} value={sectionItem.section_id}>
                                                                {sectionItem.section_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </Form.Group>
                                            </div>
                                        </Col>


                                    </Row>

                                    <Row>
                                        <Col>
                                            <div className="d-flex justify-content-end mt-4">
                                                <Button
                                                    type="button"
                                                    variant="primary"
                                                    className="btn-info clearBtn me-3" // adds space between buttons
                                                    onClick={() => {
                                                        setForm({
                                                            class_id: "",
                                                            period_id: "",
                                                            section_id: "",
                                                        });
                                                        setFromDate(null);
                                                        setToDate(null);
                                                        setSearchQuery('');
                                                    }}
                                                >
                                                    Reset
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    className="btn-success primaryBtn"
                                                >
                                                    Search
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>

                                </form>
                            </Card.Body>
                        </Card>

                        <div className="d-flex justify-content-between align-items-center mt-3">
                            {/* Search Input on the left */}
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                className="form-control form-control-sm w-25"
                                onChange={handleSearchChange}
                            /><div>
                                <Button className='btnMain' variant="success" onClick={exportToExcel} style={{ marginRight: "10px" }}>
                                    <img
                                        src={excelIcon}
                                        alt="Download Excel"
                                        style={{ width: "20px", marginRight: "5px" }}
                                    />

                                </Button>
                                <Button className="btnMain" variant="danger" onClick={exportToPDF}>
                                    <FaFilePdf style={{ marginRight: "5px" }} />
                                </Button>
                            </div>
                        </div>
                        <div className="commonTable height100 mt-2">
                            <div className="tableBody">
                                {isLoading ? (
                                    <div className="text-center">
                                        <img src={loading} alt="loading..." />
                                    </div>
                                ) : (
                                    <DataTable
                                        className="custom-table"
                                        columns={columns}
                                        data={filteredRecords.length > 0 ? filteredRecords : [{ father_name: "No Records Found" }]}
                                        pagination={filteredRecords.length > 0 && filteredRecords[0].section_name !== "No Records Found"}
                                        highlightOnHover
                                        responsive
                                        paginationPerPage={5}
                                        paginationRowsPerPageOptions={[5, 10, 15]}
                                        noDataComponent={<div>No Data Available</div>}
                                        style={{
                                            tableLayout: "fixed",  // Ensures even column width distribution
                                            width: "100%"          // Makes sure the table occupies full width
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                    </Container>

                </div>
            </div>
        </div>
    );
}

export default Studentattendancereport;