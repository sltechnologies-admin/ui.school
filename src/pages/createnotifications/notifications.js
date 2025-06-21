import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoMdAdd } from "react-icons/io";
import { Container, Button, Modal, Row, Col, Form, OverlayTrigger } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete, MdAddCircle } from "react-icons/md";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from 'react-toastify';
import { MdFilterList } from "react-icons/md";
import loading from "../../assets/images/common/loading.gif";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { fetchDataRead } from "../../Utility";
import Tooltip from "@mui/material/Tooltip";

const CreateNotifications = () => {
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => setShowFilterModal(true);
    const [isLoading, setIsLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const readOnlyRoles = ["Class Teacher", "Teacher", "Class Incharge",];
    const canSubmit = !readOnlyRoles.includes(userObj.role_name?.trim());

    useEffect(() => {
        setIsLoading(true);
        fetchDataRead("/notifications/", setNotifications, userObj.school_id).finally(() => setIsLoading(false));
    }, []);
    const handleEditClick = (notification_id) => {
        const notificationData = notifications.find((notification) => notification.notification_id === notification_id);
        if (notificationData) {

        }
    };

    const handleDeleteClick = async (notification_id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to change the status?"
        );
        if (!confirmDelete) return;

        try {
            const response = await axios.post(
                baseUrl + "/notifications/",
                { notification_id, action: "DELETE" },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            toast.success("Status set to Inactive");
            fetchDataRead("/notifications/", setNotifications, userObj.school_id);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to delete record");
        }
    };
    const baseColumns = [
        {
            name: "Subject",
            selector: row => row.subject,
            wrap: true,
            sortable: true,
            maxWidth: "300px",
            margin:"10px",
            cell: row => (
                <Tooltip title={row.subject}>
                    <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{row.subject}</div>
                </Tooltip>
            )
        },
        {
            name: "Description",
            selector: row => row.description,
            wrap: true,
            sortable: true,
            maxWidth: "500px",
            style: { marginLeft: "15px" }, // 👈 
            cell: row => (
                <Tooltip title={row.description}>
                    <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{row.description}</div>
                </Tooltip>
            )
        },
        {
            name: "Status",
            selector: row => row.status,
            sortable: true,
            maxWidth: "150px",
            
            cell: row => (
                <Tooltip title={row.status}>
                    <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{row.status}</div>
                </Tooltip>
            )
        }
    ];

    const actionColumn = {
        name: "Actions",
        button: true,
        maxWidth: "120px",
        cell: row =>
            row.notification_id !== "No records found" ? (
                <div className="tableActions">
                    <Tooltip title="Edit" arrow>
                        <span
                            className="commonActionIcons"
                            onClick={() => handleEditClick(row.notification_id)}
                        >
                            <MdEdit />
                        </span>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                        <span
                            className="commonActionIcons"
                            onClick={() => handleDeleteClick(row.notification_id)}
                        >
                            <MdDelete />
                        </span>
                    </Tooltip>
                </div>
            ) : null
    };

    const columns = canSubmit ? [...baseColumns, actionColumn] : [...baseColumns];



    const searchableColumns = [
        row => row.subject,
        row => row.description
    ];

    const filteredRecords = (notifications || []).filter((notification) =>
        searchableColumns.some((selector) => {
            const value = selector(notification);
            return String(value || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        })
    );

    const [filter, setFilter] = useState({
        subject: "",
        school_id: userObj.school_id,
        action: "FILTER",
    });

    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = {
            subject: filter.subject || "",
            action: "FILTER",
        };

        try {
            const response = await axios.post(`${baseUrl}/notifications/`, formData, {
                headers: { "Content-Type": "application/json" },
            });

            const filterData = response.data || [];

            if (filterData.length === 0) {
                setNotifications([]);
            } else {
                setNotifications(filterData);
            }

            setShowFilterModal(false);
        } catch (error) {
            console.error("Error fetching data:", error);

            if (error.response) {
                if (error.response.status === 404) {
                    setNotifications([]);
                } else {
                    toast.error("Failed to fetch filtered data. Please try again.");
                }
            } else {
                toast.error("Network error. Please check your connection.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterClear = async () => {
        setFilter((prev) => ({ ...prev, subject: "" }));
        setIsLoading(true);

        try {
            await fetchDataRead("/notifications", setNotifications, userObj.school_id);
        } catch (error) {
            console.error("Error fetching all notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchChange = (event) => {
        fetchDataRead("/notifications", setNotifications, userObj.school_id);
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
                                <h6 className="commonTableTitle">Create Notifications</h6>
                            </div>


                            <div className="">
                                <input
                                    type="text"
                                    placeholder="Search.."
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
                                        <Button className="primaryBtn" variant="primary" onClick={() => navigate("/addnewnotification")}>
                                            <IoMdAdd />
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
                                    data={(Array.isArray(filteredRecords) && filteredRecords.length > 0)
                                        ? filteredRecords
                                        : [{
                                            notification_id: "No records found",
                                            // subject: "No records found",
                                            description: "No records found",
                                            // status: "No records found"
                                        }]
                                    }
                                    pagination={Array.isArray(filteredRecords) && filteredRecords.length > 0}
                                    highlightOnHover
                                    responsive
                                    fixedHeader
                                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                                    conditionalRowStyles={[
                                        {
                                            when: (row) => row.notification_id === "No records found",
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

            {/* Filter Modal Starts Here */}
            <Modal show={showFilterModal} onHide={handleCloseFilterModal} className="commonFilterModal">
                <Modal.Header closeButton className="modalHeaderFixed">
                    <Modal.Title>Filter</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBodyScrollable">
                    <Form id="filterForm" onSubmit={handleFilterSubmit}>
                        <Row>
                            <Col xs={12}>
                                <div className="commonInput">
                                    <Form.Group controlId="subject">
                                        <Form.Label>Subject</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter subject"
                                            maxLength={35}
                                            value={filter.subject}
                                            onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modalFooterFixed">
                    <Button variant="secondary" className="btn-info clearBtn" onClick={handleFilterClear}>Reset</Button>
                    <Button variant="secondary" className="btn-danger secondaryBtn" onClick={handleCloseFilterModal}>Close</Button>
                    <Button variant="primary" className="btn-success primaryBtn" type="submit" form="filterForm" onClick={handleCloseFilterModal}>Search</Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
}

export default CreateNotifications;
