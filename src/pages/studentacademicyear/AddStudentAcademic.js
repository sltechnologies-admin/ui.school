import React, { useState, useEffect, useRef } from "react";

//Gadgets Import
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import { Tooltip } from '@mui/material';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

import Badge from 'react-bootstrap/Badge';
import { Image } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import Academic from "../../pages/academicyearfullsetup/academicyear";
import loading from "../../assets/images/common/loading.gif";

//Icons 
import { MdEdit, MdSave } from "react-icons/md";
import { IoMdCamera } from "react-icons/io";

//Css
//import '../../students/addeditStudent/addeditStudent.css';
import { CardFooter } from 'react-bootstrap';

import { MdDelete, MdAddCircle, MdFilterList } from 'react-icons/md';
//Components
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import { toast, ToastContainer } from "react-toastify";

const Addacademicyear = () => {
  const userData = sessionStorage.getItem('user');
  const userObj = JSON.parse(userData);

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState([]);
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showParentDetails, setShowParentDetails] = useState(false);
  const [school, setschool] = useState([]);
  const [months, setMonths] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');

  const [years, setYears] = useState([]);
     const readOnlyRoles = ["Class Teacher", "Teacher"];
    const canSubmit = !readOnlyRoles.includes(userObj.role_name?.trim());



  const formRef = useRef(null);
  const routeLocation = useLocation();

  const [form, setForm] = useState({
    academic_year_id: "",
    academic_year_name: "",
    start_month: "",
    start_year: "",
    end_month: "",
    end_year: "",
    is_current_year: "",
    
    school_id: "",
    school_name: "",
    is_active: ""

  });
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleEditClick = (id) => {
    const itemToEdit = academicYears.find((item) => item.academic_year_id === id);
    if (itemToEdit) {
      navigate('/academicyear', { state: { userData: itemToEdit } });
    } else {
      console.error(`Academic Year with ID ${id} not found.`);
    }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to change the status?')) return;
    try {
      const response = await axios.post(baseUrl + '/AcademicYear', { academic_year_id: id, action: 'DELETE' }, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log(response)
      if (response.status >= 200 && response.status < 300) {
        toast.success('Record Status is Updated');
        fetchAcademicYears();
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const searchableColumns = [
    (row) => row.academic_year_name,
    (row) => row.start_month_name,
    (row) => row.start_year_name,
    (row) => row.end_month_name,
    (row) => row.end_year_name,
    (row) => row.is_current_year,
    (row) => row.is_active,
  ];

  const filteredRecords = (academicYears || []).filter((item) =>
    searchableColumns.some((selector) => {
      const value = selector(item);
      const stringValue = String(value || '').toLowerCase().replace(/[-\s]+/g, '');
      const normalizedQuery = searchQuery.toLowerCase().replace(/[-\s]+/g, '');
      return stringValue.includes(normalizedQuery);
    })
  );



  useEffect(() => {
   
    if (routeLocation.state?.userData) {
      const userData = routeLocation.state.userData;
      setForm(userData);
      setEditId(userData.academic_year_id);
      window.history.replaceState({}, document.title);
    }
  }, [routeLocation]);

  useEffect(() => {
    fetchschool();
    fetchMonths();

    //   fetchEndMonths();
    //   fetchEndYears();
    fetchYears();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchAcademicYears().finally(() => setIsLoading(false));


  }, []);

  const fetchschool = async () => {
    try {
      const response = await axios.post(baseUrl + "/schoolmaster/", {
        action: "READ"
      });
      setschool(response.data);
      // console.log(response.data);
    } catch (error) {
      console.error("Error fetching school:", error);

    }
  };
  const fetchAcademicYears = async () => {
    try {
      const response = await axios.post(baseUrl + '/AcademicYear/', { action: 'READ', school_id: userObj.school_id });
      setAcademicYears(response.data);
      // console.log(response.data)
    } catch (error) {
      console.error('Error fetching academic data:', error);
    }
  };

  const fetchMonths = async () => {
    try {
      const response = await axios.post(baseUrl + "/months/", { action: "READ" });
      setMonths(response.data);

      // console.log(response.data);
    } catch (error) {
      console.log("Error fetching data:", error);


    }
  };



  const fetchYears = async () => {
    try {
      const response = await axios.post(baseUrl + "/years/", { action: "READ" });
      setYears(response.data);

      // console.log(response.data);
    } catch (error) {
      console.log("Error fetching data:", error);


    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;

    const numericFields = ["start_year", "end_year", "start_month", "end_month", "academic_year_name"];

    if (numericFields.includes(id)) {
      let newValue = value.trim();

      if (id === "start_month" || id === "end_month") {
        // Allow only numbers 01 to 12 (with optional leading zero for single digits)
        if (/^(0?[1-9]|1[0-2])?$/.test(newValue)) {
          setForm((prevForm) => ({
            ...prevForm,
            [id]: newValue,
          }));
        }
        return;
      }

      if (id === "start_year" || id === "end_year") {
        // Allow only 4-digit numbers
        if (/^\d{0,4}$/.test(newValue)) {  // Ensures max 4 digits
          setForm((prevForm) => ({
            ...prevForm,
            [id]: newValue,
          }));

        }
        return;
      }


      if (id === "academic_year_name") {
        let newValue = value;
        // Allow only numbers, hyphens, and spaces (max 15 characters)
        if (/^[0-9-\s]{0,30}$/.test(newValue)) {
          setForm((prevForm) => ({
            ...prevForm,
            [id]: newValue.replace(/\s+/g, ' '), // Replaces multiple spaces with a single space
          }));
        }
        return;
      }

      // For other numeric fields (fallback case)
      if (/^\d*$/.test(newValue)) {
        setForm((prevForm) => ({
          ...prevForm,
          [id]: newValue,
        }));
      }
      return;
    }


    setForm((prevForm) => ({
      ...prevForm,
      [id]: id === "is_current_year" ? value.toString() : value,
    }));
  };

  const columns = [
    {
      name: 'Academic Year',
      selector: (row) => row.academic_year_name,
      cell: (row) => <Tooltip title={row.academic_year_name}><span>{row.academic_year_name}</span></Tooltip>,
      sortable: true, width: "150px"
    },
    {
      name: 'Start Month',
      selector: (row) => row.start_month,
      cell: (row) => <Tooltip title={row.start_month_name}><span>{row.start_month_name}</span></Tooltip>,
      sortable: true, width: "150px"
    },
    {
      name: 'Start Year',
      selector: (row) => row.start_year,
      cell: (row) => <Tooltip title={row.start_year_name}><span>{row.start_year_name}</span></Tooltip>,
      sortable: true, width: "100px"
    },
    {
      name: 'End Month',
      selector: (row) => row.end_month,
      cell: (row) => <Tooltip title={row.end_month_name}><span>{row.end_month_name}</span></Tooltip>,
      sortable: true, width: "130px"
    },
    {
      name: 'End Year',
      selector: (row) => row.end_year,
      cell: (row) => <Tooltip title={row.end_year_name}><span>{row.end_year_name}</span></Tooltip>,
      sortable: true, width: "145px"
    },
    {
      name: 'Is Current Year',
      selector: (row) => row.is_current_year,
      cell: (row) => <Tooltip title={row.is_current_year}><span>{row.is_current_year}</span></Tooltip>,
      sortable: true, width: "127px"
    },
    {
      name: 'Status',
      selector: (row) => row.is_active,
      cell: (row) => <Tooltip title={row.is_active}><span>{row.is_active}</span></Tooltip>,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => filteredRecords.length > 0 && (
        <div className='tableActions'>
          <Tooltip title="Edit" arrow>
            <a className='commonActionIcons' onClick={() => handleEditClick(row.academic_year_id)}>
              <span><MdEdit /></span>
            </a>
          </Tooltip>
          <Tooltip title="Delete" arrow>
            <a className='commonActionIcons' onClick={() => handleDeleteClick(row.academic_year_id)}>
              <span><MdDelete /></span>
            </a>
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      academic_year_name: form.academic_year_name,
      start_month: parseInt(form.start_month, 10) || 0,
      start_year: parseInt(form.start_year, 10) || 0,
      end_month: parseInt(form.end_month, 10) || 0,
      end_year: parseInt(form.end_year, 10) || 0,
      is_current_year: form.is_current_year ? form.is_current_year.toString().substring(0, 1) : "N",
     
      school_id: userObj.school_id,
      is_active: form.is_active,
      action: editId !== null ? "UPDATE" : "CREATE",
    };


    if (editId !== null) {
      formData.academic_year_id = editId;
    }

    // console.log("Submitting Form Data:", formData);
    // console.log(formData);

    try {
      const response = await axios.post(baseUrl + "/AcademicYear", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // console.log("API Response:", response.data);
      toast.success(editId !== null ? "Record Updated Successfully" : "Record Added Successfully");

      fetchAcademicYears();
      // setTimeout(() => {
      //     navigate("/studentacademicyear", {
      //         state: {
      //             editId: editId,
      //             toastMessage: editId !== null ? "Record Updated Successfully" : "Record Added Successfully"
      //         }
      //     });
      // }, 1000);

      setForm({
        academic_year_name: "",
        start_month: "",
        start_year: "",
        end_month: "",
        end_year: "",
        is_current_year: "",
      
        school_id: "",
        school_name: "",
        is_active: ""
      });
      await fetchAcademicYears();

      if (editId !== null) setEditId(null);

    } catch (error) {
      console.error("Error submitting data:", error.response?.data || error.message);

      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          if (data.message === "Record Already Exists.") {
            toast.error("Record Already Exists");
          } else if (data.message === "Only One academic year can be marked as current for a school.") {
            toast.error("Cannot create an 'N' record when a 'Y' record already exists!");
          } else {
            toast.error(data.message || "Invalid request!");
          }
        } else if (status === 401) {
          toast.error("Only one academic year can be marked as current for a school");
        } else if (status === 500) {
          toast.error("Internal server error. Please try again later.");
        } else {
          toast.error("An unknown error occurred.");
        }
      } else {
        toast.error("Failed to connect to the server. Please try again!");
      }
    }

  };

  const filteredEndYears = years.filter(
    (year) => parseInt(year.year_id) > parseInt(form.start_year)
  );

  return (
    <>
      <ToastContainer />

      <div className="">
        <Container fluid>
          <Card>
            <Card.Body style={{ padding: "2px" }}>
              <form onSubmit={handleSubmit}>
                {/* <Row>
                  <Col xs={12}>
                    <h6 className="commonSectionTitle">Academic Year Details</h6>
                  </Col>
                </Row> */}

                <Row className="g-3">
                  <Col md={2} className="m-0">
                    <Form.Group className="commonInput">
                      <Form.Label>Academic Year Name <span className="requiredStar">*</span></Form.Label>
                      <Form.Control
                        required
                        type="text"
                        id="academic_year_name"
                        placeholder="Academic Year Name"
                        value={form.academic_year_name}
                        onChange={handleInputChange}
                        maxLength={15}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={2} className="m-0">
                    <Form.Group className="commonInput">
                      <Form.Label>Start Month <span className="requiredStar">*</span></Form.Label>
                      <Form.Select
                        required
                        id="start_month"
                        value={form.start_month}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Start Month</option>
                        {(months || []).map((month) => (
                          <option key={month.month_id} value={month.month_id}>{month.month_name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={2} className="m-0" >
                    <Form.Group className="commonInput">
                      <Form.Label>Start Year <span className="requiredStar">*</span></Form.Label>
                      <Form.Select
                        required
                        id="start_year"
                        value={form.start_year}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Start Year</option>
                        {(years || []).map((year) => (
                          <option key={year.year_id} value={year.year_id}>{year.year_name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={2} className="m-0">
                    <Form.Group className="commonInput">
                      <Form.Label>End Month <span className="requiredStar">*</span></Form.Label>
                      <Form.Select
                        required
                        id="end_month"
                        value={form.end_month}
                        onChange={handleInputChange}
                      >
                        <option value="">Select End Month</option>
                        {(months || []).map((month) => (
                          <option key={month.month_id} value={month.month_id}>{month.month_name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={2} className="m-0">
                    <Form.Group className="commonInput">
                      <Form.Label>End Year <span className="requiredStar">*</span></Form.Label>
                      <Form.Select
                        required
                        id="end_year"
                        value={form.end_year}
                        onChange={handleInputChange}
                      >
                        <option value="">Select End Year</option>
                        {(filteredEndYears || []).map((year) => (
                          <option key={year.year_id} value={year.year_id}>{year.year_name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={2} className="m-0">
                    <Form.Group className="commonInput">
                      <Form.Label>Is Current Year <span className="requiredStar">*</span></Form.Label>
                      <Form.Select
                        required
                        id="is_current_year"
                        value={form.is_current_year}
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-between mt-1">
                  <Button
                    type="button"
                    variant="primary"
                    className="btn-info clearBtn"
                    onClick={() => {
                      setForm({
                        academic_year_name: "",
                        start_month: "",
                        start_year: "",
                        end_month: "",
                        end_year: "",
                        is_current_year: "",
                        createdby: "",
                        lastmodifiedby: "",
                      });
                      setEditId(null);
                    }}
                  >
                    Reset
                  </Button>


                  <div>
                    <Button
                      type="button"
                      variant="danger"
                      className="btn-danger secondaryBtn me-2"
                      onClick={() => window.location.reload()}

                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="success"
                      className="btn-success primaryBtn"
                    >
                      <MdSave style={{ marginRight: "5px" }} />
                      {editId !== null ? "Update" : "Save"}
                    </Button>
                  </div>
                </div>
              </form>
            </Card.Body>
          </Card>
        </Container>
      </div>
      <div className="commonDataTableHead">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            {/* <h6 className="commonTableTitle">Academic Sections</h6> */}
          </div>
          <div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              maxLength={30}
              className="searchInput mt-1"
              onChange={handleSearchChange}
            />
          </div>

        </div>
      </div>
      <div className="commonTable height100 mt-0">
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
                filteredRecords.length > 0
                  ? filteredRecords
                  : [{ academic_year_id: 'No records found', end_month_name: 'No records found' }]
              }
              pagination={filteredRecords.length > 0}
              highlightOnHover
              responsive
              fixedHeader
              fixedHeaderScrollHeight="calc(100vh - 170px)"
              conditionalRowStyles={[
                {
                  when: (row) => row.academic_year_id === 'No records found',
                  style: {
                    textAlign: 'center',
                    fontSize: '16px',
                    color: 'red',
                    backgroundColor: '#f9f9f9',
                  },
                },
              ]}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Addacademicyear;
