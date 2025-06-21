import React, { useState, useEffect } from 'react'
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
import { useFeeModuleAccess } from "../hooks/useFeeModuleAccess";
import { fetchDataRead } from "../../Utility";

const AddFeeSchedule = () => {
    const routeLocation = useLocation();
    const [editId, setEditId] = useState(null);
    const [academics, setAcademics] = useState([]);
    const [feeScheduleTypes, setFeeScheduleTypes] = useState([]);

    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const userData = sessionStorage.getItem('user');
    const userObj = JSON.parse(userData);

    const currentUserRole = userObj.role_name?.trim();
    const { canWrite } = useFeeModuleAccess(currentUserRole);

    const [form, setForm] = useState({
        fee_schedule_id: "",
        academic_year_id: userObj.academic_year_id || 0,
        academic_year_name: "",
        schedule_name: "",
        due_date: "",
        alerts_on: "",
        fee_schedule_type_id:"",
        school_id: "",
        status: "A",
        start_date: "",
        end_date: "",
        alerts_start_date: ""
    });

    useEffect(() => {
        fetchAcademicYears();
        fetchDataRead("/feescheduletype/", setFeeScheduleTypes, userObj.school_id);

    }, []);

    useEffect(() => {
        if (routeLocation.state?.feescheduleData) {
            const feescheduleData = routeLocation.state.feescheduleData;
            document.title = "SCHOLAS";
            setForm(feescheduleData);
            setEditId(feescheduleData.fee_schedule_id);
            window.history.replaceState({}, document.title);
        }
    }, [routeLocation]);

    const fetchAcademicYears = async () => {
        try {
            const response = await axios.post(baseUrl + "/AcademicYear/", {
                action: "READ", school_id: userObj.school_id
            });
            setAcademics(response.data)
        } catch (error) {
            console.log("Error fetching students name:", error)
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [id]: value
        }));
    };

    const handleRadioChange = (e) => {
        setForm((prevForm) => ({
            ...prevForm,
            alerts_on: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // const approveStatus = { 'Yes': 'Y', 'No': 'N' };
        // const selectedStatus = approveStatus[form.alerts_on] || form.alerts_on;

        const formData = {
            academic_year_id: userObj.academic_year_id,
            schedule_name: form.schedule_name,
            due_date: form.due_date,
            start_date: form.start_date,
            end_date: form.end_date,
            alerts_start_date: form.alerts_start_date,
            fee_schedule_type_id:form.fee_schedule_type_id,
            //alerts_on: selectedStatus,
            school_id: userObj.school_id,
            status: form.status || "A",
            action: editId !== null ? 'UPDATE' : 'CREATE'
        };

        if (editId !== null) {
            formData.fee_schedule_id = editId;
        }

        try {
            const response = await axios.post(baseUrl + "/feeschedule/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (editId !== null) {
                toast.success("Record Updated Successfully");
                setEditId(null);
            } else {
                toast.success("Record Added Successfully");
            }

            setForm({
                schedule_name: "",
                due_date: "",
                //alerts_on: "",
                status: "A",
                fee_schedule_type_id:"",
                start_date: "",
                end_date: "",
                alerts_start_date: "",
            });
        }
        catch (error) {
            if (error.response) {
                const { status, data } = error.response;

                if (status === 400) {
                    if (data.error === "Duplicate entry for academic_year_id") {
                        toast.error("Record Already Exists.", { position: "top-right" });
                    }
                    if (data.error === "New due date cannot be less than or equal to the maximum existing date for academic_year_id") {
                        toast.error("Due Date Can Not Be Less Than or Equal To Previous Due Date", { position: "top-right" });
                    }
                    if (data.error === "Overlapping fee schedule already exists for the selected date range") {
                        toast.error("Fee Schedule Already Exists For The Selected Date Range", { position: "top-right" });
                    }
                }

                else if (status === 500) {
                    toast.error("Error submitting data: " + (data.error || error.message), { position: "top-right" });
                }
                else {
                    toast.error("Unexpected error occurred", { position: "top-right" });
                }
            }
            else {
                console.error("There was an error submitting:", error);
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
                                                    <h6 className='commonSectionTitle'>Fees Schedule Details</h6>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <Form.Group>
                                                            <Form.Label>
                                                                Academic Year Name<span className="requiredStar">*</span>
                                                            </Form.Label>
                                                            <div className="form-control-plaintext">
                                                                {userObj.academic_year_name}
                                                            </div>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <Form.Group controlId="fee_schedule_type_id">
                                                            <Form.Label>
                                                                Fee Schedule Type<span className="requiredStar">*</span>
                                                            </Form.Label>
                                                            <select
                                                                className="form-select"
                                                                name="fee_schedule_type_id"
                                                                id='fee_schedule_type_id'
                                                                value={form.fee_schedule_type_id}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="">Select Fee Schedule Type</option>
                                                                {(feeScheduleTypes || [])
                                                                    .filter(type => type.is_active === 'Active') // Only active types
                                                                    .map((type) => (
                                                                        <option
                                                                            key={type.fee_schedule_type_id}
                                                                            value={type.fee_schedule_type_id}
                                                                        >
                                                                            {type.fee_schedule_type_name}
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                        </Form.Group>
                                                    </div>
                                                </Col>

                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Schedule Name<span className='requiredStar'>*</span></Form.Label>
                                                            <Form.Control
                                                                required
                                                                type="text"
                                                                id="schedule_name"
                                                                value={form.schedule_name}
                                                                placeholder="Enter Schedule Name"
                                                                onChange={(e) => {
                                                                    const regex = /^[A-Za-z0-9\s]*$/;
                                                                    if (regex.test(e.target.value)) {
                                                                        handleInputChange(e);
                                                                    }
                                                                }}
                                                                maxLength={30}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Start Date<span className='requiredStar'>*</span></Form.Label>
                                                            <Form.Control
                                                                required
                                                                type="date"
                                                                id="start_date"
                                                                value={form.start_date}
                                                                placeholder="Enter Start Date"
                                                                onChange={handleInputChange}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>End Date<span className='requiredStar'>*</span></Form.Label>
                                                            <Form.Control
                                                                required
                                                                type="date"
                                                                id="end_date"
                                                                value={form.end_date}
                                                                placeholder="Enter End Date"
                                                                onChange={handleInputChange}
                                                                  min={form.start_date}

                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Due Date<span className='requiredStar'>*</span></Form.Label>
                                                            <Form.Control
                                                                required
                                                                type="date"
                                                                id="due_date"
                                                                value={form.due_date}
                                                                placeholder="Enter Due Date"
                                                                onChange={handleInputChange}
                                                                  min={form.start_date}

                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Alerts Start Date<span className='requiredStar'>*</span></Form.Label>
                                                            <Form.Control
                                                                required
                                                                type="date"
                                                                id="alerts_start_date"
                                                                value={form.alerts_start_date}
                                                                placeholder="Enter Alerts Start Date"
                                                                onChange={handleInputChange}
                                                                  min={form.start_date}

                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                {/* <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <Form.Group>
                                                            <Form.Label>Alerts On<span className='requiredStar'>*</span></Form.Label>
                                                            <div className="d-flex">
                                                                <div className="form-check">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        name="alerts_on"
                                                                        id="Yes"
                                                                        value="Yes"
                                                                        onChange={handleRadioChange}
                                                                        checked={form.alerts_on === "Yes"}
                                                                        required
                                                                    />
                                                                    <label className="form-check-label" htmlFor="Yes">Yes</label>
                                                                </div>
                                                                <div className="form-check ms-3">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        name="alerts_on"
                                                                        id="No"
                                                                        value="No"
                                                                        onChange={handleRadioChange}
                                                                        checked={form.alerts_on === "No"}
                                                                    />
                                                                    <label className="form-check-label" htmlFor="No">No</label>
                                                                </div>
                                                            </div>
                                                        </Form.Group>
                                                    </div>
                                                </Col> */}
                                            </Row>
                                        </div>
                                        <div className="d-flex justify-content-between mt-3">
                                            <div>
                                                <Button
                                                    type="button"
                                                    variant="primary"
                                                    className="btn-info clearBtn"
                                                    onClick={() => setForm({
                                                        schedule_name: "",
                                                        due_date: "",
                                                        start_date: "",
                                                        fee_schedule_type_id:"",
                                                        end_date: "",
                                                        alerts_start_date: ""
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
                                                    <Button type="submit" variant="primary" className="btn-success primaryBtn">
                                                        Submit
                                                    </Button>
                                                )}
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
export default AddFeeSchedule;
