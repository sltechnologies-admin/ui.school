import axios from "axios";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";

function AddNewClass() {
  const userData = sessionStorage.getItem('user');
  const userObj = JSON.parse(userData);
  const [category, setCategory] = useState([]);
  const [editId, setEditId] = useState(null);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const routeLocation = useLocation();

  const [form, setForm] = useState({
    class_id: "",
    class_name: "",

    category_id: "",
    sequence_no: "",
    is_active: ""

  })

  useEffect(() => {
    if (routeLocation.state?.userData) {
      const userData = routeLocation.state.userData;
      setForm(userData);
      setEditId(userData.class_id);
    }
  }, [routeLocation]);
  const fetchCategory = async () => {
    try {
      const response = await axios.post(baseUrl + "/category/", {
        action: "READ", school_id: userObj.school_id
      });
      setCategory(response.data);

    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      class_name: form.class_name,
      category_id: form.category_id,
      sequence_no: form.sequence_no,
      is_active: form.is_active || "A",
      school_id: userObj.school_id,
      action: editId !== null ? "UPDATE" : "CREATE",
    };
    if (editId !== null) {
      formData.class_id = editId;
    }
    try {
      const response = await axios.post(baseUrl + "/classes/", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (editId !== null) {
        toast.success("Record Updated Successfully", { position: "top-right" });
        setEditId(null);
      } else {
        toast.success("Record Added Successfully", { position: "top-right" });
      }
      setForm({
        class_name: "",
        category_id: "",
        sequence_no: "",
        is_active: "A",
      });
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          const errorMsg = data.error || "";

          if (errorMsg.includes("Class name already exists")) {
            toast.error("Class name already exists for the specified category.", { position: "top-right" });
          } else if (errorMsg.includes("Sequence no already exists")) {
            toast.error("Sequence number already exists for the class and specified category.", { position: "top-right" });
          } else {
            toast.error("Record already exists.", { position: "top-right" });
          }
        } else if (status === 500) {
          toast.error("Server error: " + (data.error || error.message), { position: "top-right" });
        } else {
          toast.error("Unexpected error occurred", { position: "top-right" });
        }
      } else {
        toast.error("Error submitting data: " + error.message, { position: "top-right" });
      }
    }

  };
  return (
    <div className='pageMain'>
      <ToastContainer />
      <LeftNav></LeftNav>
      <div className='pageRight'>
        <div className='pageHead'>
          <Header></Header>
        </div>
        <div className='pageBody'>
          <Container fluid>
            <div className=''>
              <Card>

                <Card.Body>
                  <form className="" onSubmit={handleSubmit}>
                    <div className=''>
                      <Row>
                        <Col xs={12}>
                          <h6 className='commonSectionTitle'>Class Details</h6>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>
                                Category
                                <span className="requiredStar">*</span>
                              </Form.Label>
                              <Form.Select
                                required
                                className="form-select"
                                id="category_id"
                                value={form.category_id}
                                onChange={(e) => {
                                  const selectedId = parseInt(e.target.value, 10);
                                  setForm({ ...form, category_id: selectedId });
                                }}
                              >
                                <option value="">Select Category</option>
                                {Array.isArray(category) && category.length > 0 ? (
                                  category
                                    .filter((cat) => cat.is_active === "Active") // Filter only active
                                    .map((cat) => (
                                      <option key={cat.category_id} value={cat.category_id}>
                                        {cat.category_name}
                                      </option>
                                    ))
                                ) : (
                                  <option disabled>No categories found</option>
                                )}
                              </Form.Select>
                            </Form.Group>
                          </div>
                        </Col>

                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className='commonInput'>
                            <Form.Group>
                              <Form.Label>Class<span className='requiredStar'>*</span></Form.Label>
                              <Form.Control required type="text" id="class_name" value={form.class_name} maxLength={30} placeholder="Enter Class"
                                onChange={(e) => {
                                  const filteredValue = e.target.value.replace(/[^a-zA-Z0-9 .]/g, "");
                                  setForm({ ...form, class_name: filteredValue });
                                }}
                              />
                              <Form.Control.Feedback>Required</Form.Control.Feedback>
                            </Form.Group>
                          </div>
                        </Col>
                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className='commonInput'>
                            <Form.Group controlId="firstName">
                              <Form.Label>
                                Sequence Number<span className='requiredStar'>*</span>
                              </Form.Label>
                              <Form.Control
                                type="text"
                                id="sequence_no"
                                value={form.sequence_no}
                                placeholder="Enter Sequence Number"
                                maxLength={2}
                                inputMode="numeric"
                                onChange={(e) => {
                                  const filteredValue = e.target.value.replace(/\D/g, '');
                                  setForm({ ...form, sequence_no: filteredValue });
                                }}
                              />
                              <Form.Control.Feedback>Required</Form.Control.Feedback>
                            </Form.Group>
                          </div>
                        </Col>

                      </Row>
                    </div>
                    <div className="d-flex justify-content-between mt-3">
                      <div>
                        <Button type="button" variant="primary" className="btn-info clearBtn"
                          onClick={() => setForm({
                            class_id: "",
                            class_name: "",
                            category_id: "",
                            category_name: "",
                            sequence_no: ""
                          })}
                        >
                          Reset
                        </Button>
                      </div>
                      <div>
                        <Button type="button" variant="primary" className="btn-danger secondaryBtn me-2" onClick={() => window.history.back()}>  Cancel </Button>
                        <Button type="submit" variant="primary" className="btn-success primaryBtn">  Submit </Button>
                      </div>
                    </div>
                  </form>
                </Card.Body>
              </Card>
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
}
export default AddNewClass
