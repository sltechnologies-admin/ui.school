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


const AddFeeitemslist = () => {
    const userData = sessionStorage.getItem('user');
    const userObj = JSON.parse(userData);
    const [editId, setEditId] = useState(null);

    const routeLocation = useLocation();

    const [form, setForm] = useState({
        fees_item_id: "",
        fees_item: "",
        school_id: "",
        school_name: "",
        status: "A"
    });
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        if (routeLocation.state?.feeitemslistData) {
            const feeitemslistData = routeLocation.state.feeitemslistData;
            setForm(feeitemslistData);
            setEditId(feeitemslistData.fees_item_id);
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
            fees_item_id: 0,
            fees_item: form.fees_item,
            school_id: userObj.school_id,
            status: form.status || "A",
            action: editId !== null ? 'UPDATE' : 'CREATE',
        };

        if (editId !== null) {
            formData.fees_item_id = editId;
        }

        try {
            const response = await axios.post(baseUrl + "/Feeitemslist/", formData, {
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
                fees_item_id: 0,
                fees_item: "",
                status: "A",
            });

        } catch (error) {
            if (error.response) {
                const { status, data } = error.response;
                const errorMessage = data.error || data.message || "Unexpected error occurred";

                if (status === 400 && errorMessage.includes("already exists")) {
                    toast.error(" Record already exists.", { position: "top-right" });
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
                                            <h6 className='commonSectionTitle'>Fee Items list Details</h6>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} md={6} lg={4} xxl={4}>
                                            <div className='commonInput'>
                                                <Form.Group>
                                                    <Form.Label>Fees Item <span className='requiredStar'>*</span></Form.Label>
                                                    <Form.Control
                                                        required
                                                        type="text"
                                                        id="fees_item"
                                                        value={form.fees_item}
                                                        placeholder="Enter Item"
                                                        maxLength={40}
                                                        onChange={(e) => {
                                                            const regex = /^[A-Za-z\s]*$/;
                                                            if (regex.test(e.target.value)) {
                                                                handleInputChange(e);
                                                            }
                                                        }}
                                                    />
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
                                                    fees_item_id: 0,
                                                    fees_item: "",
                                                    school_id: "",
                                                    status: "A",
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

export default AddFeeitemslist;