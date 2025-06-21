import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { fetchDataRead } from "../../Utility";
import DataTable from "react-data-table-component";


function AddExamschedule() {
  const routeLocation = useLocation();
  const [editId, setEditId] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [academic, setAcademic] = useState([]);
  const [examDates, setExamDates] = useState({});
  const userData = sessionStorage.getItem("user");
  const userObj = userData ? JSON.parse(userData) : {};
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const [originalScheduleData, setOriginalScheduleData] = useState([]);
  const [form, setForm] = useState({
    exam_id: "",
    subject_id: 0,
    class_id: 0,
    exam_date: "",
    academic_year_id: 0,
    school_id: 0,
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchDataRead("/classes", setClasses, userObj.school_id);
    fetchDataRead("/exammaster", setExams, userObj.school_id);
    fetchDataRead(
      "/AcademicYear",
      (data) => {
        setAcademic(data);
        if (data?.length > 0) {
          setForm((prevForm) => ({
            ...prevForm,
            academic_year_id: data[0]?.academic_year_id,
          }));
        }
      },
      userObj.school_id
    );
  }, []);

  useEffect(() => {
    if (routeLocation.state?.userData) {
      const userData = routeLocation.state.userData;
      const valuesArray = Object.values(userData);

      if (valuesArray.length > 0) {
        const firstItem = valuesArray[0];
        setForm((prevForm) => ({
          ...prevForm,
          exam_id: firstItem.exam_id,
          class_id: firstItem.class_id,
          academic_year_id: firstItem.academic_year_id,
          start_date: firstItem.start_date,
          end_date: firstItem.end_date,
        }));

        setEditId(firstItem.exam_schedule_id);
        const initialExamDates = {};
        valuesArray.forEach((detail) => {
          if (detail.subject_id && detail.start_date) {
            initialExamDates[detail.subject_id] = detail.start_date;
          }
        });

        setOriginalScheduleData(valuesArray);
        setExamDates(initialExamDates);
        fetchSubjects(firstItem.class_id, firstItem.academic_year_id, firstItem.exam_id);
      }
    } else {
      console.warn("No userData found in location state");
    }
  }, [routeLocation]);
  ;

  const fetchSubjects = async (class_id, academic_year_id, exam_id) => {
    try {
      const response = await axios.post(`${baseUrl}/getexamschedule`, {
        action: "GET",
        school_id: userObj.school_id,
        class_id: class_id,
        exam_id: exam_id,
        academic_year_id: userObj.academic_year_id,
      });
      console.log(response.data);
      
      if (response.data && Array.isArray(response.data)) {   
        setSubjects(response.data);
      } else {
        setSubjects([]);
        toast.warning("No subjects found for this class");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));

    if (id === "class_id") {
      fetchSubjects(value, form.academic_year_id, form.exam_id);
      setExamDates({});
    }
  };

  const handleDateChange = (subject_id, date) => {
    setExamDates((prevDates) => ({
      ...prevDates,
      [subject_id]: date,
    }));
  };

  useEffect(() => {
    if (form.exam_id && form.class_id && form.academic_year_id) {
      fetchExistingSchedule(form.exam_id, form.class_id, form.academic_year_id);
    }
  }, [form.exam_id, form.class_id, form.academic_year_id]);

  const fetchExistingSchedule = async (exam_id, class_id, academic_year_id) => {
    try {
      const response = await axios.post(`${baseUrl}/examschedule/`, {
        exam_id,
        class_id,
        academic_year_id: userObj.academic_year_id,
        school_id: userObj.school_id,
        action: "FILTER",
      });

      if (response.data && Array.isArray(response.data)) {
        const dates = {};
        response.data.forEach((item) => {
          dates[item.subject_id] = item.exam_date;
        });

        setExamDates(dates);
        setEditId(response.data[0]?.exam_schedule_id || null);

      } else {
        setExamDates({});
        setEditId(null);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast.error("Failed to load exam schedule");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const examData = subjects
      .map((subject) => {
        const matched = originalScheduleData.find(
          (item) => String(item.subject_id) === String(subject.subject_id)
        );
        const examDate = examDates[subject.subject_id];
        if (examDate) {
          return {
            exam_schedule_id: matched ? matched.exam_schedule_id : 0,
            exam_id: form.exam_id,
            subject_id: subject.subject_id,
            class_id: form.class_id,
            exam_date: examDate,
            academic_year_id: userObj.academic_year_id,
            school_id: userObj.school_id,
            is_active: "",
            start_date: form.start_date,
            end_date: form.end_date,
            action: matched ? "UPDATE" : "CREATE",
          };
        }
        return null;
      })
      .filter((item) => item !== null);

    if (examData.length === 0) {
      toast.warning("Please provide exam dates for at least one subject.");
      return;
    }

    try {
      await axios.post(`${baseUrl}/examschedule/bulk/`, examData, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success(
        editId !== null
          ? "Record updated successfully"
          : "Record added successfully"
      );

      setEditId(null);
      setOriginalScheduleData([]);
      setForm({
        exam_id: "",
        subject_id: 0,
        class_id: 0,
        academic_year_id: 0,
        exam_date: "",
        school_id: 0,
        start_date: "",
        end_date: "",
      });
      setExamDates({});
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 409) {
          toast.error("Record already exists.", { position: "top-right" });
        }
        else if (status === 500) {
          toast.error("Error submitting data: " + (data.error || error.message), { position: "top-right" });
        } else {
          toast.error("Unexpected error occurred", { position: "top-right" });
        }
      } else {
        console.error("There was an error submitting:", error);
        toast.error("Error submitting data: " + error.message, { position: "top-right" });
      }
    }
  };

  const isTableVisible = form.exam_id && form.class_id && subjects.length > 0;

  const columns = [
    {
      name: "Subject Name",
      selector: (row) => row.subject_name,
      sortable: true,
    },
    {
      name: "Exam Date",
      cell: (row) => (
        <Form.Control
          type="date"
          value={examDates[row.subject_id] || ""}
          onChange={(e) => handleDateChange(row.subject_id, e.target.value)}
        />
      ),
      sortable: false,
    },
  ];
  const data = subjects;
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
                        <h6 className="commonSectionTitle">Exam Schedule Details</h6>
                      </Col>
                    </Row>
                    <Row className="d-flex align-items-center">
                      <Col xs={12} md={2} className="mb-3">
                        <div className="commonInput">
                          <Form.Group>
                            <Form.Label>
                              Academic Year
                              <span className="requiredStar">*</span>
                            </Form.Label>
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
                      <Col xs={12} md={2} className="mb-3">
                        <div className="commonInput">
                          <Form.Group>
                            <Form.Label>
                              Exam Name<span className="requiredStar">*</span>
                            </Form.Label>
                            <Form.Select
                              required
                              id="exam_id"
                              value={form.exam_id || ""}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Exam</option>
                              {exams
                                .filter((exam) => exam.is_active === "Active")
                                .map((exam) => (
                                  <option key={exam.exam_id} value={exam.exam_id}>
                                    {exam.exam_name}
                                  </option>
                                ))}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={2} className="mb-3">
                        <div className="commonInput">
                          <Form.Group>
                            <Form.Label>
                              Select Class
                              <span className="requiredStar">*</span>
                            </Form.Label>
                            <Form.Select
                              id="class_id"
                              value={form.class_id || ""}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Class</option>
                              {classes
                                .filter((classItem) => classItem.is_active === "Active")
                                .map((classItem) => (
                                  <option key={classItem.class_id} value={classItem.class_id}>
                                    {classItem.class_name}
                                  </option>
                                ))}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={2} className="mb-3">
                        <div className="commonInput">
                          <Form.Group>
                            <Form.Label>
                              Start Date <span className="requiredStar">*</span>
                            </Form.Label>
                            <Form.Control
                              required
                              type="date"
                              id="start_date"
                              value={form.start_date || ""}
                              placeholder="Select Start Date"
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={2} className="mb-3">
                        <div className="commonInput">
                          <Form.Group>
                            <Form.Label>
                              End Date <span className="requiredStar">*</span>
                            </Form.Label>
                            <Form.Control
                              required
                              type="date"
                              id="end_date"
                              value={form.end_date || ""}
                              placeholder="Select End Date"
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                      </Col>
                    </Row>
                    {isTableVisible && (
                      <Row>
                        <Col md={2}></Col>
                        <Col md={8}>
                          <div style={{
                            maxHeight: "500px",
                            overflowY: "auto",
                            overflowX: "auto",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                          }}>
                            <DataTable
                              className="custom-table"
                              columns={columns}
                              data={data.length > 0 ? data : [{ subject_name: "No records found", exam_date: "" }]}
                              pagination
                              paginationPerPage={5}
                              paginationRowsPerPageOptions={[5, 10, 15]}
                              highlightOnHover
                              responsive
                              fixedHeader
                              fixedHeaderScrollHeight="calc(100vh - 170px)"
                              noDataComponent="No subjects found"
                              conditionalRowStyles={[
                                {
                                  when: (row) => row.subject_name === "No records found",
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
                        </Col>
                        <Col md={2}></Col>
                      </Row>
                    )}

                    <div className="d-flex justify-content-between mt-3">
                      <div>
                        <Button
                          type="button"
                          className="btn btn-info clearBtn"
                          onClick={() =>
                            setForm({
                              exam_id: "",
                              subject_id: "",
                              class_id: "",
                              academic_year_id: "",
                              exam_date: "",
                              school_id: "",
                              start_date: "",
                              end_date: "",
                            })
                          }
                        >
                          Reset
                        </Button>
                      </div>
                      <div>
                        <Button
                          type="button"
                          variant="primary"
                          className="btn-danger secondaryBtn"
                          onClick={() => window.history.back()}
                        >
                          Cancel
                        </Button>
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
            </Container>
          </div>
        </div>
      </div>
   
  );
}

export default AddExamschedule;
