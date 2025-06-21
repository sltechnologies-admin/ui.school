import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";
import loading from "../../assets/images/common/loading.gif";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import DataTable from "react-data-table-component";
import * as XLSX from 'xlsx';
import excelIcon from "../../assets/icons/excel.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa";
import { MdRemoveRedEye } from 'react-icons/md';

const ClasswiseStudentsReport = () => {
    const userData = sessionStorage.getItem('user');
    const [classes, setClasses] = useState(null);
    const [sections, setSections] = useState(null);
    const [filteredSections, setFilteredSections] = useState([]);
    const [academic, setAcademic] = useState([]);
    const routeLocation = useLocation();
    const userObj = userData ? JSON.parse(userData) : {};
    const [form, setForm] = useState({
        class_id: "",
        section_id: "",
        academic_year_id: userObj.academic_year_id || ""
    });
    const [searchQuery, setSearchQuery] = useState('');
    const searchableColumns = [
        "class_name",
        "section_name",
    ];

    const [studentsData, setStudentsData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    const [showStudentModal, setShowStudentModal] = useState(false);
    const [selectedClassSection, setSelectedClassSection] = useState(null);
    const [studentData, setStudentData] = useState([]);
    const [studentSearchQuery, setStudentSearchQuery] = useState('');

    const handleCloseStudentModal = () => setShowStudentModal(false);
    const handleShowStudentModal = (row) => {
        setSelectedClassSection({
            class_id: row.class_id,
            class_name: row.class_name,
            section_id: row.section_id,
            section_name: row.section_name
        });
        fetchStudentData(row.class_id, row.section_id);
        setShowStudentModal(true);
        setStudentSearchQuery('');
    };

    const fetchStudentData = async (class_id, section_id) => {
        try {
            const response = await axios.get(`${baseUrl}/main/get_students_by_class_section`, {
                params: {
                    p_school_id: userObj.school_id,
                    p_class_id: class_id,
                    p_section_id: section_id,
                    p_academic_year_id: userObj.academic_year_id
                }
            });
            console.log("Raw response:", response.data);
            const formattedData = (Array.isArray(response.data.data) ? response.data.data : []).map(row => ({
                student_id: row.student_id,
                student_name: row.student_name,
                roll_no: row.roll_no,
                admission_number: row.admission_number,
                father_user_id: row.father_user_id,
                mother_user_id: row.mother_user_id,
                father_name: row.father_name,
                father_phone_number: row.father_phone_number,
                mother_name: row.mother_name,
                mother_phone_number: row.mother_phone_number
            }));
            console.log("Formatted data:", formattedData);
            setStudentData(formattedData);
        } catch (error) {
            console.error("Error fetching student data:", error);
            toast.error("Failed to fetch student data.");
            setStudentData([]);
        }
    };


    const columns = [
        { name: 'Class', selector: row => row.class_name, sortable: true },
        { name: 'Section', selector: row => row.section_name, sortable: true },
        { name: 'Students', selector: row => row.students_count, sortable: true },
        {
            name: 'Action',
            cell: row => (
                <Button variant="link" onClick={() => handleShowStudentModal(row)} aria-label={`View students in Class ${row.class_name} Section ${row.section_name}`}>
                    <MdRemoveRedEye size={20} />
                </Button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '80px'
        }
    ];

    // Fetch main data including student counts
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(baseUrl + "/main/get_class_wise_students_count", {
                params: {
                    p_school_id: userObj.school_id,
                    p_academic_year_id: form.academic_year_id
                }
            });
            const data = response.data?.data || [];
            setStudentsData(data); // set directly without filtering
        } catch (err) {
            console.error("Error fetching section data:", err);
            toast.error("Something went wrong while fetching data.");
            setStudentsData([]);
        } finally {
            setIsLoading(false);
        }
    };
    const fetchClasses = async () => {
        try {
            const response = await axios.post(baseUrl + "/classes/", {
                action: "READ",
                school_id: userObj?.school_id || 0,
                academic_year_id: userObj.academic_year_id
            });
            setClasses(response?.data?.filter(c => c.is_active === "Active") || []);
        } catch (error) {
            console.error("Error fetching classes!", error);
            setClasses([]);
        }
    };

    const fetchSections = async (class_id) => {
        try {
            const response = await axios.post(baseUrl + "/Sections/", {
                action: "READ",
                school_id: userObj.school_id,
                class_id,
                academic_year_id: userObj.academic_year_id
            });
            const data = Array.isArray(response.data) ? response.data : [];
            const active = data.filter((item) => item.is_active?.toLowerCase() === "active");
            setSections(active);
            setFilteredSections(active);
        } catch (err) {
            console.error("Error fetching sections", err);
            setSections([]);
            setFilteredSections([]);
        }
    };
    const fetchAcademicYears = async () => {
        try {
            const response = await axios.post(baseUrl + "/AcademicYear/", {
                action: "CURRENTREAD",
                school_id: userObj?.school_id || 0,
            });
            setAcademic(response?.data || []);
        } catch (error) {
            console.error("Error fetching academic years!", error);
            setAcademic([]);
        }
    };

    useEffect(() => {
        fetchAcademicYears();
        fetchClasses();
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { id, value } = e.target;

        setForm(prevForm => ({
            ...prevForm,
            [id]: value,
            ...(id === "class_id" && { section_id: "" }) // reset section if class changes
        }));

        if (id === "class_id") {
            fetchSections(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await fetchData();
        } finally {
            setIsLoading(false);
        }
    };

    const exportToExcel = () => {
        const exportData = studentsData.map(row => ({
            Class: row.class_name,
            Section: row.section_name,
            Students: row.students_count,
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Class-students-Report");
        XLSX.writeFile(wb, "class_students_report.xlsx");
    };

    const exportToPDF = () => {
        if (!studentsData.length) {
            toast.error("No data available to export.");
            return;
        }
        const doc = new jsPDF();
        doc.text("Classwise Students Report", 14, 10);
        const tableColumn = ["Class", "Section", "Students"];
        const tableRows = studentsData.map(row => [
            row.class_name || "-",
            row.section_name || "-",
            row.students_count || "-"
        ]);
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [0, 123, 255] },
        });
        doc.save(`classwise_students_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    const studentColumns = [
        { name: 'Student Name', selector: row => row.student_name, sortable: true },
        { name: 'Roll No', selector: row => row.roll_no, sortable: true },
        { name: 'Admission Number', selector: row => row.admission_number, sortable: true },
        { name: 'Father Name', selector: row => row.father_name, sortable: true },
        { name: 'Father Phone', selector: row => row.father_phone_number, sortable: true },
        { name: 'Mother Name', selector: row => row.mother_name, sortable: true },
        { name: 'Mother Phone', selector: row => row.mother_phone_number, sortable: true },
    ];

    const filteredStudentData = studentData.filter(row =>
        Object.values(row).some(val =>
            String(val).toLowerCase().includes(studentSearchQuery.toLowerCase())
        )
    );
    const tdStyle = {
        border: '1px solid #dee2e6',
        padding: '8px',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        maxWidth: '200px',
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
                            <Card.Body>
                                <form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col xs={12}>
                                            <h6 className='commonSectionTitle'>Classwise Students Report</h6>
                                        </Col>
                                    </Row>

                                    <Row className="align-items-end"> {/* Align button vertically with select */}
                                        <Col xs={12} md={6} lg={4} xxl={4}>
                                            <div className='commonInput'>
                                                <Form.Group>
                                                    <Form.Label>Academic Year <span className="requiredStar">*</span></Form.Label>
                                                    <Form.Select
                                                        required
                                                        id="academic_year_id"
                                                        value={form.academic_year_id}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="0" disabled hidden>{userObj.academic_year_name}</option>
                                                        {(academic || []).map(aca => (
                                                            <option key={aca.academic_year_id} value={aca.academic_year_id}>{aca.academic_year_name}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </div>
                                        </Col>
                                        {/* <Col xs="auto" className="d-flex justify-content-end">
                                            <Button
                                                type="submit"
                                                variant="success"
                                                className="btn btn-success primaryBtn"
                                                style={{ height: '36px' ,marginBottom:'18px'}} // adjust height to match select
                                            >
                                                Search
                                            </Button>
                                        </Col> */}
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
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            <div>
                                <Button className="btnMain" variant="success" onClick={exportToExcel} style={{ marginRight: "10px" }}>
                                    <img
                                        src={excelIcon}
                                        alt="Download Excel"
                                        style={{ width: "20px" }}
                                    />
                                </Button>
                                <Button className="btnMain" variant="danger" onClick={exportToPDF}>
                                    <FaFilePdf style={{ marginRight: "5px" }} />
                                </Button>
                            </div>
                        </div>
                        <div className="commonTable height100 mt-2">
                            <div className="tableBody">
                                <div style={{ width: '100%', overflowX: 'auto' }}>
                                    <DataTable
                                        className="custom-table"
                                        columns={columns}
                                        data={
                                            studentsData.length > 0
                                                ? studentsData
                                                : [{ class_name: "", section_name: "No Records Found", students_count: "" }]
                                        }
                                        highlightOnHover
                                        responsive
                                        pagination
                                        paginationPerPage={5} // ✅ Show 5 rows per page
                                        paginationRowsPerPageOptions={[5]} // ✅ Only allow 5 rows per page
                                        fixedHeader
                                        fixedHeaderScrollHeight="60vh"
                                        style={{
                                            tableLayout: "fixed",
                                            width: "100%",
                                        }}
                                        conditionalRowStyles={[
                                            {
                                                when: (row) => row.section_name === "No Records Found",
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
                        </div>
                    </Container>
                </div>
            </div>

            <Modal
                show={showStudentModal}
                onHide={handleCloseStudentModal}
                size="xl"
                centered
                dialogClassName=""
                style={{ maxWidth: '100%' }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Students in Class {selectedClassSection?.class_name || ""} - Section {selectedClassSection?.section_name || ""}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', gap: '10px' }}>
                        <Form.Control
                            type="text"
                            placeholder="Search students..."
                            value={studentSearchQuery}
                            onChange={e => setStudentSearchQuery(e.target.value)}
                            style={{
                                width: '250px',
                                marginBottom: 0,
                                padding: '6px 10px',
                                fontSize: '14px'
                            }}
                        />
                        <Button
                            variant="success"
                            onClick={() => {
                                const exportData = filteredStudentData.map(student => ({
                                    'Admission Number': student.admission_number,
                                    'Roll No': student.roll_no,
                                    'Student Name': student.student_name,
                                    'Father Name': student.father_name,
                                    'Father Phone': student.father_phone_number,
                                    'Mother Name': student.mother_name,
                                    'Mother Phone': student.mother_phone_number
                                }));
                                const ws = XLSX.utils.json_to_sheet(exportData);
                                const wb = XLSX.utils.book_new();
                                XLSX.utils.book_append_sheet(wb, ws, "Students");
                                XLSX.writeFile(wb, `students_${selectedClassSection?.class_name}_${selectedClassSection?.section_name}.xlsx`);
                            }}
                            style={{ padding: '5px 10px', fontSize: '13px' }}
                            className="btnMain"
                        >
                            <img src={excelIcon} alt="Download Excel" style={{ width: '20px' }} />
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => {
                                const doc = new jsPDF();
                                doc.text(`Students - Class ${selectedClassSection?.class_name} Section ${selectedClassSection?.section_name}`, 14, 10);
                                const tableColumn = ['Admission Number', 'Roll No', 'Student Name', 'Father Name', 'Father Phone', 'Mother Name', 'Mother Phone'];
                                const tableRows = filteredStudentData.map(student => [
                                    student.admission_number,
                                    student.roll_no,
                                    student.student_name,
                                    student.father_name,
                                    student.father_phone_number,
                                    student.mother_name,
                                    student.mother_phone_number
                                ]);
                                autoTable(doc, {
                                    head: [tableColumn],
                                    body: tableRows,
                                    startY: 20,
                                    styles: { fontSize: 8 },
                                });
                                doc.save(`students_${selectedClassSection?.class_name}_${selectedClassSection?.section_name}.pdf`);
                            }}
                            style={{ padding: '5px 10px', fontSize: '13px' }}
                            className="btnMain"
                        >
                            <FaFilePdf style={{ marginRight: '0' }} />
                        </Button>
                    </div>
                    {filteredStudentData.length === 0 ? (
                        <div>No Students Found</div>
                    ) : (
                        <div
                            style={{
                                maxHeight: '400px',
                                overflowY: 'auto',
                                border: '1px solid #dee2e6',
                            }}
                        >
                            <table
                                style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                }}
                            >
                                <thead>
                                    <tr>
                                        {[
                                            'Admission Number',
                                            'Roll No',
                                            'Student Name',
                                            'Father Name',
                                            'Father Phone',
                                            'Mother Name',
                                            'Mother Phone',
                                        ].map((header, idx) => (
                                            <th
                                                key={idx}
                                                style={{
                                                    position: 'sticky',
                                                    top: 0,
                                                    backgroundColor: '#f8f9fa',
                                                    zIndex: 1,
                                                    border: '1px solid #dee2e6',
                                                    padding: '8px',
                                                    textAlign: 'left',
                                                }}
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudentData.map((student) => (
                                        <tr key={student.student_id}>
                                            <td style={tdStyle}>{student.admission_number}</td>
                                            <td style={tdStyle}>{student.roll_no}</td>
                                            <td style={tdStyle}>{student.student_name}</td>
                                            <td style={tdStyle}>{student.father_name}</td>
                                            <td style={tdStyle}>{student.father_phone_number}</td>
                                            <td style={tdStyle}>{student.mother_name}</td>
                                            <td style={tdStyle}>{student.mother_phone_number}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseStudentModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
export default ClasswiseStudentsReport;

