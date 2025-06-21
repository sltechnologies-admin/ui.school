import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { MdEdit, MdDelete } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-toastify/dist/ReactToastify.css";
import LeftNav from "../../components/layout/leftNav/leftNav";
import Header from "../../components/layout/header/header";

const localizer = momentLocalizer(moment);
const baseUrl = process.env.REACT_APP_API_BASE_URL;

const SchoolCalendar = () => {
  const userData = sessionStorage.getItem("user");
  const userObj = userData ? JSON.parse(userData) : {};
  const readOnlyRoles = ["Class Teacher", "Teacher", "Class Incharge", "School Admin"];
  const canSubmit = !readOnlyRoles.includes(userObj.role_name?.trim());
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [isHolidayHovered, setIsHolidayHovered] = useState(false);
  const [showHolidayInlineForm, setShowHolidayInlineForm] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ title: "", event_date: "" });
  const [holidayFormErrors, setHolidayFormErrors] = useState({});

  const [form, setForm] = useState({
    event_id: "",
    title: "",
    event_date: "",
    start_time: "",
    end_time: "",
    academic_year_id: userObj.academic_year_id || "",
    school_id: userObj.school_id || "",
  });
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    fetchEvents();
    const today = moment().format("YYYY-MM-DD");
    setMinDate(today);
    fetchAcademicYearOptions();
    fetchHolidays();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.post(`${baseUrl}/events/`, {
        action: "READ",
        school_id: userObj.school_id || "",
      });
      const formattedEvents =
        response.data?.map((event) => ({
          ...event,
          id: event.event_id,
          start: new Date(event.event_date),
          end: new Date(event.event_date),
        })) || [];
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchAcademicYearOptions = async () => {
    try {
      const response = await axios.post(`${baseUrl}/AcademicYear/`, {
        action: "CURRENTREAD",
        school_id: userObj.school_id || "",
      });
      setAcademicYearOptions(response.data || []);
    } catch (error) {
      console.error("Error fetching academic years:", error);
    }
  };
  const fetchHolidays = async () => {
    try {
      const response = await axios.post(`${baseUrl}/holiday/`, {
        action: "READ",
        school_id: userObj.school_id || "",
      });
      setHolidays(response.data || []);
    } catch (error) {
      console.error("Error fetching Holidays:", error);
    }
  };
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = {};

    if (!form.title.trim()) {
      errors.title = "Event name is required.";
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const formData = {
      title: form.title,
      event_date: form.event_date,
      start_time: form.start_time,
      end_time: form.end_time,
      academic_year_id: userObj.academic_year_id || "",
      school_id: userObj.school_id || "",
      action: form.event_id ? "UPDATE" : "CREATE",
    };

    if (form.event_id) {
      formData.event_id = form.event_id;
    }

    try {
      const response = await axios.post(`${baseUrl}/events`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success(
        form.event_id
          ? "Event updated successfully"
          : "Event added successfully"
      );
      setForm({
        event_id: "",
        title: "",
        event_date: "",
        start_time: "",
        end_time: "",
        academic_year_id: userObj.academic_year_id || "",
        school_id: userObj.school_id || "",
      });
      setShowModal(false);
      setFormErrors({});
      fetchEvents();
    } catch (error) {
      console.error("Error submitting event:", error);
      toast.error("Failed to submit event details. Please try again.");
    }
  };
  const handleInlineHolidaySubmit = async () => {
    const errors = {};
    if (!newHoliday.title.trim()) {
      errors.title = "Holiday name is required.";
    }
    if (!newHoliday.event_date) {
      errors.event_date = "Holiday date is required.";
    }

    if (Object.keys(errors).length > 0) {
      setHolidayFormErrors(errors);
      return;
    }

    const formData = {
      holiday_name: newHoliday.title,
      holiday_date: newHoliday.event_date,
      academic_year_id: userObj.academic_year_id || "",
      school_id: userObj.school_id || "",
      action: newHoliday.holiday_id ? "UPDATE" : "CREATE",
    };

    if (newHoliday.holiday_id) {
      formData.holiday_id = newHoliday.holiday_id;
    }

    try {
      await axios.post(`${baseUrl}/holiday`, formData);
      toast.success(
        newHoliday.holiday_id ? "Holiday updated successfully" : "Holiday added successfully"
      );
      fetchHolidays();
      setNewHoliday({ title: "", event_date: "", holiday_id: null });
      setShowHolidayInlineForm(false);
      setHolidayFormErrors({});
    } catch (error) {
      console.error("Error submitting holiday:", error);
      toast.error("Failed to save holiday. Please try again.");
    }
  };


  const handleDelete = async (eventId) => {
    try {
      await axios.post(`${baseUrl}/events`, {
        action: "DELETE",
        event_id: eventId,
      });
      window.alert("Are you sure you want to delete ?");
      toast.success("Event deleted successfully !");
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event. Please try again.");
    }
  };
  const handleHolidayDelete = async (holidayId) => {
    const confirmed = window.confirm("Are you sure you want to delete this holiday?");
    if (!confirmed) return;

    try {
      await axios.post(`${baseUrl}/holiday`, {
        action: "DELETE",
        holiday_id: holidayId,
      });

      toast.success("Holiday deleted successfully!");
      fetchHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error);
      toast.error("Failed to delete holiday. Please try again.");
    }
  };


  const handleEdit = (event) => {
    setForm({
      event_id: event.event_id,
      title: event.title,
      event_date: moment(event.start).format("YYYY-MM-DD"),
      start_time: moment(event.start).format("HH:mm"),
      end_time: moment(event.end).format("HH:mm"),
      academic_year_id: event.academic_year_id || "",
      school_id: userObj.school_id || "",
    });
    setShowModal(true);
  };
  const handleHolidayEdit = (holiday) => {
    setNewHoliday({
      title: holiday.holiday_name,
      event_date: moment(holiday.holiday_date).format("YYYY-MM-DD"),
      holiday_id: holiday.holiday_id,
    });
    setShowHolidayInlineForm(true);
    setHolidayFormErrors({});
  };
  const holidayEvents = holidays.map(holiday => ({
    title: holiday.holiday_name || holiday.title,
    start: new Date(holiday.holiday_date || holiday.event_date),
    end: new Date(holiday.holiday_date || holiday.event_date),
    allDay: true,
    isHoliday: true,
  }));
  const combinedEvents = [...events, ...holidayEvents];


  const CustomToolbar = ({ label, onNavigate }) => {
    return (
      <div
        className="custom-toolbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 0px",
        }}
      >
        <h5>{label}</h5>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="arrowBtn" onClick={() => onNavigate("PREV")}>
            {"<"}
          </button>

          <button className="linkBtn" onClick={() => onNavigate("TODAY")}>
            Current
          </button>
          <button className="arrowBtn" onClick={() => onNavigate("NEXT")}>
            {">"}
          </button>
        </div>
      </div>
    );
  };
  const getFilteredEvents = () => {
    const currentMonthStart = moment().startOf("month");
    const currentMonthEnd = moment().endOf("month");

    if (activeTab === "current") {
      return events.filter((event) => {
        const eventDate = moment(event.start);
        return eventDate.isBetween(
          currentMonthStart,
          currentMonthEnd,
          "day",
          "[]"
        );
      });
    }
    return events;
  };
  return (
    <div className="pageMain">
      <LeftNav />
      <div className="pageRight">
        <div className="pageHead">
          <Header />
        </div>
        <div className="pageBody schoolCalander">
          <div className="calendar-container height100">
            <Row className="height100">
              <Col xs={12} md={8} className="height100">
                <div className="height100">
                  <ToastContainer
                    position="top-right"
                    autoClose={2000}
                    hideProgressBar
                  />
                  <div
                    style={{
                      marginBottom: "10px",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  ></div>

                  <Calendar
                    className="height100"
                    localizer={localizer}
                    events={combinedEvents}
                    eventPropGetter={(event) => {
                      if (event.isHoliday) {
                        return {
                          style: {
                            backgroundColor: "#a5a2a1",
                            color: "#fff",
                          },
                        };
                      }
                      return {};
                    }}
                    startAccessor="start"
                    endAccessor="end"
                    views={["month"]}
                    defaultView="month"
                    date={date}
                    view={view}
                    onNavigate={(newDate) => setDate(newDate)}
                    onView={(newView) => setView(newView)}
                    components={{
                      toolbar: CustomToolbar,
                    }}
                    selectable
                  />
                </div>
              </Col>
              <Col xs={12} md={4} className="p-0">
                <div className="eventsPart">
                  <div className="contentAllignLR eventsPartHead">
                    <div style={{ display: "flex", gap: "15px" }}>
                      <button
                        className={`btn ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setActiveTab("all")}
                      >
                        All Events
                      </button>
                      <button
                        className={`btn ${activeTab === "current" ? "active" : ""
                          }`}
                        onClick={() => setActiveTab("current")}
                      >
                        Current Events
                      </button>
                      <div
                        onMouseEnter={() => setIsHolidayHovered(true)}
                        onMouseLeave={() => setIsHolidayHovered(false)}
                        style={{ position: "relative", display: "inline-block" }}
                      >
                        <button
                          className={`btn ${activeTab === "holidays" ? "active" : ""}`}
                          onClick={() => {
                            setActiveTab("holidays");
                            fetchHolidays();
                          }}
                        >
                          Holidays
                        </button>

                        {activeTab === "holidays" && isHolidayHovered && canSubmit && (
                          <button
                            className="btn primaryBtn addBtn"
                            style={{ marginLeft: "10px" }}
                            onClick={() => setShowHolidayInlineForm(true)}
                          >
                            <IoMdAdd />
                          </button>
                        )}

                      </div>
                    </div>
                    {canSubmit && (
                      <button
                        className="btn primaryBtn addBtn"
                        onClick={() => {
                          setForm({
                            event_id: "",
                            title: "",
                            event_date: "",
                            start_time: "",
                            end_time: "",
                            academic_year_id: userObj.academic_year_id || "",
                            school_id: userObj.school_id || "",
                          });
                          setFormErrors({});
                          setShowModal(true);
                        }}
                      >
                        <span>
                          <IoMdAdd />
                        </span>
                      </button>
                    )}

                  </div>
                  {showHolidayInlineForm && (
                    <Form style={{ marginBottom: "15px", backgroundColor: "#fff", padding: "15px", borderRadius: "8px", border: "1px solid #ddd" }}>
                      <Form.Group controlId="holidayTitle">
                        <Form.Label>Holiday Name<span className="requiredStar">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter Holiday Name"
                          value={newHoliday.title}
                          onChange={(e) =>
                            setNewHoliday({ ...newHoliday, title: e.target.value })
                          }
                        />
                        {holidayFormErrors.title && (
                          <Form.Text className="text-danger">{holidayFormErrors.title}</Form.Text>
                        )}
                      </Form.Group>
                      <Form.Group controlId="holidayDate" style={{ marginTop: "10px" }}>
                        <Form.Label>Holiday Date<span className="requiredStar">*</span></Form.Label>
                        <Form.Control
                          type="date"
                          value={newHoliday.event_date}
                          onChange={(e) =>
                            setNewHoliday({ ...newHoliday, event_date: e.target.value })
                          }
                        />
                        {holidayFormErrors.event_date && (
                          <Form.Text className="text-danger">{holidayFormErrors.event_date}</Form.Text>
                        )}
                      </Form.Group>
                      <div className="d-flex justify-content-end mt-3">
                        <Button
                          variant="secondary"
                          className="me-2"
                          onClick={() => {
                            setShowHolidayInlineForm(false);
                            setNewHoliday({ title: "", event_date: "", holiday_id: null });
                            setHolidayFormErrors({});
                          }}
                        >
                          Cancel
                        </Button>
                        <Button variant="success" onClick={handleInlineHolidaySubmit}>
                          {newHoliday.holiday_id ? "Update" : "Submit"}
                        </Button>
                      </div>
                    </Form>

                  )}

                  <div style={{ maxHeight: "620px", overflowY: "auto" }}>
                    <ul
                      style={{
                        listStyleType: "none",
                        padding: 0,
                        fontSize: "14px",
                        marginBottom: "0",
                      }}
                    >
                      {activeTab === "holidays" ? (
                        holidays.length > 0 ? (
                          holidays.map((holiday, index) => (
                            <li
                              key={index}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "12px 15px",
                                backgroundColor: "#ffffff",
                                borderRadius: "8px",
                                marginBottom: "15px",
                                border: "1px solid #e0e0e0",
                              }}
                            >
                              <span style={{ color: "#333", fontWeight: "500" }}>
                                <strong>{holiday.holiday_name || holiday.title}</strong>
                                <br />
                                <span style={{ color: "#888", fontSize: "13px" }}>
                                  {new Date(holiday.holiday_date || holiday.event_date).toLocaleDateString()}
                                </span>
                              </span>
                              <div style={{ display: "flex", alignItems: "center" }}>
                                {canSubmit && (
                                  <>
                                    <MdEdit
                                      style={{ cursor: "pointer", color: "#0d6efd", marginRight: "25px", fontSize: "18px" }}
                                      onClick={() => handleHolidayEdit(holiday)}
                                    />
                                    <MdDelete
                                      style={{ cursor: "pointer", color: "#e25c6e", fontSize: "18px" }}
                                      onClick={() => handleHolidayDelete(holiday.holiday_id)}
                                    />
                                  </>
                                )}
                              </div>

                            </li>
                          ))
                        ) : (
                          <p>No holidays available</p>
                        )
                      ) : (
                        getFilteredEvents()?.length > 0 ? (
                          getFilteredEvents().map((event, index) => (
                            <li
                              key={index}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "12px 15px",
                                backgroundColor: "#ffffff",
                                borderRadius: "8px",
                                marginBottom: "15px",
                                border: "1px solid #e0e0e0",
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#f1f1f1";
                                e.target.style.transform = "scale(1.02)";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "#ffffff";
                                e.target.style.transform = "scale(1)";
                              }}
                            >
                              <span style={{ color: "#333", fontWeight: "500" }}>
                                <strong>{event.title}</strong>
                                <br />
                                <span style={{ color: "#888", fontSize: "13px" }}>
                                  {event.start?.toLocaleDateString()}
                                </span>
                              </span>
                              {canSubmit && (
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <MdEdit
                                    style={{
                                      cursor: "pointer",
                                      color: "#0d6efd",
                                      marginRight: "15px",
                                      fontSize: "18px",
                                    }}
                                    onClick={() => handleEdit(event)}
                                  />
                                  <MdDelete
                                    style={{
                                      cursor: "pointer",
                                      color: "#e25c6e",
                                      fontSize: "18px",
                                    }}
                                    onClick={() => handleDelete(event.event_id)}
                                  />
                                </div>
                              )}

                            </li>
                          ))
                        ) : (
                          <p>No events available</p>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
      <Modal
        className="commonFilterModal"
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
        <Modal.Header className="modalHeaderFixed" closeButton>
          <Modal.Title>
            {form.event_id ? "Update Event" : "Add Event"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="commonInput">
              <Form.Group controlId="title">
                <Form.Label>
                  Event Name<span className="requiredStar">*</span>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Enter Event Name"
                  value={form.title || ""}
                  onChange={handleInputChange}
                />
                {formErrors?.title && (
                  <Form.Text className="text-danger">
                    {formErrors?.title}
                  </Form.Text>
                )}
              </Form.Group>
            </div>

            <div className="commonInput">
              <Form.Group controlId="event_date">
                <Form.Label>Event Date</Form.Label>
                <Form.Control
                  type="date"
                  value={form.event_date || ""}
                  min={minDate}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </div>
            <div className="commonInput">
              <Form.Group controlId="academic_year_id">
                <Form.Label>Academic Year</Form.Label>
                <Form.Control
                  as="select"
                  value={form.academic_year_id || ""}
                  onChange={handleInputChange}
                >
                  <option value="0" disabled hidden>
                    {userObj?.academic_year_name || "Select Academic Year"}
                  </option>
                  {academicYearOptions?.length > 0 ? (
                    academicYearOptions.map((year, index) => (
                      <option key={index} value={year.academic_year_id}>
                        {year.academic_year_name}
                      </option>
                    ))
                  ) : (
                    <option value="">No Academic Year Available</option>
                  )}
                </Form.Control>
              </Form.Group>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modalFooterFixed">
          <div className="">
            <Button
              type="button"
              variant="primary"
              className="btn-info clearBtn"
              onClick={() =>
                setForm({
                  event_id: "",
                  title: "",
                  event_date: "",
                  start_time: "",
                  end_time: "",
                  academic_year_id: "",
                })
              }
            >
              Reset
            </Button>
          </div>
          <div className="">
            <Button
              type="button"
              variant="primary"
              className="btn-danger secondaryBtn me-2"
              onClick={() => {
                setShowModal(false);
                setForm({
                  event_id: "",
                  title: "",
                  event_date: "",
                  start_time: "",
                  end_time: "",
                  academic_year_id: "",
                });
                setFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="btn-success primaryBtn"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SchoolCalendar;
