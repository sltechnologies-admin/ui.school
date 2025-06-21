import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Row,
  Col,
  Modal,
  Form,
  Button,
  OverlayTrigger,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { useLocation, useNavigate } from "react-router-dom";
import { MdEdit, MdDelete, MdAddCircle, MdVisibility } from "react-icons/md";
import { MdCheckCircle } from "react-icons/md";
import { Tooltip } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { MdFilterList } from "react-icons/md";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import loading from "../../assets/images/common/loading.gif";
import { useRef } from "react";
const HomeworkDetailsModal = ({ show, onHide, homeworkDetails }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Homework Details</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
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
  const userData = sessionStorage.getItem("user");
  const userObj = userData ? JSON.parse(userData) : {};
  const [showFilterModal, setShowFilterModal] = useState(false);
  const handleCloseFilterModal = () => setShowFilterModal(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState([]);
  const [homework, setHomework] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedHomework, setSelectedHomework] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [homeworkStudents, setHomeworkStudents] = useState([]);
  const [originalHomeworkStudents, setOriginalHomeworkStudents] = useState([]);
  const [headerCompletedToggle, setHeaderCompletedToggle] = useState(null); // null = gray ✔
  const popupRef = useRef(null);
  const location = useLocation();
  const [reviewPopup, setReviewPopup] = useState({
    visible: false,
    data: null,
  });
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        reviewPopup.visible &&
        popupRef.current &&
        !popupRef.current.contains(event.target)
      ) {
        setReviewPopup({ visible: false, data: null });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [reviewPopup]);
  const navigate = useNavigate();
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const handleShowFilterModal = () => {
    if (classes.length === 0) {
      fetchDropdownData("/classes/", setClasses);
    }
    setShowFilterModal(true);
  };

  const fetchDropdownData = async (endpoint, setter) => {
    try {
      const response = await axios.post(baseUrl + endpoint, {
        action: "READ",
        school_id: userObj.school_id,
      });
      setter(response.data);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  };

  const fetchSections = async (class_id) => {
    try {
      const response = await axios.post(
        baseUrl + "/getsectionsbyteachersubjectmap/",
        {
          action: "SECTIONREAD",
          school_id: userObj.school_id,
          class_id: class_id,
        }
      );
      setSections(response.data);
    } catch (error) {
      console.error("Error fetching section:", error);
    }
  };

  const fetchHomework = async () => {
    try {
      const response = await axios.post(baseUrl + "/homework/", {
        action: "READ",
        school_id: userObj.school_id,
      });
      setHomework(response.data);
    } catch (error) {
      console.error("Error fetching homework data:", error);
    }
  };

  const fetchSubject = async (class_id, section_id) => {
    try {
      const response = await axios.post(baseUrl + "/teacherssubjectsmap/", {
        action: "SFILTER",
        school_id: userObj?.school_id || 0,
        class_id: class_id,
        section_id: section_id,
        academic_year_id: userObj.academic_year_id,
      });
      setSubjects(response?.data || []);
    } catch (error) {
      console.error("Error fetching Subjects!", error);
    }
  };

  useEffect(() => {
    fetchDropdownData("/classes/", setClasses);
    setIsLoading(false);
  }, []);

  const formatDate1 = (datetime) => {
    if (!datetime) return "";
    const date = new Date(datetime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const handleEditClick = (homework_id) => {
    const studentToEdit = homework.find(
      (homework) => homework.homework_id === homework_id
    );
    if (studentToEdit) {
      navigate("/addhomework", {
        state: {
          userData: studentToEdit,
          filterData: topFilter,
          is_read_only: studentToEdit.is_active === "Reviewed",
        },
      });
    } else {
      console.error(`Homework with ID ${homework_id} not found.`);
    }
  };
  const handleHomeworkClick = (homeworkDetails) => {
    setSelectedHomework(homeworkDetails);
    setShowModal(true);
  };

  const columns = [
    {
      name: "Date",
      selector: (row) => formatDate1(row.homework_date),
      cell: (row) => (
        <Tooltip title={formatDate1(row.homework_date)}>
          <span>{formatDate1(row.homework_date)}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Class",
      selector: (row) => row.class_name,
      cell: (row) => (
        <Tooltip title={row.class_name}>
          <span>{row.class_name}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Section",
      selector: (row) => row.section_name,
      cell: (row) => (
        <Tooltip title={row.section_name}>
          <span>{row.section_name}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Subject",
      selector: (row) => row.subject_name,
      cell: (row) => (
        <Tooltip title={row.subject_name}>
          <span>{row.subject_name}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      name: "Homework Details",
      selector: (row) => row.homework_details,
      sortable: true,
      cell: (row) => (
        <div
          className="homework-details-cell"
          onClick={() => handleHomeworkClick(row.homework_details)}
          style={{
            cursor: "pointer",
          }}
        >
          {(row.homework_details || []).length > 50
            ? `${row.homework_details.substring(0, 50)}...`
            : row.homework_details}
        </div>
      ),
    },
    // {
    //   name: "Attachments",
    //   selector: (row) => row.attachments,
    //   sortable: true,
    //   cell: (row) => (
    //     <div className="homework-details-cell">
    //       <Tooltip title={row.attachments}>
    //         <span>{row.attachments}</span>
    //       </Tooltip>
    //     </div>
    //   ),
    // },
    {
      name: "Status",
      selector: (row) => row.is_active,
      cell: (row) => (
        <Tooltip title={row.is_active}>
          <span>{row.is_active}</span>
        </Tooltip>
      ),
      sortable: true,
    },
    {
  name: "Submission Date",
  selector: (row) => formatDate1(row.submit_date),
  cell: (row) => (
    <Tooltip title={formatDate1(row.submit_date)}>
      <span>{formatDate1(row.submit_date)}</span>
    </Tooltip>
  ),
  sortable: true,
},

    {
      name: "Actions",
      cell: (row) =>
        (filteredRecords || []).length > 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Tooltip title="Edit" arrow>
              <a
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#eef4ff",
                  color: "#3366ff",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                <span onClick={() => handleEditClick(row.homework_id)}>
                  <MdEdit />
                </span>
              </a>
            </Tooltip>
            <Tooltip title="Review" arrow>
              <span
                onClick={() => handleReviewClick(row)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#eef4ff",
                  color: "#3366ff",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                <MdCheckCircle />
              </span>
            </Tooltip>
            {row.is_active !== "Reviewed" ? (
              <Tooltip title="Delete" arrow>
                <a
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#eef4ff",
                    color: "#3366ff",
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    fontSize: "18px",
                    cursor: "pointer",
                  }}
                >
                  <span onClick={() => handleDeleteClick(row.homework_id)}>
                    <MdDelete />
                  </span>
                </a>
              </Tooltip>
            ) : (
              <Tooltip title="Option Disabled" arrow>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f0f0f0",
                    color: "#ccc",
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    fontSize: "18px",
                    cursor: "not-allowed",
                  }}
                >
                  <MdDelete />
                </div>
              </Tooltip>
            )}
          </div>
        ) : null,
      width: "120px",
    },
  ];

  const handleDeleteClick = async (homework_id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want change the status?"
    );

    if (!confirmDelete) {
      return;
    }
    const requestBody = {
      homework_id: homework_id,
      action: "DELETE",
    };
    try {
      const response = await axios.post(baseUrl + "/homework/", requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      toast.success("Record Set to InActive");
      setHomework((prev) => {
        const updated = prev.filter((h) => h.homework_id !== homework_id);
        if (updated.length === 0) {
          setTopFilter({
            class_id: 0,
            section_id: 0,
            subject_id: 0,
            homework_date: "",
          });
          return [];
        }

        return updated;
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const searchableColumns = [
    (row) => row.homework_details,
    (row) => formatDate1(row.homework_date),
    (row) => row.section_name,
    (row) => row.subject_name,
    (row) => row.class_name,
    (row) => row.is_active,
  ];

  const filteredRecords = (homework || []).filter((item) =>
    searchableColumns.some((selector) => {
      const value = selector(item);
      const stringValue = String(value || "")
        .toLowerCase()
        .replace(/[-\s]+/g, "");
      const normalizedQuery = searchQuery.toLowerCase().replace(/[-\s]+/g, "");
      return stringValue.includes(normalizedQuery);
    })
  );

  const [filter, setFilter] = useState({
    homework_details: "",
    homework_date: "",
    section_id: 0,
    subject_id: 0,
    class_id: 0,
    action: "FILTER",
  });
 const [topFilter, setTopFilter] = useState({
  class_id: 0,
  section_id: 0,
  subject_id: 0,
  homework_date: "",
});

// Detect browser refresh
useEffect(() => {
  const onBeforeUnload = () => {
    sessionStorage.setItem("isReloaded", "true");
  };
  window.addEventListener("beforeunload", onBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", onBeforeUnload);
  };
}, []);

// Apply filters only if not reloaded
useEffect(() => {
  const isReload = sessionStorage.getItem("isReloaded");

  if (isReload === "true" && performance.navigation.type === 1) {
    // Browser reload — clear filter
    sessionStorage.removeItem("isReloaded");
    navigate(location.pathname, { replace: true }); // Clear any lingering state
    return; // Skip applying filterData
  }

  const filters = location?.state?.filterData;
  if (filters && typeof filters === "object") {
    setIsLoading(true);
    setTopFilter(filters);
    fetchDropdownData("/classes/", setClasses);
    if (filters.class_id) {
      fetchSections(filters.class_id);
      fetchSubject(filters.class_id, filters.section_id);
    }

    const payload = {
      homework_id: 0,
      homework_details: "",
      section_id: filters.section_id,
      subject_id: filters.subject_id,
      class_id: filters.class_id,
      createdby: userObj?.user_name || "system",
      lastmodifiedby: userObj?.user_name || "system",
      academic_year_id: userObj?.academic_year_id || 0,
      school_id: userObj?.school_id || 0,
      attachment: "",
      is_active: "Active",
      ...(filters.homework_date && { homework_date: filters.homework_date }),
      action: "FILTER",
    };

    (async () => {
      try {
        const response = await axios.post(`${baseUrl}/homework/`, payload, {
          headers: { "Content-Type": "application/json" },
        });
        const data = response.data || [];
        setHomework(data);
        if (!Array.isArray(data) || data.length === 0) {
          toast.warning("No homework records found for the selected filters.");
        }
      } catch (err) {
        toast.error("Failed to load filtered homework data.");
        console.error("Filter fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  } else {
    setIsLoading(false);
  }
}, [location]);

  useEffect(() => {
    if (filter.class_id !== 0) {
      fetchSections(filter.class_id);
    }
  }, [filter.class_id]);

  useEffect(() => {
    if (Number(filter.class_id) > 0) {
      fetchSubject(filter.class_id, filter.section_id);
    } else {
      setSections([]);
    }
    // }, [filter.class_id, filter.section_id]);
  }, [filter.class_id]);

  const handleFilterSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      homework_id: 0,
      section_id: filter.section_id,
      subject_id: filter.subject_id,
      class_id: filter.class_id,

      createdby: userObj?.user_name || "system",
      lastmodifiedby: userObj?.user_name || "system",
      academic_year_id: userObj?.academic_year_id || 0,
      school_id: userObj?.school_id || 0,
      is_active: "Active",
      homework_date: filter.homework_date || "",
      action: "FILTER",
    };
    try {
      console.log(payload);
      const response = await axios.post(baseUrl + "/homework/", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setHomework(response.data || []);
      handleCloseFilterModal();
      if (
        filter.homework_date == 0 &&
        filter.class_id == 0 &&
        filter.section_id == 0 &&
        filter.subject_id == 0
      ) {
        setHomework([]);
        toast.info(" Please select the filters filters.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleFilterClear = async () => {
    setFilter({
      homework_details: "",
      homework_date: "",
      section_id: 0,
      subject_id: 0,
      class_id: 0,
      action: "FILTER",
    });
    // fetchHomework();
  };
  const handleTopFilterClear = () => {
    setTopFilter({
      class_id: 0,
      section_id: 0,
      subject_id: 0,
      homework_date: "",
    });
    setHomework([]);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
const handleTopFilterSubmit = async (e) => {
  e.preventDefault();

  setIsLoading(true); // Start showing the loading GIF

  const payload = {
    homework_id: 0,
    homework_details: "",
    section_id: topFilter.section_id,
    subject_id: topFilter.subject_id,
    class_id: topFilter.class_id,
    createdby: userObj?.user_name || "system",
    lastmodifiedby: userObj?.user_name || "system",
    academic_year_id: userObj?.academic_year_id || 0,
    school_id: userObj?.school_id || 0,
    attachment: "",
    is_active: "Active",
    action: "FILTER",
    ...(topFilter.homework_date && {
      homework_date: topFilter.homework_date,
    }),
  };

  try {
    const response = await axios.post(baseUrl + "/homework/", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = response.data || [];
    setHomework(data);

    if (!Array.isArray(data) || data.length === 0) {
      toast.warning("No homework records found for the selected filters.");
    }
  } catch (error) {
    console.error("Top filter fetch failed:", error);

    if (
      error.response?.status === 404 &&
      topFilter.class_id &&
      topFilter.section_id &&
      topFilter.homework_date
    ) {
      toast.warning("No homework records found for the selected filters.");
    } else {
      toast.error("An error occurred while filtering data.");
    }
  } finally {
    setIsLoading(false); // End loading state
  }
};

  const getStudentsForHomework = async (row) => {
    const { class_id, section_id, homework_id } = row;

    if (!class_id || !section_id || !homework_id) {
      toast.error(" Missing class, section, or homework ID.");
      return;
    }
    setHeaderCompletedToggle(null); // reset to gray ✔ every time popup opens
    try {
      const studentsRes = await axios.post(`${baseUrl}/students/`, {
        action: "FILTER",
        class_id,
        section_id,
        school_id: userObj.school_id,
        academic_year_id: userObj.academic_year_id,
      });

      const students = studentsRes.data || [];

      if (students.length === 0) {
        toast.warning(" No students found for the selected class and section.");
        setHomeworkStudents([]);
        setOriginalHomeworkStudents([]);
        return;
      }

      const homeworkStatusRes = await axios.post(
        `${baseUrl}/studenthomeworkdetails/`,
        {
          action: "FILTER",
          class_id,
          section_id,
          homework_id,
          academic_year_id: userObj.academic_year_id,
          school_id: userObj.school_id,
        }
      );

      const homeworkStatus = homeworkStatusRes.data || [];
      console.log(homeworkStatus);

      const statusMap = homeworkStatus
        .filter((rec) => rec.homework_id === homework_id) // ✨ FILTER ONLY CURRENT HOMEWORK
        .reduce((map, rec) => {
          map[parseInt(rec.student_id)] = rec;
          return map;
        }, {});
      const merged = students.map((stu) => {
        const status = statusMap[String(stu.student_id)];
        const isCompletedRaw = (status?.is_completed || "").toUpperCase();

        return {
          ...stu,
          student_homework_id: status?.student_homework_id || 0,
          completed:
            isCompletedRaw === "Y" || isCompletedRaw === "YES"
              ? true
              : isCompletedRaw === "N" || isCompletedRaw === "NO"
              ? false
              : null,
          remarks: status?.remarks || "",
        };
      });

      setHomeworkStudents(merged);
      setOriginalHomeworkStudents(JSON.parse(JSON.stringify(merged)));
      setReviewPopup({ visible: true, data: row });
    } catch (err) {
      console.error("Fetching student + status failed:", err);
      toast.error(" Failed to load student homework data.");
    }
  };
  const handleSubmitHomeworkStatus = async () => {
    if (!reviewPopup.data || !reviewPopup.data.homework_id) {
      toast.error("Homework ID missing.");
      return;
    }

    const homework_id = reviewPopup.data.homework_id;
    const class_id = reviewPopup.data.class_id;
    const section_id = reviewPopup.data.section_id;
    const academic_year_id = userObj.academic_year_id;
    const school_id = userObj.school_id;

    // Identify updated students only
    const updatedStudents = homeworkStudents.filter((stu) => {
      const original = originalHomeworkStudents.find(
        (o) => o.student_id === stu.student_id
      );
      return (
        original &&
        (stu.completed !== original.completed ||
          (stu.remarks || "") !== (original.remarks || ""))
      );
    });

    if (updatedStudents.length === 0) {
      const hasAnyStatusSet = homeworkStudents.some(
        (stu) => stu.completed !== null
      );
      if (!hasAnyStatusSet) {
        toast.info(
          "Status is missing. Please mark at least one student as completed or not completed."
        );
      } else {
        toast.warning("All records already exist with the same data.");
      }

      return;
    }

    const createPayload = {
      homework_id,
      student_id: [],
      is_completed: [],
      remarks: [],
    };
    const updates = [];

    for (const stu of updatedStudents) {
      if (stu.student_homework_id) {
        updates.push({
          action: "UPDATE",
          student_homework_id: stu.student_homework_id,
          homework_id,
          student_id: stu.student_id,
          class_id,
          section_id,
          academic_year_id,
          school_id,
          is_completed: stu.completed ? "Y" : "N",
          remarks: stu.remarks.trim() || "",
        });
      } else {
        createPayload.student_id.push(stu.student_id);
        createPayload.is_completed.push(stu.completed ? "Y" : "N");
        createPayload.remarks.push(stu.remarks || "");
      }
    }
    try {
      if (createPayload.student_id.length > 0) {
        await axios.post(
          `${baseUrl}/studenthomeworkdetails/bulk`,
          createPayload,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      for (const payload of updates) {
        await axios.post(`${baseUrl}/studenthomeworkdetails/`, payload, {
          headers: { "Content-Type": "application/json" },
        });
      }

      toast.success("Homework status submitted successfully.");
      setHomework((prevHomework) =>
        prevHomework.map((hw) =>
          hw.homework_id === reviewPopup.data.homework_id
            ? { ...hw, is_active: "Reviewed" }
            : hw
        )
      );
      setReviewPopup({ show: false, data: null });
    } catch (err) {
      console.error("Unexpected error during submission:", err);
      toast.error("All records already exist with the same data.");
      setReviewPopup({ show: false, data: null });
    }
  };

  const handleReviewClick = (row) => {
    setHomeworkStudents([]);

    setOriginalHomeworkStudents([]);

    setReviewPopup({ visible: false, data: row });
    getStudentsForHomework(row); // re-fetch fresh data
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
                <h6 className="commonTableTitle">Homework</h6>
              </div>
              {/**/}
              {/**/}
              <div className="">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  className="searchInput mx-3"
                  onChange={handleSearchChange}
                />
              </div>
              <div className="d-flex align-items-center" style={{ gap: 6 }}>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}
                >
                  <Button
                    className="secondaryBtn"
                    variant="Secondary"
                    onClick={() => {
                      handleShowFilterModal();
                    }}
                  >
                    <span>
                      <MdFilterList />
                    </span>
                  </Button>
                </OverlayTrigger>

                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="tooltip-top">Add</Tooltip>}
                >
                  <span>
                    <Button
                      className="primaryBtn"
                      variant="primary"
                      onClick={() =>
                        navigate("/addhomework", {
                          state: { filterData: topFilter },
                        })
                      }
                    >
                      <MdAddCircle />
                    </Button>
                  </span>
                </OverlayTrigger>
              </div>
            </div>
          </div>
          <form
            className="d-flex align-items-center"
            style={{ gap: "20px", marginBottom: "20px" }}
            onSubmit={handleTopFilterSubmit}
          >
            {/* Date */}
            <label htmlFor="homework_date" className="form-label mb-0 fs-7">
              Date:
            </label>
            <input
              type="date"
              className="form-control"
              value={topFilter.homework_date}
              onChange={(e) =>
                setTopFilter((prev) => ({
                  ...prev,
                  homework_date: e.target.value,
                }))
              }
              placeholder="dd-mm-yyyy"
              style={{ width: "170px" }}
            />

            {/* Class */}
            <label htmlFor="class_id" className="form-label mb-0 fs-7">
              Class:<span className="requiredStar">*</span>
            </label>
            <select
              className="form-select"
              value={topFilter.class_id}
              onChange={(e) => {
                const classId = parseInt(e.target.value);
                setTopFilter((prev) => ({
                  ...prev,
                  class_id: classId,
                  section_id: 0,
                  subject_id: 0,
                }));
                if (classId !== 0) {
                  fetchSections(classId);
                  fetchSubject(classId, 0);
                }
              }}
              required
              style={{ width: "180px" }}
            >
              <option value="">Select Class</option>
              {(classes || [])
                .filter((cls) => cls.is_active === "Active")
                .map((cls) => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.class_name}
                  </option>
                ))}
            </select>

            {/* Section */}
            <label htmlFor="section_id" className="form-label mb-0 fs-7">
              Section:<span className="requiredStar">*</span>
            </label>
            <select
              className="form-select"
              value={topFilter.section_id}
              onChange={(e) =>
                setTopFilter((prev) => ({
                  ...prev,
                  section_id: parseInt(e.target.value),
                }))
              }
              disabled={!topFilter.class_id}
              required
              style={{ width: "180px" }}
            >
              <option value="">Select Section</option>
              {(sections || []).map((sec) => (
                <option key={sec.section_id} value={sec.section_id}>
                  {sec.section_name}
                </option>
              ))}
            </select>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              className="btn-success primaryBtn"
            >
              Submit
            </Button>

            {/* Clear */}
            <button
              type="button"
              className="btn btn-danger secondaryBtn"
              onClick={handleTopFilterClear}
            >
              Clear
            </button>
          </form>

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
                    data={filteredRecords.length > 0 ? filteredRecords : []}
                    pagination
                    highlightOnHover
                    responsive
                    fixedHeader
                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                    persistTableHead
                    noDataComponent={
                      <div
                        style={{
                          padding: "20px",
                          fontSize: "16px",
                          color: "#666",
                          textAlign: "center",
                        }}
                      >
                        <span style={{ fontSize: "18px", marginRight: "8px" }}>
                          <i className="bi bi-info-circle me-2"></i>
                        </span>
                        Please submit the filters to view data.
                      </div>
                    }
                  />

                  {reviewPopup.visible && reviewPopup.data && (
                    <div
                      ref={popupRef}
                      className="floatingReviewPopup border shadow p-3"
                      style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1000,
                        width: "fit-content",
                        maxWidth: "90vw",
                        maxHeight: "90vh",
                        background: "#fff",
                        borderRadius: "8px",
                        overflowY: "auto",
                        padding: "20px",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Review Homework</strong>
                        <button
                          type="button"
                          className="btn-close"
                          aria-label="Close"
                          onClick={() =>
                            setReviewPopup({ visible: false, data: null })
                          }
                        />
                      </div>

                      <hr />
                      <div
                        className="d-flex overflow-auto"
                        style={{
                          whiteSpace: "nowrap",
                          fontSize: "1rem",
                          gap: "20px",
                          paddingBottom: "10px",
                          borderBottom: "1px solid #ddd",
                          marginBottom: "20px",
                        }}
                      >
                        <div>
                          <strong>Date:</strong>{" "}
                          {formatDate1(reviewPopup.data.homework_date)}
                        </div>
                        <div>
                          <strong>Class:</strong> {reviewPopup.data.class_name}
                        </div>
                        <div>
                          <strong>Section:</strong>{" "}
                          {reviewPopup.data.section_name}
                        </div>
                        <div>
                          <strong>Subject:</strong>{" "}
                          {reviewPopup.data.subject_name}
                        </div>
                        <div>
                          <strong>Status:</strong> {reviewPopup.data.is_active}
                        </div>
                        <div>
                          <Button
                            variant="success"
                            onClick={handleSubmitHomeworkStatus}
                          >
                            Submit
                          </Button>
                        </div>
                      </div>

                      {homeworkStudents.length > 0 && (
                        <div
                          style={{
                            maxHeight: "430px",
                            overflowY: "scroll",
                            marginTop: "20px",
                            border: "1px solid #dee2e6",
                          }}
                        >
                          <Table
                            className="table table-bordered"
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead
                              className="table-light"
                              style={{
                                backgroundColor: "#0461fe", // blue background
                                color: "#fff", // white text
                                fontWeight: "bold",
                                fontSize: "14px",
                              }}
                            >
                              <tr>
                                <th
                                  style={{
                                    position: "sticky",
                                    top: 0,
                                    background: "#f8f9fa",
                                    zIndex: 2,
                                  }}
                                >
                                  #
                                </th>
                                <th
                                  style={{
                                    position: "sticky",
                                    top: 0,
                                    background: "#f8f9fa",
                                    zIndex: 2,
                                  }}
                                >
                                  Student Name
                                </th>
                                <th
                                  className="text-center"
                                  style={{
                                    position: "sticky",
                                    top: 0,
                                    background: "#f8f9fa",
                                    zIndex: 2,
                                  }}
                                >
                                  Completed
                                  <span
                                    className="ms-2"
                                    style={{
                                      cursor: "pointer",
                                      fontSize: "18px",
                                      color:
                                        headerCompletedToggle === null
                                          ? "#999" // gray ✔
                                          : headerCompletedToggle
                                          ? "green"
                                          : "red",
                                    }}
                                    onClick={() => {
                                      // If gray tick, change to green ✔
                                      if (headerCompletedToggle === null) {
                                        setHeaderCompletedToggle(true);
                                        setHomeworkStudents((prev) =>
                                          prev.map((s) => ({
                                            ...s,
                                            completed: true,
                                          }))
                                        );
                                      }
                                      // Toggle between ✔ and ✖
                                      else {
                                        const newState = !headerCompletedToggle;
                                        setHeaderCompletedToggle(newState);
                                        setHomeworkStudents((prev) =>
                                          prev.map((s) => ({
                                            ...s,
                                            completed: newState,
                                          }))
                                        );
                                      }
                                    }}
                                  >
                                    {headerCompletedToggle === false
                                      ? "✖"
                                      : "✔"}
                                  </span>
                                </th>

                                <th
                                  style={{
                                    position: "sticky",
                                    top: 0,
                                    background: "#f8f9fa",
                                    zIndex: 2,
                                  }}
                                >
                                  Remarks
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {homeworkStudents.map((student, index) => (
                                <tr key={student.student_id}>
                                  <td>{index + 1}</td>
                                  <td>{student.student_last_name}</td>
                                  <td
                                    className="text-center"
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      setHomeworkStudents((prev) =>
                                        prev.map((s) =>
                                          s.student_id === student.student_id
                                            ? { ...s, completed: !s.completed }
                                            : s
                                        )
                                      )
                                    }
                                  >
                                    <span
                                      style={{
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                        color:
                                          student.completed === null
                                            ? "#999"
                                            : student.completed
                                            ? "green"
                                            : "red",
                                      }}
                                    >
                                      {student.completed === null
                                        ? "-"
                                        : student.completed
                                        ? "✔"
                                        : "✖"}
                                    </span>
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={student.remarks || ""}
                                      maxLength={240}
                                      onChange={(e) =>
                                        setHomeworkStudents((prev) =>
                                          prev.map((s) =>
                                            s.student_id === student.student_id
                                              ? {
                                                  ...s,
                                                  remarks: e.target.value,
                                                }
                                              : s
                                          )
                                        )
                                      }
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )}
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
                  <Form.Group controlId="firstName">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="homework_date"
                      value={filter.homework_date}
                      onChange={(e) =>
                        setFilter({
                          ...filter,
                          homework_date: e.target.value.trim(),
                        })
                      }
                    />
                  </Form.Group>
                </div>
              </Col>
              <Col xs={12}>
                <div className="commonInput">
                  <Form.Group>
                    <Form.Label> Class </Form.Label>
                    <select
                      type="number"
                      className="form-select"
                      id="class_id"
                      value={filter.class_id}
                    onChange={(e) => {
                const classId = parseInt(e.target.value);
                setFilter((prev) => ({
                  ...prev,
                  class_id: classId,
                  section_id: 0,
                  subject_id: 0,
                }));
                if (classId !== 0) {
                  fetchSections(classId);
                  fetchSubject(classId, 0);
                }
              }}
                    >
                      <option value="0">Select Class</option>
                      {(classes || [])
                        .filter((classItem) => classItem.is_active === "Active")
                        .map((classItem) => (
                          <option
                            key={classItem.class_id}
                            value={classItem.class_id}
                          >
                            {classItem.class_name}
                          </option>
                        ))}
                    </select>
                  </Form.Group>
                </div>
              </Col>
              <Col xs={12}>
                <div className="commonInput">
                  <Form.Group>
                    <Form.Label>Section</Form.Label>
                    <select
                      className="form-select"
                      id="section_id"
                      value={filter.section_id}
                        onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  section_id: parseInt(e.target.value),
                }))
              }
              disabled={!filter.class_id}
                      // required
                    >
                      <option value="0">Select Section</option>
                      {(sections || []).map((section, index) => (
                        <option key={index} value={section.section_id}>
                          {section.section_name}
                        </option>
                      ))}
                    </select>
                  </Form.Group>
                </div>
              </Col>
              <Col xs={12}>
                <div className="commonInput">
                  <Form.Group>
                    <Form.Label>Subject</Form.Label>
                    <select
                      className="form-select"
                      id="subject_id"
                      value={filter.subject_id}
                      onChange={(e) =>
                        setFilter({
                          ...filter,
                          subject_id: parseInt(e.target.value),
                        })
                      }
                      disabled={!filter.class_id||!filter.section_id}
                    >
                      <option value="0">Select Subject</option>
                      {(subjects || [])
                        .filter((subject) => subject.is_active === "Active")
                        .map((subject, index) => (
                          <option key={index} value={subject.subject_id}>
                            {subject.subject_name}
                          </option>
                        ))}
                    </select>
                  </Form.Group>
                </div>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modalFooterFixed">
          <Button
            variant="secondary"
            className="btn-info clearBtn"
            onClick={handleFilterClear}
          >
            Reset
          </Button>

          <div className="">
            <Button
              variant="secondary"
              className="btn-danger secondaryBtn"
              onClick={() => {
                handleCloseFilterModal();
              }}
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
  );
};

export default Homeworklist;
