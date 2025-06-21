import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2"; 
import { Container, Button,OverlayTrigger} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Tooltip,  } from "@mui/material";
import { ToastContainer, toast } from 'react-toastify';
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { fetchDataRead } from "../../Utility";
import loading from "../../assets/images/common/loading.gif";
import DataTable from "react-data-table-component";
import dayjs from "dayjs";


const StudentAttendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [classes, setClasses] = useState([])
    const [filteredSections, setFilteredSections] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const navigate = useNavigate();
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [sections, setSections] = useState([])
    const [dates, setDates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const userData = sessionStorage.getItem('user');
    const [holidays, setHolidays] = useState([]);
    const userObj = userData ? JSON.parse(userData) : {};
    const getDaysInMonth = (month, year = new Date().getFullYear()) => {
        const monthIndex = parseInt(month, 10) - 1; // Convert "01" to 0-based index
        return new Date(year, monthIndex + 1, 0).getDate();
    };
    useEffect(() => {
        fetchDataRead("/StudentAttendance/", setAttendanceData, userObj.school_id)
        fetchDataRead("/Sections", setSections, userObj.school_id)
        fetchDataRead("/classes", setClasses, userObj.school_id)
        fetchDataRead("/holiday", setHolidays, userObj.school_id)
        fetchDataRead("/AcademicYear", setAcademicYears, userObj.school_id)
    }, []);
    const groupedAttendance = attendanceData.reduce((acc, record) => {
        const studentId = record.student_id;
        const attendanceDate = dayjs(record.attendace_date).format("YYYY-MM-DD");
        if (!acc[studentId]) {
            acc[studentId] = {
                student_id: studentId,
                student_name: record.student_name,
                attendance: {}
            };
        }
        acc[studentId].attendance[attendanceDate] = {
            attendance_id: record.attendance_id,
            is_present: record.is_present,
            school_id: record.school_id
        };
        return acc;
    }, {});
    const formattedData = Object.values(groupedAttendance);
    const columns = [
        {
            name: <span style={{ backgroundColor: "#0D6EFD", color: "white" }}>Name</span>,
            selector: row => row.student_name,
            cell: row => (
                <Tooltip title={row.student_name} arrow placement="top">
                    <span className="custom-table-without-padding" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {row.student_name}
                    </span>
                </Tooltip>
            ),
            sortable: true,
            width: "150px", 
            style: {position: "sticky",left: 0,
                background: "#fff",  zIndex: 2,  paddingLeft: "0px",  minWidth: "150px",  
            }
        },
        ...dates.map(date => {
            const isSunday = dayjs(date).day() === 0;
            const formattedHolidays = (holidays || []).map(holiday =>
                holiday?.holiday_date ? dayjs(holiday.holiday_date).format("YYYY-MM-DD") : null
            );
            const isHoliday = formattedHolidays.includes(dayjs(date).format("YYYY-MM-DD"));
       return {
                name: (
                    <div style={{
                        textAlign: "center", fontSize: "14px", fontWeight: "bold", paddingLeft: "0px",
                        paddingright: "10px"
                    }}>
                        <div>{dayjs(date).format("D")}</div>
                        <div>
                            {dayjs(date).format("dddd") === "Saturday"
                                ? "Sa"
                                : dayjs(date).format("dd")[0]}
                        </div>
                    </div>
                ),
                selector: row => row.attendance[date] || false,
                cell: row => (
                    <div style={{ textAlign: "center", position: "relative" }}>
                        {(isSunday || isHoliday) ? (
                            <Tooltip title="Holiday" arrow placement="top">
                                <span style={{ color: "gray", fontWeight: "bold" }}>H</span>
                            </Tooltip>
                        ) : row.attendance[date] ? (
                            row.attendance[date].is_present ? (
                                <Tooltip title="Present" arrow placement="top">
                                    <span
                                        style={{ color: "#0285FF", fontSize: "18px", cursor: "pointer" }}
                                        onClick={() => handleStatusToggle(
                                            row.attendance[date].attendance_id,
                                            row.student_id,
                                            date,
                                            row.attendance[date].is_present,
                                            row.attendance[date].school_id
                                        )}
                                    >
                                        ✔
                                    </span>
                                </Tooltip>
                            ) : (
                                <Tooltip title="Absent" arrow placement="top">
                                    <span
                                        style={{ color: "red", fontSize: "18px", cursor: "pointer" }}
                                        onClick={() => handleStatusToggle(
                                            row.attendance[date].attendance_id,
                                            row.student_id,
                                            date,
                                            row.attendance[date].is_present,
                                            row.attendance[date].school_id
                                        )}
                                    >
                                        ✘
                                    </span>
                                </Tooltip>
                            )
                        ) : (
                            <div
                                style={{ display: "flex", justifyContent: "center", cursor: "pointer", position: "relative" }}
                                onMouseEnter={(e) => e.currentTarget.querySelector(".attendance-options").style.display = "flex"}
                                onMouseLeave={(e) => e.currentTarget.querySelector(".attendance-options").style.display = "none"}
                            >
                                <Tooltip title="Mark Attendance" arrow placement="top">
                                    <span style={{ color: "#aaa", fontSize: "18px" }}>+</span>
                                </Tooltip>
                                <div
                                    className="attendance-options"
                                    style={{display: "none",position: "absolute",top: "-5px",left: "50%",
                                        transform: "translateX(-50%)",gap: "5px",background: "white",padding: "3px 8px",borderRadius: "5px",
                                        boxShadow: "0 0 5px rgba(0, 0, 0, 0.2)"
                                    }}
                                >
                                    <span
                                        style={{ color: "green", fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}
                                        onClick={() => handleCreateRecord(row, date, true)}
                                    >
                                        P
                                    </span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    <span
                                        style={{ color: "red", fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}
                                        onClick={() => handleCreateRecord(row, date, false)}
                                    >
                                        A
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ),
                center: true,
                width: "55px",
            };
        })
    ];
    const fetchStudentDetails = async (student_id) => {
        try {
            const response = await axios.post(`${baseUrl}/students/`, {
                action: "FILTER",
                student_id: student_id
            });

            if (response.status >= 200 && response.status < 300) {
                const students = response.data;
                if (students.length === 0) {
                    throw new Error("Student not found");
                }
                return students[0]; // Assuming API returns a list
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error fetching student details:", error);
            toast.error("Failed to fetch student details");
            return null;
        }
    };
    const handleCreateRecord = async (row, date, is_present) => {
        try {
            let absent_reason = "";
            if (!is_present) {
                const { value } = await Swal.fire({
                    title: "Select Reason for Absence",
                    input: "select",
                    inputOptions: {
                        sick: "Sick",
                        approved_leave: "Approved Leave",
                        not_informed: "Not Informed",
                        personal_work: "Personal Work",
                        emergency: "Emergency"
                    },
                    inputPlaceholder: "Choose a reason...",
                    showCancelButton: true,
                    confirmButtonText: "Submit",
                    cancelButtonText: "Cancel",
                    inputValidator: (value) => {
                        if (!value) return "You must select a reason!";
                    },
                    allowOutsideClick: true,
                    allowEscapeKey: false,
                    customClass: {
                        popup: "swal-custom-popup",
                        title: "swal-custom-title",
                        input: "swal-custom-select",
                        confirmButton: "swal-custom-confirm",
                        cancelButton: "swal-custom-cancel"
                    }
                });

                if (!value) return;
                absent_reason = value;
            }
        const studentDetails = await fetchStudentDetails(row.student_id);
            if (!studentDetails) {
                toast.error("Unable to get student details");
                return;
            }
            const requestBody = {
                attendance_id: 0,
                student_id: row.student_id,
                attendace_date: date,
                is_present: is_present,
                absent_reason: is_present ? null : absent_reason, 
                academic_year_id: userObj.academic_year_id,
                section_id: studentDetails.section_id,
                class_id: studentDetails.class_id,
                school_id: userObj.school_id,
                action: "CREATE"
            };
            const response = await axios.post(`${baseUrl}/StudentAttendance/`, requestBody, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status >= 200 && response.status < 300) {
                toast.success(`Attendance marked as ${is_present ? "Present" : "Absent"} successfully`);
                datarefresh();
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to create attendance record");
        }
    };
    const searchableColumns = [
        row => row.student_name,
        row => row.academic_year_name,
        row => row.attendace_date,
        row => row.is_present,
        row => row.absent_reason
    ];
    const filteredRecords = (formattedData || []).filter((Attendance) =>
        searchableColumns.some((selector) => {
            const value = selector(Attendance);
            return String(value || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        })
    );
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
    const [filter, setFilter] = useState({
        student_id: 0,
        student_name: "",
        section_id: 0,
        class_id: 0,
        academic_year_id: 0,
        month: currentMonth,
        school_id: 0,
        action: "FILTER",
    });
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name === "class_id") {
            const selectedClassId = parseInt(value, 10);
            const updatedSections = sections.filter(section => section.class_id === selectedClassId);
            setFilteredSections(updatedSections);
            setFilter(prev => ({ ...prev, class_id: selectedClassId, section_id: "" }));
        } else {
            setFilter(prev => ({ ...prev, [name]: value }));
        }
    };
    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setIsSubmitted(true);
        const formData = {
            student_id: filter.student_id || 0,
            student_name: filter.student_name || "",
            section_id: filter.section_id || 0,
            class_id: filter.class_id || 0,
            academic_year_id: 0,
            school_id: userObj.school_id,
            month: filter.month || "",
            action: "FILTER",
        };
        try {
            const response = await axios.post(`${baseUrl}/StudentAttendance/`, formData, {
                headers: { "Content-Type": "application/json" },
            });
            const filterData = response.data || [];
            setAttendanceData(filterData);
            if (filterData.length === 0) {
                toast.info("No attendance records found for the selected filters");
            } else {
                const systemYear = new Date().getFullYear();
                const totalDays = getDaysInMonth(filter.month, systemYear);
                const monthDates = Array.from({ length: totalDays }, (_, i) =>
                    dayjs(`${systemYear}-${filter.month}-${String(i + 1).padStart(2, "0")}`).format("YYYY-MM-DD")
                );
                setDates(monthDates);
            }
        } catch (error) {
            console.error("Error fetching attendance data:", error);
            if (error.response) {
                if (error.response.status === 404) {
                    setAttendanceData([]);
                } else {
                    toast.error(`Failed to fetch attendance data: ${error.response.data.detail || "Unknown error"}`);
                }
            } else {
                toast.error("Network error or server is unreachable");
            }
        } finally {
            setIsLoading(false);
        }
    };
    const handleFilterClear = async () => {
        setFilter({ student_id: 0, student_name: "", section_id: "", class_id: "", month: "", action: "FILTER" });
        setIsLoading(true);
        try {
            const data = await fetchDataRead("/StudentAttendance/", setAttendanceData, userObj.school_id);

            if (!data || data.length === 0) {
                setAttendanceData([]);
            }
        } catch (error) {
            console.error("Error fetching attendance data:", error);
            toast.error("Failed to load attendance records");
        } finally {
            setIsLoading(false);
        }
    };
    async function datarefresh() {
        const formData = {
            student_id: filter.student_id || 0,
            student_name: filter.student_name || "",
            section_id: filter.section_id || 0,
            class_id: filter.class_id || 0,
            academic_year_id: userObj.academic_year_id,
            school_id: userObj.school_id,
            month: filter.month || "",
            action: "FILTER",
        };
        try {
            const response = await axios.post(`${baseUrl}/StudentAttendance/`, formData, {
                headers: { "Content-Type": "application/json" },
            });
            const filterData = response.data || [];
            setAttendanceData(filterData);
            if (filterData.length === 0) {
                toast.info("No attendance records found for the selected filters");
            } else {
                const systemYear = new Date().getFullYear();
                const totalDays = getDaysInMonth(filter.month, systemYear);
                const monthDates = Array.from({ length: totalDays }, (_, i) =>
                    dayjs(`${systemYear}-${filter.month}-${String(i + 1).padStart(2, "0")}`).format("YYYY-MM-DD")
                );
                setDates(monthDates);
            }   
        } catch (error) {
            console.error("Error fetching attendance data:", error);
            if (error.response) {
                if (error.response.status === 404) {
                    setAttendanceData([]);
                } else {
                    toast.error(`Failed to fetch attendance data: ${error.response.data.detail || "Unknown error"}`);
                }
            } else {
                toast.error("Network error or server is unreachable");
            }
        } finally {
            setIsLoading(false);
        }
    }
    const handleSearchChange = (event) => {
        fetchDataRead("/StudentAttendance", setAttendanceData, userObj.school_id);
        setSearchQuery(event.target.value);
    };
    useEffect(() => {
        setIsLoading(true);
        fetchDataRead("/StudentAttendance/", setAttendanceData, userObj.school_id).finally(() => setIsLoading(false));
    }, []);

    const handleStatusToggle = async (attendance_id, student_id, attendance_date, currentStatus, school_id) => {
        const newStatus = !currentStatus;
        const requestBody = {
            attendance_id,
            student_id,
            attendance_date,
            is_present: newStatus,
            school_id,
            action: "UPDATE"
        };

        try {
            const response = await axios.post(baseUrl + "/StudentAttendance/", requestBody, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status >= 200 && response.status < 300) {
                toast.success("Attendance updated successfully");

                datarefresh();
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error("Failed to update attendance");
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

                                <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                                    <h6 className="commonTableTitle">Attendance</h6>
                                </div>
                                <div className="">
                                    <input  type="text"  placeholder="Search..."  value={searchQuery}  className="searchInput"  onChange={handleSearchChange}  />
                                </div>                             
                                <div className="d-flex align-items-center" style={{ gap: 6 }}>
                                <div className="fileUpload" style={{ gap: 6, }}>
                                        <input  type="file"  accept=".xlsx, .xls"    className="form-control form-control-sm commonFileUpload"   />
                                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Upload Excel</Tooltip>}>
                                            <Button className="btn primaryBtn">  <span>Upload</span>  </Button> 
                                        </OverlayTrigger>
                                    </div> 
                                </div>
                            </div>
                        </div>
                        <form onSubmit={handleFilterSubmit} className="mb-3 d-flex align-items-center" style={{ gap: "15px" }}>
                            <div className="d-flex align-items-center gap-2">
                                <label htmlFor="class_id" className="form-label mb-0 fs-7">Year:</label>
                                <select  id="academic_year_id"
                                    name="academic_year_id"className="form-select form-select-sm w-auto"value={filter.academic_year_id}onChange={handleFilterChange}
                                >
                                    <option value="0" disabled hidden>
                                        {userObj.academic_year_name}
                                    </option>
                                    {(academicYears || []).map((aca) => (
                                        <option key={aca.academic_year_id} value={aca.academic_year_id}> {aca.academic_year_name} </option>
                                    ))}
                                </select>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <label htmlFor="class_id" className="form-label mb-0 fs-7">Class:</label>
                                <select className="form-select form-select-sm w-auto"
                                    id="class_id" name="class_id" value={filter.class_id} onChange={handleFilterChange}>
                                    <option value="">Select Class</option>
                                    {(classes || [])
                                        .filter((cls) => cls.is_active === "Active") 
                                        .map((cls) => (
                                            <option key={cls.class_id} value={cls.class_id}>    {cls.class_name}   </option>  ))}
                                </select>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <label htmlFor="section_id" className="form-label mb-0 fs-7">Section:</label>
                                <select  className="form-select form-select-sm w-auto" 
                                   id="section_id" name="section_id"  value={filter.section_id}  onChange={handleFilterChange}  disabled={!filter.class_id} 
                                >
                                    <option value="">Select Section</option>
                                    {(filteredSections || [])
                                        .filter((section) => section.is_active === "Active") 
                                        .map((section) => (
                                            <option key={section.section_id} value={section.section_id}>  {section.section_name}   </option>))}
                                </select>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <label htmlFor="month" className="form-label mb-0 fs-9">Month:</label>
                                <select
                                  id="month"   name="month" className="form-select form-select-sm w-auto" value={filter.month} onChange={handleFilterChange}
                                >
                                    <option value="">Select Month</option>
                                    {[
                                        "January", "February", "March", "April", "May", "June",
                                        "July", "August", "September", "October", "November", "December"
                                    ].map((month, index) => {
                                        const currentMonth = new Date().getMonth(); // 0-based
                                        const monthValue = String(index + 1).padStart(2, "0");
                                        return (
                                            <option key={index} value={monthValue} disabled={index > currentMonth}>  {month}  </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div style={{ display: "flex", gap: "4px" }}>
                                <div className="d-flex align-items-center">
                                    <button type="submit" className="btn btn-primary primaryBtn me-2">Submit</button>
                                    <button type="button" className="btn btn-danger secondaryBtn" onClick={handleFilterClear}>
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </form>
                        <div className="commonTable height100">
                            <div className="tableBody">
                                {isLoading ? (
                                    <div className="loadingContainer">
                                        <img src={loading} alt="Loading..." className="loadingGif" />
                                    </div>
                                ) : !isSubmitted ? (
                                    <div className="noDataMessage text-muted text-center py-4">
                                        <i className="bi bi-info-circle me-2"></i>
                                        Please submit filters to view attendance data.
                                    </div>
                                ) : attendanceData.length > 0 ? (
                                    <DataTable
                                        className="custom-table custom-scroll"
                                        columns={columns}
                                        data={filteredRecords}
                                        pagination
                                        highlightOnHover
                                        responsive
                                        fixedHeader
                                        fixedHeaderScrollHeight="calc(100vh - 170px)"
                                    />
                                ) : (
                                    <div className="noDataMessage">No records found</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default StudentAttendance;