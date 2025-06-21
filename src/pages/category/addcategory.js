import React,{ useState,useEffect } from 'react'
import { useLocation } from "react-router-dom";
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import axios from "axios";

const AddCategory = () => {
    const userData = sessionStorage.getItem("user");
  const userObj = JSON.parse(userData);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [editId, setEditId] = useState(null);
    const routeLocation = useLocation();
    const [form, setForm] = useState({
        category_name: ""
    });

    useEffect(() => {
        if (routeLocation.state?.categoryData) {
            const categoryData = routeLocation.state.categoryData;
            setForm(categoryData);
            setEditId(categoryData.category_id);
        }
    }, [routeLocation]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        if (id === "category_name") {
            if (/^[A-Za-z ]{0,30}$/.test(value)){
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
            category_name: form.category_name,
             school_id: userObj.school_id,
            action: editId !== null ? "UPDATE" : "CREATE"
        };
    
        if (editId !== null) {
            formData.category_id = editId;
        }
    
        try {
            const response = await axios.post(baseUrl + "/category/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            if (editId !== null) {
                toast.success("Record Updated Successfully");
                setForm({
                    category_name: "",
                });
            } else {
                toast.success("Record Added Successfully");
                setForm({
                    category_name: "",
                });
            }
        } catch (error) {
            console.error("Error submitting data:", error.response?.data || error.message);
        
            if (error.response?.data?.error?.includes("Category already exists")) {
                toast.error("Record already exists");
            } else {
                toast.error("Unexpected error occurred");
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
                        <Container fluid>
                            <Card>
                                <Card.Body className="hide-scrollbar">
                                    <Form className="" onSubmit={handleSubmit}>
                                        <Row>
                                            <Col xs={12}>
                                                <h6 className="commonSectionTitle">Category Details</h6>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className='commonInput'>
                                                    <Form.Group>
                                                        <Form.Label>Category   <span className='requiredStar'>*</span></Form.Label>
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            id="category_name"
                                                            value={form.category_name}
                                                            placeholder="Enter Category "
                                                            maxLength={30}
                                                            onChange={handleInputChange}
                                                        />
                                                        <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                            </Col>
                                        </Row>
                                        <div className="d-flex justify-content-between mt-3">
                                            <div>
                                            <Button
                                                type="button"
                                                variant="primary"
                                        o      className="btn-info clearBtn"
                                                onClick={() => setForm({
                                                category_name:"",
                                                is_active:""
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
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Container>
                    </div>
                </div>
            </div>
        
    );
}

export default AddCategory;