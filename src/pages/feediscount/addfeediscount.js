import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";

const Addfeediscount = () => {
    const [academicyear, setacademicyear] = useState([]);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [classes, setClasses] = useState([])
    const [items, setitems] = useState([])
    // const [combination, setcombination] = useState([]);
    const [editId, setEditId] = useState(null);
    const [discount, setdiscount] = useState([]);
    const [students, setStudents] = useState([]);
    const routeLocation = useLocation();
    const userData = sessionStorage.getItem('user');
    const userObj = JSON.parse(userData);
    // const userIdStr = userObj.school_id;
    // const userId = parseInt(userIdStr, 10);


    const [form, setForm] = useState({
        fees_item_id: "",
        fees_item_name: "",
        academic_year_id: "",
        academic_year_name: "",
        class_id: "",
        class_name: "",
        item_id: "",
        item_name: "",
        student_id: "",
        student_name: "",
        school_id: "",
        discount: "",
    })



    const fetchitemlist = async () => {
        try {
            const response = await axios.post(baseUrl + "/Feeitemslist/", {
                action: "READ",
                school_id:userObj.school_id
            });
            setitems(response.data)

        }
        catch (error) {
            console.error("Error fetching academic data:", error);
        }
    };

    const fetchacademicyear = async () => {
        try {
            const response = await axios.post(baseUrl + "/AcademicYear/", {
                action: "READ",
                school_id:userObj.school_id
            });
            setacademicyear(response.data)
            //console.log(response.data);
        }
        catch (error) {
            console.error("Error fetching academic data:", error);
        }
    };


    const fetchclasses = async () => {
        try {
            const response = await axios.post(baseUrl + "/classes/", {
                action: "READ",
                school_id:userObj.school_id
            });

            setClasses(response.data)

        }
        catch (error) {
            console.error("Error fetching academic data:", error);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await axios.post(baseUrl + "/students/", {
                action: "READ",
                school_id:userObj.school_id
            });
            setStudents(response.data);
            //console.log(response.data);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const fetchfeediscount = async () => {
        try {
            const response = await axios.post(baseUrl + "/feediscount/", {
                action: "READ"
            });
            setdiscount(response.data);
            //console.log(response.data);
        } catch (error) {
            console.error("Error fetching discount:", error);

        }
    };

    // const fetchfeeitemcombinationname = async () => {
    //     try {
    //         const response = await axios.post(baseUrl + "/feeitemcombination/", {
    //             action: "READ"
    //         });
    //         setcombination(response.data);
    //         //console.log(response.data);
    //     } catch (error) {
    //         console.error("Error fetching feeitemcombinationname:", error);

    //     }
    // };

    // const handleAcademicYearChange = (e) => {
    //     const selectedYearId = e.target.value;

    //     // Update form state
    //     setForm((prevForm) => ({
    //         ...prevForm,
    //         academic_year_id: selectedYearId,
    //         class_id: "", // Reset class selection
    //     }));


    //     if (selectedYearId) {
    //         fetchclasses(selectedYearId);
    //     } else {
    //         setClasses([]); 
    //     }
    // };

    const handleInputChange = (e) => {
        const { id, value } = e.target;

        if (id === "discount") {
            // Allow only numeric values
            if (/^\d*$/.test(value)) {
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

    useEffect(() => {
        document.title = "Add Fee Discount";
        if (routeLocation.state?.discountsData) {
            const discountsData = routeLocation.state.discountsData;
           // console.log("Setting form data:", discountsData);
            setForm(discountsData);
            setEditId(discountsData.fee_discount_id);
            window.history.replaceState({}, document.title);
        }
    }, [routeLocation]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            fees_item_id: form.fees_item_id || 0,
            student_id: form.student_id || 0,
            discount: form.discount,
            academic_year_id: form.academic_year_id || 0,
            class_id: form.class_id,
            item_id: form.item_id,
            school_id: userObj.school_id,
            action: editId !== null ? "UPDATE" : "CREATE"
        };
       
        if (editId !== null) {
            formData.fee_discount_id = editId;
        }
       // console.log("edit:"+formData);


        try {
            const response = await axios.post(baseUrl + "/feediscount/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
           // console.log("API Response:", response.data);

            if (editId !== null) {
                toast.success("Record updated successfully");
                setEditId(null);
            } else {
                toast.success("Record added successfully");
                setForm({

                        fees_item_id: 0,
                        student_id: "",
                        school_id: "",
                        class_id: "",
                        class_name: "",
                        item_id: "",
                        item_name: "",
                        academic_year_id: "",
                        academic_year_name: "",
                        discount: "",
                    })
                
            }
        }  catch (error) {
            if (error.response) {
                const { status, data } = error.response;
       
                if (status === 400 && data.error === "Record already exists for Fees Item") {
                    toast.error("Record already exists for Fees Item", { position: "top-right" });
                } else {
                    toast.error("Unexpected error occurred", { position: "top-right" });
                }
            } else {
                console.error("There was an error submitting:", error);
                toast.error("Error submitting data: " + error.message, { position: "top-right" });
            }
        }
        // setForm({

        //     fees_item_id: 0,
        //     student_id: 0,
        //     school_id: 0,
        //     class_id: "",
        //     class_name: "",
        //     item_id: "",
        //     item_name: "",
        //     academic_year_id: "",
        //     academic_year_name: "",
        //     discount: "",
        // })
    };



    useEffect(() => {
        fetchitemlist();
        fetchclasses();
        fetchfeediscount();
        fetchacademicyear();
        fetchStudents();
        //  fetchfeeitemcombinationname();
    }, []);


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
                                        <form className="" onSubmit={handleSubmit} >

                                            <div className=''>
                                                <Row>
                                                    <Col xs={12}>
                                                        <h6 className='commonSectionTitle'>Fee Discount </h6>
                                                    </Col>
                                                </Row>
                                                <Row>

                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group controlId="combined_name">
                                                                <Form.Label>Academic Year  Name</Form.Label>
                                                                <Form.Select
                                                                    required
                                                                    id="academic_year_id"
                                                                    name="academic_year_name"
                                                                    value={form.academic_year_id}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="">Select Academic Year  Name</option>
                                                                    {(academicyear || []).map((dept) => (
                                                                        <option key={dept.academic_year_id} value={dept.academic_year_id}>{dept.academic_year_name}</option>
                                                                    ))}
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </div>
                                                    </Col>



                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group controlId="combined_name">
                                                                <Form.Label>Class Name</Form.Label>
                                                                <Form.Select
                                                                    required
                                                                    id="class_id"
                                                                    // name="class_name"
                                                                    value={form.class_id}
                                                                    onChange={handleInputChange}
                                                                // onChange={(e) => setForm({...form,class_id: e.target.value})}
                                                                >
                                                                    <option value="">Select Class Name</option>
                                                                    {(classes || []).map((dept) => (
                                                                        <option key={dept.class_id} value={dept.class_id}>{dept.class_name}</option>
                                                                    ))}
                                                                    {/* {classes &&
                                                                        classes.length>0 &&
                                                                        classes.map((dept) => (
                                                                            <option key={dept.class_id} value={dept.class_id}>{dept.class_name}</option>
                                                                        ))} */}
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </div>
                                                    </Col>


                                                    {/* <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group controlId="combined_name">
                                                                <Form.Label>Fee Item Name</Form.Label>
                                                                <Form.Select
                                                                    required
                                                                    id="fees_item_id"
                                                                    name="combined_name"
                                                                    value={form.fees_item_id}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="">Select Fee Item  Name</option>
                                                                    {combination.map((dept) => (
                                                                        <option key={dept.fees_item_id} value={dept.fees_item_id}>{dept.combined_name}</option>
                                                                    ))}
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </div>
                                                    </Col> */}

                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group controlId="combined_name">
                                                                <Form.Label>Item Name</Form.Label>
                                                                <Form.Select
                                                                    required
                                                                    id="item_id"
                                                                    // name="item"
                                                                    value={form.item_id}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="">Select Item Name</option>
                                                                    {(items || []).map((dept) => (
                                                                        <option key={dept.item_id} value={dept.item_id}>{dept.item}</option>
                                                                    ))}
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </div>
                                                    </Col>

                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group controlId="student_name">
                                                                <Form.Label>Student  Name</Form.Label>
                                                                <Form.Select
                                                                    required
                                                                    id="student_id"
                                                                    // name="student_name"
                                                                    value={form.student_id}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="">Select Student  Name</option>
                                                                    {(students || []).map((dept) => (
                                                                        <option key={dept.student_id} value={dept.student_id}>{dept.student_first_name + " " + dept.student_last_name}</option>
                                                                    ))}
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </div>
                                                    </Col>

                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group>
                                                                <Form.Label> Discount <span className='requiredStar'>*</span></Form.Label>
                                                                <Form.Control
                                                                    required
                                                                    type="text"
                                                                    id="discount"
                                                                    value={form.discount}
                                                                    placeholder="Enter discount"
                                                                    onChange={handleInputChange}
                                                                />
                                                                <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                            </Form.Group>
                                                        </div>
                                                    </Col>

                                                </Row>
                                            </div>
                                            {/* <Button type="submit" variant="primary" className='w-100 commonBtn'>Submit</Button> */}

                                            <div className="d-flex justify-content-between mt-3">
                                                <div>
                                                    <Button
                                                        type="button"
                                                        variant="primary"
                                                        className="btn-info clearBtn"
                                                        onClick={() => setForm({
                                                            fees_item_id: "",
                                                            fees_item_name: "",
                                                            student_id: "",
                                                            academic_year_id: "",
                                                            class_id: "",
                                                            item_id: "",
                                                            school_id: 0,
                                                            discount: "",
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

export default Addfeediscount
