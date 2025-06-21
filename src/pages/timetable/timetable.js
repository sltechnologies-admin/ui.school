import React, { useState, useEffect } from "react";
import { Container, Button, Form, Col, Modal } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import axios from "axios";
 
const TimetableForm = () => {
  const userData = sessionStorage.getItem("user");
  const userObj = userData ? JSON.parse(userData) : {};
  const readOnlyRoles = ["Class Teacher", "Teacher", "Class Incharge"];
  const canSubmit = !readOnlyRoles.includes(userObj.role_name?.trim());
  const [timetable, setTimetable] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subjectCounts, setSubjectCounts] = useState([]);
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
  const [isGridVisible, setIsGridVisible] = useState(false);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
 
 
  useEffect(() => {
    const fetchdropdowndata = async () => {
      try {
       
        const academicResponse = await axios.post(baseUrl + "/AcademicYear/", {
          action: "CURRENTREAD",
          school_id: userObj?.school_id || 0,
        });
        setAcademic(academicResponse?.data || []);
 
       
        const weekdayResponse = await axios.post(baseUrl + "/weekday/", {
          action: "READ",
        });
        setWeekday(weekdayResponse?.data?.filter(day => day?.week_day_name !== "Sunday") || []);
 
       
        const classesResponse = await axios.post(baseUrl + "/classes/", {
          action: "READ",
          school_id: userObj?.school_id || 0,
        });
        setClasses(classesResponse?.data || []);
 
        const sectionsResponse = await axios.post(baseUrl + "/Sections/", {
          action: "READ",
          school_id: userObj?.school_id || 0,
        });
        setSections(sectionsResponse?.data || []);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
 
    fetchdropdowndata();
  }, []);
 
 
  useEffect(() => {
    const handleClassChange = async () => {
      if (filter.class_id) {
        setIsLoading(true);
        try {
         
          const periodsResponse = await axios.post(baseUrl + "/periodbasedclass/", {
            action: "READ",
            class_id: filter.class_id,
            school_id: userObj?.school_id || 0,
          });
          setPeriods(periodsResponse?.data || []);
         
         
          const updatedSections = sections.filter(
            section => section?.class_id === filter.class_id
          );
          setFilteredSections(updatedSections);
         
   
          setIsGridVisible(true);
          setTimetable([]);
        } catch (error) {
          console.error("Error fetching class periods:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setPeriods([]);
        setFilteredSections([]);
        setIsGridVisible(false);
      }
    };
 
    handleClassChange();
  }, [filter.class_id, sections]);
 
 
  useEffect(() => {
    const fetchSubjectsData = async () => {
      if (filter.class_id && filter.section_id) {
        try {
          
         
          const response = await axios.post(baseUrl + "/teacherssubjectsmap/", {
            action: "FILTER",
          school_id: userObj?.school_id || 0,

          class_id: filter.class_id,section_id:filter.section_id,academic_year_id:userObj.academic_year_id

          });
          setSubjects(response?.data || []);
          await fetchSubjectCounts();
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }
      }
    };
 
    fetchSubjectsData();
  }, [filter.class_id, filter.section_id]);
 
  const fetchTimetableData = async () => {
      if (filter.class_id && filter.section_id) {
        setIsLoading(true);
        try {
         
       
          const timetableResponse = await axios.post(`${baseUrl}/timetable/`, {
            academic_year_id: filter.academic_year_id,
            class_id: filter.class_id,
            section_id: filter.section_id,
            school_id:userObj.school_id,
            action: "FILTER",
          });
 
         
          const processedTimetable = timetableResponse.data.map(item => {
            const subject = subjects.find(sub => sub.subject_id === item.subject_id);
            return {
              ...item,
              subject_name: subject ? subject.subject_name : ""
            };
          });
 
          setTimetable(processedTimetable);
        } catch (error) {
          console.error("Error fetching timetable data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
   
  useEffect(() => {
   
 
    fetchTimetableData();
    
  }, [filter.section_id, subjects]);
 
  const processTimetableData = () => {
  const grid = Array(periods?.length || 0)
    .fill()
    .map(() => Array(6).fill(null));
 
  timetable?.forEach((entry) => {
    const { period_order, week_day_id, subject_name, teacher_name } = entry;
    if (period_order >= 1 && period_order <= periods?.length && week_day_id >= 1 && week_day_id <= 6) {
      grid[period_order - 1][week_day_id - 1] = {
        subject_name: subject_name || "",
        teacher_name: teacher_name || ""
      };
    }
  });
 
  return grid;
};
 
  const timetableGrid = processTimetableData();
 
 
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: parseInt(value, 10) || 0
    }));
  };
 
  const fetchSubjectCounts = async () => {
  if (filter.class_id && filter.section_id) {
    try {
      const response = await axios.post(baseUrl + "/subjectscount/", {
        action: "READ",
        school_id: userObj?.school_id || 0,
        class_id: filter.class_id,
        section_id: filter.section_id,
        academic_year_id: filter.academic_year_id
      });
      setSubjectCounts(response?.data || []);
    } catch (error) {
      console.error("Error fetching subject counts:", error);
      setSubjectCounts([]);
    }
  }
};
 
 
  const handleFilterClear = () => {
    setFilter({
      academic_year_id: userObj?.academic_year_id || 0,
      class_id: 0,
      section_id: 0,
    });
    setTimetable([]);
    setFilteredSections([]);
    setPeriods([]);
    setIsGridVisible(false);
    setSubjectCounts([]);
  };
 
 
  const handleCellClick = (periodOrder, weekDayId) => {
    if (!filter?.class_id || !filter?.section_id) {
      toast.error("Please select Class and Section first!");
      return;
    }
 
    const existingEntry = timetable?.find(
      entry => entry?.period_order === periodOrder && entry?.week_day_id === weekDayId
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
 
 
  const formatTime12Hour = (time) => {
    if (!time) return 'Invalid Time';
    if (/^\d{1,2}:\d{2} (AM|PM)$/.test(time)) return time;
   
    const [hoursStr, minutesStr] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr.padStart(2, '0');
 
    if (isNaN(hours) || isNaN(minutes)) return 'Invalid Time';
 
    const amPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
 
    return `${hours}:${minutes} ${amPm}`;
  };
 
 
  const handleModalSubmit = async () => {
  if (!modalData.subject_id) {
    toast.error("Please select a subject");
    return;
  }
 
  try {
    const response = await axios.post(`${baseUrl}/timetable/`, {
      academic_year_id: modalData.academic_year_id,
      class_id: modalData.class_id,
      section_id: modalData.section_id,
      week_day_id: modalData.week_day_id,
      period_order: modalData.period_order,
      subject_id: modalData.subject_id,
      school_id: modalData.school_id,
      action: modalData.period_id ? "UPDATE" : "CREATE",
      period_id: modalData.period_id || 0
    });
 
    if (response?.data?.[0]?.message === "Success") {
      toast.success(modalData.period_id ? "Timetable updated!" : "Timetable added!");
      fetchTimetableData();

      setShowModal(false);
 
     
    } else {
      toast.error("Operation failed. Please try again.");
    }
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
 
      if (status === 401 && data.error === "Teacher is already assigned to some other class at this time.") {
        toast.error("Teacher is already assigned to some other class at this time.", { position: "top-right" });
      } 
       else if (
                          status === 402 &&
                          data.error === "No teacher has been assigned to this subject yet."
                      ) {
                          toast.error("No teacher has been assigned to this subject yet.", {
                              position: "top-right",
                          });
                      } 
      else {
        toast.error("Error saving timetable: " + (data.error || error.message), {
          position: "top-right",
        });
      }
      
    } else {
      toast.error("Error saving timetable: " + error.message, {
        position: "top-right",
      });
    }
  }
 
  fetchTimetableData();
  fetchSubjectCounts();
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
            <div className="mb-3 d-flex align-items-center" style={{ gap: "5px" }}>
              <Col xs={12} md={6} lg={4} xxl={3}>
                <div className="commonInput">
                  <Form.Label>Select Year<span className="requiredStar">*</span></Form.Label>
                  <Form.Select
                    name="academic_year_id"
                    value={filter?.academic_year_id || ""}
                    onChange={handleFilterChange}
                  >
                    <option value={0}>Select Academic Year</option>
                    {academic?.map((item) => (
                      <option key={item?.academic_year_id} value={item?.academic_year_id || ""}>
                        {item?.academic_year_name}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </Col>
              <Col xs={12} md={6} lg={4} xxl={3}>
                <div className="commonInput">
                  <Form.Label>Class<span className="requiredStar">*</span></Form.Label>
                  <Form.Select
                    name="class_id"
                    value={filter?.class_id || ""}
                    onChange={handleFilterChange}
                  >
                    <option value={0}>Select Class</option>
                    {classes?.filter(cls => cls?.is_active === "Active").map(cls => (
                      <option key={cls?.class_id} value={cls?.class_id || ""}>
                        {cls?.class_name}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </Col>
              <Col xs={12} md={6} lg={4} xxl={3}>
                <div className="commonInput">
                  <Form.Label>Section<span className="requiredStar">*</span></Form.Label>
                  <Form.Select
                    name="section_id"
                    value={filter?.section_id || ""}
                    onChange={handleFilterChange}
                    disabled={!filter?.class_id}
                  >
                    <option value={0}>Select Section</option>
                    {filteredSections?.filter(section => section?.is_active === "Active").map(section => (
                      <option key={section?.section_id} value={section?.section_id || ""}>
                        {section?.section_name}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </Col>
              <Col xs={12} md={6} lg={3} xxl={3} className="p-0 d-flex justify-content-end">
                <div className="d-flex align-items-center">
                  <button
                    type="button"
                    className="btn btn-danger secondaryBtn"
                    onClick={handleFilterClear}
                  >
                    Clear
                  </button>
                </div>
              </Col>
            </div>
 
            {isLoading ? (
              <div className="text-center my-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : !isGridVisible ? (
              <p className="text-center">Select a class to view the timetable grid</p>
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
                                    {formatTime12Hour(period?.start_time)} -
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
      <td style={{ fontWeight: "bold" }}>{day?.week_day_name}</td>
      {periods?.map((_, periodOrder) => {
        const entry = timetableGrid[periodOrder]?.[day?.week_day_id - 1];
       
        return (
          <td
            key={periodOrder}
            onClick={canSubmit ? () => handleCellClick(periodOrder + 1, day?.week_day_id) : undefined}
            style={{
              cursor: canSubmit ? "pointer" : "default",
              position: "relative",
              minHeight: "50px",
              ...(!entry?.subject_name && {
                backgroundColor: "#f9f9f9",
              }),
            }}
          >
            {entry?.subject_name ? (
              <div style={{ textAlign: "center" }}>
                <div>{entry.subject_name}</div>
                {entry.teacher_name && entry.teacher_name.trim() !== '' && (
                  <div style={{ fontSize: "0.8em", color: "#666" }}>
                    ({entry.teacher_name})
                  </div>
                )}
              </div>
            ) : (
              canSubmit && (
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "24px",
                    color: "#007bff",
                    fontWeight: "bold"
                  }}
                >
                  +
                </span>
              )
            )}
          </td>
        );
      })}
    </tr>
  ))}
</tbody>
                      </table>
                    </div>
                    {isGridVisible && subjectCounts.length > 0 && (
                      <div className="mt-4">
                        <h6>Subject Counts:</h6>
                        <div className="d-flex flex-wrap gap-3">
                          {subjectCounts.map((subject, index) => (
                            <div key={index} className="bg-light p-2 rounded">
                              <strong>{subject.subject_name}:</strong> {subject.subject_count}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
 
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalData?.subject_id ? "Update Subject" : "Add Subject"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="commonInput">
              <Form.Group>
                <Form.Label>Subject</Form.Label>
                <select
                  className="form-select"
                  value={modalData?.subject_id || ""}
                  onChange={(e) => setModalData({ ...modalData, subject_id: e.target.value })}
                >
                  <option value="">Select Subject</option>
                  {subjects?.filter(subject => subject?.is_active === "Active").map(subject => (
                    <option key={subject?.subject_id} value={subject?.subject_id}>
                      {subject?.subject_name}
                    </option>
                  ))}
                </select>
              </Form.Group>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
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
 