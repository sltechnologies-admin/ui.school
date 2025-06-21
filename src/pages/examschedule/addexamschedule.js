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
    const updatedDates = {
      ...examDates,
      [subject_id]: date,
    };

    setExamDates(updatedDates);

    // Filter valid (non-empty) dates and sort them
    const validDates = Object.values(updatedDates).filter(d => d).sort();

    if (validDates.length > 0) {
      const earliest = validDates[0];
      const latest = validDates[validDates.length - 1];

      setForm((prevForm) => ({
        ...prevForm,
        start_date: earliest,
        end_date: latest,
      }));
    } else {
      // Reset start/end if no valid dates
      setForm((prevForm) => ({
        ...prevForm,
        start_date: "",
        end_date: "",
      }));
    }
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

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const dates = {};
      const dateList = [];

      response.data.forEach((item) => {
        dates[item.subject_id] = item.exam_date;
        if (item.exam_date) {
          dateList.push(item.exam_date);
        }
      });

      // Sort and find min/max
      const sortedDates = dateList.sort((a, b) => new Date(a) - new Date(b));
      const startDate = sortedDates[0] || "";
      const endDate = sortedDates[sortedDates.length - 1] || "";

      setExamDates(dates);
      setEditId(response.data[0]?.exam_schedule_id || null);

      // ✅ Update form with calculated start & end dates
      setForm((prevForm) => ({
        ...prevForm,
        start_date: startDate,
        end_date: endDate,
      }));
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
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      toast.warning("End Date cannot be earlier than Start Date");
      return;
    }
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
          min={form.start_date || ""}
          max={form.end_date || ""}
          disabled={!subjects.length}
        />
      ),
      sortable: false,
    }

  ];
  const data = subjects;
  return (
    <Container fluid>
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
                <Card.Body ><div className="">
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
                              Exam<span className="requiredStar">*</span>
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
                              Class
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
                              min={form.start_date || ""}
                            />
                          </Form.Group>
                        </div>
                      </Col>
                    </Row>
                    <div style={{
                      maxHeight: "400px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      backgroundColor: "#fff",
                      padding: "10px",
                      marginLeft: "232px",
                      marginRight: "232px"
                    }}>
                      <DataTable
                        className="custom-table table-height-300px"
                        columns={columns}
                        data={data.length > 0 ? data : [{ subject_name: "No records found", exam_date: "" }]}
                        highlightOnHover
                        responsive
                        fixedHeader
                        fixedHeaderScrollHeight="300px"
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
                    <div className="d-flex justify-content-between mt-3">
                      <div>
                        <Button
                          type="button"
                          className="btn btn-info clearBtn"
                          onClick={() => {
                            setForm({
                              exam_id: "",
                              subject_id: "",
                              class_id: "",
                              academic_year_id: "",
                              exam_date: "",
                              school_id: "",
                              start_date: "",
                              end_date: "",
                            });
                            setSubjects([]);       // 🔹 Clear subjects list
                            setExamDates({});      // 🔹 Clear exam dates
                            setOriginalScheduleData([]);
                            setEditId(null);
                          }}
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
                </div>
                </Card.Body>
              </Card>
            </Container>
          </div>
        </div>
      </div>
    </Container>
  );
}
export default AddExamschedule;
