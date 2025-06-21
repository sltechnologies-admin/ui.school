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
import * as XLSX from 'xlsx';  // Import xlsx for Excel export
import excelIcon from "../../assets/icons/excel.png";
const SchoolStrength = () => {
  const userData = sessionStorage.getItem('user');
  const [editId, setEditId] = useState(null);
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

  // Columns for DataTable
  const columns = [
    { name: 'Class', selector: row => row.class_name },
    { name: 'Section', selector: row => row.section_name },
    { name: 'Boys', selector: row => row.total_boys },
    { name: 'Girls', selector: row => row.total_girls },
    { name: 'Teachers', selector: row => row.total_teachers },
    { 
      name: 'Boys:Girls Ratio', 
      selector: row => {
        const boys = row.total_boys || 0;
        const girls = row.total_girls || 0;

        if (girls === 0) {
          return `${boys}:0`;
        }

        const gcdValue = gcd(boys, girls);
        const simplifiedBoys = boys / gcdValue;
        const simplifiedGirls = girls / gcdValue;

        return `${simplifiedBoys}:${simplifiedGirls}`;
      },
      sortable: true
    },
    { 
      name: 'Teacher:Student Ratio', 
      selector: row => {
        const boys = row.total_boys || 0;
        const girls = row.total_girls || 0;
        const totalStudents = boys + girls;
        const teachers = row.total_teachers || 0;
        return totalStudents === 0 ? `${teachers}:N/A` : `${teachers}:${totalStudents}`;
      },
      sortable: true
    }
  ];

  // Fetch strength data from API
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
      // console.log('Strength Data:', response.data);  // Check the structure of the data
      setStrengthData(response.data || []);
    } catch (error) {
      console.log("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch classes from API
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

  // Fetch sections for a particular class from API
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
  // Fetch academic years from API
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

  useEffect(() => {
    if (isSubmitted) {
      fetchStrengthData();
    }
  }, [form.academic_year_id, form.class_id, form.section_id, isSubmitted]);

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
    setIsSubmitted(true);
  };

  // GCD function to simplify the ratio
  const gcd = (a, b) => {
    return b === 0 ? a : gcd(b, a % b);
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
        "Boys:Girls Ratio": boys && girls ? `${boys}:${girls}` : "0:0",
        "Teacher:Student Ratio": totalStudents > 0 ? `${teachers}:${totalStudents}` : `${teachers}:N/A`
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
                              Select Class
                              <span className="requiredStar">*</span>
                            </Form.Label>
                            <Form.Select
                              id="class_id"
                              value={form.class_id}
                              onChange={handleInputChange}
                              required
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
                              Select Section
                              <span className="requiredStar">*</span>
                            </Form.Label>
                            <Form.Select
                              id="section_id"
                              value={form.section_id || ""}
                              onChange={handleInputChange}
                              required
                              disabled={!form.class_id}
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
                    </Row>
                    <div className="d-flex justify-content-between mt-3">
                      <div>
                        <Button
                          type="button"
                          variant="primary"
                          className="btn-info clearBtn"
                          onClick={() => setForm({
                            class_id: "",
                            section_id: "",
                            academic_year_id: ""
                          })}
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
                          Submit
                        </Button>
                      </div>
                    </div>
                  </form>
                </Card.Body>
              </Card>

              {/* Table for displaying strength data */}
              {isSubmitted && (
                <div className="commonTable height100" style={{ marginTop: "20px" }}>
                  {isLoading ? (
                    <div className="loadingContainer">
                      <img src={loading} alt="Loading..." className="loadingGif" />
                    </div>
                  ) : (strengthData.length > 0) ? (
                    <>
                      <div className="d-flex justify-content-end mb-3">
                      <Button className='btnMain' variant="success" onClick={exportToExcel}>
    <img
        src={excelIcon}
        alt="Download Excel"
        style={{ width: "20px", marginRight: "5px" }}
    />
   
</Button>
                      </div>
                      <DataTable
                        className="custom-table"
                        columns={columns}
                        data={strengthData}
                        pagination
                        highlightOnHover
                        responsive
                        fixedHeader
                        fixedHeaderScrollHeight="calc(100vh - 170px)"
                      />
                    </>
                  ) : (
                    <div className="noDataMessage">No records found</div>
                  )}
                </div>
              )}
            </Container>
          </div>
        </div>
      </div>
    
  );
};

export default SchoolStrength;
