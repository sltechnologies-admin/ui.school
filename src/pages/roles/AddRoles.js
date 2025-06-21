import React,{ useState,useEffect } from 'react'
import { useLocation } from "react-router-dom";
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import axios from "axios";

function RolesAdd() {
    const [editId, setEditId] = useState(null);
    const routeLocation = useLocation(); 
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [form, setForm] = useState({
        role_name: "",
        is_active: "",
    })

    useEffect(() => {
        if (routeLocation.state?.rolesData) {
            const rolesData = routeLocation.state.rolesData;
            setForm(rolesData);
            setEditId(rolesData.role_id);
            window.history.replaceState({}, document.title);
        }
    }, [routeLocation]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;

        if (id === "role_name") {
            if (/^[A-Za-z ]{0,30}$/.test(value)) {
                setForm((prevForm) => ({
                    ...prevForm,
                    [id]: value, 
                }));
            }
        } else {
            setForm((prevForm) => ({
                ...prevForm,
                [id]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            role_name: form.role_name,
            is_active: form.is_active,
            action: editId !== null ? "UPDATE" : "CREATE"
        };
    
        if (editId !== null) {
            formData.role_id = editId;
        }
    
        try {
            const response = await axios.post(baseUrl + "/role/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setForm({
                role_name: "",
                is_active: "",
            });
            if (editId !== null) {
                toast.success("Record Updated Successfully");
                
            } else {
                toast.success("Record Added Successfully");
               
            }
        } catch (error) {
            console.error("Error submitting data:", error.response?.data || error.message);  
            if (error.response?.data?.error?.includes("already exists")) {
                toast.error("Record already exists");
            } else {
                toast.error("Unexpected error occurred");
            }   
        }
    };
    
    return (
        
              
            <div className='pageMain'>
                <ToastContainer/>
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
                                                        <h6 className='commonSectionTitle'>Role Details</h6>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                   
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group>
                                                                <Form.Label>Role  <span className='requiredStar'>*</span></Form.Label>
                                                                <Form.Control
                                                                    required
                                                                    type="text"
                                                                    id="role_name"
                                                                    value={form.role_name}
                                                                    placeholder="Enter Role "
                                                                    maxlength={30}
                                                                    onChange={handleInputChange}
                                                                />
                                                                <Form.Control.Feedback>Required</Form.Control.Feedback>
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
                                        o      className="btn-info clearBtn"
                                                onClick={() => setForm({
                                                    role_name: "",
                                                    is_active:"",
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
                            </div>
                        </Container>
                    </div>
                </div>
            </div>
       
    );
}

export default RolesAdd;