import React,{ useState,useEffect } from 'react'
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
        subject_id:"",
        subject_name: "",
        is_active: "A"
    });
    
    useEffect(() => {
        if (routeLocation.state?.subjectData) {
          const subjectData = routeLocation.state.subjectData;
          setForm(subjectData);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
   
        const formData = {
            subject_name: form.subject_name,
            is_active: form.is_active || "A",
             school_id:userObj.school_id,
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
          });
      
        } catch (error) {
           console.log("Full error object:", error);
      
          if (error.response) {
               console.log("Error response:", error.response);
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

                                            
                                        </Row>
                                        <div className="d-flex justify-content-between mt-3">
                                        <div>
                                        <Button
                                            type="button"
                                            variant="primary"
                                            className="btn-info clearBtn"
                                            onClick={() => setForm({
                                                subject_id:"",
                                                subject_name: "",
                                                isactive: "A",
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