import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { Container, Button, Modal, Row, Col, Form, Card } from "react-bootstrap";
import {  MdEdit, MdDelete } from "react-icons/md";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import { Tooltip } from '@mui/material';
import loading from "../../assets/images/common/loading.gif";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";

const Periods = () => {

    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const readOnlyRoles = ["Class Teacher", "Teacher", "Class Incharge"];
    const canSubmit = !readOnlyRoles.includes(userObj.role_name?.trim());
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [periods, setPeriods] = useState([]);
    const [categorys, setCategorys] = useState([]);
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        period_id: "",
        category_id: "",
        period_name: "",
        is_active: "A",
        start_time: "",
        end_time: "",
        period_order: ""
    });


    const fetchPeriods = async () => {
        try {
            const response = await axios.post(baseUrl + "/periods/", {
                action: "READ", school_id: userObj.school_id
            });
            setPeriods(response.data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

    const fetchCategorys = async () => {
        try {
            const response = await axios.post(baseUrl + "/category/", {
                action: "READ",
                school_id: userObj.school_id
            });
            setCategorys(response.data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchPeriods().finally(() => setIsLoading(false));
        fetchCategorys();
    }, []);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [id]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

         if (!form.start_time) {
        toast.error("Start Time is required", { position: "top-right" });
        return;
    }

    if (!form.end_time) {
        toast.error("End Time is required", { position: "top-right" });
        return;
    }

        const formData = {
            period_name: form.period_name || "",
            category_id: form.category_id || "",
            is_active: form.is_active || "A",
            start_time: form.start_time || "",
            end_time: form.end_time || "",
            school_id: userObj.school_id,
            period_order: form.period_order || "",
            action: editId !== null ? "UPDATE" : "CREATE",
        };

        if (editId !== null) {
            formData.period_id = editId;
        }

        try {
            const response = await axios.post(baseUrl + "/periods/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (editId !== null) {
                toast.success("Record updated successfully", { position: "top-right" });
                setEditId(null);
            } else {
                toast.success("Record added successfully", { position: "top-right" });
            }
            setForm({
                period_id: "",
                category_id: "",
                period_name: "",
                is_active: "A",
                start_time: "",
                end_time: "",
                period_order: ""
            });
            
            fetchPeriods();
        } catch (error) {
            if (error.response) {
                const { status, data } = error.response;

                if (status === 400 && data.error === "Record already exists.") {
                    toast.error("Record already exists.", { position: "top-right" });
                } else if (
                    status === 401 &&
                    data.error === "Period order already exists for the specified school and category."
                ) {
                    toast.error("Period order already exists for the specified school and category.", {
                        position: "top-right",
                    });
                } 
                else if (
                    status === 402 &&
                    data.error === "Period name is already exists for category."
                ) {
                    toast.error("Period name is already exists for category.", {
                        position: "top-right",
                    });
                } 
                 else if (
                    status === 403 &&
                    data.error === "Time period overlaps with an existing period."
                ) {
                    toast.error("Time period overlaps with an existing period.", {
                        position: "top-right",
                    });
                } 
                else if (
                    status === 404 &&
                    data.error === "Start time cannot be greater than end time."
                ) {
                    toast.error("Start time cannot be greater than end time.", {
                        position: "top-right",
                    });
                } 
                else if (
                    status === 406 &&
                    data.error === "End time should not be equal to start time."
                ) {
                    toast.error("End Time should not be the same as Start Time.", {
                        position: "top-right",
                    });
                } 
                else if (status === 500) {
                    toast.error(
                        "Error submitting data: " + (data.error || error.message),
                        { position: "top-right" }
                    );

                    
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

    const handleEditClick = (period_id) => {
        const periodToEdit = periods.find(period => period.period_id === period_id);
        if (periodToEdit) {
            setForm(periodToEdit);
            setEditId(period_id);
            document.getElementById('periodFormSection').scrollIntoView({ behavior: 'smooth' });
        } else {
            console.error(`Period with ID ${period_id} not found.`);
        }
    };

    const handleDeleteClick = async (period_id) => {
        const confirmDelete = window.confirm('Are you sure you want to update the status?');
        if (!confirmDelete) return;

        const requestBody = {
            period_id: period_id,
            action: "DELETE"
        };
        
        try {
            const response = await axios.post(baseUrl + "/periods/", requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            toast.success("Record Set to InActive");
            fetchPeriods();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Table related functions
    const formatTime12Hour = (time) => {
        if (!time) return ''; 
        if (/^\d{1,2}:\d{2} (AM|PM)$/.test(time)) {
            return time;  
        }
        const [hoursStr, minutesStr] = time.split(':');
        if (!hoursStr || !minutesStr) return 'No Records Found'; 
        let hours = parseInt(hoursStr, 10);
        const minutes = minutesStr.padStart(2, '0');
        if (isNaN(hours) || isNaN(minutes)) return 'No Records Found';
        const amPm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${amPm}`;
    };

    const columns = [
        {
            name: "Category",
            selector: (row) => row.category_name,
            cell: row => (
                <Tooltip title={row.category_name}>
                    <span>{row.category_name}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Period Name",
            selector: (row) => row.period_name,
            cell: row => (
                <Tooltip title={row.period_name}>
                    <span>{row.period_name}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Start Time",
            selector: (row) => row.start_time,
            cell: row => (
                <Tooltip title={row.start_time}>
                    <span>{formatTime12Hour(row.start_time)}</span> 
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "End Time",
            selector: (row) => row.end_time,
            cell: row => (
                <Tooltip title={row.end_time}>
                    <span>{formatTime12Hour(row.end_time)}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Period Order",
            selector: (row) => row.period_order,
            cell: (row) => (
                <Tooltip title={row.period_order}>
                    <span>{row.period_order}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Status",
            selector: (row) => row.is_active,
            cell: (row) => (
                <Tooltip title={row.is_active}>
                    <span>{row.is_active}</span>
                </Tooltip>
            ),
            sortable: true,
        },
      ...(canSubmit ? [{
        name: "Actions",
        cell: (row) => 
            row.period_id !== "No records found" ? (
                <div className='tableActions'>
                    <Tooltip title="Edit" arrow>
                        <span className='commonActionIcons' onClick={() => handleEditClick(row.period_id)}>
                            <MdEdit />
                        </span>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                        <span className='commonActionIcons' onClick={() => handleDeleteClick(row.period_id)}>
                            <MdDelete />
                        </span>
                    </Tooltip>
                </div>
            ) : null,
    }] : [])
    ];

    const searchableColumns = [
        (row) => row.period_name,
        (row) => row.is_active,
        (row) => row.start_time,
        (row) => row.end_time,
        (row) => row.category_name,
    ];

    const filteredRecords = (periods || []).filter((item) =>
        searchableColumns.some((selector) => {
            const value = selector(item);
            const stringValue = String(value || '').toLowerCase().replace(/[-\s]+/g, '');
            const normalizedQuery = searchQuery.toLowerCase().replace(/[-\s]+/g, '');
            return stringValue.includes(normalizedQuery);
        })
    );

    // Filter modal functions
    const handleFilterInputChange = (e) => {
        const { id, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [id]: value
        }));
    };

    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            period_name: form.period_name,
            is_active: form.is_active || "A",
            school_id: userObj.school_id,
            action: 'FILTER',
        };

        try {
            const response = await axios.post(baseUrl + "/periods/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const filterData = response.data || [];
            setPeriods(filterData);
            setShowFilterModal(false);
        } catch (error) {
            console.log("Full error object:", error);
        }
    };

    const handleFilterReset = async (e) => {
        e.preventDefault();
        setForm({
            period_name: "",
        });
        fetchPeriods();
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
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
                <h6 className="commonTableTitle">Periods</h6>
                    {/* Add/Edit Period Form Section */}
                    <section id="periodFormSection">
                        <Container fluid>
                            <Card>
                                <Card.Body >
                                    <form onSubmit={handleSubmit}>
                                        <div className="">
                                            
                                            <Row>
                                                <Col xs={12}>
                                                    <h6 className="commonSectionTitle">
                                                        {editId !== null ? "Edit Period" : "Add New Period"}
                                                    </h6>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col xs={12} md={6} lg={4} xxl={2}>
                                            <div className="commonInput">
                                                <Form.Group>
                                                <Form.Label>
                                                    Category<span className="requiredStar">*</span>
                                                </Form.Label>
                                                <select
                                                    className="form-select"
                                                    required
                                                    id="category_id"
                                                    value={form.category_id}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Select Category</option>
                                                    {(categorys || [])
                                                    .filter((category) => category?.is_active === "Active")
                                                    .map((category) => (
                                                        <option key={category.category_id} value={category.category_id}>
                                                        {category.category_name}
                                                        </option>
                                                    ))}
                                                </select>
                                                </Form.Group>
                                            </div>
                                            </Col>

                                                <Col xs={12} md={6} lg={4} xxl={2}>
                                                    <div className="commonInput">
                                                        <Form.Group>
                                                            <Form.Label>
                                                                Period Name <span className="requiredStar">*</span>
                                                            </Form.Label>
                                                            <Form.Control
                                                                required
                                                                type="text"
                                                                id="period_name"
                                                                value={form.period_name}
                                                                placeholder="Enter Period Name"
                                                                maxLength={30}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    const validValue = value.replace(/[^a-zA-Z0-9 ]/g, '');
                                                                    handleInputChange({
                                                                        target: {
                                                                            id: 'period_name',
                                                                            value: validValue,
                                                                        },
                                                                    });
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={2}>
                                                    <div className="commonInput">
                                                        <Form.Group>
                                                            <Form.Label>
                                                                Start Time <span className="requiredStar">*</span>
                                                            </Form.Label>
                                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                <TimePicker
                                                                    required
                                                                    id="start_time"
                                                                    value={form.start_time ? dayjs(form.start_time, "hh:mm A") : null}
                                                                    onChange={(time) => {
                                                                        setForm((prevForm) => ({
                                                                            ...prevForm,
                                                                            start_time: time ? time.format("hh:mm A") : "",
                                                                        }));
                                                                    }}
                                                                    format="hh:mm A"
                                                                    sx={{
                                                                        width: "100%",
                                                                        "& .MuiInputBase-root": {
                                                                            height: "40px",
                                                                            borderRadius: "4px",
                                                                            border: "1px solid #ced4da",
                                                                            boxShadow: "none",
                                                                            paddingLeft: "10px",
                                                                        },
                                                                        "& .MuiOutlinedInput-notchedOutline": {
                                                                            border: "none",
                                                                        },
                                                                    }}
                                                                />
                                                            </LocalizationProvider>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={2}>
                                                    <div className="commonInput">
                                                        <Form.Group>
                                                            <Form.Label>
                                                                End Time <span className="requiredStar">*</span>
                                                            </Form.Label>
                                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                <TimePicker
                                                                    required
                                                                    id="end_time"
                                                                    value={form.end_time ? dayjs(form.end_time, "hh:mm A") : null}
                                                                    onChange={(time) => {
                                                                        setForm((prevForm) => ({
                                                                            ...prevForm,
                                                                            end_time: time ? time.format("hh:mm A") : "",
                                                                        }));
                                                                    }}
                                                                    format="hh:mm A"
                                                                    sx={{
                                                                        width: "100%",
                                                                        "& .MuiInputBase-root": {
                                                                            height: "40px",
                                                                            borderRadius: "4px",
                                                                            border: "1px solid #ced4da",
                                                                            boxShadow: "none",
                                                                            paddingLeft: "10px",
                                                                        },
                                                                        "& .MuiOutlinedInput-notchedOutline": {
                                                                            border: "none",
                                                                        },
                                                                    }}
                                                                />
                                                            </LocalizationProvider>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={2}>
                                                    <div className='commonInput'>
                                                        <Form.Group controlId="periodOrder">
                                                            <Form.Label>Period Order<span className="requiredStar">*</span></Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                id="period_order"
                                                                value={form.period_order}
                                                                placeholder="Enter Period Order"
                                                                maxLength={30} 
                                                                required
                                                                min={1} 
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
                                                        onClick={() => {
                                                            setForm({
                                                                period_id: "",
                                                                category_id: "",
                                                                period_name: "",
                                                                start_time: "",
                                                                end_time: "",
                                                                period_order: ""
                                                            });
                                                            setEditId(null);
                                                        }}
                                                    >
                                                        Reset
                                                    </Button>
                                                </div>
                                                <div>
                                                    <Button
                                                        type="submit"
                                                        variant="primary"
                                                        className="btn-success primaryBtn"
                                                         disabled={!canSubmit}
                                                    >
                                                        {editId !== null ? "Update" : "Add"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </Card.Body>
                            </Card>
                        </Container>
                    </section>

                    {/* Periods Grid Section */}
                    <section className="mt-4">
                        <div className="commonDataTableHead">
                            <div className="d-flex justify-content-between align-items-center w-100">
                                <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                                </div>

                                <div className="">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        className="searchInput"
                                        onChange={handleSearchChange}
                                    />
                                </div>

                            </div>
                        </div>

                        <div className="commonTable height100" style={{ maxHeight: "calc(100vh - 350px)", overflowY: "auto" }}>
                            <div className="tableBody">
                                {isLoading ? (
                                    <div className="loadingContainer">
                                        <img src={loading} alt="Loading..." className="loadingGif" />
                                    </div>
                                ) : (
                                    <DataTable
                                        className="custom-table"
                                        columns={columns}
                                        data={(Array.isArray(filteredRecords) && filteredRecords.length > 0)
                                            ? filteredRecords 
                                            : [{
                                                period_id: "No records found",
                                                end_time: "No records found",
                                            }]
                                        }
                                        pagination={Array.isArray(filteredRecords) && filteredRecords.length > 0}
                                        highlightOnHover
                                        responsive
                                        fixedHeader
                                        paginationPerPage={5}
                                        paginationRowsPerPageOptions={[5, 10, 15]}
                                        fixedHeaderScrollHeight="calc(100vh - 500px)"
                                        conditionalRowStyles={[
                                            {
                                                when: (row) => row.period_id === "No records found",
                                                style: {
                                                    textAlign: "center",
                                                    fontSize: "16px",
                                                    color: "red",
                                                    backgroundColor: "#f9f9f9"
                                                },
                                            },
                                        ]}
                                    />
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)} className="commonFilterModal">
                <Modal.Header closeButton className="modalHeaderFixed">
                    <Modal.Title>Filter</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBodyScrollable">
                    <Row>
                        <Col xs={12}>
                            <div className='commonInput'>
                                <Form.Group controlId="period_name">
                                    <Form.Label>Period Name</Form.Label>
                                    <Form.Control 
                                        type="text"
                                        value={form.period_name}
                                        placeholder="Enter Period Name"
                                        maxLength={30}
                                        onChange={handleFilterInputChange} 
                                    />
                                </Form.Group>
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer className="modalFooterFixed">
                    <Button
                        variant="secondary"
                        className="btn-info clearBtn me-2"
                        onClick={handleFilterReset}
                    >
                        Reset
                    </Button>

                    <div>
                        <Button
                            variant="secondary"
                            className="btn-danger secondaryBtn me-2"
                            onClick={() => setShowFilterModal(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="primary"
                            className="btn-success primaryBtn"
                            onClick={handleFilterSubmit}
                        >
                            Search
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Periods;