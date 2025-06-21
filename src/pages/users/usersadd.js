import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import { Row, Col, Card, Button, Form } from "react-bootstrap";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { fetchDataRead } from "../../Utility";

function UsersAdd() {
  const [editId, setEditId] = useState(null);
  const routeLocation = useLocation();
  const [states, setStates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [countrys, setCountrys] = useState([]);
  const userData = sessionStorage.getItem('user');
  const userObj = userData ? JSON.parse(userData) : {};
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const [form, setForm] = useState({
    userid: "",
    username: "",
    password: "",
    firstname: "",
    surname: "",
    address: "",
    city: "",
    state: "",
    country: "",
    phonenumber: "",
    email: "",
    doj: "",
    dor: "",
    lastlogindate: "",
    status: 'A',
    roleid: "",
    deptid: "",
    createdby: "",
    lastmodifiedby: "",
    school_id: 0
  })
  useEffect(() => {
    fetchDataRead("/country", setCountrys, userObj.school_id);
    fetchDataRead("/states", setStates, userObj.school_id);
    fetchDataRead("/role", setRoles, userObj.school_id)
    fetchDataRead("/department", setDepartments, userObj.school_id)
  }, []);
  useEffect(() => {
    if (routeLocation.state?.userData) {
      const userData = routeLocation.state.userData;

      setForm(userData);
      setEditId(userData.userid);
      window.history.replaceState({}, document.title);
    }
  }, [routeLocation]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value
    }));
  };
  const generatePassword = () => {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*!";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const password = editId !== null ? form.password : generatePassword();
    const formData = {
      username: form.username,
      password,
      firstname: form.firstname,
      surname: form.surname,
      address: form.address,
      city: form.city,
      state: form.state,
      country: form.country,
      phonenumber: form.phonenumber,
      email: form.email,
      doj: form.doj,
      dor: form.dor,
      lastlogindate: form.lastlogindate,
      status: "A",
      roleid: form.roleid,
      deptid: form.deptid,
      createdby: form.createdby,
      lastmodifiedby: form.lastmodifiedby,
      school_id: userObj.school_id,
      action: editId !== null ? 'UPDATE' : 'CREATE'
    };

    if (editId !== null) {
      formData.userid = editId;
    }
    try {
      const response = await axios.post(baseUrl + "/Users/", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success(editId !== null ? "Record Updated Successfully" : "Record Added Successfully");
      setEditId(null);
      setTimeout(() => {
        setForm({
          username: "",
          firstname: "",
          surname: "",
          address: "",
          city: "",
          state: "",
          country: "",
          phonenumber: "",
          email: "",
          doj: "",
          dor: "",
          lastlogindate: "",
          status: "A",
          roleid: "",
          deptid: "",
          createdby: "",
          lastmodifiedby: "",
          school_id: ""
        });
      }, 0);

      if (editId === null) {
        axios.post(baseUrl + "/send-email", {
          email: form.email,
          password: password
        }).then(() => {
          toast.success("Email sent with login details");
        }).catch(() => {
          toast.error("Failed to send email");
        });
      }

    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          toast.error("Email already exists");
          return;
        } else if (status === 500) {
          toast.error("Error in submitting data");
        } else {
          toast.error("Unexpected error occurred");
        }
      } else {
        toast.error("Error in submitting data ");
      }
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
          <div className='height100 innerPage'>
            <Card className="">
              <Card.Body>
                <form className="" onSubmit={handleSubmit}>
                  <div className='innerPageBody'>
                    <Row>
                      <Col xs={12}>
                        <h6 className='commonSectionTitle'>User Details</h6>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className='commonInput'>
                          <Form.Group>
                            <Form.Label>First Name <span className='requiredStar'>*</span></Form.Label>
                            <Form.Control required 
                              type="text" id="firstname" value={form.firstname} placeholder="First Name" maxLength={30}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (/^[A-Za-z\s]*$/.test(value)) {
                                  handleInputChange(e);
                                }
                              }}
                            />
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className='commonInput'>
                          <Form.Group>
                            <Form.Label> Surname <span className='requiredStar'>*</span></Form.Label>
                            <Form.Control  required id="surname"  value={form.surname}  placeholder="Surname"  maxLength={30}  onChange={(e) => {
                                const value = e.target.value;
                                if (/^[A-Za-z\s]*$/.test(value)) {
                                  handleInputChange(e);
                                }
                              }}
                            />
                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className='commonInput'>
                          <Form.Group>
                            <Form.Label>Phone Number <span className='requiredStar'>*</span></Form.Label>
                            <Form.Control required type="text" id="phonenumber" value={form.phonenumber} placeholder="Phone Number"
                              maxLength={10} onChange={(e) => {   const value = e.target.value;   if (/^\d*$/.test(value)) {
                                  handleInputChange(e);
                                }
                              }}isInvalid={form.phonenumber.length > 10}
                            />
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className='commonInput'>
                          <Form.Group>
                            <Form.Label>Email <span className='requiredStar'>*</span></Form.Label>
                            <Form.Control required
                              type="email" id="email" value={form.email} maxLength={150} placeholder="Enter Email" onChange={handleInputChange}
                            />
                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className='commonInput'>
                          <Form.Group>
                            <Form.Label>City <span className='requiredStar'>*</span></Form.Label>
                            <Form.Control
                              required
                              type="text" id="city" value={form.city} maxLength={30} placeholder="Enter City"
                              onChange={(e) => {
                                const value = e.target.value;
                                if (/^[A-Za-z\s]*$/.test(value)) {
                                  handleInputChange(e);
                                }
                              }}
                            />
                            <Form.Control.Feedback>City</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className='commonInput'>
                          <Form.Group>
                            <Form.Label>
                              <Form.Label>State<span className='requiredStar'>*</span></Form.Label>
                            </Form.Label>
                            <Form.Select required className="form-select" id="state" value={form.state} onChange={handleInputChange}>
                              <option value="">Select State</option>
                              {(states || []).map((state) => (
                                <option key={state.state_id} value={state.state_id}> {state.state_name}  </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className='commonInput'>
                          <Form.Group>
                            <Form.Label>
                              <Form.Label>Country<span className='requiredStar'>*</span></Form.Label>
                            </Form.Label>

                            <Form.Select
                              required id="country" value={form.country} onChange={handleInputChange}
                            >
                              <option value="">Select Country</option>
                              {(countrys || []).map((country) => (
                                <option key={country.country_id} value={country.country_id}>{country.country_name} </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className="commonInput">
                          <Form.Group>
                            <Form.Label>
                              Department<span className="requiredStar">*</span>
                            </Form.Label>
                            <Form.Select required id="deptid" value={form.deptid} onChange={handleInputChange}>
                              <option value="">Select Department</option>
                              {(departments || [])
                                .filter((dept) => dept.is_active === "Active") // Filter active departments
                                .map((dept) => (
                                  <option key={dept.dept_id} value={dept.dept_id}> {dept.dept_name}  </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className="commonInput">
                          <Form.Group>
                            <Form.Label>
                              Role<span className="requiredStar">*</span>
                            </Form.Label>
                            <Form.Select required id="roleid" value={form.roleid} onChange={handleInputChange}>
                              <option value="">Select Role</option>
                              {(roles || [])
                                .filter((role) => role.is_active === "Active")
                                .map((role) => (
                                  <option key={role.role_id} value={role.role_id}>{role.role_name} </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className='commonInput'>
                          <Form.Group>
                            <Form.Label>Date of Joining <span className='requiredStar'>*</span></Form.Label>
                            <Form.Control
                              required
                              type="date" placeholder="Date of Joining" id="doj" value={form.doj} onChange={(e) => {
                                const selectedDate = e.target.value;
                                const year = selectedDate.split("-")[0];
                                if (/^\d{4}$/.test(year) && year.length === 4) {
                                  handleInputChange(e);
                                } else {
                                  e.preventDefault();
                                }
                              }}
                            />
                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className='commonInput'>
                          <Form.Group>
                            <Form.Label>Date of Resignation <span className='requiredStar'></span></Form.Label>
                            <Form.Control type="date"
                              id="dor" value={form.dor} placeholder="Date of Resignation" min={form.doj} onChange={(e) => {
                                const selectedDate = e.target.value;
                                const year = selectedDate.split("-")[0];
                                if (/^\d{4}$/.test(year) && year.length === 4) {
                                  handleInputChange(e);
                                } else {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </Form.Group>
                        </div>
                      </Col>

                    </Row>
                  </div>
                  <div className="d-flex justify-content-between mt-3">
                    <div className="">
                      <Button
                        type="button"
                        className='btn btn-info clearBtn'
                        onClick={() => setForm({
                          userid: "",
                          username: "",
                          password: "",
                          firstname: "",
                          surname: "",
                          address: "",
                          city: "",
                          state: "",
                          country: "",
                          phonenumber: "",
                          email: "",
                          doj: "",
                          dor: "",
                          lastlogindate: "",
                          roleid: "",
                          deptid: "",
                          createdby: "",
                          lastmodifiedby: "",
                        })}
                      >
                        Reset
                      </Button>
                    </div>
                    <div className="">
                      <Button
                        type="button"
                        variant="primary"
                        className='btn-danger secondaryBtn'
                        onClick={() => window.history.back()}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className='btn btn-success primaryBtn'>
                        Submit
                      </Button>
                    </div>
                  </div>
                </form>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
export default UsersAdd
