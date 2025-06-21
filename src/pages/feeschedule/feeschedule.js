import React, { useState, useEffect } from 'react';
//Gadgets Import
import Container from 'react-bootstrap/Container';
import loading from "../../assets/images/common/loading.gif";
import { Form, Modal, Col, Row, OverlayTrigger } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { ToastContainer, toast } from 'react-toastify';
import Tooltip from "@mui/material/Tooltip";
//Icons
import { MdAddCircle, MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { MdFilterList } from "react-icons/md";
//Components
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { useFeeModuleAccess } from "../hooks/useFeeModuleAccess";

const FeeSchedule = () => {
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => setShowFilterModal(true);
    const [isLoading, setIsLoading] = useState(true);
    const [feeschedule, setFeeschedule] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};

    const currentUserRole = userObj.role_name?.trim();
    const { canWrite } = useFeeModuleAccess(currentUserRole);

    useEffect(() => {
        document.title = "SCHOLAS";
        setIsLoading(true);
        fetchData().finally(() => setIsLoading(false));
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.post(baseUrl + "/feeschedule/", {
                action: "READ",
                school_id: userObj.school_id,
                academic_year_id: userObj.academic_year_id
            });

            const data = response.data || [];
            setFeeschedule(data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

    const columns = [
        {
            name: "Schedule Type",
            selector: (row) => row.fee_schedule_type_name,
            sortable: true,
            cell: row => <Tooltip title={row.fee_schedule_type_name}><span>{row.fee_schedule_type_name}</span></Tooltip>,
        },
        {
            name: "Schedule Name",
            selector: (row) => row.schedule_name,
            cell: row => <Tooltip title={row.schedule_name}><span>{row.schedule_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: "Start Date",
            selector: (row) => row.start_date,
            sortable: true,
            cell: (row) =>
                filteredRecords.length > 0 ? (
                    <Tooltip title={row.start_date ? formatDate(row.start_date) : ""}>
                        <span>{row.start_date ? formatDate(row.start_date) : ""}</span>
                    </Tooltip>
                ) : (
                    <div className="noDataMessage"></div>
                ),
        },
        {
            name: "End Date",
            selector: (row) => row.end_date,
            sortable: true,
            cell: (row) =>
                filteredRecords.length > 0 ? (
                    <Tooltip title={row.end_date ? formatDate(row.end_date) : ""}>
                        <span>{row.end_date ? formatDate(row.end_date) : ""}</span>
                    </Tooltip>
                ) : (
                    <div className="noDataMessage">No Records Found</div>
                ),
        },
        {
            name: "Due Date",
            selector: (row) => row.due_date,
            sortable: true,
            cell: (row) =>
                filteredRecords.length > 0 ? (
                    <Tooltip title={row.due_date ? formatDate(row.due_date) : ""}>
                        <span>{row.due_date ? formatDate(row.due_date) : ""}</span>
                    </Tooltip>
                ) : (
                    <div className="noDataMessage"></div>
                ),
        },
        {
            name: "Alerts Start Date",
            selector: (row) => row.alerts_start_date,
            sortable: true,
            cell: (row) =>
                filteredRecords.length > 0 ? (
                    <Tooltip title={row.alerts_start_date ? formatDate(row.alerts_start_date) : ""}>
                        <span>{row.alerts_start_date ? formatDate(row.alerts_start_date) : ""}</span>
                    </Tooltip>
                ) : (
                    <div className="noDataMessage"></div>
                ),
        },
        // {
        //     name: "Alerts On",
        //     selector: (row) => row.alerts_on,
        //     cell: row => <Tooltip title={row.alerts_on}><span>{row.alerts_on}</span></Tooltip>,
        //     sortable: true,

        // },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => (
                <Tooltip title={row.status}>
                    <span>{row.status}</span>
                </Tooltip>
            ),
        }
,
        {
            name: "Actions",
            omit: !canWrite,
            cell: (row) =>
                filteredRecords.length > 0 ? (
                    <div className='tableActions'>
                        <Tooltip title="Edit" arrow>
                            <a className='commonActionIcons' style={{ cursor: 'pointer' }} onClick={() => handleEditClick(row.fee_schedule_id)}>
                                <span><MdEdit /></span>  </a>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                            <a className='commonActionIcons' style={{ cursor: 'pointer' }} onClick={() => handleDeleteClick(row.fee_schedule_id)}>
                                <span><MdDelete /></span> </a>
                        </Tooltip>
                    </div>
                ) : null,
        },
    ];

    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        if (isNaN(d.getTime())) return "";
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFilter({
            ...filter,
            [id]: value,
        });
    };

    const handleEditClick = (fee_schedule_id) => {
        const employeemasterToEdit = feeschedule.find(Fee => Fee.fee_schedule_id === fee_schedule_id);
        if (employeemasterToEdit) {
            navigate("/addfeeschedule", { state: { feescheduleData: employeemasterToEdit } });
        }
    };

    const handleDeleteClick = async (fee_schedule_id) => {
        const confirmDelete = window.confirm("Are you sure you want to change the status");

        if (!confirmDelete) {
            return;
        }
        const requestBody = {
            fee_schedule_id: fee_schedule_id,
            action: "DELETE"
        };
        try {
            const response = await axios.post(baseUrl + '/feeschedule/', requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            toast.success("Record Set to InActive");
            fetchData();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const searchableColumns = [
        (row) => row.academic_year_name,
        (row) => row.schedule_name,
        (row) => row.due_date,
        (row) => row.alerts_start_date,
        (row) => row.end_date,
        (row) => row.start_date,
        (row) => row.alerts_on,
        (row) => row.status,
    ];

    const trimmedQuery = searchQuery.trim().toLowerCase();
    function formatDateForSearch(dateStr) {
    // Handles both Date objects and strings
    const date = new Date(dateStr);
    if (isNaN(date)) return String(dateStr); // fallback

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`; // Format as dd-mm-yyyy
}

const filteredRecords =
    trimmedQuery.length > 0
        ? (feeschedule || []).filter((feeschedule) =>
              searchableColumns.some((selector) => {
                  let value = selector(feeschedule);

                  // If value is a date or date string, format it
                  if (!isNaN(Date.parse(value))) {
                      value = formatDateForSearch(value);
                  }

                  return String(value || "")
                      .toLowerCase()
                      .includes(trimmedQuery);
              })
          )
        : feeschedule || [];


    const [filter, setFilter] = useState({
        schedule_name: "",
        due_date: "",
        start_date: "",
        end_date: "",
        alerts_start_date: "",
        alerts_on: "",
        status: "",
        action: "FILTER",
    });

    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            academic_year_id: userObj.academic_year_id || 0,
            schedule_name: filter.schedule_name || "",
            due_date: filter.due_date || "",
            start_date: filter.start_date || "",
            end_date: filter.end_date || "",
            alerts_start_date: filter.alerts_start_date || "",
            alerts_on: filter.alerts_on || "",
            school_id: userObj.school_id,
            action: "FILTER",
        };

        try {
            const response = await axios.post(baseUrl + "/feeschedule/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const filterData = response.data || [];

            if (filterData.length === 0) {
                setFeeschedule([]);
            } else {
                setFeeschedule(filterData);
            }
            setShowFilterModal(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            if (error.response && error.response.status === 404) {
                setFeeschedule([]);

            } else {
                toast.error("Failed to fetch filtered data");
            }
        }
    };

    const handleFilterReset = async () => {
        setFilter({
            schedule_name: "",
            due_date: "",
            start_date: "",
            end_date: "",
            alerts_start_date: "",
            alerts_on: "",
            status: "",
            action: "FILTER"
        });

        setShowFilterModal(true);

        fetchData("/feeschedule", setFeeschedule);
    }

    const handleSearchChange = (event) => {
        setFilter({
            schedule_name: "",
            due_date: "",
            start_date: "",
            end_date: "",
            alerts_start_date: "",
            alerts_on: "",
            status: ""
        });
        fetchData("/feeschedule", setFeeschedule);
        setSearchQuery(event.target.value);
    };

    return (
        <>
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
                                    <h6 className="commonTableTitle">Fees Schedule</h6>
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
                                <div className="d-flex align-items-center" style={{ gap: "6px" }}>
                                    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}>
                                        <Button className="secondaryBtn" variant="secondary" onClick={handleShowFilterModal}>
                                            <MdFilterList />
                                        </Button>
                                    </OverlayTrigger>
                                    {canWrite && (
                                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add</Tooltip>}>
                                            <Button className="primaryBtn" variant="primary" onClick={() => navigate("/addfeeschedule")}>
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
                                        data={
                                            filteredRecords.length > 0
                                                ? filteredRecords
                                                : [{ due_date: "No Records Found" }]
                                        }
                                        pagination={filteredRecords.length > 0}
                                        highlightOnHover
                                        responsive
                                        fixedHeader
                                        fixedHeaderScrollHeight="calc(100vh - 170px)" />
                                )}
                            </div>
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
                                    <Form.Group controlId="schedulename">
                                        <Form.Label>Schedule Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="schedule_name"
                                            placeholder="Enter Schedule Name"
                                            value={filter.schedule_name}
                                            maxLength={30}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                                                setFilter({ ...filter, schedule_name: value });
                                            }}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12} >
                                <div className='commonInput'>
                                    <Form.Group>
                                        <Form.Label>Start Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            id="start_date"
                                            value={filter.start_date}
                                            placeholder="Enter Start Date"
                                            onChange={handleInputChange}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12} >
                                <div className='commonInput'>
                                    <Form.Group>
                                        <Form.Label>End Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            id="end_date"
                                            value={filter.end_date}
                                            placeholder="Enter End Date"
                                            onChange={handleInputChange}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12} >
                                <div className='commonInput'>
                                    <Form.Group>
                                        <Form.Label>Due Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            id="due_date"
                                            value={filter.due_date}
                                            placeholder="Enter Due Date"
                                            onChange={handleInputChange}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12} >
                                <div className='commonInput'>
                                    <Form.Group>
                                        <Form.Label>Alerts Start Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            id="alerts_start_date"
                                            value={filter.alerts_start_date}
                                            placeholder="Enter Alerts Start Date"
                                            onChange={handleInputChange}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                            {/* <Col xs={12} >
                                <div className='commonInput'>
                                    <Form.Group controlId="alerts_on">
                                        <Form.Label>Alert On</Form.Label>
                                        <Form.Select
                                            type="text"
                                            name="alerts_on"
                                            value={filter.alerts_on}
                                            onChange={(e) => setFilter({ ...filter, alerts_on: e.target.value })} >
                                            <option value="">Select Alert On</option>
                                            <option value="Y">Yes</option>
                                            <option value="N">No</option>
                                        </Form.Select>
                                        <Form.Control.Feedback>Required</Form.Control.Feedback>
                                    </Form.Group>
                                </div>
                            </Col> */}
                        </Row>
                    </Form>
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
                            onClick={handleCloseFilterModal}
                        >
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="btn-success primaryBtn" form="filterForm" onClick={handleCloseFilterModal}> Search </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
};
export default FeeSchedule;