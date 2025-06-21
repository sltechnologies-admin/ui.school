import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoMdAdd } from "react-icons/io";
import { Button, Modal, Row, Col, Form, OverlayTrigger } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete, MdFilterList, MdAddCircle } from "react-icons/md";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from "react-toastify";
import loading from "../../assets/images/common/loading.gif";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { fetchDataRead } from "../../Utility";
import Tooltip from "@mui/material/Tooltip";

function GroupMembers() {
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [existingGroupUserIds, setExistingGroupUserIds] = useState([]);

    const [groupsmembers, setGroupMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [userRecords, setUserRecords] = useState([]);
    const [groups, setGroups] = useState([]);
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const navigate = useNavigate();
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => setShowFilterModal(true);

    useEffect(() => {
        setIsLoading(true);
        fetchDataRead("/addnotificationgroupmembers_read/", setGroupMembers, userObj.school_id)
            .finally(() => {
                setIsLoading(false);
                fetchDataRead("/Users/", setUserRecords, userObj.school_id);
                fetchDataRead("/creategroup", setGroups, userObj.school_id);
            });
    }, []);
    const readOnlyRoles = ["Class Teacher", "Teacher", "Class Incharge", "School Admin"];
    const canSubmit = !readOnlyRoles.includes(userObj.role_name?.trim());

    // Group members by group_id to remove duplicates in the main grid
    const groupedGroups = Object.values(
        (Array.isArray(groupsmembers) ? groupsmembers : []).reduce((acc, curr) => {
            if (!acc[curr.group_id]) {
                acc[curr.group_id] = {
                    group_id: curr.group_id,
                    group_name: curr.group_name ?? "Unknown Group",
                    group_member_id: curr.group_member_id ?? "No Member"
                };
            }
            return acc;
        }, {})
    );

    console.log(groupedGroups);

    const filteredRecords = groupedGroups.filter((group) => {
        const groupNameMatch = String(group.group_name || "").toLowerCase().includes((searchQuery || "").toLowerCase());
        const members = groupsmembers.filter(m => m.group_id === group.group_id);
        const userMatch = members.some(member => String(member.user_name || "").toLowerCase().includes(searchQuery.toLowerCase()));
        return groupNameMatch || userMatch;
    });



    const handleEditClick = (group_member_id) => {
        const userToEdit = groupsmembers.find((user) => user.group_member_id === group_member_id);
        if (userToEdit) {
            navigate("/addgroupmembers", { state: { userData: userToEdit } });
        }
    };

    const handleDeleteClick = async (group_member_id) => {
        const confirmDelete = window.confirm("Are you sure you want to change the status?");
        if (!confirmDelete) return;
        try {
            const response = await axios.post(
                `${baseUrl}/addnotificationgroupmembers_read/`,
                { group_member_id, action: "DELETE" },
                { headers: { "Content-Type": "application/json" } }
            );
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            toast.success("Status set to Inactive");
            fetchDataRead("/addnotificationgroupmembers_read/", setGroupMembers, userObj.school_id);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to delete record");
        }
    };

    const columns = [
        {
            name: "Group Name",
            selector: row => row.group_name,
            cell: row => (
                <Tooltip title={row.group_name}>
                    <span>{row.group_name}</span>
                </Tooltip>
            ),
            sortable: true
        },
        // ...(canSubmit
        //     ? [
        //         {
        //             name: "Actions",
        //             cell: row => (
        //                 <div className="tableActions">
        //                     <Tooltip title="Edit" arrow>
        //                         <span
        //                             className="commonActionIcons"
        //                             onClick={() => handleEditClick(row.group_member_id)}
        //                         >
        //                             <MdEdit />
        //                         </span>
        //                     </Tooltip>
        //                     <Tooltip title="Delete" arrow>
        //                         <span
        //                             className="commonActionIcons"
        //                             onClick={() => handleDeleteClick(row.group_member_id)}
        //                         >
        //                             <MdDelete />
        //                         </span>
        //                     </Tooltip>
        //                 </div>
        //             ),

        //         }
        //     ]
        //     : [])
    ];


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
            const response = await axios.post(`${baseUrl}/addnotificationgroupmembers_read/`, formData, {
                headers: { "Content-Type": "application/json" },
            });
            setGroupMembers(response.data || []);
            setShowFilterModal(false);
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
            await fetchDataRead("/addnotificationgroupmembers_read", setGroupMembers, userObj.school_id);
        } catch (error) {
            console.error("Error fetching all groups:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const fetchGroupMembersByGroupId = async (group_id) => {
        try {
            const response = await axios.post(`${baseUrl}/addnotificationgroupmembers_read/`, {
                group_id,
                school_id: userObj.school_id,
                action: "FILTER"
            }, {
                headers: { "Content-Type": "application/json" }
            });
            return response.data || [];
        } catch (error) {
            console.error("Error fetching group members:", error);
            return [];
        }
    };

    const ExpandedComponent = ({ data }) => {
        const [members, setMembers] = useState([]);
        const [isLoadingMembers, setIsLoadingMembers] = useState(true);

        useEffect(() => {
            const loadMembers = async () => {
                setIsLoadingMembers(true);
                const result = await fetchGroupMembersByGroupId(data.group_id);
                setMembers(result);
                setIsLoadingMembers(false);
            };
            loadMembers();
        }, [data.group_id]);

        if (isLoadingMembers) {
            return <div style={{ padding: '10px' }}><img src={loading} alt="Loading..." height={30} /></div>;
        }

        if (members.length === 0) {
            return <div style={{ padding: '10px' }}>No members found in this group.</div>;
        }

        return (
            <div
                style={{
                    marginLeft: "100px",
                    border: "1px solid rgb(204, 204, 204)",

                    padding: "0px",
                    background: "linear-gradient(135deg, rgb(249, 249, 249) 0%, rgb(230, 230, 230) 100%)",
                    boxShadow: "rgba(0, 0, 0, 0.1) 2px 4px 10px",
                    overflow: "hidden",
                    maxHeight: "200px"
                }}
            >
                <table
                    className="customExpandedTable table table-bordered table-sm mb-0"
                    style={{
                        minWidth: "400px",
                        fontSize: "13px",
                        borderCollapse: "collapse"
                    }}
                >
                    <thead style={{ display: "table", width: "100%", tableLayout: "fixed", borderBottom: "2px solid #0d6efd" }}>

                        <tr className="border-blue">
                            <th style={{ padding: "4px 8px", width: "10%" }}>#</th>
                            <th style={{ padding: "4px 8px", width: "45%" }}>User Name</th>
                            <th style={{ padding: "4px 8px", width: "45%" }}>Status</th>
                        </tr>
                    </thead>
                </table>
                <div style={{ overflowY: "auto", maxHeight: "160px" }}>
                    <table
                        className="customExpandedTable table table-bordered table-sm mb-0"
                        style={{
                            minWidth: "400px",
                            fontSize: "13px",
                            tableLayout: "fixed"
                        }}
                    >
                        <tbody style={{ display: "block", width: "100%" }}>
                            {members.map((user, index) => (
                                <tr key={index} style={{ display: "table", width: "100%", tableLayout: "fixed" }}>
                                    <td style={{ padding: "4px 8px", width: "10%" }}>{index + 1}</td>
                                    <td style={{ padding: "4px 8px", width: "45%" }}>{user.user_name}</td>
                                    <td style={{ padding: "4px 8px", width: "45%" }}>{user.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );



    };

    return (
        <div className="pageMain">
            <ToastContainer />
            <LeftNav />
            <div className="pageRight">
                <div className="pageHead"><Header /></div>
                <div className="pageBody">
                    <div className="commonDataTableHead">
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <h6 className="commonTableTitle">Group Members</h6>
                            <input type="text" placeholder="Search..." value={searchQuery} className="searchInput" onChange={handleSearchChange} />
                            <div className="d-flex align-items-center" style={{ gap: 6 }}>
                                <OverlayTrigger placement="top" overlay={<Tooltip title="Filter"><span>Filter</span></Tooltip>}>
                                    <Button className="secondaryBtn" variant="secondary" onClick={handleShowFilterModal}><MdFilterList /></Button>
                                </OverlayTrigger>
                                {canSubmit && (
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip title="Add"><span>Add</span></Tooltip>}
                                    >
                                        <Button
                                            className="primaryBtn"
                                            variant="primary"
                                            onClick={() => navigate("/addgroupmembers")}
                                        >
                                            <MdAddCircle />
                                        </Button>
                                    </OverlayTrigger>
                                )}

                            </div>
                        </div>
                    </div>
                    <DataTable
                        className="custom-table"
                        columns={columns}
                        data={
                            filteredRecords.length > 0
                                ? filteredRecords
                                : [{
                                    group_name: "No Records Found",
                                    group_id: "NA",
                                    group_member_id: "NA",
                                    isEmptyRow: true  // Add a flag
                                }]
                        }
                        pagination
                        highlightOnHover
                        responsive
                        fixedHeader
                        expandableRows={filteredRecords.length > 0}
                        expandableRowsComponent={ExpandedComponent}
                        fixedHeaderScrollHeight="calc(100vh - 170px)"
                        noDataComponent={
                            <div style={{ padding: "12px", textAlign: "center", color: "gray" }}>
                                No matching records found.
                            </div>
                        }
                        conditionalRowStyles={[
                            {
                                when: row => row.isEmptyRow,
                                style: {
                                    backgroundColor: '#ffe6e6',
                                    color: 'red',
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                }
                            }
                        ]}
                    />

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
                                <Form.Group>
                                    <Form.Label>Group</Form.Label>
                                    <Form.Select value={filter.group_id} onChange={(e) => setFilter({ ...filter, group_id: e.target.value })}>
                                        <option value="">Select Group</option>
                                        {(groups || []).map((group) => (
                                            <option key={group.group_id} value={group.group_id}>{group.group_name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col xs={12}>
                                <Form.Group>
                                    <Form.Label>User</Form.Label>
                                    <Form.Select value={filter.userid} onChange={(e) => setFilter({ ...filter, userid: e.target.value })}>
                                        <option value="">Select User</option>
                                        {userRecords.map((user) => (
                                            <option key={user.userid} value={user.userid}>{`${user.surname} ${user.firstname}`}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modalFooterFixed">
                    <Button variant="secondary" className="btn-info clearBtn" onClick={handleFilterClear}>Reset</Button>
                    <div>
                        <Button variant="secondary" className="btn-danger secondaryBtn" onClick={handleCloseFilterModal}>Close</Button>
                        <Button variant="primary" className="btn-success primaryBtn" type="submit" form="filterForm">Search</Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default GroupMembers;
