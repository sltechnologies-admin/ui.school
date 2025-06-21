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

const AddTimeTable = () => {
    const routeLocation = useLocation();
    const [editId, setEditId] = useState(null);
    const [academic, setAcademic] = useState([]);
    const [sections, setSection] = useState([]);
    const [classes, setClasses] = useState([]);
    const [week, setWeeks] = useState([]);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};


    const [form, setForm] = useState({
        period_name: "",
        week_day_id: "",
        week_day_name:"",
        period_order: "",
        start_time: "",
        end_time: "",
        class_id: "",
        class_name: "",
        section_id:"",
        section_name:"",
        academic_year_id:userObj.academic_year_id,
        academic_year_name: "",
       school_id:userObj.school_id
    });

    const fetchClasses = async () => {
        try {
            const response = await axios.post(baseUrl + "/classes/", {
                action: "READ",school_id:userObj.school_id
            });
            setClasses(response.data)
        } catch (error) {
            console.log("Error fetching students name:", error)
       
        }
    };
    const fetchSections = async (class_id) => {
        try {
            const response = await axios.post(baseUrl + "/Sections/", {
                action: "READ",school_id:userObj.school_id,class_id:class_id
            });
            setSection(response.data)
        } catch (error) {
            console.log("Error fetching students name:", error)
        
        }
    };

    const fetchAcademicYears = async () => {
        try {
            const response = await axios.post(baseUrl + "/AcademicYear/", {
                action: "CURRENTREAD",school_id:userObj.school_id
            });
            setAcademic(response.data)
        } catch (error) {
            console.log("Error fetching students name:", error)
         
        }
    };
    const fetchWeekdayData = async () => {
        try {
            const response = await axios.post(baseUrl + "/weekday/", {
                action: "READ"
            });
            setWeeks(response.data)
        } catch (error) {
            console.log("Error fetching weekday :", error)
           
        }
    };
    useEffect(() => {
        fetchClasses();
        fetchSections();
        fetchAcademicYears();
        fetchWeekdayData();
    }, []);

    useEffect(() => {
        if (routeLocation.state?.timetableData) {
            const timetableData = routeLocation.state.timetableData;
            // console.log(timetableData);
            document.title = "TimeTable";
            setForm(timetableData);
            setEditId(timetableData.period_id);
            window.history.replaceState({}, document.title);
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
            academic_year_id: form.academic_year_id,
            academic_year_name:form.academic_year_name,
            class_id: form.class_id,
            class_name:form.class_name,
            section_id: form.section_id,
            section_name:form.section_name,
            week_day_id:form.week_day_id,
            week_day_name:form.week_day_name,
            period_name:form.period_name,
            period_order:form.period_order,
            start_time:form.start_time,
            end_time:form.end_time,
            action: editId !== null ? 'UPDATE' : 'CREATE'
        };
      
    
        if (editId !== null) {
            formData.period_id = editId;
        }
    
    
        try {
            const response = await axios.post(baseUrl + "/timetable/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
          

            if (editId !== null) {
                toast.success("Record updated successfully");
                setEditId(null);
            } else {
                toast.success("Record added successfully");
            }
    
            // Clear the form data only if the submission was successful
            setForm({
                academic_year_id: "",
                class_id: "",
                section_id: "",
                week_day_id: "",
                period_name: "",
                period_order:"",
                start_time:"",
                end_time:""
            });
    
        } 
         catch (error)
                {
                    if (error.response) {
                        const { status, data } = error.response;
            
                        // duplicate records 
                        if (status === 400) {
                            if (data.error === "Record already exists.") {
                                toast.error("Record already exists.", { position: "top-right" });
                            } 
                            else if (data.error === ".") {
                                toast.error("A period with the same period name already exists .", { position: "top-right" });
                            }
                            else if (data.error === ".") {
                                toast.error("A period with the same period order already exists .", { position: "top-right" });
                            }
                             else {
                            
                                toast.error("Another period already exists at this time for class_id: " , { position: "top-right" });
                            }
                        }
                       
                        else if (status === 500) 
                        {
                            toast.error("Error submitting data: " + (data.error || error.message), { position: "top-right" });
                        }
                        else
                        {

                            toast.error("Unexpected error occurred", { position: "top-right" });
                        }
                    } 
                    else 
                    {
                    
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
                                                        <h6 className='commonSectionTitle'>Time Table</h6>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group>
                                                                <Form.Label>Academic Year<span className='requiredStar'>*</span></Form.Label>
                                                                <select
                                                                    className="form-select"
                                                                    id="academic_year_id"
                                                                    required
                                                                    value={form.academic_year_id}
                                                                    onChange={handleInputChange}

                                                                >
                                                                   <option value="0" disabled hidden>
                                        {userObj.academic_year_name}
                                    </option>
 
                                                                    {(academic || []).map((academic) => (
                                                                        <option key={academic.academic_year_id} value={academic.academic_year_id}>
                                                                            {academic.academic_year_name}
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
                                                                    Class<span className="requiredStar">*</span>
                                                                </Form.Label>
                                                                <select
                                                                    className="form-select"
                                                                    required
                                                                    id="class_id"
                                                                    value={form.class_id}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="">Select Class</option>
                                                                    {(classes||[]).map((classes) => (
                                                                        <option key={classes.class_id} value={classes.class_id}>
                                                                            {classes.class_name}
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
                                                                    Section<span className="requiredStar">*</span>
                                                                </Form.Label>
                                                                <select
                                                                    className="form-select"
                                                                    required
                                                                    id="section_id"
                                                                    value={form.section_id}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="">Select Section</option>
                                                                    {(sections|| []).map((sections) => (
                                                                        <option key={sections.section_id} value={sections.section_id}>
                                                                            {sections.section_name}
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
                                                                    Week Day<span className="requiredStar">*</span>
                                                                </Form.Label>
                                                                <select
                                                                    className="form-select"
                                                                    required
                                                                    id="week_day_id"
                                                                    value={form.week_day_id}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="">Select WeekDay</option>
                                                                    {(week||[]).map((week) => (
                                                                        <option key={week.week_day_id} value={week.week_day_id}>
                                                                            {week.week_day_name}
                                                                        </option>
                                                                    ))}
                                                                </select>

                                                            </Form.Group>
                                                        </div>
                                                    </Col>

                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className='commonInput'>
                                                    <Form.Group>
                                                        <Form.Label>Period Name <span className='requiredStar'>*</span></Form.Label>
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            id="period_name"
                                                            value={form.period_name}
                                                            placeholder="Enter Period Name"
                                                            onChange={handleInputChange}
                                                        />
                                                    </Form.Group>
                                                </div>
                                             </Col>
                                            
                                             <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className='commonInput'>
                                                    <Form.Group>
                                                        <Form.Label>Period Order<span className='requiredStar'>*</span></Form.Label>
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            id="period_order"
                                                            value={form.period_order}
                                                            placeholder="Enter Period order"
                                                            onChange={handleInputChange}
                                                        />
                                                    </Form.Group>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className='commonInput'>
                                                    <Form.Group>
                                                        <Form.Label>Start Time<span className='requiredStar'>*</span></Form.Label>
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            id="start_time"
                                                            value={form.start_time}
                                                            placeholder="Enter Start time"
                                                            onChange={handleInputChange}
                                                        />
                                                    </Form.Group>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className='commonInput'>
                                                    <Form.Group>
                                                        <Form.Label>End Time<span className='requiredStar'>*</span></Form.Label>
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            id="end_time"
                                                            value={form.end_time}
                                                            placeholder="Enter end time"
                                                            onChange={handleInputChange}
                                                        />
                                                    </Form.Group>
                                                </div>
                                            </Col>
                                         </Row>
                                         </div>
                                            {/* <Button type="submit" variant="primary" className='w-100 commonBtn' >Submit</Button> */}
                                            <div className="d-flex justify-content-end mt-3">
                                            <Button type="submit" variant="primary" className='btn-success me-2'>
                                                  Submit
                                            </Button>

                                                <Button
                                                    type="button"
                                                    variant="primary"
                                                     className='btn-info me-2'
                                                    onClick={() => setForm({
                                                       
                                                        academic_year_id: "",
                                                        class_id: "",
                                                        section_id: "",
                                                        week_day_id: "",
                                                        period_name:"",
                                                        period_order: "",
                                                        start_time: "",
                                                        end_time:""
                                                    })}
                                                >
                                                    Reset
                                                </Button>


                                                <Button
                                                    type="button"
                                                    variant="primary"
                                                    className='btn-danger'
                                                  onClick={() => window.history.back()}
                                                 >
                                                Cancel
                                                 </Button>
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
export default AddTimeTable;
