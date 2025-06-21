import React, { useState, useEffect } from 'react'
import { useLocation } from "react-router-dom";
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import axios from "axios";

const AddFeeCategory = () => {
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const [editId, setEditId] = useState(null);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const routeLocation = useLocation();
    const [form, setForm] = useState({
        fee_category_id: "",
        fee_category_name: "",
        is_active: "A",
        is_display: ""
    });

    useEffect(() => {
        if (routeLocation.state?.feecategoryData) {
            const feecategoryData = routeLocation.state.feecategoryData;

            const normalizedIsDisplay =
                feecategoryData.is_display === "Yes"
                    ? "Y"
                    : feecategoryData.is_display === "No"
                        ? "N"
                        : "";

            setForm({
                fee_category_id: feecategoryData.fee_category_id || "",
                fee_category_name: feecategoryData.fee_category_name || "",
                is_active: feecategoryData.is_active || "A",
                is_display: normalizedIsDisplay
            });

            setEditId(feecategoryData.fee_category_id);
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
            fee_category_name: form.fee_category_name,
            is_display: form.is_display,
            school_id: userObj.school_id,
            action: editId !== null ? 'UPDATE' : 'CREATE',
        };

        if (editId !== null) {
            formData.fee_category_id = editId;
        }

        try {
            const response = await axios.post(baseUrl + "/feecategory/", formData, {
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
                fee_category_name: "",
                is_active: "A",
                is_display: ""
            });

        } catch (error) {
            console.log("Full error object:", error);

            if (error.response) {
                const { status, data } = error.response;
                const errorMessage = data.error || data.message || "Unexpected error occurred";

                if (status === 400 && errorMessage.includes("already exists")) {
                    toast.error("Record Already Exists.", { position: "top-right" });
                } else if (status === 500) {
                    toast.error("Error submitting data: " + errorMessage, { position: "top-right" });
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
                                            <h6 className='commonSectionTitle'>Fee Category Details</h6>
                                        </Col>

                                    </Row>
                                    <Row>
                                        <Col xs={12} md={6} lg={4} xxl={3}>
                                            <div className='commonInput'>
                                                <Form.Group>
                                                    <Form.Label>
                                                        Fee Category <span className='requiredStar'>*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        required
                                                        type="text"
                                                        id="fee_category_name"
                                                        value={form.fee_category_name}
                                                        placeholder="Enter Fee Category Name"
                                                        maxLength={30}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                           
                                                            if (/^[a-zA-Z\s]*$/.test(value)) {
                                                                handleInputChange(e); 
                                                            }
                                                        }}
                                                    />
                                                </Form.Group>
                                            </div>
                                        </Col>

                                        <Col xs={12} md={6} lg={4} xxl={3}>
                                            <div className="commonInput">
                                                <Form.Group>
                                                    <Form.Label>
                                                        Is Display <span className="requiredStar">*</span>
                                                    </Form.Label>
                                                    <div className="d-flex">
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="is_display"
                                                                id="Yes"
                                                                value="Y"
                                                                onChange={() => setForm(prev => ({ ...prev, is_display: "Y" }))}
                                                                checked={form.is_display === "Y"}
                                                                required
                                                            />

                                                            <label className="form-check-label" htmlFor="Yes">Yes</label>
                                                        </div>
                                                        <div className="form-check ms-3">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="is_display"
                                                                id="No"
                                                                value="N"
                                                                onChange={() => setForm(prev => ({ ...prev, is_display: "N" }))}
                                                                checked={form.is_display === "N"}
                                                            />

                                                            <label className="form-check-label" htmlFor="No">No</label>
                                                        </div>
                                                    </div>
                                                </Form.Group>
                                            </div>
                                        </Col>

                                    </Row>
                                    <div className="d-flex justify-content-between mt-3">
                                        <div>
                                            <Button
                                                type="button"
                                                variant="primary"
                                                className="btn-info clearBtn"
                                                onClick={() => setForm({
                                                    fee_category_id: "",
                                                    fee_category_name: "",
                                                    is_active: "A",
                                                    is_dispLay: ""
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

export default AddFeeCategory;