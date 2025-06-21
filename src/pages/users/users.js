import React, { useEffect, useState, useRef } from "react";
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
import * as XLSX from 'xlsx';
import Tooltip from "@mui/material/Tooltip";

const Users = () => {
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleCloseFilterModal = () => setShowFilterModal(false);
   
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const fileInputRef = useRef(null);
    const [states, setStates] = useState([]);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userRecords, setUserRecords] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    useEffect(() => {
    setIsLoading(true);

    fetchDataRead("/Users", setUserRecords, userObj.school_id)
        .finally(() => {
            setIsLoading(false);  
           
        });
}, []);

const handleShowFilterModal = () => {
    if (states.length === 0) {
        fetchDataRead("/states", setStates, userObj.school_id);
    }
    if (roles.length === 0) {
        fetchDataRead("/role", setRoles);
    }
    if (departments.length === 0) {
        fetchDataRead("/department", setDepartments);
    }
    setShowFilterModal(true);
};


    const handleEditClick = (userid) => {
        const UserdataEdit = userRecords.find((user) => user.userid === userid);
        if (UserdataEdit) {
            navigate("/usersadd", { state: { userData: UserdataEdit } });
        }
    };
    const handleDeleteClick = async (userid) => {
        if (!window.confirm('Are you sure you want to change the status?')) return;
        try {
            const response = await axios.post(baseUrl + '/Users', { userid, action: 'DELETE' }, {
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.status >= 200 && response.status < 300) {
                toast.success('Record Set to InActive');
                fetchDataRead("/Users/", setUserRecords, userObj.school_id);

            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const columns = [
        {
            name: "First Name",
            selector: row => row.firstname,
            cell: row => <Tooltip title={row.firstname}><span>{row.firstname}</span></Tooltip>,
            sortable: true
        },
        {
            name: "Surname",
            selector: row => row.surname,
            cell: row => <Tooltip title={row.surname}><span>{row.surname}</span></Tooltip>,
            sortable: true
        },
        {
            name: "Phone Number",
            selector: row => row.phonenumber,
            cell: row => <Tooltip title={row.phonenumber}><span>{row.phonenumber}</span></Tooltip>,
            sortable: true
        },
        {
            name: "Email",
            selector: (row) => row.email,
            cell: (row) => (
                <Tooltip title={row.email ? row.email : ''}>
                    <span>
                        {row.email && row.email.length > 10
                            ? row.email.substring(0, 8) + "..."
                            : row.email || ''}
                    </span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Role",
            selector: row => row.role_name,
            cell: row => <Tooltip title={row.role_name}><span>{row.role_name}</span></Tooltip>,
            sortable: true
        },
        {
            name: "Department",
            selector: row => row.dept_name,
            cell: row => <Tooltip title={row.dept_name}><span>{row.dept_name}</span></Tooltip>,
            sortable: true
        },
        {
            name: "City",
            selector: row => row.city,
            cell: row => <Tooltip title={row.city}><span>{row.city}</span></Tooltip>,
            sortable: true
        },
        {
            name: "State",
            selector: row => row.state_name,
            cell: row => (
                <Tooltip title={row.state_name}>
                    <span>{row.state_name}</span>
                </Tooltip>
            ),
            sortable: true
        },
        {
            name: "Is Active",
            selector: row => row.status,
            cell: row => (
                <Tooltip title={row.status}>
                    <span>{row.status}</span>
                </Tooltip>
            ),
            sortable: true
        },
        {
            name: "Actions",
            cell: row =>
                row.userid !== "No Records Found" ? (
                    <div className="tableActions">
                        <Tooltip title="Edit" arrow>
                            <span
                                className="commonActionIcons"
                                onClick={() => handleEditClick(row.userid)}
                            >
                                <MdEdit />
                            </span>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                            <span
                                className="commonActionIcons"
                                onClick={() => handleDeleteClick(row.userid)}
                            >
                                <MdDelete />
                            </span>
                        </Tooltip>
                    </div>
                ) : null
        }
    ];

    const searchableColumns = [
        row => row.firstname, row => row.surname, row => row.email, row => row.state_name,
        row => row.city, row => row.role_name, row => row.dept_name, row => row.phonenumber,
    ];
    const filteredRecords = (userRecords || []).filter((user) =>
        searchableColumns.some((selector) => {
            const value = selector(user);
            return String(value || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        })
    );
    const [filter, setFilter] = useState(
        {
            userid: 0, firstname: "", surname: "", phonenumber: "", role_id: 0, dept_id: 0, state_id: 0, city: "", email: "", action: "FILTER",
        });

    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            userid: filter.userid || 0,
            firstname: filter.firstname || "",
            surname: filter.surname || "",
            city: filter.city || "",
            phonenumber: filter.phonenumber || "",
            roleid: filter.role_id || 0,
            deptid: filter.dept_id || 0,
            state: filter.state_id || 0,
            email: filter.email || "",
            school_id: userObj.school_id,
            action: "FILTER",
        };
        try {
            const response = await axios.post(baseUrl + "/Users/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const filterData = response.data || [];
            if (filterData.length === 0) {
                setUserRecords([]);
            } else {
                setUserRecords(filterData);
            }
            setShowFilterModal(false);
        } catch (error) {
            console.error("Error in  fetching data:", error);
            if (error.response && error.response.status === 404) {
                setUserRecords([]);
            } else {
                toast.error("Failed to fetch filtered data");
            }
        }
    };
    const handleFilterClear = async () => {
        setFilter({
            userid: 0, firstname: "", surname: "", phonenumber: "", role_id: 0, dept_id: 0, state_id: 0, city: "", email: "", action: "FILTER"
        });
        fetchDataRead("/Users", setUserRecords, userObj.school_id);
    };
    const handleSearchChange = (event) => {
        fetchDataRead("/Users", setUserRecords, userObj.school_id);
        setSearchQuery(event.target.value);
    };
    //excel upload
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const validExtensions = ['.xlsx', '.xls'];
            const extension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.'));
            if (!validExtensions.includes(extension)) {
                toast.warning("Please upload a valid Excel file (.xlsx or .xls)");
                return;
            }
            setFile(selectedFile);
        }
    };
    const generatePassword = () => {
        const length = 10;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*!";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    };
    const columnMappings = [
        { original: 'surname', index: 0 }, { original: 'firstname', index: 1 }, { original: 'address', index: 2 }, { original: 'city', index: 3 },
        { original: 'state', index: 4 }, { original: 'country', index: 5 }, { original: 'phonenumber', index: 6 }, { original: 'email', index: 7 },
        { original: 'doj', index: 8 }, { original: 'dor', index: 9 }, { original: 'lastlogindate', index: 10 }, { original: 'status', index: 11 },
        { original: 'roleid', index: 12 }, { original: 'deptid', index: 13 }, { original: 'createdby', index: 14 },
        { original: 'lastmodifiedby', index: 15 }, { original: 'school_id', index: 16 },
    ];
    const handleUpload = async () => {
        if (!file) {
            toast.warning("Please upload a file");
            return;
        }
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                const dataRows = jsonData.slice(1)
                    .map((row) => {
                        const obj = {};
                        columnMappings.forEach(({ original, index }) => {
                            obj[original] = row[index];
                        });

                        return obj;
                    })
                const defaultObject = {
                    userid: 0,
                    action: 'CREATE',
                };
                const updatedDataRows = dataRows.map(row => ({
                    ...row,
                    password: generatePassword(),
                    ...defaultObject,
                }));
                const response = await axios.post(baseUrl + "/bulkusersupload/", updatedDataRows);
                toast.success(response.data.message);

            } catch (error) {
                toast.error("Error uploading file");
            } finally {
                setFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                fetchDataRead("/Users", setUserRecords, userObj.school_id);
            }
        };
        reader.readAsArrayBuffer(file);
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
                                <h6 className="commonTableTitle">Users</h6>
                            </div>
                            <div className="">
                                <input type="text" placeholder="Search..." value={searchQuery} className="searchInput" onChange={handleSearchChange} />
                            </div>
                            <div className="d-flex align-items-center" style={{ gap: 6 }}>
                                <div className="fileUploadPart" style={{ gap: 6 }}>
                                    <input className="form-control form-control-sm commonFileUpload"
                                        type="file" accept=".xlsx, .xls" onChange={handleFileChange} ref={fileInputRef}
                                    />
                                    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Excel Upload</Tooltip>}>
                                        <Button className="btn primaryBtn"
                                            onClick={handleUpload}
                                        >
                                            <span> Upload</span>
                                        </Button>
                                    </OverlayTrigger>
                                </div>
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}>
                                    <Button className="secondaryBtn" variant="Secondary" onClick={handleShowFilterModal}>
                                        <span><MdFilterList /></span>
                                    </Button>
                                </OverlayTrigger>
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add</Tooltip>}>
                                    <Button className="primaryBtn" variant="primary" onClick={() => navigate("/usersadd")}>
                                        <span><MdAddCircle /></span>
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
                                        : [{ userid: "No Records Found", role_name: "No Records Found", }]
                                    }
                                    pagination={Array.isArray(filteredRecords) && filteredRecords.length > 0} // ✅ Enable pagination only when data exists
                                    highlightOnHover
                                    responsive
                                    fixedHeader
                                    fixedHeaderScrollHeight="calc(100vh - 200px)"
                                    conditionalRowStyles={[
                                        {
                                            when: (row) => row.userid === "No Records Found",
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
                                <div className='commonInput'>
                                    <Form.Group controlId="firstName">
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control
                                            type="text" id="firstname" name="firstname" placeholder="First Name" value={filter.firstname} maxLength={30}
                                            onChange={(e) => {  const value = e.target.value.replace(/[^A-Za-z\s]/g, ''); setFilter({ ...filter, firstname: value });}}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="surname">
                                        <Form.Label>Surname</Form.Label>
                                        <Form.Control type="text" id="surname" name="surname" placeholder="Surname" value={filter.surname} maxLength={30}
                                            onChange={(e) => { const value = e.target.value.replace(/[^A-Za-z\s]/g, ''); setFilter({ ...filter, surname: value });}}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="department">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control type="email" name="email" id="email" maxLength={150} placeholder="Enter Email" value={filter.email} onChange={(e) => setFilter({ ...filter, email: e.target.value.trim() })}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="department">
                                        <Form.Label>PhoneNumber</Form.Label>
                                        <Form.Control type="text" name="phonenumber" id="phonenumber" placeholder="Enter PhoneNumber" maxLength={10} value={filter.phonenumber}
                                            onChange={(e) => {   const value = e.target.value.replace(/\D/g, ''); setFilter({ ...filter, phonenumber: value });}}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="city">
                                        <Form.Label>City</Form.Label>
                                        <Form.Control type="text" name="city" id="city" placeholder="Enter City" maxLength={50} value={filter.city}
                                            onChange={(e) => { const value = e.target.value.replace(/[^A-Za-z\s]/g, ''); setFilter({ ...filter, city: value });}}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className="commonInput">
                                    <Form.Group controlId="state">
                                        <Form.Label>State</Form.Label>
                                        <Form.Select name="state_id" id="state_id" value={filter.state_id} onChange={(e) => setFilter({ ...filter, state_id: e.target.value })}>
                                            <option value="">Select State</option>
                                            {(states || []).map((state) => (<option key={state.state_id} value={state.state_id}>{state.state_name}</option>))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className="commonInput">
                                    <Form.Group controlId="role">
                                        <Form.Label>Role</Form.Label>
                                        <Form.Select name="role_id" id="role_id" value={filter.role_id}
                                            onChange={(e) => setFilter({ ...filter, role_id: e.target.value })}
                                        >
                                            <option value="">Select Role</option>
                                            {(roles || []).filter((role) => role.is_active === "Active")
                                                .map((role) => (<option key={role.role_id} value={role.role_id}>  {role.role_name}</option>))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className="commonInput">
                                    <Form.Group controlId="department">
                                        <Form.Label>Department</Form.Label>
                                        <Form.Select name="dept_id" id="dept_id" value={filter.dept_id}
                                            onChange={(e) => setFilter({ ...filter, dept_id: e.target.value })}
                                        >
                                            <option value="">Select Department</option>
                                            {(departments || []).filter((dept) => dept.is_active === "Active")
                                                .map((dept) => (
                                                    <option key={dept.dept_id} value={dept.dept_id}>{dept.dept_name} </option>))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modalFooterFixed">
                    <div className="">
                        <Button variant="secondary" className="btn-info clearBtn" onClick={() => { handleFilterClear(); }}>   Reset</Button>
                    </div>
                    <div className="">
                        <Button variant="secondary" className="btn-danger secondaryBtn" onClick={() => { handleCloseFilterModal(); }}>Cancel </Button>
                        <Button variant="primary" type="submit" className="btn-success primaryBtn" form="filterForm" onClick={handleCloseFilterModal}> Search</Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
export default Users;

