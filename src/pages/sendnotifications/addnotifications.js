import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import {Row,Col,Form,Button,Card,} from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import axios from "axios";
const AddNotifications = () => {
    const [group, setGroup] = useState([]);
    const [notifications, setNotificationid] = useState([]);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};

    const [form, setForm] = useState({
        notification_id: "",
        group_id: "",
        school_id: userObj.school_id,
    });

    const fetchDropdownData = async (endpoint, setter) => {
        try {
            const response = await axios.post(baseUrl + endpoint, { action: 'READ' });
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
        }
    };

    useEffect(() => {
        fetchDropdownData('/notifications/', setNotificationid);
        fetchDropdownData('/creategroup/', setGroup);
    }, []);

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
            notification_id: form.notification_id,
            group_id: form.group_id,
            school_id: userObj.school_id,
            action: 'CREATE', 
        };
        try {
            const response = await axios.post(baseUrl + "/sendnotifications/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            toast.success("Record added successfully", { position: "top-right" });
            setForm({
                notification_id: "",
                group_id: "",
            });
    
        } catch (error) {
            console.error("There was an error submitting:", error);
            toast.error("Error submitting data: " + error.message, { position: "top-right" });
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
                                <Card.Body className="hide-scrollbar">
                                    <form onSubmit={handleSubmit}>
                                        <div className=''>
                                            <Row>
                                                <Col xs={12}>
                                                    <h6 className='commonSectionTitle'>Notifications Details</h6>
                                                </Col>
                                            </Row>
                                             <Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <Form.Group>
                                                            <Form.Label>
                                                                Notification<span className="requiredStar">*</span>
                                                            </Form.Label>
                                                            <select
                                                                className="form-select"
                                                                required
                                                                id="notification_id"
                                                                value={form.notification_id}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="">Select Notification</option>
                                                                {notifications.map((sendnotifications) => (
                                                                    <option key={sendnotifications.notification_id} value={sendnotifications.notification_id}>
                                                                        {sendnotifications.subject}
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
                                                                Group<span className="requiredStar">*</span>
                                                            </Form.Label>
                                                            <select
                                                                className="form-select"
                                                                required
                                                                id="group_id"
                                                                value={form.group_id}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="">Select Group</option>
                                                                {group.map((groups) => (
                                                                    <option key={groups.group_id} value={groups.group_id}>
                                                                        {groups.group_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Col>
                                                <div className="d-flex justify-content-between mt-3">
                                                    <div>
                                                        <Button
                                                            type="button"
                                                            variant="primary"
                                                            className="btn-info clearBtn"
                                                            onClick={() => setForm({
                                                                notification_id: "",
                                                                group_id: "",

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
                                            </Col>
                                        </div>
                                    </form>
                                </Card.Body>
                            </Card>
                        </Container>
                    </div>
                </div>
        </div>
        
    )
};
export default AddNotifications;
