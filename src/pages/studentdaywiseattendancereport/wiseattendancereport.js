import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";
import DataTable from 'react-data-table-component';
import loading from "../../assets/images/common/loading.gif";
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import * as XLSX from 'xlsx';
import excelIcon from "../../assets/icons/excel.png";
import { Tooltip } from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa"; 

const Studentdaywiseattendancereport = () => {
    const userData = sessionStorage.getItem('user');
    const userObj = JSON.parse(userData);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);
    const [academic, setAcademic] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSection] = useState([]);
    const [attendanceDate, setAttendanceDate] = useState("");
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    
    const [form, setForm] = useState({
        academic_year_id: userObj.academic_year_id,
        class_id: "",
        section_id: "",
        attendanceDate: "",
    });


    const exportToPDF = () => {
        if (attendanceData.length === 0) {
            toast.error("No data available to export.");
            return;
        }
    
        const doc = new jsPDF();
        doc.text("Student Day Wise Attendance Report", 14, 10);
    
        const tableColumn = ["Admission Number", "Roll Number", "Student Name", "Attendance", "Admission Date"];
        const tableRows = [];
    
        attendanceData.forEach((row) => {
            const attendanceStatus = row.is_present ? "Present" : "Absent";
            const formattedDate = row.date_of_join ? row.date_of_join.split(" ")[0].split("-").reverse().join("-") : "";
    
            tableRows.push([
                row.admission_number || "",
                row.roll_no || "",
                row.student_name || "",
                attendanceStatus,
                formattedDate,
            ]);
        });
    
        // Use autoTable function correctly
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });
    
        doc.save(`attendance_report_${new Date().toISOString()}.pdf`);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!attendanceDate) {
            toast.error("Please select a date.");
            return;
        }

        // setIsLoading(true);
        try {
            const response = await axios.post(baseUrl + "/studentdaywiseattendancereport/", {
                action: "FILTER",
                academic_year_id: form.academic_year_id,
                class_id: form.class_id,
                section_id: form.section_id,
                attendance_date: attendanceDate,
                school_id: userObj.school_id, // Added school_id from the session
            });

            if (response.data && Array.isArray(response.data)) {
                // Update the attendance data based on the response
                setAttendanceData(response.data);
            } else {
                setAttendanceData([]);
            }
        } catch (error) {
            console.error("Error fetching attendance data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAcademicYears = async () => {
        try {
            const response = await axios.post(baseUrl + "/AcademicYear/", {
                action: "CURRENTREAD",
                school_id: userObj.school_id
            });
            setAcademic(response.data);
        } catch (error) {
            console.log("Error fetching academic name:", error);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await axios.post(baseUrl + "/classes/", {
                action: "READ"
            });
            setClasses(response.data);
        } catch (error) {
            console.log("Error fetching class name:", error);
        }
    };

    useEffect(() => {
        fetchClasses();
        fetchAcademicYears();
    }, []);

    const fetchSections = async (class_id) => {
        try {
            const response = await axios.post(baseUrl + "/Sections/", {
                action: "DROPDOWNREAD",
                class_id: class_id
            });
            setSection(response.data);
        } catch (error) {
            console.log("Error fetching section name:", error);
        }
    };

    useEffect(() => {
        fetchSections(form.class_id || 0);
    }, [form.class_id]);

    const handleInputChange = (event) => {
        const { id, value } = event.target;
        setForm((prevForm) => ({
            ...prevForm,
            [id]: value,
        }));
    };

    const columns = [
        { name: "Admission Number", selector: row => row.admission_number, sortable: true, width: "160px" },
        { name: "Roll Number", selector: row => row.roll_no, sortable: true, width: "160px" },
        {
                  name: "Student Name",
                  selector: (row) => (
                    <Tooltip title={row.student_name}>
                      <span>{row.student_name}</span>
                    </Tooltip>
                  ),
                  sortable: true,
                  width: "140px",
                },
                {
                    name: "Attendance",
                    selector: row => row.is_present,  
                    sortable: true,
                    width: "160px",
                    cell: (row) => (
                        row.is_present === undefined 
                            ? ""  // Empty before submission
                            : row.is_present 
                                ? <span style={{ fontWeight: "bold", color: "green" }}>P</span>  
                                : <span style={{ fontWeight: "bold", color: "red" }}>A</span>
                    )
                },
                
                {
                    name: "Admission Date",
                    selector: row => row.date_of_join ? row.date_of_join.split(" ")[0].split("-").reverse().join("-") : "", 
                    sortable: true,
                    width: "160px"
                }
                
    ];

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredRecords = (attendanceData || []).filter((student) => {
        return ["admission_number", "student_name", "roll_no"].some((column) =>
            student[column] && String(student[column]).toLowerCase().includes(searchQuery.toLowerCase())
        ) || (
            student.date_of_join &&
            student.date_of_join.split(" ")[0].split("-").reverse().join("-").includes(searchQuery)
        );
    });
    

    const exportToExcel = () => {
        if (attendanceData.length === 0) {
            toast.error("No data available to export.");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(attendanceData);
        const columnWidths = attendanceData.length > 0
            ? Object.keys(attendanceData[0]).map(key => {
                const maxLength = Math.max(
                    key.length, 
                    ...attendanceData.map(student => (student[key] ? student[key].toString().length : 0))
                );
                return { wch: maxLength + 2 };
            })
            : [];

        worksheet['!cols'] = columnWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Student Day Wise Attendance Report");
        XLSX.writeFile(workbook, `student_day_wise_attendance_report_${new Date().toISOString()}.xlsx`);
    };

    return (
        
          
            <div className='pageMain'>
                  <ToastContainer />
                <LeftNav />
                <div className='pageRight'>
                    <div className='pageHead'><Header /></div>
                    <div className='pageBody'>
                        <Container fluid>
                            <Card>
                                <Card.Body>
                                    <form onSubmit={handleSubmit}>
                                        <Row>
                                            <Col xs={12}>
                                                <h6 className='commonSectionTitle'>Student Day Wise Attendance Report</h6>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col xs={12} md={6} lg={3} xxl={3}>
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
                                                            <option value="0" disabled hidden>{userObj.academic_year_name}</option>
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

                                            <Col xs={12} md={6} lg={3} xxl={3}>
                                                <div className="commonInput">
                                                    <Form.Group>
                                                        <Form.Label>Attendance Date</Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            id="date_picker"
                                                            value={attendanceDate}
                                                            onChange={(e) => setAttendanceDate(e.target.value)}
                                                            required
                                                        />
                                                    </Form.Group>
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <div className="d-flex justify-content-between mt-4">
                                                    <Button
                                                        type="button"
                                                        variant="primary"
                                                        className="btn-info clearBtn"
                                                        onClick={() => setAttendanceDate("")}
                                                    >
                                                        Reset
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        variant="primary"
                                                        className="btn-success primaryBtn"
                                                    >
                                                        Submit
                                                    </Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </form>
                                </Card.Body>
                            </Card>

                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    className="form-control form-control-sm w-25"
                                    onChange={handleSearchChange}
                                />
                                <div>
                                <Button className='btnMain' variant="success" onClick={exportToExcel} style={{ marginRight: "10px" }}>
                                    <img
                                        src={excelIcon}
                                        alt="Download Excel"
                                        style={{ width: "20px", marginRight: "5px" }}
                                    />
                                </Button>
                                <Button className="btnMain" variant="danger" onClick={exportToPDF}>
    <FaFilePdf style={{ marginRight: "5px" }} /> PDF
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
                                            data={filteredRecords.length > 0 ? filteredRecords : [{ student_name: "No Records Found" }]}
                                            pagination={filteredRecords.length > 0 && filteredRecords[0].student_name !== "No Records Found"}
                                            highlightOnHover
                                            responsive
                                            paginationPerPage={5}
                                            paginationRowsPerPageOptions={[5, 10, 15]}
                                            noDataComponent={<div>No Data Available</div>}
                                            style={{ tableLayout: "fixed", width: "100%" }}
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

export default Studentdaywiseattendancereport;
