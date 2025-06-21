import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { IoMdAdd } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { Container, Button, Modal, Row, Col, Form, OverlayTrigger } from "react-bootstrap";
import { MdFilterList, MdAddCircle } from "react-icons/md";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { Tooltip } from '@mui/material';
import loading from "../../assets/images/common/loading.gif";


const Periods = () => {
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => setShowFilterModal(true);
    const [periods, setPeriods] = useState([])
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};

    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
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

    const handleEditClick = (period_id) => {
        const periodsToEdit = periods.find(periods => periods.period_id === period_id);

        if (periodsToEdit) {
            navigate("/addperiods", { state: { userData: periodsToEdit } });
        } else {
            console.error(`User with ID ${period_id} not found.`);
        }
    };

    useEffect(() => {
        fetchPeriods();
    }, []);

    useEffect(() => {
        setIsLoading(true);
        fetchPeriods("/periods/", setPeriods).finally(() => setIsLoading(false));
    }, []);

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
    const handleDeleteClick = async (period_id) => {
        const confirmDelete = window.confirm('Are you sure you want to update the status?');

        if (!confirmDelete) {
            return;
        }
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

    const columns = [
        {
            name: "Period Name ",
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
            name: "Is Active",
            selector: (row) => row.is_active,
            cell: (row) => (
                <Tooltip title={row.is_active}>
                    <span>{row.is_active}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Actions",
            cell: (row) => row.period_id !== "No records found" ? (
                <div className='tableActions'>
                    <Tooltip title="Edit" arrow>
                        <a className='commonActionIcons' onClick={() => handleEditClick(row.period_id)}>
                            <span><MdEdit /></span>
                        </a>
                    </Tooltip>

                    <Tooltip title="Delete" arrow>
                        <a className='commonActionIcons' onClick={() => handleDeleteClick(row.period_id)}>
                            <span><MdDelete /></span>
                        </a>
                    </Tooltip>
                </div>
            ) : null
        },
    ];
    const searchableColumns = [
        (row) => row.period_name,
        (row) => row.is_active,
        (row) => row.start_time,
        (row) => row.end_time,
    ];
    const filteredRecords = (periods || []).filter((item) =>
        searchableColumns.some((selector) => {
            const value = selector(item);
            const stringValue = String(value || '').toLowerCase().replace(/[-\s]+/g, '');
            const normalizedQuery = searchQuery.toLowerCase().replace(/[-\s]+/g, '');
            return stringValue.includes(normalizedQuery);
        })
    );

    const [form, setForm] = useState({
        period_name: "",
        action: "FILTER"
    });

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

    const handleReset = async (e) => {
        e.preventDefault();
        setForm({
            period_name: "",
        });
        setShowFilterModal(true);
        fetchPeriods();
    };

    const handleSearchChange = (event) => {
        setForm({
        });
        fetchPeriods();
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
                                <h6 className="commonTableTitle">Period Master</h6>
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
                                    <Button className="primaryBtn" variant="primary" onClick={() => navigate("/addperiods")}>
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
                                    fixedHeaderScrollHeight="calc(100vh - 170px)"
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
                </div>
            </div>

            {/* Filter Modal */}
            <Modal show={showFilterModal} onHide={handleCloseFilterModal} className="commonFilterModal">
                <Modal.Header closeButton className="modalHeaderFixed">
                    <Modal.Title>Filter</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBodyScrollable">
                    <Row>
                        <Col xs={12}>
                            <div className='commonInput'>
                                <Form.Group controlId="firstName">
                                    <Form.Label>Period Name</Form.Label>
                                    <Form.Control type="text"
                                        id="period_name"
                                        value={form.period_name}
                                        placeholder="Enter Period Name"
                                        maxLength={30}
                                        onChange={handleInputChange} />
                                </Form.Group>
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer className="modalFooterFixed">
                    <Button
                        variant="secondary"
                        className="btn-info clearBtn me-2"
                        onClick={handleReset}
                    >
                        Reset
                    </Button>

                    <div>
                        <Button
                            variant="secondary"
                            className="btn-danger secondaryBtn me-2"
                            onClick={handleCloseFilterModal}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="primary"
                            type="submit"
                            className="btn-success primaryBtn"
                            form="filterForm"
                            onClick={handleSubmit}
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
