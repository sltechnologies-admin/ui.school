import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Table, Dropdown, Button, Modal, } from 'react-bootstrap';
import Calendar from 'react-calendar';
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import { ToastContainer } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import { FaExpand, FaCompress } from 'react-icons/fa';
import '../dashboard/dashboard.css';
import 'react-calendar/dist/Calendar.css';
import { BiFullscreen, BiExitFullscreen } from "react-icons/bi";
import moment from 'moment'
import TimetableForm from '../timetable/addtimetable'
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const userData = sessionStorage.getItem("user");
  const userObj = userData ? JSON.parse(userData) : {};
  const [academicYears, setAcademicYears] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showModalAttendance, setShowModalAttendance] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showModalFee, setShowModalFee] = useState(false);


  const [modalTitle, setModalTitle] = useState('');
  const [classFeeData, setClassFeeData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [attendanceTrendDataDaily, setAttendanceTrendDataDaily] = useState([]);
  const [attendanceTrendDataMonthly, setAttendanceTrendDataMonthly] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [attendance_day, setAttendanceDay] = useState(null);
  // Class Fee Report
  const [classFeeClass, setClassFeeClass] = useState('');
  const [classFeeSection, setClassFeeSection] = useState('');
  const [classFeeSearch, setClassFeeSearch] = useState('');

  // Daily Attendance Report
  const [attendanceClass, setAttendanceClass] = useState(null);
  const [attendanceSection, setAttendanceSection] = useState(null);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [reportType, setReportType] = useState('Monthly');
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
  const [selectedDailyMonth, setSelectedDailyMonth] = useState(currentMonthName);

  // Monthly Attendance Report
  const [monthlyClass, setMonthlyClass] = useState('');
  const [monthlySection, setMonthlySection] = useState('');
  const [monthlySearch, setMonthlySearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonthIndex = new Date().getMonth(); // 0 = Jan, 1 = Feb, ...
    return [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ][currentMonthIndex];
  });
  const [timetable, setTimetable] = useState('');
  const [periods, setPeriods] = useState([]);
  const [weekdays, setWeekdays] = useState([]);
  const [trendClass, setTrendClass] = useState(0);
  const [trendSection, setTrendSection] = useState(0);
  const [selectedReport, setSelectedReport] = useState("trend");
  const [weekday, setWeekday] = useState([]);

  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const getDaysInMonth = (month, year = new Date().getFullYear()) => {
    const monthIndex = parseInt(month, 10) - 1; // Convert "01" to 0-based index
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  const renderClassFeeExpandedView = () => {
    return (
      <div>
        {/* Header Filters */}
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <Form.Select
            size="sm"
            value={classFeeClass}
            onChange={(e) => {
              setClassFeeClass(e.target.value);
              setClassFeeSection('');
            }}
            style={{ width: '120px' }}
          >
            <option value="">Class</option>
            {classList
              .filter(cls => cls?.is_active === "Active")
              .map(cls => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </option>
              ))}
          </Form.Select>

          <Form.Select
            size="sm"
            value={classFeeSection}
            onChange={(e) => setClassFeeSection(e.target.value)}
            disabled={!classFeeClass}
            style={{ width: '120px' }}
          >
            <option value="">Section</option>
            {sectionList
              .filter(sec => sec?.is_active === "Active" && sec?.class_id === Number(classFeeClass))
              .map(sec => (
                <option key={sec.section_id} value={sec.section_id}>
                  {sec.section_name}
                </option>
              ))}
          </Form.Select>

          <Form.Control
            type="text"
            placeholder="Search..."
            size="sm"
            value={classFeeSearch}
            onChange={(e) => setClassFeeSearch(e.target.value)}
            style={{ width: '110px' }}
          />
        </div>

        {/* Fee Table */}
        <div className="custom-fee-table">
          <div className="table-header" style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 100px 100px 100px 100px',
            fontWeight: '600',
            backgroundColor: '#f1f3f5',
            padding: '8px 12px',
            borderBottom: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <div>Roll No</div>
            <div>Student Name</div>
            <div>Total Fee</div>
            <div>Paid</div>
            <div>Current Due</div>
            <div>Balance</div>
          </div>

          <div className="table-scroll-body">
            {classFeeData
              .filter((item) =>
                item.student_name.toLowerCase().includes(classFeeSearch.toLowerCase()) ||
                String(item.roll_no).includes(classFeeSearch)
              )
              .map((item, index) => (
                <div
                  className="table-row"
                  key={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 100px 100px 100px 100px',
                    padding: '6px 12px',
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                    textAlign: 'center',
                    alignItems: 'center',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <div>{item.roll_no}</div>
                  <div style={{ fontSize: '12px', textAlign: 'left' }}>{item.student_name}</div>
                  <div>₹ {item.total}</div>
                  <div>₹ {item.total_paid}</div>
                  <div style={{
                    fontWeight: 'bold',
                    color: item.total_bal > 0 ? '#dc3545' : '#28a745',
                    backgroundColor: item.total_bal > 0 ? '#f8d7da' : '#d4edda',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginRight: "5px",
                    display: 'inline-block'
                  }}>₹ {item.current_due || 0}</div> {/* New Column */}
                  <div
                    style={{
                      fontWeight: 'bold',
                      color: item.total_bal > 0 ? '#dc3545' : '#28a745',
                      backgroundColor: item.total_bal > 0 ? '#f8d7da' : '#d4edda',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}
                    className={item.total_bal > 0 ? 'badge-danger' : 'badge-success'}
                  >
                    ₹ {item.total_bal}
                  </div>
                </div>
              ))}
            {classFeeData.length === 0 && (
              <div style={{ padding: '10px', textAlign: 'center', color: '#888' }}>
                No records found.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleMaximize = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setShowModal(true);
  };
  const getReportTitle = () => {
    switch (selectedReport) {
      case "daily":
        return "Daily Attendance Report";
      case "monthly":
        return "Student Wise Monthly Attendance";
      case "trend":
        return "Attendance Trend Report";
      default:
        return "Attendance Report";
    }
  };
  const getDateLabel = (dateStr) => {
    const date = moment(dateStr).startOf('day');
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'day').startOf('day');

    if (date.isSame(today)) return 'Today';
    if (date.isSame(yesterday)) return 'Yesterday';
    return date.format('DD MMM YYYY');
  };
  const [showModalNotifications, setShowModalNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const handleShowDetails = (note) => {
    setSelectedNotification(note);
    setShowModalNotifications(true);
  };

  const renderNotificationList = (list = []) => {
    if (list.length === 0) {
      return <div className="fst-italic ps-3">No notifications available</div>;
    }

    const sortedList = [...list].sort((a, b) => {
      const aDate = moment(a.createddate).startOf('day');
      const bDate = moment(b.createddate).startOf('day');
      return bDate.diff(aDate);
    });

    return (
      <ul className="ps-0 mb-0" style={{ listStyle: 'none' }}>
        {sortedList.map((note, index) => {
          const dateLabel = getDateLabel(note?.createddate);
          const isToday = dateLabel === 'Today';

          return (
            <li
              key={index}
              className="mb-1 d-flex justify-content-between align-items-center"
              style={{
                backgroundColor: isToday ? '#e6f7ff' : '#f8f9fa',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                boxShadow: '0 0 2px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ flex: 1 }}>
                <div className="fw-semibold" style={{ fontSize: '0.85rem', lineHeight: '1.2' }}>
                  {note?.subject || 'No subject'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#888' }}>{dateLabel}</div>
              </div>

              {/* Optional: Replace with icon or remove this if not needed */}
              <button
                className="btn btn-sm btn-link text-primary"
                style={{ fontSize: '0.75rem', padding: '2px 6px' }}
                onClick={() => handleShowDetails(note)}
              >
                Details
              </button>
            </li>
          );
        })}
      </ul>
    );
  };




  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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

  const fetchClassFeeReport = async (classId, sectionId) => {
    try {
      const params = {
        p_school_id: Number(userObj?.school_id),
        p_academic_year_id: Number(userObj.academic_year_id),
        p_class_id: Number(classId),
        p_section_id: Number(sectionId),
      };

      const response = await axios.get(baseUrl + '/main/get_fee_details_by_class_section', { params });

      setClassFeeData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching class fee report:', error.response?.data || error.message);
    }
  };

  const mappedClassFeeData = classFeeData.map(item => ({
    rollNo: item.roll_no,
    name: item.student_name,
    totalFee: item.total,
    totalPaid: item.total_paid,
    balance: item.total_bal,
  }));


  const fetchAttendanceReport = async () => {
    try {
      const isDaily = reportType === 'Daily';
      const requestBody = {
        school_id: userObj?.school_id,
        class_id: attendanceClass,
        section_id: attendanceSection,
        academic_year_id: userObj.academic_year_id,
        attendance_date: new Date().toISOString().split('T')[0],
        month_name: selectedDailyMonth,
        action: isDaily ? 'FILTER' : 'GET',
      };
      const endpoint = isDaily ? '/dailyattendancefordashboard' : '/monthlyattendance';
      const response = await axios.post(baseUrl + endpoint, requestBody);
      setAttendanceData(response.data || []);
    } catch (error) {
      console.error('Error fetching attendance report:', error);
    }
  };

  const fetchStudentAttendance = async (classId, sectionId, monthName) => {
    try {
      const response = await axios.post(baseUrl + '/studentmonthlyattendance', {
        action: 'GET',
        school_id: userObj?.school_id,
        academic_year_id: userObj.academic_year_id,
        class_id: classId,
        section_id: sectionId,
        month_name: monthName,
      });
      setStudentAttendance(response.data || []);
    } catch (error) {
      console.error('Error fetching student attendance:', error);
    }
  };

  const fetchAttendanceTrendData = async () => {
    try {
      const requestBody = {
        school_id: userObj?.school_id,
        class_id: trendClass,
        section_id: trendSection,
        academic_year_id: userObj.academic_year_id,
        month_name: selectedMonth,
        action: 'GET',
      };

      const response = await axios.post(baseUrl + '/monthlyattendance', requestBody);
      const rawData = response.data || [];

      const trendData = rawData.map(record => ({
        day: record.month,
        day: record.attendance_date,
        Present: Number(record.total_present) || 0,
        Absent: Number(record.total_absent) || 0,
      }));

      setAttendanceTrendDataMonthly(trendData);
    } catch (error) {
      console.error('Error fetching attendance trend data:', error);
    }
  };


  const fetchTimetable = async () => {
    try {
      const response = await axios.post(baseUrl + '/teachertimetable/', {
        action: 'READ',
        school_id: userObj?.school_id || 0,
        teacher_id: userObj?.user_id || 0
      });

      const data = response.data;
      if (Array.isArray(data)) {
        setTimetable(data);
      } else if (data?.data && Array.isArray(data.data)) {
        setTimetable(data.data);
      } else {

        setTimetable([]);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error.response || error.message || error);
      setTimetable([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.post(baseUrl + '/notifications', { action: 'READ', school_id: userObj?.school_id || 0 });
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.post(`${baseUrl}/events/`, {
        action: "READ", school_id: userObj?.school_id || 0,
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
  const fetchDropdownData = async (endpoint, setter) => {
    try {
      const response = await axios.post(baseUrl + endpoint, { action: 'READ', school_id: userObj?.school_id || 0, });
      setter(response.data);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  };
  useEffect(() => {
    fetchStudentAttendance();
    fetchTimetable();
    fetchNotifications();
    fetchEvents();
    fetchDropdownData('/classes/', setClassList, userObj.school_id);
    fetchDropdownData('/Sections/', setSectionList, userObj.school_id);
    fetchDropdownData("/AcademicYear/", setAcademicYears, userObj.school_id)
  }, [reportType, selectedClass, selectedSection, attendanceClass, attendanceSection]);

  useEffect(() => {
    if (classFeeClass && classFeeSection) {
      fetchClassFeeReport(classFeeClass, classFeeSection);
    }
  }, [classFeeClass, classFeeSection]);

  useEffect(() => {
    if (attendanceClass && attendanceSection) {
      fetchAttendanceReport();
    }
  }, [attendanceClass, attendanceSection, reportType, attendance_day, selectedDailyMonth]);
  useEffect(() => {
    if (trendClass && trendSection && selectedMonth) {
      fetchAttendanceTrendData();
    }
  }, [trendClass, trendSection, selectedMonth]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weekdayResponse, timetableResponse] = await Promise.all([
          axios.post(baseUrl + '/weekday/', { action: 'READ' }),
          axios.post(baseUrl + '/teachertimetable', {
            action: 'READ',
            school_id: userObj?.school_id || 0,
            teacher_id: userObj?.user_id || 0
          })
        ]);

        const days = weekdayResponse?.data?.filter(day => day?.week_day_name !== 'Sunday') || [];
        setWeekdays(days);

        const data = timetableResponse.data;
        const timetableData = Array.isArray(data) ? data : (data?.data || []);
        setTimetable(timetableData);

        const uniquePeriods = [...new Map(
          timetableData.map(item => [item.period_order, {
            period_order: item.period_order,
            period_name: item.period_name,
            start_time: item.start_time,
            end_time: item.end_time
          }])
        ).values()].sort((a, b) => a.period_order - b.period_order);

        setPeriods(uniquePeriods);
      } catch (error) {
        console.error('Error fetching timetable or weekdays:', error);
        setTimetable([]);
        setWeekdays([]);
        setPeriods([]);
      }
    };

    fetchData();
  }, []);


  const filteredAttendanceData = (attendanceData || []).filter(item => {
    if (!attendanceSearch) return true;
    const search = attendanceSearch.toLowerCase();
    return (
      item?.attendance_date?.toLowerCase().includes(search) ||
      item?.class_name?.toLowerCase().includes(search) ||
      item?.section_name?.toLowerCase().includes(search)
    );
  });

  const filteredMonthlyAttendance = (studentAttendance || []).filter(item =>
    item?.student_name?.toLowerCase().includes(monthlySearch.toLowerCase())
  );

  const handleDayClick = (value) => {
    setDate(value);
    const dayEvents = events.filter(
      (event) => new Date(event.start).toDateString() === value.toDateString()
    );
    setSelectedEvents(dayEvents);
  };


  //homework

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [homeworkData, setHomeworkData] = useState([]);
  const [homeworkFilter, setHomeworkFilter] = useState('This Month');
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const CardContent = () => (
    <Card style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', }}>
      <Card.Header
        className="d-flex justify-content-between align-items-center py-2 px-3"
        style={{
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #dee2e6',
          fontSize: '14px',
          flexShrink: 0
        }}
      >
        <strong>Homework Overview</strong>
        <div className="d-flex align-items-center gap-2">
          <Form.Select
            size="sm"
            value={homeworkFilter}
            onChange={(e) => setHomeworkFilter(e.target.value)}
            style={{ width: '130px' }}
          >
            <option>This Month</option>
            <option>This Week</option>
            <option>Today</option>
            <option>Date Range</option>
          </Form.Select>
          {homeworkFilter === "Date Range" && (
            <>
              <Form.Control
                type="date"
                size="sm"
                value={startDate}

                style={{ width: 'auto', minWidth: '40px', padding: '0PX' }}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Form.Control
                type="date"
                size="sm"
                value={endDate}
                style={{ width: 'auto', minWidth: '40px', padding: '0PX' }}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </>
          )}
          <Button variant="outline-secondary" size="sm" onClick={toggleFullscreen} title="Expand Report">
            <BiFullscreen size={18} />
          </Button>

        </div>
      </Card.Header>

      <Card.Body className="px-3 py-2" style={{ flex: 1 }}>
        {/* Column Header (Fixed) */}
        <div className="d-flex fw-bold border-bottom pb-1 bg-white sticky-top" style={{ top: 0, zIndex: 1 }}>
          <div style={{ width: '20%' }}>Class</div>
          <div style={{ width: '20%' }}>Section</div>
          <div style={{ width: '20%' }}>Total Students</div>
          <div style={{ width: '20%' }}>% Complete</div>
          <div style={{ width: '20%' }}>% Pending</div>
        </div>

        {/* Scrollable Data Rows */}
        <div style={{ overflowY: 'auto', maxHeight: '260px' }}>
          {homeworkData.length > 0 ? (
            homeworkData.map((item, index) => (
              <div className="d-flex py-1 text-muted border-bottom" key={index}>
                <div style={{ width: '20%' }}>{item.class_name}</div>
                <div style={{ width: '20%' }}>{item.section_name}</div>
                <div style={{ width: '20%' }}>{item.total_students}</div>
                <div style={{ width: '20%' }}>{item.percentage_complete}</div>
                <div style={{ width: '20%' }}>{item.percentage_pending}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-2 text-muted">No homework data available</div>
          )}
        </div>
      </Card.Body>
    </Card>
  );


  const fetchHomeworkData = async () => {
    const payload = {
      action: "GET",
      filter_type: homeworkFilter,
      start_date: homeworkFilter === "Date Range" ? startDate : null,
      end_date: homeworkFilter === "Date Range" ? endDate : null,
      school_id: userObj.school_id,
      academic_year_id: userObj.academic_year_id,
    };

    try {
      const response = await axios.post(`${baseUrl}/homeworkfordashboard/`, payload);
      setHomeworkData(response.data);
    } catch (error) {
      console.error("Error fetching homework data:", error);
      setHomeworkData([]);
    }
  };
  useEffect(() => {
    if (homeworkFilter !== "Date Range") {
      fetchHomeworkData();
    }
  }, [homeworkFilter]);

  useEffect(() => {
    if (homeworkFilter === "Date Range" && startDate && endDate) {
      fetchHomeworkData();
    }
  }, [startDate, endDate]);


  const TimetableTable = ({ periods, weekdays, timetableGrid, formatTime12Hour }) => {
    return (
      <div className="timetableGrid height100">
        <div className="timetableGrid height100" style={{ overflowX: 'auto' }}>
          <div className="tableWrapper" style={{ margin: 0, padding: 0 }}>
            <table
              className="table table-bordered table-sm mb-0"
              style={{
                tableLayout: 'fixed',
                minWidth: '600px',
                width: 'auto',
                fontSize: '12px',
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      padding: '2px 4px',
                      textAlign: 'center',
                      width: '80px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Day / Period
                  </th>
                  {periods?.map((period, index) => (
                    <th
                      key={index}
                      style={{
                        padding: '2px 4px',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        maxWidth: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {period?.period_name || `Period ${index + 1}`}
                      <br />
                      {period?.start_time && period?.end_time && (
                        <span style={{ fontSize: '10px', color: '#666' }}>
                          {formatTime12Hour(period?.start_time)} - {formatTime12Hour(period?.end_time)}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weekdays?.map((day) => (
                  <tr key={day?.week_day_id}>
                    <td
                      style={{
                        fontWeight: '600',
                        textAlign: 'center',
                        padding: '2px 4px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {day?.week_day_name}
                    </td>
                    {periods?.map((_, periodOrder) => {
                      const entry = timetableGrid[periodOrder]?.[day?.week_day_id - 1];
                      return (
                        <td
                          key={periodOrder}
                          style={{
                            padding: '2px 4px',
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            maxWidth: '100px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            backgroundColor: entry?.class_name ? 'white' : '#f9f9f9',
                          }}
                        >
                          {entry?.class_name ? (
                            <div>
                              <div style={{ fontWeight: '500' }}>{entry.class_name}</div>
                              {entry.section_name && (
                                <div style={{ fontSize: '11px', color: '#666' }}>
                                  ({entry.section_name})
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '16px', color: '#ccc', fontWeight: 'bold' }}>
                              -
                            </span>
                          )}
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
    );
  };
  const renderReportBody = () => (
    <div style={{ padding: '10px' }}>
      {/* === DAILY ATTENDANCE === */}
      {selectedReport === 'daily' && (
        <div>
          <div style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', whiteSpace: 'nowrap', marginBottom: '1rem', gap: '8px' }}>
            <Form.Select size="sm" value={attendanceClass} onChange={(e) => { setAttendanceClass(e.target.value); setAttendanceSection(''); }} style={{ width: 'auto', minWidth: '100px' }}>
              <option value="">Class</option>
              {classList.filter(cls => cls?.is_active === "Active").map(cls => (
                <option key={cls.class_id} value={cls.class_id}>{cls.class_name}</option>
              ))}
            </Form.Select>

            <Form.Select size="sm" value={attendanceSection} onChange={(e) => setAttendanceSection(e.target.value)} disabled={!attendanceClass} style={{ width: 'auto', minWidth: '100px' }}>
              <option value="">Section</option>
              {sectionList.filter(sec => sec?.is_active === "Active" && sec?.class_id === Number(attendanceClass)).map(sec => (
                <option key={sec.section_id} value={sec.section_id}>{sec.section_name}</option>
              ))}
            </Form.Select>

            <Form.Select size="sm" value={reportType} onChange={(e) => setReportType(e.target.value)} style={{ width: 'auto', minWidth: '100px' }}>
              <option value="Daily">Daily</option>
              <option value="Monthly">Monthly</option>
            </Form.Select>

            {reportType === 'Monthly' && (
              <Form.Select size="sm" value={selectedDailyMonth} onChange={(e) => {
                setSelectedDailyMonth(e.target.value);
                if (attendanceClass && attendanceSection && e.target.value) {
                  fetchAttendanceReport(attendanceClass, attendanceSection, e.target.value);
                }
              }} style={{ width: 'auto', minWidth: '100px' }}>
                <option value="">Month</option>
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, index) => (
                  <option key={index} value={month}>{month}</option>
                ))}
              </Form.Select>
            )}

            <Form.Control type="text" placeholder="Search..." size="sm" value={attendanceSearch} onChange={(e) => setAttendanceSearch(e.target.value)} style={{ width: 'auto', minWidth: '100px' }} />
          </div>
          {/* Be sure Bootstrap Icons are loaded in index.html */}
          {/* <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet" /> */}

          <div style={{
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            background: '#fff',
            fontSize: '12px',
            overflow: 'hidden',
            marginTop: '5px'
          }}>
            {/* Header Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '120px 130px 130px 130px',
              fontWeight: 600,
              backgroundColor: '#f1f3f5',
              padding: '6px 10px',
              borderBottom: '1px solid #dee2e6',
              textAlign: 'center',
              gap: "10px"
            }}>
              <div><i className="bi bi-calendar-event-fill me-1"></i> Date</div>
              <div><i className="bi bi-people-fill me-1"></i> Total Students</div>
              <div style={{ backgroundColor: '#d4edda' }}>
                <i className="bi bi-check2-circle me-1 text-success"></i> Present
              </div>
              <div style={{ backgroundColor: '#f8d7da' }}>
                <i className="bi bi-x-circle-fill me-1 text-danger"></i> Absent
              </div>
            </div>

            {/* Scrollable Body */}
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filteredAttendanceData.length > 0 ? (
                filteredAttendanceData.map((item, index) => {
                  const formattedDate = item.attendance_date.split("-").reverse().join("-");

                  return (
                    <div
                      key={index}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 130px 130px 130px',
                        padding: '6px 10px',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                        textAlign: 'center',
                        borderBottom: '1px solid #eee',
                        gap: "10px"
                      }}
                    >
                      <div>{formattedDate}</div>
                      <div>{item.total_students}</div>
                      <div>{item.total_present}</div>
                      <div>{item.total_absent}</div>
                    </div>
                  );
                })
              ) : (
                <div style={{
                  padding: '8px',
                  textAlign: 'center',
                  color: '#888'
                }}>
                  No attendance data available.
                </div>
              )}
            </div>
          </div>



        </div>
      )}


      {/* === STUDENT MONTHLY ATTENDANCE === */}
      {selectedReport === 'monthly' && (
        <div>
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <Form.Select
              size="sm"
              value={monthlyClass}
              onChange={(e) => {
                setMonthlyClass(e.target.value);
                setMonthlySection('');
              }}
              style={{ width: 'auto', minWidth: '80px' }}

            >
              <option value="">Class</option>
              {classList.filter(cls => cls?.is_active === "Active").map(cls => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </option>
              ))}
            </Form.Select>

            <Form.Select
              size="sm"
              value={monthlySection}
              onChange={(e) => setMonthlySection(e.target.value)}
              disabled={!monthlyClass}
              style={{ width: 'auto', minWidth: '80px' }}

            >
              <option value="">Section</option>
              {sectionList
                .filter(sec => sec?.is_active === "Active" && sec?.class_id === Number(monthlyClass))
                .map(sec => (
                  <option key={sec.section_id} value={sec.section_id}>
                    {sec.section_name}
                  </option>
                ))}
            </Form.Select>

            <Form.Select
              size="sm"
              value={selectedMonth}
              onChange={(e) => {
                const month = e.target.value;
                setSelectedMonth(month);
                if (monthlyClass && monthlySection && month) {
                  fetchStudentAttendance(monthlyClass, monthlySection, month);
                }
              }}
              style={{ width: 'auto', minWidth: '80px' }}

            >
              <option value="">Month</option>
              {[
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ].map((month, index) => (
                <option key={index} value={month}>
                  {month}
                </option>
              ))}
            </Form.Select>

            <Form.Control
              type="text"
              placeholder="Search..."
              size="sm"
              value={monthlySearch}
              onChange={(e) => setMonthlySearch(e.target.value)}
              style={{ width: 'auto', minWidth: '80px' }}

            />
          </div>

          <div style={{
            border: '1px solid #dee2e6',
            // borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            background: '#fff',
            fontSize: '12px',
            overflow: 'hidden',
            marginTop: '10px'
          }}>
            {/* Header Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px 140px 90px 90px 90px 100px',
              fontWeight: 400,
              backgroundColor: '#f1f3f5',
              // padding: '6px 10px',
              borderBottom: '1px solid #dee2e6',
              textAlign: 'center',

            }}>
              <div style={{ fontWeight: "bold" }}><i className="bi bi-hash" ></i> Roll No</div>
              <div style={{ fontWeight: "bold" }}><i className="bi bi-person-fill" ></i> Student</div>
              <div style={{ fontWeight: "bold" }}><i className="bi bi-calendar-range" ></i> Days</div>
              <div style={{ backgroundColor: '#d4edda', fontWeight: "bold" }}><i className="bi bi-check2-circle me-1 text-success"></i> Present</div>
              <div style={{ backgroundColor: '#f8d7da', fontWeight: "bold" }}><i className="bi bi-x-circle-fill text-danger"></i> Absent</div>
              <div style={{ backgroundColor: '#e2e3ff', fontWeight: "bold" }}><i className="bi bi-percent"></i> percent</div>
            </div>

            {/* Scrollable Body */}
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {filteredMonthlyAttendance.length > 0 ? (
                filteredMonthlyAttendance.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 140px 90px 90px 90px 100px',
                      //  padding: '6px 10px',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                      textAlign: 'center',
                      borderBottom: '1px solid #eee',

                    }}
                  >
                    <div>{item.roll_no}</div>
                    <div style={{ fontSize: '12px', textAlign: 'left' }}>{item.student_name}</div>
                    <div>{item.total_working_days}</div>
                    <div>{item.total_present}</div>
                    <div>{item.total_absent}</div>
                    <div>{item.present_percentage}</div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '8px', textAlign: 'center', color: '#888' }}>
                  No attendance data available.
                </div>
              )}
            </div>
          </div>


        </div>
      )}

      {/* === ATTENDANCE TREND === */}
      {selectedReport === 'trend' && (
        <div>
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <Form.Select
              size="sm"
              value={trendClass}
              onChange={(e) => {
                setTrendClass(e.target.value);
                setTrendSection('');
              }}
              style={{ width: '120px' }}
            >
              <option value="">Class</option>
              {classList.filter(cls => cls?.is_active === "Active").map(cls => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </option>
              ))}
            </Form.Select>

            <Form.Select
              size="sm"
              value={trendSection}
              onChange={(e) => setTrendSection(e.target.value)}
              disabled={!trendClass}
              style={{ width: 'auto', minWidth: '120px' }}

            >
              <option value="">Section</option>
              {sectionList
                .filter(sec => sec?.is_active === "Active" && sec?.class_id === Number(trendClass))
                .map(sec => (
                  <option key={sec.section_id} value={sec.section_id}>
                    {sec.section_name}
                  </option>
                ))}
            </Form.Select>
            <Form.Select
              size="sm"
              value={selectedMonth}
              onChange={(e) => {
                const month = e.target.value;
                setSelectedMonth(month);
                if (trendClass && trendSection && month) {
                  fetchAttendanceTrendData(trendClass, trendSection, month);
                }
              }}
              style={{ width: 'auto', minWidth: '120px' }}

            >
              <option value="">Month</option>
              {[
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ].map((month, index) => (
                <option key={index} value={month}>
                  {month}
                </option>
              ))}
            </Form.Select>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={sortedTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tickFormatter={(str) => {
                  try {
                    return format(parseISO(str), 'd');
                  } catch {
                    return str;
                  }
                }}
              />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="Present" stroke="#007bff" strokeWidth={2} />
              <Line type="monotone" dataKey="Absent" stroke="#dc3545" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>

        </div>
      )}
    </div>
  );
  useEffect(() => {
    // Only run if classList is available and class not yet set
    const firstActiveClass = classList.find(cls => cls?.is_active === "Active");
    if (firstActiveClass && !attendanceClass) {
      setAttendanceClass(firstActiveClass.class_id);
    }

    if (firstActiveClass && !monthlyClass) {
      setMonthlyClass(firstActiveClass.class_id);
    }

    if (firstActiveClass && !trendClass) {
      setTrendClass(firstActiveClass.class_id);
    }

    if (firstActiveClass && !classFeeClass) {
      setClassFeeClass(firstActiveClass.class_id);
    }
  }, [classList]);
  useEffect(() => {
    // Only run if classList is available and class not yet set
    const firstActiveClass = classList.find(cls => cls?.is_active === "Active");
    if (firstActiveClass && !attendanceClass) {
      setAttendanceClass(firstActiveClass.class_id);
    }

    if (firstActiveClass && !monthlyClass) {
      setMonthlyClass(firstActiveClass.class_id);
    }

    if (firstActiveClass && !trendClass) {
      setTrendClass(firstActiveClass.class_id);
    }

    if (firstActiveClass && !classFeeClass) {
      setClassFeeClass(firstActiveClass.class_id);
    }
  }, [classList]);
  // Set default class values once classList is loaded
  useEffect(() => {
    const firstActiveClass = classList.find(cls => cls?.is_active === "Active");

    if (firstActiveClass) {
      if (!attendanceClass) setAttendanceClass(firstActiveClass.class_id);
      if (!monthlyClass) setMonthlyClass(firstActiveClass.class_id);
      if (!trendClass) setTrendClass(firstActiveClass.class_id);
      if (!classFeeClass) setClassFeeClass(firstActiveClass.class_id);
    }
  }, [classList]);

  // Set corresponding default section for Attendance
  useEffect(() => {
    if (attendanceClass && !attendanceSection) {
      const firstSection = sectionList.find(
        sec => sec?.is_active === "Active" && sec.class_id === Number(attendanceClass)
      );
      if (firstSection) {
        setAttendanceSection(firstSection.section_id);
      }
    }
  }, [attendanceClass, sectionList]);

  // Set corresponding default section for Monthly
  useEffect(() => {
    if (monthlyClass && !monthlySection) {
      const firstSection = sectionList.find(
        sec => sec?.is_active === "Active" && sec.class_id === Number(monthlyClass)
      );
      if (firstSection) {
        setMonthlySection(firstSection.section_id);
      }
    }
  }, [monthlyClass, sectionList]);

  // Set corresponding default section for Trend
  useEffect(() => {
    if (trendClass && !trendSection) {
      const firstSection = sectionList.find(
        sec => sec?.is_active === "Active" && sec.class_id === Number(trendClass)
      );
      if (firstSection) {
        setTrendSection(firstSection.section_id);
      }
    }
  }, [trendClass, sectionList]);

  // Set corresponding default section for Class Fee
  useEffect(() => {
    if (classFeeClass && !classFeeSection) {
      const firstSection = sectionList.find(
        sec => sec?.is_active === "Active" && sec.class_id === Number(classFeeClass)
      );
      if (firstSection) {
        setClassFeeSection(firstSection.section_id);
      }
    }
  }, [classFeeClass, sectionList]);
  const sortedTrendData = [...attendanceTrendDataMonthly].sort(
    (a, b) => new Date(a.day) - new Date(b.day)
  );




  return (
    <div className="pageMain">
      <ToastContainer />
      <LeftNav />
      <div className="pageRight">
        <div className="pageHead"><Header /></div>
        <Container fluid className="dashboard-container px-2 px-md-4">
          <Row className="g-4">
            <Col xs={12} md={6}>
              <Card>
                <Card.Header className="d-flex align-items-center justify-content-between" style={{ gap: '10px', flexWrap: 'nowrap' }}>
                  <h5 className="mb-0" style={{ flexShrink: 0 }}>Class Fee Report</h5>
                  <div className="d-flex align-items-center" style={{ gap: '10px', flexGrow: 1, justifyContent: 'flex-end' }}>
                    {/* Class Dropdown */}
                    <Form.Select
                      size="sm"
                      value={classFeeClass}
                      onChange={(e) => {
                        setClassFeeClass(e.target.value);
                        setClassFeeSection('');
                      }}
                      style={{ width: '120px' }}
                    >
                      <option value="">Class</option>
                      {classList
                        .filter(cls => cls?.is_active === "Active")
                        .map(cls => (
                          <option key={cls.class_id} value={cls.class_id}>
                            {cls.class_name}
                          </option>
                        ))}
                    </Form.Select>

                    {/* Section Dropdown */}
                    <Form.Select
                      size="sm"
                      value={classFeeSection}
                      onChange={(e) => setClassFeeSection(e.target.value)}
                      disabled={!classFeeClass}
                      style={{ width: '120px' }}
                    >
                      <option value="">Section</option>
                      {sectionList
                        .filter(sec => sec?.is_active === "Active" && sec?.class_id === Number(classFeeClass))
                        .map(sec => (
                          <option key={sec.section_id} value={sec.section_id}>
                            {sec.section_name}
                          </option>
                        ))}
                    </Form.Select>

                    {/* Search Input */}
                    <Form.Control
                      type="text"
                      placeholder="Search..."
                      size="sm"
                      value={classFeeSearch}
                      onChange={(e) => setClassFeeSearch(e.target.value)}
                      style={{ width: '90px' }}
                    />

                    {/* Maximize Button */}
                    <Button variant="outline-secondary" size="sm" onClick={() => setShowModalFee(true)} title="Expand Report">
                      <BiFullscreen size={10} />
                    </Button>
                  </div>
                </Card.Header>

                <div
                  className="custom-fee-table"
                  style={{
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    background: '#fff',
                    fontSize: '12px',
                    overflow: 'hidden'
                  }}
                >
                  {/* Header Row */}
                  <div
                    className="table-header"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr 100px 100px 100px 100px',
                      fontWeight: '600',
                      backgroundColor: '#f1f3f5',
                      padding: '8px 12px',
                      borderBottom: '1px solid #dee2e6',
                      textAlign: 'center'
                    }}
                  >
                    <div>Roll No</div>
                    <div style={{ textAlign: 'left' }}>Student Name</div>
                    <div>Total Fee</div>
                    <div>Paid</div>
                    <div>Current Due</div> {/* New Column */}
                    <div>Balance</div>

                  </div>

                  {/* Scrollable Body */}
                  <div
                    className="table-scroll-body"
                    style={{
                      maxHeight: '240px',
                      overflowY: 'auto'
                    }}
                  >
                    {classFeeData
                      .filter((item) =>
                        item.student_name.toLowerCase().includes(classFeeSearch.toLowerCase()) ||
                        String(item.roll_no).includes(classFeeSearch)
                      )
                      .map((item, index) => (
                        <div
                          className="table-row"
                          key={index}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '80px 1fr 100px 100px 100px 100px',
                            padding: '6px 12px',
                            backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                            textAlign: 'center',
                            alignItems: 'center',
                            borderBottom: '1px solid #eee'
                          }}
                        >
                          <div>{item.roll_no}</div>
                          <div style={{ fontSize: '12px', textAlign: 'left' }}>{item.student_name}</div>
                          <div>₹ {item.total}</div>
                          <div>₹ {item.total_paid}</div>
                          <div style={{
                            fontWeight: 'bold',
                            color: item.total_bal > 0 ? '#dc3545' : '#28a745',
                            backgroundColor: item.total_bal > 0 ? '#f8d7da' : '#d4edda',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            marginRight: "5px",
                            display: 'inline-block'
                          }}>₹ {item.current_due || 0}</div> {/* New Column */}
                          <div
                            style={{
                              fontWeight: 'bold',
                              color: item.total_bal > 0 ? '#dc3545' : '#28a745',
                              backgroundColor: item.total_bal > 0 ? '#f8d7da' : '#d4edda',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              display: 'inline-block'
                            }}
                          >
                            ₹ {item.total_bal}
                          </div>

                        </div>
                      ))}
                    {classFeeData.length === 0 && (
                      <div style={{ padding: '10px', textAlign: 'center', color: '#888' }}>
                        No records found.
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Col>


            <Col xs={12} md={6}>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Attendance Reports</h5>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Select
                      size="sm"
                      value={selectedReport}
                      onChange={(e) => setSelectedReport(e.target.value)}
                      style={{ width: '180px' }}
                    >
                      <option value="daily">Daily Attendance Report</option>
                      <option value="monthly">Student Wise Monthly Attendance</option>
                      <option value="trend">Attendance Trend Report</option>
                    </Form.Select>

                    <Button variant="outline-secondary" size="sm" onClick={() => setShowModalAttendance(true)} title="Expand Report">
                      <BiFullscreen size={18} />
                    </Button>
                  </div>
                </Card.Header>

                <Card.Body style={{ padding: '5px' }}>
                  {/* === DAILY ATTENDANCE === */}
                  {selectedReport === 'daily' && (
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', whiteSpace: 'nowrap', marginBottom: '1rem', gap: '8px' }}>
                        <Form.Select size="sm" value={attendanceClass} onChange={(e) => { setAttendanceClass(e.target.value); setAttendanceSection(''); }} style={{ width: 'auto', minWidth: '100px' }}>
                          <option value="">Class</option>
                          {classList.filter(cls => cls?.is_active === "Active").map(cls => (
                            <option key={cls.class_id} value={cls.class_id}>{cls.class_name}</option>
                          ))}
                        </Form.Select>

                        <Form.Select size="sm" value={attendanceSection} onChange={(e) => setAttendanceSection(e.target.value)} disabled={!attendanceClass} style={{ width: 'auto', minWidth: '100px' }}>
                          <option value="">Section</option>
                          {sectionList.filter(sec => sec?.is_active === "Active" && sec?.class_id === Number(attendanceClass)).map(sec => (
                            <option key={sec.section_id} value={sec.section_id}>{sec.section_name}</option>
                          ))}
                        </Form.Select>

                        <Form.Select size="sm" value={reportType} onChange={(e) => setReportType(e.target.value)} style={{ width: 'auto', minWidth: '100px' }}>
                          <option value="Daily">Daily</option>
                          <option value="Monthly">Monthly</option>
                        </Form.Select>

                        {reportType === 'Monthly' && (
                          <Form.Select size="sm" value={selectedDailyMonth} onChange={(e) => {
                            setSelectedDailyMonth(e.target.value);
                            if (attendanceClass && attendanceSection && e.target.value) {
                              fetchAttendanceReport(attendanceClass, attendanceSection, e.target.value);
                            }
                          }} style={{ width: 'auto', minWidth: '100px' }}>
                            <option value="">Month</option>
                            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, index) => (
                              <option key={index} value={month}>{month}</option>
                            ))}
                          </Form.Select>
                        )}

                        <Form.Control type="text" placeholder="Search..." size="sm" value={attendanceSearch} onChange={(e) => setAttendanceSearch(e.target.value)} style={{ width: 'auto', minWidth: '100px' }} />
                      </div>
                      {/* Be sure Bootstrap Icons are loaded in index.html */}
                      {/* <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet" /> */}

                      <div style={{
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        background: '#fff',
                        fontSize: '12px',
                        overflow: 'hidden',
                        marginTop: '5px'
                      }}>
                        {/* Header Row */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '120px 130px 130px 130px',
                          fontWeight: 600,
                          backgroundColor: '#f1f3f5',
                          padding: '6px 10px',
                          borderBottom: '1px solid #dee2e6',
                          textAlign: 'center',
                          gap: "10px"
                        }}>
                          <div><i className="bi bi-calendar-event-fill me-1"></i> Date</div>
                          <div><i className="bi bi-people-fill me-1"></i> Total Students</div>
                          <div style={{ backgroundColor: '#d4edda' }}>
                            <i className="bi bi-check2-circle me-1 text-success"></i> Present
                          </div>
                          <div style={{ backgroundColor: '#f8d7da' }}>
                            <i className="bi bi-x-circle-fill me-1 text-danger"></i> Absent
                          </div>
                        </div>

                        {/* Scrollable Body */}
                        <div style={{ maxHeight: '205px', overflowY: 'auto' }}>
                          {filteredAttendanceData.length > 0 ? (
                            filteredAttendanceData.map((item, index) => {
                              const formattedDate = item.attendance_date.split("-").reverse().join("-");

                              return (
                                <div
                                  key={index}
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: '120px 130px 130px 130px',
                                    padding: '6px 10px',
                                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                                    textAlign: 'center',
                                    borderBottom: '1px solid #eee',
                                    gap: "10px"
                                  }}
                                >
                                  <div>{formattedDate}</div>
                                  <div>{item.total_students}</div>
                                  <div>{item.total_present}</div>
                                  <div>{item.total_absent}</div>
                                </div>
                              );
                            })
                          ) : (
                            <div style={{
                              padding: '8px',
                              textAlign: 'center',
                              color: '#888'
                            }}>
                              No attendance data available.
                            </div>
                          )}
                        </div>
                      </div>



                    </div>
                  )}


                  {/* === STUDENT MONTHLY ATTENDANCE === */}
                  {selectedReport === 'monthly' && (
                    <div>
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                        <Form.Select
                          size="sm"
                          value={monthlyClass}
                          onChange={(e) => {
                            setMonthlyClass(e.target.value);
                            setMonthlySection('');
                          }}
                          style={{ width: 'auto', minWidth: '80px' }}

                        >
                          <option value="">Class</option>
                          {classList.filter(cls => cls?.is_active === "Active").map(cls => (
                            <option key={cls.class_id} value={cls.class_id}>
                              {cls.class_name}
                            </option>
                          ))}
                        </Form.Select>

                        <Form.Select
                          size="sm"
                          value={monthlySection}
                          onChange={(e) => setMonthlySection(e.target.value)}
                          disabled={!monthlyClass}
                          style={{ width: 'auto', minWidth: '80px' }}

                        >
                          <option value="">Section</option>
                          {sectionList
                            .filter(sec => sec?.is_active === "Active" && sec?.class_id === Number(monthlyClass))
                            .map(sec => (
                              <option key={sec.section_id} value={sec.section_id}>
                                {sec.section_name}
                              </option>
                            ))}
                        </Form.Select>

                        <Form.Select
                          size="sm"
                          value={selectedMonth}
                          onChange={(e) => {
                            const month = e.target.value;
                            setSelectedMonth(month);
                            if (monthlyClass && monthlySection && month) {
                              fetchStudentAttendance(monthlyClass, monthlySection, month);
                            }
                          }}
                          style={{ width: 'auto', minWidth: '80px' }}

                        >
                          <option value="">Month</option>
                          {[
                            "January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"
                          ].map((month, index) => (
                            <option key={index} value={month}>
                              {month}
                            </option>
                          ))}
                        </Form.Select>

                        <Form.Control
                          type="text"
                          placeholder="Search..."
                          size="sm"
                          value={monthlySearch}
                          onChange={(e) => setMonthlySearch(e.target.value)}
                          style={{ width: 'auto', minWidth: '80px' }}

                        />
                      </div>

                      <div style={{
                        border: '1px solid #dee2e6',
                        // borderRadius: '6px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        background: '#fff',
                        fontSize: '12px',
                        overflow: 'hidden',
                        marginTop: '10px'
                      }}>
                        {/* Header Row */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '80px 140px 90px 90px 90px 100px',
                          fontWeight: 400,
                          backgroundColor: '#f1f3f5',
                          // padding: '6px 10px',
                          borderBottom: '1px solid #dee2e6',
                          textAlign: 'center',

                        }}>
                          <div style={{ fontWeight: "bold" }}><i className="bi bi-hash" ></i> Roll No</div>
                          <div style={{ fontWeight: "bold" }}><i className="bi bi-person-fill" ></i> Student</div>
                          <div style={{ fontWeight: "bold" }}><i className="bi bi-calendar-range" ></i> Days</div>
                          <div style={{ backgroundColor: '#d4edda', fontWeight: "bold" }}><i className="bi bi-check2-circle me-1 text-success"></i> Present</div>
                          <div style={{ backgroundColor: '#f8d7da', fontWeight: "bold" }}><i className="bi bi-x-circle-fill text-danger"></i> Absent</div>
                          <div style={{ backgroundColor: '#e2e3ff', fontWeight: "bold" }}><i className="bi bi-percent"></i> percent</div>
                        </div>

                        {/* Scrollable Body */}
                        <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                          {filteredMonthlyAttendance.length > 0 ? (
                            filteredMonthlyAttendance.map((item, index) => (
                              <div
                                key={index}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '80px 140px 90px 90px 90px 100px',
                                  //  padding: '6px 10px',
                                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                                  textAlign: 'center',
                                  borderBottom: '1px solid #eee',

                                }}
                              >
                                <div>{item.roll_no}</div>
                                <div style={{ fontSize: '12px', textAlign: 'left' }}>{item.student_name}</div>
                                <div>{item.total_working_days}</div>
                                <div>{item.total_present}</div>
                                <div>{item.total_absent}</div>
                                <div>{item.present_percentage}</div>
                              </div>
                            ))
                          ) : (
                            <div style={{ padding: '8px', textAlign: 'center', color: '#888' }}>
                              No attendance data available.
                            </div>
                          )}
                        </div>
                      </div>


                    </div>
                  )}

                  {/* === ATTENDANCE TREND === */}
                  {selectedReport === 'trend' && (
                    <div>
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                        <Form.Select
                          size="sm"
                          value={trendClass}
                          onChange={(e) => {
                            setTrendClass(e.target.value);
                            setTrendSection('');
                          }}
                          style={{ width: '120px' }}
                        >
                          <option value="">Class</option>
                          {classList.filter(cls => cls?.is_active === "Active").map(cls => (
                            <option key={cls.class_id} value={cls.class_id}>
                              {cls.class_name}
                            </option>
                          ))}
                        </Form.Select>

                        <Form.Select
                          size="sm"
                          value={trendSection}
                          onChange={(e) => setTrendSection(e.target.value)}
                          disabled={!trendClass}
                          style={{ width: 'auto', minWidth: '120px' }}

                        >
                          <option value="">Section</option>
                          {sectionList
                            .filter(sec => sec?.is_active === "Active" && sec?.class_id === Number(trendClass))
                            .map(sec => (
                              <option key={sec.section_id} value={sec.section_id}>
                                {sec.section_name}
                              </option>
                            ))}
                        </Form.Select>
                        <Form.Select
                          size="sm"
                          value={selectedMonth}
                          onChange={(e) => {
                            const month = e.target.value;
                            setSelectedMonth(month);
                            if (trendClass && trendSection && month) {
                              fetchAttendanceTrendData(trendClass, trendSection, month);
                            }
                          }}
                          style={{ width: 'auto', minWidth: '120px' }}

                        >
                          <option value="">Month</option>
                          {[
                            "January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"
                          ].map((month, index) => (
                            <option key={index} value={month}>
                              {month}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={sortedTrendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="day"
                            tickFormatter={(str) => {
                              try {
                                return format(parseISO(str), 'd');
                              } catch {
                                return str;
                              }
                            }}
                          />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="Present" stroke="#007bff" strokeWidth={2} />
                          <Line type="monotone" dataKey="Absent" stroke="#dc3545" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>

                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="g-4 mt-1">
            <Col xs={12} md={6}>
              <TimetableForm />




            </Col>
            <Col xs={12} md={6}>
              {CardContent()}
            </Col>


          </Row>
          <Row className="g-4 mt-1">




            <Col xs={12} md={6}>
              <Card>
                <Card.Header
                  className="d-flex justify-content-between align-items-center"
                  style={{
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #dee2e6',
                    fontSize: '0.9rem',
                  }}
                >
                  <h6 style={{ margin: 0 }}>Notifications</h6>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    title="Expand Notifications"
                    onClick={() =>
                      handleMaximize(
                        'My Notifications',
                        <div style={{ fontSize: '0.85rem', maxHeight: '350px', overflowY: 'auto' }}>
                          {renderNotificationList(notifications)}
                        </div>
                      )
                    }
                  >
                    <FaExpand size={18} />
                  </Button>

                </Card.Header>

                <Card.Body style={{ padding: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ maxHeight: '310px', overflowY: 'auto' }}>
                    {renderNotificationList(notifications)}
                  </div>
                </Card.Body>
              </Card>
            </Col>



            <Col xs={12} md={6} className="mb-4" style={{ maxHeight: '390px', overflowY: 'auto' }}>
              <Card>
                <Card.Header
                  className="d-flex justify-content-between align-items-center"
                  style={{
                    padding: "8px",
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #dee2e6',
                    fontSize: '0.9rem'
                  }}
                >
                  <h6 style={{ margin: 0 }}>Event Calendar </h6>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    title="Expand Calendar"
                    onClick={() =>
                      handleMaximize(
                        'Event Calendar',
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', fontSize: '0.85rem' }}>
                          <div>
                            <Calendar
                              value={date}
                              onChange={handleDayClick}
                              tileContent={({ date: tileDate, view }) => {
                                if (view === 'month') {
                                  const hasEvent = events.some(
                                    (event) => new Date(event.start).toDateString() === tileDate.toDateString()
                                  );
                                  return hasEvent ? (
                                    <div style={{ textAlign: 'center', color: 'red', fontSize: '1rem' }}>•</div>
                                  ) : null;
                                }
                              }}
                            />
                          </div>
                          <div style={{ flex: 1, maxWidth: '300px', overflowY: 'auto' }}>
                            <h6 style={{ marginTop: 0 }}>All Events</h6>
                            {events.length > 0 ? (
                              <ul className="mb-0 ps-3">
                                {events.map((event) => (
                                  <li key={event.id} className="mb-2" style={{ fontSize: '0.8rem' }}>
                                    <strong>{event.title || 'Untitled Event'}</strong>
                                    <br />
                                    <small className="text-muted">{new Date(event.start).toLocaleDateString()}</small>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="fst-italic">No events available.</p>
                            )}
                          </div>
                        </div>
                      )
                    }
                  >
                    <FaExpand size={18} />
                  </Button>

                </Card.Header>

                <Card.Body style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                  {/* Calendar Section */}
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: '0 0 280px' }}>
                      <Calendar
                        value={date}
                        onChange={(selectedDate) => {
                          handleDayClick(selectedDate);
                          setDate(selectedDate);
                        }}
                        tileContent={({ date: tileDate, view }) => {
                          if (view === 'month') {
                            const hasEvent = events.some(
                              (event) => new Date(event.start).toDateString() === tileDate.toDateString()
                            );
                            return hasEvent ? (
                              <div style={{ textAlign: 'center', color: 'red', fontSize: '1rem' }}>•</div>
                            ) : null;
                          }
                        }}
                      />
                    </div>

                    <div style={{ flex: 1, maxHeight: '15rem', display: 'flex', flexDirection: 'column' }}>
                      <h6 className="mb-2">All Events</h6>
                      <ul className="flex-grow-1 overflow-auto ps-3 mb-0">
                        {events.length === 0 ? (
                          <li className="fst-italic">No events available</li>
                        ) : (
                          events.map((event) => (
                            <li key={event.id} className="mb-2">
                              <strong>{event.title || ''}</strong>
                              <br />
                              <small className="text-muted">{new Date(event.start).toLocaleDateString()}</small>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>





          </Row>

        </Container>
        {/* Maximize Modal */}
        <>
          <style>
            {`
      .modal-xxl-custom {
        max-width: 1140px;
        width: 100%;
      }
    `}
          </style>
          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            centered
            dialogClassName="modal-xxl-custom"
            style={{ zIndex: 1050 }}
          >
            <Modal.Header closeButton>
              <Modal.Title>{modalTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body
              style={{
                maxHeight: '70vh',
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '20px',
              }}
            >
              {modalContent}
            </Modal.Body>
          </Modal>
          <Modal
            show={showModalAttendance}
            onHide={() => setShowModalAttendance(false)}
            dialogClassName="modal-xl"
            // fullscreen
            centered
          >
            <Modal.Header closeButton className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3 w-100">
                <Modal.Title className="mb-0">{getReportTitle()}</Modal.Title>
                <Form.Select
                  size="sm"
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  style={{ width: '250px', marginLeft: "520px" }}
                >
                  <option value="daily">Daily Attendance Report</option>
                  <option value="monthly">Student Wise Monthly Attendance</option>
                  <option value="trend">Attendance Trend Report</option>
                </Form.Select>
              </div>
            </Modal.Header>

            <Modal.Body>
              {/* Reuse your existing report content */}
              {renderReportBody()}
            </Modal.Body>
          </Modal>
          <Modal
            show={isFullscreen}
            onHide={toggleFullscreen}
            size="xl"

            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>
                Homework Overview
                <FaCompress className="ms-3" style={{ cursor: 'pointer' }} onClick={toggleFullscreen} />
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>{CardContent()}</Modal.Body>
          </Modal>
          <Modal
            show={showModalFee}
            onHide={() => setShowModalFee(false)}
            size="xl"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Class Fee Report</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {renderClassFeeExpandedView()}
            </Modal.Body>
          </Modal>
          <Modal show={showModalNotifications} onHide={() => setShowModalNotifications(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>{selectedNotification?.subject || 'Notification'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {/* Date as small heading */}
              {/* Date */}
              <p style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '4px' }}>
                <strong>Date:</strong> {getDateLabel(selectedNotification?.createddate)}
              </p>

              {/* Subject */}
              <p style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '4px' }}>
                <strong>Subject:</strong> {selectedNotification?.subject || 'No Subject'}
              </p>

              {/* Description */}
              <p style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '4px' }}>
                <strong>Description:</strong> {selectedNotification?.description || 'No description available.'}
              </p>


              {/* File Preview (PDF or Image) */}
              {selectedNotification?.image_path?.endsWith('.pdf') && (
                <div className="mb-3">
                  <iframe
                    src={`${baseUrl}/uploads/get-image/${selectedNotification.image_path}`}
                    title="PDF Viewer"
                    width="100%"
                    height="400px"
                    style={{ border: '1px solid #ccc', borderRadius: '6px' }}
                  />
                </div>
              )}

              {/\.(jpg|jpeg|png|gif)$/i.test(selectedNotification?.image_path || '') && (
                <div className="mb-2 text-center">
                  <img
                    src={`${baseUrl}/uploads/get-image/${selectedNotification.image_path}`}
                    alt="Notification Attachment"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  />
                </div>
              )}
            </Modal.Body>




          </Modal>


        </>
      </div>
    </div>
  );
};

export default Dashboard;
