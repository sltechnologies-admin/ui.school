import React, { useState, useEffect } from 'react'
import { useLocation } from "react-router-dom";
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import axios from "axios";

const AddSubject = () => {
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const [editId, setEditId] = useState(null);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const routeLocation = useLocation();
    const [form, setForm] = useState({
        subject_id: "",
        subject_name: "",
        is_active: "A",
        isCoCurricular: null,
        is_language: ""
    });

   useEffect(() => {
    if (routeLocation.state?.subjectData) {
        const subjectData = routeLocation.state.subjectData;

        const normalizedIsLanguage =
            subjectData.is_language === "Yes"
                ? "Y"
                : subjectData.is_language === "No"
                    ? "N"
                    : "";

        setForm({
            subject_id: subjectData.subject_id || "",
            subject_name: subjectData.subject_name || "",
            is_active: subjectData.is_active || "A",
            isCoCurricular: subjectData.is_cocurricular ?? null,
            is_language: normalizedIsLanguage
        });

        setEditId(subjectData.subject_id);
    }
}, [routeLocation]);


    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [id]: value
        }));
    };
    const handleRadioChange = (value) => {
        setForm((prev) => ({
            ...prev,
            isCoCurricular: value
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            subject_name: form.subject_name,
            is_active: form.is_active || "A",
            is_cocurricular: form.isCoCurricular,
            is_language: form.is_language,
            school_id: userObj.school_id,
            action: editId !== null ? 'UPDATE' : 'CREATE',
        };

        if (editId !== null) {
            formData.subject_id = editId;
        }

        try {
            const response = await axios.post(baseUrl + "/subjectmaster/", formData, {
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
                subject_name: "",
                is_active: "A",
                isCoCurricular: null,
                is_language: ""
            });

        } catch (error) {
            console.log("Full error object:", error);

            if (error.response) {
                const { status, data } = error.response;
                const errorMessage = data.error || data.message || "Unexpected error occurred";

                if (status === 400 && errorMessage.includes("already exists")) {
                    toast.error("Subject Name Already Exists.", { position: "top-right" });
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
                                            <h6 className='commonSectionTitle'>Subject Details</h6>
                                        </Col>

                                    </Row>
                                    <Row>
                                        <Col xs={12} md={6} lg={4} xxl={3}>
                                            <div className='commonInput'>
                                                <Form.Group>
                                                    <Form.Label>Subject  <span className='requiredStar'>*</span></Form.Label>
                                                    <Form.Control
                                                        required
                                                        type="text"
                                                        id="subject_name"
                                                        value={form.subject_name}
                                                        placeholder="Enter Subject "
                                                        maxLength={30}
                                                        onChange={handleInputChange}
                                                    />
                                                </Form.Group>
                                            </div>
                                        </Col>
                                        <Col xs={12} md={6} lg={4} xxl={3}>
                                            <div className="commonInput">
                                                <Form.Group>
                                                    <div style={{ marginLeft: '55px' }}>
                                                        <Form.Label>
                                                            Is Co-Curricular <span className="requiredStar">*</span>
                                                        </Form.Label>
                                                        <div className="d-flex">
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="isCoCurricular"
                                                                    id="true"
                                                                    value="true"
                                                                    onChange={() => setForm(prev => ({ ...prev, isCoCurricular: true }))}
                                                                    checked={form.isCoCurricular === true}
                                                                    required
                                                                />
                                                                <label className="form-check-label" htmlFor="true">Yes</label>
                                                            </div>
                                                            <div className="form-check ms-3">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="isCoCurricular"
                                                                    id="false"
                                                                    value="false"
                                                                    onChange={() => setForm(prev => ({ ...prev, isCoCurricular: false }))}
                                                                    checked={form.isCoCurricular === false}
                                                                />
                                                                <label className="form-check-label" htmlFor="false">No</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Form.Group>
                                            </div>
                                        </Col>
                                        <Col xs={12} md={6} lg={4} xxl={3}>
                                            <div className="commonInput">
                                                <Form.Group>
                                                    <div style={{ marginLeft: '-85px' }}>
                                                        <Form.Label>
                                                            Is Language <span className="requiredStar">*</span>
                                                        </Form.Label>
                                                        <div className="d-flex">
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="is_language"
                                                                    id="Yes"
                                                                    value="Y"
                                                                    onChange={() => setForm(prev => ({ ...prev, is_language: "Y" }))}
                                                                    checked={form.is_language === "Y"}
                                                                    required
                                                                />

                                                                <label className="form-check-label" htmlFor="Yes">Yes</label>
                                                            </div>
                                                            <div className="form-check ms-3">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="is_language"
                                                                    id="No"
                                                                    value="N"
                                                                    onChange={() => setForm(prev => ({ ...prev, is_language: "N" }))}
                                                                    checked={form.is_language === "N"}
                                                                />

                                                                <label className="form-check-label" htmlFor="No">No</label>
                                                            </div>
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
                                                    subject_id: "",
                                                    subject_name: "",
                                                    is_active: "A",
                                                    isCoCurricular: null,
                                                    is_language: ""
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

export default AddSubject;