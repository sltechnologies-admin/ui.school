import React, { useEffect, useState } from "react";
import axios from "axios";
import { Row, Col, Modal, Form, Button, OverlayTrigger, } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { MdEdit } from "react-icons/md";
import { Tooltip } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { MdFilterList } from "react-icons/md";
// Components
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import loading from "../../assets/images/common/loading.gif";
import { useFeeModuleAccess } from "../hooks/useFeeModuleAccess";

const Feesstudentsschedule = () => {
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
    const [filteredStudents, setFilteredStudents] = useState([]);

    const [feesTermsChild, setFeesTermsChild] = useState([]);
    const [baseFeesTerms, setBaseFeesTerms] = useState([]);
    const [students, setStudents] = useState([]);

    const currentUserRole = userObj.role_name?.trim();
    const { canWrite } = useFeeModuleAccess(currentUserRole);

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
                school_id: userObj.school_id
            });
            const filterData = Array.isArray(response.data) ? response.data : [];

            const filteredStudents = filterData.filter(
                item => item.status?.toLowerCase() === 'active'
            );
            setStudents(filteredStudents);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const fetchData = async () => {
        try {
            const response = await axios.post(baseUrl + "/getfeestudentstructure/", {
                p_school_id: userObj.school_id,
                p_academic_year_id: userObj.academic_year_id,
            });

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

        const filteredData = baseFeesTerms.filter(term =>
            (String(filter.class_id) === "0" || !filter.class_id ? true : String(term.class_id) === String(filter.class_id)) &&
            (String(filter.student_id) === "0" || !filter.student_id ? true : String(term.student_id) === String(filter.student_id))
        );

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
        (row) => row.admission_number,
        (row) => row.class_name,
        (row) => row.fees_item,
        (row) => row.total_amount,
        (row) => row.student_name,
    ];

    const extractTermKeys = (data) => {
        const termKeys = new Set();
        data.forEach((item) => {
            Object.keys(item).forEach((key) => {
                if (key.toLowerCase().includes("term") || key.toLowerCase().includes("others")) {
                    termKeys.add(key);
                }
            });
        });
        return Array.from(termKeys).sort();
    };

    const termKeys = extractTermKeys(feesTerms);

    const dynamicTermColumns = termKeys.map((term) => ({
        name: term.split(" (")[0],
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
        {
            name: "Admission Number",
            selector: (row) => row.admission_number,
            sortable: true,
            cell: (row) =>
                filteredRecords1.length > 0 ? (
                    <Tooltip title={row.admission_number}> {row.admission_number}</Tooltip>
                ) : (
                    <div className="noDataMessage">No Records Found</div>
                ),
        },
        {
            name: "Student Name",
            selector: (row) => row.student_name,
            cell: (row) => (
                <Tooltip title={row.student_name}>
                    <div style={{
                        //width: "100px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }}>
                        {row.student_name}
                    </div>
                </Tooltip>
            ),
            sortable: true,
            width: "150px"
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
                                onClick={() => handleEditClick(row.student_id)}
                            >
                                <MdEdit />
                            </a>
                        </Tooltip>
                    </div>
                ) : null,
        },
    ];

    const handleEditClick = (student_id) => {
        const feesToEdit = feesTerms.find(
            (feesTerms) =>
                feesTerms.student_id === student_id
        );

        if (feesToEdit) {
            const updatedFeesToEdit = {
                ...feesToEdit,
                academic_year_id: userObj.academic_year_id,
            };

            navigate("/addfeesstudentsschedule", {
                state: {
                    discountsData: updatedFeesToEdit,
                },
            });
        } else {
            console.error(`Student with ID ${student_id} not found.`);
        }
    };

    const ExpandableRowComponent = ({ data }) => {
        const [isLoading1, setIsLoading1] = useState(false);

        const filteredData = Array.isArray(feesTermsChild) && feesTermsChild.length > 0
            ? feesTermsChild
                .filter(item => item.student_id === data.student_id && item.class_id === data.class_id)
                .sort((a, b) => (a.category > b.category ? 1 : -1))
            : [];

        const dynamicKeys =
            filteredData.length > 0
                ? Object.keys(filteredData[0]).filter(
                    (key) =>
                        !["class_id", "class_name", "student_id", "student_name", "category", "fees_item_id", "academic_year_id", "academic_year_name", "total"].includes(key)
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
                        <span style={{ textAlign: "right", display: "block", width: "100%" }}>{row[key]}</span>
                    </Tooltip>
                ),
                sortable: true,
                right: "true",
                style: { textAlign: "right" },
                //width: "200px",
            };
        });

        const columns = [
            {
                name: "Fees Item",
                // selector: (row) => row.category,
                cell: (row) => (
                    <Tooltip title={row.category}>
                        <span>{row.category}</span>
                    </Tooltip>
                ),
                // sortable: true,
                width: "150px"
            },
            ...dynamicColumns,
            {
                name: "Total Amount",
                selector: (row) => row.total,
                cell: (row) => (
                    <Tooltip title={row.total}>
                        <span style={{ textAlign: "right", display: "block", width: "100%" }}>{row.total}</span>
                    </Tooltip>
                ),
                sortable: true,
                right: "true",
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
                        data={[...filteredData, footerRow]}
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
                                <h6 className="commonTableTitle">
                                    Fees Discount ({userObj.academic_year_name})
                                </h6>

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
                                        <Form.Label>Class</Form.Label>
                                        <select
                                            className="form-select"
                                            id="class_id"
                                            value={filter.class_id}
                                            onChange={(e) => {
                                                const selectedClassId = e.target.value;
                                                setFilter({ ...filter, class_id: selectedClassId });

                                                if (selectedClassId) {
                                                    const filtered = students.filter(
                                                        (stu) => String(stu.class_id) === String(selectedClassId)
                                                    );
                                                    setFilteredStudents(filtered);
                                                } else {
                                                    setFilteredStudents(students);
                                                }
                                            }}
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
                            <Col xs={12}>
                                <div className="commonInput">
                                    <Form.Group>
                                        <Form.Label>Student Name</Form.Label>
                                        <select
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
                                            {(filteredStudents || []).map((student) => (
                                                <option
                                                    key={student.student_id}
                                                    value={student.student_id}
                                                >
                                                    {student.student_first_name} {student.student_last_name}
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
        </div>
    );
}

export default Feesstudentsschedule