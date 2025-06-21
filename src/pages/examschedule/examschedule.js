import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { IoMdAdd } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { Button, Form, OverlayTrigger, } from "react-bootstrap";
import { MdAddCircle } from "react-icons/md";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from "react-toastify";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { Tooltip } from "@mui/material";
import loading from "../../assets/images/common/loading.gif";
import { fetchDataRead } from "../../Utility";

const ExamSchedule = () => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const handleCloseFilterModal = () => setShowFilterModal(false);
  const handleShowFilterModal = () => setShowFilterModal(true);
  const [examschedule, setExamschedule] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [section, setSections] = useState([]);
  const [academic, setAcademic] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const userData = sessionStorage.getItem("user");
  const userObj = userData ? JSON.parse(userData) : {};
const readOnlyRoles = ["Class Teacher", "Teacher", "Class Incharge", "School Admin"];
    const canSubmit = !readOnlyRoles.includes(userObj.role_name?.trim());
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    fetchDataRead("/classes", setClasses, userObj.school_id);
    fetchDataRead("/exammaster", setExams, userObj.school_id);
    fetchDataRead("/AcademicYear", setAcademic, userObj.school_id);
    fetchDataRead("/Sections", setSections, userObj.school_id);
  }, []);
  const fetchSubjects = async (class_id) => {
    try {
      const response = await axios.post(`${baseUrl}/teacherssubjectsmap`, {
        action: "FILTER",
        school_id: userObj.school_id,
        class_id: class_id,
      });

      if (response.data && Array.isArray(response.data)) {
        setSubjects(response.data);
      } else {
        setSubjects([]);
        toast.warning("No subjects found for this class");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects. Please try again.");
    }
  };
  const fetchExamschedule = async () => {
    try {
      const response = await axios.post(baseUrl + "/examschedule/", {
        action: "READ",
        school_id: userObj.school_id,
      });
      setExamschedule(response.data || []);
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
  useEffect(() => {
    setIsLoading(true);
    fetchSubjects();
    fetchExamschedule().finally(() => setIsLoading(false));
  }, []);

  const formatDate1 = (datetime) => {
    if (!datetime) return "";
    const date = new Date(datetime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const globaldelete = async ({ academic_year_id, class_id, exam_id }) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete all exams?"
    );
    if (!confirmDelete) return;
    const filteredExams = examschedule.filter(
      (result) =>
        result.academic_year_id === academic_year_id &&
        result.class_id === class_id &&
        result.exam_id === exam_id
    );
    if (filteredExams.length === 0) return;
    try {
      const deleteExam = filteredExams.map((res) => ({
        exam_schedule_id: res.exam_schedule_id,
        action: "DELETE",
      }));
      const response = await axios.post(
        `${baseUrl}/examschedule/bulk/`,
        deleteExam,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("All Exams Deleted Successfully");
        fetchDataRead("/examschedule", setExamschedule, userObj.school_id);
      } else {
        toast.error("Unexpected response while deleting records.");
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete records.");
    }
  };

  const groupData = (data) => {
    const grouped = {};
    (data || []).forEach((item) => {
      const key = `${item.academic_year_name}-${item.exam_name}-${item.class_name}`;
      if (!grouped[key]) {
        grouped[key] = {
          academic_year_name: item.academic_year_name,
          academic_year_id: item.academic_year_id,
          exam_name: item.exam_name,
          exam_id: item.exam_id,
          class_name: item.class_name,
          class_id: item.class_id,
          start_date: item.start_date,
          end_date: item.end_date,
          subjects: [],
        };
      }
      grouped[key].subjects.push({
        subject_name: item.subject_name,
        exam_date: item.exam_date,
      });
    });

    return Object.values(grouped);
  };

  const globaledit = ({ academic_year_id, class_id, exam_id, section_id }) => {
    const filteredExams = examschedule.filter(
      (result) =>
        result.academic_year_id === academic_year_id &&
        result.class_id === class_id &&
        result.exam_id === exam_id &&
        result.section_id === section_id
    );

    if (filteredExams.length === 0) return;

    const flatPayload = {};

    filteredExams.forEach((res, index) => {
      flatPayload[`subject_${index}`] = {
        exam_schedule_id: res.exam_schedule_id,
        subject_id: res.subject_id,
        class_id: res.class_id,
        section_id: res.section_id,
        start_date: res.start_date,
        end_date: res.end_date,
        academic_year_id: res.academic_year_id,
        exam_id: res.exam_id,
      };
    });

    navigate("/addexamschedule", { state: { userData: flatPayload } });
  };

  const groupedRecords = groupData(examschedule);

 const baseColumns = [
  {
    name: "Exam Name ",
    selector: (row) => row.exam_name,
    cell: (row) => (
      <Tooltip title={row.exam_name}>
        <span>{row.exam_name}</span>
      </Tooltip>
    ),
    sortable: true,
  },
  {
    name: "Class  ",
    selector: (row) => row.class_name,
    cell: (row) => (
      <Tooltip title={row.class_name}>
        <span>{row.class_name}</span>
      </Tooltip>
    ),
    sortable: true,
  },
  {
    name: "Start Date",
    selector: (row) => formatDate1(row.start_date),
    cell: (row) =>
      row.exam_schedule_id !== "No Records Found" ? (
        <Tooltip title={formatDate1(row.start_date)}>
          <span>{formatDate1(row.start_date)}</span>
        </Tooltip>
      ) : (
        ""
      ),
    sortable: true,
  },
  {
    name: "End Date",
    selector: (row) => formatDate1(row.end_date),
    cell: (row) => (
      <Tooltip title={formatDate1(row.end_date)}>
        <span>{formatDate1(row.end_date)}</span>
      </Tooltip>
    ),
    sortable: true,
  },
];

// Conditionally add Actions column if canSubmit is true
const columns = canSubmit
  ? [
      ...baseColumns,
      {
        name: "Actions",
        cell: (row) =>
          row.exam_schedule_id !== "No records found" ? (
            <div className="tableActions">
              <Tooltip title="Edit" arrow>
                <span
                  className="commonActionIcons"
                  onClick={() =>
                    globaledit({
                      academic_year_id: row.academic_year_id,
                      class_id: row.class_id,
                      exam_id: row.exam_id,
                    })
                  }
                >
                  <MdEdit />
                </span>
              </Tooltip>
              <Tooltip title="Delete" arrow>
                <span
                  className="commonActionIcons"
                  onClick={() =>
                    globaldelete({
                      academic_year_id: row.academic_year_id,
                      class_id: row.class_id,
                      exam_id: row.exam_id,
                    })
                  }
                >
                  <MdDelete />
                </span>
              </Tooltip>
            </div>
          ) : null,
      },
    ]
  : baseColumns;


  const ExpandedComponent = ({ data }) => {
    const formatDate = (dateString) => {
      if (!dateString) return "Not Assigned";
      const date = new Date(dateString);
      if (isNaN(date)) return "Invalid Date";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    return (
      <div
        style={{
          padding: "12px",
          marginLeft: "100px",
          border: "1px solid rgb(204, 204, 204)",
          borderRadius: "8px",
          background:
            "linear-gradient(135deg, rgb(249, 249, 249) 0%, rgb(230, 230, 230) 100%)",
          boxShadow: "rgba(0, 0, 0, 0.1) 2px 4px 10px",
        }}
      >
        <table className="table">
          <thead>
            <tr className="border-blue">
              <th>Subject Name</th>
              <th>Exam Date</th>
            </tr>
          </thead>
          <tbody>
            {(data.subjects || []).map((subject, index) => (
              <tr key={index}>
                <td>{subject.subject_name}</td>
                <td>{formatDate(subject.exam_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const searchableColumns = [
    (row) => row.exam_name,
    (row) => row.class_name,
    (row) => row.subject_name,
    (row) => row.start_date,
    (row) => row.end_date,
  ];
  const filteredGroupedRecords = groupedRecords.filter((group) =>
    searchableColumns.some((selector) => {
      const values = [group.exam_name, group.class_name, group.academic_year_name, group.end_date, group.start_date];
      return values.some(value =>
        String(value || "").trim().toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
    })
  );
  const [filter, setFilter] = useState({
    exam_id: "",
    class_id: "",
    subject_id: "",
    exam_date: "",
    academic_year_id: "",
    action: "FILTER",
  });
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      exam_id: filter.exam_id || 0,
      class_id: filter.class_id || 0,
      subject_id: filter.subject_id || 0,
      academic_year_id: filter.academic_year_id || 0,
      exam_date: filter.exam_date || "",
      school_id: userObj.school_id,
      action: "FILTER",
    };

    try {
      const response = await axios.post(baseUrl + "/examschedule/", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const filterData = response.data || [];
      setExamschedule(filterData);
      setShowFilterModal(false);
    } catch (error) {
      console.log("Full error object:", error);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setFilter({
      exam_id: "",
      class_id: "",
      action: "FILTER",
    });
    setShowFilterModal(false);
    fetchExamschedule();
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: value,
    }));
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
              <div
                className="d-flex align-items-center"
                style={{ gap: "10px" }}
              >
                <h6 className="commonTableTitle">Exam Schedule</h6>
              </div>
              <div
                className="d-flex align-items-center"
                style={{ gap: "10px" }}
              >
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  className="searchInput"
                  onChange={handleSearchChange}
                />
                <div
                  className="dropdownContainer d-flex"
                  style={{ gap: "10px" }}
                >
                  <Form.Select
                    name="exam_id"
                    value={filter.exam_id}
                    onChange={handleFilterChange}
                    style={{ width: "200px" }}
                  >
                    <option value="">Select Exam</option>
                    {(exams || [])
                      .filter((exam) => exam.is_active === "Active")
                      .map((exam) => (
                        <option key={exam.exam_id} value={exam.exam_id}>
                          {exam.exam_name}
                        </option>
                      ))}
                  </Form.Select>
                  <Form.Select
                    name="class_id"
                    value={filter.class_id}
                    onChange={handleFilterChange}
                    style={{ width: "200px" }}
                  >
                    <option value={0}>Select Class</option>
                    {(classes || [])
                      .filter((cls) => cls.is_active === "Active")
                      .map((cls) => (
                        <option key={cls.class_id} value={cls.class_id}>
                          {cls.class_name}
                        </option>
                      ))}
                  </Form.Select>
                </div>
                <Button
                  variant="primary"
                  type="submit"
                  className="btn-success primaryBtn"
                  form="filterForm"
                  onClick={handleSubmit}
                >
                  Search
                </Button>
                <Button
                  variant="secondary"
                  className="btn-danger secondaryBtn me-2"
                  onClick={handleReset}
                >
                  Clear
                </Button>
              </div>
              <div className="d-flex align-items-center" style={{ gap: 6 }}>
                 {canSubmit && (
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="tooltip-top">Add</Tooltip>}
                >
                  <Button
                    className="primaryBtn"
                    variant="primary"
                     disabled={!canSubmit}
                    onClick={() => navigate("/addexamschedule")}
                  >
                    <MdAddCircle />
                  </Button>
                </OverlayTrigger>)}
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
                    filteredGroupedRecords.length > 0
                      ? filteredGroupedRecords
                      : [{ exam_schedule_id: "No records found", start_date: "No Records Found", subjects: [] }]
                  }
                  pagination
                  expandableRows={filteredGroupedRecords.length > 0}
                  expandableRowsComponent={ExpandedComponent}
                  highlightOnHover
                  responsive
                  fixedHeader
                  fixedHeaderScrollHeight="calc(100vh - 170px)"
                  conditionalRowStyles={[
                    {
                      when: (row) => row.exam_schedule_id === "No records found",
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
    </div>
  );
};

export default ExamSchedule;
