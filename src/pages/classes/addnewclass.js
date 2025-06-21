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
  const [editId, setEditId] = useState(null);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const routeLocation = useLocation();

  const [form, setForm] = useState({
    class_id: "",
    class_name: "",
    is_active: ""
 
  })

useEffect(() => {
  if (routeLocation.state?.userData) { 
    const userData = routeLocation.state.userData;
    setForm(userData);
    setEditId(userData.class_id);
  }
}, [routeLocation]); 
 

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
        class_name: form.class_name,
        is_active: form.is_active || "A",
        school_id:userObj.school_id, 
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
          is_active: "A",
      });
    } catch (error) {
        if (error.response) {
            const { status, data } = error.response;
            if (status === 400 && data.error === "Class name already exists.") {
                toast.error("Class name already exists.", { position: "top-right" });
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
                            <div className='commonInput'>
                              <Form.Group>
                                <Form.Label>Class<span className='requiredStar'>*</span></Form.Label>
                                <Form.Control  required type="text" id="class_name" value={form.class_name} maxLength={30} placeholder="Enter Class"
                                  onChange={(e) => {
                                    const filteredValue = e.target.value.replace(/[^a-zA-Z0-9 .]/g, ""); 
                                    setForm({ ...form, class_name: filteredValue });
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
                          <Button type="button"  variant="primary" className="btn-info clearBtn"
                            onClick={() => setForm({
                              class_id: "",
                              class_name: "",
                            })}
                          >
                            Reset
                          </Button>
                        </div>
                        <div>
                          <Button type="button"  variant="primary"   className="btn-danger secondaryBtn me-2" onClick={() => window.history.back()}>  Cancel </Button>
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
