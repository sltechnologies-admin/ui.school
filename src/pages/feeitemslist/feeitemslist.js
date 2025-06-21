import React, { useState, useEffect } from 'react';
import { MdAddCircle, MdFilterList } from "react-icons/md";
import { ToastContainer, toast } from 'react-toastify';
import { Button, Modal, Row, Col, Form, OverlayTrigger } from "react-bootstrap";
//Icons 
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
//Components
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import axios from "axios";
import DataTable from "react-data-table-component";
import { Tooltip } from '@mui/material';
import loading from "../../assets/images/common/loading.gif";
import { useFeeModuleAccess } from "../hooks/useFeeModuleAccess";
import { fetchDataRead } from "../../Utility";

const Feeitemslist = () => {
    const [feeitemslists, setfeeitemslists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => setShowFilterModal(true);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [feeCategories, setFeeCategories] = useState([]);
    const navigate = useNavigate();
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const [academicyears, setAcademicyears] = useState([]);

    const currentUserRole = userObj.role_name?.trim();
    const { canWrite } = useFeeModuleAccess(currentUserRole);

    useEffect(() => {
        document.title = "SCHOLAS";
        setIsLoading(true);
        fetchData("/feeitemslist/", setfeeitemslists).finally(() => setIsLoading(false));
        fetchDataRead("/feecategory/", setFeeCategories, userObj.school_id);
        fetchacademicyear();
    }, []);

    const handleEditClick = (fees_item_id) => {
        const employeemasterToEdit = feeitemslists.find(feeitemslist => feeitemslist.fees_item_id === fees_item_id);
        if (employeemasterToEdit) {
            navigate("/addfeeitemslist", { state: { feeitemslistData: employeemasterToEdit } });
        } else {
            console.error(`Fees Item Id ${fees_item_id} not found.`);
        }
    };

    const fetchData = async () => {
        try {
            const response = await axios.post(baseUrl + "/Feeitemslist/", { action: "READ", school_id: userObj.school_id });
            setfeeitemslists(response.data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

    const fetchacademicyear = async () => {
        try {
            const response = await axios.post(baseUrl + "/AcademicYear/", { action: "DROPDOWNREAD", school_id: userObj.school_id });
            setAcademicyears(response.data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

    const handleDeleteClick = async (fees_item_id) => {
        const confirmDelete = window.confirm('Are you sure you want to change the status');

        if (!confirmDelete) {
            return;
        }
        const requestBody = {
            fees_item_id: fees_item_id,
            action: "DELETE"
        };

        try {
            const response = await axios.post(baseUrl + '/Feeitemslist/', requestBody, {
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

    const columns = [
       
        {
            name: "Fees Item",
            selector: (row) => row.fees_item,
            sortable: true,
            cell: (row) => <Tooltip title={row.fees_item}>{row.fees_item}</Tooltip>,
        },
        {
            name: "Fee Category",
            selector: (row) => row.fee_category_name,
            sortable: true,
            cell: (row) =>
                filteredRecords.length > 0 ? (
                    <Tooltip title={row.fee_category_name}>{row.fee_category_name}</Tooltip>) : (<div className="noDataMessage">No Records Found</div>),
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => <Tooltip title={row.status}> {row.status}</Tooltip>
        },
        {
            name: "Actions",
            omit: !canWrite,
            cell: (row) =>
                filteredRecords.length > 0 ? (
                    <div className='tableActions'>
                        <Tooltip title="Edit" arrow>
                            <a className='commonActionIcons' onClick={() => handleEditClick(row.fees_item_id)}>
                                <span><MdEdit /></span>
                            </a>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                            <a className='commonActionIcons' onClick={() => handleDeleteClick(row.fees_item_id)}>
                                <span><MdDelete /></span>
                            </a>
                        </Tooltip>
                    </div>
                ) : null,

        },
    ];

    const searchableColumns = [
        (row) => row.fees_item,
        (row) => row.status,
        (row) => row.academic_year_name,
        (row) => row.fee_category_name,

    ];

    const trimmedQuery = searchQuery.trim().toLowerCase();

    const filteredRecords =
        trimmedQuery.length > 0
            ? (feeitemslists || []).filter((feeitemslist) =>
                searchableColumns.some((selector) => {
                    const value = selector(feeitemslist);
                    return String(value || "")
                        .toLowerCase()
                        .includes(trimmedQuery);
                })
            )
            : feeitemslists || [];

    const [form, setForm] = useState({
        fees_item: "",
        status: "",
      academic_year_id: userObj.academic_year_id || "",
        fee_category_id: "",
        action: "FILTER"
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const trimmedValue = value.trim();

        setForm((prevForm) => ({
            ...prevForm,
            [name]: trimmedValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            fees_item: form.fees_item,
            status: form.status || "A",
            school_id: userObj.school_id,
            fee_category_id: form.fee_category_id,
            academic_year_id: userObj.academic_year_id || 0,
            action: 'FILTER',
        };
        try {
            const response = await axios.post(baseUrl + "/Feeitemslist/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const filterData = response.data || [];

            setfeeitemslists(filterData);

            setShowFilterModal(false);

        } catch (error) {
            console.log("Full error object:", error);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setForm({
            fees_item: "",
            status: "",
            academic_year_id: "",
              fee_category_id: "",  
        });
        setShowFilterModal(true);

        fetchData();
    };

    const handleSearchChange = (event) => {
        setForm({
            fees_item: "",
            status: ""
        });
        fetchData();
        setSearchQuery(event.target.value);
    };

    return (
        <>
            <ToastContainer />
            <div className="pageMain">
                <LeftNav />
                <div className="pageRight">
                    <div className="pageHead">
                        <Header />
                    </div>
                    <div className="pageBody">
                        <div className="commonDataTableHead">
                            <div className="d-flex justify-content-between align-items-center w-100">
                                <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                                    <h6 className="commonTableTitle">Fee Items List({userObj.academic_year_name})</h6>
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
                                            <Button className="primaryBtn" variant="primary" onClick={() => navigate("/addfeeitemslist")}>
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
                                                : [{ fee_category_name: "No Records Found" }]
                                        }
                                        pagination={filteredRecords.length > 0}
                                        highlightOnHover
                                        responsive
                                        fixedHeader
                                        fixedHeaderScrollHeight="calc(100vh - 170px)"
                                    />
                                )}
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
                                    <div className="commonInput">
                                        <Form.Group>
                                            <Form.Label>
                                                Academic Year Name
                                            </Form.Label>
                                            <select
                                                className="form-select"
                                                name="academic_year_id"
                                                value={form.academic_year_id}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Academic Year Name</option>
                                                {(academicyears || []).map((academicyear) => (
                                                    <option key={academicyear.academic_year_id} value={academicyear.academic_year_id}>
                                                        {academicyear.academic_year_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </Form.Group>
                                    </div>
                                </Col>
                                <Col xs={12}>
                                    <div className='commonInput'>
                                        <Form.Group controlId="feesitem">
                                            <Form.Label>Fees Item</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="fees_item"
                                                value={form.fees_item}
                                                placeholder="Enter Item"
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^[a-zA-Z\s]*$/.test(value)) {
                                                        handleInputChange(e);
                                                    }
                                                }}
                                            />
                                        </Form.Group>
                                    </div>
                                </Col>
                                <Col xs={12} >
                                    <div className="commonInput">
                                        <Form.Group>
                                            <Form.Label>
                                                Fee Category<span className="requiredStar">*</span>
                                            </Form.Label>
                                            <select
                                                required
                                                className="form-select"
                                                id="fee_category_id"
                                                name="fee_category_id" 
                                                value={form.fee_category_id}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Fee Category</option>
                                                {(feeCategories || [])
                                                    .filter((category) => category.is_active === 'Active')
                                                    .map((category) => (
                                                        <option key={category.fee_category_id} value={category.fee_category_id}>
                                                            {category.fee_category_name}
                                                        </option>
                                                    ))}
                                            </select>


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
                                    className="btn-success primaryBtn"
                                    onClick={handleSubmit}
                                >
                                    Search
                                </Button>
                            </div>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </>
    );
};

export default Feeitemslist;
