import React, { useEffect, useState, } from "react";
import axios from "axios";
import { Button, Modal, Row, Col, Form, OverlayTrigger } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete, MdAddCircle, MdFilterList } from "react-icons/md";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from 'react-toastify';
import loading from "../../assets/images/common/loading.gif";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { fetchDataRead } from "../../Utility";
import Tooltip from "@mui/material/Tooltip";
function Exam() {
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => setShowFilterModal(true);
    const [isLoading, setIsLoading] = useState(true);
    const [exams, setExams] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const readOnlyRoles = ["Class Teacher", "Teacher", "Class Incharge", "School Admin"];
    const canSubmit = !readOnlyRoles.includes(userObj.role_name?.trim());

    const handleEditClick = (exam_id) => {
        const ExamdataEdit = exams.find((user) => user.exam_id === exam_id);
        if (ExamdataEdit) {
            navigate("/addexam", { state: { ExamData: ExamdataEdit } });
        }
    };
    const handleDeleteClick = async (exam_id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want change the status?"
        );
        if (!confirmDelete) return;
        try {
            const response = await axios.post(
                baseUrl + "/exammaster/",
                { exam_id, action: "DELETE" },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            toast.success("Status set to Inactive");
            fetchDataRead("/exammaster/", setExams, userObj.school_id);

        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to delete record");
        }
    };
    const columns = [
        {
            name: "Exam Name",
            selector: row => row.exam_name,
            cell: row => <Tooltip title={row.exam_name}><span>{row.exam_name}</span></Tooltip>,
            sortable: true
        },
        {
            name: "Status",
            selector: row => row.is_active,
            cell: row => <Tooltip title={row.is_active}><span>{row.is_active}</span></Tooltip>,
            sortable: true
        },
        ...(canSubmit ? [
            {
                name: "Actions",
                cell: row => row.exam_id !== "No records found" ? (
                    <div className="tableActions">
                        <Tooltip title="Edit" arrow>
                            <span className="commonActionIcons" onClick={() => handleEditClick(row.exam_id)}>
                                <MdEdit />
                            </span>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                            <span className="commonActionIcons" onClick={() => handleDeleteClick(row.exam_id)}>
                                <MdDelete />
                            </span>
                        </Tooltip>
                    </div>
                ) : null
            }
        ] : [])
    ];
    useEffect(() => {
        setIsLoading(true);
        fetchDataRead("/exammaster/", setExams, userObj.school_id).finally(() => setIsLoading(false));
    }, []);

    const searchableColumns = [
        row => row.exam_name,
        row => row.is_active
    ];
  const filteredRecords = (exams || []).filter((user) =>
  searchableColumns.some((selector) => {
    const value = selector(user);
    return String(value || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  })
);

    const [filter, setFilter] = useState({
        exam_name: "",
        school_id: userObj.school_id,
        action: "FILTER",
    });

    const handleFilterSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            exam_name: filter.exam_name || "",
            school_id: userObj.school_id,
            action: "FILTER",
        };
        try {
            const response = await axios.post(`${baseUrl}/exammaster/`, formData, {
                headers: { "Content-Type": "application/json" },
            });
            const filterData = response.data || [];
            if (filterData.length === 0) {
                setExams([]);
            } else {
                setExams(filterData);
            }
            setShowFilterModal(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            if (error.response) {
                if (error.response.status === 404) {
                    setExams([]);
                } else {
                    toast.error("Failed to fetch filtered data. Please try again.");
                }
            } else {
                toast.error("Network error. Please check your connection.");
            }
        }
    };
    const handleFilterClear = async () => {
        setFilter((prev) => ({ ...prev, exam_name: "" }));
        setIsLoading(true);
        try {
            await fetchDataRead("/exammaster/", setExams, userObj.school_id);
        } catch (error) {
            console.error("Error fetching all exams:", error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSearchChange = (event) => {
        fetchDataRead("/exammaster/", setExams, userObj.school_id);
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
                                <h6 className="commonTableTitle">Exam Master</h6>
                            </div>
                            <div className="">
                                <input type="text" placeholder="Search..." value={searchQuery} className="searchInput" onChange={handleSearchChange} />
                            </div>
                            <div className="d-flex align-items-center" style={{ gap: 6 }}>
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}>
                                    <Button className="secondaryBtn" variant="secondary" onClick={handleShowFilterModal}>
                                        <MdFilterList />
                                    </Button>
                                </OverlayTrigger>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip id="tooltip-top">{canSubmit ? "Add" : "No Permission"}</Tooltip>}
                                >
                                    <span>
                                        <Button
                                            className="primaryBtn"
                                            variant="primary"
                                            onClick={() => navigate("/addexam")}
                                            disabled={!canSubmit}
                                        >
                                            <MdAddCircle />
                                        </Button>
                                    </span>
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
                                            exam_id: "No records found", is_active: "No records found",
                                        }]
                                    }
                                    pagination={Array.isArray(filteredRecords) && filteredRecords.length > 0}
                                    highlightOnHover
                                    responsive
                                    fixedHeader
                                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                                    conditionalRowStyles={[
                                        {
                                            when: (row) => row.exam_id === "No records found",
                                            style: {
                                                textAlign: "center", fontSize: "16px", color: "red", backgroundColor: "#f9f9f9"
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
                                <div className="commonInput">
                                    <Form.Group controlId="groupName">
                                        <Form.Label>Exam Name</Form.Label>
                                        <Form.Control type="text" placeholder="Enter Exam Name" maxLength={20} value={filter.exam_name}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (/^[a-zA-Z0-9\s-]*$/.test(value)) {
                                                    setFilter({ ...filter, exam_name: value });
                                                }
                                            }}

                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modalFooterFixed">
                    <div className="">
                        <Button variant="secondary" className="btn-info clearBtn" onClick={handleFilterClear}>   Reset  </Button>
                    </div>
                    <div className="">
                        <Button variant="secondary" className="btn-danger secondaryBtn" onClick={handleCloseFilterModal}> Cancel </Button>
                        <Button variant="primary" className="btn-success primaryBtn" type="submit" form="filterForm" onClick={handleCloseFilterModal}>  Search </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    )
}
export default Exam
