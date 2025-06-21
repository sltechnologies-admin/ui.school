import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Button, Modal, Row, Col, Form } from "react-bootstrap";
import { MdRemoveRedEye} from "react-icons/md";
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import axios from "axios";
import DataTable from "react-data-table-component";
import { Tooltip } from '@mui/material';
import loading from "../../assets/images/common/loading.gif";
import { Table } from 'react-bootstrap';

const Approvals = () => {
    const [Roles, setRoles] = useState([]);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [students, setStudents] = useState([]);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [isLoading, setIsLoading] = useState(true);
    const userData = sessionStorage.getItem('user');
    const [fees, setFees] = useState([]);
    const userObj = userData ? JSON.parse(userData) : {};
    const readOnlyRoles = ["Class Teacher", "Teacher", "Class Incharge","School Admin",];
    const canSubmit = !readOnlyRoles.includes(userObj.role_name?.trim());
    const [form, setForm] = useState({
        student_id: "",
        student_first_name: "",
        student_last_name: "",
        dob: "",
        date_of_join: "",
        date_of_exit: "",
        image_id: "",
        class_id: "",
        class_name: "",
        section_id: "",
        section_name: "",
        roll_no: "",
        student_class_teacher_id: 0,
        student_class_teacher_name: "",
        gender: "",
        roll_no: "",
        passport_size_photo: "",
        academic_year_id: 0,
        academic_year_name: "",
        admission_number: "",
        class_last_studied: "",
        class_last_studied_name: "",
        class_name: "",
        previous_school_name: "",
        admission_to: "",
        class_name: "",  
        school_id: 0,
        date_of_admission: "",
        which_school_student_has_gone: "",
        Total_Fee: "",
        Total_Due: "",
        grand_total: "",
        exit_type: "",
        document: "",
        exit_reason: "",
        exit_status: "",
    })
     useEffect(() => {
            setIsLoading(true);
            fetchStudents().finally(() => setIsLoading(false));
        }, []);
    const fetchStudents = async () => {
            try {
                const response = await axios.post(baseUrl + "/students/", {
                    action: "READ", school_id: userObj.school_id
                });
                setStudents(response.data);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };
 
    useEffect(() => {
        
        setIsLoading(true);
        fetchexit().finally(() => setIsLoading(false));
    }, []);


    const fetchexit = async () => {
        try {
            const response = await axios.post(baseUrl + "/studentexit/", {
                action: "READ",
                school_id:userObj.school_id
            });
            setRoles(response.data);
        } catch (error) {
            console.error("Error fetching roles:", error);

        }
    };

   const updateExitStatus = async (status) => {
    try {
        setIsLoading(true);
        if (form.exit_status === "Pending" && (!form.comments || form.comments.trim() === "")) {
            toast.error("Comments are required when status is Pending.");
            setIsLoading(false);
            return;
        }

        const payload = {
            action: "UPDATE",
            student_id: form.student_id,
            school_id: userObj.school_id,
            exit_status: status === "Approved" ? "A" : "R"
        };

        if (form.exit_status === "Pending" || form.comments) {
            payload.comments = form.comments || "";
        }

        const response = await axios.post(baseUrl + "/updateexitstatus/", payload);

        if (response.data && response.data.length > 0) {
            const updatedRecord = response.data[0];
            toast.success(`Status updated`);
            setShowExitForm(false);
            fetchStudents();
            fetchexit(); 
        } else {
            toast.error("Failed to update status");
        }
    } catch (error) {
        console.error("Error updating exit status:", error);
    } finally {
        setIsLoading(false);
    }
};

     const formatDate1 = (datetime) => {
        if (!datetime) return "";
        const date = new Date(datetime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}`;
    };
    const handleInputChange = (e) => {
        const { id, value, files } = e.target;

        setForm((prevForm) => ({
            ...prevForm,
            [id]: value
        }));

    };

    const columns = [
       
           {
               name: "Image",
               selector: (row) => row.passport_size_photo,
               cell: () => null,
               sortable: true,
               omit: true,
           },
           {
               name: "Admission Number",
               selector: row => row.admission_number,
               cell: row => <Tooltip title={row.admission_number}><span>{row.admission_number}</span></Tooltip>,
               sortable: true,
               width:"138px"
           },
           {
               name: "Surname",
               selector: row => row.student_last_name,
               cell: row => {
                   const surName = row.student_last_name || " ";
                   return (
                       <Tooltip title={surName}>
                           <span>
                               {surName.length > 10 ? surName.substring(0, 12) + "..." : surName}
                           </span>
                       </Tooltip>
                   );
               },
               sortable: true,
               width: "120px"
           },
           {
               name: "First Name",
               selector: row => row.student_first_name,
               cell: row => {
                   const firstName = row.student_first_name || " ";
                   return (
                       <Tooltip title={firstName}>
                           <span>
                               {firstName.length > 15 ? firstName.substring(0, 15) + "..." : firstName}
                           </span>
                       </Tooltip>
                   );
               },
               sortable: true,
               width: "120px"
           },
           {
               name: "Roll Number",
               selector: row => row.roll_no,
               cell: row => <Tooltip title={row.roll_no}><span>{row.roll_no}</span></Tooltip>,
               sortable: true,
               width: "115px"
           },
           {
               name: "DOJ",
               selector: row => formatDate1(row.date_of_join),
               cell: row => <Tooltip title={formatDate1(row.date_of_join)}><span>{formatDate1(row.date_of_join)}</span></Tooltip>,
               sortable: true
           },
           {
               name: "Class",
               selector: row => row.class_name,
               cell: row => <Tooltip title={row.class_name}><span>{row.class_name}</span></Tooltip>,
               sortable: true,
               width: "130px"
           },
           {
               name: "Section",
               selector: row => row.section_name,
               cell: row => <Tooltip title={row.section_name}><span>{row.section_name}</span></Tooltip>,
               sortable: true
           },
           {
               name: "Class Teacher",
               selector: row => row.student_class_teacher_name || " ",
               cell: row => {
                   const teacherName = row.student_class_teacher_name || " ";
                   return (
                       <Tooltip title={teacherName}>
                           <span>
                               {teacherName.length > 15 ? teacherName.substring(0, 15) + "..." : teacherName}
                           </span>
                       </Tooltip>
                   );
               },
               sortable: true,
               width: "125px"
           },
           {
               name: "Gender",
               selector: row => row.gender,
               cell: row => <Tooltip title={row.gender}><span>{row.gender}</span></Tooltip>,
               sortable: true,
               width: "87px"
           },
           {
               name: "Exit Status",
               selector: row => row.exit_status,
               cell: row => <Tooltip title={row.exit_status}><span>{row.exit_status}</span></Tooltip>,
               sortable: true
           },
          ...(canSubmit ? [{
        name: "Action",
        cell: row => (
            (filteredRecords || []).length > 0 ? (
                <div className="tableActions">
                    <Tooltip title="View" arrow>
                        <span
                            className="commonActionIcons"
                            onClick={() => handleDeleteClick(row.student_id)}
                        >
                            <MdRemoveRedEye />
                        </span>
                    </Tooltip>
                </div>
            ) : null
        ),
    }] : []),
];
        const [termSummary, setTermSummary] = useState([]);
    const fetchFees = async (student_id) => {
        try {
            const response = await axios.get(baseUrl + "/main/get_fee_details_by_student_id", {
                params: {
                    p_school_id: userObj.school_id,
                    p_academic_year_id: userObj.academic_year_id,
                    p_student_id: student_id
                }
            });

            const data = response.data.get_fees_student_receipt_structure_bystudent || [];
            setFees(response.data);

            const terms = new Set();

            data.forEach(item => {
                Object.keys(item).forEach(key => {
                    if (key.startsWith("Term") && !key.includes("Bal") && !key.includes("due_date")) {
                        terms.add(key);
                    }
                });
            });

            const summary = [...terms].map(term => {
                const total = data.reduce((sum, item) => sum + (item[term] || 0), 0);
                const due = data.reduce((sum, item) => sum + (item[`${term} Bal`] || 0), 0);
                const paid = total - due;
                return { term, total, paid, due };
            });

            setTermSummary(summary);

        } catch (error) {
            console.error("Error fetching Fees:", error);
        }
    };


    const grandTotal = termSummary.reduce((sum, item) => sum + item.total, 0);
    const totalDue = termSummary.reduce((sum, item) => sum + Number(item.due), 0);

    useEffect(() => {
        const grandTotal = termSummary.reduce((sum, item) => sum + Number(item.total), 0);
        const totalDue = termSummary.reduce((sum, item) => sum + Number(item.due), 0);

        setForm(prev => ({
            ...prev,
            grand_total: grandTotal,
            Total_Due: totalDue,
        }));
    }, [termSummary]);

     const [showExitForm, setShowExitForm] = useState(false);

        const handleDeleteClick = async (student_id) => {
        try {
            setTermSummary([]);
            const studentToEdit = (students || []).find(student => student.student_id === student_id);
            console.log(studentToEdit);

            setForm(studentToEdit);
            fetchFees(student_id);

            setShowExitForm(true);
        } catch (error) {
            console.error("Failed to fetch student details", error);
            alert("Error fetching student data");
        }
    };
   

    const searchableColumns = [
        (row) => row.student_id,
        (row) => row.admission_number,
        (row) => row.student_last_name,
        (row) => row.student_first_name,
        (row) => row.roll_no,
        (row) => row.date_of_join,
        (row) => row.class_name,
        (row) => row.section_name,
        (row) => row.student_class_teacher_name,
        (row) => row.gender,
        (row) => row.status,
        (row) => row.exit_status






    ];

    const filteredRecords = (Roles || []).filter((item) =>
        searchableColumns.some((selector) => {
            const value = selector(item);
            const stringValue = String(value || '').toUpperCase().replace(/[-\s]+/g, '');
            const normalizedQuery = searchQuery.toUpperCase().replace(/[-\s]+/g, '');
            return stringValue.includes(normalizedQuery);
        })
    );

 

    
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    return (
        <div className='pageMain'>
            <ToastContainer />
            <LeftNav />
            <div className="pageRight">
                <div className="pageHead">
                    <Header />
                </div>
                <div className="pageBody">
                <div className="commonDataTableHead">
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                                <h6 className="commonTableTitle">Approvals</h6>
                            </div>
                            <div className="">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    className="searchInput"
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <div className="d-flex align-items-center" style={{ gap: 6 }}>
                                
                            </div>
                        </div>
                    </div>

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
                                    data={filteredRecords.length > 0 ? filteredRecords : [{ is_active: 'No records found', is_active: 'No records found' }]}
                                    pagination={Array.isArray(filteredRecords) && filteredRecords.length > 0} 
                                    highlightOnHover
                                    responsive
                                    fixedHeader
                                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                                    conditionalRowStyles={[
                                        {
                                            when: (row) => row.is_active === "No records found",
                                            style: { textAlign: 'center', fontSize: '16px', color: 'red', backgroundColor: '#f9f9f9' },
                                        },
                                    ]}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
                            <Modal
                show={showExitForm}
                onHide={() => setShowExitForm(false)}
                centered
                size="xl"
                
                dialogClassName="fixed-modal"
                

                >

                <Modal.Header closeButton>
                    <Modal.Title>Student Exit</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="px-2 py-1">
                                                <Row className="mb-3">
                       <Col md={6} className="mb-2 d-flex align-items-center">
                                <strong style={{ width: "160px" }}>Student Name:</strong>
                                <span>{form.student_last_name} {form.student_first_name}</span>
                            </Col>
                            <Col md={6} className="mb-2 d-flex align-items-center">
                                <strong style={{ width: "190px" }}>Admission Number:</strong>
                                <span>{form.admission_number}</span>
                            </Col>
 
                            <Col md={6} className="mb-2 d-flex align-items-center">
                                <strong style={{ width: "160px" }}>Class:</strong>
                                <span>{form.class_name}</span>
                            </Col>
                            <Col md={6} className="mb-2 d-flex align-items-center">
                                <strong style={{ width: "190px" }}>Section:</strong>
                                <span>{form.section_name}</span>
                            </Col>
 
                            <Col md={6} className="mb-2 d-flex align-items-center">
                                <strong style={{ width: "160px" }}>Father :</strong>
                                <span>{form.father_surname} {form.father_firstname}</span>
                            </Col>
                            <Col md={6} className="mb-2 d-flex align-items-center">
                                <strong style={{ width: "190px" }}>Mother :</strong>
                                <span>{form.mother_surname} {form.mother_firstname}</span>
                            </Col>
                            <Col md={6} className="mb-2 d-flex align-items-center">
                                <strong style={{ width: "160px" }}>Total Fee:</strong>
                                <span>{grandTotal}</span>
                            </Col>
                            <Col md={6} className="mb-2 d-flex align-items-center">
                                <strong style={{ width: "190px" }}>Total Due:</strong>
                                <span>{totalDue}</span>
                            </Col>
                        </Row>

                        <Table striped bordered  >
                            <thead>
                                <tr>
                                    <th>Term</th>
                                    <th>Term Fee</th>
                                    <th>Paid</th>
                                    <th>Due</th>
                                </tr>
                            </thead>
                            <tbody>
                                {termSummary.map(item => (
                                    <tr key={item.term}>
                                        <td>{item.term}</td>
                                        <td>{item.total}</td>
                                        <td>{item.paid}</td>
                                        <td>{item.due}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
 
                                            <Row className="mb-3">
                        <Col md={6} className="mb-2 d-flex align-items-center">
                        <strong style={{ width: "160px" }}>Exit Type:</strong>
                        <span>{form.exit_type}</span>
                        </Col>

                        <Col md={6} className="mb-2 d-flex align-items-start"> 
                        <strong style={{ width: "160px" }}>Document:</strong>
                        <div style={{ wordBreak: "break-word", maxWidth: "calc(100% - 160px)" }}>
                            {form.document &&
                            form.document.split(',').map((file, index) => (
                                <div key={index}>
                                <a
                                    href={`${baseUrl}/uploads/get-image/${file.trim()}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    style={{ display: "inline-block", wordBreak: "break-word", color: "#0d6efd" }}
                                >
                                    {file.trim()}
                                </a>
                                </div>
                            ))}
                        </div>
                        </Col>




                        <Col md={6} className="mb-2 d-flex align-items-center">
                        <strong style={{ width: "160px" }}>Next School:</strong>
                        <span>{form.which_school_student_has_gone}</span>
                        </Col>

                        <Col md={6} className="mb-2 d-flex align-items-center">
                        <strong style={{ width: "160px" }}>Comments:</strong>
                        <span>{form.exit_reason}</span>
                        </Col>



                        <Col md={6} className="mb-2 d-flex align-items-center">
                        <strong style={{ width: "160px" }}>Date of Exit:</strong>
                        <span>{form.date_of_exit ? new Date(form.date_of_exit).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "numeric", // use "long" for full month name
                            year: "numeric"
                        }) : ""}</span>
                        </Col>


                        <Col md={6} className="mb-2 d-flex align-items-center">
                            <strong style={{ width: "160px" }}>Principal Comments:</strong>
                            {form.exit_status === "Pending" ? (
                                <Form.Control
                                    as="textarea"
                                    value={form.comments || ""}
                                    placeholder="Enter principal comments"
                                    onChange={(e) => setForm({ ...form, comments: e.target.value })}
                                    rows={2}
                                    maxLength={300}
                                    style={{ flex: 1 }}
                                />
                            ) : (
                                <Form.Control
                                    as="textarea"
                                    value={form.comments || ""}
                                    readOnly
                                    rows={2}
                                    style={{ flex: 1, backgroundColor: "#f8f9fa" }}
                                />
                            )}
                        </Col>

                        </Row>

                    </Row>
                </Modal.Body>
                        <Modal.Footer>
            {form.exit_status === "Pending" ? (
                <>
                <Button 
                    variant="danger" 
                    onClick={() => updateExitStatus("Rejected")}
                    disabled={isLoading}
                >
                    Reject
                </Button>

                <Button 
                    variant="success" 
                    onClick={() => updateExitStatus("Approved")}
                    disabled={isLoading}
                >
                    Approve
                </Button>
                </>
            ) : (
                <Button variant="secondary" onClick={() => setShowExitForm(false)}>
                Cancel
                </Button>
            )}
            </Modal.Footer>

            </Modal>
           
        </div>
    );
};

export default Approvals;
