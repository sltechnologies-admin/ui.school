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

const Category = () => {
    const [category, setCategory] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => setShowFilterModal(true);
    const [isLoading, setIsLoading] = useState(true);
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const readOnlyRoles = ["Class Teacher", "Teacher", "Class Incharge"];
    const canSubmit = !readOnlyRoles.includes(userObj.role_name?.trim());
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [filter, setFilter] = useState({
        category_name: "",
        action: "FILTER"
    });

    const handleEditClick = (category_id) => {
        const categoryToEdit = category.find(category => category.category_id === category_id);

        if (categoryToEdit) {
            navigate("/addcategory", { state: { categoryData: categoryToEdit } });
        } else {
            console.error(`User with ID ${category_id} not found.`);
        }
    };

    const fetchCategory = async () => {
        try {
            const response = await axios.post(baseUrl + "/category/", {
                action: "READ", school_id: userObj.school_id
            });
            setCategory(response.data);
        } catch (error) {
            console.error("Error fetching category data:", error);
        }
    };
    useEffect(() => {
        setIsLoading(true);
        fetchCategory().finally(() => setIsLoading(false));
    }, []);

    const baseColumns = [
        {
            name: 'Category',
            selector: (row) => row.category_name,
            cell: (row) => <Tooltip title={row.category_name}><span>{row.category_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: 'Status',
            selector: (row) => row.is_active,
            cell: (row) => <Tooltip title={row.is_active}><span>{row.is_active}</span></Tooltip>,
            sortable: true,
        }
    ];

    // Conditionally add the Actions column only if canSubmit is true
    const columns = canSubmit ? [
        ...baseColumns,
        {
            name: "Actions",
            cell: (row) => (
                <div className="tableActions">
                    <Tooltip title="Edit" arrow>
                        <span
                            className="commonActionIcons"
                            onClick={() => handleEditClick(row.category_id)}
                        >
                            <MdEdit />
                        </span>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                        <span
                            className="commonActionIcons"
                            onClick={() => handleDeleteClick(row.category_id)}
                        >
                            <MdDelete />
                        </span>
                    </Tooltip>
                </div>
            ),
        }
    ] : baseColumns;


    const handleDeleteClick = async (category_id) => {
        const confirmDelete = window.confirm('Are you sure you want to change the status?');

        if (!confirmDelete) {
            return;
        }
        const requestBody = {
            category_id: category_id,
            action: "DELETE"
        };
        try {
            const response = await axios.post(baseUrl + '/category/', requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            toast.success("Record Set to InActive");
            fetchCategory();
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const searchableColumns = [
        (row) => row.category_name,
        (row) => row.is_active,

    ];

    const filteredRecords = (category || []).filter((item) =>
        searchableColumns.some((selector) => {
            const value = selector(item);
            const stringValue = String(value || '').toLowerCase().replace(/[-\s]+/g, '');
            const normalizedQuery = searchQuery.toLowerCase().replace(/[-\s]+/g, '');
            return stringValue.includes(normalizedQuery);
        })
    );

    const handleFilterSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            category_name: filter.category_name || "",
            school_id: userObj.school_id,
            action: "FILTER",
        };
        try {
            const response = await axios.post(baseUrl + "/category/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const dataArray = Array.isArray(response.data) ? response.data : [];
            setCategory(dataArray);
            setFilter((prevFilter) => ({
                ...prevFilter,
            }));
            setShowFilterModal(false);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setFilter({
            category_name: "",
        });
        setShowFilterModal(true);
        fetchCategory();
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };


    return (
        <div className='pageMain'>
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
                                <h6 className="commonTableTitle">Category </h6>
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

                                {canSubmit && (
                                    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add</Tooltip>}>
                                        <Button className="primaryBtn" variant="primary" onClick={() => navigate("/addcategory")}>
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
                                    className="custom-table"
                                    columns={columns}
                                    data={filteredRecords.length > 0 ? filteredRecords : [{ is_active: 'No records found', is_active: 'No records found' }]}
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
                    <Form id="filterForm" onSubmit={handleFilterSubmit}>
                        <Row>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="firstName">
                                        <Form.Label>Category </Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="category_name"
                                            name="category_name"
                                            placeholder="Enter Category "
                                            maxLength={30}
                                            value={filter.category_name}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^A-Za-z]/g, '');
                                                setFilter({ ...filter, category_name: value });
                                            }}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modalFooterFixed">
                    <Button variant="secondary" className="btn-info clearBtn me-2" onClick={handleReset}>
                        Reset
                    </Button>
                    <div>
                        <Button variant="secondary" className="btn-danger secondaryBtn me-2" onClick={handleCloseFilterModal}>
                            Cancel
                        </Button>

                        <Button variant="primary" className="btn-success primaryBtn" onClick={handleFilterSubmit}>
                            Search
                        </Button></div>
                </Modal.Footer>
            </Modal>
        </div>


    );
};

export default Category;