import React, { useState,useEffect,useRef } from "react";

//Gadgets Import
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import { Image } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";

//Icons 
import { MdEdit } from "react-icons/md";
import { IoMdCamera } from "react-icons/io";

//Css
//import '../../students/addeditStudent/addeditStudent.css';
import { CardFooter } from 'react-bootstrap';


//Components
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import { toast, ToastContainer } from "react-toastify";

const Addacademicyear = () => {
    const userData = sessionStorage.getItem('user');
  const userObj = JSON.parse(userData);

    const navigate = useNavigate();
    const [academicyear, setacademicyear] = useState([]);
   
    const [image, setImage] = useState(null);
    const [editId,setEditId] = useState(null);
    const [showParentDetails, setShowParentDetails] = useState(false);
    const [school,setschool] = useState([]);
    const [months,setMonths] = useState([]);
    
    const [years,setYears] = useState([]);
    
    const formRef = useRef(null);
    const routeLocation = useLocation();
    
    const [form, setForm] = useState({
        academic_year_id:"",
        academic_year_name: "",
        start_month: "",
        start_year: "",
        end_month: "",
        end_year: "",
        is_current_year: "",
        createdby:"",
        lastmodifiedby:"",
        school_id:"",
        school_name:"",
        is_active:""
      
      });
     
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    
   

    useEffect(() => {
         document.title = "Add Academic";
        if (routeLocation.state?.userData) { 
          const userData = routeLocation.state.userData;
          setForm(userData);
          setEditId(userData.academic_year_id);
          window.history.replaceState({}, document.title);
        }
      }, [routeLocation]); 

            useEffect(() => {    
              fetchschool();
              fetchMonths();
            //   fetchEndMonths();
            //   fetchEndYears();
              fetchYears();
            }, []);
      


       const fetchschool = async () => {
              try {
                  const response = await axios.post(baseUrl + "/schoolmaster/", {
                      action: "READ"
                  });
                  setschool(response.data);
                 // console.log(response.data);
              } catch (error) {
                  console.error("Error fetching school:", error);
      
              }
          };

          const fetchMonths = async () => {
            try {
                const response = await axios.post(baseUrl + "/months/", { action: "READ" });
                setMonths(response.data);
    
                // console.log(response.data);
            } catch (error) {
                 console.log("Error fetching data:", error);
    
    
            }
        };

        // const fetchEndMonths = async () => {
        //     try {
        //         const response = await axios.post(baseUrl + "/months/", { action: "READ" });
        //         setEndMonths(response.data);
    
        //         // console.log(response.data);
        //     } catch (error) {
        //          console.log("Error fetching data:", error);
    
    
        //     }
        // };

        const fetchYears = async () => {
            try {
                const response = await axios.post(baseUrl + "/years/", { action: "READ" });
                setYears(response.data);
    
                // console.log(response.data);
            } catch (error) {
                 console.log("Error fetching data:", error);
    
    
            }
        };

        // const fetchEndYears = async () => {
        //     try {
        //         const response = await axios.post(baseUrl + "/years/", { action: "READ" });
        //         setEndYears(response.data);
    
        //         // console.log(response.data);
        //     } catch (error) {
        //          console.log("Error fetching data:", error);
    
    
        //     }
        // };


    

    const handleInputChange = (e) => {
        const { id, value } = e.target;
    
        const numericFields = ["start_year", "end_year", "start_month", "end_month","academic_year_name"];
        
        if (numericFields.includes(id)) {
            let newValue = value.trim(); 
    
            if (id === "start_month" || id === "end_month") {
                // Allow only numbers 01 to 12 (with optional leading zero for single digits)
                if (/^(0?[1-9]|1[0-2])?$/.test(newValue)) {
                    setForm((prevForm) => ({
                        ...prevForm,
                        [id]: newValue,
                    }));
                }
                return; 
            }

            if (id === "start_year" || id === "end_year") {
                // Allow only 4-digit numbers
                if (/^\d{0,4}$/.test(newValue)) {  // Ensures max 4 digits
                    setForm((prevForm) => ({
                        ...prevForm,
                        [id]: newValue,
                    }));
                
                }
                return;
            }
        
    
            if (id === "academic_year_name") {
                let newValue = value; 
                // Allow only numbers, hyphens, and spaces (max 15 characters)
                if (/^[0-9-\s]{0,30}$/.test(newValue)) {
                    setForm((prevForm) => ({
                        ...prevForm,
                        [id]: newValue.replace(/\s+/g, ' '), // Replaces multiple spaces with a single space
                    }));
                }
                return;
            }
    
            // For other numeric fields (fallback case)
            if (/^\d*$/.test(newValue)) {
                setForm((prevForm) => ({
                    ...prevForm,
                    [id]: newValue,
                }));
            }
            return;
        }
    
       
        setForm((prevForm) => ({
            ...prevForm,
            [id]: id === "is_current_year" ? value.toString() : value,
        }));
    };
    
    

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Prepare form data
        const formData = {
            academic_year_name: form.academic_year_name,
            start_month: parseInt(form.start_month, 10) || 0,
            start_year: parseInt(form.start_year, 10) || 0,
            end_month: parseInt(form.end_month, 10) || 0,
            end_year: parseInt(form.end_year, 10) || 0,
            is_current_year: form.is_current_year ? form.is_current_year.toString().substring(0, 1) : "N", 
            createdby: form.createdby,
            lastmodifiedby: form.lastmodifiedby,
            school_id: userObj.school_id,
            is_active: form.is_active,
            action: editId !== null ? "UPDATE" : "CREATE",
        };
        
    
        if (editId !== null) {
            formData.academic_year_id = editId; 
        }
    
        // console.log("Submitting Form Data:", formData);
        // console.log(formData);
    
        try {
            const response = await axios.post(baseUrl + "/AcademicYear", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
           // console.log("API Response:", response.data);
            //toast.success(editId !== null ? "Record Updated Successfully" : "Record Added Successfully");
            setTimeout(() => {
                navigate("/studentacademicyear", {
                    state: {
                        editId: editId,
                        toastMessage: editId !== null ? "Record Updated Successfully" : "Record Added Successfully"
                    }
                });
            }, 1000);
            
            setForm({
                academic_year_name: "",
                start_month: "",
                start_year: "",
                end_month: "",
                end_year: "",
                is_current_year: "",
                createdby: "",
                lastmodifiedby: "",
                school_id:"",
                school_name:"",
                is_active:""
            });
    
            
            if (editId !== null) setEditId(null);
    
        } catch (error) {
            console.error("Error submitting data:", error.response?.data || error.message);
        
            if (error.response) {
                const { status, data } = error.response;
        
                if (status === 400) {
                    if (data.message === "Record Already Exists.") {
                        toast.error("Record Already Exists");
                    } else if (data.message === "Only One academic year can be marked as current for a school.") {
                        toast.error("Cannot create an 'N' record when a 'Y' record already exists!");
                    } else {
                        toast.error(data.message || "Invalid request!");
                    }
                } else if (status === 401) {
                    toast.error("Only one academic year can be marked as current for a school");
                } else if (status === 500) {
                    toast.error("Internal server error. Please try again later.");
                } else {
                    toast.error("An unknown error occurred.");
                }
            } else {
                toast.error("Failed to connect to the server. Please try again!");
            }
        }
        
    };
    
    const filteredEndYears = years.filter(
        (year) => parseInt(year.year_id) > parseInt(form.start_year)
      );
    
    return (
        <>
        
       
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
                                    {/* <Card.Header>

                                    </Card.Header> */}
                                    <Card.Body>
                                        <form onSubmit={handleSubmit}>
                                           
                                            <div className=''>
                                                <Row>
                                                    <Col xs={12}>
                                                        <h6 className='commonSectionTitle '> Academic Year Details</h6>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    


                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group>
                                                                <Form.Label>Academic Year Name <span className='requiredStar'>*</span></Form.Label>
                                                                <Form.Control
                                                                    required
                                                                    type="text"
                                                                    id="academic_year_name"
                                                                    placeholder="Academic Year Name"
                                                                    value={form.academic_year_name}
                                                                    onChange={handleInputChange}
                                                                    maxlength={15}
                                                                />
                                                                <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                <div className="commonInput">
                                    <Form.Group>
                                    <Form.Label>
                                    Start Month<span className="requiredStar">*</span>
                                    </Form.Label>
                                    <select
                                    required
                                        className="form-select"
                                        id="start_month"
                                        value={form.start_month}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Start Month </option>
                                        {(months || []).map((month) => (
                                        <option key={month.month_id} value={month.month_id}>
                                            {month.month_name}
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
                                    Start Year<span className="requiredStar">*</span>
                                    </Form.Label>
                                    <select
                                    required
                                        className="form-select"
                                        id="start_year"
                                        value={form.start_year}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Start Year </option>
                                        {(years || []).map((year) => (
                                        <option key={year.year_id} value={year.year_id}>
                                            {year.year_name}
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
                                    End Month<span className="requiredStar">*</span>
                                    </Form.Label>
                                    <select
                                    required
                                        className="form-select"
                                        id="end_month"
                                        value={form.end_month}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select End Month </option>
                                        {(months || []).map((month) => (
                                        <option key={month.month_id} value={month.month_id}>
                                            {month.month_name}
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
                                    End Year<span className="requiredStar">*</span>
                                    </Form.Label>
                                    <select
                                        required
                                        className="form-select"
                                        id="end_year"
                                        value={form.end_year}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select End Year </option>
                                        {filteredEndYears.map((year) => (
                                            <option key={year.year_id} value={year.year_id}>
                                                {year.year_name}
                                            </option>
                                        ))}
                                    </select>
                                    </Form.Group>
                                </div>
                             </Col>

                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                    <Form.Group>
                                                        <Form.Label>Is Current Year <span className='requiredStar'>*</span></Form.Label>
                                                        <Form.Select
                                                            required
                                                            id="is_current_year"
                                                            name="is_current_year"
                                                            value={form.is_current_year }
                                                            onChange={handleInputChange}
                                                        >
                                                            <option value="">Select</option>
                                                            <option value="Yes">Yes</option>
                                                            <option value="No">No</option>
                                                        </Form.Select>
                                                        <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                    </Form.Group>
                                                    </div>
                                                    </Col>

                                                    {/* <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group>
                                                                <Form.Label>School</Form.Label>
                                                                <select
                                                                    className="form-select"
                                                                    id="school_id"
                                                                    value={form.school_id}
                                                                    onChange={handleInputChange}
                                                                // required
                                                                >
                                                                    <option value="">Select school name</option>
                                                                    {school.map((school, index) => (
                                                                        <option key={index} value={school.school_id}>
                                                                            {school.school_name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                            </Form.Group>
                                                        </div>
                                                    </Col> */}

 
                                                </Row>
                                            </div>
                                           
                                            <div className="d-flex justify-content-between mt-3">
                                                    <div>
                                                        <Button
                                                            type="button"
                                                            variant="primary"
                                                            className="btn-info clearBtn"
                                                            onClick={() => setForm({
                                                                academic_year_name: "",
                                                                start_month: "",
                                                                start_year: "",
                                                                end_month: "",
                                                                end_year: "",
                                                                is_current_year: "",
                                                                createdby: "",
                                                                lastmodifiedby: "",
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
        
        </>
    );
};

export default Addacademicyear;
