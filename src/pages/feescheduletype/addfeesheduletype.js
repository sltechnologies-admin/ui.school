import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import axios from "axios";

const AddFeeScheduleType = () => {
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const [editId, setEditId] = useState(null);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const routeLocation = useLocation();

    const [form, setForm] = useState({
        fee_schedule_type_id: "",
        fee_schedule_type_name: "",
        is_active: "A",
        is_default: "N"
    });
useEffect(() => {
    if (routeLocation.state?.feeScheduleTypeData) {
        const data = routeLocation.state.feeScheduleTypeData;

        setForm({
            fee_schedule_type_id: data.fee_schedule_type_id || "",
            fee_schedule_type_name: data.fee_schedule_type_name || "",
            is_active: data.is_active === "Active" ? "A" : "I", // optional normalization
            is_default: data.is_default === "Yes" || data.is_default === "Y" ? "Y" : "N", // ✅ normalize here
        });

        setEditId(data.fee_schedule_type_id);
    }
}, [routeLocation]);


    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [id]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            fee_schedule_type_name: form.fee_schedule_type_name,
            school_id: userObj.school_id,
            is_default: form.is_default,
            action: editId ? 'UPDATE' : 'CREATE',
        };

        if (editId) {
            formData.fee_schedule_type_id = editId;
        }

        try {
            const response = await axios.post(baseUrl + "/feescheduletype/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (editId) {
                toast.success("Record Updated Successfully");
                setEditId(null);
            } else {
                toast.success("Record Added Successfully");
            }

            setForm({
                fee_schedule_type_id: "",
                fee_schedule_type_name: "",
                is_active: "A",
                is_default:"",
            });

        } catch (error) {
            const errMsg = error.response?.data?.message || "Unexpected error occurred";
            toast.error(`Error: ${errMsg}`, { position: "top-right" });
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
                                <form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col xs={12}>
                                            <h6 className='commonSectionTitle'>Fee Schedule Type</h6>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col xs={12} md={6} lg={4} xxl={3}>
                                            <div className='commonInput'>
                                                <Form.Group>
                                                    <Form.Label>Fee Schedule Type <span className='requiredStar'>*</span></Form.Label>
                                                    <Form.Control
                                                        required
                                                        type="text"
                                                        id="fee_schedule_type_name"
                                                        value={form.fee_schedule_type_name}
                                                        placeholder="Enter Fee Schedule Type"
                                                        maxLength={30}
                                                        onChange={handleInputChange}
                                                    />
                                                </Form.Group>
                                            </div>
                                        </Col>
                                        <Col xs={12} md={6} lg={4} xxl={3}>
                                            <div className="commonInput">
                                                <Form.Group>
                                                    <Form.Label>Is Default <span className="requiredStar">*</span></Form.Label>
                                                    <div>
                                                        <Form.Check
                                                            inline
                                                            type="radio"
                                                            id="is_default_yes"
                                                            name="is_default"
                                                            label="Yes"
                                                            required
                                                            value="Y"
                                                            checked={form.is_default === "Y"}
                                                            onChange={() => setForm(prev => ({ ...prev, is_default: "Y" }))}
                                                        />
                                                        <Form.Check
                                                            inline
                                                            type="radio"
                                                            id="is_default_no"
                                                            name="is_default"
                                                            label="No"
                                                            value="N"
                                                            checked={form.is_default === "N"}
                                                            onChange={() => setForm(prev => ({ ...prev, is_default: "N" }))}
                                                        />
                                                    </div>
                                                </Form.Group>
                                            </div>
                                        </Col>

                                    </Row>

                                    <div className="d-flex justify-content-between mt-3">
                                        <Button
                                            type="button"
                                            variant="primary"
                                            className="btn-info clearBtn"
                                            onClick={() => setForm({
                                                fee_schedule_type_id: "",
                                                fee_schedule_type_name: "",
                                                is_active: "A"
                                            })}
                                        >
                                            Reset
                                        </Button>

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
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default AddFeeScheduleType;
