import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Row, Col, Form, OverlayTrigger } from "react-bootstrap";
import { MdFilterList, MdAddCircle, MdEdit, MdDelete } from "react-icons/md";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import { Tooltip } from '@mui/material';
import loading from "../../assets/images/common/loading.gif";

const Classes = () => {
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => setShowFilterModal(true);
    const [classes, setClasses] = useState([]);
    const [category, setCategory] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const readOnlyRoles = ["Class Teacher", "Teacher", "Class Incharge"];
    const canSubmit = !readOnlyRoles.includes(userObj.role_name?.trim());
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    const fetchClasses = async () => {
        try {
            const response = await axios.post(baseUrl + "/classes/", {
                action: "READ", school_id: userObj.school_id
            });
            setClasses(response.data);

        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };
    const fetchCategory = async () => {
        try {
            const response = await axios.post(baseUrl + "/category/", {
                action: "READ", school_id: userObj.school_id
            });
            setCategory(response.data);

        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };
    const handleEditClick = (class_id) => {
        const classmasterToEdit = classes.find(classes => classes.class_id === class_id);

        if (classmasterToEdit) {
            navigate("/addnewclass", { state: { userData: classmasterToEdit } });
        } else {
            console.error(`User with ID ${class_id} not found.`);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchClasses("/classes/", setClasses).finally(() => setIsLoading(false));
        fetchCategory("/category/", setCategory).finally(() => setIsLoading(false));
    }, []);

    const handleDeleteClick = async (class_id) => {

        const confirmDelete = window.confirm('Are you sure you want to change the  status?');

        if (!confirmDelete) {
            return;
        }
        const requestBody = {
            class_id: class_id,
            action: "DELETE"
        };

        try {
            const response = await axios.post(baseUrl + "/classes/", requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error! Status: ${response.status}`);

            }
            toast.success("Record Set to InActive");
            fetchClasses();
        } catch (error) {
            console.error('Error:', error);
        }

    };


    const baseColumns = [
        {
            name: "Class",
            selector: (row) => row.class_name,
            cell: (row) => (
                <Tooltip title={row.class_name}>
                    <span>{row.class_name}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Category",
            selector: (row) => row.category_name,
            cell: (row) => (
                <Tooltip title={row.category_name}>
                    <span>{row.category_name}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Sequence Number",
            selector: (row) => row.sequence_no,
            cell: (row) =>
                filteredRecords.length > 0 ? (
                    <Tooltip title={row.sequence_no}>
                        <span>{row.sequence_no}</span>
                    </Tooltip>
                ) : (
                    <div className="noDataMessage">No Records Found</div>
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
    ];

    // Conditionally add Actions column only if canSubmit is true
    const columns = canSubmit
        ? [
            ...baseColumns,
            {
                name: "Actions",
                cell: (row) =>
                    filteredRecords.length > 0 ? (
                        <div className="tableActions">
                            <Tooltip title="Edit" arrow>
                                <span
                                    className="commonActionIcons"
                                    onClick={() => handleEditClick(row.class_id)}
                                >
                                    <MdEdit />
                                </span>
                            </Tooltip>
                            <Tooltip title="Delete" arrow>
                                <span
                                    className="commonActionIcons"
                                    onClick={() => handleDeleteClick(row.class_id)}
                                >
                                    <MdDelete />
                                </span>
                            </Tooltip>
                        </div>
                    ) : null,
            },
        ]
        : baseColumns;


    const searchableColumns = [
        (row) => row.class_name,
        (row) => row.category_name,
        (row) => row.sequence_no,
        (row) => row.is_active,
    ];

    const filteredRecords = (classes || []).filter((classes) =>
        searchableColumns.some((selector) => {
            const value = selector(classes);
            return String(value || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        })
    );
    const [form, setForm] = useState({
        class_name: "",
        category_name: "",
        sequence_no: "",
        action: "FILTER"
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = {

            class_name: form.class_name,
            category_id: form.category_id,
            sequence_no: form.sequence_no || 0,
            is_active: form.is_active || "A",
            school_id: userObj.school_id,
            action: 'FILTER',
        };

        try {

            const response = await axios.post(baseUrl + "/classes/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const filterData = response.data || [];

            setClasses(filterData);

            setShowFilterModal(false);


        } catch (error) {
            console.log("Full error object:", error);


        }
    };
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [id]: value
        }));
    };
    const handleReset = async (e) => {
        e.preventDefault();
        setForm({
            class_name: "",
            category_id: "",
            sequence_no: ""
        });
        setShowFilterModal(true);

        fetchClasses();
    };
    const handleSearchChange = (event) => {
        setForm({
            class_name: "",
        });
        fetchClasses();
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
                    <div className="commonDataTableHead">
                        <div className="d-flex justify-content-between align-items-center w-100">

                            <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                                <h6 className="commonTableTitle">Class Master</h6>
                            </div>

                            <div className="">
                                <input type="text" placeholder="Search..." value={searchQuery} className="searchInput" onChange={handleSearchChange}
                                />
                            </div>
                            <div className="d-flex align-items-center" style={{ gap: 6 }}>
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}>
                                    <Button className="secondaryBtn" variant="secondary" onClick={handleShowFilterModal}>
                                        <MdFilterList />
                                    </Button>
                                </OverlayTrigger>
                                {canSubmit && (
                                    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add</Tooltip>}>
                                        <Button className="primaryBtn" disabled={!canSubmit} variant="primary" onClick={() => navigate("/addnewclass")}>
                                            <MdAddCircle />
                                        </Button>
                                    </OverlayTrigger>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="commonTable height100">
                        <div className="tableBody">
                            {isLoading ? (
                                <div className="loadingContainer">
                                    <img src={loading} alt="Loading..." className="loadingGif" />
                                </div>
                            ) : (
                                <DataTable
                                    className="custom-table" columns={columns} pagination={filteredRecords.length > 0} highlightOnHover responsive fixedHeader fixedHeaderScrollHeight="calc(100vh - 200px)"
                                    data={
                                        filteredRecords.length > 0
                                            ? filteredRecords
                                            : [{ filteredRecords: "No Records Found" }]
                                    }
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Modal show={showFilterModal} onHide={handleCloseFilterModal} className="commonFilterModal">
                <Modal.Header closeButton className="modalHeaderFixed">
                    <Modal.Title>Filter</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBodyScrollable">
                    <Row>
                        <Col xs={12}>
                            <div className='commonInput'>
                                <Form.Group controlId="firstName">
                                    <Form.Label>Class</Form.Label>
                                    <Form.Control type="text" id="class_name" value={form.class_name} placeholder="Enter Class" maxLength={30}
                                        onChange={(e) => {
                                            const filteredValue = e.target.value.replace(/[^a-zA-Z0-9 .]/g, "");
                                            setForm({ ...form, class_name: filteredValue });
                                        }}
                                    />
                                </Form.Group>
                            </div>
                        </Col>
                        <Col xs={12}>
                            <div className="commonInput">
                                <Form.Group>
                                    <Form.Label>
                                        Category
                                    </Form.Label>
                                    <Form.Select
                                        required
                                        className="form-select"
                                        id="category_id"
                                        value={form.category_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Category</option>
                                        {Array.isArray(category) && category.length > 0 ? (
                                            category
                                                .filter((cat) => cat.is_active === "Active")
                                                .map((cat) => (
                                                    <option key={cat.category_id} value={cat.category_id}>
                                                        {cat.category_name}
                                                    </option>
                                                ))
                                        ) : (
                                            <option disabled>No categories found</option>
                                        )}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </Col>
                        <Col xs={12}>
                            <div className='commonInput'>
                                <Form.Group controlId="firstName">
                                    <Form.Label>Sequence Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="sequence_no"
                                        value={form.sequence_no}
                                        placeholder="Enter Sequence Number"
                                        maxLength={2}
                                        inputMode="numeric"
                                        onChange={(e) => {
                                            const filteredValue = e.target.value.replace(/\D/g, '');
                                            setForm({ ...form, sequence_no: filteredValue });
                                        }}
                                    />
                                </Form.Group>
                            </div>
                        </Col>

                    </Row>
                </Modal.Body>
                <Modal.Footer className="modalFooterFixed">
                    <Button variant="secondary" className="btn-info clearBtn me-2" onClick={handleReset}>  Reset    </Button>
                    <div>
                        <Button variant="secondary" className="btn-danger secondaryBtn me-2" onClick={handleCloseFilterModal}>    Cancel  </Button>
                        <Button variant="primary" type="submit" className="btn-success primaryBtn" form="filterForm" onClick={handleSubmit}>  Search </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
export default Classes;
