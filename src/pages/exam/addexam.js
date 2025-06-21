
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { Row, Col, Card, Button, Form } from "react-bootstrap";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";

function Addexam() {
    const routeLocation = useLocation();
    const [editId, setEditId] = useState(null);
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [form, setForm] = useState({
        exam_name: "",
        school_id: 0,
    });
    useEffect(() => {
        if (routeLocation.state?.ExamData) {
            const ExamData = routeLocation.state.ExamData;
            setForm(ExamData);
            setEditId(ExamData.exam_id);
            window.history.replaceState({}, document.title);
        }
    }, [routeLocation]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            exam_name: form.exam_name,
            school_id: userObj.school_id,
            action: editId !== null ? "UPDATE" : "CREATE",
        };
        if (editId !== null) {
            formData.exam_id = editId;
        }
        try {
            await axios.post(`${baseUrl}/exammaster/`, formData, {
                headers: { "Content-Type": "application/json" },
            });
            toast.success(editId !== null ? "Record updated successfully" : "Record added successfully");
            setEditId(null);
            setForm({ exam_name: "", school_id: "" });
        } catch (error) {
            if (error.response) {
                const { status } = error.response;
                if (status === 400) {
                    toast.error("Exam already exists");
                } else if (status === 500) {
                    toast.error("Error in submitting data");
                } else {
                    toast.error("Unexpected error occurred");
                }
            } else {
                toast.error("Error in submitting data");
            }
        }
    };
    return (
        <div className="pageMain">
            <ToastContainer />
            <LeftNav />
            <div className="pageRight">
                <div className="pageHead">
                    <Header />
                </div>
                <div className="pageBody">
                    <Card>
                        <Card.Body>
                            <form onSubmit={handleSubmit}>
                                <Row>
                                    <Col xs={12}>
                                        <h6 className="commonSectionTitle">Exam Details</h6>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                        <div className="commonInput">
                                            <Form.Group>
                                                <Form.Label> Exam Name <span className="requiredStar">*</span></Form.Label>
                                                <Form.Control required id="exam_name" value={form.exam_name} placeholder="Enter Exam Name" maxLength={35}
                                                    onChange={(e) => {
                                                        const filteredValue = e.target.value.replace(/[^a-zA-Z0-9 -]/g, ""); // allow a-z, A-Z, 0-9, space, and hyphen
                                                        setForm({ ...form, exam_name: filteredValue });
                                                    }}
                                                />
                                            </Form.Group>
                                        </div>
                                    </Col>
                                </Row>
                                <div className="d-flex justify-content-between mt-3">
                                    <div>
                                        <Button type="button" className='btn btn-info clearBtn' onClick={() => setForm({ exam_name: "", school_id: "" })}>Reset</Button>
                                    </div>
                                    <div>
                                        <Button type="button" variant="primary" className='btn-danger secondaryBtn' onClick={() => window.history.back()}> Cancel</Button>
                                        <Button type="submit" variant="success" className="btn btn-success primaryBtn">  Submit  </Button>
                                    </div>
                                </div>
                            </form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
}
export default Addexam
