import React, { useState, useEffect } from "react";
import { Container, Button, Form, Col, Modal } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import axios from "axios";
const TimetableForm = () => {
  const userData = sessionStorage.getItem("user");
  const userObj = userData ? JSON.parse(userData) : {};
  const [timetable, setTimetable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [academic, setAcademic] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [weekday, setWeekday] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [filter, setFilter] = useState({
    academic_year_id: userObj?.academic_year_id || 0,
    school_id: userObj?.school_id || 0,
    class_id: 0,
    section_id: 0,
  });
  const [formErrors, setFormErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    academic_year_id: "" || 0,
    class_id: "" || 0,
    section_id: "" || 0,
    week_day_id: "" || 0,
    period_order: "",
    subject_id: "" || 0,
    school_id: "" || 0,
  });
  const [isTimetableVisible, setIsTimetableVisible] = useState(false);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const fetchDropdownData = async (endpoint, setter) => {
          try {
              const response = await axios.post(baseUrl + endpoint, { action: 'READ' });
              setter(response.data);
          } catch (error) {
              console.error(`Error fetching ${endpoint}:`, error);
          }
      };
  const fetchAcademicYears = async () => {
    try {
      const response = await axios.post(baseUrl + "/AcademicYear/", {
        action: "CURRENTREAD",
        school_id: userObj?.school_id || 0,
      });
      setAcademic(response?.data || []);
    } catch (error) {
      console.error("Error fetching academic years!", error);
    }
  };

  const fetchSubjects = async (class_id, section_id) => {
    try {
      const response = await axios.post(baseUrl + "/teacherssubjectsmap/", {
        action: "FILTER",
        school_id: userObj?.school_id || 0,
        class_id: class_id, section_id: section_id, academic_year_id: userObj.academic_year_id
      });
      setSubjects(response?.data || []);
    } catch (error) {
      console.error("Error fetching Subjects!", error);
    }
  };
  useEffect(() => {
    if (Number(filter.class_id) > 0 && Number(filter.section_id) > 0) {
      fetchSubjects(filter.class_id, filter.section_id);
    }
  }, [filter.class_id, filter.section_id]);

  const fetchWeekdayData = async () => {
    try {
      const response = await axios.post(baseUrl + "/weekday/", {
        action: "READ",
      });
      const filteredDays =
        response?.data?.filter((day) => day?.week_day_name !== "Sunday") || [];
      setWeekday(filteredDays);
    } catch (error) {
      console.error("Error fetching weekday data!", error);
    }
  };
 useEffect(() => {
        fetchAcademicYears();
        fetchWeekdayData();
        fetchDropdownData('/periods/', setPeriods);
        fetchDropdownData('/weekday/', setWeekday);
        fetchDropdownData('/classes/', setClasses);
        fetchDropdownData('/Sections/', setSections);
        fetchDropdownData('/Sections/', setFilteredSections);
    }, []);
 
  const processTimetableData = () => {
    const grid = Array(periods?.length || 0)
      .fill()
      .map(() => Array(6).fill(null));
    timetable?.forEach((entry) => {
      const { period_order, week_day_id, subject_name } = entry;
      if (
        period_order >= 1 &&
        period_order <= periods?.length &&
        week_day_id >= 1 &&
        week_day_id <= 6
      ) {
        grid[period_order - 1][week_day_id - 1] = subject_name || "";
      }
    });
    return grid;
  };

  const timetableGrid = processTimetableData();
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === "class_id") {
      const selectedClassId = parseInt(value, 10);
      const updatedSections = sections?.filter(
        (section) => section?.class_id === selectedClassId
      ) || [];

      setFilteredSections(updatedSections);
      setFilter((prev) => ({
        ...prev,
        class_id: selectedClassId,
        section_id: 0,
      }));
    } else {
      setFilter((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFilterSubmit = async (e) => {
    e.preventDefault();

    if (!filter?.class_id || !filter?.section_id) {
      toast.error("Please select both Class and Section before submitting!");
      return;
    }

    setIsLoading(true);

    const formData = {
      academic_year_id: filter?.academic_year_id || 0,
      class_id: filter?.class_id || 0,
      section_id: filter?.section_id || 0,
      action: "FILTER",
    };

    try {
      const response = await axios.post(`${baseUrl}/timetable/`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      const filterData = response?.data || [];
      setTimetable(filterData);
      setIsTimetableVisible(true);
    } catch (error) {
      console.error("Error fetching timetable data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterClear = () => {
    setFilter({
      academic_year_id: 0,
      class_id: 0,
      section_id: 0,
    });
    setTimetable([]);
    setFilteredSections([]);
    setIsTimetableVisible(false);
    setFormErrors({});
  };

  const handleCellClick = (periodOrder, weekDayId) => {
    if (!filter?.class_id || !filter?.section_id) {
      toast.error("Please select Class and Section first!");
      return;
    }

    try {
      fetchSubjects(filter.class_id, filter.section_id);
    } catch (error) {
      console.error("Failed to fetch subjects on cell click:", error);
      toast.error("Error loading subjects.");
      return;
    }

    const existingEntry = timetable?.find(
      (entry) =>
        entry?.period_order === periodOrder && entry?.week_day_id === weekDayId
    );

    setModalData({
      period_id: existingEntry ? existingEntry?.period_id : 0,
      academic_year_id: filter?.academic_year_id || 0,
      class_id: filter?.class_id || 0,
      section_id: filter?.section_id || 0,
      week_day_id: weekDayId,
      period_order: periodOrder,
      subject_id: existingEntry ? existingEntry?.subject_id : "",
      school_id: userObj?.school_id || 0,
    });

    setShowModal(true);
  };

  const handleModalClose = () => setShowModal(false);

  const handleModalSubmit = async () => {
    const formData = {
      academic_year_id: modalData?.academic_year_id || 0,
      class_id: modalData?.class_id || 0,
      period_id: modalData?.period_id || 0,
      section_id: modalData?.section_id || 0,
      week_day_id: modalData?.week_day_id || 0,
      period_order: modalData?.period_order || 0,
      subject_id: modalData?.subject_id || 0,
      school_id: modalData?.school_id || userObj?.school_id || 0,
      action: modalData?.period_id ? "UPDATE" : "CREATE",
    };

    try {
      const response = await axios.post(`${baseUrl}/timetable/`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response?.data?.[0]?.message === "Success") {
        toast.success(
          formData?.action === "UPDATE"
            ? "Timetable updated successfully!"
            : "Timetable added successfully!"
        );

        setShowModal(false);

        const filterFormData = {
          academic_year_id: filter?.academic_year_id || 0,
          class_id: filter?.class_id || 0,
          section_id: filter?.section_id || 0,
          action: "FILTER",
        };

        try {
          const filterResponse = await axios.post(
            `${baseUrl}/timetable/`,
            filterFormData,
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          setTimetable(filterResponse?.data || []);
        } catch (error) {
          console.error("Error fetching timetable data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        toast.error("Operation failed. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error(
        "Error submitting data: " +
        (error?.response?.data?.error || error?.message)
      );
    }
  };
  const formatTime12Hour = (time) => {
    if (!time) return 'Invalid Time';
    if (/^\d{1,2}:\d{2} (AM|PM)$/.test(time)) {
      return time;
    }
    const [hoursStr, minutesStr] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr.padStart(2, '0');

    if (isNaN(hours) || isNaN(minutes)) return 'Invalid Time';

    const amPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${amPm}`;
  };

  return (
    <Container fluid>
      <div className="pageMain" style={{ display: "flex", height: "100vh" }}>
        <LeftNav />
        <div className="pageRight">
          <div className="pageHead">
            <Header />
          </div>
          <div className="pageBody">
            <div className="commonDataTableHead m-0">
              <div className="float-start d-flex align-items-center">
                <h6 className="commonTableTitle">Time Table</h6>
              </div>
            </div>
            <form
              onSubmit={handleFilterSubmit}
              className="mb-3 d-flex align-items-center"
              style={{ gap: "5px" }}
            >
              <Col xs={12} md={6} lg={4} xxl={3}>
                <div className="commonInput">
                  <Form.Label>
                    Select Year<span className="requiredStar">*</span>
                  </Form.Label>
                  <Form.Select
                    name="academic_year_id"
                    value={filter?.academic_year_id || ""}
                    onChange={handleFilterChange}
                  >
                    <option value={0}>Select Academic Year</option>
                    {academic?.map((item) => (
                      <option
                        key={item?.academic_year_id}
                        value={item?.academic_year_id || ""}
                      >
                        {item?.academic_year_name}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </Col>
              <Col xs={12} md={6} lg={4} xxl={3}>
                <div className="commonInput">
                  <Form.Label>
                    Class<span className="requiredStar">*</span>
                  </Form.Label>
                  <Form.Select
                    name="class_id"
                    value={filter?.class_id || ""}
                    onChange={handleFilterChange}
                  >
                    <option value={0}>Select Class</option>
                    {(classes || [])
                      .filter((cls) => cls?.is_active === "Active")
                      .map((cls) => (
                        <option key={cls?.class_id} value={cls?.class_id || ""}>
                          {cls?.class_name}
                        </option>
                      ))}
                  </Form.Select>
                </div>
              </Col>
              <Col xs={12} md={6} lg={4} xxl={3}>
                <div className="commonInput">
                  <Form.Label>
                    Section<span className="requiredStar">*</span>
                  </Form.Label>
                  <Form.Select
                    name="section_id"
                    value={filter?.section_id || ""}
                    onChange={handleFilterChange}
                    disabled={!filter?.class_id}
                  >
                    <option value={0}>Select Section</option>
                    {(filteredSections || [])
                      .filter((section) => section?.is_active === "Active")
                      .map((section) => (
                        <option
                          key={section?.section_id}
                          value={section?.section_id || ""}
                        >
                          {section?.section_name}
                        </option>
                      ))}
                  </Form.Select>
                </div>
              </Col>
              <Col
                xs={12}
                md={6}
                lg={3}
                xxl={3}
                className="p-0 d-flex justify-content-end"
              >
                <div className="d-flex align-items-center">
                  <button
                    type="submit"
                    className="btn btn-primary primaryBtn me-2"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger secondaryBtn"
                    onClick={handleFilterClear}
                  >
                    Clear
                  </button>
                </div>
              </Col>
            </form>
            {!isTimetableVisible ? (
              <p className="text-center">
                Press submit after selecting Class and Section
              </p>
            ) : (
              <div className="commonTable height100">
                <div className="tableBody height100">
                  <div className="timetableGrid height100">
                    <div className="tableWrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Day/Period</th>
                            {periods?.map((period, index) => (
                              <th key={index} style={{ fontSize: '12px' }}>
                                {period?.period_name || `Period ${index + 1}`}
                                <br />
                                {period?.start_time && period?.end_time && (
                                  <span>
                                    {formatTime12Hour(period?.start_time)}-
                                    {formatTime12Hour(period?.end_time)}
                                  </span>
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {weekday?.map((day) => (
                            <tr key={day?.week_day_id}>
                              <td style={{ fontWeight: "bold" }}>
                                {day?.week_day_name}
                              </td>
                              {periods?.map((_, periodOrder) => {
                                const entry = timetable?.find(
                                  (entry) =>
                                    entry?.week_day_id === day?.week_day_id &&
                                    entry?.period_order === periodOrder + 1
                                );

                                return (
                                  <td
                                    key={periodOrder}
                                    onClick={() =>
                                      handleCellClick(periodOrder + 1, day?.week_day_id)
                                    }
                                    style={{
                                      cursor: "pointer",
                                    }}
                                  >
                                    {entry?.subject_name || ""}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalData?.subject_id ? "Update Subject" : "Add Subject"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="commonInput">
              <Form.Group>
                <Form.Label>Subject</Form.Label>
                <select
                  className="form-select"
                  value={modalData?.subject_id || ""}
                  onChange={(e) =>
                    setModalData({ ...modalData, subject_id: e.target.value })
                  }
                >
                  <option value="">Select Subject</option>
                  {subjects
                    ?.filter((subject) => subject?.is_active === "Active")
                    .map((subject) => (
                      <option
                        key={subject?.subject_id}
                        value={subject?.subject_id}
                      >
                        {subject?.subject_name}
                      </option>
                    ))}
                </select>
              </Form.Group>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleModalSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </Container>
  );
};

export default TimetableForm;
