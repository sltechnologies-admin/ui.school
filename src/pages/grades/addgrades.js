import axios from "axios";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";

function AddGrades() {
  const userData = sessionStorage.getItem("user");
  const userObj = JSON.parse(userData);
  const [editId, setEditId] = useState(null);
  const [boards, setBoards] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const routeLocation = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    grade_id: "",
    grade_name: "",
    min_marks: "",
    max_marks: "",
    grade_points: "",
    passing_marks: "",
    board_id: "",
    subject_id: "",
  });

  useEffect(() => {
    // Fetch boards and subjects (example API calls)
    const fetchBoards = async () => {
      try {
          const response = await axios.post(baseUrl + "/board/", {
              action: "READ",
          });
          setBoards(response.data);
      } catch (error) {
          console.error("Error fetching Board:", error);
      }
  };

  const fetchSubjects = async () => {
    try {
        const response = await axios.post(baseUrl + "/subjectmaster/", {
            action: "READ",
        });
        setSubjects(response.data);
    } catch (error) {
        console.error("Error fetching subjects:", error);
    }
};

    fetchBoards();
    fetchSubjects();

    // Check if the component is in editing mode
    if (routeLocation.state?.userData) {
      const userData = routeLocation.state.userData;
      console.log(userData);
      setForm(userData);
      setEditId(userData.grade_id);
    }
  }, [routeLocation.state]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: id === "grade_name" ? value.toUpperCase() : value,
    }));
  };

  const handleBoardChange = (e) => {
    const { value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      board_id: value,
    }));
};

const handleSubjectChange = (e) => {
    const { value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      subject_id: value,
    }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      grade_name: form.grade_name || "",
      min_marks: form.min_marks || "",
      max_marks: form.max_marks || "",
      grade_points: form.grade_points || "",
      passing_marks: form.passing_marks || "",
      board_id: form.board_id || 0,
      subject_id: form.subject_id || 0,
      school_id: userObj.school_id,
      action: editId !== null ? "UPDATE" : "CREATE",
    };

    if (editId !== null) {
      formData.grade_id = editId;
    }

    try {
      const response = await axios.post(`${baseUrl}/grades/`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (editId !== null) {
        toast.success("Record updated successfully", { position: "top-right" });
        setEditId(null);  // Reset the editId after successful update
      } else {
        toast.success("Record added successfully", { position: "top-right" });
      }

      // Reset the form after submission
      setForm({
        grade_name: "",
        min_marks: "",
        max_marks: "",
        grade_points: "",
        passing_marks: "",
        board_id: "",
        subject_id: "",
      });
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          toast.error("Grade name already exists.", { position: "top-right" });
        } else if (status === 401) {
          toast.error("Marks overlap with an existing grade.", { position: "top-right" });
        } else if (status === 500) {
          toast.error("Error submitting data: " + (data.error || error.message), { position: "top-right" });
        } else {
          toast.error("Unexpected error occurred", { position: "top-right" });
        }
      } else {
        toast.error("Error submitting data: " + error.message, { position: "top-right" });
      }
    }
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
                        <h6 className="commonSectionTitle">Grade Details</h6>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className="commonInput">
                          <Form.Group>
                            <Form.Label>
                              Curriculum
                              <span className="requiredStar">*</span>
                            </Form.Label>
                            <Form.Select
                              required
                              className="form-select"
                              id="board_id"
                              value={form.board_id}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Board</option>
                              {boards.map((board) => (
                                <option
                                  key={board.board_id}
                                  value={board.board_id}
                                >
                                  {board.board_name}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className="commonInput">
                          <Form.Group>
                            <Form.Label>Grade Name <span className="requiredStar">*</span></Form.Label>
                            <Form.Control
                              required
                              type="text"
                              id="grade_name"
                              value={form.grade_name || ""}
                              placeholder="Enter Grade Name"
                              maxLength={30}
                              onChange={handleInputChange}
                            
                            />
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className="commonInput">
                          <Form.Group>
                            <Form.Label>Minimum Marks <span className="requiredStar">*</span></Form.Label>
                            <Form.Control
                              required
                              type="text"
                              id="min_marks"
                              value={form.min_marks || ""}
                              placeholder="Enter Minimum Marks"
                              maxLength={10}
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className="commonInput">
                          <Form.Group>
                            <Form.Label>Maximum Marks <span className="requiredStar">*</span></Form.Label>
                            <Form.Control
                              required
                              type="text"
                              id="max_marks"
                              value={form.max_marks || ""}
                              placeholder="Enter Maximum Marks"
                              maxLength={10}
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className="commonInput">
                          <Form.Group>
                            <Form.Label>Grade Points <span className="requiredStar">*</span></Form.Label>
                            <Form.Control
                              required
                              type="text"
                              id="grade_points"
                              value={form.grade_points || ""}
                              placeholder="Enter Grade Points"
                              maxLength={10}
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className="commonInput">
                          <Form.Group>
                            <Form.Label>Passing Marks <span className="requiredStar">*</span></Form.Label>
                            <Form.Control
                              required
                              type="text"
                              id="passing_marks"
                              value={form.passing_marks || ""}
                              placeholder="Enter Passing Marks"
                              maxLength={10}
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className="commonInput">
                          <Form.Group>
                            <Form.Label>Subject</Form.Label>
                            <Form.Select
                              required
                              value={form.subject_id || ""}
                              onChange={handleSubjectChange}
                            >
                              <option value="">Select Subject</option>
                              {subjects.map((subject) => (
                                <option key={subject.subject_id} value={subject.subject_id}>
                                  {subject.subject_name}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </Col>
                    </Row>
                    <div className="d-flex justify-content-between mt-3">
                      <Button
                        type="button"
                        variant="primary"
                        className="btn-info clearBtn"
                        onClick={() =>
                          setForm({
                            grade_name: "",
                            min_marks: "",
                            max_marks: "",
                            grade_points: "",
                            passing_marks: "",
                            board_id: "",
                            subject_id: "",
                          })
                        }
                      >
                        Reset
                      </Button>
                      <div>
                        <Button
                          type="button"
                          variant="primary"
                          className="btn-danger secondaryBtn me-2"
                          onClick={() => navigate(-1)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          className="btn-success primaryBtn"
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

export default AddGrades;
