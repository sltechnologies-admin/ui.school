import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import DataTable from "react-data-table-component";
import loading from "../../assets/images/common/loading.gif";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { Tooltip } from "@mui/material";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import excelIcon from "../../assets/icons/excel.png"; 
import { FaFilePdf } from "react-icons/fa";

const SiblingsReport = () => {
  const userData = sessionStorage.getItem("user");
  const userObj = JSON.parse(userData || "{}");
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    class_id: "",
    section_id: "",
    student_id: "",
  });
  const [studentData, setStudentData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchClasses = async () => {
    try {
      const res = await axios.post(baseUrl + "/classes/", {
        action: "READ",
        school_id: userObj.school_id,
      });
      setClasses(res.data);
    } catch {
      toast.error("Unable to load classes");
    }
  };

  const fetchSections = async (class_id) => {
    try {
      const response = await axios.post(
        baseUrl + "/getsectionsbyteachersubjectmap/",
        {
          action: "SECTIONREAD",
          school_id: userObj.school_id,
          class_id: class_id,
        }
      );
      setSections(response.data);
    } catch (error) {
      console.error("Error fetching section:", error);
    }
  };

  const fetchStudents = async () => {
    if (!form.class_id || !form.section_id) return;
    try {
      const res = await axios.post(baseUrl + "/students/", {
        action: "FILTER",
        class_id: form.class_id,
        section_id: form.section_id,
        academic_year_id: userObj.academic_year_id,
        school_id: userObj.school_id,
      });
      setStudents(res.data);
    } catch {
      toast.error("Unable to load students");
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchSections(form.class_id);
    setForm((prev) => ({ ...prev, section_id: "", student_id: "" }));
  }, [form.class_id]);

  useEffect(() => {
    fetchStudents(form.class_id, form.section_id);
    setForm((prev) => ({ ...prev, student_id: "" }));
  }, [form.section_id]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.class_id ) {
      toast.info("Please atleast select one class.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        baseUrl + "/studentdetailswithsiblings/",
        {
          class_id: Number(form.class_id),
          section_id: Number(form.section_id),
          student_id: Number(form.student_id),
          school_id: userObj.school_id,
          academic_year_id: userObj.academic_year_id,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = Array.isArray(response.data) ? response.data : [];
       const allNoSiblings = data.every(
      (student) => !student.sibling_array || student.sibling_array.length === 0
    );
    const studentsWithSiblings = data.filter(
      (student) => student.sibling_array && student.sibling_array.length > 0
    );
    if (allNoSiblings) {
      toast.info("There are no siblings for this class.");
      setStudentData([]); // Clear grid data
    } else {
      setStudentData(studentsWithSiblings );
    }
    } catch (error) {
      console.error("Error fetching siblings data:", error);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

 const handleReset = () => {
  setForm({ class_id: "", section_id: "", student_id: "" });
  setSections([]);
  setStudents([]);
  setStudentData([]);
  setSearchQuery("");
};


  const columns = [
     {
    name: "Roll Num",
    selector: (row) => row.roll_no,
    cell: (row) => (
      <Tooltip title={row.roll_no}>
        <span>{row.roll_no}</span>
      </Tooltip>
    ),
    sortable: true,
    width: "140px",
  },
  {
    name: "Student Name",
    selector: (row) => row.student_name,
    cell: (row) => (
      <Tooltip title={row.student_name}>
        <span>{row.student_name}</span>
      </Tooltip>
    ),
    sortable: true,
    width: "280px",
  },
  {
    name: "Class",
    selector: (row) => row.class_name,
    cell: (row) => (
      <Tooltip title={row.class_name}>
        <span>{row.class_name}</span>
      </Tooltip>
    ),
    width: "100px",
    center: true,
  },
  {
    name: "Section",
    selector: (row) => row.section_name,
    cell: (row) => (
      <Tooltip title={row.section_name}>
        <span>{row.section_name}</span>
      </Tooltip>
    ),
    width: "110px",
    center: true,
  },
  {
    name: "Father",
    selector: (row) => row.father_name,
    cell: (row) => (
      <Tooltip title={row.father_name}>
        <span>{row.father_name}</span>
      </Tooltip>
    ),
    width: "220px",
  },
  {
    name: "Mobile",
    selector: (row) => row.father_phone_number,
    cell: (row) => (
      <Tooltip title={row.father_phone_number}>
        <span>{row.father_phone_number}</span>
      </Tooltip>
    ),
    width: "150px",
  },
  {
    name: "Mother",
    selector: (row) => row.mother_name,
    cell: (row) => (
      <Tooltip title={row.mother_name}>
        <span>{row.mother_name}</span>
      </Tooltip>
    ),
    width: "220px",
  },
  {
    name: "Mobile",
    selector: (row) => row.mother_phone_number,
    cell: (row) => (
      <Tooltip title={row.mother_phone_number}>
        <span>{row.mother_phone_number}</span>
      </Tooltip>
    ),
    width: "150px",
  },
  ];

 const ExpandedComponent = ({ data }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      width: "100%",
      paddingLeft: "56px", // align under expand arrow
    }}
  >
    {(data.sibling_array || []).map((sib, idx) => (
      <div
        key={idx}
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "12px",
          padding: "6px 8px",
          fontSize: "14px",
          borderBottom: "1px solid #eee",
        }}
      >
        <div style={{ minWidth: "100px", flex: "1" }}>{sib.roll_no}</div>
        <div style={{ minWidth: "200px", flex: "2" }}>{sib.name}</div>
        <div style={{ minWidth: "100px", flex: "1" }}>{sib.class}</div>
        <div style={{ minWidth: "100px", flex: "1" }}>{sib.section}</div>
      </div>
    ))}
  </div>
);







  const filteredRecords = studentData.filter((row) =>
    ["roll_no", "student_name", "father_name", "mother_name"].some((key) =>
      String(row[key] || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
  );
const exportToExcel = () => {
  if (studentData.length === 0) {
    toast.error("No data available to export.");
    return;
  }

  const exportData = [];

  studentData.forEach((student) => {
    exportData.push({
      Roll_No: student.roll_no,
      Student_Name: student.student_name,
      Class: student.class_name,
      Section: student.section_name,
      Father_Name: student.father_name,
      Father_Mobile: student.father_phone_number,
      Mother_Name: student.mother_name,
      Mother_Mobile: student.mother_phone_number,
      Sibling: "", // for spacing
    });

    (student.sibling_array || []).forEach((sibling) => {
      exportData.push({
        Roll_No: "↳ " + sibling.roll_no,
        Student_Name: sibling.name,
        Class: sibling.class,
        Section: sibling.section,
        Father_Name: "",
        Father_Mobile: "",
        Mother_Name: "",
        Mother_Mobile: "",
        Sibling: "Yes",
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Siblings Report");
  XLSX.writeFile(workbook, `siblings_report_${new Date().toISOString()}.xlsx`);
};
const exportToPDF = () => {
  if (studentData.length === 0) {
    toast.error("No data available to export.");
    return;
  }

  const doc = new jsPDF();
  doc.text("Siblings Report", 14, 10);

  const rows = [];

  studentData.forEach((student) => {
    rows.push([
      student.roll_no,
      student.student_name,
      student.class_name,
      student.section_name,
      student.father_name,
      student.father_phone_number,
      student.mother_name,
      student.mother_phone_number,
      "",
    ]);

    (student.sibling_array || []).forEach((sibling) => {
      rows.push([
        `[S] ${sibling.roll_no}`,
        sibling.name,
        sibling.class,
        sibling.section,
        "",
        "",
        "",
        "",
        "Sibling",
      ]);
    });
  });

  autoTable(doc, {
    head: [[
      "Roll No", "Student Name", "Class", "Section",
      "Father Name", "Father Mobile", "Mother Name", "Mother Mobile", "Type"
    ]],
    body: rows,
    startY: 20,
  });

  doc.save(`siblings_report_${new Date().toISOString()}.pdf`);
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
          <Container fluid>
            <Card>
              <Card.Body>
                <form onSubmit={handleSubmit}>
                  <Row>
                    <Col xs={12}>
                      <h6 className="commonSectionTitle">Siblings Report</h6>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} md={6} lg={4} xxl={3}>
                      <div className="commonInput">
                        <Form.Group>
                          <Form.Label>Class</Form.Label>
                          <select
                            className="form-select"
                            id="class_id"
                            value={form.class_id}
                            onChange={(e) => {
                              const classId = parseInt(e.target.value);
                              setForm((prev) => ({
                                ...prev,
                                class_id: classId,
                                section_id: 0,
                                student_id: "",
                              }));
                              if (classId !== 0) {
                                fetchSections(classId);
                              }
                            }}
                          >
                            <option value="">Select Class</option>
                            {(classes || [])
                              .filter((cls) => cls.is_active === "Active")
                              .map((cls) => (
                                <option key={cls.class_id} value={cls.class_id}>
                                  {cls.class_name}
                                </option>
                              ))}
                          </select>
                        </Form.Group>
                      </div>
                    </Col>
                    <Col xs={12} md={6} lg={4} xxl={3}>
                      <div className="commonInput">
                        <Form.Group>
                          <Form.Label>Section</Form.Label>
                          <select
                            className="form-select"
                            id="section_id"
                            value={form.section_id}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                section_id: parseInt(e.target.value),
                                student_id: "",
                              }))
                            }
                          >
                            <option value="">Select Section</option>
                            {(sections || []).map((s) => (
                              <option key={s.section_id} value={s.section_id}>
                                {s.section_name}
                              </option>
                            ))}
                          </select>
                        </Form.Group>
                      </div>
                    </Col>
                    <Col xs={12} md={6} lg={4} xxl={3}>
                      <div className="commonInput">
                        <Form.Group>
                          <Form.Label>Student</Form.Label>
                          <select
                            className="form-select"
                            id="student_id"
                            value={form.student_id}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Student</option>
                            {(students||[]).map((stu) => (
                              <option
                                key={stu.student_id}
                                value={stu.student_id}
                              >
                                {stu.student_last_name}
                              </option>
                            ))}
                          </select>
                        </Form.Group>
                      </div>
                    </Col>
                    <Col xs={12} md={6} lg={3} xxl={3}>
                      <div
                        className="d-flex justify-content-between mt-4"
                        style={{ width: "150px" }}
                      >
                        <Button
                          type="button"
                          variant="primary"
                          className="btn-info clearBtn"
                          onClick={handleReset}
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
            <div className="d-flex justify-content-end align-items-center mb-2">
  <Button
    className="btnMain"
    variant="success"
    onClick={exportToExcel}
    style={{ marginRight: "10px" }}
  >
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

            <div
              className="commonTable height100 mt-2"
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
              {isLoading ? (
                <div className="text-center">
                  <img src={loading} alt="loading..." />
                </div>
              ) : (
                <DataTable
                  className="custom-table"
                  columns={columns}
                  data={filteredRecords}
                  highlightOnHover
                  responsive
                  paginationPerPage={10}
                  pagination={filteredRecords.length > 0}
                  paginationRowsPerPageOptions={[5, 10, 15]}
                  persistTableHead
                  fixedHeader
                  fixedHeaderScrollHeight="400px"
                  expandableRows
                  expandableRowsComponent={ExpandedComponent}
                  noDataComponent={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "15px",
                        color: "#FF0000",
                      }}
                    >
                      No Records Found
                    </div>
                  }
                />
              )}
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default SiblingsReport;
