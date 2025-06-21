import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Tooltip from "@mui/material/Tooltip";
import { MdFilterList, MdAddCircle } from "react-icons/md";
import loading from "../../assets/images/common/loading.gif";
import {  Modal, Row, Col, Form, Button, OverlayTrigger } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { MdEdit, MdDelete } from "react-icons/md";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import DataTable from "react-data-table-component";

const SchoolMaster = () => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const handleCloseFilterModal = () => setShowFilterModal(false);
  const handleShowFilterModal = () => setShowFilterModal(true);
  const [schools, setSchools] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState([]);
  const navigate = useNavigate();
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const [filter, setFilter] = useState({
    school_name: "",
    branch: "",
    mobile_number: "",
    email: "",
    city: "",
    state: "",
    action: "FILTER",
  });
  const handleEditClick = (school_id) => {
    const schoolmasterToEdit = schools.find(
      (schools) => schools.school_id === school_id
    );
    if (schoolmasterToEdit) {
      navigate("/addNewSchool", {
        state: {
          schoolData: schoolmasterToEdit,
          imgName: schoolmasterToEdit.logo,
        },
      });
    } else {
      console.error(`School with ID ${school_id} not found.`);
    }
  };

  const fetchData = async (endpoint, setter) => {
    try {
      const response = await axios.post(baseUrl + endpoint, { action: 'READ' });
      setter(response.data);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  };
  useEffect(() => {
    setIsLoading(true)
    fetchData("/schoolmaster/", setSchools).finally(() => setIsLoading(false));
  }, []);
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));
  };
  const handleDeleteClick = async (school_id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to change the status?"
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.post(
        baseUrl + "/schoolmaster/",
        { school_id, action: "DELETE" },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      toast.success("Record Set to InActive");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete record");
    }
  };
  const handleFilterSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      school_name: filter.school_name || "",
      branch: filter.branch || "",
      city: filter.city || "",  
      mobile_number: filter.mobile_number || "",
      email: filter.email || "",
      action: "FILTER",
    };
    const isAnyFieldFilled = Object.values(formData).some(val => val !== "" && val !== "FILTER");
    if (isAnyFieldFilled)
    {
      try {
        const response = await axios.post(baseUrl + "/schoolmaster/", formData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const filterData = response.data || [];
        setSchools(filterData.length ? filterData : []);
        setShowFilterModal(false);
      } 
      catch (error) {
        console.error("Error fetching data:", error);

        if (error.response && error.response.status === 404) {
          setSchools([]);
        } else {
          toast.error("Failed to fetch filtered data");
        }
      }     
    }
    else{  
      handleCloseFilterModal();
       fetchData("/schoolmaster", setSchools);
    }
  };
  const handleFilterClear = async () => {
    setFilter({
      school_id: 0,
      school_name: "",
      branch: "",
      mobile_number: "",
      city: "",
      action: "FILTER",
    });
    setForm({ ...form, email: "" });
    fetchData("/schoolmaster", setSchools);
  };      
  const columns = [
    {
      name: "School Name",
      selector: (row) => row.school_name,
      cell: (row) => (
        <Tooltip title={row.school_name}>
          <span>{row.school_name}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Branch",
      selector: (row) => row.branch,
      cell: (row) => (
        <Tooltip title={row.branch}>
          <span>{row.branch}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Location",
      selector: (row) => row.school_location,
      cell: (row) => (
        <Tooltip title={row.school_location || ''}>
          <span>
            {row.school_location && row.school_location.length > 10
              ? row.school_location.substring(0, 10) + "..."
              : row.school_location || ''}
          </span>
        </Tooltip>
      ),
      sortable: true,
    },

    {
      name: "City",
      selector: (row) => row.city,
      cell: (row) => (
        <Tooltip title={row.city}>
          <span>{row.city}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Mobile Number",
      selector: (row) => row.mobile_number,
      cell: (row) => (
        <Tooltip title={row.mobile_number}>
          <span>{row.mobile_number}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      cell: (row) => (
        <Tooltip title={row.email ? row.email : ''}>
          <span>
            {row.email && row.email.length > 10
              ? row.email.substring(0, 10) + "..."
              : row.email || ''}
          </span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      cell: (row) => (
        <Tooltip title={row.status}>
          <span>{row.status}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Logo",
      selector: (row) => row.logo,
      cell: () => null,
      sortable: true,
      omit: true,
    },
    {
      name: "Actions",
      cell: (row) => row.school_id !== "No records found" ? (
        <div className="tableActions">
          <Tooltip title="Edit" arrow>
            <a
              className="commonActionIcons"
              onClick={() => handleEditClick(row.school_id)}
            >
              <span>
                <MdEdit />
              </span>
            </a>
          </Tooltip>
          <Tooltip title="Delete" arrow>
            <a
              className="commonActionIcons"
              onClick={() => handleDeleteClick(row.school_id)}
            >
              <span>
                <MdDelete />
              </span>
            </a>
          </Tooltip>
        </div>
      ) : null
    },
  ];
  const searchableColumns = [
    (row) => row.school_name,
    (row) => row.city,
    (row) => row.branch,
    (row) => row.mobile_number,
    (row) => row.email,
    (row) => row.school_location,
    (row) => row.status,
  ];
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredRecords =
    (trimmedQuery || "").length > 0
      ? (schools || []).filter((school) =>
        searchableColumns.some((selector) => {
          const value = selector(school);
          return String(value || "")
            .toLowerCase()
            .includes(trimmedQuery.toLowerCase());
        })
      )
      : schools || [];
  const handleSearchChange = (event) => {
    fetchData();
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
                <h6 className="commonTableTitle">School Master</h6>
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
                  <Button className="primaryBtn" variant="primary" onClick={() => navigate("/addNewSchool")}>
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
                  data={
                    Array.isArray(filteredRecords) && filteredRecords.length > 0
                      ? filteredRecords
                      : [
                        {
                          school_id: "No records found",
                          city: "No records found",
                        },
                      ]
                  }
                  pagination={
                    Array.isArray(filteredRecords) && filteredRecords.length > 0
                  }
                  highlightOnHover
                  responsive
                  fixedHeader
                  fixedHeaderScrollHeight="calc(100vh - 170px)"
                  conditionalRowStyles={[
                    {
                      when: (row) => row.school_id === "No records found",
                      style: {
                        textAlign: "center",
                        fontSize: "16px",
                        color: "red",
                        backgroundColor: "#f9f9f9",
                      },
                    },
                  ]}
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
                  <Form.Group controlId="school_name">
                    <Form.Label>School Name</Form.Label>
                    <Form.Control
                      type="text"
                      id="school_name"
                      name="school_name"
                      placeholder="School Name"
                      value={filter.school_name || ""}
                      maxLength={30}
                      onChange={(e) => {
                        const value = e.target.value.replace(
                          /[^A-Za-z\s]/g,
                          ""
                        );
                        setFilter({ ...filter, school_name: value });
                      }}
                    />
                  </Form.Group>
                </div>
              </Col>

              <Col xs={12}>
                <div className="commonInput">
                  <Form.Group controlId="branch">
                    <Form.Label>Branch</Form.Label>
                    <Form.Control
                      type="text"
                      id="branch"
                      name="branch"
                      placeholder="Branch"
                      maxLength={50}
                      value={filter.branch || ""}
                      onChange={(e) =>
                        setFilter({ ...filter, branch: e.target.value.trim() })
                      }
                    />
                  </Form.Group>
                </div>
              </Col>
              <Col xs={12}>
                <div className="commonInput">
                  <Form.Group controlId="mobile_number">
                    <Form.Label>Mobile Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="mobile_number"
                      id="mobile_number"
                      placeholder="Enter Mobile Number"
                      value={filter.mobile_number || ""}
                      maxLength={10}
                      onChange={(e) => {
                        const value = e.target.value.trim().replace(/\D/g, "");
                        setFilter({
                          ...filter,
                          mobile_number: value,
                        });
                      }}
                    />
                  </Form.Group>
                </div>
              </Col>
              <Col xs={12}>
                <div className="commonInput">
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      required
                      type="email"
                      id="email"
                      value={form.email}
                      placeholder="Enter Email Address"
                      maxLength={150}
                      onChange={handleInputChange}

                    />
                  </Form.Group>
                </div>
              </Col>
              <Col xs={12}>
                <div className="commonInput">
                  <Form.Group controlId="city">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      id="city"
                      placeholder="Enter City"
                      maxLength={50}
                      value={filter.city || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(
                          /[^A-Za-z\s]/g,
                          ""
                        );
                        setFilter({ ...filter, city: value });
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
            <Button
              variant="secondary"
              className="btn-info clearBtn"
              onClick={handleFilterClear}
            >
              Reset
            </Button>
          </div>
          <div className="">
            <Button
              variant="secondary"
              className=" btn-danger secondaryBtn"
              onClick={() => {
                handleCloseFilterModal();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="btn-success primaryBtn"
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
export default SchoolMaster;
