import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Button, Modal, Row, Col, Form, OverlayTrigger } from "react-bootstrap";
import { MdEdit, MdAddCircle, MdFilterList, MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import axios from "axios";
import DataTable from "react-data-table-component";
import { Tooltip } from '@mui/material';
import loading from "../../assets/images/common/loading.gif";

const FeeCategory = () => {
    const [feecategory, setFeecategory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => setShowFilterModal(true);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const userData = sessionStorage.getItem('user');
    const userObj = JSON.parse(userData);
    const [form, setForm] = useState({
        fee_category_name: "",
        is_display: "",
        is_active: "",
        action: "FILTER"
    });
    useEffect(() => {
        setIsLoading(true);
        fetchData().finally(() => setIsLoading(false));
    }, []);

    const handleEditClick = (fee_category_id) => {
        const feecategoryToEdit = feecategory.find(feecategory => feecategory.fee_category_id === fee_category_id);

        if (feecategoryToEdit) {
            navigate("/addfeecategory", { state: { feecategoryData: feecategoryToEdit } });
        } else {
            console.error(`Fee Category with ID ${fee_category_id} not found.`);
        }
    };
    const fetchData = async () => {
        try {
            const response = await axios.post(baseUrl + "/feecategory/", { action: "READ", school_id: userObj.school_id });
            setFeecategory(response.data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

    const handleDeleteClick = async (fee_category_id) => {
        const confirmDelete = window.confirm('Are you sure you want to change the  status?');

        if (!confirmDelete) {
            return;
        }
        const requestBody = {
            fee_category_id: fee_category_id,
            action: "DELETE"
        };

        try {
            const response = await axios.post(baseUrl + '/feecategory/', requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            toast.success("Record Set To InActive ");
            fetchData();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const columns = [
        {
            name: 'Fee Category',
            selector: (row) => row.fee_category_name,
            cell: (row) => <Tooltip title={row.fee_category_name}><span>{row.fee_category_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: 'Is Display',
            selector: (row) => row.is_display,
            cell: (row) => (
                <Tooltip title={row.is_display}>
                    <span>{row.is_display}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: 'Status',
            selector: (row) => row.is_active,
            cell: (row) => <Tooltip title={row.is_active}><span>{row.is_active}</span></Tooltip>,
            sortable: true,
        },
        {
            name: "Actions",
            cell: (row) =>
                filteredRecords.length > 0 ? (
                    <div className='tableActions'>
                        <Tooltip title="Edit" arrow>
                            <a className='commonActionIcons' onClick={() => handleEditClick(row.fee_category_id)}>
                                <span><MdEdit /></span>
                            </a>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                            <a className='commonActionIcons' onClick={() => handleDeleteClick(row.fee_category_id)}>
                                <span><MdDelete /></span>
                            </a>
                        </Tooltip>
                    </div>
                ) : null,

        },
    ];
    const searchableColumns = [
        (row) => row.fee_category_name,
        (row) => row.is_display,
        (row) => row.is_active,
    ];

    const filteredRecords = (feecategory || []).filter((item) =>
        searchableColumns.some((selector) => {
            const value = selector(item);
            const stringValue = String(value || '').toLowerCase().replace(/[-\s]+/g, '');
            const normalizedQuery = searchQuery.toLowerCase().replace(/[-\s]+/g, '');
            return stringValue.includes(normalizedQuery);
        })
    );

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
            fee_category_name: form.fee_category_name,
            is_active: form.is_active || "A",
            school_id: userObj.school_id,
            action: 'FILTER',
        };
        try {
            const response = await axios.post(baseUrl + "/feecategory/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const filterData = response.data || [];

            setFeecategory(filterData);

            setShowFilterModal(false);
        } catch (error) {
            console.error("Full error object:", error);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setForm({
            fee_category_name: "",
        });
        setShowFilterModal(true);
        fetchData();
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
                    <div className="commonDataTableHead">
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                                <h6 className="commonTableTitle">Fee Category Master</h6>
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
                            <div className="d-flex align-items-center" style={{ gap: 6 }}>
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}>
                                    <Button className="secondaryBtn" variant="secondary" onClick={handleShowFilterModal}>
                                        <MdFilterList />
                                    </Button>
                                </OverlayTrigger>

                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add</Tooltip>}>
                                    <Button className="primaryBtn" variant="primary" onClick={() => navigate("/addfeecategory")}>
                                        <MdAddCircle />
                                    </Button>
                                </OverlayTrigger>
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
                                    className="custom-table"
                                    columns={columns}
                                    data={filteredRecords.length > 0 ? filteredRecords : [{ is_active: 'No records found' }]}
                                    pagination={Array.isArray(filteredRecords) && filteredRecords.length > 0}
                                    highlightOnHover
                                    responsive
                                    fixedHeader
                                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                                    conditionalRowStyles={[
                                        {
                                            when: (row) => row.is_active === "No records found",
                                            style: { textAlign: 'center', fontSize: '16px', color: 'red', backgroundColor: '#f9f9f9' },
                                        },
                                    ]}
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
                                    <Form.Label>Fee Category </Form.Label>
                                    <Form.Control

                                        type="text"
                                        id="fee_category_name"
                                        value={form.fee_category_name}
                                        placeholder="Enter Fee Category Name "
                                        onChange={handleInputChange}
                                        maxLength={30}
                                    />
                                </Form.Group>
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer className="modalFooterFixed">
                    <Button variant="secondary" className="btn-info clearBtn me-2" onClick={handleReset}>
                        Reset
                    </Button>
                    <div>
                        <Button variant="secondary" className="btn-danger secondaryBtn me-2" onClick={() => { handleCloseFilterModal(); }}>
                            Cancel
                        </Button>

                        <Button variant="primary" className="btn-success primaryBtn" onClick={handleSubmit}>
                            Search
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default FeeCategory;
