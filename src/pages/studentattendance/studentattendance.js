import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Table, Container, Button, OverlayTrigger, Form, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Tooltip, } from "@mui/material";
import { ToastContainer, toast } from 'react-toastify';
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { fetchDataRead } from "../../Utility";
import loading from "../../assets/images/common/loading.gif";
import DataTable from "react-data-table-component";
import Modal from 'react-bootstrap/Modal';
import DatePicker from 'react-datepicker'; // make sure to install: npm i react-datepicker
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from "dayjs";

const StudentAttendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [classes, setClasses] = useState([])
    const [selectedAbsentReason, setSelectedAbsentReason] = useState("");

    const [selectAllMorning, setSelectAllMorning] = useState(false);
    const [selectAllAfternoon, setSelectAllAfternoon] = useState(false);
    const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
    const [selectedDateForModal, setSelectedDateForModal] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [showAttendanceEditModal, setShowAttendanceEditModal] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);

    const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);

    const [filteredSections, setFilteredSections] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const navigate = useNavigate();
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [sections, setSections] = useState([])
    const [absentReasons, setAbsentReasons] = useState({});
    const [dates, setDates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const today = dayjs().format("YYYY-MM-DD");
    const userData = sessionStorage.getItem('user');
    const [holidays, setHolidays] = useState([]);
    const userObj = userData ? JSON.parse(userData) : {};
    const [showTakeAttendanceModal, setShowTakeAttendanceModal] = useState(false);
    const [attendanceClassId, setAttendanceClassId] = useState("");
    const [attendanceSectionId, setAttendanceSectionId] = useState("");
    const [attendanceDate, setAttendanceDate] = useState(new Date());
    const [students, setStudents] = useState([]);
    const [showStudentsTable, setShowStudentsTable] = useState(false);
    // Count students who were present in morning and afternoon
    const morningPresentCount = attendanceData.filter(a => a.attendance_status === 1 || a.attendance_status === 3).length;
    const afternoonPresentCount = attendanceData.filter(a => a.attendance_status === 2 || a.attendance_status === 3).length;

    const [modalSections, setModalSections] = useState([]);
    const role = userObj?.role_name?.toLowerCase();
    const readOnlyRoles = ["Teacher"];
    const canSubmit = !readOnlyRoles.includes(userObj.role_name?.trim());
    const getDaysInMonth = (month, year = new Date().getFullYear()) => {
        const monthIndex = parseInt(month, 10) - 1; // Convert "01" to 0-based index
        return new Date(year, monthIndex + 1, 0).getDate();
    };
    const handleSelectAllMorning = () => {
        const newValue = !selectAllMorning;
        setSelectAllMorning(newValue);
        const updated = students.map((s) => ({
            ...s,
            morning_present: newValue
        }));
        setStudents(updated);
    };

    const handleSelectAllAfternoon = () => {
        const newValue = !selectAllAfternoon;
        setSelectAllAfternoon(newValue);
        const updated = students.map((s) => ({
            ...s,
            afternoon_present: newValue
        }));
        setStudents(updated);
    };


    const fetchabsentreasons = async () => {
        try {
            const response = await axios.post(baseUrl + "/absentreason/", {
                action: "READ",
            });
            const mappedReasons = {};
            (response.data || []).forEach(item => {
                mappedReasons[item.absent_reason_id] = item.absent_reason;
            });
            setAbsentReasons(mappedReasons); // used by Swal

        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

    useEffect(() => {
        // fetchDataRead("/StudentAttendance/", setAttendanceData, userObj.school_id)
        fetchDataRead("/Sections/", setSections, userObj.school_id)
        fetchDataRead("/classes/", setClasses, userObj.school_id)
        fetchDataRead("/holiday/", setHolidays, userObj.school_id)
        fetchDataRead("/AcademicYear/", setAcademicYears, userObj.school_id)
        fetchabsentreasons();
    }, []);

    const groupedAttendance = attendanceData.reduce((acc, record) => {
        const studentId = record.student_id;
        const attendanceDate = dayjs(record.attendace_date).format("YYYY-MM-DD");
        if (!acc[studentId]) {
            acc[studentId] = {
                student_id: studentId,
                student_name: record.student_name, current_month_count: record.current_month_count,
                up_to_last_month_count: record.up_to_last_month_count,
                Total: record.current_month_count + record.up_to_last_month_count,

                attendance: {}
            };
        }
        acc[studentId].attendance[attendanceDate] = {
            attendance_id: record.attendance_id,
            is_present: record.is_present,
            attendance_status: record.attendance_status,

            school_id: record.school_id


        };
        return acc;
    }, {});
    const formattedData = Object.values(groupedAttendance);
    console.log(formattedData);


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
            style: {
                position: "sticky", left: 0,
                background: "#fff", zIndex: 2, paddingLeft: "0px", minWidth: "150px",
            }
        },

        ...dates.map(date => {
            const formattedDate = dayjs(date).format("YYYY-MM-DD");
            const isSunday = dayjs(date).day() === 0;
            const isHoliday = (holidays || []).some(holiday =>
                dayjs(holiday?.holiday_date).format("YYYY-MM-DD") === formattedDate
            );


            // console.log(`Date: ${formattedDate}, Today: ${today}, Role: ${role}, Can Show Mark Option: ${canShowMarkOption}`);

            return {
                name: (
                    <div style={{
                        textAlign: "center", fontSize: "14px", fontWeight: "bold", paddingLeft: "0px",
                        paddingRight: "10px"
                    }}>
                        <div>{dayjs(date).format("D")}</div>
                        <div>
                            {dayjs(date).format("dddd") === "Saturday"
                                ? "Sa"
                                : dayjs(date).format("dd")[0]}
                        </div>
                    </div>
                ),
                selector: row => row.attendance[formattedDate] || false,
                cell: row => {
                    const data = row.attendance[formattedDate];
                    // console.log(data);


                    return (
                        <div style={{ textAlign: "center", position: "relative" }}>
                            {(isSunday || isHoliday) ? (
                                <Tooltip title="Holiday" arrow placement="top">
                                    <span style={{ color: "gray", fontWeight: "bold" }}>H</span>
                                </Tooltip>
                            ) : data ? (
                                <Tooltip
                                    title={
                                        data.attendance_status === 1 ? "Morning Present" :
                                            data.attendance_status === 2 ? "Afternoon Present" :
                                                data.attendance_status === 3 ? "Present" :
                                                    data.attendance_status === 4 ? "Absent" : "Unknown"
                                    }
                                    arrow
                                    placement="top"
                                >
                                    <span
                                        style={{ fontWeight: "bold", cursor: "pointer" }}
                                        onClick={() => {
                                            setSelectedStudentForModal(row);
                                            setSelectedStudentId(row.student_id);
                                            setSelectedDateForModal(formattedDate);
                                            setSelectedStatus(data.attendance_status);
                                            setSelectedAttendanceId(data.attendance_id);
                                            setSelectedAbsentReason(data.absent_reason || ""); // ✅ Add this
                                            setShowAttendanceEditModal(true);
                                        }}


                                    >
                                        {(() => {
                                            const statusText = {
                                                1: "P/A",
                                                2: "A/P",
                                                3: "P",
                                                4: "A"
                                            }[data.attendance_status] || "–";

                                            return statusText.split("").map((char, index) => (
                                                <span
                                                    key={index}
                                                    style={{
                                                        color:
                                                            char.toUpperCase() === "A" ? "red" :
                                                                char.toUpperCase() === "P" ? "#198754" : "#000",
                                                        fontWeight: "10px"
                                                    }}
                                                >
                                                    {char}
                                                </span>
                                            ));
                                        })()}
                                    </span>
                                </Tooltip>
                            ) : (
                                <span style={{ color: "#ccc" }}>–</span>
                            )}
                        </div>
                    );


                },
                center: true,
                width: "55px",
            };
        }),
        {
            name: "Upto Last Month",
            selector: row => row.up_to_last_month_count || "",
            cell: row => <span>{row.up_to_last_month_count || "-"}</span>,
            width: "150px",
            center: true

        },
        {
            name: "Present Month",
            selector: row => row.current_month_count || "",
            cell: row => <span>{row.current_month_count || "-"}</span>,
            width: "100px",
            center: true
        },
        {
            name: "Total",
            selector: row => row.Total || "",
            cell: row => <span>{row.Total || "-"}</span>,
            width: "200px",
            center: true
        }

    ];

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

            section_id: filter.section_id || 0,
            class_id: filter.class_id || 0,
            academic_year_id: userObj.academic_year_id,
            school_id: userObj.school_id,
            month_name: filter.month || "",
            action: "FILTER",
        };
        try {
            const response = await axios.post(`${baseUrl}/StudentAttendancefilter/`, formData, {
                headers: { "Content-Type": "application/json" },
            });
            const filterData = response.data || [];
            setAttendanceData(filterData);
            if (filterData.length === 0) {
                toast.info("No attendance records found for the selected filters");
            }
            else {
                const monthIndex = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ].indexOf(filter.month);

                const systemYear = monthIndex >= 5 ? new Date().getFullYear() - 1 : new Date().getFullYear();
                const totalDays = getDaysInMonth(monthIndex + 1, systemYear); // monthIndex + 1 because it's 1-based

                const monthDates = Array.from({ length: totalDays }, (_, i) =>
                    dayjs(`${systemYear}-${String(monthIndex + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`).format("YYYY-MM-DD")
                );
                setDates(monthDates);

            }
            // else {
            //     // Update dates *only if* data exists
            //     const monthIndex = [
            //         "January", "February", "March", "April", "May", "June",
            //         "July", "August", "September", "October", "November", "December"
            //     ].indexOf(filter.month);

            //     const systemYear = monthIndex >= 5 ? new Date().getFullYear() - 1 : new Date().getFullYear();
            //     const totalDays = getDaysInMonth(monthIndex + 1, systemYear);

            //     const monthDates = Array.from({ length: totalDays }, (_, i) =>
            //         dayjs(`${systemYear}-${filter.month}-${String(i + 1).padStart(2, "0")}`).format("YYYY-MM-DD")
            //     );
            //     setDates(monthDates);
            // }
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
    // const handleFilterClear = async () => {
    //     setFilter({ student_id: 0, student_name: "", section_id: "", class_id: "", month: "" });
    //     setAttendanceData([]);

    //     // setIsLoading(true);
    //     // try {
    //     //     const data = await fetchDataRead("/StudentAttendance/", setAttendanceData, userObj.school_id);

    //     //     if (!data || data.length === 0) {
    //     //         setAttendanceData([]);
    //     //     }
    //     // } catch (error) {
    //     //     console.error("Error fetching attendance data:", error);
    //     //     toast.error("Failed to load attendance records");
    //     // } finally {
    //     //     setIsLoading(false);
    //     // }
    // };
    const handleFilterClear = async () => {
        setFilter({
            student_id: 0,
            student_name: "",
            section_id: "",
            class_id: "",
            month: ""
        });

        setAttendanceData([]);
        setDates([]);
        setIsSubmitted(false);
    };

    async function datarefresh() {
        const formData = {

            section_id: filter.section_id || 0,
            class_id: filter.class_id || 0,
            academic_year_id: userObj.academic_year_id,
            school_id: userObj.school_id,
            month_name: filter.month || "",
            action: "FILTER",
        };
        try {
            const response = await axios.post(`${baseUrl}/StudentAttendancefilter/`, formData, {
                headers: { "Content-Type": "application/json" },
            });
            const filterData = response.data || [];
            setAttendanceData(filterData);
            if (filterData.length === 0) {
                toast.info("No attendance records found for the selected filters");
            }
            else {
                const monthIndex = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ].indexOf(filter.month);

                const systemYear = monthIndex >= 5 ? new Date().getFullYear() - 1 : new Date().getFullYear();
                const totalDays = getDaysInMonth(monthIndex + 1, systemYear); // monthIndex + 1 because it's 1-based

                const monthDates = Array.from({ length: totalDays }, (_, i) =>
                    dayjs(`${systemYear}-${String(monthIndex + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`).format("YYYY-MM-DD")
                );
                setDates(monthDates);

            }
            // else {
            //     // Update dates *only if* data exists
            //     const monthIndex = [
            //         "January", "February", "March", "April", "May", "June",
            //         "July", "August", "September", "October", "November", "December"
            //     ].indexOf(filter.month);

            //     const systemYear = monthIndex >= 5 ? new Date().getFullYear() - 1 : new Date().getFullYear();
            //     const totalDays = getDaysInMonth(monthIndex + 1, systemYear);

            //     const monthDates = Array.from({ length: totalDays }, (_, i) =>
            //         dayjs(`${systemYear}-${filter.month}-${String(i + 1).padStart(2, "0")}`).format("YYYY-MM-DD")
            //     );
            //     setDates(monthDates);
            // }
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
        fetchDataRead("/StudentAttendance/", setAttendanceData, userObj.school_id);
        setSearchQuery(event.target.value);
    };
    // useEffect(() => {
    //     setIsLoading(true);
    //     fetchDataRead("/StudentAttendance/", setAttendanceData, userObj.school_id).finally(() => setIsLoading(false));
    // }, []);

    const handleSubmitAttendance = async () => {
        try {
            const payload = {
                student_id: students.map(s => s.student_id),
                attendance_status: students.map(s => {
                    if (s.morning_present && s.afternoon_present) return 3;
                    if (s.morning_present && !s.afternoon_present) return 1;
                    if (!s.morning_present && s.afternoon_present) return 2;
                    return 4;
                }),
                absent_reason: students.map(s => {
                    const isAbsent = !s.morning_present || !s.afternoon_present;
                    return isAbsent ? (s.absent_reason?.trim() || "") : "";
                }),

                attendance_date: dayjs(attendanceDate).format("YYYY-MM-DD"),
                academic_year_id: userObj.academic_year_id,
                class_id: attendanceClassId,
                section_id: attendanceSectionId,

            };



            const response = await axios.post(`${baseUrl}/teacherapp/student_attendance_bulk/`, payload);
            if (response.status === 200) {
                toast.success("Attendance submitted successfully!");

                setStudents([]);
                handleCloseTakeAttendanceModal();
                datarefresh();
            } else {
                throw new Error("Submission failed");
            }
        } catch (error) {
            console.error("Submit Error:", error);
            toast.error("Failed to submit attendance.");
        }
    };




    const handleGetStudents = async () => {
        try {
            const studentsResponse = await axios.post(`${baseUrl}/students/`, {
                action: "FILTER",
                class_id: attendanceClassId,
                section_id: attendanceSectionId,
                school_id: userObj.school_id,
                academic_year_id: userObj.academic_year_id,
                status: 'Active'
            });

            const studentsData = studentsResponse.data || [];

            if (!Array.isArray(studentsData) || studentsData.length === 0) {
                toast.info("No students found for the selected class and section.");
                setStudents([]);
                setShowStudentsTable(false);
                return;
            }

            // Fetch attendance records for the date
            let attendanceMap = {};
            try {
                const attendanceResponse = await axios.post(`${baseUrl}/StudentAttendance/`, {
                    action: "FILTER",
                    class_id: attendanceClassId,
                    section_id: attendanceSectionId,
                    academic_year_id: userObj.academic_year_id,
                    school_id: userObj.school_id,
                    attendace_date: dayjs(attendanceDate).format("YYYY-MM-DD"),
                });

                const attendanceData = attendanceResponse.data || [];
                attendanceMap = attendanceData.reduce((map, record) => {
                    map[record.student_id] = {
                        attendance_status: record.attendance_status,
                        absent_reason: record.absent_reason || ""
                    };
                    return map;
                }, {});
            } catch (error) {
                console.warn("Attendance fetch error:", error.message);
            }

            // Map attendance info into students
            const initializedStudents = studentsData.map(student => {
                const attendance = attendanceMap[student.student_id] || {};
                const status = attendance.attendance_status;

                return {
                    ...student,
                    morning_present: status === 1 || status === 3,
                    afternoon_present: status === 2 || status === 3,
                    absent_reason: attendance.absent_reason || "" // <-- holds the reason
                };
            });

            setStudents(initializedStudents);
            setShowStudentsTable(true);

        } catch (error) {
            console.error("Error fetching students or attendance:", error);
            toast.error("Failed to fetch students or attendance.");
            setShowStudentsTable(false);
        }
    };

    const handleUpdateAttendance = async (
        studentId,
        attendanceDate,
        attendanceStatus,
        attendanceId,
        absentReason
    ) => {
        try {
            const payload = {
                attendance_id: attendanceId,
                student_id: studentId,
                attendace_date: attendanceDate,
                attendance_status: attendanceStatus,
                absent_reason: selectedStatus !== 3 ? absentReason : null,
                school_id: userObj.school_id,
                academic_year_id: userObj.academic_year_id,
                action: "UPDATE"
            };

            const response = await axios.post(`${baseUrl}/StudentAttendance/`, payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status >= 200 && response.status < 300) {
                toast.success("Attendance updated successfully");
                setShowAttendanceEditModal(false);
                datarefresh();
            } else {
                throw new Error("Failed to update attendance");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update attendance");
        }
    };




    const handleOpenTakeAttendanceModal = () => {
        setShowTakeAttendanceModal(true);
    };

    const handleCloseTakeAttendanceModal = () => {
        setShowTakeAttendanceModal(false);
        setAttendanceClassId("");
        setAttendanceSectionId("");
        setAttendanceDate(new Date());
        setModalSections([]);
        setStudents([]);
    };

    const handleClassChangeForModal = (e) => {
        const classId = parseInt(e.target.value);
        setAttendanceClassId(classId);
        const updated = sections.filter(sec => sec.class_id === classId);
        setModalSections(updated);
    };
    const toggleAttendance = (index, field) => {
        const updated = [...students];
        updated[index][field] = !updated[index][field];
        setStudents(updated);

        // Recalculate selectAllMorning
        const allMorning = updated.every(s => s.morning_present);
        setSelectAllMorning(allMorning);

        // Recalculate selectAllAfternoon
        const allAfternoon = updated.every(s => s.afternoon_present);
        setSelectAllAfternoon(allAfternoon);
    };

    const attendanceSummaryByDate = {};

    dates.forEach(date => {
        const formattedDate = dayjs(date).format("YYYY-MM-DD");
        const morningCount = attendanceData.filter(
            a => dayjs(a.attendace_date).format("YYYY-MM-DD") === formattedDate &&
                (a.attendance_status === 1 || a.attendance_status === 3)
        ).length;

        const afternoonCount = attendanceData.filter(
            a => dayjs(a.attendace_date).format("YYYY-MM-DD") === formattedDate &&
                (a.attendance_status === 2 || a.attendance_status === 3)
        ).length;

        attendanceSummaryByDate[formattedDate] = {
            morning: morningCount,
            afternoon: afternoonCount
        };
    });


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
                                    <input type="text" placeholder="Search..." value={searchQuery} className="searchInput" onChange={handleSearchChange} />
                                </div>
                                {/* <div className="d-flex align-items-center" style={{ gap: 6 }}>
                                    <div className="fileUpload" style={{ gap: 6, }}>
                                        <input type="file" accept=".xlsx, .xls" className="form-control form-control-sm commonFileUpload" />
                                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Upload Excel</Tooltip>}>
                                            <Button className="btn primaryBtn">  <span>Upload</span>  </Button>
                                        </OverlayTrigger>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                        <form onSubmit={handleFilterSubmit} className="mb-3 d-flex align-items-center" style={{ gap: "15px" }}>
                            <div className="d-flex align-items-center gap-2">
                                <label className="form-label mb-0 fs-7">Year:</label>
                                <div className="fw-bold">{userObj.academic_year_name}</div>
                            </div>

                            <div className="d-flex align-items-center gap-1">
                                <label htmlFor="class_id" className="form-label mb-0 fs-7">Class:<span className='requiredStar'>*</span></label>
                                <select className="form-select form-select-sm w-auto"
                                    id="class_id" name="class_id" value={filter.class_id} onChange={handleFilterChange}
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {(classes || [])
                                        .filter((cls) => cls.is_active === "Active")
                                        .map((cls) => (
                                            <option key={cls.class_id} value={cls.class_id}>    {cls.class_name}   </option>))}
                                </select>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <label htmlFor="section_id" className="form-label mb-0 fs-7">Section:<span className='requiredStar'>*</span></label>
                                <select className="form-select form-select-sm w-auto"
                                    id="section_id" name="section_id" value={filter.section_id} onChange={handleFilterChange} disabled={!filter.class_id} required
                                >
                                    <option value="">Select Section</option>
                                    {(filteredSections || [])
                                        .filter((section) => section.is_active === "Active")
                                        .map((section) => (
                                            <option key={section.section_id} value={section.section_id}>  {section.section_name}   </option>))}
                                </select>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                <label htmlFor="month" className="form-label mb-0 fs-9">Month:<span className='requiredStar'>*</span></label>
                                <select
                                    id="month"
                                    name="month"
                                    className="form-select form-select-sm w-auto"
                                    value={filter.month}
                                    onChange={handleFilterChange}
                                    required
                                >
                                    <option value="">Select Month</option>
                                    {[
                                        "January", "February", "March", "April", "May", "June",
                                        "July", "August", "September", "October", "November", "December"
                                    ].map((month, index) => (
                                        <option key={index} value={month}>{month}</option>
                                    ))}
                                </select>

                            </div>
                            <div style={{ display: "flex", gap: "4px" }}>
                                <div className="d-flex align-items-center">
                                    <button type="submit" className="btn btn-primary primaryBtn me-2">Submit</button>
                                    <button type="button" className="btn btn-danger secondaryBtn" onClick={handleFilterClear}>
                                        Clear
                                    </button>
                                    <Button
                                        type="button"
                                        style={{ marginLeft: "60px" }}
                                        className="btn btn-primary primaryBtn me-2"
                                        onClick={handleOpenTakeAttendanceModal}
                                        disabled={!canSubmit}
                                    >
                                        Take Attendance
                                    </Button>
                                </div>
                            </div>
                        </form>
                        <div className="commonTable height100">
                            <div className="tableBody">
                                {isSubmitted ? (
                                    isLoading ? (
                                        <div className="loaderWrapper text-center py-4">
                                            <img src={loading} alt="Loading..." width={40} />
                                            <div className="text-muted mt-2">Loading records...</div>
                                        </div>
                                    ) : attendanceData.length > 0 ? (
                                        <>
                                            <DataTable
                                                className="custom-table custom-scroll"
                                                columns={columns}
                                                data={filteredRecords}
                                                pagination
                                                highlightOnHover
                                                responsive
                                                fixedHeaderScrollHeight="300px"
                                                fixedHeader
                                            // fixedHeaderScrollHeight="calc(200vh - 170px)"
                                            />

                                            {/* ⬇️ Attendance Summary - Shown Only If Table Has Data */}
                                            <div style={{ overflowX: "auto", marginTop: "30px" }}>
                                                {/* Date Header Row */}
                                                <div style={{ display: "flex" }}>
                                                    <div style={{
                                                        width: "150px",
                                                        minWidth: "150px",
                                                        position: "sticky",
                                                        left: 0,
                                                        background: "#fff",


                                                        padding: "10px 5px",
                                                        border: "1px solid #e0e0e0",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        height: "40px"
                                                    }}>
                                                        Date →
                                                    </div>
                                                    {dates.map(date => (
                                                        <div key={`date-${date}`} style={{
                                                            width: "45px",
                                                            height: "40px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",

                                                            color: "#000",
                                                            border: "1px solid #e0e0e0",
                                                            background: "#f8f9fa"
                                                        }}>
                                                            {dayjs(date).format("DD")}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Morning Present Row */}
                                                <div style={{ display: "flex" }}>
                                                    <div style={{
                                                        width: "150px",
                                                        minWidth: "150px",
                                                        position: "sticky",
                                                        left: 0,
                                                        background: "#fff",

                                                        border: "1px solid #e0e0e0",
                                                        padding: "10px 5px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        height: "40px"
                                                    }}>
                                                        Morning Present
                                                    </div>
                                                    {dates.map(date => {
                                                        const formattedDate = dayjs(date).format("YYYY-MM-DD");
                                                        const count = attendanceSummaryByDate[formattedDate]?.morning || 0;
                                                        return (
                                                            <div key={`morning-${formattedDate}`} style={{
                                                                width: "45px",
                                                                height: "40px",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                fontWeight: "600",
                                                                color: "#0285FF",
                                                                border: "1px solid #e0e0e0"
                                                            }}>
                                                                {count}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Afternoon Present Row */}
                                                <div style={{ display: "flex" }}>
                                                    <div style={{
                                                        width: "150px",
                                                        minWidth: "150px",
                                                        position: "sticky",
                                                        left: 0,
                                                        background: "#fff",

                                                        border: "1px solid #e0e0e0",
                                                        padding: "10px 5px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        height: "40px"
                                                    }}>
                                                        Afternoon Present
                                                    </div>
                                                    {dates.map(date => {
                                                        const formattedDate = dayjs(date).format("YYYY-MM-DD");
                                                        const count = attendanceSummaryByDate[formattedDate]?.afternoon || 0;
                                                        return (
                                                            <div key={`afternoon-${formattedDate}`} style={{
                                                                width: "45px",
                                                                height: "40px",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                fontWeight: "600",
                                                                color: "#0285FF",
                                                                border: "1px solid #e0e0e0"
                                                            }}>
                                                                {count}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>


                                        </>
                                    ) : (
                                        <div className="noDataMessage">No records found</div>
                                    )
                                ) : (
                                    <div className="noDataMessage text-muted text-center py-4">
                                        <i className="bi bi-info-circle me-2"></i>
                                        Please submit filters to view attendance data.
                                    </div>
                                )}

                            </div>




                        </div>
                    </div>
                </div>
            </div>
            {canSubmit && (
                <Modal
                    show={showAttendanceEditModal}
                    onHide={() => setShowAttendanceEditModal(false)}
                    backdrop="static"
                    size="md"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Attendance</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form>
                            <Row className="mb-3">
                                <Col>
                                    <strong>Student:</strong><br />
                                    {selectedStudentForModal?.student_name || "-"}
                                </Col>
                                <Col>
                                    <strong>Date:</strong><br />
                                    {dayjs(selectedDateForModal).format("DD MMM YYYY")}
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col>
                                    <Form.Check
                                        type="checkbox"
                                        label="Morning Present"
                                        checked={selectedStatus === 1 || selectedStatus === 3}
                                        onChange={(e) => {
                                            const afternoon = selectedStatus === 2 || selectedStatus === 3;
                                            setSelectedStatus(
                                                e.target.checked
                                                    ? (afternoon ? 3 : 1)
                                                    : (afternoon ? 2 : 4)
                                            );
                                        }}
                                    />
                                </Col>
                                <Col>
                                    <Form.Check
                                        type="checkbox"
                                        label="Afternoon Present"
                                        checked={selectedStatus === 2 || selectedStatus === 3}
                                        onChange={(e) => {
                                            const morning = selectedStatus === 1 || selectedStatus === 3;
                                            setSelectedStatus(
                                                e.target.checked
                                                    ? (morning ? 3 : 2)
                                                    : (morning ? 1 : 4)
                                            );
                                        }}
                                    />
                                </Col>
                            </Row>

                            {selectedStatus !== 3 && (
                                <Row className="mb-3">
                                    <Col>
                                        <Form.Group controlId="editAbsentReasonDropdown">
                                            <Form.Label><strong>Absent Reason</strong></Form.Label>
                                            <Form.Select
                                                value={selectedAbsentReason}
                                                onChange={(e) => setSelectedAbsentReason(e.target.value)}
                                            >
                                                <option value="">Select reason</option>
                                                {Object.entries(absentReasons).map(([id, label]) => (
                                                    <option key={id} value={label}>{label}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            )}
                        </Form>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAttendanceEditModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() =>
                                handleUpdateAttendance(
                                    selectedStudentId,
                                    selectedDateForModal,
                                    selectedStatus,
                                    selectedAttendanceId,
                                    selectedAbsentReason
                                )
                            }
                        >
                            Update
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}


            <Modal
                show={showTakeAttendanceModal}
                onHide={handleCloseTakeAttendanceModal}
                backdrop="static"
                size="xl"
                style={{
                    display: 'block',
                }}
                dialogStyle={{
                    top: '5vh',
                    margin: '0 auto',
                    width: '90%',
                    position: 'absolute',
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Take Attendance</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {/* Fixed Filters */}
                        <Row className="align-items-end mb-3">
                            <Col md={3}>
                                <Form.Group className="mb-0">
                                    <Form.Label>Class<span className='requiredStar'>*</span></Form.Label>
                                    <Form.Select value={attendanceClassId} onChange={handleClassChangeForModal}>
                                        <option value="">Select Class</option>
                                        {classes.filter(c => c.is_active === "Active").map(cls => (
                                            <option key={cls.class_id} value={cls.class_id}>{cls.class_name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-0">
                                    <Form.Label>Section<span className='requiredStar'>*</span></Form.Label>
                                    <Form.Select
                                        value={attendanceSectionId}
                                        onChange={(e) => setAttendanceSectionId(parseInt(e.target.value))}
                                        disabled={!attendanceClassId}
                                    >
                                        <option value="">Select Section</option>
                                        {modalSections.filter(s => s.is_active === "Active").map(sec => (
                                            <option key={sec.section_id} value={sec.section_id}>{sec.section_name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>


                            <Col md={3}>
                                <Form.Group className="mb-0">
                                    <Form.Label>Date <span className='requiredStar'>*</span></Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={dayjs(attendanceDate).format("YYYY-MM-DD")}
                                        max={dayjs().format("YYYY-MM-DD")}
                                        onChange={(e) => {
                                            const selectedDate = new Date(e.target.value);
                                            const day = selectedDate.getDay(); // 0 = Sunday
                                            const selectedFormatted = dayjs(selectedDate).format("YYYY-MM-DD");

                                            // Check if it's Sunday
                                            if (day === 0) {
                                                toast.warning("It is Sunday. Attendance cannot be marked.");
                                                return;
                                            }

                                            // Check if it matches any holiday date (formatted)
                                            if (
                                                holidays.some(
                                                    h => dayjs(h.holiday_date || h).format("YYYY-MM-DD") === selectedFormatted
                                                )
                                            ) {
                                                toast.warning("Selected date is a holiday. Attendance cannot be marked.");
                                                return;
                                            }

                                            setAttendanceDate(selectedDate);
                                        }}
                                        style={{
                                            width: '100%',
                                            height: '38px',
                                            padding: '0.375rem 0.75rem',
                                            fontSize: '1rem',
                                            lineHeight: '1.5',
                                            color: '#495057',
                                            backgroundColor: '#fff',
                                            border: '1px solid #ced4da',
                                            borderRadius: '0.375rem',
                                            transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                                        }}
                                    />


                                </Form.Group>
                            </Col>

                            <Col md={3} className="text-end">
                                <Button
                                    variant="primary"
                                    onClick={handleGetStudents}
                                    disabled={!attendanceClassId || !attendanceSectionId || !attendanceDate}
                                >
                                    Get Students
                                </Button>
                            </Col>


                        </Row>




                        {/* Scrollable Table */}
                        {showStudentsTable && students.length > 0 && (
                            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1rem' }}>
                                <Table striped bordered hover className="sticky-header-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Admission Number</th>
                                            <th>Student Name</th>
                                            <th>
                                                <Tooltip title="Select All Morning" arrow placement="top">

                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "5px",
                                                            cursor: "pointer",
                                                            fontSize: "14px"
                                                        }}
                                                        onClick={handleSelectAllMorning}
                                                    >
                                                        <span style={{ fontSize: "18px", color: selectAllMorning ? "#0285FF" : "#ccc" }}>
                                                            ✔
                                                        </span>
                                                        <span style={{ color: "#000" }}>
                                                            Morning Present
                                                        </span>
                                                    </div>


                                                </Tooltip>
                                            </th>

                                            <th>
                                                <Tooltip title="Select All Afternoon" arrow placement="top">
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "5px",
                                                            cursor: "pointer",
                                                            fontSize: "14px"
                                                        }}
                                                        onClick={handleSelectAllAfternoon}
                                                    >
                                                        <span style={{ fontSize: "18px", color: selectAllAfternoon ? "#0285FF" : "#ccc" }}>
                                                            ✔
                                                        </span>
                                                        <span style={{ color: "#000" }}>
                                                            Afternoon Present
                                                        </span>
                                                    </div>

                                                </Tooltip>
                                            </th>
                                            <th ><div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "5px",
                                                cursor: "pointer",
                                                marginBottom: "5px",
                                                fontSize: "14px"
                                            }}>Absent Reason</div></th>

                                        </tr>

                                    </thead>

                                    <tbody>
                                        {students.map((student, index) => (
                                            <tr key={student.id}>
                                                <td>{index + 1}</td>
                                                <td>{student.admission_number}</td>
                                                <td>{student.student_last_name}</td>

                                                <td style={{ textAlign: "center", cursor: "pointer" }}>
                                                    <Tooltip title="Mark Morning Present" arrow placement="top">
                                                        <span
                                                            style={{ fontSize: "18px", color: student.morning_present ? "#0285FF" : "#ccc" }}
                                                            onClick={() => toggleAttendance(index, "morning_present")}
                                                        >
                                                            ✔
                                                        </span>
                                                    </Tooltip>
                                                </td>

                                                <td style={{ textAlign: "center", cursor: "pointer" }}>
                                                    <Tooltip title="Mark Afternoon Present" arrow placement="top">
                                                        <span
                                                            style={{ fontSize: "18px", color: student.afternoon_present ? "#0285FF" : "#ccc" }}
                                                            onClick={() => toggleAttendance(index, "afternoon_present")}
                                                        >
                                                            ✔
                                                        </span>
                                                    </Tooltip>
                                                </td>
                                                <td>
                                                    {(!student.morning_present || !student.afternoon_present) ? (
                                                        <Form.Select
                                                            size="sm"
                                                            value={student.absent_reason}
                                                            onChange={(e) => {
                                                                const updated = [...students];
                                                                updated[index].absent_reason = e.target.value; // saving text
                                                                setStudents(updated);
                                                            }}
                                                        >
                                                            <option value="">Select reason</option>
                                                            {Object.entries(absentReasons).map(([id, label]) => (
                                                                <option key={id} value={label}>{label}</option> // dropdown value is text
                                                            ))}
                                                        </Form.Select>

                                                    ) : (
                                                        <span style={{ color: "#999" }}>—</span>
                                                    )}
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>

                                </Table>
                            </div>

                        )}

                        {/* Submit Button */}
                        {showStudentsTable && students.length > 0 && (
                            <div className="text-end mb-3">
                                <Button variant="primary" onClick={handleSubmitAttendance}>
                                    Submit
                                </Button>
                            </div>
                        )}
                    </Form>
                </Modal.Body>

            </Modal>
        </Container>
    );
};
export default StudentAttendance;