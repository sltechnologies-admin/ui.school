import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";
import DataTable from 'react-data-table-component';
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import { Tooltip } from "@mui/material";
import { fetchDataRead } from "../../Utility";
import loading from "../../assets/images/common/loading.gif";

const PromotedStudents = () => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const [isLoading, setIsLoading] = useState(false);
    const readOnlyRoles = ["Class Teacher", "Teacher", "Class Incharge"];
    const canSubmit = !readOnlyRoles.includes(userObj.role_name?.trim());

    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [filteredSections, setFilteredSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [promoteToSections, setPromoteToSections] = useState([]);
    const [filter, setFilter] = useState({ class_id: "", section_id: "" });
    const [promoteTo, setPromoteTo] = useState({ new_class_id: "", new_section_id: "" });

    const [globalPromotionStatus, setGlobalPromotionStatus] = useState("");
    const [globalContinueStatus, setGlobalContinueStatus] = useState("");

    useEffect(() => {
        fetchDataRead("/classes/", setClasses, userObj.school_id);
        fetchDataRead("/Sections/", setSections, userObj.school_id);
    }, []);

    useEffect(() => {
        if (filter.class_id && filter.section_id) {
            handleFilterSubmit();
        }
    }, [filter.class_id, filter.section_id]);

    useEffect(() => {
        if (promoteTo.new_class_id) {
            const classId = parseInt(promoteTo.new_class_id);
            const updatedSections = sections.filter(s => s.class_id === classId);
            setPromoteToSections(updatedSections);
            setPromoteTo(prev => ({ ...prev, new_section_id: "" }));
        }
    }, [promoteTo.new_class_id, sections]);
    // const handleSave = async () => {
    //     const validStudents = students.filter(s =>
    //         s.promotion_status && s.continue_status && s.new_section_id
    //     );

    //     if (validStudents.length === 0) {
    //         toast.warning("No valid student entries to save.");
    //         return;
    //     }

    //     const payload = {
    //         action: "CREATE",
    //         promote_id: validStudents.map(() => 0),
    //         student_id: validStudents.map(s => s.student_id),
    //        old_academic_year_id: validStudents.map(() => userObj.academic_year_id),
    //         new_class_id: validStudents.map(s => parseInt(s.new_class_id)),  // ✅ per-student
    //         new_section_id: validStudents.map(s => parseInt(s.new_section_id)),
    //         pass_or_promoted: validStudents.map(s =>
    //             s.promotion_status === "pass" ? "PA" : "PR"
    //         ),
    //         continue_or_leaving: validStudents.map(s =>
    //             s.continue_status === "continue" ? "C" : "L"
    //         ),
    //         school_id: validStudents.map(s => s.school_id || userObj.school_id),
    //         createdby: validStudents.map(() => userObj.email || "system"),
    //         lastmodifiedby: validStudents.map(() => userObj.email || "system")
    //     };


    //     try {
    //         const response = await axios.post(`${baseUrl}/PromoteStudents/`, payload, {
    //             headers: { 'Content-Type': 'application/json' }
    //         });

    //         const { message, errors = [] } = response.data;

    //         if (errors.length > 0) {
    //             toast.error(message || "Some students failed to promote.");
    //             errors.forEach(err => {
    //                 toast.error(`ID ${err.student_id}: ${err.error}`);
    //             });

    //             const errorList = errors.map(err =>
    //                 `ID ${err.student_id}: ${err.error}`
    //             ).join("\n");

    //             alert("Some promotions failed:\n\n" + errorList);
    //         } else {
    //             toast.success(message || "All students promoted successfully!");
    //         }

    //         handleFilterSubmit(); // refresh students list
    //     } catch (error) {
    //         const { response } = error;

    //         if (!response) {
    //             toast.error("Server not reachable.");
    //             return;
    //         }

    //         const { status, data } = response;

    //         if (status === 401) {
    //             toast.error("Academic year mapping error: " + (data.message || ""));
    //         } else if (status === 402) {
    //             toast.error("Student already promoted: " + (data.message || ""));
    //         } else if (status === 500) {
    //             toast.error("Server error: " + (data.message || "Try again later."));
    //         } else if (status === 400 && data?.errors) {
    //             data.errors.forEach(err => {
    //                 toast.error(`ID ${err.student_id}: ${err.error}`);
    //             });

    //             const errorList = data.errors.map(err =>
    //                 `ID ${err.student_id}: ${err.error}`
    //             ).join("\n");

    //             alert("Some promotions failed:\n\n" + errorList);
    //         } else {
    //             toast.error(data.message || "Unexpected error occurred.");
    //         }
    //     }
    // };

    const handleSave = async () => {
        const validStudents = students.filter(s =>
            s.promotion_status && s.continue_status && s.new_section_id && s.new_class_id
        );

        if (validStudents.length === 0) {
            toast.warning("No valid student entries to save.");
            return;


        }

        const fromClassName = classes.find(c => c.class_id === parseInt(filter.class_id))?.class_name || "Current Class";
        const toClassName = classes.find(c => c.class_id === parseInt(promoteTo.new_class_id))?.class_name || "Target Class";

        const confirmMsg = `Are you sure you want to promote students from ${fromClassName} to ${toClassName}?`;
        const userConfirmed = window.confirm(confirmMsg);
        if (!userConfirmed) return;

        const payload = {
            action: "CREATE",
            promote_id: validStudents.map(() => 0),
            student_id: validStudents.map(s => s.student_id),
            old_academic_year_id: validStudents.map(() => userObj.academic_year_id), // ✅ Set same value per student
            new_class_id: validStudents.map(s => parseInt(s.new_class_id)),           // ✅ Must exist per student
            new_section_id: validStudents.map(s => parseInt(s.new_section_id)),
            pass_or_promoted: validStudents.map(s =>
                s.promotion_status === "pass" ? "PA" : "PR"
            ),
            continue_or_leaving: validStudents.map(s =>
                s.continue_status === "continue" ? "C" : "L"
            ),
            school_id: validStudents.map(() => userObj.school_id),
            createdby: validStudents.map(() => userObj.email || "system"),
            lastmodifiedby: validStudents.map(() => userObj.email || "system")
        };

        try {
            const response = await axios.post(`${baseUrl}/PromoteStudents/`, payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            const { message, data = [], errors = [] } = response.data;

            if (errors.length > 0) {
                toast.error(message || "Some students failed to promote.");
                errors.forEach(err => {
                    toast.error(`ID ${err.student_id}: ${err.error}`);
                });

                const errorList = errors.map(err =>
                    `ID ${err.student_id}: ${err.error}`
                ).join("\n");

                alert("Some promotions failed:\n\n" + errorList);
            } else {
                toast.success(message || "All students promoted successfully!");
            }

            handleFilterSubmit(); // Refresh UI
        } catch (error) {
            const { response } = error;

            if (!response) {
                toast.error("Server not reachable.");
                return;
            }

            const { status, data } = response;

            if (status === 409) {
                toast.error("Academic year mapping error: " + (data?.detail || ""));
            } else if (status === 404) {
                toast.error("Next academic year not found: " + (data?.detail || ""));
            } else if (status === 405) {
                toast.error("Student already promoted" + (data?.detail || ""));
            } else if (status === 500) {
                toast.error("Server error: " + (data?.detail || "Try again later."));
            } else if (status === 400 && data?.errors) {
                data.errors.forEach(err => {
                    toast.error(`ID ${err.student_id}: ${err.error}`);
                });

                const errorList = data.errors.map(err =>
                    `ID ${err.student_id}: ${err.error}`
                ).join("\n");

                alert("Some promotions failed:\n\n" + errorList);
            } else {
                toast.error(data?.detail || "Unexpected error occurred.");
            }
        }
    };


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

    // const handleFilterSubmit = async () => {
    //     setIsLoading(true);
    //     try {
    //         const response = await axios.post(baseUrl + "/students/", {
    //             action: "FILTER",
    //             school_id: userObj.school_id,
    //             class_id: filter.class_id,
    //             section_id: filter.section_id,
    //             academic_year_id: userObj.academic_year_id
    //         });
    //         const data = response.data || [];
    //         const enriched = data.map(s => ({
    //             ...s,
    //             promotion_status: "",
    //             continue_status: "",
    //             new_section_id: promoteTo.new_section_id || "",// initialize per student,
    //             has_custom_section: false,
    //         }));

    //         setStudents(enriched);
    //     } catch (error) {
    //         console.error("Error fetching students:", error);
    //         toast.error("Failed to fetch students.");
    //     }
    //     finally {
    //         setIsLoading(false);
    //     }
    // };
    const handleFilterSubmit = async () => {
        setIsLoading(true);
        try {
            // Step 1: Fetch students
            const studentsResponse = await axios.post(baseUrl + "/students/", {
                action: "FILTER",
                school_id: userObj.school_id,
                class_id: filter.class_id,
                section_id: filter.section_id,
                academic_year_id: userObj.academic_year_id,
                status: 'Active'
            });
            const students = studentsResponse.data || [];

            // Step 2: Fetch promoted students mapped
            const promotedResponse = await axios.post(baseUrl + "/GetPromotedStudents/", {
                action: "FILTER",
                school_id: userObj.school_id,
                old_class_id: filter.class_id,
                old_section_id: filter.section_id,
                old_academic_year_id: userObj.academic_year_id
            });
            const promotedMap = (promotedResponse.data || []).reduce((acc, item) => {
                acc[item.student_id] = item;
                return acc;
            }, {});

            // Step 3: Merge data into student list
            const enriched = students.map(s => {
                const promoted = promotedMap[s.student_id];
                return {
                    ...s,
                    promotion_status: promoted
                        ? (promoted.pass_or_promoted === "Promoted" ? "promote" : "pass")
                        : "",
                    continue_status: promoted
                        ? (promoted.continue_or_leaving === "Continue" ? "continue" : "leaving")
                        : "",
                    new_section_id: promoted?.new_section_id ? String(promoted.new_section_id) : promoteTo.new_section_id || "",

                    has_custom_section: !!promoted,
                    new_class_id: promoted?.new_class_id || promoteTo.new_class_id || ""
                };
            });

            setStudents(enriched);
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Failed to fetch students.");
        } finally {
            setIsLoading(false);
        }
    };


    const updateStudent = (studentId, updates) => {
        setStudents(prev =>
            prev.map(s => s.student_id === studentId ? { ...s, ...updates } : s)
        );
    };

    const handleGlobalOption = (type) => {
        setGlobalPromotionStatus(type);
        const updated = students.map(s => ({ ...s, promotion_status: type }));
        setStudents(updated);
    };

    const handleGlobalStatus = (type) => {
        setGlobalContinueStatus(type);
        const updated = students.map(s => ({ ...s, continue_status: type }));
        setStudents(updated);
    };

    const columns = [
        {
            name: "Roll No",
            selector: (row) => row.isEmptyRow ? "" : row.roll_no,
            sortable: true,
        },
        {
            name: "Student Name",
            selector: (row) =>
                row.isEmptyRow
                    ? ""
                    : `${row.student_first_name || ""} ${row.student_last_name || ""}`,
            sortable: true,
        },
        {
            name: "Class",
            selector: row => row.isEmptyRow ? "" : row.class_name,
            cell: row => row.isEmptyRow ? "" : <Tooltip title={row.class_name}><span>{row.class_name}</span></Tooltip>,
            sortable: true,
            width: "130px"
        },
        {
            name: "Section",
            selector: row => row.isEmptyRow ? "No Records Found" : row.section_name,
            cell: row =>
                row.isEmptyRow ? (
                    <div style={{ width: "100%", textAlign: "center", color: "red", fontWeight: "bold" }}>
                        No Records Found
                    </div>
                ) : (
                    <Tooltip title={row.section_name}><span>{row.section_name}</span></Tooltip>
                ),
            sortable: true
        },
        {
            name: "Passed/Promoted",
            cell: row => row.isEmptyRow ? "" : (
                <div>
                    <Form.Check
                        type="radio"
                        inline
                        label="Pass"

                        name={`promotion_${row.student_id}`}
                        checked={row.promotion_status === "pass"}
                        onChange={() => {
                            updateStudent(row.student_id, { promotion_status: "pass" });
                            setGlobalPromotionStatus("");
                        }}
                    />
                    <Form.Check
                        type="radio"
                        inline
                        label="Promoted"
                        name={`promotion_${row.student_id}`}
                        checked={row.promotion_status === "promote"}
                        onChange={() => {
                            updateStudent(row.student_id, { promotion_status: "promote" });
                            setGlobalPromotionStatus("");
                        }}
                    />
                </div>
            )
        },
        {
            name: <div style={{ marginLeft: "30px" }}>Is Continue?</div>,
            cell: row => row.isEmptyRow ? "" : (
                <div>
                    <Form.Check
                        type="radio"
                        inline
                        style={{ marginLeft: "30px" }}
                        label="Continue"
                        name={`continue_${row.student_id}`}
                        checked={row.continue_status === "continue"}
                        onChange={() => {
                            updateStudent(row.student_id, { continue_status: "continue" });
                            setGlobalContinueStatus("");
                        }}
                    />
                    <Form.Check
                        type="radio"
                        inline
                        label="Leaving"
                        name={`continue_${row.student_id}`}
                        checked={row.continue_status === "leaving"}
                        onChange={() => {
                            updateStudent(row.student_id, { continue_status: "leaving" });
                            setGlobalContinueStatus("");
                        }}
                    />
                </div>
            )
        },
        {
            name: <div style={{ marginLeft: "50px" }}>New Class</div>,
            selector: () => "",
            cell: row => {
                if (row.isEmptyRow) return "";

                const promotedClass = classes.find(c => c.class_id === parseInt(row.new_class_id));
                const globalClass = classes.find(c => c.class_id === parseInt(promoteTo.new_class_id));

                return (
                    <div style={{ marginLeft: "60px" }}>
                        {promotedClass
                            ? promotedClass.class_name
                            : globalClass
                                ? globalClass.class_name
                                : ""}
                    </div>
                );
            }
        }

        ,
        {
            name: "New Section",
            selector: () => "",
            cell: (row) => {
                if (row.isEmptyRow) return "";

                const effectiveClassId = row.new_class_id || promoteTo.new_class_id;

                // Filter sections based on the student's new_class_id (not the global one)
                const availableSections = sections.filter(
                    (s) => s.class_id === parseInt(effectiveClassId)
                );

                const effectiveSectionId = row.new_section_id || "";

                return (
                    <Form.Select
                        size="sm"
                        value={String(effectiveSectionId)} // ensure it's a string
                        onChange={(e) => {
                            updateStudent(row.student_id, {
                                new_section_id: e.target.value,
                                has_custom_section: true,
                            });
                        }}
                        disabled={!effectiveClassId}
                    >
                        <option value="">Select Section</option>
                        {availableSections
                            .filter((s) => s.is_active === "Active")
                            .map((s) => (
                                <option key={s.section_id} value={String(s.section_id)}>
                                    {s.section_name}
                                </option>
                            ))}
                    </Form.Select>
                );
            },
        }

    ];



    return (
        <div className='pageMain'>
            <ToastContainer />
            <LeftNav />
            <div className='pageRight'>
                <div className='pageHead'><Header /></div>
                <div className='pageBody'>
                    <div className="commonDataTableHead">
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <h6 className="commonTableTitle">Promote Students</h6>
                        </div>
                    </div>

                    <Row className="align-items-center g-2 mb-2" style={{ fontSize: "13px" }}>

                        <Col md="auto">
                            <Form.Select name="class_id" value={filter.class_id} onChange={handleFilterChange} required size="sm">
                                <option value="">Select Class</option>
                                {classes.filter(c => c.is_active === "Active").map(c => (
                                    <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
                                ))}
                            </Form.Select>
                        </Col>


                        <Col md="auto" >
                            <Form.Select name="section_id" value={filter.section_id} onChange={handleFilterChange} disabled={!filter.class_id} required size="sm">
                                <option value="">Select Section</option>
                                {filteredSections.filter(s => s.is_active === "Active").map(s => (
                                    <option key={s.section_id} value={s.section_id}>{s.section_name}</option>
                                ))}
                            </Form.Select>
                        </Col>


                        <Col md="auto" className="d-flex align-items-center">
                            <span className="fw-bold text-nowrap" style={{ fontSize: "14px", marginLeft: "20px", marginRight: "20px" }}>Promote To &raquo;</span>
                        </Col>


                        <Col md="auto">
                            <Form.Select
                                value={promoteTo.new_class_id}
                                onChange={(e) => {
                                    const classId = e.target.value;

                                    // Update global class in state
                                    setPromoteTo(prev => ({ ...prev, new_class_id: classId, new_section_id: "" }));

                                    // Filter and update promoteToSections
                                    const classIdInt = parseInt(classId);
                                    const updatedSections = sections.filter(s => s.class_id === classIdInt);
                                    setPromoteToSections(updatedSections);

                                    // ✅ Update new_class_id for each student (if not overridden)
                                    setStudents(prev =>
                                        prev.map(s =>
                                            s.has_custom_section
                                                ? s
                                                : {
                                                    ...s,
                                                    new_class_id: classId,
                                                    new_section_id: "" // reset section so it can match newly filtered options
                                                }
                                        )
                                    );
                                }}
                                size="sm"
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => (
                                    <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
                                ))}
                            </Form.Select>

                        </Col>


                        <Col md="auto">
                            <Form.Select
                                value={promoteTo.new_section_id}
                                onChange={(e) => {
                                    const sectionId = e.target.value;

                                    // Update global promoteTo
                                    setPromoteTo(prev => ({ ...prev, new_section_id: sectionId }));

                                    // Update only students who have NOT manually changed their section
                                    setStudents(prev =>
                                        prev.map(s =>
                                            s.has_custom_section ? s : { ...s, new_section_id: sectionId }
                                        )
                                    );
                                }}
                                disabled={!promoteTo.new_class_id}
                                size="sm"
                            >
                                <option value="">Select Section</option>
                                {promoteToSections
                                    .filter(s => s.is_active === "Active")
                                    .map(s => (
                                        <option key={s.section_id} value={s.section_id}>
                                            {s.section_name}
                                        </option>
                                    ))}
                            </Form.Select>

                        </Col>
                        <Col md="auto" className="d-flex align-items-left gap-3" style={{ fontSize: "14px", marginLeft: "0px" }}>
                            {/* Promotion Group */}
                            <div className="d-flex align-items-center gap-1">
                                <Form.Check
                                    type="radio"
                                    label="Pass All"
                                    name="promotion"
                                    checked={globalPromotionStatus === "pass"}
                                    onChange={() => handleGlobalOption("pass")}
                                    inline
                                />
                                <Form.Check
                                    type="radio"
                                    label="Promote All"
                                    name="promotion"
                                    checked={globalPromotionStatus === "promote"}
                                    onChange={() => handleGlobalOption("promote")}
                                    inline
                                />
                            </div>

                            {/* Status Group */}
                            <div className="d-flex align-items-center gap-1">
                                <Form.Check
                                    type="radio"
                                    label="Continue All"
                                    name="status"
                                    checked={globalContinueStatus === "continue"}
                                    onChange={() => handleGlobalStatus("continue")}
                                    inline
                                />
                                <Form.Check
                                    type="radio"
                                    label="Leaving"
                                    name="status"
                                    checked={globalContinueStatus === "leaving"}
                                    onChange={() => handleGlobalStatus("leaving")}
                                    inline
                                />
                            </div>

                            <div>{canSubmit && (
                                <button
                                    className="btn btn-primary btn-sm"
                                    style={{ fontSize: "13px", padding: "4px" }}
                                    onClick={handleSave}
                                >
                                    Save
                                </button>
                            )}
                            </div>
                        </Col>


                        {/* <Col style={{ fontSize: "14px",marginLeft:"25px" }}>
                            <Form.Check type="radio" label="Pass All" name="promotion" checked={globalPromotionStatus === "pass"} onChange={() => handleGlobalOption("pass")} inline />
                            <Form.Check type="radio" label="Promote All" name="promotion" checked={globalPromotionStatus === "promote"} onChange={() => handleGlobalOption("promote")} inline />

                        </Col>
                        <Col>
                            <Form.Check type="radio" label="Continue All" name="status" checked={globalContinueStatus === "continue"} onChange={() => handleGlobalStatus("continue")} inline />
                            <Form.Check type="radio" label="Leaving" name="status" checked={globalContinueStatus === "leaving"} onChange={() => handleGlobalStatus("leaving")} inline />
                        </Col> */}
                        {/* <Col className="d-flex justify-content-start align-items-center gap-5" style={{ fontSize: "14px", marginLeft: "30px" }}>
                         
                            <div className="d-flex flex-wrap gap-7">
                                <Form.Check
                                    type="radio"
                                    label="Pass All"
                                    name="promotion"
                                    checked={globalPromotionStatus === "pass"}
                                    onChange={() => handleGlobalOption("pass")}
                                    inline
                                />
                                <Form.Check
                                    type="radio"
                                    label="Promote All"
                                    name="promotion"
                                    checked={globalPromotionStatus === "promote"}
                                    onChange={() => handleGlobalOption("promote")}
                                    inline
                                />
                            </div>

                        
                            <div className="d-flex flex-wrap gap-9">
                                <Form.Check
                                    type="radio"
                                    label="Continue All"
                                    name="status"
                                    checked={globalContinueStatus === "continue"}
                                    onChange={() => handleGlobalStatus("continue")}
                                    inline
                                />
                                <Form.Check
                                    type="radio"
                                    label="Leaving"
                                    name="status"
                                    checked={globalContinueStatus === "leaving"}
                                    onChange={() => handleGlobalStatus("leaving")}
                                    inline
                                />
                            </div>
                        </Col> */}


                        <Col md="auto">


                        </Col>
                    </Row>

                    <div className="commonTable height100">
                        <div className="tableBody">
                            {isLoading ? (
                                <div className="loadingContainer">
                                    <img src={loading} alt="Loading..." className="loadingGif" />
                                </div>
                            ) : (
                                <DataTable
                                    className="custom-table"
                                    columns={columns}
                                    data={
                                        Array.isArray(students) && students.length > 0
                                            ? students
                                            : [{ isEmptyRow: true }]
                                    }
                                    pagination={students.length > 0}
                                    highlightOnHover
                                    responsive
                                    fixedHeader
                                    fixedHeaderScrollHeight="calc(100vh - 280px)"
                                />
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PromotedStudents;
