import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { fetchDataRead } from "../../Utility";

function AddGroupMembers() {
  const routeLocation = useLocation();
  const [editId, setEditId] = useState(null);
  const userData = sessionStorage.getItem("user");
  const [groups, setGroups] = useState([]);
  const [userRecords, setUserRecords] = useState([]);
  const userObj = userData ? JSON.parse(userData) : {};
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const [form, setForm] = useState({
    group_id: "",
    user_id: "",
    school_id: userObj.school_id || "",
  });
  useEffect(() => {
    fetchDataRead("/creategroup", setGroups, userObj.school_id);
    fetchDataRead("/Users/", setUserRecords, userObj.school_id);
  }, []);

  useEffect(() => {
    if (routeLocation.state?.userData) {
      const userData = routeLocation.state.userData;
      setForm({
        group_id: userData.group_id || 0,
        user_id: userData.user_id || 0, 
        school_id: userObj.school_id,
      });
      setEditId(userData.group_member_id);
      window.history.replaceState({}, document.title);
    }
  }, [routeLocation]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      group_id: form.group_id,
      user_id: form.user_id,
      school_id: userObj.school_id,
      action: editId !== null ? "UPDATE" : "CREATE",
    };

    if (editId !== null) {
      formData.group_member_id = editId;
    }
    try {
      await axios.post(`${baseUrl}/addnotificationgroupmembers/`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success(editId !== null ? "Record updated successfully" : "Record added successfully");
      setEditId(null);
      setForm({ group_id: "", user_id: "", school_id: userObj.school_id });
    } catch (error) {
      const errorMsg =
        error.response?.status === 400
          ? "Group already exists"
          : error.response?.status === 500
            ? "Error in submitting data"
            : "Unexpected error occurred";
      toast.error(errorMsg);
    }
  };
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
                <Card.Body>
                  <form onSubmit={handleSubmit}>
                    <Row>
                      <Col xs={12}>
                        <h6 className="commonSectionTitle">Add Group Members</h6>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className="commonInput">
                          <Form.Group controlId="group_id">
                            <Form.Label>
                              Group <span className="requiredStar">*</span>
                            </Form.Label>
                            <Form.Select required id="group_id" value={form.group_id} onChange={handleInputChange}>
                              <option value="">Select Group</option>
                              {groups.map((group) => (
                                <option key={group.group_id} value={group.group_id}>
                                  {group.group_name}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className="commonInput">
                          <Form.Group controlId="user_id">
                            <Form.Label>
                              User <span className="requiredStar">*</span>
                            </Form.Label>
                            <Form.Select required id="user_id" value={form.user_id} onChange={handleInputChange}>
                              <option value="">Select User</option>
                              {userRecords.map((user) => (
                                <option key={user.userid} value={user.userid}>
                                  {`${user.surname} ${user.firstname}`}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </Col>
                    </Row>
                    <div className="d-flex justify-content-between mt-3">
                      <div>
                        <Button type="button" className='btn btn-info clearBtn' onClick={() => setForm({ group_id: "", user_id: "", school_id: userObj.school_id })}>  Reset</Button>     
                      </div>
                      <div className="">
                        <Button type="button" variant="primary" className='btn-danger secondaryBtn' onClick={() => window.history.back()}> Cancel</Button>
                        <Button type="submit" className='btn btn-success primaryBtn'>Submit</Button> 
                      </div>
                    </div>
                  </form>
                </Card.Body>
              </Card>
            </Container>
          </div>
        </div>
      </div>
    </Container>
  );
}
export default AddGroupMembers;
