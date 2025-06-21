import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import Header from "../../components/layout/header/header";
import { ToastContainer, toast } from 'react-toastify';
import LeftNav from "../../components/layout/leftNav/leftNav";
import FeesScheduleApi from "./FeesScheduleApi ";
import { useFeeModuleAccess } from "../hooks/useFeeModuleAccess";

function AddFeeItemSchedule() {
    const userData = sessionStorage.getItem('user');
    const userObj = JSON.parse(userData);
    const userIdStr = userObj.school_id;
    const userId = parseInt(userIdStr, 10);
    const [academics, setAcademic] = useState([]);
    const [classes, setClass] = useState([]);
    const routeLocation = useLocation();
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [form, setForm] = useState({
        fee_items_schedule_id: 0,
        fees_item_id: "",
        fee_schedule_id: "",
        amount_to_pay: "",
        school_id: userObj.school_id || 0,
        createdby: "",
        lastmodifiedby: "",
        combined_name: "",
        academic_year_id: userObj.academic_year_id || 0,
        class_id: "",
        item_id: 0,
    })

    const currentUserRole = userObj.role_name?.trim();
    const { canWrite } = useFeeModuleAccess(currentUserRole);

    useEffect(() => {
        if (routeLocation.state?.userData) {
            const userData = routeLocation.state.userData;
            setForm(userData);
            window.history.replaceState({}, document.title);
        }
    }, [routeLocation]);

    const params = {
        p_academic_year_id: userObj.academic_year_id || 0,
        p_class_id: form.class_id,
        p_school_id: userObj.school_id || 0
    };

    useEffect(() => {
        document.title = "SCHOLAS";
        fetchacademics(userId);
        fetchclasses(userId);
    }, []);

    const fetchacademics = async (userId) => {
        try {
            const response = await axios.post(baseUrl + "/AcademicYear/", {
                action: "READ",
                school_id: userId
            });
            setAcademic(response.data);
        } catch (error) {
            console.error("Error fetching academics:", error);
        }
    };

    const fetchclasses = async (userId) => {
        try {
            const response = await axios.post(baseUrl + "/classes/", {
                action: "READ",
                school_id: userId
            });
            const filterData = Array.isArray(response.data) ? response.data : [];

            const filteredClasses = filterData.filter(
                item => item.is_active?.toLowerCase() === 'active'
            );
            setClass(filteredClasses);
        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [id]: value
        }));
    }

    const childRef = useRef(null);

    const handleSaveAll = async () => {
        if (childRef.current) {
            const isSuccess = await childRef.current.handleFetchData();
            if (isSuccess) {
                setForm({
                    fee_items_schedule_id: 0,
                    fees_item_id: "",
                    fee_schedule_id: "",
                    amount_to_pay: "",
                    createdby: "",
                    lastmodifiedby: "",
                    combined_name: "",
                    class_id: "",
                    item_id: "",
                });
            }
            // else {
            //     toast.error("Failed to save data.");
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
                                            <h6 className='commonSectionTitle'>Fees Item Schedule Details</h6>
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
                                            <div className='commonInput'>
                                                <Form.Group>
                                                    <Form.Label>Class</Form.Label>
                                                    <select
                                                        className="form-select"
                                                        id="class_id"
                                                        value={form.class_id}
                                                        onChange={handleInputChange}
                                                        required
                                                    >
                                                        <option value="">Select Class</option>
                                                        {(classes || []).map((classe) => (
                                                            <option key={classe.class_id} value={classe.class_id}>
                                                                {classe.class_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </Form.Group>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <FeesScheduleApi ref={childRef} {...params} />
                                    </Row>
                                    <div className="d-flex justify-content-between mt-3">
                                        <div>
                                            <Button
                                                type="button"
                                                variant="primary"
                                                className="btn-info clearBtn"
                                                onClick={() => {
                                                    setForm({
                                                        fee_items_schedule_id: 0,
                                                        fees_item_id: "",
                                                        fee_schedule_id: "",
                                                        amount_to_pay: "",
                                                        createdby: "",
                                                        lastmodifiedby: "",
                                                        combined_name: "",
                                                        class_id: "",
                                                        item_id: "",
                                                    });
                                                }}
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
    );
};
export default AddFeeItemSchedule
