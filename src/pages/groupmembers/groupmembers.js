import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoMdAdd } from "react-icons/io";
import {  Button, Modal, Row, Col, Form, OverlayTrigger } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete,MdFilterList} from "react-icons/md";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from 'react-toastify';
import loading from "../../assets/images/common/loading.gif";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { fetchDataRead } from "../../Utility";
import Tooltip from "@mui/material/Tooltip";

function GroupMembers() {
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [groupsmembers, setGroupMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [userRecords, setUserRecords] = useState([]);
    const [groups, setGroups] = useState([]);
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const navigate = useNavigate();
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => setShowFilterModal(true);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    useEffect(() => {
        setIsLoading(true);
        fetchDataRead("/addnotificationgroupmembers/", setGroupMembers, userObj.school_id)
            .finally(() => {
                setIsLoading(false);
                fetchDataRead("/Users/", setUserRecords, userObj.school_id);
                fetchDataRead("/creategroup", setGroups, userObj.school_id);
            });
    }, []);
    
    const handleEditClick = (group_member_id) => {
        const UserdataEdit = groupsmembers.find((user) => user.group_member_id === group_member_id);
        if (UserdataEdit) {
            navigate("/addgroupmembers", { state: { userData: UserdataEdit } });
        }
    };

    const handleDeleteClick = async (group_member_id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want change the status?"
        );
        if (!confirmDelete) return;
        try {
            const response = await axios.post(
                baseUrl + "/addnotificationgroupmembers/",
                { group_member_id, action: "DELETE" },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            toast.success("Status set to Inactive");
            fetchDataRead("/addnotificationgroupmembers/", setGroupMembers, userObj.school_id);

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
            name: "User Name",
            selector: row => row.user_name,
            cell: row => <Tooltip title={row.user_name}><span>{row.user_name}</span></Tooltip>,
            sortable: true
        },
        {
            name: "Actions",
            cell: row =>
                row.group_member_id !== "No records found" ? (
                    <div className="tableActions">
                        <Tooltip title="Edit" arrow>
                            <span className="commonActionIcons" onClick={() => handleEditClick(row.group_member_id)}> <MdEdit /></span>  
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                            <span className="commonActionIcons" onClick={() => handleDeleteClick(row.group_member_id)}><MdDelete />  </span>
                        </Tooltip>
                    </div>
                ) : null
        }
    ];

    const searchableColumns = [
        row => row.group_name, row => row.user_name,    
    ];

    const filteredRecords = (groupsmembers || []).filter((user) =>
        searchableColumns.some((selector) => {
            const value = selector(user);
            return String(value || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        })
    );
    
    const [filter, setFilter] = useState({
        group_id: "",  
        userid: "",     
        school_id: userObj.school_id,
    });

    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = {
            group_id: filter.group_id || 0,  
            user_id: filter.userid || 0,     
            action: "FILTER",
        };
        try {
            const response = await axios.post(`${baseUrl}/addnotificationgroupmembers/`, formData, { headers: { "Content-Type": "application/json" },  
            });
            setGroupMembers(response.data || []); setShowFilterModal(false);  
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch filtered data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterClear = async () => {
        setFilter({ group_id: "", userid: "", school_id: userObj.school_id });
        setIsLoading(true);
        try {
            await fetchDataRead("/addnotificationgroupmembers", setGroupMembers, userObj.school_id);
        } catch (error) {
            console.error("Error fetching all groups:", error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSearchChange = (event) => {
        fetchDataRead("/addnotificationgroupmembers", setGroupMembers, userObj.school_id);
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
                                <h6 className="commonTableTitle">Group Members</h6>
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
                                    <Button className="primaryBtn" variant="primary" onClick={() => navigate("/addgroupmembers")}>
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
                            ) : (
                                <DataTable
                                    className="custom-table"
                                    columns={columns}
                                    data={(Array.isArray(filteredRecords) && filteredRecords.length > 0)
                                        ? filteredRecords 
                                        : [{
                                            group_member_id: "No records found", user_name: "No records found",   
                                        }]}  
                                    pagination={Array.isArray(filteredRecords) && filteredRecords.length > 0} 
                                    highlightOnHover
                                    responsive
                                    fixedHeader
                                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                                    conditionalRowStyles={[
                                        {
                                            when: (row) => row.group_member_id === "No records found",
                                            style: { textAlign: "center", fontSize: "16px", color: "red",  }, 
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
                                    <Form.Group controlId="department">
                                        <Form.Label>group</Form.Label>
                                        <Form.Select name="group_id" id="group_id" value={filter.group_id}
                                            onChange={(e) => setFilter({ ...filter, group_id: e.target.value })}>
                                            <option value="">Select Group</option>
                                            {groups.map((group) => (
                                                <option key={group.group_id} value={group.group_id}>
                                                    {group.group_name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className="commonInput">
                                    <Form.Group controlId="department">
                                        <Form.Label>User</Form.Label>
                                        <Form.Select name="userid" id="userid" value={filter.userid}
                                            onChange={(e) => setFilter({ ...filter, userid: e.target.value })}>
                                            <option value="">Select user</option>
                                            {(userRecords || []).map((user) => (
                                                <option key={user.userid} value={user.userid}> {`${user.surname} ${user.firstname}`} </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modalFooterFixed">
                    <div>
                        <Button variant="secondary" className="btn-info clearBtn" onClick={handleFilterClear}> Reset </Button>
                    </div>
                    <div>
                        <Button variant="secondary" className="btn-danger secondaryBtn" onClick={() => handleCloseFilterModal()}>  Close   </Button>
                        <Button variant="primary" className="btn-success primaryBtn" type="submit" form="filterForm"   onClick={handleCloseFilterModal}> Search </Button> 
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    )
}
export default GroupMembers
