import React, { useState,useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";
import DataTable from 'react-data-table-component';
import loading from "../../assets/images/common/loading.gif";
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import { Tooltip } from "@mui/material";

const Assignlanguages = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [classes, setClasses] = useState([]);
    const [academic, setAcademic] = useState([]);
    const [sections, setSections] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [attendanceDate, setAttendanceDate] = useState("");
     const [students, setStudents] = useState([]);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
        const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};

    const [filter, setFilter] = useState({
            class_id: 0,
            section_id: 0,
            academic_year_id: 0,
            school_id: userObj.school_id,
            action: "READ",
        });

           const fetchClasses = async () => {
                try {
                    const response = await axios.post(baseUrl + "/classes/", {
                        action: "READ",
                        school_id: userObj.school_id
                    });
                    setClasses(response.data);
                } catch (error) {
                    console.log("Error fetching class name :", error);
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
                    setSections(response.data);
                } catch (error) {
                    console.log("Error fetching section name:", error);
                }
            };
        
            useEffect(() => {
                fetchSections(filter.class_id || 0);
            }, [filter.class_id]);
        
            const fetchAcademicYears = async () => {
                try {
                    const response = await axios.post(baseUrl + "/AcademicYear/", {
                        action: "READ",
                        school_id: userObj.school_id
                    });
                    setAcademic(response.data);
                } catch (error) {
                    console.log("Error fetching academic name:", error);
                }
            };
    

    const columns = [
        {
            name: "Student Name",
            cell: row => (
                <Tooltip title={row.class_name}>
                    <span>{row.class_name}</span>
                </Tooltip>
            ),
            sortable: true,
            width: "160px"
        },
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
                <Tooltip title={row.class_name}>
                    <span>{row.class_name}</span>
                </Tooltip>
            ),
            sortable: true,
            width: "160px"
        },

        {
            name: "First language",
            cell: row => (
                <Tooltip title={row.section_name}>
                    <span>{row.section_name}</span>
                </Tooltip>
            ),
            sortable: true,
            width: "160px"
        },
        {
            name: " Second Language",
            cell: row => (
                <Tooltip title={`${row.total_present}`}>
                    <span>{row.total_present}</span>
                </Tooltip>
            ),
            sortable: true,
            width: "160px"
        },
        {
            name: "Third Language",
            cell: row => (
                <Tooltip title={`${row.total_absent}`}>
                    <span>{row.total_absent}</span>
                </Tooltip>
            ),
            sortable: true,
            width: "160px"
        },

    ];

    const handleFilterSubmit = async (e) => {
            e.preventDefault();
            
            // Clear previous data
            setStudents([]);
            
            // Validate each field individually
            if (!filter.academic_year_id || filter.academic_year_id === "0") {
                toast.error("Please select Academic Year");
                return;
            }
            
            if (!filter.class_id || filter.class_id === "0") {
                toast.error("Please select Class");
                return;
            }
            
            if (!filter.section_id || filter.section_id === "0") {
                toast.error("Please select Section");
                return;
            }
        
            try {
                const response = await axios.post(baseUrl + "/notpromoted/", filter);
                setStudents(response.data || []);
            } catch (error) {
                toast.error("Error fetching student data");
                console.error(error);
            }
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
                                <h6 className="commonTableTitle">Assigning Languages</h6>
                            </div></div></div>
                        <Container fluid>
                            <Card>
                                <Card.Body>
                                    <form  onSubmit={handleFilterSubmit}>
                                        
                                        <Row>
                                        {/* <Col xs={12} md={6} lg={3} xxl={3}>
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
                                        </Col> */}
                                         <Col xs={12} md={6} lg={3} xxl={4}>
                                                                                         <div className='commonInput'>
                                                                                             <Form.Group>
                                                                                                 <Form.Label>Academic Year<span className='requiredStar'></span></Form.Label>
                                                                                                 <select
                                                                                                     className="form-select"
                                                                                                     id="academic_year_id"
                                                                                                     required
                                                                                                     value={filter.academic_year_id}
                                                                                                     onChange={(e) => setFilter({ ...filter, academic_year_id: e.target.value })}
                                                                                                 >
                                                                                                     <option value="0">Select Academic Year</option>
                                                                                                     {(academic || []).map((academic) => (
                                                                                                         <option key={academic.academic_year_id} value={academic.academic_year_id}>
                                                                                                             {academic.academic_year_name}
                                                                                                         </option>
                                                                                                     ))}
                                                                                                 </select>
                                                                                             </Form.Group>
                                                                                         </div>
                                                                                     </Col>
                                                                                    <Col xs={12} md={6} lg={4} xxl={4}>
                                                                                        <div className='commonInput'>
                                                                                            <Form.Group>
                                                                                                <Form.Label> Class </Form.Label>
                                                                                                <select
                                                                                                    type="number"
                                                                                                    className="form-select"
                                                                                                    id="class_id"
                                                                                                    required
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
                                                                                    <Col xs={12} md={6} lg={4} xxl={4}>
                                                                                        <div className='commonInput'>
                                                                                            <Form.Group>
                                                                                                <Form.Label>Section</Form.Label>
                                                                                                <select
                                                                                                    className="form-select"
                                                                                                    id="section_id"
                                                                                                    required
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
                          
                                                    <div className="commonTable height100 mt-2">
                                                        <div className="tableBody">
                                                                 
                                                                    <DataTable
                                                                        className="custom-table"
                                                                        columns={columns}
                                                                        data={students.length > 0 ? students : [{ total_present: "No Records Found" }]}
                                                                        pagination={students.length > 0 && students[0].total_present !== "No Records Found"}
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

export default Assignlanguages;