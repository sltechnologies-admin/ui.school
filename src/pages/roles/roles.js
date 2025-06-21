import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Button, Modal, Row, Col, Form ,OverlayTrigger} from "react-bootstrap";
import { MdEdit,MdAddCircle,MdFilterList,MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import axios from "axios";
import DataTable from "react-data-table-component";
import { Tooltip } from '@mui/material';
import loading from "../../assets/images/common/loading.gif";

const Roles = () => {
    const [Roles, setRoles] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleShowFilterModal = () => setShowFilterModal(true);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState({
        role_name: "",
        action: "FILTER"
    });

    const handleEditClick = (role_id) => {
        const employeemasterToEdit = Roles.find(roles => roles.role_id === role_id);

        if (employeemasterToEdit) {
            navigate("/AddRoles", { state: { rolesData: employeemasterToEdit } });
        } else {
            console.error("Role with ID ${ role_id } not found");
        }
    };
    useEffect(() => {
        setIsLoading(true);
        fetchRoles("/Roles/", setRoles).finally(() => setIsLoading(false));
    }, []);


    const fetchRoles = async () => {
        try {
            const response = await axios.post(baseUrl + "/role/", {
                action: "READ"
            });
            setRoles(response.data);
        } catch (error) {
            console.error("Error fetching roles:", error);

        }
    };

    const columns = [
        {
            name: 'Role',
            selector: (row) => row.role_name,
            cell: (row) => <Tooltip title={row.role_name}><span>{row.role_name}</span></Tooltip>,
            sortable: true,
          },
          
          {
            name: 'Is Active',
            selector: (row) => row.is_active,
            cell: (row) => <Tooltip title={row.is_active}><span>{row.is_active}</span></Tooltip>,
            sortable: true,
          },
        {
                    name: "Actions",
                    cell: (row) =>
                        filteredRecords.length > 0 ? (
                            <div className='tableActions'>
                                <Tooltip title="Edit" arrow>
                                    <a className='commonActionIcons' onClick={() => handleEditClick(row.role_id)}>
                                        <span><MdEdit /></span>
                                    </a>
                                </Tooltip>
                                <Tooltip title="Delete" arrow>
                                    <a className='commonActionIcons' onClick={() => handleDeleteClick(row.role_id)}>
                                        <span><MdDelete /></span>
                                    </a>
                                </Tooltip>
                            </div>
                        ) : null, 
                },
    ];

    const handleDeleteClick = async (role_id) => {
        const confirmDelete = window.confirm('Are you sure you want to change the status?');
        if (!confirmDelete) {
            return;
        }
        const requestBody = {
            role_id: role_id,
            action: "DELETE"
        };
        try {
            const response = await axios.post(baseUrl + '/role/', requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            toast.success("Record Set to InActive");
            fetchRoles();
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const searchableColumns = [
        (row) => row.role_name,
        (row) => row.is_active,

    ];

    const filteredRecords = (Roles || []).filter((item) =>
        searchableColumns.some((selector) => {
            const value = selector(item);
            const stringValue = String(value || '').toUpperCase().replace(/[-\s]+/g, '');
            const normalizedQuery = searchQuery.toUpperCase().replace(/[-\s]+/g, '');
            return stringValue.includes(normalizedQuery);
        })
    );

 const handleFilterSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            role_name: filter.role_name || "",
            action: "FILTER",
        };
        
        try {
            const response = await axios.post(baseUrl + "/role/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const dataArray = Array.isArray(response.data) ? response.data : [];
            setRoles(dataArray);

            setFilter((prevFilter) => ({
                ...prevFilter,
            }));
            setShowFilterModal(false);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setFilter({
            role_name: "",
        });
        setShowFilterModal(true);

        fetchRoles();
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    return (
        <div className='pageMain'>
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
                                <h6 className="commonTableTitle">Roles</h6>
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
                            <div className="d-flex align-items-center" style={{ gap: 6 }}>
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}>
                                    <Button className="secondaryBtn" variant="secondary" onClick={handleShowFilterModal}>
                                        <MdFilterList />
                                    </Button>
                                </OverlayTrigger>
 
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add</Tooltip>}>
                                    <Button className="primaryBtn" variant="primary" onClick={() => navigate("/AddRoles")}>
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
                                    data={filteredRecords.length > 0 ? filteredRecords : [{ is_active: 'No records found', is_active: 'No records found' }]}
                                    pagination={Array.isArray(filteredRecords) && filteredRecords.length > 0} 
                                    highlightOnHover
                                    responsive
                                    fixedHeader
                                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                                    conditionalRowStyles={[
                                        {
                                            when: (row) => row.is_active === "No records found",
                                            style: { textAlign: 'center', fontSize: '16px', color: 'red', backgroundColor: '#f9f9f9' },
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
                    <Row>
                        <Col xs={12}>
                            <div className='commonInput'>
                                <Form.Group controlId="role_name">
                                    <Form.Label>Role </Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="role_name"
                                        name="role_name"
                                        placeholder="Role "
                                        maxLength={30}
                            
                                        value={filter.role_name}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^A-Za-z]/g, ''); 
                                            setFilter({ ...filter, role_name: value });
                                        }}

                                    />
                                </Form.Group>
                            </div>
                        </Col>

                    </Row>
                </Modal.Body>
                <Modal.Footer className="modalFooterFixed">
                <Button variant="secondary" className="btn-info clearBtn me-2" onClick={handleReset}>
                        Reset
                    </Button>
                    <div>
                   <Button variant="secondary" className="btn-danger secondaryBtn me-2" onClick={() => { handleCloseFilterModal(); }}>
                                               Cancel
                                           </Button>
                <Button variant="primary" className="btn-success primaryBtn" onClick={handleFilterSubmit}>
                                            Search
                                        </Button></div> 
                </Modal.Footer>
                
            </Modal>
        </div>
    );
};

export default Roles;
