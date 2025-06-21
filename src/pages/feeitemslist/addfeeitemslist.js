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
import { useFeeModuleAccess } from "../hooks/useFeeModuleAccess";
import { fetchDataRead } from "../../Utility";

const AddFeeitemslist = () => {
    const userData = sessionStorage.getItem('user');
    const userObj = JSON.parse(userData);
    const [feeCategories, setFeeCategories] = useState([]);
    const [editId, setEditId] = useState(null);
    const [academicyears, setAcademicyears] = useState([]);

    const routeLocation = useLocation();

    const [form, setForm] = useState({
        fees_item_id: "",
        fees_item: "",
        school_id: "",
        school_name: "",
        academic_year_id: 0,
        fee_category_id: "",
        status: "A"
    });
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    const currentUserRole = userObj.role_name?.trim();
    const { canWrite } = useFeeModuleAccess(currentUserRole);

    useEffect(() => {
        fetchacademicyear();
        fetchDataRead("/feecategory/", setFeeCategories, userObj.school_id);
    }, []);

    const fetchacademicyear = async () => {
        try {
            const response = await axios.post(baseUrl + "/AcademicYear/", { action: "DROPDOWNREAD", school_id: userObj.school_id });
            setAcademicyears(response.data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

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
            fee_category_id: form.fee_category_id,
            academic_year_id: userObj.academic_year_id,
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
                fee_category_id: "",
                academic_year_id: 0,
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
                                            <div className="commonInput">
                                                <Form.Group>
                                                    <Form.Label>
                                                        Academic Year Name<span className="requiredStar">*</span>
                                                    </Form.Label>
                                                    <div className="form-control-plaintext">
                                                        {userObj.academic_year_name}
                                                    </div>
                                                </Form.Group>
                                            </div>
                                        </Col>

                                        <Col xs={12} md={6} lg={4} xxl={4}>
                                            <div className="commonInput">
                                                <Form.Group>
                                                    <Form.Label>
                                                        Fee Category<span className="requiredStar">*</span>
                                                    </Form.Label>
                                                    <select
                                                        required
                                                        className="form-select"
                                                        id="fee_category_id"
                                                        value={form.fee_category_id}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">Select Fee Category</option>
                                                        {(feeCategories || [])
                                                            .filter((category) => category.is_active === 'Active')
                                                            .map((category) => (
                                                                <option key={category.fee_category_id} value={category.fee_category_id}>
                                                                    {category.fee_category_name}
                                                                </option>
                                                            ))}
                                                    </select>


                                                </Form.Group>
                                            </div>
                                        </Col>

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
                                                    fee_category_id:"",
                                                    academic_year_id: 0,
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
                                            {canWrite && (
                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    className="btn-success primaryBtn"
                                                >
                                                    Submit
                                                </Button>
                                            )}
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