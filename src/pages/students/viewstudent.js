import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form, Tabs, Tab, OverlayTrigger } from "react-bootstrap";
import Header from "../../components/layout/header/header";
import { ToastContainer, toast } from 'react-toastify';
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import LeftNav from "../../components/layout/leftNav/leftNav";

function ViewStudent() {
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState({
        student_id: "",
        student_first_name: "",
        student_last_name: "",
        dob: "",
        blood_group_id: "",
        blood_group_name: "",
        address: "",
        city: "",
        state: "",
        state_name: "",
        country: "",
        country_name: "",
        date_of_join: "",
        date_of_exit: "",
        createdby: "",
        lastmodifiedby: "",
        image_id: "",
        class_id: "",
        class_name: "",
        section_id: "",
        section_name: "",
        roll_no: "",
        student_class_teacher_id: 0,
        student_class_teacher_name: "",
        aadhar_card_no: "",
        birth_certificate_no: "",
        gender: "",
        permanent_address: "",
        caste: "",
        religion_id: "",
        aadhar_card_upload: "",
        caste_upload: "",
        birth_certificate_upload: "",
        previous_years_tc: "",
        roll_no: "",
        passport_size_photo: "",
        academic_year_id: 0,
        academic_year_name: "",
        admission_number: "",
        mother_tongue: "",
        nationality: "",
        father_occupation: "",
        mother_occupation: "",
        class_last_studied: "",
        class_name: "",
        previous_school_name: "",
        admission_to: "",
        class_name: "",
        first_language_id: "",
        first_language_name: "",
        second_language_id: "",
        second_language_name: "",
        vaccination: "",
        primary_contact: "",
        father_surname: "",
        father_firstname: "",
        mother_surname: "",
        mother_firstname: "",
        father_email: "",
        mother_email: "",
        father_phone_number: "",
        mother_phone_number: "",
        school_id: 0,
        password: "",
        father_aadhar_number: "",
        father_aadhar_upload: "",
        mother_aadhar_number: "",
        mother_aadhar_upload: "",
        sibling1: "",
        sibling2: "",
        sibling3: "",
        third_language_id: "",
        third_language_name: "",
        student_info: "",
        sibling1_name: "",
        sibling1_phone: "",
        sibling1_date: "",
        sibling2_name: "",
        sibling2_phone: "",
        sibling2_date: "",
        sibling3_name: "",
        sibling3_phone: "",
        sibling3_date: "",
        sibling1_id: "",
        sibling2_id: "",
        sibling3_id: "",
        teacher_id: "",
        India: "India",
        first_language_name: "",
        second_language_name: "",
        third_language_name: "",
        previous_school_percentage: "",
        permanent_education_number: "",
        date_of_admission: "",
        mole_1: "",
        mole_2: "",
        residential_proof: "",
        medium: "",
        class_of_leaving_id: "",
        tc_upload: "",
        reason_of_leaving: "",
        date_of_tc_issued: "",
        which_school_student_has_gone: "",
        primary_language_id: "",
        primary_language: "",
        sports_certificate: "",
        blood_group_certificate: "",
        record_sheet_date: "",
        record_sheet_upload: "",
        record_sheet_submitted: "",
        remarks: "",
        apaar_number: "",
        tc_number: "",
    })
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [editId, setEditId] = useState(null);
    const routeLocation = useLocation();


    useEffect(() => {
        if (routeLocation.state?.userData) {
            const userData = routeLocation.state.userData;
            setForm(userData);
            setEditId(userData.student_id);
            window.history.replaceState({}, document.title);
        }
    }, [routeLocation]);

    useEffect(() => {
        fetchStudents(form.student_id || 0);
    }, [form.student_id]);

    const fetchStudents = async () => {
        try {
            const response = await axios.post(baseUrl + "/students/", {
                action: "READ",
            });
            setStudents(response.data);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const formatDate1 = (datetime) => {
        if (!datetime) return "";
        const date = new Date(datetime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}`;
    };

    const navigate = useNavigate();

    return (
        <>
            <div className="pageMain view_student">
                <ToastContainer />
                <LeftNav />
                <div className="pageRight">
                    <div className="pageHead">
                        <Header />
                    </div>
                    <div className="pageBody">
                        <Container fluid>
                            <Card>
                                <Card.Body className="hide-scrollbar" >
                                    <form>
                                        <Row>
                                            <div className="position-relative">
                                                <Button
                                                    variant="primary"
                                                    className="btn-sm position-absolute top-0 end-0 mt-n3 me-2 secondaryBtn ms-5 p-1"
                                                    onClick={() => navigate("/students")}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                            <Row>
                                                <u><b>Student Details</b></u>&nbsp;
                                            </Row>
                                            <Col xs={12} md={6} lg={4} xxl={3}  >
                                                <div className="commonInput">
                                                    <span className="form-label"> Admission Number:</span>
                                                    <span className="">{form.admission_number}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Surname:
                                                    </span>
                                                    <span className="">
                                                        {form.student_last_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        First Name:
                                                    </span>
                                                    <span className="">
                                                        {form.student_first_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        DOB:
                                                    </span>
                                                    <span className="">
                                                        {formatDate1(form.dob)}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        DOJ:
                                                    </span>
                                                    <span className="">
                                                        {formatDate1(form.date_of_join)}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Gender:
                                                    </span>
                                                    <span className="">
                                                        {form.gender}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Primary Contact:
                                                    </span>
                                                    <span className="">
                                                        {form.primary_contact}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Blood Group:
                                                    </span>
                                                    <span className="">
                                                        {form.blood_group_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Vaccination:
                                                    </span>
                                                    <span className="">
                                                        {form.vaccination}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        DOE:
                                                    </span>
                                                    <span className="">
                                                        {form.date_of_exit}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Row>
                                                <u><b>Class Details</b></u>&nbsp;
                                            </Row>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Academic Year:
                                                    </span>
                                                    <span className="">
                                                        {userObj.academic_year_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">Date of Admission:</span>
                                                    <span className="">{formatDate1(form.date_of_admission)}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Admission To:
                                                    </span>
                                                    <span className="">
                                                        {form.next_joining_class_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Class:
                                                    </span>
                                                    <span className="">
                                                        {form.class_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Section:
                                                    </span>
                                                    <span className="">
                                                        {form.section_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Class Teacher:
                                                    </span>
                                                    <span className="">
                                                        {form.student_class_teacher_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Roll Number:
                                                    </span>
                                                    <span className="">
                                                        {form.roll_no}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">Class of Leaving:</span>
                                                    <span className="">{form.class_of_leaving}</span>
                                                </div>
                                            </Col>
                                            <Row>
                                                <u><b>ID Details</b></u>&nbsp;
                                            </Row>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Aadhar Number:
                                                    </span>
                                                    <span className="">
                                                        {form.aadhar_card_no}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Caste:
                                                    </span>
                                                    <span className="">
                                                        {form.caste}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Birth Certificate Number:
                                                    </span>
                                                    <span className="">
                                                        {form.birth_certificate_no}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Nationality:
                                                    </span>
                                                    <span className="">
                                                        {form.nationality}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Religion:
                                                    </span>
                                                    <span className="">
                                                        {form.religion_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">Mother Tongue:</span>
                                                    <span className="">{form.mother_tongue}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">TC Number:</span>
                                                    <span className="">{form.tc_number}</span>
                                                </div>
                                            </Col>
                                            <Row>
                                                <u><b>Previous School</b></u>&nbsp;
                                            </Row>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Previous School:
                                                    </span>
                                                    <span className="">
                                                        {form.previous_school_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Previous Class:
                                                    </span>
                                                    <span className="">
                                                        {form.class_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        First Language:
                                                    </span>
                                                    <span className="">
                                                        {form.first_language_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Second Language:
                                                    </span>
                                                    <span className="">
                                                        {form.second_language_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Third Language:
                                                    </span>
                                                    <span className="">
                                                        {form.third_language_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        PEN:
                                                    </span>
                                                    <span className="">
                                                        {form.permanent_education_number}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Previous School Percentage:
                                                    </span>
                                                    <span className="">
                                                        {form.previous_school_percentage}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Row>
                                                <u><b>Father Details</b></u>&nbsp;
                                            </Row>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Father Name:
                                                    </span>
                                                    <span className="">
                                                        {form.father_firstname + " " + form.father_surname}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Father Contact:
                                                    </span>
                                                    <span className="">
                                                        {form.father_phone_number}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Father Email:
                                                    </span>
                                                    <span className="">
                                                        {form.father_email}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Father Aadhar Number:
                                                    </span>
                                                    <span className="">
                                                        {form.father_aadhar_number}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Father Occupation:
                                                    </span>
                                                    <span className="">
                                                        {form.father_occupation}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Row>
                                                <u><b>Mother Details</b></u>&nbsp;
                                            </Row>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Mother Name:
                                                    </span>
                                                    <span className="">
                                                        {form.mother_firstname + " " + form.mother_surname}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Mother Contact:
                                                    </span>
                                                    <span className="">
                                                        {form.mother_phone_number}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Mother Email:
                                                    </span>
                                                    <span className="">
                                                        {form.mother_email}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Mother Aadhar Number:
                                                    </span>
                                                    <span className="">
                                                        {form.mother_aadhar_number}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Mother Occupation:
                                                    </span>
                                                    <span className="">
                                                        {form.mother_occupation}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Row>
                                                <u><b>Guardian Details</b></u>&nbsp;
                                            </Row>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Guardain Name:
                                                    </span>
                                                    <span className="">
                                                        {form.guardian_firstname + " " + form.guardian_surname}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Guardain Contact:
                                                    </span>
                                                    <span className="">
                                                        {form.guardian_phone_number}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Guardain Email:
                                                    </span>
                                                    <span className="">
                                                        {form.guardian_email}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Guardain Aadhar Number:
                                                    </span>
                                                    <span className="">
                                                        {form.guardian_aadhar_number}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Guardain Occupation:
                                                    </span>
                                                    <span className="">
                                                        {form.guardian_occupation}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Row>
                                                <u><b>Location Details</b></u>&nbsp;
                                            </Row>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        City:
                                                    </span>
                                                    <span className="">
                                                        {form.city}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        State:
                                                    </span>
                                                    <span className="">
                                                        {form.state_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Country:
                                                    </span>
                                                    <span className="">
                                                        {form.country_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Address:
                                                    </span>
                                                    <span className="">
                                                        {form.address}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Permanent Address:
                                                    </span>
                                                    <span className="">
                                                        {form.permanent_address}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Row>
                                                <u><b>Sibling Details</b></u>&nbsp;
                                            </Row>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Sibling 1:
                                                    </span>
                                                    <span className="">
                                                        {form.sibling1_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Sibling 2:
                                                    </span>
                                                    <span className="">
                                                        {form.sibling2_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">
                                                        Sibling 3:
                                                    </span>
                                                    <span className="">
                                                        {form.sibling3_name}
                                                    </span>
                                                </div>
                                            </Col>
                                            <Row>
                                                <u><b>Other Details</b></u>&nbsp;
                                            </Row>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">Reason of Leaving:</span>
                                                    <span className="">{form.reason_of_leaving}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">Date of TC Issueed:</span>
                                                    <span className="">{formatDate1(form.date_of_tc_issued)}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">Primary Language:</span>
                                                    <span className="">{form.primary_language}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">Record Sheet Date:</span>
                                                    <span className="">{formatDate1(form.record_sheet_date)}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">APAAR Number:</span>
                                                    <span className="">{form.apaar_number}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">Record Sheet Submitted:</span>
                                                    <span className="">{form.record_sheet_submitted}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="commonInput">
                                                    <span className="form-label">Remarks:</span>
                                                    <span className="">{form.remarks}</span>
                                                </div>
                                            </Col>
                                        </Row>
                                    </form>
                                </Card.Body>
                            </Card>
                        </Container>
                    </div>
                </div>
            </div>
        </>
    );
};
export default ViewStudent;