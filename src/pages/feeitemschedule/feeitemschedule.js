import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Row, Col, Modal, Form, Button, OverlayTrigger, } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdAddCircle } from "react-icons/md";
import { Tooltip } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { MdFilterList } from "react-icons/md";
// Components
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import loading from "../../assets/images/common/loading.gif";
import { useFeeModuleAccess } from "../hooks/useFeeModuleAccess";

const Feeitemschedule = () => {
    const userData = sessionStorage.getItem("user");
    const userObj = userData ? JSON.parse(userData) : {};
    const userIdStr = userObj.school_id;
    const userId = parseInt(userIdStr, 10);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => setShowFilterModal(true);
    const [classes, setClass] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [feesTerms, setFeesTerms] = useState([]);
    const [baseFeesTerms, setBaseFeesTerms] = useState([]);

    const currentUserRole = userObj.role_name?.trim();
    const { canWrite } = useFeeModuleAccess(currentUserRole);

    useEffect(() => {
        document.title = "SCHOLAS";
        fetchclasses(userId);
        setIsLoading(true);
        fetchData().finally(() => setIsLoading(false));
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.post(baseUrl + "/getfeestructure/", {
                p_school_id: userObj.school_id,
                p_academic_year_id: userObj.academic_year_id,
            });

            const filterData = Array.isArray(response.data) ? response.data : [];

            const filteredParent = filterData.filter(
                (item) => item.category?.toLowerCase() === "class total"
            );
            const filteredWithOnetime = filteredParent.map((item) => {
                const isOnetime = item.schedule_name?.toLowerCase().includes("others");
                return {
                    ...item,
                    schedule_display_name: isOnetime ? "Others" : item.schedule_name
                };
            });
            setFeesTerms(filteredWithOnetime);
            setBaseFeesTerms(filteredWithOnetime);

            console.log(filteredParent);
            setFeesTerms(filteredParent);
            setBaseFeesTerms(filteredParent);

        } catch (error) {
            console.error("Error fetching Fees items:", error);
        }
    };

    const fetchclasses = async (userId) => {
        try {
            const response = await axios.post(baseUrl + "/classes/", {
                action: "READ",
                school_id: userId,
            });
            const filterData = Array.isArray(response.data) ? response.data : [];

            const filteredClasses = filterData.filter(
                (item) => item.is_active?.toLowerCase() === "active"
            );
            setClass(filteredClasses);
        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    };

    const [filter, setFilter] = useState({
        fee_schedule_id: 0,
        amount_to_pay: 0,
        academic_year_id: 0,
        class_id: 0,
        fees_item_id: 0,
    });

    const handleFilterSubmit = async (e) => {
        e.preventDefault();

        const filteredData = baseFeesTerms.length > 0
            ? baseFeesTerms.filter(term => String(term.class_id) === String(filter.class_id))
            : [];

        if (filteredData.length === 0) {
            setFeesTerms([]);
        } else {
            setFeesTerms(filteredData);
        }
        setShowFilterModal(false);
    };

    const handleFilterReset = async () => {
        setFilter({
            fee_schedule_id: "",
            amount_to_pay: "",
            academic_year_id: "",
            class_id: "",
            fees_item_id: "",
        });

        setShowFilterModal(true);
        fetchData();
    }

    const handleSearchChange = (event) => {
        setFilter({
            fee_schedule_id: "",
            amount_to_pay: "",
            academic_year_id: "",
            class_id: "",
            fees_item_id: "",
        });
        setSearchQuery(event.target.value);
    };

    const searchableColumns1 = [
        (row) => row.academic_year_name,
        (row) => row.class_name,
    ];

    const extractTermKeys = (data) => {
        const termKeys = new Set();
        data.forEach((item) => {
            Object.keys(item).forEach((key) => {
             
                    termKeys.add(key);
              
            });
        });
        return Array.from(termKeys).sort();
    };

    const termKeys = extractTermKeys(feesTerms);

    const dynamicTermColumns = termKeys.map((term) => ({
        name: term,
        selector: (row) => row[term],
        cell: (row) => (
            <Tooltip title={row[term]}>
                <span>{row[term]}</span>
            </Tooltip>
        ),
        sortable: true,
    }));

    const trimmedQuery1 = searchQuery.trim().toLowerCase();
    const filteredRecords1 =
        trimmedQuery1.length > 0
            ? (feesTerms || []).filter((feesTerms) =>
                searchableColumns1.some((selector) => {
                    const value = selector(feesTerms);
                    return String(value || "")
                        .toLowerCase()
                        .includes(trimmedQuery1);
                })
            )
            : feesTerms || [];

    const columnsFeesItem = [
        // {
        //     name: "Academic Year",
        //     selector: (row) => userObj.academic_year_name,
        //     sortable: true,
        //     cell: (row) =>
        //         filteredRecords1.length > 0 ? (
        //             <Tooltip title={userObj.academic_year_name}> {userObj.academic_year_name}</Tooltip>
        //         ) : (
        //             <div className="noDataMessage">No Records Found</div>
        //         ),
        // },
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
        ...dynamicTermColumns,
        {
            name: "Total Amount",
            selector: (row) => row.total,
            cell: (row) => (
                <Tooltip title={row.total}>
                    <span>{row.total}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Actions",
            omit: !canWrite,
            cell: (row) =>
                filteredRecords1.length > 0 ? (
                    <div className="tableActions">
                        <Tooltip title="Edit" arrow>
                            <a
                                className="commonActionIcons"
                                onClick={() => handleEditClick(row.class_id)}
                            >
                                <MdEdit />
                            </a>
                        </Tooltip>
                    </div>
                ) : null,
        },
    ];

    const handleEditClick = (class_id) => {
        const feesToEdit = feesTerms.find(
            (feesTerms) =>
                feesTerms.class_id === class_id
        );

        if (feesToEdit) {
            const updatedFeesToEdit = {
                ...feesToEdit,
                academic_year_id: userObj.academic_year_id,
            };

            navigate("/addfeeitemschedule", {
                state: {
                    userData: updatedFeesToEdit,
                },
            });
        } else {
            console.error(`User with ID ${class_id} not found.`);
        }
    };

    const ExpandableRowComponent = ({ data }) => {
        const [feesItems1, setFeesItems1] = useState([]);
        const [isLoading1, setIsLoading1] = useState(false);

        const fetchData = useCallback(async () => {
            if (!data.class_id) return;

            setIsLoading1(true);
            try {
                const response = await axios.post(baseUrl + "/getfeereport/", {
                    p_school_id: userObj.school_id,
                    p_academic_year_id: userObj.academic_year_id,
                    p_class_id: data.class_id,
                });

                const fetchedData = Array.isArray(response.data) ? response.data : [];
                setFeesItems1(fetchedData);
                

            } finally {
                setIsLoading1(false);
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

        const dynamicKeys =
            feesItems1.length > 0
                ? Object.keys(feesItems1[0]).filter(
                    (key) =>
                        !["term", "class_id", "class_name", "total_amount", "due_date", "fees_item", "fees_item_amount"].includes(key)
                )
                : [];

        const dynamicColumns = dynamicKeys.map((key) => {

            const match = key.match(/(.+)\s\((.+)\)/);
            const term = match ? match[1] : key;
            const date = match ? match[2] : "";

            return {
                name: (
                    <div style={{ textAlign: "right" }}>
                        <div>{term}</div>
                        {date && (
                            <div style={{ fontSize: "12px", color: "#757575" }}>
                                ({date})
                            </div>
                        )}
                    </div>
                ),
                selector: (row) => row[key],
                cell: (row) => (
                    <Tooltip title={row[key]}>
                        <span style={{ textAlign: "right", display: "block" }}>{row[key]}</span>
                    </Tooltip>
                ),
                sortable: true,
                right: "true",
                style: { textAlign: "right" },
                //width: "200px",
            };
        });

        const columns = [
            // {
            //     name: "Fees Item",
            //     selector: (row) => row.fees_item,
            //     cell: (row) => (
            //         <Tooltip title={row.fees_item}>
            //             <span>{row.fees_item}</span>
            //         </Tooltip>
            //     ),
            //     sortable: true,
            //     width: "150px"
            // },
            {
                name: "Fees Item",
                selector: (row) => row.fees_item,
               
                cell: (row) =>
                    feesItems1.length > 0 ? (
                        <Tooltip title={row.fees_item}> {row.fees_item}</Tooltip>
                    ) : (
                        <div className="noDataMessage">No Records Found</div>
                    ),
            },
            ...dynamicColumns,
            {
                name: "Total Amount",
                selector: (row) => row.total_amount,
                cell: (row) => (
                    <Tooltip title={row.total_amount}>
                        <span style={{ textAlign: "right", display: "block" }}>{row.total_amount}</span>
                    </Tooltip>
                ),
                sortable: true,
                right: "true",
                style: { textAlign: "right" },
            },

        ];

        const columnSums = feesItems1.reduce((acc, row) => {
            Object.keys(row).forEach((key) => {
                if (typeof row[key] === "number") {
                    acc[key] = (acc[key] || 0) + row[key];
                }
            });
            return acc;
        }, {});

        // const footerRow = {
        //     //feesItems1
        //     class_name: "Total",
        //     fees_item: "Total",
        //     ...Object.fromEntries(
        //         Object.keys(columnSums).map((key) => [key, columnSums[key] || "-"])
        //     ),
        // };

        const footerRow = feesItems1.length > 0 ? {
            class_name: "Total",
            fees_item: "Total",
            ...Object.fromEntries(
                Object.keys(columnSums).map((key) => [key, columnSums[key] || "-"])
            ),
        } : [];

        const conditionalRowStyles = [
            {
                when: (row) => row.class_name === "Total",
                style: {
                    fontWeight: "bold",
                    backgroundColor: "#f0f0f0",
                    borderTop: "1px solid #000",
                },
            },
        ];

        return (
            <div
                style={{
                    padding: "12px",
                    marginLeft: "20px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #f9f9f9 0%, #e6e6e6 100%)",
                    boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.1)",
                }}
            >
                {isLoading1 ? (
                    <div className="loadingContainer">
                        <img src={loading} alt="Loading..." className="loadingGif" />
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={[...feesItems1, footerRow]}
                        noHeader
                        dense
                        customStyles={customStyles}
                        conditionalRowStyles={conditionalRowStyles}
                    />
                )}
            </div>
        );
    };

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
        rows: {
            style: (row) => ({
                fontWeight: row.class_name === "Total:" ? "bold" : "normal",
                backgroundColor: row.class_name === "Total:" ? "#f0f0f0" : "transparent",
            }),
        },
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
                                <h6 className="commonTableTitle">Fees Item Schedule</h6>
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
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}
                                >
                                    <Button
                                        className="secondaryBtn"
                                        variant="secondary"
                                        onClick={handleShowFilterModal}
                                    >
                                        <MdFilterList />
                                    </Button>
                                </OverlayTrigger>
                                {canWrite && (
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip id="tooltip-top">Add</Tooltip>}
                                    >
                                        <Button
                                            className="primaryBtn"
                                            variant="primary"
                                            onClick={() => navigate("/addfeeitemschedule")}
                                        >
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
                                    key="feesItemsTable"
                                    className="custom-table"
                                    columns={columnsFeesItem}
                                    data={
                                        filteredRecords1.length > 0
                                            ? filteredRecords1
                                            : [{ academic_year_name: "No Records Found" }]
                                    }
                                    pagination={filteredRecords1.length > 0}
                                    highlightOnHover
                                    responsive
                                    fixedHeader
                                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                                    expandableRows
                                    expandableRowsComponent={ExpandableRowComponent}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                show={showFilterModal}
                onHide={handleCloseFilterModal}
                className="commonFilterModal"
            >
                <Modal.Header closeButton className="modalHeaderFixed">
                    <Modal.Title>Filter</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBodyScrollable">
                    <Form id="filterForm" onSubmit={handleFilterSubmit}>
                        <Row>
                            <Col xs={12}>
                                <div className="commonInput">
                                    <Form.Group>
                                        <Form.Label> Class</Form.Label>
                                        <select
                                            type="number"
                                            className="form-select"
                                            id="class_id"
                                            value={filter.class_id}
                                            onChange={(e) =>
                                                setFilter({ ...filter, class_id: e.target.value })
                                            }
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
                        <Button
                            variant="primary"
                            className="primaryBtn"
                            onClick={handleFilterSubmit}
                        >
                            Search
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Feeitemschedule;
