import React, { useEffect, useState } from "react";
import axios from "axios";
// import { ToastContainer } from "react-toastify";
import {Modal,Form,Container,Row,Col,Card,Image,Button,OverlayTrigger} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { MdEdit, MdDelete,MdAddCircle } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";
import { ToastContainer, toast } from 'react-toastify';
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { Tooltip } from '@mui/material';
import { FaRegFileExcel } from "react-icons/fa";
import { Tooltip as ReactTooltip } from "react-tooltip";
import excelIcon from "../../assets/icons/excel.png";
import { MdFilterList } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import loading from "../../assets/images/common/loading.gif";

//Importing Images
import sampleSchoolLogo from "../../assets/images/common/sampleSchoolLogo.png";

// Components
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { px } from "framer-motion";

// Modal component for showing homework details
const HomeworkDetailsModal = ({ show, onHide, homeworkDetails }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Homework Details</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
        <p>{homeworkDetails}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};


const Homeworklist = () => {
  const userData = sessionStorage.getItem('user');

  const userObj = JSON.parse(userData);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const handleCloseFilterModal = () => setShowFilterModal(false);
  const handleShowFilterModal = () => setShowFilterModal(true);
  const [selectedHomework, setSelectedHomework] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userHomework, setUserHomework] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState({
    homework_details: "",
    homework_date: "",
    section_id: "",
    subject_id: "",
    class_id: "",
    academic_year_id: "",
    //school_id: 66
  });

  const [dropdownOptions, setDropdownOptions] = useState({});

  const navigate = useNavigate();
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const tooltipStyles = {
    maxWidth: "200px",
    fontSize: "12px",
    padding: "5px",
    textAlign: "center",
    whiteSpace: "normal",
  };
  const fetchHomework = async () => {
    try {
      const response = await axios.post(baseUrl + "/homework/", {
        action: "READ",school_id:userObj.school_id
      });
      setUserHomework(response.data);
      // console.log('====================================');
      // console.log(response.data);
      // console.log('====================================');
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  useEffect(() => {
    // document.title = "Homework";
    window.history.replaceState({}, document.title);
    fetchHomework();

    const fetchDropdowns = async () => {
      try {
        // Fetch Sections
        const sectionResponse = await axios.post(`${baseUrl}/Sections/`, {
          action: "READ",school_id:userObj.school_id
        });

        // Fetch Subjects
        const subjectResponse = await axios.post(`${baseUrl}/subjectmaster/`, {
          action: "READ",school_id:userObj.school_id
        });

        // Fetch Classes
        const classResponse = await axios.post(`${baseUrl}/classes/`, {
          action: "READ",school_id:userObj.school_id
        });

        // Fetch Academic Years
        const academicYearResponse = await axios.post(
          `${baseUrl}/AcademicYear/`,
          { action: "READ" }
        );

        setDropdownOptions({
          sectionIds: sectionResponse.data,
          subjectIds: subjectResponse.data,
          classIds: classResponse.data,
          academicYearIds: academicYearResponse.data,
        });
      } catch (error) {
        console.error("Failed to fetch dropdown options:", error);
      }
    };

    fetchDropdowns();
    setIsLoading(true);
    fetchHomework().finally(() => setIsLoading(false));
  }, []);

  const handleHomeworkClick = (homeworkDetails) => {
    setSelectedHomework(homeworkDetails);
    setShowModal(true);
  };
  // Table Columns
 const columns = [
  // { name: "School Name", selector: (row) => row.school_name, sortable: true,
  //     cell: (row) => (
  //         <div>
  //             <span id={`school-tooltip-${row.homework_id}`} className="tooltip-text">
  //                 {row.school_name}
  //             </span>
  //             <ReactTooltip id={`tooltip-${row.homework_id}`} anchorSelect={`#school-tooltip-${row.homework_id}`}
  //                 place="bottom" content={row.school_name} style={tooltipStyles} positionStrategy="fixed"
  //                 positionFixed={true} />
  //         </div>
  //     ),
  // },
  {
    name: "Date",
    selector: row => formatDate1(row.homework_date),
    cell: row => (
      <Tooltip title={formatDate1(row.homework_date)}>
        <span>{formatDate1(row.homework_date)}</span>
      </Tooltip>
    ),
    sortable: true
  },
  {
    name: "Class ",
    selector: (row) => row.class_name,
    sortable: true,
    
    cell: (row) => (
      <div>
      <Tooltip title={row.class_name}>
                          <span>{row.class_name}</span>
                      </Tooltip>
      
      </div>
    ),
  },
  {
    name: "Section ",
    selector: (row) => row.section_name,
    sortable: true,
    
    cell: (row) => (
      <div>
      <Tooltip title={row.section_name}>
                          <span>{row.section_name}</span>
                      </Tooltip>
      
      </div>
    ),
  },
  
  {
    name: "Subject ",
    selector: (row) => row.subject_name,  // Define what field is used for sorting
    sortable: true,  // Enable sorting for this column
    cell: (row) =>
        filteredRecords.length > 0 ? (
            <Tooltip title={row.subject_name}>
                <span>{row.subject_name}</span>
            </Tooltip>
        ) : (
            <div className="noDataMessage">No records found</div>
        ),
}
,
  
  {
    name: 'Homework Details',
      selector: (row) => row.homework_details,
      sortable: true,
      cell: (row) => (
        <div
         className="homework-details-cell"
          onClick={() => handleHomeworkClick(row.homework_details)}
          style={{
            cursor: 'pointer',
            // textDecoration: 'underline',
            // color: 'blue',
          }}
        >
          {(row.homework_details || []).length > 50
            ? `${row.homework_details.substring(0, 50)}...`
            : row.homework_details}
        </div>
      ),  },
  {
    name: "Attachments",
    selector: (row) => row.attachments,
    sortable: true,
    cell: (row) => (
      <div  className="homework-details-cell">
        
      <Tooltip title={row.attachments}>
                          <span>{row.attachments}</span>
                      </Tooltip>
      
      </div>
    ),

  },
  {
                               name: "Actions",
                               cell: (row) =>
                                   filteredRecords.length > 0 ? (
                                       <div className='tableActions'>
                                           <Tooltip title="Edit" arrow>
                                               <a className='commonActionIcons' onClick={() => handleEditClick(row.homework_id)}>
                                                   <span><MdEdit /></span>
                                               </a>
                                           </Tooltip>
                                           <Tooltip title="Delete" arrow>
                                               <a className='commonActionIcons' onClick={() => handleDeleteClick(row.homework_id)}>
                                                   <span><MdDelete /></span>
                                               </a>
                                           </Tooltip>
                                       </div>
                                   ) : null, // No actions if no records
                                   width: "90px"
                           },

];

const formatDate1 = (datetime) => {
  if (!datetime) {
    return ''; // Return an empty string if the date is invalid or undefined
  }

  const date = new Date(datetime);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return ''; // Return an empty string if the date is invalid
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${day}-${month}-${year}`;
};



  // const handleDeleteClick = async (homework_id) => {
  //   const confirmDelete = window.confirm(
  //     "Are you sure you want to delete this record?"
  //   );

  //   if (!confirmDelete) return;
  //   try {
  //     const response = await axios.post(
  //       baseUrl + "/homework/",
  //       { homework_id: homework_id, action: "DELETE" },
  //       {
  //         headers: { "Content-Type": "application/json" },
  //       }
  //     );

  //     // console.log("Response:", response.data);
  //     if (response.status < 200 || response.status >= 300) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }

  //     toast.success("Record Deleted");
  //     setUserHomework((prevHomework) =>
  //       prevHomework.filter((item) => item.homework_id !== homework_id)
  //     );
  //   } catch (error) {
  //     console.error("Error response:", error.response?.data || error.message);
  //     toast.error("Error deleting record");
  //   }
  // };
  const handleDeleteClick = async (homework_id) => {
          const confirmDelete = window.confirm('Are you sure you want to change the status?');
  
          if (!confirmDelete) {
              return;
          }
          const requestBody = {
            homework_id: homework_id,
              action: "DELETE"
          };
          // alert(requestBody.role_id);
          try {
              const response = await axios.post(baseUrl + '/homework/', requestBody, {
                  headers: {
                      'Content-Type': 'application/json'
                  },
              });
              if (response.status < 200 || response.status >= 300) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
              }
              toast.success("Record Deleted Successfully");
              fetchHomework();
          } catch (error) {
              console.error('Error:', error);
          }
      };
  
  
  const filteredRecords = (userHomework || []).filter((userHomework) => {
    const searchQueryString = searchQuery.trim().toLowerCase();
  
    if (!searchQueryString) {
      return true;
    }
  
    return Object.entries(userHomework || {}).some(([key, value]) => {
      const excludedKeys = [
        "homework_id",
        "class_id",
        "academic_year_id",
        "section_id",
        "subject_id",
        "school_id",
        "createddate",
        "lastmodifieddate",
      ];
      if (excludedKeys.includes(key)) {
        return false;
      }
      if (value === null || value === undefined) {
        return false;
      }
  
      let valueString = String(value).trim().toLowerCase();
  
      // If the key is homework_date, format it to dd-MM-yyyy
      if (key === "homework_date") {
        valueString = formatDate1(value).toLowerCase(); // Format the date before comparison
      }
  
      return valueString.includes(searchQueryString);
    });
  });
  
  // console.log("Final Filtered Records:", filteredRecords);

  const handleDownload = () => {
    const dataToDownload = filteredRecords.map((record) => {
      let dateValue = "";

      if (typeof record.homework_date === "string") {
        const trimmedDate = record.homework_date.trim();
        dateValue = trimmedDate.includes(" ")
          ? trimmedDate.split(" ")[0]
          : trimmedDate;
      }

      return {
        "Homework Details": record.homework_details,
        Date: dateValue,
        "Section Name": record.section_name,
        "Subject Name": record.subject_name,
        "Class Name": record.class_name,
        "Academic Year": record.academic_year_name,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Homework List");

    XLSX.writeFile(workbook, "Homework.xlsx");
  };

  const handleEditClick = (homework_id) => {
    const UserHomeworkEdit = userHomework.find(
      (user) => user.homework_id === homework_id
    );

    if (UserHomeworkEdit) {
      navigate("/addhomework", { state: { userData: UserHomeworkEdit } });
    } else {
      console.error(`User with ID ${homework_id} not found.`);
    }
  };

  const handleFilterSearch = async () => {
    // console.log("Search button clicked with filters:", filterValues);

    try {
      const payload = {
        action: "FILTER",
        homework_details: filterValues.homework_details?.trim() || null,
        homework_date: filterValues.homework_date || null,
        section_id: filterValues.section_id || 0,
        subject_id: filterValues.subject_id || 0,
        class_id: filterValues.class_id || 0,
        academic_year_id: filterValues.academic_year_id || 0,
        school_id:userObj.school_id,
        
      };

      // console.log("Homework payload:", payload);
      const response = await axios.post(`${baseUrl}/homework/`, payload);

      // console.log("API Response:", response.data);

      if (response.status === 201 && response.data.length > 0) {
        setUserHomework(response.data);
        setShowFilterModal(false);
        toast.success("Records filtered successfully.");
      } else {
        setUserHomework([]); 
        toast.warn("No matching records found.");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setUserHomework([]);
          toast.warn("No matching records found.");
        } else {
          console.error("Error during filter search:", error.response.data);
          toast.error(
            `Failed to filter records: ${
              error.response.data.message || "Unknown error"
            }`
          );
        }
      } else {
        console.error("Error during filter search:", error.message);
        toast.error("Failed to filter records due to a network issue.");
      }
    }
    setShowFilterModal(false);
  };

  const handleSearchChange = (event) => {
    const searchValue = event.target.value;
    setSearchQuery(searchValue);

    if (searchValue.trim() !== "") {
      fetchHomework();
    }
  };

  return (
    <Container fluid>
       <ToastContainer />
      <div className="pageMain">
        <LeftNav />
        <div className="pageRight">
          <div className="pageHead">
            <Header />
          </div>

          <div className="pageBody">
          <div className="commonDataTableHead">
              <div className="d-flex justify-content-between align-items-center w-100">
 
                {/* Title */}
                <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                  <h6 className="commonTableTitle">Homework</h6>
                </div>
 
                {/* Search Input */}
                <div>
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
                    <Button className="primaryBtn" variant="primary" onClick={() => navigate("/addhomework")}>
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
            <>
                <DataTable
                    className="custom-table"
                    columns={columns}
                    data={(Array.isArray(filteredRecords) && filteredRecords.length > 0)
                        ? filteredRecords // ✅ Use real data when available
                        : [{
                            userid: "No records found",
                            role_name: "No records found",
                        }]
                    }
                    pagination={Array.isArray(filteredRecords) && filteredRecords.length > 0} // ✅ Enable pagination only when data exists
                    highlightOnHover
                    responsive
                    fixedHeader
                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                    conditionalRowStyles={[
                        {
                            when: (row) => row.userid === "No records found",
                            style: {
                                textAlign: "center",
                                fontSize: "16px",
                                color: "red",
                                backgroundColor: "#f9f9f9" // Light gray background
                            },
                        },
                    ]}
                />

                {/* Homework Details Modal */}
                <HomeworkDetailsModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    homeworkDetails={selectedHomework}
                />
            </>
        )}
    </div>
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
          <Row>

          <Col xs={12}>
              <div className="commonInput">
                <Form.Group controlId="homework_date">
                  <Form.Label> Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="homework_date"
                    value={filterValues.homework_date}
                    onChange={(e) =>
                      setFilterValues({
                        ...filterValues,
                        homework_date: e.target.value,
                      })
                    }
                    min={`${new Date().getFullYear() - 1}-01-01`}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </Form.Group>
              </div>
            </Col>

            <Col xs={12}>
              <div className="commonInput">
                <Form.Group controlId="class_id">
                  <Form.Label>Class</Form.Label>
                  <Form.Select
                    name="class_id"
                    value={filterValues.class_id}
                    onChange={(e) =>
                      setFilterValues({
                        ...filterValues,
                        class_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Class</option>
                    {dropdownOptions.classIds?.filter((option) => option.is_active==="Active").map((option) => (
                      <option key={option.class_id} value={option.class_id}>
                        {option.class_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </Col>

            <Col xs={12}>
              <div className="commonInput">
                <Form.Group controlId="section_id">
                  <Form.Label>Section</Form.Label>
                  <Form.Select
                    name="section_id"
                    value={filterValues.section_id}
                    onChange={(e) =>
                      setFilterValues({
                        ...filterValues,
                        section_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Section</option>
                    {dropdownOptions.sectionIds?.filter((option) => option.is_active==="Active").map((option) => (
                      <option key={option.section_id} value={option.section_id}>
                        {option.section_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </Col>

            <Col xs={12}>
              <div className="commonInput">
                <Form.Group controlId="subject_id">
                  <Form.Label>Subject</Form.Label>
                  <Form.Select
                    name="subject_id"
                    value={filterValues.subject_id}
                    onChange={(e) =>
                      setFilterValues({
                        ...filterValues,
                        subject_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Subject</option>
                    {dropdownOptions.subjectIds?.filter((option) => option.is_active==="Active").map((option) => (
                      <option key={option.subject_id} value={option.subject_id}>
                        {option.subject_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </Col>


            {/* <Col xs={12}>
              <div className="commonInput">
                <Form.Group controlId="homework_details">
                  <Form.Label>Homework Details</Form.Label>
                  <Form.Control
                    type="text"
                    name="homework_details"
                    placeholder="Enter Homework Details"
                    value={filterValues.homework_details}
                    onChange={(e) =>
                      setFilterValues({
                        ...filterValues,
                        homework_details: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </div>
            </Col> */}

            
            

            

            
            
          </Row>
        </Modal.Body>
        <Modal.Footer className="modalFooterFixed">
          <Button
            variant="secondary"
            className="btn-info clearBtn me-2"
            onClick={() => {
              setFilterValues({
                homework_id: "",
                homework_details: "",
                homework_date: "",
                section_id: "",
                subject_id: "",
                createdby: "",
                lastmodifiedby: "",
                section_name: "",
                subject_name: "",
                class_id: "",
                academic_year_id: "",
              });
              fetchHomework();
            }}
          >
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
              className="btn-success primaryBtn"
              onClick={handleFilterSearch}
            >
              Search
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Homeworklist;