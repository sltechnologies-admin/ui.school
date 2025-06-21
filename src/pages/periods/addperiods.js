import axios from "axios";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
function AddPeriods() {
  const userData = sessionStorage.getItem("user");
  const userObj = JSON.parse(userData);
  const [editId, setEditId] = useState(null);
  const [categorys, setCategorys] = useState([]);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const routeLocation = useLocation();
  const [form, setForm] = useState({
    period_id: "",
    category_id:"",
    period_name: "",
    is_active: "",
    start_time: "",
    end_time: "",
    period_order:""
  });

  useEffect(() => {
    if (routeLocation.state?.userData) {
      const userData = routeLocation.state.userData;
      setForm(userData);
      setEditId(userData.period_id);
    }
  }, [routeLocation]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));
  };

   const fetchData = async () => {
          try {
              const response = await axios.post(baseUrl + "/category/", {
                  action: "READ",
                  school_id:userObj.school_id
              });
              setCategorys(response.data);
          } catch (error) {
              console.log("Error fetching data:", error);
          } 
      };
      useEffect(() => {
          fetchData();
      }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      period_name: form.period_name || "",
      category_id:form.category_id || " ",
      is_active: form.is_active || "A",
      start_time: form.start_time || "",
      end_time: form.end_time || "",
      school_id: userObj.school_id,
      period_order:form.period_order || "",

      action: editId !== null ? "UPDATE" : "CREATE",
    };

    if (editId !== null) {
      formData.period_id = editId;
    }

    try {
      const response = await axios.post(baseUrl + "/periods/", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (editId !== null) {
        toast.success("Record updated successfully", { position: "top-right" });
        setEditId(null);
      } else {
        toast.success("Record added successfully", { position: "top-right" });
      }
      setForm({
        period_name: "",
        is_active: "A",
        start_time: "",
        end_time: "",
      });
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 400 && data.error === "Record already exists.") {
          toast.error("Record already exists.", { position: "top-right" });
        } else if (
          status === 401 &&
          data.error === "Period order already exists for the specified school and category."
        ) {
          toast.error("Period order already exists for the specified school and category.", {
            position: "top-right",
          });
          
        } 
        else if (
          status === 402 &&
          data.error === "Period name is already exists for category."
        ) {
          toast.error("Period name is already exists for category.", {
            position: "top-right",
          });
          
        } 
        else if (status === 500) {
          toast.error(
            "Error submitting data: " + (data.error || error.message),
            { position: "top-right" }
          );
        } else {
          toast.error("Unexpected error occurred", { position: "top-right" });
        }
      } else {
        toast.error("Error submitting data: " + error.message, {
          position: "top-right",
        });
      }
    }
  };
  return (
    <div className="pageMain">
      <ToastContainer />
      <LeftNav></LeftNav>
      <div className="pageRight">
        <div className="pageHead">
          <Header></Header>
        </div>
        <div className="pageBody">
          <Container fluid>
            <div className="">
              <Card>
                <Card.Body>
                  <form className="" onSubmit={handleSubmit}>
                    <div className="">
                      <Row>
                        <Col xs={12}>
                          <h6 className="commonSectionTitle">Period Details</h6>
                        </Col>
                      </Row>

                      <Row>
                        <Col xs={12} md={6} lg={4} xxl={3}>
                                                                            <div className="commonInput">
                                                                                <Form.Group>
                                                                                    <Form.Label>
                                                                                        Category<span className="requiredStar">*</span>
                                                                                    </Form.Label>
                                                                                    <select
                                                                                        className="form-select"
                                                                                        required
                                                                                        id="category_id"
                                                                                        value={form.category_id}
                                                                                        onChange={handleInputChange}
                                                                                    >
                                                                                        <option value="">Select category</option>
                                                                                        {(categorys || []).map((category) => (
                                                                                            <option key={category.category_id} value={category.category_id}>
                                                                                                {category.category_name}
                                                                                            </option>
                                                                                        ))}
                                                                                    </select>
                                                                                </Form.Group>
                                                                            </div>
                                                                        </Col>
                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>
                                Period Name <span className="requiredStar">*</span>
                              </Form.Label>
                              <Form.Control
                                required
                                type="text"
                                id="period_name"
                                value={form.period_name}
                                placeholder="Enter Period Name"
                                maxLength={30}
                                onChange={(e) => {
                                  const value = e.target.value;
                                 
                                  const validValue = value.replace(/[^a-zA-Z0-9 ]/g, '');
                                  handleInputChange({
                                    target: {
                                      id: 'period_name',
                                      value: validValue,
                                    },
                                  });
                                }}
                              />
                              <Form.Control.Feedback>Required</Form.Control.Feedback>
                            </Form.Group>
                          </div>
                        </Col>
                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>
                                Start Time <span className="requiredStar">*</span>
                              </Form.Label>
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                  required
                                  id="start_time"
                                  value={form.start_time ? dayjs(form.start_time, "hh:mm A") : null}
                                  onChange={(time) => {
                                    setForm((prevForm) => ({
                                      ...prevForm,
                                      start_time: time ? time.format("hh:mm A") : "",
                                    }));
                                  }}
                                  format="hh:mm A"
                                  sx={{
                                    width: "100%",
                                    "& .MuiInputBase-root": {
                                      height: "40px",
                                      borderRadius: "4px",
                                      border: "1px solid #ced4da",
                                      boxShadow: "none",
                                      paddingLeft: "10px",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                      border: "none",
                                    },
                                  }}
                                />
                              </LocalizationProvider>
                              <Form.Control.Feedback>Required</Form.Control.Feedback>
                            </Form.Group>
                          </div>
                        </Col>

                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>
                                End Time <span className="requiredStar">*</span>
                              </Form.Label>
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                  required
                                  id="end_time"
                                  value={form.end_time ? dayjs(form.end_time, "hh:mm A") : null}
                                  onChange={(time) => {
                                    setForm((prevForm) => ({
                                      ...prevForm,
                                      end_time: time ? time.format("hh:mm A") : "",
                                    }));
                                  }}
                                  format="hh:mm A"
                                  sx={{
                                    width: "100%",
                                    "& .MuiInputBase-root": {
                                      height: "40px",
                                      borderRadius: "4px",
                                      border: "1px solid #ced4da",
                                      boxShadow: "none",
                                      paddingLeft: "10px",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                      border: "none",
                                    },
                                  }}
                                />
                              </LocalizationProvider>
                              <Form.Control.Feedback>Required</Form.Control.Feedback>
                            </Form.Group>
                          </div>
                        </Col>
                        <Col xs={12} md={6} lg={4} xxl={3}>
  <div className='commonInput'>
    <Form.Group controlId="periodOrder">
      <Form.Label>Period Order</Form.Label>
      <Form.Control
        type="number"
        id="period_order"
        value={form.period_order}
        placeholder="Enter Period order"
        maxLength={30} 
        required
        min={1} 
        onChange={handleInputChange}
      />
    </Form.Group>
  </div>
</Col>


                      </Row>

                    </div>

                    <div className="d-flex justify-content-between mt-3">
                      <div>
                        <Button
                          type="button"
                          variant="primary"
                          className="btn-info clearBtn"
                          onClick={() =>
                            setForm({
                              period_id: "",
                              category_id:"",
                              period_name: "",
                              start_time: "",
                              end_time: "",
                              period_order:""
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
                          className="btn-danger secondaryBtn me-2"
                          onClick={() => window.history.back()}
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
            </div>
          </Container>
        </div>
      </div>
    </div>

  );
}

export default AddPeriods;
