import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Row, Col, Modal, Form, Button, OverlayTrigger } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete, MdAddCircle, MdRemoveRedEye, MdExitToApp } from "react-icons/md";
import { Tooltip } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import { MdFilterList } from "react-icons/md";
import * as XLSX from 'xlsx';
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import loading from "../../assets/images/common/loading.gif";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table } from 'react-bootstrap';



const Students = () => {
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const [fees, setFees] = useState([]);
    const [form, setForm] = useState({
        student_id: "",
        student_first_name: "",
        student_last_name: "",
        dob: "",
        blood_group_id: "",
        blood_group_name: "",
        address: "",
        city: "",
        state: "",
        state_name: "",
        country: "",
        country_name: "",
        date_of_join: "",
        date_of_exit: "",
        createdby: "",
        lastmodifiedby: "",
        image_id: "",
        class_id: "",
        class_name: "",
        section_id: "",
        section_name: "",
        roll_no: "",
        student_class_teacher_id: 0,
        student_class_teacher_name: "",
        aadhar_card_no: "",
        birth_certificate_no: "",
        gender: "",
        permanent_address: "",
        caste: "",
        religion_id: "",
        aadhar_card_upload: "",
        caste_upload: "",
        birth_certificate_upload: "",
        previous_years_tc: "",
        roll_no: "",
        passport_size_photo: "",
        academic_year_id: 0,
        academic_year_name: "",
        admission_number: "",
        mother_tongue: "",
        nationality: "",
        father_occupation: "",
        mother_occupation: "",
        class_last_studied: "",
        class_last_studied_name: "",
        class_name: "",
        previous_school_name: "",
        admission_to: "",
        class_name: "",
        first_language_id: "",
        first_language_name: "",
        second_language_id: "",
        second_language_name: "",
        vaccination: "",
        primary_contact: "",
        father_surname: "",
        father_firstname: "",
        mother_surname: "",
        mother_firstname: "",
        father_email: "",
        mother_email: "",
        father_phone_number: "",
        mother_phone_number: "",
        school_id: 0,
        password: "",
        father_aadhar_number: "",
        father_aadhar_upload: "",
        mother_aadhar_number: "",
        mother_aadhar_upload: "",
        sibling1: "",
        sibling2: "",
        sibling3: "",
        third_language_id: "",
        third_language_name: "",
        student_info: "",
        sibling1_name: "",
        sibling1_phone: "",
        sibling1_date: "",
        sibling2_name: "",
        sibling2_phone: "",
        sibling2_date: "",
        sibling3_name: "",
        sibling3_phone: "",
        sibling3_date: "",
        sibling1_id: "",
        sibling2_id: "",
        sibling3_id: "",
        teacher_id: "",
        guardian_surname: "",
        guardian_firstname: "",
        guardian_email: "",
        guardian_phone_number: "",
        guardian_aadhar_number: "",
        guardian_aadhar_upload: "",
        guardian_occupation: "",
        previous_school_percentage: "",
        permanent_education_number: "",
        date_of_admission: "",
        mole_1: "",
        mole_2: "",
        residential_proof: "",
        medium: "",
        class_of_leaving_id: "",
        class_of_leaving: "",
        tc_upload: "",
        reason_of_leaving: "",
        date_of_tc_issued: "",
        which_school_student_has_gone: "",
        primary_language_id: "",
        primary_language: "",
        sports_certificate: "",
        blood_group_certificate: "",
        record_sheet_date: "",
        record_sheet_upload: "",
        record_sheet_submitted: "",
        remarks: "",
        apaar_number: "",
        tc_number: "",
        Total_Fee: "",
        Total_Due: "",
        grand_total: "",
        exit_type: "",
        document: "",
        exit_reason: "",
        exit_status: "",
        date_of_exit: "",
        comments: "",
    })

    const [showFilterModal, setShowFilterModal] = useState(false);
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleClosePopupModal = () => setShowExitForm(false);
    const [searchQuery, setSearchQuery] = useState("");
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [users, setUsers] = useState([]);
    const [students, setStudents] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [exitstudent, setExitStudent] = useState([]);
    const [readexitstudent, setReadExitStudent] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [imageSetName, setImageSetName] = useState("");
    const [imagePath, setImagePath] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileNamesString, setFileNamesString] = useState("");
    const [uploadedFileNames, setUploadedFileNames] = useState([]);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    const readOnlyRoles = ["Class Teacher", "Teacher", "Class Incharge"];
    const canSubmit = !readOnlyRoles.includes(userObj.role_name?.trim());

    const Roles = ["School Admin"];
    const Admin = !Roles.includes(userObj.role_name?.trim());
    

    const handleShowFilterModal = () => {
        if (classes.length === 0) {
            fetchDropdownData('/classes/', setClasses, userObj.school_id);
        }
        if (users.length === 0) {
            fetchUsers();
        }
        if (academicYears.length === 0) {
            fetchAcademicYears();
        }
        setShowFilterModal(true);
    }

    const fetchDropdownData = async (endpoint, setter, school_id) => {
        try {
            let action = 'READ';
            if (endpoint === "/Users/") {
                action = 'TREAD';
            }
            //  if (endpoint === "/AcademicYear/") {
            //     action = 'DROPDOWNREAD';
            // }

            const payload = { action };

            if (school_id) {
                payload.school_id = school_id;
            }

            const response = await axios.post(baseUrl + endpoint, payload);
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
        }
    };

    const fetchSections = async (class_id) => {
        try {
            const response = await axios.post(baseUrl + "/getsectionsbyteachersubjectmap/", {
                action: "SECTIONREAD",
                school_id: userObj.school_id,
                class_id: class_id
            });
            setSections(response.data);
        } catch (error) {
            console.error("Error fetching section:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.post(baseUrl + "/Users/", {
                action: "TREAD",
                school_id: userObj.school_id
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await axios.post(baseUrl + "/students/", {
                action: "FILTER", school_id: userObj.school_id,
                academic_year_id: userObj.academic_year_id
            });
            setStudents(response.data || []);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const fetchAcademicYears = async () => {
        try {
            const response = await axios.post(baseUrl + "/AcademicYear/", {
                action: "DROPDOWNREAD",
                school_id: userObj.school_id,
            });

            const years = response.data || [];

            setAcademicYears(years);

            // Set default academic year from user object if exists
            const defaultYearId = userObj.academic_year_id;
            if (defaultYearId && !filter.academic_year_id) {
                setFilter((prev) => ({
                    ...prev,
                    academic_year_id: defaultYearId,
                }));
            }
        } catch (error) {
            console.error("Error fetching academic years:", error);
        }
    };

    useEffect(() => {
        fetchExitStudent();
        fetchFees();
    }, []);
    const fetchExitStudent = async () => {
        try {
            const response = await axios.post(baseUrl + "/exitstudent/", {
                action: "UPDATE", school_id: userObj.school_id
            });
            setExitStudent(response.data);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    // const [read, setRead] = useState({
    //     exit_reason: '',
    //     exit_date: '',
    //     exit_status: ''
    // });

    // const fetchExitStudentdetails = async (student_id) => {
    //     try {
    //         const response = await axios.post(baseUrl + "/exitstudent/", {
    //             action: "READ", school_id: userObj.school_id, student_id: student_id
    //         });
    //         setRead(response.data);
    //         console.log(response.data);
    //     } catch (error) {
    //         console.error("Error fetching students:", error);
    //     }
    // };


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

    const handleInputChange = (e) => {
        const { id, value, files } = e.target;

        setForm((prevForm) => ({
            ...prevForm,
            [id]: value
        }));

    };

    useEffect(() => {
        setIsLoading(true);
        fetchStudents().finally(() => setIsLoading(false));
    }, []);

    const formatDate1 = (datetime) => {
        if (!datetime) return "";
        const date = new Date(datetime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}`;
    };

    const handleEditClick = (student_id) => {
        const studentToEdit = students.find(student => student.student_id === student_id);
        if (studentToEdit) {
            navigate("/addstudent", {
                state: {
                    userData: studentToEdit,
                    imgName: studentToEdit.passport_size_photo
                },
            });
        } else {
            console.error(`Student with ID ${student_id} not found.`);
        }
    };

    const handleViewClick = (student_id) => {
        const studentToEdit = students.find(student => student.student_id === student_id);
        if (studentToEdit) {
            navigate("/viewstudents", {
                state: {
                    userData: studentToEdit,
                },
            });
        } else {
            console.error(`Student with ID ${student_id} not found.`);
        }
    };

    const columns = [
        {
            name: "Student ID",
            selector: row => row.student_id,
            cell: row => (
                <Tooltip title={row.student_id}>
                    <span>{row.student_id}</span>
                </Tooltip>
            ),
            sortable: true,
            width: "135px"
        }
        ,
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
            sortable: true
        },
        {
            name: "Surname",
            selector: row => row.student_last_name,
            cell: row => {
                const surName = row.student_last_name || " ";
                return (
                    <Tooltip title={surName}>
                        <span>
                            {surName.length > 12 ? surName.substring(0, 12) + "..." : surName}
                        </span>
                    </Tooltip>
                );
            },
            sortable: true,
            width: "135px"
        },
        {
            name: "First Name",
            selector: row => row.student_first_name,
            cell: row => {
                const firstName = row.student_first_name || " ";
                return (
                    <Tooltip title={firstName}>
                        <span>
                            {firstName.length > 12 ? firstName.substring(0, 12) + ".." : firstName}
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
            width: "105px"  // increased from 105px
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
            sortable: true,
            width: "90px"
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
            width: "135px"
        },
        {
            name: "Gender",
            selector: row => row.gender,
            cell: row => <Tooltip title={row.gender}><span>{row.gender}</span></Tooltip>,
            sortable: true,
            width: "100px"  // increased from 80px
        },
        {
            name: "Status",
            selector: row => row.status,
            cell: row => <Tooltip title={row.status}><span>{row.status}</span></Tooltip>,
            sortable: true,
            width: "100px"
        },
        {
            name: "Actions",
            cell: row => (
                (filteredRecords || []).length > 0 ? (
                    <div className="tableActions">
                        {canSubmit && Admin && (
                            <Tooltip title="Edit" arrow>
                                <span
                                    className="commonActionIcons"
                                    onClick={() => handleEditClick(row.student_id)}
                                >
                                    <MdEdit />
                                </span>
                            </Tooltip>
                        )}
                        <Tooltip title="View" arrow>
                            <a className="commonActionIcons">
                                <span onClick={() => handleViewClick(row.student_id)}><MdRemoveRedEye /></span>
                            </a>
                        </Tooltip>
                        {canSubmit && (
                            <Tooltip title="Delete" arrow>
                                <span
                                    className="commonActionIcons"
                                    onClick={() => handleDeleteClick(row.student_id)}
                                >
                                    <MdExitToApp />
                                </span>
                            </Tooltip>
                        )}

                    </div>
                ) : null
            ),
        },
    ];

    const [showExitForm, setShowExitForm] = useState(false);

    // const handleDeleteClick = async (student_id) => {
    //     try {
    //         const studentToEdit = (students || []).find(student => student.student_id === student_id);
    //         // console.log(studentToEdit);

    //         setForm(studentToEdit);
    //         fetchFees(student_id);
    //         // fetchExitStudentdetails(student_id);
    //         // await fetchExitStudentdetails(student_id);
    //         setShowExitForm(true);
    //     } catch (error) {
    //         console.error("Failed to fetch student details", error);
    //         alert("Error fetching student data");
    //     }
    // };

    const handleDeleteClick = async (student_id) => {
        try {
            setTermSummary([]);
            const studentToEdit = (students || []).find(student => student.student_id === student_id);

            if (studentToEdit) {
                setForm(studentToEdit);
                fetchFees(student_id);

                // Load already uploaded files (comma-separated string) into array
                if (studentToEdit.document) {
                    const filesArray = studentToEdit.document.split(',').map(f => f.trim()).filter(Boolean);
                    setUploadedFileNames(filesArray);
                } else {
                    setUploadedFileNames([]); // clear if no document
                }

                setShowExitForm(true);
            } else {
                console.error("Student not found.");
            }
        } catch (error) {
            console.error("Failed to fetch student details", error);
            alert("Error fetching student data");
        }
    };

    const searchableColumns = [
        (row) => row.student_id,
        (row) => row.admission_number,
        (row) => row.student_first_name,
        (row) => row.student_last_name,
        (row) => row.roll_no,
        (row) => formatDate1(row.date_of_join),
        (row) => row.class_name,
        (row) => row.section_name,
        (row) => row.student_class_teacher_name,
        (row) => row.gender,
        (row) => row.status,
    ];

    const filteredRecords = (students || []).filter((item) =>
        searchableColumns.some((selector) => {
            const value = selector(item);
            const stringValue = String(value || '').toLowerCase().replace(/[-\s]+/g, '');
            const normalizedQuery = searchQuery.toLowerCase().replace(/[-\s]+/g, '');
            return stringValue.includes(normalizedQuery);
        })
    );

    const [filter, setFilter] = useState({
        student_first_name: "",
        student_last_name: "",
        class_id: 0,
        section_id: 0,
        admission_number: "",
        student_class_teacher_id: 0,
        gender: "",
        date_of_join: "",
        academic_year_id: userObj.academic_year_id,
        school_id: userObj.school_id,
        action: "FILTER",
    });

    useEffect(() => {
        if (filter.class_id != 0) {
            fetchSections(filter.class_id || 0);
        }
        else {
            setSections([]);
        }
    }, [filter.class_id]);

    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            student_first_name: filter.student_first_name || "",
            student_last_name: filter.student_last_name || "",
            class_id: filter.class_id || 0,
            section_id: filter.section_id || 0,
            admission_number: filter.admission_number || "",
            student_class_teacher_id: filter.student_class_teacher_id || 0,
            gender: filter.gender || "",
            date_of_join: filter.date_of_join || "",
            academic_year_id: userObj.academic_year_id,
            school_id: userObj.school_id,
            action: "FILTER",
        };
        // const isAnyFieldFilled = Object.values(filter).some(val => val !== "" && val !== "FILTER");
        // if (isAnyFieldFilled) {
        try {
            const response = await axios.post(baseUrl + "/students/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setStudents(response.data || []);
            handleCloseFilterModal();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        // }
    };

    const handleFileChange1 = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFile(files);


        const fileNames = files.map((file) => file.name).join(", ");
        setFileNamesString(fileNames);
    };

    const handleRemoveFile = (fileNameToRemove) => {
        setUploadedFileNames((prevFiles) => {
            const updatedFiles = (prevFiles || []).filter((fileName) => fileName !== fileNameToRemove);

            const updatedFileNamesString = updatedFiles.join(", ");
            setFileNamesString(updatedFileNamesString);

            return updatedFiles;
        });
    };

    const uploadLogo = async () => {
        if (!selectedFile || selectedFile.length === 0) {
            toast.error("Please select at least one file");
            return null;
        }

        const formData = new FormData();
        selectedFile.forEach((file) => {
            formData.append("files", file);
        });

        try {
            const response = await axios.post(`${baseUrl}/uploads/multipleupload/`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const uploadedFilePaths = response.data.uploaded_files.map((file) => file.location);
            return uploadedFilePaths;
        } catch (error) {
            console.error("Error uploading files:", error);
            toast.error("Error uploading files");
            return null;
        }
    };

    const resetForm = () => {
        setForm({
            student_id: "",
            date_of_exit: "",
            exit_type: "",
            document: "",
            exit_reason: "",
            which_school_student_has_gone: "",
            exit_status: "",
            school_id: userObj.school_id,
        });
        setSelectedFile(null);
        setFileNamesString("");
        setUploadedFileNames([]);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        if (!form.exit_type || !["A", "T", "Abscond", "Transfer"].includes(form.exit_type)) {
            toast.error("Please Enter Exit Type");
            return;
        }


        let uploadedFilePaths = form.document || [];

        if (uploadedFileNames.length > 0) {
            uploadedFilePaths = [...uploadedFileNames];
        }

        try {
            if (selectedFile && selectedFile.length > 0) {
                const newFilePaths = await uploadLogo();
                if (newFilePaths) {
                    uploadedFilePaths = [...uploadedFilePaths, ...newFilePaths];
                } else if (!uploadedFilePaths.length) {
                    toast.error("Error uploading files.");
                    return;
                }
            }
        } catch (error) {
            console.error("Error in uploadFiles:", error);
            toast.error("Error uploading files.");
            return;
        }

        const fileNamesOnly = (uploadedFilePaths).map(filePath => {
            return filePath.split(/[\\/]/).pop();
        });
        const approveStatus = { 'Abscond': 'A', 'Transfer': 'T' };
        const selectedStatus = approveStatus[form.exit_type] || form.exit_type;

        const formData = {
            student_id: form.student_id,
            date_of_exit: form.date_of_exit || "",
            exit_type: selectedStatus,
            document: fileNamesOnly.join(", "),
            exit_reason: form.exit_reason || "",
            which_school_student_has_gone: form.which_school_student_has_gone || "",
            exit_status: form.exit_status || "P",
            school_id: userObj.school_id,
            action: "UPDATE"
        };
        try {
            // console.log(formData);
            const response = await axios.post(baseUrl + "/exitstudent/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            // console.log("API Response", response.data)
            setExitStudent(response.data || []);
            toast.success("Sent for Approval");
            fetchStudents();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        resetForm();
        e.target.reset();
    };

    const handleFilterClear = async () => {
        setFilter({
            student_first_name: "",
            student_last_name: "",
            class_id: 0,
            section_id: 0,
            admission_number: "",
            student_class_teacher_id: 0,
            gender: "",
            date_of_join: "",
            academic_year_id: userObj.academic_year_id,
            action: "FILTER",
        });
        fetchStudents();
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const validExtensions = ['.xlsx', '.xls'];
            const extension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.'));
            if (!validExtensions.includes(extension)) {
                toast.warning("Please upload a valid Excel file (.xlsx or .xls)");
                return;
            }
            setFile(selectedFile);
        }
    };

    const generatePassword = () => {
        const length = 10;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*!";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    };

    const columnMappings = [
        { original: 'student_first_name', index: 0 },
        { original: 'student_last_name', index: 1 },
        { original: 'dob', index: 2 },
        { original: 'blood_group_id', index: 3 },
        { original: 'address', index: 4 },
        { original: 'city', index: 5 },
        { original: 'state', index: 6 },
        { original: 'country', index: 7 },
        { original: 'date_of_join', index: 8 },
        { original: 'class_id', index: 9 },
        { original: 'section_id', index: 10 },
        { original: 'student_class_teacher_id', index: 11 },
        { original: 'aadhar_card_no', index: 12 },
        { original: 'birth_certificate_no', index: 13 },
        { original: 'gender', index: 14 },
        { original: 'permanent_address', index: 15 },
        { original: 'caste', index: 16 },
        { original: 'religion_id', index: 17 },
        { original: 'roll_no', index: 18 },
        { original: 'academic_year_id', index: 19 },
        { original: 'admission_number', index: 20 },
        { original: 'mother_tongue', index: 21 },
        { original: 'nationality', index: 22 },
        { original: 'father_occupation', index: 23 },
        { original: 'mother_occupation', index: 24 },
        { original: 'class_last_studied', index: 25 },
        { original: 'previous_school_name', index: 26 },
        { original: 'admission_to', index: 27 },
        { original: 'first_language_id', index: 28 },
        { original: 'second_language_id', index: 29 },
        { original: 'vaccination', index: 30 },
        { original: 'primary_contact', index: 31 },
        { original: 'father_surname', index: 32 },
        { original: 'father_firstname', index: 33 },
        { original: 'mother_surname', index: 34 },
        { original: 'mother_firstname', index: 35 },
        { original: 'father_email', index: 36 },
        { original: 'mother_email', index: 37 },
        { original: 'father_phone_number', index: 38 },
        { original: 'mother_phone_number', index: 39 },
        { original: 'school_id', index: 40 },
        { original: 'father_aadhar_number', index: 41 },
        { original: 'mother_aadhar_number', index: 42 },
        { original: 'sibling1_id', index: 43 },
        { original: 'sibling2_id', index: 44 },
        { original: 'sibling3_id', index: 45 },
        { original: 'third_language_id', index: 46 },
    ];

    const handleUpload = async () => {
        if (!file) {
            toast.warning("Please upload a file");
            return;
        }
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                const dataRows = jsonData.slice(1)
                    .map((row) => {
                        const obj = {};
                        columnMappings.forEach(({ original, index }) => {
                            obj[original] = row[index];
                        });

                        return obj;
                    })
                const defaultObject = {
                    student_id: 0,
                    action: 'CREATE',
                };
                const updatedDataRows = dataRows.map(row => ({
                    ...row,
                    password: generatePassword(),
                    ...defaultObject,
                }));
                const response = await axios.post(baseUrl + "/students/bulk-upload/", updatedDataRows);
                toast.success(response.data.message);
            } catch (error) {
                console.error("Error uploading file:", error);
                toast.error("Error uploading file");
            } finally {
                setFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                fetchStudents();
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="pageMain">
            <ToastContainer />
            <LeftNav />
            <div className="pageRight">
                <div className="pageHead">
                    <Header />
                </div>
                <div className="pageBody">
                    <div className="commonDataTableHead">
                        <div className='d-flex justify-content-between align-items-center w-100'>
                            <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                                <h6 className="commonTableTitle">Student Master</h6>
                            </div>
                            <div className="">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    className="searchInput mx-3"
                                    onChange={handleSearchChange}
                                />
                            </div>
                            <div className="d-flex align-items-center" style={{ gap: 6 }}>
                                {/* <div className="fileUploadPart" style={{ gap: 6 }}>
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls"
                                        onChange={handleFileChange}
                                        ref={fileInputRef}
                                        className="form-control form-control-sm commonFileUpload"
                                    />
                                    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Upload</Tooltip>}>
                                        <Button className="btn primaryBtn"
                                            onClick={handleUpload}
                                        >
                                            <span>Upload</span>
                                        </Button>
                                    </OverlayTrigger>
                                </div> */}
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}>
                                    <Button className="secondaryBtn" variant="Secondary" onClick={handleShowFilterModal}>
                                        <span><MdFilterList /></span>
                                    </Button>
                                </OverlayTrigger>
                                 {canSubmit && (
                                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add</Tooltip>}>
                                    <Button className="primaryBtn" variant="primary" onClick={() => navigate("/addstudent")}>
                                        <span><MdAddCircle /></span>
                                    </Button>
                                </OverlayTrigger>
                                 )}
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
                                    data={filteredRecords.length > 0 ? filteredRecords : [{ class_name: 'No Records Found' }]}
                                    pagination={filteredRecords.length > 0}
                                    highlightOnHover
                                    responsive
                                    fixedHeader
                                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                                    conditionalRowStyles={[
                                        {
                                            when: (row) => row.class_name === 'No Records Found',
                                            style: { textAlign: 'center', fontSize: '16px', color: 'red', backgroundColor: '#f9f9f9' },
                                        },
                                    ]}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
                .custom-dialog {
                    max-width: 95% !important;
                    width: 95% !important;
                }

                .custom-dialog .modal-content {
                    max-height: 90vh;
                    overflow-y: auto;
                }
                `}
            </style>


            <Modal show={showExitForm} onHide={() => setShowExitForm(false)} centered size="xl" style={{ maxWidth: "95%", width: "95%" }} dialogClassName="fixed-modal" >
                <Modal.Header closeButton>
                    <Modal.Title>Student Exit</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form id="ModalForm" onSubmit={handleModalSubmit}>
                        <Row className="px-3 pt-2">
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
                                <strong style={{ width: "160px" }}>Father:</strong>
                                <span>{form.father_surname} {form.father_firstname}</span>
                            </Col>
                            <Col md={6} className="mb-2 d-flex align-items-center">
                                <strong style={{ width: "190px" }}>Mother:</strong>
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
                            <Table striped bordered hover responsive className="mt-3"  >
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
                            <Col md={6} className="mb-2 d-flex">
                                <strong style={{ width: "160px" }}>Exit Type:</strong>
                                <div className="d-flex gap-4">
                                    <Form.Check
                                        type="radio"
                                        label="Abscond"
                                        disabled={
                                            form.exit_status?.toLowerCase() === "approved" ||
                                            form.exit_status?.toLowerCase() === "pending"
                                        }
                                        name="exitType"
                                        value="A"
                                        checked={form.exit_type === "A" || form.exit_type === "Abscond"}
                                        onChange={(e) => setForm({ ...form, exit_type: e.target.value })}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Transfer"
                                        name="exitType"
                                        disabled={
                                            form.exit_status?.toLowerCase() === "approved" ||
                                            form.exit_status?.toLowerCase() === "pending"
                                        }
                                        value="T"
                                        checked={form.exit_type === "T" || form.exit_type === "Transfer"}
                                        onChange={(e) => setForm({ ...form, exit_type: e.target.value })}
                                    />
                                </div>
                            </Col>
                            <Col xs={12} md={6} lg={6}>
                                <div className="mb-2 d-flex align-items-center">
                                    <strong style={{ width: "160px" }}>Document:</strong>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <input
                                            type="file"
                                            id="document"
                                            multiple
                                            onChange={handleFileChange1}
                                            disabled={
                                                form.exit_status?.toLowerCase() === "approved" ||
                                                form.exit_status?.toLowerCase() === "pending"
                                            }
                                            accept="image/*,application/pdf"
                                            style={{
                                                flex: 1,
                                                padding: "6px",
                                                fontSize: "14px",
                                                border: "1px solid #ccc",
                                                borderRadius: "4px",
                                            }}
                                        />
                                        <Button
                                            variant="primary"
                                            disabled={
                                                form.exit_status?.toLowerCase() === "approved" ||
                                                form.exit_status?.toLowerCase() === "pending"
                                            }
                                            style={{ padding: "6px 12px", fontSize: "14px" }}
                                            onClick={async () => {
                                                if (selectedFile && selectedFile.length > 0) {
                                                    const newFilePaths = await uploadLogo();
                                                    if (newFilePaths) {
                                                        setUploadedFileNames((prev) => [...prev, ...newFilePaths]);
                                                        setSelectedFile(null);
                                                    }
                                                } else {
                                                    toast.error("Please select at least one file");
                                                }
                                            }}
                                        >
                                            Upload
                                        </Button>
                                    </div>
                                </div>

                                {/* Uploaded Files block */}
                                <div className="commonInput">
                                    {uploadedFileNames.length > 0 && (
                                        <div>
                                            <p>Uploaded Files:</p>
                                            <table
                                                className="table table-bordered"
                                                style={{ fontSize: "14px", width: "100%", minWidth: "0px" }}
                                            >
                                                <thead>
                                                    <tr>
                                                        <td style={{ width: "70%" }}>File Name</td>
                                                        <td style={{ width: "30%" }}>Actions</td>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {uploadedFileNames.map((fileName, index) => {
                                                        const cleanFileName = fileName.trim().split(/[\\/]/).pop();

                                                        return (
                                                            <tr key={index}>
                                                                <td>
                                                                    <a
                                                                        href={`${baseUrl}/uploads/get-image/${encodeURIComponent(
                                                                            cleanFileName
                                                                        )}`}
                                                                        download={cleanFileName}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        style={{ fontSize: "12px" }}
                                                                    >
                                                                        {cleanFileName}
                                                                    </a>
                                                                </td>
                                                                <td>
                                                                    {form.exit_status?.toLowerCase() !== "pending" && form.exit_status?.toLowerCase() !== "approved" ? (
                                                                        <span
                                                                            style={{ cursor: "pointer", color: "red", fontSize: "16px" }}
                                                                            onClick={() => handleRemoveFile(fileName)}
                                                                        >
                                                                            ✖
                                                                        </span>
                                                                    ) : (
                                                                        <span style={{ color: "#aaa", fontSize: "16px", cursor: "not-allowed" }}>
                                                                            ✖
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </Col>

                            {/* Moved Next School below Uploaded Files and aligned left */}
                            <Col md={6} className="mb-2 d-flex align-items-center">
                                <strong style={{ width: "160px" }}>Next School:</strong>
                                <Form.Control
                                    type="text"
                                    id="which_school_student_has_gone"
                                    disabled={
                                        form.exit_status?.toLowerCase() === "approved" ||
                                        form.exit_status?.toLowerCase() === "pending"
                                    }
                                    value={form.which_school_student_has_gone}
                                    placeholder="Enter School Name"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^[A-Za-z\s]*$/.test(value)) {
                                            handleInputChange(e);
                                        }
                                    }}
                                    maxLength={255}
                                    style={{ flex: 1 }}
                                />
                            </Col>

                            <Col md={6} className="mb-2 d-flex">
                                <strong style={{ width: "160px" }}>Comments:</strong>
                                <Form.Control
                                    as="textarea"
                                    value={form.exit_reason}
                                    disabled={
                                        form.exit_status?.toLowerCase() === "approved" ||
                                        form.exit_status?.toLowerCase() === "pending"
                                    }
                                    placeholder="Enter Comments"
                                    onChange={(e) => setForm({ ...form, exit_reason: e.target.value })}
                                    maxLength={250}
                                    style={{ flex: 1 }}
                                />
                            </Col>
                            <Col md={6} className="mb-2 d-flex align-items-center">
                                <strong style={{ width: "160px" }}>Date of Exit:</strong>
                                <Form.Control
                                    type="date"
                                    id="date_of_exit"
                                    value={form.date_of_exit}
                                    disabled={
                                        form.exit_status?.toLowerCase() === "approved" ||
                                        form.exit_status?.toLowerCase() === "pending"
                                    }
                                    onChange={handleInputChange}
                                    style={{ maxWidth: "300px" }}
                                />
                            </Col>
                            <Col md={6} className="mb-2 d-flex align-items-center">
                                <strong style={{ width: "160px" }}>Exit Status:</strong>
                                <span>{form.exit_status}</span>
                            </Col>
                            {form.exit_status === "Rejected" && (
                                <Col md={6} className="mb-2 d-flex align-items-center">
                                    <strong style={{ width: "190px" }}>Principal Comments:</strong>
                                    <span>{form.comments}</span>
                                </Col>
                            )}
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowExitForm(false)}>
                        Cancel
                    </Button>
                    {form.exit_status !== "Approved" && form.exit_status !== "Pending" && (
                        <Button type="submit" variant="primary" form="ModalForm" onClick={handleClosePopupModal}>
                            Submit
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            <Modal show={showFilterModal} onHide={handleCloseFilterModal} className="commonFilterModal">
                <Modal.Header closeButton className="modalHeaderFixed">
                    <Modal.Title>Filter</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBodyScrollable">
                    <Form id="filterForm" onSubmit={handleFilterSubmit}>
                        <Row>
                            <Col xs={12}>
                                <div className="commonInput">
                                    <Form.Group controlId="academic_year_id">
                                        <Form.Label>Academic Year</Form.Label>
                                        <Form.Select
                                            as="select"
                                            className="custom-select"
                                            value={filter.academic_year_id}
                                            onChange={(e) =>
                                                setFilter({ ...filter, academic_year_id: parseInt(e.target.value) })
                                            }
                                        >
                                            <option value="">Select Academic Year</option>
                                            {(academicYears || []).map((year) => (
                                                <option key={year.academic_year_id} value={year.academic_year_id}>
                                                    {year.academic_year_name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="firstName">
                                        <Form.Label>Admission Number</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="admission_number"
                                            placeholder="Enter Admission Number"
                                            value={filter.admission_number}
                                            maxLength={30}
                                            onChange={(e) => setFilter({ ...filter, admission_number: e.target.value.trim() })}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="surName">
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="student_first_name"
                                            placeholder="Enter First Name"
                                            value={filter.student_first_name}
                                            maxLength={30}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                                setFilter({ ...filter, student_first_name: value });
                                            }}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="surName">
                                        <Form.Label>Surname</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="surName"
                                            placeholder="Enter Surname"
                                            value={filter.student_last_name}
                                            maxLength={30}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                                setFilter({ ...filter, student_last_name: value });
                                            }}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group controlId="surName">
                                        <Form.Label>DOJ</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="doj"
                                            value={filter.date_of_join}
                                            onChange={(e) => setFilter({ ...filter, date_of_join: e.target.value.trim() })}
                                        />
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group>
                                        <Form.Label> Class </Form.Label>
                                        <select
                                            type="number"
                                            className="form-select"
                                            id="class_id"
                                            value={filter.class_id}
                                            onChange={(e) => setFilter({ ...filter, class_id: e.target.value })}
                                        >
                                            <option value="0">Select Class</option>
                                            {(classes || [])
                                                .filter((classItem) => classItem.is_active === "Active") // Filter to include only active classes
                                                .map((classItem) => (
                                                    <option key={classItem.class_id} value={classItem.class_id}>
                                                        {classItem.class_name}
                                                    </option>
                                                ))}
                                        </select>
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group>
                                        <Form.Label>Section</Form.Label>
                                        <select
                                            className="form-select"
                                            id="section_id"
                                            value={filter.section_id}
                                            onChange={(e) => setFilter({ ...filter, section_id: e.target.value })}
                                        >
                                            <option value="0">Select Section</option>
                                            {(sections || []).map((section, index) => (
                                                <option key={index} value={section.section_id}>
                                                    {section.section_name}
                                                </option>
                                            ))}
                                        </select>
                                        <Form.Control.Feedback>Required</Form.Control.Feedback>
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div className='commonInput'>
                                    <Form.Group>
                                        <Form.Label>Class Teacher</Form.Label>
                                        <select
                                            className="form-select"
                                            id="student_class_teacher_id"
                                            value={filter.student_class_teacher_id}
                                            onChange={(e) => setFilter({ ...filter, student_class_teacher_id: e.target.value })}
                                        >
                                            <option value="0">Select Class Teacher</option>
                                            {(users || []).map((users) => (
                                                <option key={users.userid} value={users.userid}>
                                                    {users.surname + " " + users.firstname}
                                                </option>
                                            ))}
                                        </select>
                                    </Form.Group>
                                </div>
                            </Col>
                            <Col xs={12} >
                                <div className='commonInput'>
                                    <Form.Group controlId="is_current_year">
                                        <Form.Label>Gender</Form.Label>
                                        <Form.Select
                                            type="text"
                                            name="gender"
                                            value={filter.gender}
                                            onChange={(e) => setFilter({ ...filter, gender: e.target.value })}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="M">Male</option>
                                            <option value="F">Female</option>
                                        </Form.Select>
                                        <Form.Control.Feedback>Required</Form.Control.Feedback>
                                    </Form.Group>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modalFooterFixed">
                    <Button
                        variant="secondary"
                        className="btn-info clearBtn"
                        onClick={handleFilterClear}
                    >
                        Reset
                    </Button>

                    <div className="">
                        <Button variant="secondary" className="btn-danger secondaryBtn"
                            onClick={() => { handleCloseFilterModal(); }}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" className="btn-success primaryBtn" form="filterForm" onClick={handleCloseFilterModal}>
                            Search
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Students;
