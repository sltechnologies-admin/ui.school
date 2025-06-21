import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { ToastContainer, toast } from 'react-toastify';
//Components
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import axios from "axios";
import FeesScheduleStudent from './FeesScheduleStudent';
import { useFeeModuleAccess } from "../hooks/useFeeModuleAccess";

const Addfeesstudentsschedule = () => {
  const userData = sessionStorage.getItem('user');
  const userObj = JSON.parse(userData);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const routeLocation = useLocation();
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([]);
  const [academics, setAcademic] = useState([]);

  const [form, setForm] = useState({
    fees_item_id: "",
    class_id: "",
    class_names: "",
    fees_item: "",
    school_id: userObj.school_id || 0,
    school_name: "",
    status: "A",
    academic_year_id: userObj.academic_year_id || 0,
    student_id: ""
  });

  const currentUserRole = userObj.role_name?.trim();
  const { canWrite } = useFeeModuleAccess(currentUserRole);

  useEffect(() => {
    document.title = "SCHOLAS";
    if (routeLocation.state?.discountsData) {
      const discountsData = routeLocation.state.discountsData;
      setForm(discountsData);
      window.history.replaceState({}, document.title);
    }
  }, [routeLocation]);

  const params = {
    p_academic_year_id: userObj.academic_year_id || 0,
    p_class_id: form.class_id,
    p_school_id: userObj.school_id || 0,
    p_student_id: form.student_id
  };

  useEffect(() => {
    fetchAcademics();
    fetchClasses();
    fetchStudents();
  }, []);

  const fetchAcademics = async () => {
    try {
      const response = await axios.post(baseUrl + "/AcademicYear/", {
        action: "READ",
        school_id: userObj.school_id
      });
      setAcademic(response.data);
    } catch (error) {
      console.error("Error fetching academics:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.post(baseUrl + "/classes/", {
        action: "READ",
        school_id: userObj.school_id
      });

      const filterData = Array.isArray(response.data) ? response.data : [];

      const filteredClasses = filterData.filter(
        item => item.is_active?.toLowerCase() === 'active'
      );
      setClasses(filteredClasses)
    }
    catch (error) {
      console.error("Error fetching academic data:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.post(baseUrl + "/students/", {
        action: "READ",
        school_id: userObj.school_id
      });
      const filterData = Array.isArray(response.data) ? response.data : [];

      const filteredStudents = filterData.filter(
        item => item.status?.toLowerCase() === 'active'
      );
      setStudents(filteredStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value
    }));
  };

  const childRef = useRef(null);

  const handleSaveAll = async (event) => {
    event.preventDefault();

    if (childRef.current) {
      const isSuccess = await childRef.current.handleFetchData();
      if (isSuccess) {
        setForm({
          class_id: "",
          student_id: ""
        });
      }
      // else {
      //   toast.error("Failed to save data.");
      // }
    }
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
                <form>
                  <Row>
                    <Col xs={12}>
                      <h6 className='commonSectionTitle'>Fees Discount Details</h6>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} md={6} lg={4} xxl={3}>
                      <div className='commonInput'>
                        <Form.Group>
                          <Form.Label>Academic Year</Form.Label>
                          <select
                            disabled
                            className="form-select"
                            id="academic_year_id"
                            value={form.academic_year_id}
                            onChange={handleInputChange}
                          >
                            <option value="0">Select Academic Year</option>
                            {(academics || []).map((academic) => (
                              <option key={academic.academic_year_id} value={academic.academic_year_id}>
                                {academic.academic_year_name}
                              </option>
                            ))}
                          </select>
                        </Form.Group>
                      </div>
                    </Col>
                    <Col xs={12} md={6} lg={4} xxl={3}>
                      <div className='commonInput'>
                        <Form.Group controlId="combined_name">
                          <Form.Label>Class Name<span className='requiredStar'>*</span></Form.Label>
                          <Form.Select
                            required
                            id="class_id"
                            value={form.class_id}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Class Name</option>
                            {(classes || []).map((dept) => (
                              <option key={dept.class_id} value={dept.class_id}>{dept.class_name}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </Col>
                    <Col xs={12} md={6} lg={4} xxl={3}>
                      <div className='commonInput'>
                        <Form.Group controlId="student_name">
                          <Form.Label>Student  Name<span className='requiredStar'>*</span></Form.Label>
                          <Form.Select
                            required
                            id="student_id"
                            value={form.student_id}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Student  Name</option>
                            {(students || []).map((dept) => (
                              <option key={dept.student_id} value={dept.student_id}>{dept.student_first_name + " " + dept.student_last_name}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <FeesScheduleStudent ref={childRef} {...params} />
                  </Row>
                  <div className="d-flex justify-content-between mt-3">
                    <div>
                      <Button
                        type="button"
                        variant="primary"
                        className="btn-info clearBtn"
                        onClick={() => setForm({
                          fees_item_id: "",
                          class_id: "",
                          class_names: "",
                          student_id: "",
                          student_first_name: "",
                          student_last_name: "",
                        })}
                      >
                        Reset
                      </Button>
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="primary"
                        className="btn-danger secondaryBtn me-2"
                        onClick={() => window.history.back()}
                      >
                        Cancel
                      </Button>
                      {canWrite && (
                        <Button
                          type="submit"
                          variant="primary"
                          className="btn-success primaryBtn"
                          onClick={handleSaveAll}
                        >
                          Submit
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </Card.Body>
            </Card>
          </Container>
        </div>
      </div>
    </div>
  )
}

export default Addfeesstudentsschedule