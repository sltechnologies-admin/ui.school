import React, { useEffect, useState,} from "react";
import axios from "axios";
import { IoMdAdd } from "react-icons/io";
import { Button, Modal, Row, Col, Form, OverlayTrigger } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete, MdFilterList } from "react-icons/md";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from 'react-toastify';
import loading from "../../assets/images/common/loading.gif";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { fetchDataRead } from "../../Utility";
import Tooltip from "@mui/material/Tooltip";

const CreateGroups = () => {
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => setShowFilterModal(true);
    const [isLoading, setIsLoading] = useState(true);
    const [groups, setGroups] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const handleEditClick = (group_id) => {
        const GroupdataEdit = groups.find((user) => user.group_id === group_id);
        if (GroupdataEdit) {
            navigate("/addcreategroups", { state: { groupData: GroupdataEdit } });
        }
    };
    const handleDeleteClick = async (group_id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want change the status?"
        );
        if (!confirmDelete) return;
        try {
            const response = await axios.post(
                baseUrl + "/creategroup/",
                { group_id, action: "DELETE" },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            toast.success("Status set to Inactive");
            fetchDataRead("/creategroup/", setGroups, userObj.school_id);

        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to delete record");
        }
    };

    const columns = [
        {
            name: "Group Name",
            selector: row => row.group_name,
            cell: row => <Tooltip title={row.group_name}><span>{row.group_name}</span></Tooltip>,
            sortable: true
        },
        {
            name: "Is Active",
            selector: row => row.status,
            cell: row => <Tooltip title={row.status}><span>{row.status}</span></Tooltip>,
            sortable: true
        },
        {
            name: "Actions",
            cell: row => row.group_id !== "No records found" ?(
                <div className="tableActions">
                    <Tooltip title="Edit" arrow>
                        <span className="commonActionIcons" onClick={() => handleEditClick(row.group_id)}>
                            <MdEdit />
                        </span>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                        <span className="commonActionIcons" onClick={() => handleDeleteClick(row.group_id)}>
                            <MdDelete />
                        </span>
                    </Tooltip>
                </div>
            ):null
        }
    ];
    useEffect(() => {
        setIsLoading(true);
        fetchDataRead("/creategroup/", setGroups, userObj.school_id).finally(() => setIsLoading(false));
    }, []);

    const searchableColumns = [
        row => row.group_name,
    ];
    const filteredRecords = (groups || []).filter((user) =>
        searchableColumns.some((selector) => {
            const value = selector(user);
            return String(value || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        })
    );
    const [filter, setFilter] = useState({
        group_name: "",
        school_id: userObj.school_id,
        action: "FILTER",
    });

    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = {
            group_name: filter.group_name || "",
            action: "FILTER",
        };
        try {
            const response = await axios.post(`${baseUrl}/creategroup/`, formData, {
                headers: { "Content-Type": "application/json" },
            });
            const filterData = response.data || [];
            if (filterData.length === 0) {
                setGroups([]);
            } else {
                setGroups(filterData);
            }
            setShowFilterModal(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            if (error.response) {
                if (error.response.status === 404) {
                    setGroups([]);

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
        setFilter((prev) => ({ ...prev, group_name: "" }));
        setIsLoading(true);
        try {
            await fetchDataRead("/creategroup", setGroups, userObj.school_id);
        } catch (error) {
            console.error("Error fetching all groups:", error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSearchChange = (event) => {
        fetchDataRead("/creategroup", setGroups, userObj.school_id);
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
                                <h6 className="commonTableTitle">Create Groups</h6>
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
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add</Tooltip>}>
                                    <Button className="primaryBtn" variant="primary" onClick={() => navigate("/addcreategroups")}>
                                        <IoMdAdd />
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
                            ) :  (
                                <DataTable
                                    className="custom-table"
                                    columns={columns}
                                    data={(Array.isArray(filteredRecords) && filteredRecords.length > 0)
                                        ? filteredRecords 
                                        : [{
                                            group_id: "No records found", 
                                            status: "No records found",
                                        }]
                                    }
                                    pagination={Array.isArray(filteredRecords) && filteredRecords.length > 0}
                                    highlightOnHover
                                    responsive
                                    fixedHeader
                                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                                    conditionalRowStyles={[
                                        {
                                            when: (row) => row.group_id === "No records found",
                                            style: {textAlign: "center",fontSize: "16px",color: "red",backgroundColor: "#f9f9f9"},    
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
                                        <Form.Label>Group Name</Form.Label>
                                        <Form.Control type="text" placeholder="Enter group name" maxLength={35}   value={filter.group_name}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (/^[a-zA-Z0-9\s]*$/.test(value)) { setFilter({ ...filter, group_name: value });}    
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
                        <Button variant="secondary" className="btn-info clearBtn" onClick={handleFilterClear}>Reset </Button> 
                    </div>
                    <div className="">
                        <Button variant="secondary" className="btn-danger secondaryBtn" onClick={handleCloseFilterModal}> Close </Button>
                        <Button variant="primary" className="btn-success primaryBtn" type="submit"  form="filterForm"onClick={handleCloseFilterModal}>  Search </Button> 
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
export default CreateGroups;
