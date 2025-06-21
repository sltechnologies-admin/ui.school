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

const SchoolStrength = () => {
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
    academic_year_id: ""
  });
  const [strengthData, setStrengthData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;


  const columns = [
    { name: 'Class', selector: row => row.class_name },
    { name: 'Section', selector: row => row.section_name },
    { name: 'Boys', selector: row => row.total_boys },
    { name: 'Girls', selector: row => row.total_girls },
    { name: 'Teachers', selector: row => row.total_teachers },
    {
      name: 'Boys:Girls Ratio',
      selector: row => {
        if (row.total_girls !== "No Records Found") {
          const boys = row.total_boys || 0;
          const girls = row.total_girls || 0;

          if (girls === 0) {
            return `${boys}:0`;
          }

          const gcdValue = gcd(boys, girls);
          const simplifiedBoys = boys / gcdValue;
          const simplifiedGirls = girls / gcdValue;

          return `${simplifiedBoys}:${simplifiedGirls}`;
        }
        return "";
      },
      sortable: true
    },
    {
      name: 'Teacher:Student Ratio',
      selector: row => {
        if (row.total_girls !== "No Records Found") {
          const boys = Number(row.total_boys) || 0;
          const girls = Number(row.total_girls) || 0;
          const totalStudents = boys + girls;
          const teachers = Number(row.total_teachers) || 0;

          return totalStudents === 0 ? `${teachers}:` : `${teachers}:${totalStudents}`;
        }
        return '';
      },
      sortable: true
    }
  ];
  const exportToPDF = () => {
  if (strengthData.length === 0) {
    toast.error("No data available to export.");
    return;
  }

  const doc = new jsPDF();
  doc.text("School Strength Report", 14, 10);

  const tableColumn = [
    "Class",
    "Section",
    "Boys",
    "Girls",
    "Teachers",
    "Boys:Girls Ratio",
    "Teacher:Student Ratio",
  ];
  const tableRows = [];

  strengthData.forEach((row) => {
    const boys = row.total_boys || 0;
    const girls = row.total_girls || 0;
    const teachers = row.total_teachers || 0;
    const totalStudents = boys + girls;

    const boysGirlsRatio =
      girls === 0 ? `${boys}:0` : `${boys / gcd(boys, girls)}:${girls / gcd(boys, girls)}`;
    const teacherStudentRatio =
      totalStudents === 0 ? `${teachers}:` : `${teachers}:${totalStudents}`;

    tableRows.push([
      row.class_name || "",
      row.section_name || "",
      boys,
      girls,
      teachers,
      boysGirlsRatio,
      teacherStudentRatio,
    ]);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
  });

  doc.save(`school_strength_report_${new Date().toISOString()}.pdf`);
};

  const fetchStrengthData = async () => {
    if (!userObj.academic_year_id || !form.class_id || !form.section_id) return;
    setIsLoading(true);
    try {
      const response = await axios.post(baseUrl + "/strength/", {
        action: "FILTER",
        school_id: userObj.school_id,
        academic_year_id: userObj.academic_year_id,
        class_id: form.class_id,
        section_id: form.section_id
      });
      setStrengthData(response.data || []);
    } catch (error) {
      console.log("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchClasses = async () => {
    try {
      const response = await axios.post(baseUrl + "/classes/", {
        action: "READ",
        school_id: userObj?.school_id || 0,
      });
      setClasses(response?.data?.filter(classItem => classItem.is_active === "Active") || []);
    } catch (error) {
      console.error("Error fetching classes!", error);
    }
  };
  const fetchSections = async (class_id) => {
    try {
      const response = await axios.post(baseUrl + "/Sections/", {
        action: "DROPDOWNREAD",
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

  useEffect(() => {
    fetchAcademicYears();
    fetchClasses();
  }, []);
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value
    }));

    if (id === "class_id") {
      fetchSections(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetchStrengthData();
    } finally {
      setIsSubmitted(true);
      setIsLoading(false);
    }
  };
  const gcd = (a, b) => {
    return b !== 0 ? a : gcd(b, a % b);
  };

  const exportToExcel = () => {
    const updatedStrengthData = strengthData.map(row => {
      const boys = row.total_boys || 0;
      const girls = row.total_girls || 0;
      const teachers = row.total_teachers || 0;
      const totalStudents = boys + girls;

      return {
        Class: row.class_name,
        Section: row.section_name,
        Boys: boys,
        Girls: girls,
        Teachers: teachers,
        "Boys:Girls Ratio": boys && girls ? `${boys}:${girls}` : "",
        "Teacher:Student Ratio": totalStudents > 0 ? `${teachers}:${totalStudents}` : `${teachers}:0`
      };
    });

    const updatedColumns = columns.map(col => col.name);
    const exportData = updatedStrengthData.map(row => {
      const exportRow = {};
      updatedColumns.forEach(col => {
        if (col === 'Boys:Girls Ratio') {
          exportRow[col] = row["Boys:Girls Ratio"];
        } else if (col === 'Teacher:Student Ratio') {
          exportRow[col] = row["Teacher:Student Ratio"];
        } else {
          exportRow[col] = row[col] || '';
        }
      });
      return exportRow;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Strength Data");
    XLSX.writeFile(wb, "school_strength_report.xlsx");
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
                      <h6 className='commonSectionTitle'>School Strength</h6>
                    </Col>
                  </Row>
                  <Row>
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
                              .filter((section) => section.is_active === "Active")
                              .map((section) => (
                                <option
                                  key={section.section_id}
                                  value={section.section_id}
                                >
                                  {section.section_name}
                                </option>
                              ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </Col>
                    <Col xs={6} md={3} lg={2} xxl={2}>
                    <div className="d-flex justify-content-between mt-4" style={{width : '150px'}}>         
                      <Button
                        type="button"
                        variant="primary"
                        className="btn-info clearBtn"
                        onClick={() => {
                          setForm({
                            class_id: "",
                            section_id: "",
                            academic_year_id: ""
                          });
                          setStrengthData([]);
                          setIsSubmitted(false);
                        }}
                      >
                        Reset
                      </Button>
                  
                      <Button
                        type="submit"
                        variant="success"
                        className="btn btn-success primaryBtn"
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

              <div>
                <Button className='btnMain' variant="success" onClick={exportToExcel} style={{ marginRight: "10px",marginLeft: "1100px"  }}>
                  <img
                    src={excelIcon}
                    alt="Download Excel"
                    style={{ width: "20px", }}
                  />
                </Button>
                 <Button className="btnMain" variant="danger" onClick={exportToPDF}title="Export to PDF">
    <FaFilePdf style={{ width: "20px" }} />
  </Button>
              </div>
            </div>
            <div className="commonTable height100 mt-2">
              <div className="tableBody">
                <DataTable
                  className="custom-table"
                  columns={columns}
                  data={strengthData.length > 0 ? strengthData : [{ total_girls: "No Records Found" }]}
                  highlightOnHover
                  responsive
                  noDataComponent={<div>No Data Available</div>}
                  style={{
                    tableLayout: "fixed",
                    width: "100%"
                  }}
                  conditionalRowStyles={[
                    {
                      when: (row) => row.total_girls === "No Records Found",
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
export default SchoolStrength;
