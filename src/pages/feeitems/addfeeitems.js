import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

import { ToastContainer, toast } from "react-toastify";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import axios from "axios";
import FeesItemsAmount from "./feesitemsamount";
import { useFeeModuleAccess } from "../hooks/useFeeModuleAccess";

const AddFeeitems = () => {
    const userData = sessionStorage.getItem("user");
    const userObj = JSON.parse(userData);
    const [editId, setEditId] = useState(null);
    const [academicyears, setAcademicyears] = useState([]);
    const [classes, setClasses] = useState([]);
    const [feeitemlists, setFeeitemlists] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const routeLocation = useLocation();

    const [form, setForm] = useState({
        academic_year_id: userObj.academic_year_id || 0,
        academic_year_name: "",
        class_id: "",
        class_name: "",
        fees_item_id: "",
        item: "",
        fees_item_amount: "",
        status: "A",
        remarks: "",
    });
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    const currentUserRole = userObj.role_name?.trim();
    const { canWrite } = useFeeModuleAccess(currentUserRole);

    useEffect(() => {
        fetchacademicyear();
        fetchclasses();
        fetchfeeitemlist();
    }, []);

    const fetchacademicyear = async () => {
        try {
            const response = await axios.post(baseUrl + "/AcademicYear/", {
                action: "READ",
                school_id: userObj.school_id,
            });
            setAcademicyears(response.data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

    const fetchclasses = async () => {
        try {
            const response = await axios.post(baseUrl + "/classes/", {
                action: "READ",
                school_id: userObj.school_id,
            });
            const filterData = Array.isArray(response.data) ? response.data : [];

            const filteredClasses = filterData.filter(
                (item) => item.is_active?.toLowerCase() === "active"
            );
            setClasses(filteredClasses);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

    const fetchfeeitemlist = async () => {
        try {
            const response = await axios.post(baseUrl + "/Feeitemslist/", {
                action: "DROPDOWNREAD",
                school_id: userObj.school_id,
                academic_year_id: userObj.academic_year_id,
            });
            setFeeitemlists(response.data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

    useEffect(() => {
        if (routeLocation.state?.feesitemsData) {
            const feesitemsData = routeLocation.state.feesitemsData;
            setForm(feesitemsData);
            setEditId(feesitemsData.fees_items_amount_id);
        }
    }, [routeLocation]);

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
            fees_items_amount_id: 0,
            academic_year_id: userObj.academic_year_id,
            class_id: form.class_id,
            fees_item_id: form.fees_item_id,
            fees_item_amount: form.fees_item_amount,
            school_id: userObj.school_id,
            status: form.status || "A",
            remarks: form.remarks,
            action: editId !== null ? "UPDATE" : "CREATE",
        };

        if (editId !== null) {
            formData.fees_items_amount_id = editId;
        }

        try {
            const response = await axios.post(
                baseUrl + "/feeitemsamount/",
                formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (editId !== null) {
                toast.success("Record Updated Successfully");
                setEditId(null);
            } else {
                toast.success("Record Added Successfully");
            }
            setForm({
                academic_year_name: "",
                class_id: "",
                class_name: "",
                fees_item_id: "",
                item: "",
                fees_item_amount: "",
                remarks: "",
            });

            setRefreshKey((prev) => prev + 1);

        } catch (error) {
            if (error.response) {
                const { status, data } = error.response;
                const errorMessage =
                    data.error || data.message || "Unexpected error occurred";

                if (status === 400 && errorMessage.includes("already exists")) {
                    toast.error("Record Already Exists.", { position: "top-right" });
                } else if (status === 500) {
                    toast.error("Error submitting data: " + errorMessage, {
                        position: "top-right",
                    });
                } else {
                    toast.error("Unexpected error occurred", { position: "top-right" });
                }
            } else {
                toast.error("Error submitting data: " + error.message, {
                    position: "top-right",
                });
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
                        <Card className="mb-4">
                            <Card.Body>
                                <form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col xs={12}>
                                            <h6 className="commonSectionTitle">
                                                Fees Items Amount Details
                                            </h6>
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
                                                        Class<span className="requiredStar">*</span>
                                                    </Form.Label>
                                                    <select
                                                        required
                                                        className="form-select"
                                                        id="class_id"
                                                        value={form.class_id}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">Select Class</option>
                                                        {(classes || []).map((classe) => (
                                                            <option
                                                                key={classe.class_id}
                                                                value={classe.class_id}
                                                            >
                                                                {classe.class_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </Form.Group>
                                            </div>
                                        </Col>
                                        <Col xs={12} md={6} lg={4} xxl={4}>
                                            <div className="commonInput">
                                                <Form.Group>
                                                    <Form.Label>
                                                        Fees Items<span className="requiredStar">*</span>
                                                    </Form.Label>
                                                    <select
                                                        required
                                                        className="form-select"
                                                        id="fees_item_id"
                                                        value={form.fees_item_id}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">Select Item</option>
                                                        {(feeitemlists || []).map((feeitemlist) => (
                                                            <option
                                                                key={feeitemlist.fees_item_id}
                                                                value={feeitemlist.fees_item_id}
                                                            >
                                                                {feeitemlist.fees_item}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </Form.Group>
                                            </div>
                                        </Col>
                                        <Col xs={12} md={6} lg={4} xxl={4}>
                                            <div className="commonInput">
                                                <Form.Group>
                                                    <Form.Label>
                                                        Fees Item Amount{" "}
                                                        <span className="requiredStar">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        required
                                                        type="text"
                                                        id="fees_item_amount"
                                                        value={form.fees_item_amount}
                                                        placeholder="Enter Fee Item Amount"
                                                        maxLength={10}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (!isNaN(value)) {
                                                                handleInputChange(e);
                                                            }
                                                        }}
                                                    />
                                                </Form.Group>
                                            </div>
                                        </Col>
                                        <Col xs={12} md={6} lg={8} xxl={4}>
                                            <div className="commonInput">
                                                <Form.Group>
                                                    <Form.Label>Remarks</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        type="text"
                                                        id="remarks"
                                                        value={form.remarks ?? ""}
                                                        placeholder="Enter Remarks"
                                                        maxLength={250}
                                                        onChange={(e) => {
                                                            handleInputChange(e);
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
                                                onClick={() => {
                                                    setForm({
                                                        academic_year_name: "",
                                                        class_id: "",
                                                        class_name: "",
                                                        fees_item_id: "",
                                                        item: "",
                                                        fees_item_amount: "",
                                                        remarks: "",
                                                        status: "A",
                                                    });
                                                    setRefreshKey(null);
                                                }}
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
                        <Card>
                            <Card.Body>
                                <Row>
                                    <FeesItemsAmount key={refreshKey} class_id={form.class_id} />
                                </Row>
                            </Card.Body>
                        </Card>
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default AddFeeitems;
