import React, { useState, useEffect } from "react";
import { Container, Form, Card, Modal } from "react-bootstrap";
import { BiFullscreen,BiExitFullscreen } from 'react-icons/bi';
import axios from "axios";

const TimetableForm = () => {
    const userData = sessionStorage.getItem("user");
    const userObj = userData ? JSON.parse(userData) : {};

    const [timetable, setTimetable] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [filteredSections, setFilteredSections] = useState([]);
    const [weekday, setWeekday] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [isGridVisible, setIsGridVisible] = useState(false);
    const [showExpand, setShowExpand] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState(0);
    const [isTeacherSelected, setIsTeacherSelected] = useState(false);

    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    const [filter, setFilter] = useState({
        academic_year_id: userObj?.academic_year_id || 0,
        school_id: userObj?.school_id || 0,
        class_id: 0,
        section_id: 0,
    });

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await axios.post(baseUrl + "/Users/", {
                    action: "TREAD",
                    school_id: userObj.school_id,
                });
                setTeachers(response.data || []);
            } catch (error) {
                console.log("Error fetching teachers:", error);
            }
        };

        fetchTeachers();
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            const [weekdayRes, classRes, sectionRes] = await Promise.all([
                axios.post(baseUrl + "/weekday/", { action: "READ" }),
                axios.post(baseUrl + "/classes/", { action: "READ", school_id: userObj.school_id }),
                axios.post(baseUrl + "/Sections/", { action: "READ", school_id: userObj.school_id }),
            ]);

            setWeekday(weekdayRes.data?.filter(d => d.week_day_name !== "Sunday") || []);
            setClasses(classRes.data || []);
            setSections(sectionRes.data || []);
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        if (classes.length > 0 && !filter.class_id) {
            const firstActiveClass = classes.find(cls => cls?.is_active === "Active");
            if (firstActiveClass) {
                setFilter(prev => ({ ...prev, class_id: firstActiveClass.class_id }));
            }
        }
    }, [classes]);

    useEffect(() => {
        if (filter.class_id && !selectedTeacherId) {
            const relatedSections = sections.filter(sec => sec.class_id === filter.class_id);
            setFilteredSections(relatedSections);

            const firstSection = relatedSections.find(s => s.is_active === "Active");
            if (firstSection && !filter.section_id) {
                setFilter(prev => ({ ...prev, section_id: firstSection.section_id }));
            }

            const fetchPeriods = async () => {
                const res = await axios.post(baseUrl + "/periodbasedclass/", {
                    action: "READ",
                    class_id: filter.class_id,
                    school_id: userObj.school_id,
                });
                setPeriods(res.data || []);
                setIsGridVisible(true);
                setTimetable([]);
            };

            fetchPeriods();
        } else {
            setFilteredSections([]);
            setPeriods([]);
            setIsGridVisible(false);
        }
    }, [filter.class_id, sections]);

    useEffect(() => {
        const fetchSubjects = async () => {
            if (
                filter.class_id > 0 &&
                filter.section_id > 0 &&
                !selectedTeacherId
            ) {
                const res = await axios.post(baseUrl + "/teacherssubjectsmap/", {
                    action: "FILTER",
                    school_id: userObj.school_id,
                    class_id: filter.class_id,
                    section_id: filter.section_id,
                    academic_year_id: userObj.academic_year_id,
                });

                const subjectsData = res.data || [];
                setSubjects(subjectsData);

                await fetchTimetableData(subjectsData); // Pass subjects directly
            }
        };

        fetchSubjects();
    }, [filter.class_id, filter.section_id]); // 🔁 both dependencies


    const fetchTimetableData = async (subjectsData = subjects) => {
        const response = await axios.post(baseUrl + "/timetable/", {
            action: "FILTER",
            academic_year_id: filter.academic_year_id,
            class_id: filter.class_id,
            section_id: filter.section_id,
            school_id: userObj.school_id,
        });

        const data = response.data?.map(item => ({
            ...item,
            subject_name:
                subjectsData.find(s => s.subject_id === item.subject_id)?.subject_name || "",
        })) || [];

        setTimetable(data);
    };


    const fetchTimetableByTeacher = async (teacherId) => {
        try {
            const [weekdayResponse, timetableResponse] = await Promise.all([
                axios.post(baseUrl + '/weekday/', { action: 'READ' }),
                axios.post(baseUrl + '/teachertimetable/', {
                    action: 'READ',
                    school_id: userObj?.school_id || 0,
                    teacher_id: teacherId
                })
            ]);

            const days = weekdayResponse?.data?.filter(day => day?.week_day_name !== 'Sunday') || [];
            setWeekday(days);

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
            setWeekday([]);
            setPeriods([]);
        }
    };
    const processTimetableData = () => {
        const grid = Array(periods?.length || 0)
            .fill()
            .map(() => Array(6).fill(null));

        if (!Array.isArray(timetable)) return grid;

        timetable.forEach((entry) => {
            const {
                period_order,
                week_day_id,
                subject_name,
                teacher_name,
                class_name,
                section_name
            } = entry;

            if (
                Number.isInteger(period_order) &&
                period_order >= 1 &&
                period_order <= periods.length &&
                Number.isInteger(week_day_id) &&
                week_day_id >= 1 &&
                week_day_id <= 6
            ) {
                grid[period_order - 1][week_day_id - 1] = isTeacherSelected
                    ? {
                        display1: class_name || "-",
                        display2: section_name ? `(${section_name})` : ""
                    }
                    : {
                        display1: subject_name || "-",
                        display2: teacher_name || ""
                    };
            }
        });

        return grid;
    };



    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    };

    const formatTime12Hour = (time) => {
        if (!time) return "Invalid";
        if (/AM|PM/.test(time)) return time;
        const [h, m] = time.split(":").map(Number);
        const suffix = h >= 12 ? "PM" : "AM";
        const hour12 = h % 12 || 12;
        return `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
    };

    const timetableGrid = processTimetableData();
    const renderTimetableGrid = () => (
        <div className="timetableDivGrid p-2" style={{ overflowX: "auto", maxHeight: "300px" }}>
            <div
                className="grid"
                style={{
                    display: "grid",
                    gridTemplateColumns: `120px repeat(${periods.length}, 1fr)`,
                    border: "1px solid #dee2e6",
                }}
            >
                {/* Header Row */}
                <div
                    style={{
                        fontWeight: "bold",
                        border: "1px solid #dee2e6",
                        padding: "0px",
                        textAlign: "center",
                        backgroundColor: "#f1f1f1",
                    }}
                >
                    Day / Period
                </div>

                {periods.map((p, i) => (
                    <div
                        key={`header-${i}`}
                        style={{
                            fontWeight: "bold",
                            border: "1px solid #dee2e6",
                            padding: "4px",
                            fontSize: "12px",
                            textAlign: "center",
                            backgroundColor: "#f1f1f1",
                        }}
                    >
                        {p.period_name || `Period ${i + 1}`}
                        <br />
                        {p.start_time && p.end_time && (
                            <span style={{ fontSize: "10px", color: "#666" }}>
                                {formatTime12Hour(p.start_time)} - {formatTime12Hour(p.end_time)}
                            </span>
                        )}
                    </div>
                ))}

                {/* Body Rows */}
                {weekday.map((day) => (
                    <React.Fragment key={day.week_day_id}>
                        <div
                            style={{
                                fontWeight: "bold",
                                border: "1px solid #dee2e6",
                                padding: "4px",
                                backgroundColor: "#f8f9fa",
                                textAlign: "center",
                            }}
                        >
                            {day.week_day_name}
                        </div>

                        {periods.map((_, pIdx) => {
                            const entry = timetableGrid[pIdx]?.[day.week_day_id - 1];

                            return (
                                <div
                                    key={`cell-${day.week_day_id}-${pIdx}`}
                                    style={{
                                        border: "1px solid #dee2e6",
                                        fontSize: "12px",
                                        textAlign: "center",
                                        backgroundColor: entry?.display1 ? "white" : "#f9f9f9",
                                        minHeight: "48px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        padding: "2px",
                                    }}
                                >
                                    {entry?.display1 ? (
                                        <>
                                            <div>{entry.display1}</div>
                                            {entry.display2 && (
                                                <div style={{ fontSize: "11px", color: "#6c757d" }}>{entry.display2}</div>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-muted">-</span>
                                    )}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );


    const renderDropdowns = () => (
        <div className="d-flex align-items-center gap-2 flex-wrap">
            <Form.Select size="sm" name="class_id" value={filter.class_id} onChange={handleFilterChange} style={{ width: "100px" }} disabled={selectedTeacherId > 0}>
                <option value={0}>Class</option>
                {classes.filter(c => c.is_active === "Active").map(cls => (
                    <option key={cls.class_id} value={cls.class_id}>{cls.class_name}</option>
                ))}
            </Form.Select>

            <Form.Select size="sm" name="section_id" value={filter.section_id} onChange={handleFilterChange} disabled={!filter.class_id || selectedTeacherId > 0} style={{ width: "100px" }}>
                <option value={0}> Section</option>
                {filteredSections.filter(s => s.is_active === "Active").map(section => (
                    <option key={section.section_id} value={section.section_id}>{section.section_name}</option>
                ))}
            </Form.Select>

            <Form.Select size="sm" name="teacher_id" value={selectedTeacherId} onChange={async (e) => {
                const tid = parseInt(e.target.value);
                setSelectedTeacherId(tid);
                setIsTeacherSelected(tid > 0);
                if (tid > 0) {
                    setFilter(prev => ({ ...prev, class_id: 0, section_id: 0 }));
                    setFilteredSections([]);
                    setPeriods([]);
                    setTimetable([]);
                    await fetchTimetableByTeacher(tid);
                    setIsGridVisible(true);
                } else {
                    setIsTeacherSelected(false);
                }
            }} style={{ width: "150px" }}>
                <option value={0}>Select Teacher</option>
                {teachers.filter(teacher => teacher.role_name === "Teacher" && teacher.status === "Active").map(teacher => (
                    <option key={teacher.userid} value={teacher.userid}>{teacher.firstname} {teacher.surname}</option>
                ))}
            </Form.Select>

            {/* <FaExpand onClick={() => setShowExpand(true)} title="Expand Timetable" style={{ cursor: "pointer", fontSize: "18px" }} /> */}
            <button
                type="button"
                title="Expand Report"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setShowExpand(true)} // your expand handler
            >
                <BiFullscreen />

            </button>
        </div>
    );

    return (
        <Container fluid>
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center flex-wrap">
                    <h5 className="mb-0">Time Table</h5>
                    {renderDropdowns()}
                </Card.Header>
                <Card.Body style={{ padding: 0 }}>
                    {!isGridVisible ? (
                        <p className="text-center mt-3">
                            {selectedTeacherId > 0
                                ? "Select a teacher to view timetable"
                                : "Select class and section to view the timetable"}
                        </p>
                    ) : renderTimetableGrid()}
                </Card.Body>
            </Card>

            <Modal show={showExpand} onHide={() => setShowExpand(false)} size="lg" backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title className="w-100 d-flex justify-content-between align-items-center">
                        <span>Expanded Timetable</span>
                        {renderDropdowns()}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!isGridVisible ? (
                        <p className="text-center mt-3">
                            {selectedTeacherId > 0
                                ? "Select a teacher to view timetable"
                                : "Select class and section to view the timetable"}
                        </p>
                    ) : renderTimetableGrid()}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default TimetableForm;
