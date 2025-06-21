import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import { Container, Row, Col, Card, Button, Form} from "react-bootstrap";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
 
function AddNewSections() {
  const userData = sessionStorage.getItem('user');
  const userObj = userData ? JSON.parse(userData) : {};
  const [editId, setEditId] = useState(null);
  const [classes, setClasses] = useState(null);
  const [academic ,setacademic] = useState(null);
  const [school ,setSchool] = useState(null);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const routeLocation = useLocation();
 
  const [form, setForm] = useState({
    section_id: "",
    section_name: "",
    class_id: "",
    room_number: "",
    school_id:"",
    school_name:"",
    academic_year_id:"",
    academic_year_name:"",
    is_active: "A"
  })
 
  useEffect(() => {
    if (routeLocation.state?.sectionData) {
      const sectionData = routeLocation.state.sectionData;
      setForm(sectionData);
      setEditId(sectionData.section_id);
      window.history.replaceState({}, document.title);
    }
  }, [routeLocation]);
 
  const handleInputChange = (e) => {
    const { id, value} = e.target;
      setForm((prevForm) => ({
        ...prevForm,
        [id]: value,
      }));
   
  };
 

  useEffect(() => {
    fetchClasses();
    fetchAcademicYear();
    fetchschool();
    document.title = "Add New Sections";
  }, []);
 
  const fetchClasses = async () => {
    try {
      const response = await axios.post(baseUrl+"/classes/", {
        action: "READ",
      });
      setClasses(response.data);
     
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
 
  const fetchAcademicYear = async () => {
        try {
          const response = await axios.post(baseUrl+"/AcademicYear/", {
            action: "CURRENTREAD",
          });
          setacademic(response.data);
         
        } catch (error) {
          console.log("Error fetching data:", error);
        }
      };
 
    const fetchschool = async () => {
      try {
        const response = await axios.post(baseUrl+"/schoolmaster/", {
          action: "READ",
        });
        setSchool(response.data);
       
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
 
 
  const handleSubmit = async (e) => {
    e.preventDefault();
  
  
 
    const formData = {
      section_name: form.section_name,
      room_number: form.room_number,
      class_id: form.class_id,
      is_active: form.is_active || "A" ,
      school_id:userObj.school_id,
      academic_year_id:userObj.academic_year_id, 
      action: editId !== null ? 'UPDATE' : 'CREATE'
    };
    if (editId !== null) {
      formData.section_id = editId;
    }
    try {
      const response = await axios.post(baseUrl+"/Sections/", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (editId !== null) {
        toast.success("Record Updated Successfully", { position: "top-right" });
        setEditId(null);
    } else {
        toast.success("Record Added Successfully", { position: "top-right" });
        setForm({
          section_id: "",
          section_name: "",
          class_id: "",
        
          school_name:"",
          room_number: "",
          academic_year_id:"",
     
          is_active: "A"
     
        });
    }
} catch (error) {
    if (error.response) {
        const { status, data } = error.response;
 
        if (status === 400 && data.error === "Record already exists.") {
       
            toast.error("Record already exists.", { position: "top-right" });
 
        }
        else if(status===401){
          toast.error("Room Number is already Assigned")
        }
        else if (status === 500) {
            toast.error("Error submitting data: " + (data.error || error.message), { position: "top-right" });
        } else {
            toast.error("Unexpected error occurred", { position: "top-right" });
        }
    } else {
        console.error("There was an error submitting:", error);
        toast.error("Error submitting data: " + error.message, { position: "top-right" });
    }
}
  };
  return (
   
      <div className='pageMain'>
        <ToastContainer />
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
                            <h6 className='commonSectionTitle'>Academic Section Details</h6>
                          </Col>
                        </Row>
                        <Row>
                          <Col xs={12} md={6} lg={4} xxl={3}>
                            <div className='commonInput'>
                              <Form.Group>
                                <Form.Label> Academic Year <span className='requiredStar'>*</span></Form.Label>
                                <select required  className="form-select" value={form.academic_year_id} onChange={handleInputChange} >
                                  <option value="0" disabled hidden>
                                    {userObj.academic_year_name}
                                  </option>
                                  {(academic || []) && Array.isArray(academic) && academic.map((academicyear) => (
                                    <option key={academicyear.academic_year_id} value={academicyear.academic_year_id}>
                                      {academicyear.academic_year_name}
 
                                    </option>
                                  ))}
                                </select>
                              </Form.Group>
                            </div>
                             {/* <div className='commonInput'>
                                    <Form.Group controlId="academic">
                                        <Form.Label>AcademicYear</Form.Label>
                                        <Form.Select
                                            name="academic_year_name"
                                            id="academic_year_id"
                                            value={filter.academic_year_id}
                                            onChange={(e) => setFilter({ ...filter, academic_year_id: e.target.value })}>
                                            <option value="">Select Academic</option>
                                            {(academic || []).map((academic) => (
                                                <option key={academic.academic_year_id} value={academic.academic_year_id}>
                                                    {academic.academic_year_name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div> */}
                          </Col>
                          <Col xs={12} md={6} lg={4} xxl={3}>
                            <div className='commonInput'>
                            <Form.Group>
                                <Form.Label> Class <span className='requiredStar'>*</span></Form.Label>
                                <select  required className="form-select" id="class_id" value={form.class_id} onChange={handleInputChange}>
                                  <option value="">Select Class</option>
                                  {(classes || []).filter((cls) => cls.is_active === "Active").map((classe) => (
                                    <option key={classe.class_id} value={classe.class_id}>
                                      {classe.class_name}
                                    </option>
                                  ))}
                                </select>
                              </Form.Group>
                            </div>
                          </Col>
                          <Col xs={12} md={6} lg={4} xxl={3}>
                              <div className="commonInput">
                                <Form.Group>
                                  <Form.Label> Section<span className="requiredStar">*</span></Form.Label>
                                  <Form.Control required type="text" id="section_name" value={form.section_name} maxLength={30}   placeholder="Enter Section"
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (/^[a-zA-Z0-9 +]*$/.test(value) && 
                                          (value.match(/\+/g)?.length || 0) <= 1 &&
                                          (value.match(/ /g)?.length || 0) <= 1) { 
                                        handleInputChange(e);
                                      }
                                    }}
                                  />
                                  <Form.Control.Feedback>Required</Form.Control.Feedback>
                                </Form.Group>
                              </div>
                            </Col>
                            <Col xs={12} md={6} lg={4} xxl={3}>
                                <div className='commonInput'>
                                  <Form.Group>
                                    <Form.Label> Room Number <span className='requiredStar'>*</span> </Form.Label>
                                    <Form.Control  required type="text"  id="room_number" placeholder="Enter Room Number" maxLength={30} value={form.room_number}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^[a-zA-Z0-9]*-?[a-zA-Z0-9]*$/.test(value)) {
                                          handleInputChange(e);
                                        }
                                      }}
                                    />
                                    <Form.Control.Feedback>Required</Form.Control.Feedback>
                                  </Form.Group>
                                </div>
                              </Col>
                      </Row>
                      </div>
                      <div className="d-flex justify-content-between mt-3">
                        <div>
                          <Button type="button"  variant="primary" className="btn-info clearBtn"
                            onClick={() => setForm({
                              section_id: "",
                              section_name: "",
                              class_id: "",
                              school_id: "",
                              school_name: "",
                              room_number: "",
                              academic_year_id: "",
                            })}
                          >
                            Reset
                          </Button>
                        </div>
                        <div>
                          <Button  type="button" variant="primary" className="btn-danger secondaryBtn me-2"  onClick={() => window.history.back()}>   Cancel </Button>
                          <Button type="submit" variant="primary" className="btn-success primaryBtn">Submit</Button>
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
export default AddNewSections
 