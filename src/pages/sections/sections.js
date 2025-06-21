import React, { useEffect, useState} from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import {  Row, Col,  Button, Modal, Form, OverlayTrigger } from "react-bootstrap";
import { Tooltip } from '@mui/material';
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../components/layout/header/header';
import loading from "../../assets/images/common/loading.gif";
import LeftNav from '../../components/layout/leftNav/leftNav';
import {MdEdit, MdDelete, MdAddCircle, MdFilterList} from "react-icons/md";
import { fetchDataRead } from "../../Utility";

const Sections = () => {
    const [sections, setSections] = useState([])
    const [classes, setClasses] = useState([]);
    const [academicyear, setacademicyear] = useState([])
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const [filter, setFilter] = useState({
        section_name: "",
        class_id: 0,
        room_number: "",
        academic_year_id: 0,
        action: "FILTER"
    });

    const fetchSections = async () => {
        try {
            const response = await axios.post(baseUrl + "/Sections/", {
                action: "READ", school_id: userObj.school_id
            });
            setSections(response.data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };
  
    const handleEditClick = (section_id) => {
        const sectionmasterToEdit = sections.find(sections => sections.section_id === section_id);

        if (sectionmasterToEdit) {
            navigate("/academicyear", { state: { sectionData: sectionmasterToEdit } });
        } else {
            console.error(`sectionData with ID ${section_id} not found.`);
        }
    };
    useEffect(() => {
       
        setIsLoading(true);
        fetchSections().finally(() => setIsLoading(false));
    }, []);

    const handleShowFilterModal = () => {
        if (academicyear.length === 0) {
            fetchDataRead("/AcademicYear/", setacademicyear, userObj.school_id);
        }
        if (classes.length === 0) {
            fetchDataRead("/classes/", setClasses,userObj.school_id);
        }
        if (sections.length === 0) {
            fetchDataRead("/Sections/", setSections,userObj.school_id);

        }
        setShowFilterModal(true);
    };
     









  
    const handleDeleteClick = async (section_id) => { 
        const confirmDelete = window.confirm('Are you sure you want change the status?');
        if (!confirmDelete) {
            return;
        }
        const requestBody = {
            section_id: section_id,
            action: "DELETE"
        };
        try {
            const response = await axios.post(baseUrl + "/Sections/", requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            toast.success("Record Set to InActive");
            fetchSections();
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const columns = [
        {
            name: "Academic Year",
            selector: (row) => row.academic_year_name,
            cell: row => (
                <Tooltip title={row.academic_year_name}>
                    <span>{row.academic_year_name}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Class",
            selector: (row) => row.class_name,
            cell: row => (
                <Tooltip title={row.class_name}>
                    <span>{row.class_name}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Section",
            selector: row => row.section_name,
            cell: row => (
                <Tooltip title={row.section_name}>
                    <span>{row.section_name}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Room Number",
            selector: (row) => row.room_number,
            cell: row => (
                <Tooltip title={row.room_number}>
                    <span>{row.room_number}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Is Active",
            selector: (row) => row.is_active,
            cell: row => (
                <Tooltip title={row.is_active}>
                    <span>{row.is_active}</span>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Actions",
            cell: (row) => row.section_id !== "No records found" ?
                (
                    <div className='tableActions'>
                        <Tooltip title="Edit" arrow>
                            <a className='commonActionIcons' onClick={() => handleEditClick(row.section_id)}>
                                <span><MdEdit /></span>
                            </a>
                        </Tooltip>

                        <Tooltip title="Delete" arrow>
                            <a className='commonActionIcons' onClick={() => handleDeleteClick(row.section_id)}>
                                <span><MdDelete /></span>
                            </a>
                        </Tooltip>
                    </div>
                ) : null
        },
    ]
    const searchableColumns = [
        (row) => row.academic_year_name,
        (row) => row.class_name,
        (row) => row.section_name,
        (row) => row.room_number,
        (row) => row.is_active,
    ];
    const filteredRecords = (sections || []).filter((section) =>
        searchableColumns.some((selector) => {
            const value = selector(section);
            return String(value || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        })
    );
    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            section_name: filter.section_name || "",
            class_id: filter.class_id || 0,
            room_number: filter.room_number || "",
            academic_year_id: userObj.academic_year_id || 0,
            school_id: userObj.school_id,
            action: "FILTER"
        };
        try {
            const response = await axios.post(baseUrl + "/Sections/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const filterdata = response.data || [];
            if (filterdata.length === 0) {
                setSections([]);
        
            }
            else {
                setSections(filterdata);
            }
            setShowFilterModal(false);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setSections([]); 

            } else {
                toast.error("Failed to fetch filtered data");
            }
        }
    };
    const handleFilterClear = async () => {
        setFilter({
            section_id: 0,
            section_name: "",
            class_id: "",
            room_number: "",
            school_name: "",
            academic_year_id: 0,
            action: "FILTER"
        });
        fetchSections("/sections")
    };
    const handleSearchChange = (event) => {

        fetchSections();
        setSearchQuery(event.target.value);
    };
  return (
  <>
    <ToastContainer />

    <div className="">
      {/* <div className="commonDataTableHead">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <h6 className="commonTableTitle">Academic Sections</h6>
          </div>
          <div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              maxLength={30}
              className="searchInput"
              onChange={handleSearchChange}
            />
          </div>
          <div className="d-flex align-items-center" style={{ gap: 6 }}>
            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}>
              <Button
                className="secondaryBtn"
                variant="secondary"
                onClick={handleShowFilterModal}
              >
                <MdFilterList />
              </Button>
            </OverlayTrigger>
            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add</Tooltip>}>
              <Button
                className="primaryBtn"
                variant="primary"
                onClick={() => navigate("/AddNewSections")}
              >
                <MdAddCircle />
              </Button>
            </OverlayTrigger>
          </div>
        </div>
      </div> */}

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
              data={
                Array.isArray(filteredRecords) && filteredRecords.length > 0
                  ? filteredRecords
                  : [
                      {
                        section_id: "No records found",
                        section_name: "No records found",
                      },
                    ]
              }
              pagination={Array.isArray(filteredRecords) && filteredRecords.length > 0}
              highlightOnHover
              responsive
              fixedHeader
              fixedHeaderScrollHeight="calc(100vh - 200px)"
              conditionalRowStyles={[
                {
                  when: (row) => row.section_id === "No records found",
                  style: {
                    textAlign: "center",
                    fontSize: "16px",
                    backgroundColor: "#f9f9f9",
                  },
                },
              ]}
            />
          )}
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
                  <Form.Group controlId="academic_year_id">
                    <Form.Label>Academic Year</Form.Label>
                    <Form.Select
                      id="academic_year_id"
                      name="academic_year_id"
                      value={filter.academic_year_id}
                      onChange={(e) =>
                        setFilter({ ...filter, academic_year_id: e.target.value })
                      }
                    >
                      <option value="0" disabled hidden>
                        {userObj.academic_year_name}
                      </option>
                      {(academicyear || []).map((dept) => (
                        <option key={dept.academic_year_id} value={dept.academic_year_id}>
                          {dept.academic_year_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </Col>

              <Col xs={12}>
                <div className="commonInput">
                  <Form.Group controlId="Class_name">
                    <Form.Label>Class</Form.Label>
                    <Form.Select
                      id="class_id"
                      name="class_id"
                      value={filter.class_id}
                      onChange={(e) =>
                        setFilter({ ...filter, class_id: e.target.value })
                      }
                    >
                      <option value="">Select Class</option>
                      {(classes || []).map((depti) => (
                        <option key={depti.class_id} value={depti.class_id}>
                          {depti.class_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </Col>

              <Col xs={12}>
                <div className="commonInput">
                  <Form.Group controlId="Department">
                    <Form.Label>Section</Form.Label>
                    <Form.Control
                      type="text"
                      id="section_name"
                      name="section_name"
                      value={filter.section_name}
                      maxLength={30}
                      placeholder="Enter Section"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^[a-zA-Z0-9]*$/.test(value)) {
                          setFilter({ ...filter, section_name: value });
                        }
                      }}
                    />
                  </Form.Group>
                </div>
              </Col>

              <Col xs={12}>
                <div className="commonInput">
                  <Form.Group controlId="City">
                    <Form.Label>Room Number</Form.Label>
                    <Form.Control
                      type="text"
                      id="room_number"
                      placeholder="Enter Room Number"
                      value={filter.room_number}
                      maxLength={30}
                      onChange={(e) => {
                        let value = e.target.value;
                        value = value.replace(/[^a-zA-Z0-9-]/g, "");
                        if ((value.match(/-/g)?.length || 0) > 1) {
                          return;
                        }
                        setFilter({ ...filter, room_number: value });
                      }}
                    />
                  </Form.Group>
                </div>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modalFooterFixed">
          <Button variant="secondary" className="btn-info clearBtn" onClick={handleFilterClear}>
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
              className="btn-success primaryBtn"
              form="filterForm"
              onClick={handleCloseFilterModal}
            >
              Search
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  </>
);

};
export default Sections;