import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { IoMdAdd } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  Modal,
  Row,
  Col,
  Form,
  OverlayTrigger,
} from "react-bootstrap";
import { MdFilterList, MdAddCircle } from "react-icons/md";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from "react-toastify";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { Tooltip } from "@mui/material";
import loading from "../../assets/images/common/loading.gif";

const Grades = () => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const handleCloseFilterModal = () => setShowFilterModal(false);
  const handleShowFilterModal = () => setShowFilterModal(true);
  const [grades, setGrades] = useState([]);
  const [boards, setBoards] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const userData = sessionStorage.getItem("user");
  const userObj = userData ? JSON.parse(userData) : {};

  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  const fetchGrades = async () => {
    try {
      const response = await axios.post(baseUrl + "/grades/", {
        action: "READ",
        school_id: userObj.school_id,
        board_id: userObj.board_id,
      });
      setGrades(response.data);
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
  const fetchBoards = async () => {
    try {
      const response = await axios.post(baseUrl + "/board/", {
        action: "READ",
      });
      setBoards(response.data);
    } catch (error) {
      console.error("Error fetching Board Data:", error);
    }
  };
  const fetchSubjects = async (class_id, section_id) => {
    try {
      const response = await axios.post(baseUrl + "/subjectmaster/", {
        action: "READ",
        school_id: userObj?.school_id || 0,
      });
      setSubjects(response?.data || []);
    } catch (error) {
      console.error("Error fetching Subjects!", error);
    }
  };

  useEffect(() => {
    fetchGrades();
    fetchBoards();
    fetchSubjects();
  }, []);
   const handleEditClick = (grade_id) => {
          const gradesToEdit = grades.find(grades => grades.grade_id === grade_id);
  
          if (gradesToEdit) {
              navigate("/addgrades", { state: { userData: gradesToEdit } });
          } else {
              console.error(`User with ID ${grade_id} not found.`);
          }
      };
  
      useEffect(() => {
          fetchGrades();
      }, []);

      const handleDeleteClick = async (grade_id) => {
        const confirmDelete = window.confirm('Are you sure you want to update the status?');

        if (!confirmDelete) {
            return;
        }
        const requestBody = {
          grade_id: grade_id,
            action: "DELETE"
        };
        try {
            const response = await axios.post(baseUrl + "/grades/", requestBody, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            toast.success("Record Set to Inactive");
            fetchGrades();
        } catch (error) {
            console.error('Error:', error);
        }
    };

  useEffect(() => {
    setIsLoading(true);
    fetchGrades("/grades/", setGrades).finally(() => setIsLoading(false));
  }, []);

  const formatDate1 = (datetime) => {
    const date = new Date(datetime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const columns = [
    {
      name: "Grade Name ",
      selector: (row) => row.grade_name,
      cell: (row) => (
        <Tooltip title={row.grade_name}>
          <span>{row.grade_name}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Minimum Marks ",
      selector: (row) => row.min_marks,
      cell: (row) => (
        <Tooltip title={row.min_marks}>
          <span>{row.min_marks}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Maximum Marks ",
      selector: (row) => row.max_marks,
      cell: (row) => (
        <Tooltip title={row.max_marks}>
          <span>{row.max_marks}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Gpa ",
      selector: (row) => row.grade_points,
      cell: (row) => (
        <Tooltip title={row.grade_points}>
          <span>{row.grade_points}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Subject ",
      selector: (row) => row.subject_name,
      cell: (row) => (
        <Tooltip title={row.subject_name}>
          <span>{row.subject_name}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Curriculum ",
      selector: (row) => row.board_name,
      cell: (row) => (
        <Tooltip title={row.board_name}>
          <span>{row.board_name}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Is Active",
      selector: (row) => row.is_active,
      cell: (row) => (
        <Tooltip title={row.is_active}>
          <span>{row.is_active}</span>
        </Tooltip>
      ),
      sortable: true,
    },
     {
                name: "Actions",
                cell: (row) => row.grade_id !== "No records found" ? (
                    <div className='tableActions'>
                        <Tooltip title="Edit" arrow>
                            <a className='commonActionIcons' onClick={() => handleEditClick(row.grade_id)}>
                                <span><MdEdit /></span>
                            </a>
                        </Tooltip>
    
                        <Tooltip title="Delete" arrow>
                            <a className='commonActionIcons' onClick={() => handleDeleteClick(row.grade_id)}>
                                <span><MdDelete /></span>
                            </a>
                        </Tooltip>
                    </div>
                ) : null
            },
        ];
  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#EAE4E4",
        color: "#757575",
        fontSize: "16px",
        textAlign: "center",
      },
      className: "commonTH",
    },
    cells: {
      style: {
        fontSize: "16px",
      },
      className: "commonTD",
    },
  };

  const searchableColumns = [
    (row) => row.grade_name,
    (row) => row.min_marks,
    (row) => row.max_marks,
    (row) => row.grade_points,
    (row) => row.subject_name,
    (row) => row.board_name,
    (row) => row.is_active,
  ];

  const filteredRecords = (grades || []).filter((grades) =>
    searchableColumns.some((selector) => {
      const value = selector(grades);
      return String(value || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    })
  );
  const [form, setForm] = useState({
    grade_name: "",
    min_marks: "",
    max_marks: "",
    grade_points: "",
    subject_name: "",
    board_name: "",
    is_active: "",
    action: "FILTER",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      grade_name: form.grade_name || "",
      min_marks: form.min_marks || 0,
      max_marks: form.max_marks || 0,
      grade_points: form.grade_points || 0,
      subject_name: form.subject_name || 0,
      board_name: form.board_name || 0,
      board_id: form.board_id || 0,
      school_id: userObj.school_id,
      action: "FILTER",
    };

    try {
      const response = await axios.post(baseUrl + "/grades/", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const filterData = response.data || [];
      setGrades(filterData);

      setShowFilterModal(false);
    } catch (error) {
      console.log("Full error object:", error);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setForm({
      grade_name: "",
      min_marks: "",
      max_marks: "",
      grade_points: "",
      subject_name: "",
      board_id: "",
      board_name: "",
    });
    setShowFilterModal(true);

    fetchGrades();
  };
  const handleSearchChange = (event) => {
    setForm({});
    fetchGrades();
    setSearchQuery(event.target.value);
  };
  const handleFilterClear = async () => {
    setForm({
      grade_name: "",
      min_marks: "",
      max_marks: "",
      grade_points: "",
      subject_name: "",
      board_name: "",
      action: "FILTER",
    });
    fetchGrades();
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
              {/* Title */}
              <div
                className="d-flex align-items-center"
                style={{ gap: "10px" }}
              >
                <h6 className="commonTableTitle">Grades</h6>
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
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}
                >
                  <Button
                    className="secondaryBtn"
                    variant="secondary"
                    onClick={handleShowFilterModal}
                  >
                    <MdFilterList />
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
                            grade_id: "No records found",
                            grade_points: "No records found",
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
                      when: (row) => row.grade_id === "No records found",
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

      {/* Filter Modal Starts Here */}
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
                <Form.Group controlId="firstName">
                  <Form.Label>Grade Name</Form.Label>
                  <Form.Control
                    type="text"
                    id="grade_name"
                    value={form.grade_name}
                    placeholder="Enter Grade Name"
                    maxLength={30}
                    onChange={handleInputChange}
                    style={{ textTransform: "uppercase" }}
                  />
                </Form.Group>
              </div>
            </Col>
            <Col xs={12}>
              <div className="commonInput">
                <Form.Group controlId="firstName">
                  <Form.Label>Minimum Marks</Form.Label>
                  <Form.Control
                    type="text"
                    id="min_marks"
                    value={form.min_marks}
                    placeholder="Enter Minimum Marks "
                    maxLength={3}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </div>
            </Col>
            <Col xs={12}>
              <div className="commonInput">
                <Form.Group controlId="firstName">
                  <Form.Label>Maximum Marks</Form.Label>
                  <Form.Control
                    type="text"
                    id="max_marks"
                    value={form.max_marks}
                    placeholder="Enter Maximum Marks"
                    maxLength={3}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </div>
            </Col>
            <Col xs={12}>
              <div className="commonInput">
                <Form.Group controlId="firstName">
                  <Form.Label>Grade Points</Form.Label>
                  <Form.Control
                    type="text"
                    id="grade_points"
                    value={form.grade_points}
                    placeholder="Enter Grade Points"
                    maxLength={3}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </div>
            </Col>
            <Col xs={12}>
              <div className="commonInput">
                <Form.Group controlId="firstName">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    id="subject_name"
                    value={form.subject_name}
                    placeholder="Enter Subject Name"
                    maxLength={30}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </div>
            </Col>
            <Col xs={12}>
              <div className="commonInput">
                <Form.Label>Curriculum</Form.Label>
                <Form.Select
                  className="form-select"
                  id="board_id"
                  value={form.board_id}
                  onChange={handleInputChange}
                >
                  <option value="">Select Board</option>
                  {boards.map((board) => (
                    <option key={board.board_id} value={board.board_id}>
                      {board.board_name}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="modalFooterFixed">
          <Button
            variant="secondary"
            className="btn-info clearBtn me-2"
            onClick={handleReset}
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
              type="submit"
              className="btn-success primaryBtn"
              form="filterForm"
              onClick={handleSubmit}
            >
              Search
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default Grades;
