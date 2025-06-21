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
import { Tooltip } from "@mui/material";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaFilePdf } from "react-icons/fa";
const AdmissionReport = () => {
    const userData = sessionStorage.getItem('user');
    const userObj = JSON.parse(userData);
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [studentsData, setStudentsData] = useState([]);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [form, setForm] = useState({
        class_id: "",
        period_id: "",
    });
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const searchableColumns = [
        "admission_number",
        "student_first_name",
        "student_last_name",
        "class_name",
        "section_name",
        "father_surname",
        "father_firstname",
        "dob",
        "date_of_join",
        "gender",
        "caste",
        "primary_contact"
    ];

    const exportToExcel = () => {
        if (studentsData.length === 0) {
            toast.error("No data available to export.");
            return;
        }
        // Map the data to only include the specified columns
        const filteredData = studentsData.map((row) => ({
            "Admission Number": row.admission_number,
            "Admission Date": formatToDDMMYYYY(row.date_of_join),
            "Student Name": `${row.student_first_name || ""} ${row.student_last_name || ""}`,
            "Class": row.class_name,
            "Section": row.section_name,
            "DOB": formatToDDMMYYYY(row.dob),
            "Gender": row.gender,
            "Father Name": `${row.father_surname || ""} ${row.father_firstname || ""}`,
            "Mobile Number": row.father_phone_number,
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(filteredData);

        // Calculate maximum width for each column
        const columnWidths = Object.keys(filteredData[0]).map(key => {
            const maxLength = Math.max(
                key.length, // Get length of header
                ...filteredData.map(row => (row[key] ? row[key].toString().length : 0)) // Get length of each value
            );
            return { wch: maxLength + 2 }; // Add some padding
        });

        // Set the column widths in the worksheet
        worksheet['!cols'] = columnWidths;

        // Create workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Admission Report");

        // Write the file
        XLSX.writeFile(workbook, `admission_report_${new Date().toISOString()}.xlsx`);
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
    const fetchClasses = async () => {
        try {
            const response = await axios.post(baseUrl + "/classes/", { action: "READ", school_id: userObj.school_id });
            setClasses(response.data);
        } catch (error) {
            console.log("Error fetching class name:", error);
        }
    };

    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${year}-${month}-${day}`; // Ensure it's in yyyy-mm-dd format for date input
    };


    const formatToDDMMYYYY = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`; // 'dd-mm-yyyy' format
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
                const response = await axios.post(baseUrl + "/admissionreport/", {
                    action: "FILTER",
                    class_id: form.class_id || null,
                    period_id: form.period_id,
                    school_id: userObj.school_id,
                    from_date: formattedFromDate,
                    to_date: formattedToDate,
                    today: "",
                    type: form.period_id === "Date Range" || form.period_id === "This Week" ? "Date Range" : form.period_id
                });

                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    const [firstItem] = response.data;

                    if (firstItem.message === 'No admission report data found') {
                        setStudentsData([]);
                    } else {
                        setStudentsData(response.data);
                    }
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

    const handleInputChange = (e) => {
        const { id, value } = e.target;
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
    function truncateText(text, maxLength = 10) {
        if (!text) return "";
        return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
    }


    const columns = [
        {
            name: "Admission Number",
            selector: (row) => row.admission_number,
            cell: (row) => (
                <Tooltip title={row.admission_number}>
                    <span >{row.admission_number}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Admission Date",
            selector: (row) => row.date_of_join ? row.date_of_join.split(" ")[0].split("-").reverse().join("-") : "",
            cell: (row) => (
                <Tooltip title={row.date_of_join ? row.date_of_join.split(" ")[0].split("-").reverse().join("-") : ""}>
                    <span >
                        {row.date_of_join ? row.date_of_join.split(" ")[0].split("-").reverse().join("-") : ""}
                    </span>
                </Tooltip>
            ),
            sortable: true,
        }
        ,
        {
            name: "Student Name",
            selector: (row) => `${row.student_first_name || ""} ${row.student_last_name || ""}`,
            cell: (row) => {
                const fullName = `${row.student_first_name || ""} ${row.student_last_name || ""}`;
                const displayName = truncateText(fullName, 10);
                return (
                    <Tooltip title={fullName}>
                        <span>{displayName}</span>
                    </Tooltip>
                );
            },
            sortable: true,
        },
        {
            name: "Class",
            selector: (row) => row.class_name,
            cell: (row) => (
                <Tooltip title={row.class_name}>
                    <span >{row.class_name}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Section",
            selector: (row) => row.section_name,
            cell: (row) => (
                <Tooltip title={row.section_name}>
                    <span >{row.section_name}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "DOB",
            selector: (row) => row.dob ? row.dob.split(" ")[0].split("-").reverse().join("-") : "",
            cell: (row) => (
                <Tooltip title={row.dob ? row.dob.split(" ")[0].split("-").reverse().join("-") : ""}>
                    <span>
                        {row.dob ? row.dob.split(" ")[0].split("-").reverse().join("-") : ""}
                    </span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Gender",
            selector: (row) => row.gender,
            cell: (row) => (
                <Tooltip title={row.gender}>
                    <span>{row.gender}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Father Name",
            selector: (row) => `${row.father_surname || ""} ${row.father_firstname || ""}`,
            cell: (row) => {
                const fullName = `${row.father_surname || ""} ${row.father_firstname || ""}`;
                const displayName = truncateText(fullName, 10);
                return (
                    <Tooltip title={fullName}>
                        <span>{displayName}</span>
                    </Tooltip>
                );
            },
            sortable: true,
        },
        {
            name: "Mobile Number",
            selector: (row) => row.father_phone_number,
            cell: (row) => (
                <Tooltip title={row.father_phone_number}>
                    <span >{row.father_phone_number}</span>
                </Tooltip>
            ),
            sortable: true
        },
        {
            name: "Mother Name",
            selector: (row) => `${row.mother_surname || ""} ${row.mother_firstname || ""}`,
            cell: (row) => {
                const fullName = `${row.mother_surname || ""} ${row.mother_firstname || ""}`;
                const displayName = truncateText(fullName, 10);
                return (
                    <Tooltip title={fullName}>
                        <span>{displayName}</span>
                    </Tooltip>
                );
            },
            sortable: true,
        },
        {
            name: "Mobile Number",
            selector: (row) => row.mother_phone_number,
            cell: (row) => (
                <Tooltip title={row.mother_phone_number}>
                    <span >{row.mother_phone_number}</span>
                </Tooltip>
            ),
            sortable: true
        }
    ];

    const exportToPDF = () => {
        if (filteredRecords.length === 0 || (filteredRecords.length === 1 && filteredRecords[0].student_first_name === "No Records Found")) {
            toast.error("No data available to export.");
            return;
        }

        const doc = new jsPDF();
        doc.text("Admission Report", 14, 10);

        const tableColumn = [
            "Admission Number",
            "Admission Date",
            "Student Name",
            "Class",
            "Section",
            "DOB",
            "Gender",
            "Father Name",
            "Mobile Number"
        ];

        const tableRows = filteredRecords.map(row => [
            row.admission_number || "-",
            formatToDDMMYYYY(row.date_of_join) || "-",
            `${row.student_first_name || ""} ${row.student_last_name || ""}`.trim(),
            row.class_name || "-",
            row.section_name || "-",
            formatToDDMMYYYY(row.dob) || "-",
            row.gender || "-",
            `${row.father_surname || ""} ${row.father_firstname || ""}`.trim(),
            row.father_phone_number || "-"
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save(`admission_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

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
                                            <h6 className='commonSectionTitle'>Admission Report</h6>
                                        </Col>
                                    </Row>
                                    <Row>
                                        {/* Period Dropdown First */}
                                        <Col xs={12} md={6} lg={3} xxl={3}>
                                            <div className="commonInput">
                                                <Form.Group>
                                                    <Form.Label>Period</Form.Label>
                                                    <select
                                                        className="form-select"
                                                        id="period_id"
                                                        value={form.period_id}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">Select Period</option>
                                                        <option value="Today">Today</option>
                                                        <option value="This Week">This Week</option>
                                                        <option value="This Month">This Month</option>
                                                        <option value="This Year">This Year</option>
                                                        <option value="Date Range">Date Range</option>
                                                    </select>
                                                </Form.Group>
                                            </div>
                                        </Col>

                                        {/* From Date and To Date, displayed only if Date Range is selected */}
                                        {form.period_id === "Date Range" && (
                                            <>
                                                <Col xs={12} md={6} lg={3} xxl={3}>
                                                    <div className="commonInput">
                                                        <Form.Group>
                                                            <Form.Label>From Date</Form.Label>
                                                            <Form.Control
                                                                type="date"
                                                                id="fromDate"
                                                                value={fromDate ? formatDate(fromDate) : ""}
                                                                onChange={(e) => setFromDate(e.target.value ? new Date(e.target.value) : null)}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={3} xxl={3}>
                                                    <div className="commonInput">
                                                        <Form.Group>
                                                            <Form.Label>To Date</Form.Label>
                                                            <Form.Control
                                                                type="date"
                                                                id="toDate"
                                                                value={toDate ? formatDate(toDate) : ""}
                                                                onChange={(e) => setToDate(e.target.value ? new Date(e.target.value) : null)}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                            </>
                                        )}

                                        {/* Class Dropdown Last */}
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
                                    </Row>
                                    <Row>
                                        <Col>
                                            <div className="d-flex justify-content-end mt-4"> {/* Reduced margin from mt-5 to mt-4 */}
                                                <Button
                                                    type="button"
                                                    variant="primary"
                                                    className="btn-info clearBtn me-3"
                                                    onClick={() => {
                                                        setForm({
                                                            class_id: "",
                                                            period_id: "",
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

                        {/* Search Input */}
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            {/* Search Input on the left */}
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                className="form-control form-control-sm w-25"
                                onChange={handleSearchChange}
                            />
                            <div>
                                {/* Download Excel Button on the right */}
                                <Button className='btnMain' variant="success" onClick={exportToExcel} style={{ marginRight: "10px" }} >
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
                                    <div className="loadingContainer">
                                        <img src={loading} alt="Loading..." className="loadingGif" />
                                    </div>
                                ) : (
                                    <DataTable
                                        className="custom-table"
                                        columns={columns}
                                        data={filteredRecords.length > 0 ? filteredRecords : [{ section_name: "No Records Found" }]}
                                        pagination={filteredRecords.length > 0 && filteredRecords[0].student_first_name !== "No Records Found"}
                                        highlightOnHover
                                        responsive
                                        fixedHeader
                                        paginationPerPage={5}
                                        paginationRowsPerPageOptions={[5, 10, 15]}
                                        fixedHeaderScrollHeight="calc(100vh - 170px)"
                                        // Remove the conditionalRowStyles
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
};
export default AdmissionReport;
