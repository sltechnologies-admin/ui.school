import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
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

const ClasswiseTeacherSubjectReport = () => {
  const userData = sessionStorage.getItem('user');
  const [classes, setClasses] = useState(null);
  const [sections, setSections] = useState(null);
  const [subjects, setSubjects] = useState(null);
  const [teachers, setTeachers] = useState(null);
  const [filteredSections, setFilteredSections] = useState([]);
  const [academic, setAcademic] = useState([]);
  const routeLocation = useLocation();
  const userObj = userData ? JSON.parse(userData) : {};
  const [form, setForm] = useState({
    class_id: "",
    section_id: "",
    academic_year_id: userObj.academic_year_id || "",
    subject_id: "",
    teacher_id: ""
  });

  const [searchQuery, setSearchQuery] = useState('');
  const searchableColumns = [
    "class_name",
    "section_name",
    "class_teacher_name",
    "academic_coordinator_name",
    "subject_teacher_name"
  ];


  const [teacherData, setTeacherData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const columns = [
    { name: 'Class', selector: row => row.class_name, sortable: true },
    { name: 'Section', selector: row => row.section_name, sortable: true },
    { name: 'Class Teacher', selector: row => row.class_teacher_name || "-", sortable: true },
    { name: 'Coordinator', selector: row => row.academic_coordinator_name || "-", sortable: true },
    { name: 'Subject', selector: row => row.subject_name || "-", sortable: true },
    { name: 'Subject Teacher', selector: row => row.subject_teacher_name || "-", sortable: true }
  ];
  const getSubjectNameById = (id) => {
    const subject = subjects?.find((sub) => sub.subject_id == id);
    return subject?.subject_name || "";
  };

  const getTeacherNameById = (id) => {
    const teacher = teachers?.find((t) => t.teacher_id == id);
    return teacher?.user_name || "";
  };


  const fetchData = async (ignoreFilters = false) => {
    setIsLoading(true);
    try {
      const params = {
        p_school_id: userObj.school_id,
        academic_year_id: form.academic_year_id
      };

      // Optional filters
      if (!ignoreFilters && form.class_id) {
        params.class_id = parseInt(form.class_id, 10);
      }
      if (!ignoreFilters && form.section_id) {
        params.section_id = parseInt(form.section_id, 10);
      }
      if (!ignoreFilters && form.subject_id) {
        params.subject_id = parseInt(form.subject_id, 10);
      }
      if (!ignoreFilters && form.teacher_id) {
        params.teacher_id = parseInt(form.teacher_id, 10);
      }

      const response = await axios.get(baseUrl + "/main/get_class_wise_teachers_report", {
        params: params
      });

      const data = response.data?.data || [];
      const active = data;
      console.log("API data:", data);
      console.log("Selected teacher ID:", form.teacher_id);
      const filtered = ignoreFilters
        ? active
        : active.filter(item =>
          (!form.class_id || item.class_id == form.class_id) &&
          (!form.section_id || item.section_id == form.section_id) &&
          (!form.subject_id || item.subject_name === getSubjectNameById(form.subject_id)) &&
          (!form.teacher_id || item.subject_teacher_name === getTeacherNameById(form.teacher_id))
        );
      setTeacherData(filtered);
    } catch (err) {
      console.error("Error fetching section data:", err);
      toast.error("Something went wrong while fetching data.");
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
      setClasses(response?.data?.filter(classItem => classItem.is_active === "Active") || []);
    } catch (error) {
      console.error("Error fetching classes!", error);
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
    }
  };
  const fetchSubjects = async () => {
    try {
      const response = await axios.post(baseUrl + "/subjectmaster/", {
        action: "READ",
        school_id: userObj?.school_id || 0,
        academic_year_id: userObj.academic_year_id
      });
      setSubjects(response?.data?.filter(subjectItem => subjectItem.is_active === "Active") || []);
    } catch (error) {
      console.error("Error fetching subjects!", error);
    }
  };
  const fetchTeachers = async () => {
    try {
      const response = await axios.post(baseUrl + "/teacherssubjectsmap/", {
        action: "READ",
        school_id: userObj?.school_id || 0,
        academic_year_id: userObj.academic_year_id
      });
      setTeachers(response?.data?.filter(teacherItem => teacherItem.is_active === "Active") || []);
    } catch (error) {
      console.error("Error fetching teachers!", error);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
    fetchClasses();
    fetchData(true); // Fetch all data initially, ignoring filter
    fetchSubjects();
    fetchTeachers();
  }, []);
  const handleInputChange = (e) => {
    const { id, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
      ...(id === "class_id" && { section_id: "" }) // Reset section_id when class_id changes
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
      setIsSubmitted(true);
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    const exportData = teacherData.map(row => ({
      Class: row.class_name,
      Section: row.section_name,
      "Class Teacher": row.class_teacher_name || "N/A",
      "Coordinator": row.academic_coordinator_name || "N/A",
      "Subject Teacher": row.subject_teacher_name || "N/A"
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Class-Teacher-Report");
    XLSX.writeFile(wb, "class_teacher_report.xlsx");
  };
  const exportToPDF = () => {
    if (
      teacherData.length === 0 ||
      (teacherData.length === 1 && teacherData[0].class_teacher_name === "No Records Found")
    ) {
      toast.error("No data available to export.");
      return;
    }

    const doc = new jsPDF();
    doc.text("Classwise Teachers Report", 14, 10);

    const tableColumn = ["Class", "Section", "Class Teacher", "Coordinator", "Subject Teacher"];
    const tableRows = teacherData.map(row => [
      row.class_name || "-",
      row.section_name || "-",
      row.class_teacher_name || "-",
      row.academic_coordinator_name || "-",
      row.subject_teacher_name || "-"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 123, 255] },
    });

    doc.save(`classwise_teachers_report_${new Date().toISOString().slice(0, 10)}.pdf`);
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
                      <h6 className='commonSectionTitle'>Classwise Teachers Report</h6>
                    </Col>
                  </Row>
                  <Row>
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
                            {(academic || []).map((aca) => (
                              <option key={aca.academic_year_id} value={aca.academic_year_id}>{aca.academic_year_name}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </Col>
                    <Col xs={12} md={6} lg={4} xxl={4}>
                      <div className="commonInput">
                        <Form.Group>
                          <Form.Label>
                            Class
                          </Form.Label>
                          <Form.Select
                            id="class_id"
                            value={form.class_id}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Class</option>
                            {(classes || [])
                              .filter((classItem) => classItem.is_active === "Active")
                              .map((classItem) => (
                                <option
                                  key={classItem.class_id}
                                  value={classItem.class_id}
                                >
                                  {classItem.class_name}
                                </option>
                              ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </Col>
                    <Col xs={12} md={6} lg={4} xxl={4}>
                      <div className="commonInput">
                        <Form.Group>
                          <Form.Label>
                            Section
                          </Form.Label>
                          <Form.Select
                            id="section_id"
                            value={form.section_id || ""}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Section</option>
                            {(filteredSections || [])
                              .filter(
                                (section) =>
                                  section.is_active === "Active" &&
                                  section.class_id === parseInt(form.class_id)
                              )
                              .map((section) => (
                                <option key={section.section_id} value={section.section_id}>
                                  {section.section_name}
                                </option>
                              ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </Col>
                    <Col xs={12} md={6} lg={4} xxl={4}>
                      <div className="commonInput">
                        <Form.Group>
                          <Form.Label>Subject</Form.Label>
                          <Form.Select
                            id="subject_id"
                            value={form.subject_id}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Subject</option>
                            {(subjects || []).map((subject) => (
                              <option key={subject.subject_id} value={subject.subject_id}>
                                {subject.subject_name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </Col>
                    <Col xs={12} md={6} lg={4} xxl={4}>
                      <div className="commonInput">
                        <Form.Group>
                          <Form.Label>Teacher</Form.Label>
                          <Form.Select
                            id="teacher_id"
                            value={form.teacher_id}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Teacher</option>
                            {(teachers || []).map((teacher) => (
                              <option key={teacher.teacher_id} value={teacher.teacher_id}>
                                {teacher.user_name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-end mt-4">
                    <div>
                      <Button
                        type="button"
                        variant="primary"
                        className="btn-info clearBtn me-3"
                        onClick={() => {
                          setForm({
                            class_id: "",
                            section_id: "",
                            academic_year_id: userObj.academic_year_id,
                            subject_id: "",
                            user_name: ""

                          });
                          setIsSubmitted(false);
                          fetchData(true); // ignore filters and show all data
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                    <div className="text-right">
                      <Button
                        type="submit"
                        variant="success"
                        className="btn btn-success primaryBtn"
                      >
                        Search
                      </Button>
                    </div>
                  </div>
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
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {/* Export buttons on the right */}
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
                <DataTable
                  className="custom-table"
                  columns={columns}
                  data={
                    teacherData.length > 0
                      ? teacherData.filter(row =>
                        searchableColumns.some(col =>
                          (row[col] || "").toString().toLowerCase().includes(searchQuery.toLowerCase())
                        )
                      )
                      : [{ class_teacher_name: "No Records Found" }]
                  }

                  highlightOnHover
                  responsive
                  noDataComponent={<div>No Data Available</div>}
                  pagination
                  paginationPerPage={5}
                  paginationRowsPerPageOptions={[5, 10, 15]}

                  fixedHeaderScrollHeight="calc(100vh - 220px)"
                  style={{
                    tableLayout: "fixed",
                    width: "100%"
                  }}
                  conditionalRowStyles={[
                    {
                      when: (row) => row.class_teacher_name === "No Records Found",
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
export default ClasswiseTeacherSubjectReport;
