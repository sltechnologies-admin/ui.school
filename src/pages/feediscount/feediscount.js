import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Modal, Form, Button, Card, Table, Badge, Image, CardFooter,OverlayTrigger } from 'react-bootstrap';
import { MdEdit, MdDelete,MdAddCircle } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";
import DataTable from "react-data-table-component";
//import sampleUser from '../../../assets/images/common/samplePhoto.png';
import sampleSchoolLogo from '../../assets/images/common/sampleSchoolLogo.png';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { Tooltip } from '@mui/material';
import loading from "../../assets/images/common/loading.gif";

//Components
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import { MdFilterList } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
// import loading from "../../assets/images/common/loading.gif";



const Feediscount = () => {

    const [discount, setdiscount] = useState([]);
    //const [combination, setcombination] = useState([]);
    // const [students, setstudents] = useState([]);
    const [academicyear, setacademicyear] = useState([]);
    const [classes, setClasses] = useState([])

    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleShowFilterModal = () => setShowFilterModal(true);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [isLoading, setIsLoading] = useState(true);
    const [feeItems, setFeeItems] = useState({});
    const [items, setitems] = useState([])
    const userData = sessionStorage.getItem('user');
    const userObj = JSON.parse(userData);
    // const userIdStr = userObj.school_id;
    // const userId = parseInt(userIdStr, 10);
    const [filter, setFilter] = useState({
        student_name: "",
        student_id: 0,
        discount: "",
        combined_name: "",
        fees_item_id: 0,
        action: "FILTER"
    });



    const fetchitemlist = async () => {
        try {
            const response = await axios.post(baseUrl + "/Feeitemslist/", {
                action: "READ",
                school_id: userObj.school_id

            });
            setitems(response.data)

        }
        catch (error) {
            console.error("Error fetching academic data:", error);
        }
    };

    const fetchacademicyear = async () => {
        try {
            const response = await axios.post(baseUrl + "/AcademicYear/", {
                action: "READ",
                school_id: userObj.school_id
            });
            setacademicyear(response.data)
            //console.log(response.data);
        }
        catch (error) {
            console.error("Error fetching academic data:", error);
        }
    };


    const fetchfeediscount = async () => {
        try {
            const response = await axios.post(baseUrl + "/feediscount/", {
                action: "READ",
                school_id: userObj.school_id
            });
            setdiscount(response.data);
            //console.log(response.data);
        } catch (error) {
            console.error("Error fetching discount:", error);

        }
    };

    // const fetchStudents = async () => {
    //     try {
    //         const response = await axios.post(baseUrl + "/students/", {
    //             action: "READ",
    //         });
    //         setstudents(response.data);
    //         console.log("students" + response.data);
    //     } catch (error) {
    //         console.error("Error fetching students:", error);
    //     }
    // };

    const fetchclasses = async () => {
        try {
            const response = await axios.post(baseUrl + "/classes/", {
                action: "READ",
                school_id: userObj.school_id
            });
            setClasses(response.data)

        }
        catch (error) {
            console.error("Error fetching academic data:", error);
        }
    };


    useEffect(() => {
        document.title = " Fee Discount";
        fetchitemlist();
        fetchacademicyear();
        fetchfeediscount();
        fetchclasses();
    }, []);



    //const combinedRecords = [discount, combination ,...students]; 

    // const Discounts = discount.map((discount) => ({
    //     ...discount,
    //     combined_name: combination[discount.fees_item_id] || ""
    // }));


    const searchableColumns = ["discount", "student_name", "academic_year_name", "class_name", "item_name"];

    const filteredRecords = (discount || []).filter(role => {

        return searchableColumns.some(column =>
            role[column] && String(role[column]).toLowerCase().includes(searchQuery.toLowerCase())
        );

    });

    const handleEditClick = (fee_discount_id) => {
        const feediscountToEdit = discount.find(discounts => discounts.fee_discount_id === fee_discount_id);

        if (feediscountToEdit) {
            navigate("/Addfeediscount", { state: { discountsData: feediscountToEdit } });
        } else {
            console.error(`User with ID ${fee_discount_id} not found.`);
        }
    };


    const columns = [

        // {
        //     name: "Fee Item Name",
        //     selector: (row) => row.combined_name,
        //     cell: (row) => (
        //         <Tooltip title={row.combined_name}>
        //             <span>{row.combined_name}</span>
        //         </Tooltip>
        //     ),
        //     sortable: true
        // },
        {
            name: "Academic Year  Name",
            selector: (row) => row.academic_year_name,
            cell: (row) => (
                <Tooltip title={row.academic_year_name}>
                    <span>{row.academic_year_name}</span>
                </Tooltip>
            ),
            sortable: true
        },
        {
            name: "Class  Name",
            selector: (row) => row.class_name,
            cell: (row) => (
                <Tooltip title={row.class_name}>
                    <span>{row.class_name}</span>
                </Tooltip>
            ),
            sortable: true
        },
        {
            name: "Item  Name",
            selector: (row) => row.item_name,
            cell: (row) => (
                <Tooltip title={row.item_name}>
                    <span>{row.item_name}</span>
                </Tooltip>
            ),
            sortable: true
        },
        {
            name: "Student Name",
            selector: (row) => row.student_name,
            cell: (row) => (
                <Tooltip title={row.student_name}>
                    <span>{row.student_name}</span>
                </Tooltip>
            ),
            sortable: true
        },
        {
            name: "Discount",
            selector: (row) => row.discount,
            cell: (row) => (
                <Tooltip title={row.discount}>
                    <span>{row.discount}</span>
                </Tooltip>
            ),
            sortable: true
        },

        {
            name: "Actions", selector: (row) =>
            (
                <div className="tableActions">
                    <Tooltip title="Edit" arrow>
                        <a className="commonActionIcons" >
                            <span onClick={() => handleEditClick(row.fee_discount_id)}><MdEdit /></span></a>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                        <a className="commonActionIcons">
                            <span onClick={() => handleDeleteClick(row.fee_discount_id)}><MdDelete /></span>
                        </a>
                    </Tooltip>
                    {/* <a className="commonActionIcons"><HiDotsVertical /></a> */}
                </div>
            )
        }
    ];


    const handleDeleteClick = async (fee_discount_id) => {
        const confirmDelete = window.confirm('Are you sure you want to change the status?');

        if (!confirmDelete) {
            return;
        }
        const requestBody = {
            fee_discount_id: fee_discount_id,
            action: "DELETE"
        };
        // alert(requestBody.role_id);
        try {
            const response = await axios.post(baseUrl + '/feediscount/', requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            toast.success("Record Set to Inactive");
            fetchfeediscount();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        const formData = {

            academic_year_id: filter.academic_year_id ? filter.academic_year_id : null,
            class_id: filter.class_id ? filter.class_id : null,
            item_id: filter.item_id ? filter.item_id : null,
            student_id: filter.student_id ? filter.student_id : null,
            fees_item_id: filter.fees_item_id ? filter.fees_item_id : null,
            discount: filter.discount ? filter.discount : null,
            action: "FILTER",
        };

        //  console.log("formData before sending", formData);
        try {
            const response = await axios.post(baseUrl + "/feediscount/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            // console.log("API Response:", response.data);

            const dataArray = Array.isArray(response.data) ? response.data : [];
            setdiscount(dataArray);

            setFilter((prevFilter) => ({
                ...prevFilter,
            }));
            setShowFilterModal(false);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };



    const handleFilterClear = async () => {
        setFilter({
            student_name: "",
            student_id: "",
            discount: "",
            combined_name: "",
            academic_year_id: "",
            class_id: "",
            item_id: "",
            fees_item_id: "",
            action: "FILTER"
        });

        fetchfeediscount("/feediscount");
        // setShowFilterModal(false);
    }


    const handleSearchChange = (event) => {

        fetchfeediscount();
        setSearchQuery(event.target.value);
    };

    useEffect(() => {
        setIsLoading(true);
        fetchfeediscount("/feediscount/").finally(() => setIsLoading(false));
    }, []);



    return (
        <div className='pageMain'>
            <ToastContainer />
            <LeftNav />
            <div className="pageRight">
                <div className="pageHead">
                    <Header />
                </div>
                {/* <div className="pageInfoStatusSubHead">
                        <PageInfoStatus />
                    </div> */}
                <div className="pageBody">
                    <div className="commonDataTableHead">
                        <div className="d-flex justify-content-between align-items-center w-100">

                            {/* Title */}
                            <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                                <h6 className="commonTableTitle">Fee Discount</h6>
                            </div>

                            {/* Search Input */}
                            <div className="">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    className="searchInput"
                                    onChange={handleSearchChange}
                                />
                            </div>

                            {/* Right Side - Filter and Add Buttons */}
                            <div className="d-flex align-items-center" style={{ gap: 6 }}>
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}>
                                    <Button className="secondaryBtn" variant="secondary" onClick={handleShowFilterModal}>
                                        <MdFilterList />
                                    </Button>
                                </OverlayTrigger>

                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add</Tooltip>}>
                                    <Button className="primaryBtn" variant="primary" onClick={() => navigate("/addfeediscount")}>
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
                            ) : discount.length > 0 ? (
                                <DataTable
                                    className="custom-table"
                                    columns={columns}
                                    data={filteredRecords}
                                    pagination
                                    highlightOnHover
                                    responsive
                                    fixedHeader
                                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                                />
                            ) : (
                                <div className="noDataMessage">No records found</div>
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
                        <Col xs={12} >
                            <div className='commonInput'>
                                <Form.Group controlId="combined_name">
                                    <Form.Label>Academic Year Name</Form.Label>
                                    <Form.Select
                                        id="academic_year_id"
                                        name="academic_year_name"
                                        value={filter.academic_year_id}
                                        onChange={(e) => setFilter({ ...filter, academic_year_id: e.target.value })}
                                    >
                                        <option value="">Select Academic Year  Name</option>
                                        {(academicyear || []).map((dept) => (
                                            <option key={dept.academic_year_id} value={dept.academic_year_id}>{dept.academic_year_name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </Col>

                        <Col xs={12} >
                            <div className='commonInput'>
                                <Form.Group controlId="combined_name">
                                    <Form.Label> Class Name</Form.Label>
                                    <Form.Select
                                        id="class_id"
                                        name="class_name"
                                        value={filter.class_id}
                                        onChange={(e) => setFilter({ ...filter, class_id: e.target.value })}
                                    >
                                        <option value="">Select Class Name</option>
                                        {(classes || []).map((dept) => (
                                            <option key={dept.class_id} value={dept.class_id}>{dept.class_name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </Col>

                        <Col xs={12} >
                            <div className='commonInput'>
                                <Form.Group controlId="combined_name">
                                    <Form.Label> Item Name</Form.Label>
                                    <Form.Select
                                        id="item_id"
                                        value={filter.item_id}
                                        onChange={(e) => setFilter({ ...filter, item_id: e.target.value })}
                                    >
                                        <option value="">Select Item Name</option>
                                        {(items || []).map((dept) => (
                                            <option key={dept.item_id} value={dept.item_id}>{dept.item}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </Col>

                        <Col xs={12}>
                            <div className='commonInput'>
                                <Form.Group>
                                    <Form.Label>Student Name</Form.Label>
                                    <select
                                        className="form-select"
                                        id="student_id"
                                        // name='student_name'
                                        value={filter.student_id}
                                        onChange={(e) => setFilter({ ...filter, student_id: e.target.value })}
                                    // required
                                    >
                                        <option value="">Select Student Name </option>
                                        {(discount || []).map((section, index) => (
                                            <option key={index} value={section.student_id}>
                                                {/* {section.student_first_name + " " + section.student_last_name} */}
                                                {section.student_name}
                                            </option>
                                        ))}
                                    </select>
                                    <Form.Control.Feedback>Required</Form.Control.Feedback>
                                </Form.Group>
                            </div>
                        </Col>

                        <Col xs={12}>
                            <div className='commonInput'>
                                <Form.Group >
                                    <Form.Label>Discount </Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="discount"
                                        name="discount"
                                        placeholder="Discount "
                                        value={filter.discount}
                                        // onChange={(e) => setFilter({ ...filter, role_name: e.target.value.trim() })}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                            setFilter({ ...filter, discount: value });
                                        }}

                                    />
                                </Form.Group>
                            </div>
                        </Col>

                    </Row>
                </Modal.Body>
                <Modal.Footer className="modalFooterFixed">
                    <Button
                        variant="secondary"
                        className="btn-info clearBtn me-2" // Applied Roles' "Reset" button style
                        onClick={handleFilterClear}
                    >
                        Reset
                    </Button>

                    <div>
                        <Button
                            variant="secondary"
                            className="btn-danger secondaryBtn me-2" // Applied Roles' "Close" button style
                            onClick={() => {
                                handleCloseFilterModal();
                                handleFilterClear();
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="primary"
                            className="btn-success primaryBtn" // Applied Roles' "Search" button style
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

export default Feediscount;
