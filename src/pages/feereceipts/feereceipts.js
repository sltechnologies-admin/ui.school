import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Row, Col, Modal, Form, Button, OverlayTrigger } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { MdDelete, MdAddCircle } from "react-icons/md";
import { Tooltip } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { MdFilterList } from "react-icons/md";
// Components
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import loading from "../../assets/images/common/loading.gif";

const FeeReceipts = () => {
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
    const [feesTermsChild, setFeesTermsChild] = useState([]);
    const [baseFeesTerms, setBaseFeesTerms] = useState([]);
    const [students, setStudents] = useState([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);

    useEffect(() => {
        document.title = "SCHOLAS";
        fetchclasses(userId);
        fetchStudents();
        setIsLoading(true);
        fetchData().finally(() => setIsLoading(false));
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await axios.post(baseUrl + "/students/", {
                action: "READ",
                school_id: userObj.school_id,
            });
            const filterData = Array.isArray(response.data) ? response.data : [];

            const filteredStudents = filterData.filter(
                (item) => item.status?.toLowerCase() === "active"
            );
            setStudents(filteredStudents);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const fetchData = async () => {
        try {
            const response = await axios.post(
                baseUrl + "/getfeestudentreceiptstructure/",
                {
                    p_school_id: userObj.school_id,
                    p_academic_year_id: userObj.academic_year_id,
                }
            );

            const filterData = Array.isArray(response.data) ? response.data : [];

            const filteredParent = filterData.filter(
                (item) => item.category?.toLowerCase() === "class total"
            );
            setFeesTerms(filteredParent);
            setBaseFeesTerms(filteredParent);

            const filteredChild = filterData.filter(
                (item) => item.category?.toLowerCase() !== "class total"
            );
            setFeesTermsChild(filteredChild);
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
        class_id: 0,
        student_id: 0,
    });

    const handleFilterSubmit = async (e) => {
        e.preventDefault();

        const filteredData = baseFeesTerms.filter(
            (term) =>
                (String(filter.class_id) === "0" || !filter.class_id
                    ? true
                    : String(term.class_id) === String(filter.class_id)) &&
                (String(filter.student_id) === "0" || !filter.student_id
                    ? true
                    : String(term.student_id) === String(filter.student_id))
        );

        if (filteredData.length === 0) {
            setFeesTerms([]);
        } else {
            setFeesTerms(filteredData);
        }
        setShowFilterModal(false);
    };

    const handleFilterClear = async () => {
        setFilter({
            fee_schedule_id: "",
            amount_to_pay: "",
            academic_year_id: "",
            class_id: "",
            fees_item_id: "",
            student_id: "",
        });
        fetchData();
    };

    const handleFilterReset = async () => {
        setFilter({
            fee_schedule_id: "",
            amount_to_pay: "",
            academic_year_id: "",
            class_id: "",
            fees_item_id: "",
            student_id: ""
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
        (row) => row.fees_item,
        (row) => row.total_amount,
        (row) => row.student_name,
    ];

    const extractAllKeys = (data) => {
        const termKeys = new Set();
        const dueDateKeys = new Set();

        data.forEach((item) => {
            Object.keys(item).forEach((key) => {
                if (key.startsWith("Term")) {
                    termKeys.add(key.trim());
                }
                if (key.startsWith("due_date")) {
                    dueDateKeys.add(key.trim());
                }
            });
        });

        return {
            termKeys: Array.from(termKeys).sort(),
            dueDateKeys: Array.from(dueDateKeys).sort(),
        };
    };

    const { termKeys } = extractAllKeys(feesTerms);

    const dynamicTermColumns = termKeys.map((term) => ({
        name: term,
        selector: (row) => row[term],
        cell: (row) => {
            const termRegex = /^Term\s?\d+$/;

            const isTargetTerm = termRegex.test(term);

            const dueDateKey = isTargetTerm ? `due_date_${term}` : null;

            const dueDateStr = dueDateKey
                ? feesTerms.find((item) => item[dueDateKey])?.[dueDateKey]
                : null;

            const currentDate = new Date();
            const dueDate = dueDateStr ? new Date(dueDateStr.split("-").reverse().join("-")) : null;

            const valueKey = isTargetTerm ? `${term} Bal` : null;

            const termValue = valueKey
                ? feesTerms.find((item) => item[valueKey])?.[valueKey] || "N/A"
                : row[term];

            const isOverdue = isTargetTerm && dueDate && dueDate < currentDate && parseFloat(termValue) > 0;
            const backgroundColor = isOverdue ? "#c65911" : "inherit";
            const fontWeight = isOverdue ? "bold" : "normal";

            return (
                <Tooltip title={`${row[term]}`}>
                    <span
                        style={{
                            backgroundColor,
                            fontWeight,
                            padding: "2px",
                            borderRadius: "5px",
                        }}
                    >
                        {row[term]}
                    </span>
                </Tooltip>
            );
        },
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
        {
            name: "Academic Year",
            selector: (row) => row.academic_year_name,
            sortable: true,
            cell: (row) =>
                filteredRecords1.length > 0 ? (
                    <Tooltip title={row.academic_year_name}> {row.academic_year_name}</Tooltip>
                ) : (
                    <div className="noDataMessage">No Records Found</div>
                ),
        },
        {
            name: "Student Name",
            selector: (row) => row.student_name,
            cell: (row) => (
                <Tooltip title={row.student_name}>
                    <div
                        style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {row.student_name}
                    </div>
                </Tooltip>
            ),
            sortable: true,
            width: "155px"
        },
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
        {
            name: "Total Fee",
            selector: (row) => row.total,
            cell: (row) => (
                <span
                    style={{
                        cursor: "pointer",
                        color: "blue",
                        textDecoration: "underline",
                    }}
                    onClick={() => handleTotalAmountClick(row)}
                >
                    {row.total}
                </span>
            ),
            sortable: true,
        },
        ...dynamicTermColumns,
    ];

    const handleTotalAmountClick = (row) => {
        setSelectedRowData(row);
        setShowDetailsModal(true);
    };

    const ExpandableRowComponent = ({ data }) => {
        const [feesItems1, setFeesItems1] = useState([]);
        const [isLoading1, setIsLoading1] = useState(false);

        const fetchData = useCallback(async () => {
            if (!data.student_id) return;

            setIsLoading1(true);
            try {
                const response = await axios.post(baseUrl + "/getfeereciepts/", {
                    school_id: userObj.school_id,
                    academic_year_id: userObj.academic_year_id,
                    student_id: data.student_id,
                });

                let fetchedData = Array.isArray(response.data) ? response.data : [];

                fetchedData = fetchedData.map(item => ({
                    ...item,
                    student_id: data.student_id,
                }));

                setFeesItems1(fetchedData);
            } finally {
                setIsLoading1(false);
            }
        }, [data.student_id]);

        useEffect(() => {
            if (data.student_id) {
                fetchData();
            }
        }, [fetchData]);

        useEffect(() => {
            if (data.student_id) {
                fetchData();
            }
        }, [data.student_id]);

        const handleDeleteClick = async (fee_receipt_no) => {
            const confirmDelete = window.confirm("Are you sure you want change the status?");

            if (!confirmDelete) {
                return;
            }

            const requestBody = {
                school_id: userObj.school_id,
                academic_year_id: userObj.academic_year_id,
                fee_receipt_no: String(fee_receipt_no)
            };

            try {
                const response = await axios.post(baseUrl + '/deletefeereciepts/', requestBody, {
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
                name: "Receipt No",
                selector: (row) => row.fee_receipt_no,
                cell: (row) => (
                    <Tooltip title={row.fee_receipt_no}>
                        <span>{row.fee_receipt_no}</span>
                    </Tooltip>
                ),
                sortable: true,
            },
            {
                name: "Receipt Date",
                selector: (row) => row.reciept_date,
                cell: (row) => (
                    <Tooltip title={row.reciept_date}>
                        <span>{formatDate(row.reciept_date)}</span>
                    </Tooltip>
                ),
                sortable: true,
            },
            {
                name: "Term",
                selector: (row) => row.schedule_name,
                cell: (row) => (
                    <Tooltip title={row.schedule_name}>
                        <span>{row.schedule_name}</span>
                    </Tooltip>
                ),
                sortable: true,
            },
            {
                name: "Mode of Payment",
                selector: (row) => row.mode,
                cell: (row) => (
                    <Tooltip title={row.mode}>
                        <span>{row.mode}</span>
                    </Tooltip>
                ),
                sortable: true,
            },
            {
                name: "Paid Amount",
                selector: (row) => row.amount_paid,
                cell: (row) => (
                    <Tooltip title={row.amount_paid}>
                        {row.amount_paid}
                    </Tooltip>
                ),
                sortable: true,
            },
            {
                name: "Remarks",
                selector: (row) => row.remarks,
                cell: (row) => (
                    <Tooltip title={row.remarks}>
                        <span>{row.remarks}</span>
                    </Tooltip>
                ),
                sortable: true,
            },
            {
                name: "Actions",
                cell: (row) =>
                    feesItems1.length > 0 ? (
                        <div className='tableActions'>
                            <Tooltip title="Delete" arrow>
                                <a className='commonActionIcons' style={{ cursor: 'pointer' }} onClick={() => handleDeleteClick(row.fee_receipt_no)}>
                                    <span><MdDelete /></span> </a>
                            </Tooltip>
                        </div>
                    ) : null,
            },
        ];

        const formatDate = (date) => {
            if (!date) return "";

            const d = new Date(date);

            if (isNaN(d.getTime())) {
                return "";
            }

            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();

            return `${day}-${month}-${year}`;
        };

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
                        data={
                            feesItems1.length > 0
                                ? feesItems1
                                : [{ schedule_name: "No records found" }]
                        }
                        noHeader
                        dense
                        customStyles={customStyles}
                        conditionalRowStyles={conditionalRowStyles}
                        expandableRows
                        expandableRowsComponent={ChildHyperLinkComponent}
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
                backgroundColor:
                    row.class_name === "Total:" ? "#f0f0f0" : "transparent",
            }),
        },
    };

    const HyperLinkComponent = ({ data }) => {
        const [isLoading1, setIsLoading1] = useState(false);

        const filteredData =
            Array.isArray(feesTermsChild) && feesTermsChild.length > 0
                ? feesTermsChild
                    .filter(
                        (item) =>
                            item.student_id === data.student_id &&
                            item.class_id === data.class_id
                    )
                    .sort((a, b) => (a.category > b.category ? 1 : -1))
                : [];

        const dynamicKeys =
            filteredData.length > 0
                ? Object.keys(filteredData[0]).filter(
                    (key) => key.toLowerCase().startsWith("term") && !key.toLowerCase().includes("bal")
                )
                : [];


        const dynamicColumns = dynamicKeys.map((key) => {
            const match = key.match(/(.+)\s\((.+)\)/);
            const term = match ? match[1] : key;

            return {
                name: (
                    <div style={{ textAlign: "right" }}>
                        <div>{term}</div>
                    </div>
                ),
                selector: (row) => row[key],
                cell: (row) => (
                    <Tooltip title={row[key]}>
                        <span
                            style={{ textAlign: "right", display: "block" }}
                        >
                            {row[key]}
                        </span>
                    </Tooltip>
                ),
                sortable: true,
                right: true,
                style: { textAlign: "right" },
            };
        });

        const columns = [
            {
                name: "Fees Item",
                selector: (row) => row.category,
                cell: (row) => (
                    <Tooltip title={row.category}>
                        <span>{row.category}</span>
                    </Tooltip>
                ),
                sortable: true,
                width: "150px",
            },
            ...dynamicColumns,
            {
                name: <span style={{ paddingRight: "22px" }}>Total</span>,
                selector: (row) => row.total,
                cell: (row) => (
                    <Tooltip title={row.total}>
                        <span
                            style={{ textAlign: "right", display: "block" }}
                        >
                            {row.total}
                        </span>
                    </Tooltip>
                ),
                sortable: true,
                right: true,
                style: { textAlign: "right" },
            },
        ];

        const columnSums = filteredData.reduce((acc, row) => {
            Object.keys(row).forEach((key) => {
                if (typeof row[key] === "number") {
                    acc[key] = (acc[key] || 0) + row[key];
                }
            });
            return acc;
        }, {});

        const footerRow = {
            class_name: "Total",
            category: "Total",
            ...Object.fromEntries(
                Object.keys(columnSums).map((key) => [key, columnSums[key] || "-"])
            ),
        };

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
            <div>
                {isLoading1 ? (
                    <div className="loadingContainer">
                        <img src={loading} alt="Loading..." className="loadingGif" />
                    </div>
                ) : (
                    <DataTable
                        key="hyperLinkTable"
                        className="custom-table"
                        columns={columns}
                        data={[...filteredData, footerRow]}
                        highlightOnHover
                        responsive
                        fixedHeader
                        fixedHeaderScrollHeight="calc(100vh - 170px)"
                        conditionalRowStyles={conditionalRowStyles}
                    />
                )}
            </div>
        );
    };

    const ChildHyperLinkComponent = ({ data }) => {
        const [feesItems1, setFeesItems1] = useState([]);
        const [isLoading1, setIsLoading1] = useState(false);

        const fetchData = useCallback(async () => {
            if (!data.student_id) return;

            setIsLoading1(true);
            try {
                const response = await axios.post(baseUrl + "/getfeerecieptsdetails/", {
                    school_id: userObj.school_id,
                    academic_year_id: userObj.academic_year_id,
                    student_id: data.student_id,
                    fee_receipt_no: data.fee_receipt_no
                });

                const fetchedData = Array.isArray(response.data) ? response.data : [];

                setFeesItems1(fetchedData);
            } finally {
                setIsLoading1(false);
            }
        }, [data.fee_receipt_no]);

        useEffect(() => {
            if (data.fee_receipt_no) {
                fetchData();
            }
        }, [fetchData]);

        useEffect(() => {
            if (data.fee_receipt_no) {
                fetchData();
            }
        }, [data.fee_receipt_no]);

        const columns = [
            {
                name: "Fees Item",
                selector: (row) => row.fees_item,
                cell: (row) => (
                    <Tooltip title={row.fees_item}>
                        <span>{row.fees_item}</span>
                    </Tooltip>
                ),
                sortable: true,
            },
            {
                name: <span style={{ paddingRight: "12px" }}>Amount Paid</span>,
                selector: (row) => row.amount_paid,
                cell: (row) => (
                    <Tooltip title={row.amount_paid}>
                        <span

                        >
                            {row.amount_paid}
                        </span>
                    </Tooltip>
                ),
                sortable: true,
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

        const footerRow = {
            class_name: "Total",
            fees_item: "Total",
            ...Object.fromEntries(
                Object.keys(columnSums).map((key) => [key, columnSums[key] || "-"])
            ),
        };

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
                        key="childHyperLinkTable"
                        className="custom-table"
                        columns={columns}
                        data={
                            feesItems1.length > 0
                                ? [...feesItems1, footerRow]
                                : [{ fees_item: "No records found" }]
                        }
                        highlightOnHover
                        responsive
                        fixedHeader
                        fixedHeaderScrollHeight="calc(100vh - 170px)"
                        customStyles={customStyles}
                        conditionalRowStyles={conditionalRowStyles}
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
                                <h6 className="commonTableTitle">Fee Receipts</h6>
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
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip id="tooltip-top">Add</Tooltip>}
                                >
                                    <Button
                                        className="primaryBtn"
                                        variant="primary"
                                        onClick={() => navigate("/addfeereceipts")}
                                    >
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
                                    key="feesItemsTable"
                                    className="custom-table"
                                    columns={columnsFeesItem}
                                    data={
                                        filteredRecords1.length > 0
                                            ? filteredRecords1
                                            : [{ academic_year_name: "No records found" }]
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
                                        <Form.Label>Class</Form.Label>
                                        <select
                                            type="number"
                                            className="form-select"
                                            id="class_id"
                                            value={filter.class_id}
                                            onChange={(e) =>
                                                setFilter({ ...filter, class_id: e.target.value })
                                            }
                                        >
                                            <option value="">Class</option>
                                            {(classes || []).map((classe) => (
                                                <option key={classe.class_id} value={classe.class_id}>
                                                    {classe.class_name}
                                                </option>
                                            ))}
                                        </select>
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className="commonInput">
                                    <Form.Group>
                                        <Form.Label>Student Name</Form.Label>
                                        <select
                                            type="number"
                                            className="form-select"
                                            id="student_id"
                                            value={filter.student_id}
                                            onChange={(e) =>
                                                setFilter({
                                                    ...filter,
                                                    student_id: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="0">Select Student Name</option>
                                            {(students || []).map((student) => (
                                                <option
                                                    key={student.student_id}
                                                    value={student.student_id}
                                                >
                                                    {student.student_first_name}{" "}
                                                    {student.student_last_name}
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
                            onClick={() => {
                                handleCloseFilterModal();
                                handleFilterClear();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            className="primaryBtn"
                            form="filterForm"
                            onClick={handleCloseFilterModal}
                        >
                            Search
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
            <Modal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                dialogClassName="custom-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Details for {selectedRowData?.student_name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRowData && <HyperLinkComponent data={selectedRowData} />}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        className="btn-success primaryBtn"
                        onClick={() => setShowDetailsModal(false)}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default FeeReceipts;
