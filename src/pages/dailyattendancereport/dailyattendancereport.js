import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";
import DataTable from 'react-data-table-component';
import loading from "../../assets/images/common/loading.gif";
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import * as XLSX from 'xlsx';
import excelIcon from "../../assets/icons/excel.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa";
import { Tooltip } from "@mui/material";

const DailyAttendanceReport = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [attendanceDate, setAttendanceDate] = useState("");
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!attendanceDate) {
            toast.error("Please select a date.");
            return;
        }

        try {
            const response = await axios.post(baseUrl + "/dailyattendance/", {
                action: "FILTER",
                attendance_date: attendanceDate,
            });

            if (response.data && Array.isArray(response.data)) {
                setAttendanceData(response.data);
            } else {
                setAttendanceData([]);
            }
        } catch (error) {
            console.error("Error fetching attendance data:", error);
        } finally {
            
        }
    };
    const searchableColumns = [
        "class_name",
        "section_name",
        "total_present",
        "total_absent",
        "present_percentage",
        "absent_percentage", 
    ];

    const columns = [
        {
            name: "Class",
            cell: row => (
                <Tooltip title={row.class_name}>
                    <span>{row.class_name}</span>
                </Tooltip>
            ),
            sortable: true,
            width: "160px"
        },
        {
            name: "Section",
            cell: row => (
                <Tooltip title={row.section_name}>
                    <span>{row.section_name}</span>
                </Tooltip>
            ),
            sortable: true,
            width: "160px"
        },
        {
            name: "Total Present",
            cell: row => (
                <Tooltip title={`${row.total_present}`}>
                    <span>{row.total_present}</span>
                </Tooltip>
            ),
            sortable: true,
            width: "160px"
        },
        {
            name: "Total Absent",
            cell: row => (
                <Tooltip title={`${row.total_absent}`}>
                    <span>{row.total_absent}</span>
                </Tooltip>
            ),
            sortable: true,
            width: "160px"
        },
        {
            name: "Present %",
            cell: row => (
                <Tooltip title={`${row.present_percentage}`}>
                    <span>{row.present_percentage}</span>
                </Tooltip>
            ),
            sortable: true,
            width: "160px"
        },
        {
            name: "Absent %",
            cell: row => (
                <Tooltip title={`${row.absent_percentage}`}>
                    <span>{row.absent_percentage}</span>
                </Tooltip>
            ),
            sortable: true,
            width: "160px"
        }
    ];

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };
 
    const filteredRecords = (attendanceData || []).filter((student) => {
        return searchableColumns.some((column) =>
            student[column] && String(student[column]).toLowerCase().includes(searchQuery.toLowerCase())
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
            XLSX.utils.book_append_sheet(workbook, worksheet, "Admission Report");
            XLSX.writeFile(workbook, `student_day_wise_attendance_report_${new Date().toISOString()}.xlsx`);
        };

        const exportToPDF = () => {
            if (filteredRecords.length === 0) {
                toast.error("No data available to export.");
                return;
            }
    
            const doc = new jsPDF();
            doc.text("Daily Attendance Report", 14, 10);
    
            const tableColumn = ["Class", "Section", "Total Present", "Total Absent", "Present %", "Absent %"];
            const tableRows = [];
    
            filteredRecords.forEach((row) => {
                tableRows.push([
                    row.class_name || "",
                    row.section_name || "",
                    row.total_present || "",
                    row.total_absent || "",
                    row.present_percentage || "",
                    row.absent_percentage || ""
                ]);
            });
    
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 20,
            });
    
            doc.save(`daily_attendance_report_${new Date().toISOString()}.pdf`);
        };
       

    return (
      
            <div className='pageMain'>
                 <ToastContainer />
                <LeftNav />
                <div className='pageRight'>
                    <div className='pageHead'><Header /></div>
                    <div className='pageBody'>
                    <div className="commonDataTableHead">
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                                <h6 className="commonTableTitle">Daily Attendance Report</h6>
                            </div></div></div>
                        <Container fluid>
                            <Card>
                                <Card.Body>
                                    <form onSubmit={handleSubmit}>
                                        
                                        <Row>
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
                                                onClick={() => {
                                                    setAttendanceDate("");    
                                                    setAttendanceData([]);            
                                                }}
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
                                                        /><div>
                                                         <Button className='btnMain' variant="success" onClick={exportToExcel} style={{ marginRight: "10px" }}>
                                                             <img 
                                                                 src={excelIcon} 
                                                                 alt="Download Excel" 
                                                                 style={{ width: "20px", marginRight: "5px" }} 
                                                             />
                                                             Excel
                                                         </Button>
                                                         <Button className="btnMain" variant="danger" onClick={exportToPDF}>
                                                             <FaFilePdf style={{ marginRight: "5px" }} /> PDF
                                                         </Button>
                                                        </div>
                                                        
                                                    </div>
                                                    <div className="commonTable height100 mt-2">
                                                        <div className="tableBody">
                                                                 
                                                                    <DataTable
                                                                        className="custom-table"
                                                                        columns={columns}
                                                                        data={filteredRecords.length > 0 ? filteredRecords : [{ total_present: "No Records Found" }]}
                                                                        pagination={filteredRecords.length > 0 && filteredRecords[0].total_present !== "No Records Found"}
                                                                        highlightOnHover
                                                                        responsive
                                                                        paginationPerPage={5}
                                                                        paginationRowsPerPageOptions={[5, 10, 15]}
                                                                        noDataComponent={<div>No Data Available</div>}
                                                                        style={{
                                                                            tableLayout: "fixed",  
                                                                            width: "100%"          
                                                                        }}
                                                                        conditionalRowStyles={[
                                                                            {
                                                                                when: (row) => row.total_present === "No Records Found",
                                                                                style: {
                                                                                    textAlign: "center",
                                                                                    fontSize: "16px",
                                                                                    color: "red",
                                                                                    backgroundColor: "#f9f9f9", 
                                                                                },
                                                                            },
                                                                        ]}
                                                                    />   
                                                                
                                                            </div>
                                                            </div>
                                                    </Container>
                                                </div>
                                            </div>
                                        </div>
      
    );
};

export default DailyAttendanceReport;