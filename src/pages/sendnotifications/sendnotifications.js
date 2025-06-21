import React, { useState, useEffect } from 'react';
import loading from "../../assets/images/common/loading.gif";
import { Form, Modal, Col, Row, OverlayTrigger } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { ToastContainer, toast } from 'react-toastify';
import Tooltip from "@mui/material/Tooltip";
import { MdFilterList, MdAddCircle } from "react-icons/md";
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";

const SendNotifications = () => {
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sendnotificationdata, setNotificationdata] = useState([]);
    const [group, setGroup] = useState([]);
    const [notification, setNotificationid] = useState([]);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    const [filter, setFilter] = useState({
        notification_id: 0,
        group_id: 0,

    });
    const searchableColumns = [
        (row) => row.subject,
        (row) => row.group_name,
    ];
    const filteredRecords = (sendnotificationdata || []).filter((sendnotificationdata) =>
        searchableColumns.some((selector) => {
            const value = selector(sendnotificationdata);
            return String(value || "").toLowerCase().includes(searchQuery.toLowerCase());
        })
    );
    const fetchData = async () => {
        try {
            const response = await axios.post(baseUrl + "/sendnotifications/", {
                action: "READ"
            });
            setNotificationdata(response.data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }finally {
            setIsLoading(false);
        }
    };
    const fetchDropdownData = async (endpoint, setter) => {
        try {
            const response = await axios.post(baseUrl + endpoint, { action: 'READ' });
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
        }
    };
      useEffect(() => {
          fetchData("/sendnotifications/",setNotificationdata,userObj.school_id);
          fetchDropdownData('/notifications/', setNotificationid);
          fetchDropdownData('/creategroup/', setGroup);
      }, []);

    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(baseUrl + '/sendnotifications/', filter, {
                headers: { 'Content-Type': 'application/json' },
            });
            setNotificationdata(response.data || []);
            handleCloseFilterModal();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const handleFilterClear = async () => {
        setFilter({
            notification_id: 0,
            group_id: 0,
            action: "FILTER"
        });
        fetchData();
    }
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => setShowFilterModal(true);

    const columns = [
        {
            name: "Notification",
            selector: (row) => row.subject,
            cell: row => <Tooltip title={row.subject}><span>{row.subject}</span></Tooltip>,
            sortable: true,
        },
        {
            name: "Group",
            selector: (row) => row.group_name,
            cell: row => <Tooltip title={row.group_name}><span>{row.group_name}</span></Tooltip>,
            sortable: true,
        },
    ];
    return (
        <div className="pageMain">
            <LeftNav />
            <ToastContainer />
            <div className="pageRight">
                <div className="pageHead">
                    <Header />
                </div>
                <div className="pageBody">
                    <div className="commonDataTableHead">
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <h6 className="commonTableTitle">Send Notifications</h6>
                            <div className="d-flex align-items-center">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    className="searchInput"
                                    onChange={handleSearchChange}/>
                            </div>
                            <div className="d-flex align-items-center" style={{ gap: "6px" }}>
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}>
                                    <Button className="secondaryBtn" variant="secondary" onClick={handleShowFilterModal}>
                                        <MdFilterList />
                                    </Button>
                                </OverlayTrigger>

                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add</Tooltip>}>
                                    <Button className="primaryBtn" variant="primary" onClick={() => navigate("/addnotifications")}>
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
                                            notification_id: "No Records Found",
                                            group_id: "No Records Found",
                                        }]
                                    }
                                    pagination={Array.isArray(filteredRecords) && filteredRecords.length > 0}
                                    highlightOnHover
                                    responsive
                                    fixedHeader
                                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                                    conditionalRowStyles={[
                                        {
                                            when: (row) => row.notification_id === "No Records Found",
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

            <Modal show={showFilterModal} onHide={handleCloseFilterModal} className="commonFilterModal">
                <Modal.Header closeButton className="modalHeaderFixed">
                    <Modal.Title>Filter</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBodyScrollable">
                    <Form id="filterForm" onSubmit={handleFilterSubmit}>
                        <Row>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="class">
                                        <Form.Label>Notification</Form.Label>
                                        <Form.Select
                                            name="notification_id"
                                            id="notification_id"
                                            value={filter.notification_id}
                                            onChange={(e) => setFilter({ ...filter, notification_id: e.target.value })}>
                                            <option value="">Select Notification</option>
                                            {(notification || []).map((sendnotification) => (
                                                <option key={sendnotification.notification_id} value={sendnotification.notification_id}>
                                                    {sendnotification.subject}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="class">
                                        <Form.Label>Group</Form.Label>
                                        <Form.Select
                                            name="group_id"
                                            id="group_id"
                                            value={filter.group_id}
                                            onChange={(e) => setFilter({ ...filter, group_id: e.target.value })}>
                                            <option value="">Select Group</option>
                                            {(group || []).map((groups) => (
                                                <option key={groups.group_id} value={groups.group_id}>
                                                    {groups.group_name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modalFooterFixed">
                    <Button
                        variant="secondary"
                        className="btn-info clearBtn"
                        onClick={handleFilterClear}>
                        Reset
                    </Button>
                    <div>
                        <Button
                            variant="secondary"
                            className="btn-danger secondaryBtn me-2"
                            onClick={handleCloseFilterModal}>
                            Cancel
                        </Button>

                        <Button
                            variant="primary"
                            type="submit"
                            className="btn-success primaryBtn"
                            form="filterForm"
                            onClick={handleFilterSubmit} >
                            Search
                        </Button>
                    </div>
                </Modal.Footer>

            </Modal>
        </div>

    );
};
export default SendNotifications;
