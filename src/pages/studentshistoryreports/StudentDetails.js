import React, { useState, useEffect, useCallback } from "react";
import LeftNav from '../../components/layout/leftNav/leftNav';
import Header from '../../components/layout/header/header';
import axios from "axios";
import { useParams } from "react-router-dom";
import { Col, Row, Card, Modal } from "react-bootstrap";
import stdimage from "../../assets/images/common/Screenshot.png";
import { Tooltip } from '@mui/material';
import DataTable from "react-data-table-component";
import dayjs from "dayjs";
import Button from 'react-bootstrap/Button';
import { fetchDataRead } from "../../Utility";
import loading from "../../assets/images/common/loading.gif";
import { useLocation, Link } from "react-router-dom";
const styles = `
  .student-info-card { box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: none; overflow: hidden; margin-bottom: 2rem; }
  .student-info-card .card-body { background: #f9fafb; overflow-y: auto; padding: 1rem; }
  .section-header { font-size: 0.8rem; color: #3b82f6; margin: 0.5rem 0 1rem; display: block; width: 100%; position: relative; padding-bottom: 0.5rem; font-weight: 300; }
  .section-header::after { content: ""; position: absolute; bottom: 0; left: 0; width: 50px; height: 3px; background: #3b82f6; border-radius: 3px; }
  .info-field { padding: 0.75rem 1rem; }
  .info-label { display: block; font-weight: 500; color: #6b7280; font-size: 0.85rem; margin-bottom: 0.25rem; }
  .info-value { font-weight: 200; color: #111827; font-size: 0.95rem; word-break: break-word; }
  .info-value:empty::before { content: "-"; color: #9ca3af; font-weight: normal; }
  .hide-scrollbar { scrollbar-width: thin; scrollbar-color: #e5e7eb transparent; }
  .hide-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } .hide-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }
`;

const StudentDetails = () => {
    const [activeTab, setActiveTab] = useState("Profile");
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const { student_id } = useParams();
    const [class_id, setClassId] = useState(null);
    const [section_id, setSectionId] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [feesTerms, setFeesTerms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [examsdetails, setExamsDeatails] = useState([]);
    const [sectionName, setSectionName] = useState('');
    const [records, setRecords] = useState([]);
    const [selectedHomework, setSelectedHomework] = useState('');
    const [showModal, setShowModal] = useState(false);
    const routeLocation = useLocation();

    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                setIsLoading(true);
                const response = await axios.post(baseUrl + "/students/", {
                    action: "FILTER",
                    student_id: student_id,
                    school_id:userObj.school_id,
                    academic_year_id:userObj.academic_year_id
                });

                const student = response.data[0];
                setStudentDetails(response.data);
                setSectionName(student?.section_name);
                setClassId(student?.class_id);
                setSectionId(student?.section_id);
            } catch (error) {
                console.error("Error fetching students:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (student_id) {
            fetchStudentDetails();
        }
    }, [student_id]);

    useEffect(() => {
        if (class_id && section_id) {
            const fetchHomework = async () => {
                try {
                    const response = await axios.post(baseUrl + "/homework/", {
                        action: "FILTER",
                        class_id: class_id,
                        section_id: section_id,
                        school_id: userObj.school_id,
                        academic_year_id: userObj.academic_year_id
                    });
                    setRecords(response.data);
                    console.log("Homework:", response.data);
                } catch (error) {
                    console.error("Error fetching Homework:", error);
                }
            };
            fetchHomework();
        }
    }, [class_id, section_id]);

    useEffect(() => {
        fetchDataRead("/StudentAttendance/", setAttendanceData, userObj.school_id)
        fetchDataRead("/examresults", setExamsDeatails, userObj.school_id);
        fetchDataRead("/holiday", setHolidays, userObj.school_id)
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post(
                    baseUrl + "/getfeestudentreceiptstructure/",
                    {
                        p_school_id: userObj.school_id,
                        p_academic_year_id: userObj.academic_year_id,
                    }
                );
                if (response.data && Array.isArray(response.data)) {
                    const filteredParent = response.data.filter(
                        (item) => item.category?.toLowerCase() === "class total" && String(item.student_id) === student_id
                    );
                    setFeesTerms(filteredParent);
                } else {
                    console.error("Unexpected response format:", response.data);
                }

            } catch (error) {
                console.error("Error fetching Fees items:", error);
            }
        };
        if (student_id) {
            fetchData();
        }
    }, [student_id]);

    if (isLoading) {
        return (
            <div className="loadingContainer">
                <img src={loading} alt="Loading..." className="loadingGif" />
            </div>
        );
    }

    if (!studentDetails || studentDetails.length === 0) {
        return <div>No student data found.</div>;
    }
    const student = studentDetails[0];

    const tabs = ["Profile", "Fees", "Exam", "Attendance", "Documents", "Homework"];

    const handleHomeworkClick = (homeworkDetails) => {
        setSelectedHomework(homeworkDetails);
        setShowModal(true);
    };
    const HomeworkDetailsModal = ({ show, onHide, homeworkDetails }) => {
        return (
            <Modal show={show} onHide={onHide} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Homework Details</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
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
    const HomeworkData = [
        {
            name: "Date",
            selector: row => formatDate(row.homework_date),
            cell: row => <Tooltip title={formatDate(row.homework_date)}><span>{formatDate(row.homework_date)}</span></Tooltip>,
            sortable: true
        },
        {
            name: "Class",
            selector: row => row.class_name,
            cell: row => <Tooltip title={row.class_name}><span>{row.class_name}</span></Tooltip>,
            sortable: true
        },
        {
            name: "Section",
            selector: row => row.section_name,
            cell: row => <Tooltip title={row.section_name}><span>{row.section_name}</span></Tooltip>,
            sortable: true
        },
        {
            name: "Subject",
            selector: row => row.subject_name,
            cell: row => <Tooltip title={row.subject_name}><span>{row.subject_name}</span></Tooltip>,
            sortable: true
        },
        {
            name: 'Homework Details',
            selector: (row) => row.homework_details,
            sortable: true,
            cell: (row) => (
                <div
                    className="homework-details-cell"
                    onClick={() => handleHomeworkClick(row.homework_details)}
                    style={{
                        cursor: 'pointer',
                    }}
                >
                    {(row.homework_details || []).length > 50
                        ? `${row.homework_details.substring(0, 50)}...`
                        : row.homework_details}
                </div>
            ),
        },
        {
            name: "Attachments",
            selector: (row) => row.attachments,
            sortable: true,
            cell: (row) => (
                <div className="homework-details-cell">

                    <Tooltip title={row.attachments}>
                        <Link
                            to={`/StudentDetails/${row.student_id}`}
                            style={{ color: 'blue', textDecoration: 'none' }}
                            onClick={() => setIsLoading(true)}

                        >
                            <span>{`${row.student_first_name} ${row.student_last_name}`}</span>
                        </Link>
                        <span>{row.attachments}</span>
                    </Tooltip>

                </div>
            ),

        },
    ];
    const columnsFeesItem = [
        {
            name: "Student Name",
            selector: (row) => row.student_name,
            cell: (row) => (
                <Tooltip title={row.student_name}>
                    <div
                        style={{
                            width: "100px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {row.student_name}
                    </div>
                </Tooltip>
            ),
            sortable: true,
        },
        {
            name: "Section",
            selector: (row) => sectionName,
            cell: (row) => (
                <Tooltip title={sectionName}>
                    <div
                        style={{
                            width: "100px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {sectionName}
                    </div>
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
            name: "Total Fee",
            selector: (row) => row.total,
            cell: (row) =>
            (
                <span> {row.total}</span>
            ),
            sortable: true,
        },
        {
            name: "T1",
            selector: (row) => row.total,
            cell: (row) =>
            (
                <span >{row.total}</span>
            ),
            sortable: true,
        },
        {
            name: "T1 Bal",
            selector: (row) => row.total,
            cell: (row) =>
            (
                <span>{row.total}</span>
            ),
            sortable: true,
        },
        {
            name: "T2",
            selector: (row) => row.total,
            cell: (row) =>
            (
                <span>{row.total}</span>
            ),
            sortable: true,
        },
        {
            name: "T2 Bal",
            selector: (row) => row.total,
            cell: (row) =>
            (
                <span>{row.total}</span>
            ),
            sortable: true,
        },
        {
            name: "T3",
            selector: (row) => row.total,
            cell: (row) =>
            (
                <span>{row.total} </span>
            ),
            sortable: true,
        },
        {
            name: "T3 Bal",
            selector: (row) => row.total,
            cell: (row) =>
            (
                <span>{row.total}</span>
            ),
            sortable: true,
        },
    ];
    const ExpandableRowComponent = ({ data }) => {
        const [feesItems1, setFeesItems1] = useState([]);
        const [isLoading1, setIsLoading1] = useState(false);
        const fetchData = useCallback(async () => {
            if (!data.student_id) return;
            setIsLoading1(true);
            try {
                const response = await axios.post(baseUrl + "/getfeereciepts/", {
                    school_id: userObj.school_id,
                    academic_year_id: userObj.academic_year_id,
                    student_id: data.student_id,
                });
                let fetchedData = Array.isArray(response.data) ? response.data : [];
                fetchedData = fetchedData.map(item => ({
                    ...item,
                    student_id: data.student_id,
                }));
                setFeesItems1(fetchedData);
            } catch (error) {
                console.error("Error fetching fee receipt details:", error);

            } finally {
                setIsLoading1(false);
            }
        }, [data.student_id]);

        useEffect(() => {
            if (data.student_id) {
                fetchData();
            }
        }, [data.student_id]);


        const columns = [
            {
                name: "Receipt No",
                selector: (row) => row.fee_receipt_no,
                cell: (row) => (
                    <Tooltip title={row.fee_receipt_no}><span>{row.fee_receipt_no}</span> </Tooltip>
                ),
                sortable: true,
            },
            {
                name: "Receipt Date",
                selector: (row) => row.reciept_date,
                cell: (row) => (
                    <Tooltip title={row.reciept_date}> <span>{formatDate(row.reciept_date)}</span></Tooltip>
                ),
                sortable: true,
            },
            {
                name: "Term",
                selector: (row) => row.schedule_name,
                cell: (row) => (
                    <Tooltip title={row.schedule_name}> <span>{row.schedule_name}</span></Tooltip>
                ),
                sortable: true,
            },
            {
                name: "Mode of Payment",
                selector: (row) => row.mode,
                cell: (row) => (
                    <Tooltip title={row.mode}> <span>{row.mode}</span> </Tooltip>
                ),
                sortable: true,
            },
            {
                name: "Paid Amount",
                selector: (row) => row.amount_paid,
                cell: (row) => (
                    <Tooltip title={row.amount_paid}>{row.amount_paid}</Tooltip>
                ),
                sortable: true,
            },
            {
                name: "Remarks",
                selector: (row) => row.remarks,
                cell: (row) => (
                    <Tooltip title={row.remarks}><span>{row.remarks}</span> </Tooltip>
                ),
                sortable: true,
            },
        ];

        return (
            <div
                style={{
                    padding: "12px",
                    marginLeft: "20px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #f9f9f9 0%, #e6e6e6 100%)",
                    boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.1)",
                }} >
                {isLoading1 ? (
                    <div className="loadingContainer">
                        <img src={loading} alt="Loading..." className="loadingGif" />
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={
                            feesItems1.length > 0
                                ? feesItems1
                                : [{ schedule_name: "No records found" }]
                        }
                        noHeader
                        dense
                        expandableRows
                        expandableRowsComponent={ChildHyperLinkComponent} />
                )}
            </div>
        );
    };

    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            return "";
        }
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, index) =>
        new Date(currentYear, index).toLocaleString("default", { month: "short" })
    );

    const groupedAttendance = attendanceData.reduce((acc, record) => {
        const studentId = record.student_id?.toString();
        const attendanceDate = dayjs(record.attendace_date).format("YYYY-MM-DD");
        if (!acc[studentId]) {
            acc[studentId] = {
                student_id: studentId,
                student_name: record.student_name,
                attendance: {}
            };
        }
        if (!acc[studentId].attendance[attendanceDate]) {
            acc[studentId].attendance[attendanceDate] = [];
        }
        acc[studentId].attendance[attendanceDate].push({
            attendance_id: record.attendance_id,
            is_present: record.is_present,
            school_id: record.school_id,
            attendace_date: attendanceDate
        });
        return acc;
    }, {});

    const studentAttendance = groupedAttendance[student_id];
    const getAttendanceStats = () => {
        let present = 0;
        let absent = 0;
        if (!studentAttendance?.attendance) return { present, absent };
        Object.values(studentAttendance.attendance).forEach(entries => {
            entries.forEach(entry => {
                if (entry.is_present === true) present++;
                else if (entry.is_present === false) absent++;
            });
        });
        return { present, absent };
    };

    const { present, absent } = getAttendanceStats();
    const getHolidayStats = () => {
        const formattedHolidays = (holidays || []).map(holiday =>
            holiday?.holiday_date ? dayjs(holiday.holiday_date).format("YYYY-MM-DD") : null
        );
        let totalHolidays = 0;
        for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
            const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
            for (let date = 1; date <= daysInMonth; date++) {
                const dateStr = dayjs(`${currentYear}-${monthIndex + 1}-${date}`).format("YYYY-MM-DD");
                const isSunday = dayjs(dateStr).day() === 0;
                const isHoliday = formattedHolidays.includes(dateStr);
                if (isSunday || isHoliday) {
                    totalHolidays++;
                }
            }
        }
        return totalHolidays;
    };

    const totalHolidays = getHolidayStats();
    const generateAttendanceData = () => {
        const rows = [];

        const formattedHolidays = (holidays || []).map(holiday =>
            holiday?.holiday_date ? dayjs(holiday.holiday_date).format("YYYY-MM-DD") : null
        );

        for (let date = 1; date <= 31; date++) {
            const row = { date: date.toString() };

            months.forEach((month, index) => {
                const daysInMonth = new Date(currentYear, index + 1, 0).getDate();

                if (date <= daysInMonth) {
                    const dateStr = dayjs(`${currentYear}-${index + 1}-${date}`).format("YYYY-MM-DD");
                    const isSunday = dayjs(dateStr).day() === 0;
                    const isHoliday = formattedHolidays.includes(dateStr);
                    if (isHoliday || isSunday) {
                        row[month] = (
                            <span style={{ fontSize: "14px", paddingLeft: "12px" }}>H</span>
                        );
                    } else {
                        const attendanceArray = studentAttendance?.attendance?.[dateStr];

                        if (Array.isArray(attendanceArray) && attendanceArray.length > 0) {
                            const isAbsent = attendanceArray.some(entry => entry.is_present === false);

                            row[month] = isAbsent ? (
                                <span style={{ color: "red", fontSize: "18px", paddingLeft: "12px" }}>✘</span>
                            ) : (
                                <span style={{ color: "green", fontSize: "18px", paddingLeft: "12px" }}>✔</span>
                            );
                        } else {
                            row[month] = "";
                        }
                    }
                } else {
                    row[month] = "";
                }
            });

            rows.push(row);
        }

        return rows;
    };

    const attendanceColumns = [
        {
            name: "Date",
            selector: row => row.date,
            width: "60px",
            center: true,
            style: {
                padding: "2px 4px",
                margin: 0,
            }
        },
        ...months.map(month => ({
            name: month,
            selector: row => row[month],
            sortable: false,
            center: true,
            width: "65px",
            style: { padding: "2px 4px", margin: 0, fontSize: "16px", },
            wrap: true
        }))
    ];

    const groupedResultsByStudent = {};
    examsdetails.forEach(result => {
        const studentId = result.student_id;
        const examKey = result.exam_name;
        if (!groupedResultsByStudent[studentId]) {
            groupedResultsByStudent[studentId] = {
                student_name: result.student_name,
                class_id: result.class_id,
                section_id: result.section_id,
                academic_year_id: result.academic_year_id,
                school_id: result.school_id,
                exams: {}
            };
        }
        if (!groupedResultsByStudent[studentId].exams[examKey]) {
            groupedResultsByStudent[studentId].exams[examKey] = {
                exam_id: result.exam_id,
                exam_name: result.exam_name,
                subjects: []
            };
        }
        groupedResultsByStudent[studentId].exams[examKey].subjects.push({
            subject_id: result.subject_id,
            subject_name: result.subject_name,
            marks: result.marks,
            grade_name: result.grade_name,
            exam_results_id: result.exam_results_id
        });
    });
    const studentResults = groupedResultsByStudent[student_id];

    const ChildHyperLinkComponent = ({ data }) => {
        const [feesItems1, setFeesItems1] = useState([]);
        const [isLoading1, setIsLoading1] = useState(false);
        const fetchData = useCallback(async () => {
            if (!data.student_id) return;
            setIsLoading1(true);
            try {
                const response = await axios.post(baseUrl + "/getfeerecieptsdetails/", {
                    school_id: userObj.school_id,
                    academic_year_id: userObj.academic_year_id,
                    student_id: data.student_id,
                    fee_receipt_no: data.fee_receipt_no
                });
                const fetchedData = Array.isArray(response.data) ? response.data : [];
                setFeesItems1(fetchedData);
            } catch (error) {
                console.error("Error fetching fee receipt details:", error);
            } finally {
                setIsLoading1(false);
            }
        }, [data.fee_receipt_no]);

        useEffect(() => {
            if (data.fee_receipt_no) {
                fetchData();
            }
        }, [data.fee_receipt_no]);

        const columns = [
            {
                name: "Fees Item",
                selector: (row) => row.fees_item,
                cell: (row) => (
                    <Tooltip title={row.fees_item}>
                        <span>{row.fees_item}</span>
                    </Tooltip>
                ),
                sortable: true,
            },
            {
                name: <span style={{ paddingRight: "12px" }}>Amount Paid</span>,
                selector: (row) => row.amount_paid,
                cell: (row) => (
                    <Tooltip title={row.amount_paid}>
                        <span> {row.amount_paid} </span>
                    </Tooltip>
                ),
                sortable: true,
            },
        ];

        const columnSums = feesItems1.reduce((acc, row) => {
            Object.keys(row).forEach((key) => {
                if (typeof row[key] === "number") {
                    acc[key] = (acc[key] || 0) + row[key];
                }
            });
            return acc;
        }, {});

        const footerRow = {
            class_name: "Total",
            fees_item: "Total",
            ...Object.fromEntries(
                Object.keys(columnSums).map((key) => [key, columnSums[key] || "-"])
            ),
        };
        const conditionalRowStyles = [
            {
                when: (row) => row.class_name === "Total",
                style: {
                    fontWeight: "bold",
                    backgroundColor: "#f0f0f0",
                    borderTop: "1px solid #000",
                },
            },
        ];

        return (
            <div
                style={{ padding: "12px", marginLeft: "20px", border: "1px solid #ccc", borderRadius: "8px", background: "linear-gradient(135deg, #f9f9f9 0%, #e6e6e6 100%)", boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.1)", }}>
                {isLoading1 ? (
                    <div className="loadingContainer">
                        <img src={loading} alt="Loading..." className="loadingGif" />
                    </div>
                ) : (
                    <DataTable
                        key="childHyperLinkTable"
                        className="custom-table"
                        columns={columns}
                        data={
                            feesItems1.length > 0
                                ? [...feesItems1, footerRow]
                                : [{ fees_item: "No records found" }]
                        }
                        highlightOnHover
                        responsive
                        fixedHeader
                        fixedHeaderScrollHeight="calc(100vh - 170px)"
                        conditionalRowStyles={conditionalRowStyles} />
                )}
            </div>
        );
    };
    return (
        <div className="pageMain flex w-full">
            <LeftNav />
            <div className="pageRight">
                <div className="pageHead">
                    <Header />
                </div>
                <div className="pageRight w-full p-4 bg-gray-100 flex flex-row items-start gap-2" style={{ width: "100%", background: "#f9f9f9" }}>
                    <div className="w-[25%] bg-white shadow-lg p-6 rounded-xl flex flex-col items-center" style={{ width: "30%", background: "#f9f9f9" }}>
                        <img src={stdimage} alt="Student" style={{ paddingLeft: "13%", height: "40%" }} className="w-24 h-24 rounded-full mx-auto  mt-2" />
                        <h6 className="text-lg font-bold text-center mt-2">
                            {`${student.student_first_name} ${student.student_last_name}`}
                        </h6>
                        <table className="" style={{ paddingLeft: "100px" }}>
                            <tbody>
                                <tr> <td >Admission Number: <strong >{student.admission_number}</strong></td></tr>
                                <tr><td>Roll Number:<strong>{student.roll_no}</strong></td> </tr>
                                <tr> <td>Class: <strong>{student.class_name}</strong></td> </tr>
                                <tr> <td>Section:<strong>{student.section_name}</strong></td></tr>
                                <tr> <td>Gender: <strong>{student.gender}</strong></td> </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="w-[75%] bg-white shadow-lg p-6 rounded-xl flex flex-col" style={{ width: "70%", background: "#f9f9f9" }}>
                        <div className="mb-4 flex space-x-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    className={`py-2 px-4 rounded-lg border transition-all ${activeTab === tab ? "text-black bg-white shadow-md border-gray-300" : "text-gray-600 bg-gray-200 border-gray-300"
                                        }`}
                                    onClick={() => setActiveTab(tab)}> {tab}
                                </button>
                            ))}
                        </div>
                        {activeTab === "Profile" && (
                            <Card>
                                <style>{styles}</style>
                                <Card.Body className="hide-scrollbar">
                                    <form>
                                        <Row>
                                            <Col xs={12}>
                                                <span className="section-header text-lg font-semibold text-gray-800">Personal Information</span>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field highlight">
                                                    <span className="info-label">Admission Number</span>
                                                    <span className="info-value">{student.admission_number}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">First Name</span>
                                                    <span className="info-value">{student.student_first_name}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Surname</span>
                                                    <span className="info-value">{student.student_last_name}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">DOB</span>
                                                    <span className="info-value">{formatDate(student.dob)}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">DOJ</span>
                                                    <span className="info-value">{formatDate(student.date_of_join)}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Gender</span>
                                                    <span className="info-value">{student.gender}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field highlight">
                                                    <span className="info-label">Primary Contact</span>
                                                    <span className="info-value">{student.primary_contact}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Blood Group</span>
                                                    <span className="info-value">{student.blood_group_name}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Vaccination</span>
                                                    <span className="info-value">{student.vaccination}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Roll Number</span>
                                                    <span className="info-value">{student.roll_no}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">DOE</span>
                                                    <span className="info-value">{student.date_of_exit}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12}>
                                                <span className="section-header">Class Details</span>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Academic Year</span>
                                                    <span className="info-value">{userObj.academic_year_name}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Admission To</span>
                                                    <span className="info-value">{student.class_name}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Class</span>
                                                    <span className="info-value">{student.class_name}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Section</span>
                                                    <span className="info-value">{student.section_name}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field highlight">
                                                    <span className="info-label">Class Teacher</span>
                                                    <span className="info-value">{student.student_class_teacher_name}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12}>
                                                <span className="section-header">ID Details</span>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Aadhar Number</span>
                                                    <span className="info-value">{student.aadhar_card_no}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Caste</span>
                                                    <span className="info-value">{student.caste}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Birth Certificate Number</span>
                                                    <span className="info-value">{student.birth_certificate_no}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Nationality</span>
                                                    <span className="info-value">{student.nationality}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Religion</span>
                                                    <span className="info-value">{student.religion_name}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12}>
                                                <span className="section-header">Previous School</span>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Previous School</span>
                                                    <span className="info-value">{student.previous_school_name}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Previous Class</span>
                                                    <span className="info-value">{student.class_name}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">First Language</span>
                                                    <span className="info-value">{student.first_language_name}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Second Language</span>
                                                    <span className="info-value">{student.second_language_name}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Third Language</span>
                                                    <span className="info-value">{student.third_language_name}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12}>
                                                <span className="section-header">Father Details</span>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field highlight">
                                                    <span className="info-label">Father Name</span>
                                                    <span className="info-value">{student.father_firstname + " " + student.father_surname}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field highlight">
                                                    <span className="info-label">Father Contact</span>
                                                    <span className="info-value">{student.father_phone_number}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Father Email</span>
                                                    <span className="info-value">{student.father_email}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Father Aadhar Number</span>
                                                    <span className="info-value">{student.father_aadhar_number}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Father Occupation</span>
                                                    <span className="info-value">{student.father_occupation}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12}>
                                                <span className="section-header">Mother Details</span>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field highlight">
                                                    <span className="info-label">Mother Name</span>
                                                    <span className="info-value">{student.mother_firstname + " " + student.mother_surname}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field highlight">
                                                    <span className="info-label">Mother Contact</span>
                                                    <span className="info-value">{student.mother_phone_number}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Mother Email</span>
                                                    <span className="info-value">{student.mother_email}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Mother Aadhar Number</span>
                                                    <span className="info-value">{student.mother_aadhar_number}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Mother Occupation</span>
                                                    <span className="info-value">{student.mother_occupation}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12}>
                                                <span className="section-header">Location Details</span>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">City</span>
                                                    <span className="info-value">{student.city}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">State</span>
                                                    <span className="info-value">{student.state_name}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Country</span>
                                                    <span className="info-value">{student.country_name}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field highlight">
                                                    <span className="info-label">Address</span>
                                                    <span className="info-value">{student.address}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Permanent Address</span>
                                                    <span className="info-value">{student.permanent_address}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12}>
                                                <span className="section-header">Sibling Details</span>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Sibling 1</span>
                                                    <span className="info-value">{student.sibling1_name}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Sibling 2</span>
                                                    <span className="info-value">{student.sibling2_name}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6} lg={4} xxl={3}>
                                                <div className="info-field">
                                                    <span className="info-label">Sibling 3</span>
                                                    <span className="info-value">{student.sibling3_name}</span>
                                                </div>
                                            </Col>
                                        </Row>
                                    </form>
                                </Card.Body>
                            </Card>
                        )}
                        {activeTab === "Fees" && (
                            <Card>
                                <style>{styles}</style>
                                <Card.Body className="hide-scrollbar scroll-fee">
                                    <div className="commonTable height100">
                                        <div className="tableBody">
                                            {isLoading ? (
                                                <div className="loadingContainer">
                                                    <img src={loading} alt="Loading..." className="loadingGif" />
                                                </div>
                                            ) : (
                                                <DataTable
                                                    key="feesItemsTable"
                                                    className="custom-table"
                                                    columns={columnsFeesItem}
                                                    data={
                                                        feesTerms.length > 0
                                                            ? feesTerms
                                                            : [{ academic_year_name: "No records found" }]
                                                    }
                                                    pagination={feesTerms.length > 0}
                                                    highlightOnHover
                                                    responsive
                                                    fixedHeader
                                                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                                                    expandableRows
                                                    expandableRowsComponent={ExpandableRowComponent} />
                                            )}
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        )}
                        {activeTab === "Attendance" && (
                            <Card className="student-info-card">
                                <style>{styles}</style>
                                <Card.Body className="hide-scrollbar">
                                    <div className="d-flex flex-wrap gap-3 mb-3 ps-3">
                                        {[
                                            { label: "Total Present", value: present },
                                            { label: "Total Absent", value: absent },
                                            { label: "Total Holiday", value: totalHolidays },
                                        ].map((item, index) => (
                                            <Card key={index} style={{ width: "150px", flex: "0 0 auto" }}>
                                                <Card.Body className="text-center">
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <span style={{ fontSize: "14px", color: "#000" }}>{item.label}</span>
                                                    </div>
                                                    <div style={{ fontSize: "22px", fontWeight: "bold", color: "#000" }}>
                                                        {item.value}
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-2 mx-2">
                                        <h5 style={{ margin: 0, fontSize: "17px", color: "#000" }}>Attendance Report</h5>
                                        <div style={{ fontSize: "14px", fontWeight: "500", color: "#000" }}>
                                            <span style={{ color: "green", marginRight: "12px" }}>✔ : Present</span>
                                            <span style={{ color: "red", marginRight: "12px" }}>✘ : Absent</span>
                                            <span style={{ color: "gray" }}>H : Holiday</span>
                                        </div>
                                    </div>

                                    <div className="attendance-table-wrapper">
                                        <DataTable
                                            columns={attendanceColumns}
                                            data={generateAttendanceData()}
                                            pagination={false}
                                            dense
                                            fixedHeader
                                            fixedHeaderScrollHeight="400px"
                                            highlightOnHover
                                            striped
                                            responsive />
                                    </div>
                                </Card.Body>
                            </Card>
                        )}
                        {activeTab === "Exam" && studentResults && (
                            <><h6 className="ps-3" style={{ fontSize: "16px", color: "#000", marginBottom: "10px" }}>Exam Report</h6>
                                <div style={{ maxHeight: "550px", overflowY: "auto", padding: "0 10px" }}>
                                    {Object.entries(studentResults.exams).map(([examName, examData], index) => (
                                        <Card key={index} className="mb-2" style={{ boxShadow: "none", border: "1px solid #ccc" }}>
                                            <Card.Header style={{ fontSize: "14px", padding: "6px 12px", backgroundColor: "#f0f0f0" }}>
                                                {examName} Report
                                            </Card.Header>
                                            <Card.Body style={{ padding: "8px 12px" }}>
                                                <table className="table table-sm table-bordered mb-0">
                                                    <thead style={{ fontSize: "13px", backgroundColor: "#f9f9f9" }}>
                                                        <tr>
                                                            <th>Subject</th>
                                                            <th>Marks</th>
                                                            <th>Grade</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{ fontSize: "13px" }}>
                                                        {examData.subjects.map((subject, idx) => (
                                                            <tr key={idx}>
                                                                <td>{subject.subject_name}</td>
                                                                <td>{subject.marks}</td>
                                                                <td>{subject.grade_name || "-"}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        )}
                        {activeTab === "Homework" && (
                            <Card>
                                <style>{styles}</style>
                                <Card.Body className="hide-scrollbar scroll-fee">
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
                                                        columns={HomeworkData}
                                                        data={
                                                            Array.isArray(records) && records.length > 0
                                                                ? records
                                                                : [{
                                                                    class_id: 'No Records Found',
                                                                    section_id: 'No Records Found',
                                                                }]
                                                        }
                                                        pagination={Array.isArray(records) && records.length > 0}
                                                        highlightOnHover
                                                        responsive
                                                        fixedHeader
                                                        fixedHeaderScrollHeight="calc(100vh - 170px)"
                                                        conditionalRowStyles={[
                                                            {
                                                                when: row => row.student_id === 'No Records Found',
                                                                style: {
                                                                    textAlign: 'center',
                                                                    fontSize: '16px',
                                                                    color: 'red',
                                                                    backgroundColor: '#f9f9f9',
                                                                },
                                                            },
                                                        ]}
                                                    />
                                                    <HomeworkDetailsModal
                                                        show={showModal}
                                                        onHide={() => setShowModal(false)}
                                                        homeworkDetails={selectedHomework}
                                                    />
                                                </>

                                            )}
                                        </div>


                                    </div>
                                </Card.Body>
                            </Card>
                        )}
                    </div>
                    <div className="position-relative">
                        <Button
                            type="button"
                            variant="primary"
                            className="btn-danger secondaryBtn position-absolute top-0 end-0 m-3"
                            onClick={() => window.history.back()} >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div >
    );
};
export default StudentDetails;