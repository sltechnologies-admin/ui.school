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

const Departments = () => {
    const [Departments, setDepartments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => setShowFilterModal(true);
    const [isLoading, setIsLoading] = useState(true);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [filter, setFilter] = useState({
        dept_name: "",
        action: "FILTER"
    });

    const handleEditClick = (dept_id) => {
        const employeemasterToEdit = Departments.find(departments => departments.dept_id === dept_id);

        if (employeemasterToEdit) {
            navigate("/AddDepartments", { state: { departmentsData: employeemasterToEdit } });
        } else {
            console.error(`User with ID ${dept_id} not found.`);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await axios.post(baseUrl + "/department/", {
                action: "READ"
            });
            setDepartments(response.data);
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };
    useEffect(() => {
        setIsLoading(true);
        fetchDepartments("/Departments/", setDepartments).finally(() => setIsLoading(false));
    }, []);

    const columns = [
         {
                    name: 'Department',
                    selector: (row) => row.dept_name,
                    cell: (row) => <Tooltip title={row.dept_name}><span>{row.dept_name}</span></Tooltip>,
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
                                             <a className='commonActionIcons' onClick={() => handleEditClick(row.dept_id)}>
                                                 <span><MdEdit /></span>
                                             </a>
                                         </Tooltip>
                                         <Tooltip title="Delete" arrow>
                                             <a className='commonActionIcons' onClick={() => handleDeleteClick(row.dept_id)}>
                                                 <span><MdDelete /></span>
                                             </a>
                                         </Tooltip>
                                     </div>
                                 ) : null, 
                             
                         },
    ];
    
    const handleDeleteClick = async (dept_id) => {
        const confirmDelete = window.confirm('Are you sure you want to change the status?');

        if (!confirmDelete) {
            return;
        }
        const requestBody = {
            dept_id: dept_id,
            action: "DELETE"
        };
        try {
            const response = await axios.post(baseUrl + '/department/', requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            toast.success("Record Set to InActive");
            fetchDepartments();
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const searchableColumns = [
        (row) => row.dept_name,
        (row) => row.is_active,

    ];

    const filteredRecords = (Departments || []).filter((item) =>
        searchableColumns.some((selector) => {
            const value = selector(item);
            const stringValue = String(value || '').toLowerCase().replace(/[-\s]+/g, '');
            const normalizedQuery = searchQuery.toLowerCase().replace(/[-\s]+/g, '');
            return stringValue.includes(normalizedQuery);
        })
    );

    const handleFilterSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            dept_name: filter.dept_name || "",
            action: "FILTER",
        };
        try {
            const response = await axios.post(baseUrl + "/department/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const dataArray = Array.isArray(response.data) ? response.data : [];
            setDepartments(dataArray);
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
            dept_name: "",
        });
        setShowFilterModal(true);
        fetchDepartments("/role");
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
                                <h6 className="commonTableTitle">Departments </h6>
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
                                    <Button className="primaryBtn" variant="primary" onClick={() => navigate("/AddDepartments")}>
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
                            <Form id="filterForm" onSubmit={handleFilterSubmit}>
                            <Row>
                                <Col xs={12}>
                                    <div className='commonInput'>
                                        <Form.Group controlId="firstName">
                                            <Form.Label>Department </Form.Label>
                                            <Form.Control
                                                type="text"
                                                id="dept_name"
                                                name="dept_name"
                                                placeholder="Enter Department "
                                                maxLength={30}
                                                value={filter.dept_name}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^A-Za-z]/g, ''); 
                                                    setFilter({ ...filter, dept_name: value });
                                                }}
                                            />
                                        </Form.Group>
                                    </div>
                                </Col>
                            </Row>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer className="modalFooterFixed">
                                        <Button variant="secondary" className="btn-info clearBtn me-2" onClick={handleReset}>
                                                Reset
                                            </Button>
                                            <div>
                                            <Button variant="secondary" className="btn-danger secondaryBtn me-2" onClick={handleCloseFilterModal}>
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

export default Departments;