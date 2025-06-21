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
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState("all");
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
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.post(`${baseUrl}/events/`, {
        action: "READ",
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
                    events={events?.length > 0 ? events : []}
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
                    </div>
                    <button
                      className="btn primaryBtn addBtn"
                      onClick={() => setShowModal(true)}
                    >
                      <span>
                        <IoMdAdd />
                      </span>
                    </button>
                  </div>

                  <div className="">
                    <ul
                      style={{
                        listStyleType: "none",
                        padding: 0,
                        fontSize: "14px",
                        marginBottom: "0",
                      }}
                    >
                      {getFilteredEvents()?.length > 0 ? (
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
                              transition: "all 0.3s ease-in-out",
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
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
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
                          </li>
                        ))
                      ) : (
                        <p>No events available</p>
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
                  placeholder="Enter event name"
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
              <Form.Group controlId="start_time">
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  value={form.start_time || ""}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </div>
            <div className="commonInput">
              <Form.Group controlId="end_time">
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="time"
                  value={form.end_time || ""}
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
