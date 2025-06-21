import React, { useState, useEffect, useCallback } from 'react';
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

const Feeitems = () => {
    const [feesitems, setFeesitems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [classes, setClasses] = useState([]);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => setShowFilterModal(true);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const [feesItemsAmount, setFeesItemsAmount] = useState([]);

    const currentUserRole = userObj.role_name?.trim();
    const { canWrite } = useFeeModuleAccess(currentUserRole);

    useEffect(() => {
        document.title = "SCHOLAS";
        fetchData();
        fetchclasses();
        setIsLoading(true);
        fetchFeesItemsAmount().finally(() => setIsLoading(false));
    }, []);

    const handleEditClick = (fees_items_amount_id) => {
        const employeemasterToEdit = feesitems.find(feesitem => feesitem.fees_items_amount_id === fees_items_amount_id);

        if (employeemasterToEdit) {
            navigate("/addfeeitems", { state: { feesitemsData: employeemasterToEdit } });
        } else {
            console.error(`Fees Items Amount with ID ${fees_items_amount_id} not found.`);
        }
    };

    const fetchData = async () => {
        try {
            const response = await axios.post(baseUrl + "/feeitemsamount/", { action: "READ", school_id: userObj.school_id, academic_year_id: userObj.academic_year_id });
            setFeesitems(response.data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

    const fetchFeesItemsAmount = async () => {
        try {
            const response = await axios.post(baseUrl + "/feeitemsamount/", { action: "TOTALREAD", school_id: userObj.school_id, academic_year_id: userObj.academic_year_id });
            setFeesItemsAmount(response.data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

    const fetchclasses = async () => {
        try {
            const response = await axios.post(baseUrl + "/classes/", { action: "READ", school_id: userObj.school_id });
            const filterData = Array.isArray(response.data) ? response.data : [];

            const filteredClasses = filterData.filter(
                item => item.is_active?.toLowerCase() === 'active'
            );
            setClasses(filteredClasses);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

    const handleDeleteClick = async (fees_items_amount_id) => {
        const confirmDelete = window.confirm('Are you sure you want to change the status');

        if (!confirmDelete) {
            return;
        }
        const requestBody = {
            fees_items_amount_id: fees_items_amount_id,
            action: "DELETE"
        };

        try {
            const response = await axios.post(baseUrl + '/feeitemsamount/', requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            toast.success("Record Set To  Inactive ");
        }
        catch (error) {
            console.error('Error:', error);
        }
    };

    const columns = [
        {
            name: "Class",
            selector: (row) => row.class_name || "No Records Found",
            sortable: true,
            cell: (row) =>

                <Tooltip title={row.class_name}> {row.class_name}</Tooltip>

        },
        {
            name: "Total Amount",
            selector: (row) => Number(row.total_amount), // Needed for sorting
            sortable: true,
            cell: (row) => {
                const amount = Number(row.total_amount);
                const formattedAmount = isNaN(amount)
                    ? ""
                    : new Intl.NumberFormat('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).format(amount);

                return filteredRecords.length > 0 ? (
                    <Tooltip title={formattedAmount}>{formattedAmount}</Tooltip>
                ) : (
                    <div className="noDataMessage">No Records Found</div>
                );
            }
        }

    ];

    const customStyles = {
        headCells: {
            style: {
                backgroundColor: "#EAE4E4",
                color: "#757575",
                fontSize: "14px",
                textAlign: "center",
            },
            className: "commonTH",
        },
        cells: {
            style: {
                fontSize: "14px",

            },
            className: "commonTD",
        },
    };

    const searchableColumns = [
        (row) => row.class_name,
        (row) => row.total_amount,
        

    ];

    const trimmedQuery = searchQuery.trim().toLowerCase();
    const filteredRecords =
        trimmedQuery.length > 0
            ? (feesItemsAmount || []).filter((feesItemsAmount) =>
                searchableColumns.some((selector) => {
                    const value = selector(feesItemsAmount);
                    return String(value || "")
                        .toLowerCase()
                        .includes(trimmedQuery);
                })
            )
            : feesItemsAmount || [];

    const [form, setForm] = useState({
        fees_item_id: "",
        academic_year_id: "",
        academic_year_name: "",
        class_id: "",
        class_name: "",
        fees_item_id: "",
        fees_item: "",
        fees_item_amount: "",
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
            academic_year_id: userObj.academic_year_id || null,
            class_id: form.class_id || null,
            fees_item_id: form.fees_item_id || null,
            fees_item_amount: form.fees_item_amount || null,
            school_id: userObj.school_id || null,
            action: 'TOTALFILTER',
        };

        try {

            const response = await axios.post(baseUrl + "/feeitemsamount/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const filterData = response.data || [];

            setFeesItemsAmount(filterData);
            setShowFilterModal(false);
        } catch (error) {
            console.log("Full error object:", error);
        }
    };

    const fetchFeeItemsDetails = async (formData) => {
        try {
            const response = await axios.post(baseUrl + "/feeitemsamount/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response.data || [];
        } catch (error) {
            console.log("Full error object:", error);
            return [];
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setForm({
            class_id: "",
            class_name: "",
            fees_item_id: "",
            fees_item: "",
            fees_item_amount: "",
        });

        fetchFeesItemsAmount();
        setShowFilterModal(true);
    };

    const handleSearchChange = (event) => {
        setForm({
            fees_item_id: "",
            academic_year_id: "",
            academic_year_name: "",
            class_id: "",
            class_name: "",
            fees_item: "",
            fees_item_amount: "",
        });

        fetchFeesItemsAmount();
        setSearchQuery(event.target.value);
    };

    // const expandableColumns = [
    //     {
    //         name: "Fees Item",
    //         selector: (row) => <Tooltip title={row.fees_item}> {row.fees_item}</Tooltip>,
    //         sortable: true,
    //     },
    //     {
    //         name: "Fees Item Amount",
    //         selector: (row) => {
    //             const amount = Number(row.fees_item_amount);
    //             const formattedAmount = isNaN(amount)
    //                 ? ""
    //                 : new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

    //             return <Tooltip title={formattedAmount}>{formattedAmount}</Tooltip>;
    //         },
    //         sortable: true,
    //         cell: (row) =>
    //             filteredRecords.length > 0 ? (
    //                 <Tooltip title={row.fees_item_amount}> {row.fees_item_amount}</Tooltip>
    //             ) : (
    //                 <div className="noDataMessage">No Records Found</div>
    //             ),
    //     }
    // ];
    const expandableColumns = [
        {
            name: "Fees Item",
            selector: (row) => row.fees_item,
            sortable: true,
            cell: (row) => <Tooltip title={row.fees_item}>{row.fees_item}</Tooltip>,
        },
        {
            name: "Fees Item Amount",
            selector: (row) => {
                const amount = Number(row.fees_item_amount);
                return isNaN(amount) ? 0 : amount;
            },
            sortable: true,
            cell: (row) => {
                if (filteredRecords.length > 0) {
                    const formattedAmount = new Intl.NumberFormat('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).format(Number(row.fees_item_amount));

                    return <Tooltip title={formattedAmount}>{formattedAmount}</Tooltip>;
                } else {
                    return <div className="noDataMessage">No Records Found</div>;
                }
            },
        }
    ];


    const getFeesItems = (academic_year_id, class_id) => {
        return {
            academic_year_id: academic_year_id || null,
            class_id: class_id || null,
            school_id: userObj.school_id || null,
            action: 'FILTER',
        };
    };

    const ExpandableRowComponent = ({ data }) => {
        const [feesItemsChild, setFeesItemsChild] = useState([]);
        const [isLoadingChild, setIsLoadingChild] = useState(false);

        const fetchData = useCallback(async () => {
            setIsLoadingChild(true);
            try {
                const formData = getFeesItems(userObj.academic_year_id, data.class_id);

                const fetchedData = await fetchFeeItemsDetails(formData);

                setFeesItemsChild(fetchedData);

                if (Array.isArray(fetchedData) && fetchedData.length === 0) {
                    fetchFeesItemsAmount();
                }
            } finally {
                setIsLoadingChild(false);
            }
        }, [data.class_id]);

        useEffect(() => {
            if (data.class_id) {
                fetchData();
            }
        }, [fetchData]);

        useEffect(() => {
            if (data.class_id) {
                fetchData();
            }
        }, [data.class_id]);

        const handleDelete = async (fees_items_amount_id) => {
            await handleDeleteClick(fees_items_amount_id);
            fetchData();
        };

        return (
            <div style={{
                padding: "12px",
                marginLeft: "100px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #f9f9f9 0%, #e6e6e6 100%)",
                boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.1)"
            }}>
                {isLoadingChild ? (
                    <div className="loadingContainer">
                        <img src={loading} alt="Loading..." className="loadingGif" />
                    </div>
                ) : (
                    <DataTable
                        columns={[
                            ...expandableColumns,
                            {
                                name: "Actions",
                                omit: !canWrite,
                                cell: (row) =>
                                    filteredRecords.length > 0 ? (
                                        <div className='tableActions'>
                                            <Tooltip title="Edit" arrow>
                                                <a className='commonActionIcons' onClick={() => handleEditClick(row.fees_items_amount_id)}>
                                                    <span><MdEdit /></span>
                                                </a>
                                            </Tooltip>
                                            <Tooltip title="Delete" arrow>
                                                <a className='commonActionIcons' onClick={() => handleDelete(row.fees_items_amount_id)}>
                                                    <span><MdDelete /></span>
                                                </a>
                                            </Tooltip>
                                        </div>
                                    ) : null,
                            },
                        ]}
                        data={
                            feesItemsChild.length > 0
                                ? feesItemsChild
                                : [{ fees_item: "" }]
                        }
                        // noHeader dense
                        customStyles={customStyles}
                    />
                )}
            </div>
        );
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
                                <h6 className="commonTableTitle">Fees Items Amount</h6>
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
                                        <Button className="primaryBtn" variant="primary" onClick={() => navigate("/addfeeitems")}>
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
                                            : [{ total_amount: "No Records Found" }]
                                    }
                                    pagination={filteredRecords.length > 0}
                                    highlightOnHover
                                    responsive
                                    fixedHeader
                                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                                    expandableRows
                                    expandableRowsComponent={ExpandableRowComponent}
                                    expandableRowDisabled={(row) => {
                                       
                                        return !row.class_id || row.total_amount === "No Records Found";
                                    }}
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
                            <div className="commonInput">
                                <Form.Group>
                                    <Form.Label>
                                        Class
                                    </Form.Label>
                                    <select
                                        required
                                        className="form-select"
                                        name="class_id"
                                        value={form.class_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Class</option>
                                        {(classes || []).map((classe) => (
                                            <option key={classe.class_id} value={classe.class_id}>
                                                {classe.class_name}
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
    );
};

export default Feeitems;
