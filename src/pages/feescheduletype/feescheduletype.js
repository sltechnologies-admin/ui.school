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

const FeeScheduleType = () => {
    const [feeScheduleTypes, setFeeScheduleTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const userData = sessionStorage.getItem('user');
    const userObj = JSON.parse(userData);

    const [form, setForm] = useState({
        fee_schedule_type_name: "",
        action: "FILTER"
    });

    useEffect(() => {
        setIsLoading(true);
        fetchData().finally(() => setIsLoading(false));
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.post(`${baseUrl}/feescheduletype/`, { action: "READ", school_id: userObj.school_id });
            setFeeScheduleTypes(response.data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

    const handleEditClick = (fee_schedule_type_id) => {
        const item = feeScheduleTypes.find(i => i.fee_schedule_type_id === fee_schedule_type_id);
        if (item) {
            navigate("/addfeescheduletype", { state: { feeScheduleTypeData: item } });
        } else {
            console.error(`Item with ID ${fee_schedule_type_id} not found.`);
        }
    };

    const handleDeleteClick = async (fee_schedule_type_id) => {
        if (!window.confirm('Are you sure you want to change the status?')) return;

        try {
            await axios.post(`${baseUrl}/feescheduletype/`, {
                fee_schedule_type_id,
                action: "DELETE"
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            toast.success("Status changed successfully");
            fetchData();
        } catch (error) {
            console.error("Delete Error:", error);
        }
    };

    const columns = [
        {
            name: 'Fee Schedule Type',
            selector: row => row.fee_schedule_type_name,
            cell: row => <Tooltip title={row.fee_schedule_type_name}><span>{row.fee_schedule_type_name}</span></Tooltip>,
            sortable: true,
        },
         {
        name: 'Default',
        selector: row => row.is_default,
        cell: row => (
            <Tooltip title={row.is_default}>
                <span>{row.is_default}</span>
            </Tooltip>
        ),
        sortable: true,
    },
        {
            name: 'Status',
            selector: row => row.is_active,
            cell: row => <Tooltip title={row.is_active}><span>{row.is_active}</span></Tooltip>,
            sortable: true,
        },
        {
            name: "Actions",
            cell: row =>
                row.is_active !== "No Records Found" ? (
                    <div className='tableActions'>
                        <Tooltip title="Edit" arrow>
                            <a className='commonActionIcons' onClick={() => handleEditClick(row.fee_schedule_type_id)}>
                                <span><MdEdit /></span>
                            </a>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                            <a className='commonActionIcons' onClick={() => handleDeleteClick(row.fee_schedule_type_id)}>
                                <span><MdDelete /></span>
                            </a>
                        </Tooltip>
                    </div>
                ) : null
        },
    ];

const filteredRecords = (feeScheduleTypes || []).filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    return (
        (item.fee_schedule_type_name || "").toLowerCase().includes(query) ||
        (String(item.is_active) || "").toLowerCase().includes(query) ||
        (String(item.is_default) || "").toLowerCase().includes(query)
    );
});


    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setForm(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${baseUrl}/feescheduletype/`, {
                fee_schedule_type_name: form.fee_schedule_type_name,
                school_id: userObj.school_id,
                action: "FILTER",
            });
            setFeeScheduleTypes(response.data || []);
            setShowFilterModal(false);
        } catch (error) {
            console.error("Filter Error:", error);
        }
    };

    const handleReset = async () => {
        setForm({ fee_schedule_type: "" });
        setShowFilterModal(false);
        fetchData();
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
                                <h6 className="commonTableTitle">Fee Schedule Type </h6>
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    className="searchInput"
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="d-flex align-items-center" style={{ gap: 6 }}>
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}>
                                    <Button className="secondaryBtn" onClick={() => setShowFilterModal(true)}>
                                        <MdFilterList />
                                    </Button>
                                </OverlayTrigger>
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add</Tooltip>}>
                                    <Button className="primaryBtn" onClick={() => navigate("/addfeescheduletype")}>
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
                                    data={filteredRecords.length > 0 ? filteredRecords : [{ is_active: 'No Records Found' }]}
                                    pagination={filteredRecords.length > 0}
                                    highlightOnHover
                                    responsive
                                    fixedHeader
                                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                                    conditionalRowStyles={[
                                        {
                                            when: row => row.is_active === "No Records Found",
                                            style: { textAlign: 'center', fontSize: '16px', color: 'red', backgroundColor: '#f9f9f9' },
                                        },
                                    ]}
                                />
                            )}
                        </div>
                    </div>
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
                                <Form.Group controlId="fee_schedule_type">
                                    <Form.Label>Fee Schedule Type</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="fee_schedule_type_name"
                                        value={form.fee_schedule_type_name}
                                        placeholder="Enter Fee Schedule Type"
                                        onChange={handleInputChange}
                                        maxLength={50}
                                    />
                                </Form.Group>
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer className="modalFooterFixed">
                    <Button className="btn-info clearBtn me-2" onClick={handleReset}>
                        Reset
                    </Button>
                    <div>
                        <Button className="btn-danger secondaryBtn me-2" onClick={() => setShowFilterModal(false)}>
                            Cancel
                        </Button>
                        <Button className="btn-success primaryBtn" onClick={handleSubmit}>
                            Search
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default FeeScheduleType;
