import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form, Tabs, Tab, OverlayTrigger } from "react-bootstrap";
import Header from "../../components/layout/header/header";
import { ToastContainer, toast } from 'react-toastify';
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { Modal } from "react-bootstrap";

function AddStudent() {
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const [showParentDetails, setShowParentDetails] = useState("Student Details");
    const [readstudents, setReadstudents] = useState([]);
    const [students, setStudents] = useState([]);
    const [religions, setReligions] = useState([]);
    const [states, setStates] = useState([]);
    const [schools, setSchools] = useState([]);
    const [users, setUsers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [bloodgroups, setBloodGroup] = useState([]);
    const [academics, setAcademics] = useState([]);
    const [countrys, setCountrys] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const routeLocation = useLocation();
    const imgName = routeLocation.state?.imgName || "";
    const [editId, setEditId] = useState(null);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [imagePath, setImagePath] = useState("");
    const [imageSetName, setImageSetName] = useState("");
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
    })

    useEffect(() => {
        if (form.class_id != 0) {
            fetchSections(form.class_id || 0);
        }
        else {
            setSections()
        }
    }, [form.class_id]);

    useEffect(() => {
        if (routeLocation.state?.userData) {
            const userData = routeLocation.state.userData;
            setForm(userData);
            setEditId(userData.student_id);
            window.history.replaceState({}, document.title);
        }
    }, [routeLocation]);

    useEffect(() => {
        if (imgName) {
            const apiUrl = baseUrl + `/uploads/get-image/${imgName}`;
            setImagePath(apiUrl);
            setImageSetName(imgName);
            setTimeout(() => {
            }, 0);
        } else {
        }
    }, [imgName]);


    const generatePassword = () => {
        const length = 10;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*!";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    };

    const uploadLogo = async () => {
        if (!selectedFile) {
            toast.error("Please select a logo image");
            return null;
        }
        const formData = new FormData();
        formData.append("file", selectedFile);
        try {
            const response = await axios.post(
                baseUrl + "/uploads/upload/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data.filename;
        } catch (error) {
            console.error("Error uploading logo:", error);
            toast.error("Error uploading logo");
            return;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let uploadedLogoPath = form.passport_size_photo;
        try {
            if (selectedFile) {
                uploadedLogoPath = await uploadLogo();
                if (!uploadedLogoPath) {
                    throw new Error("File upload failed.");
                }
            }
        } catch (error) {
            console.error("Error uploading logo:", error);
            toast.error("Error uploading logo: " + error.message);
            return;
        }
        const approveStatus = { 'Male': 'M', 'Female': 'F' };
        const selectedStatus = approveStatus[form.gender] || form.gender;

        const approveVaccination = { 'Yes': 'Y', 'No': 'N' };
        const selectedVaccination = approveVaccination[form.vaccination] || form.vaccination;
        const password = editId !== null ? form.password : generatePassword();
        const formData = {
            student_first_name: form.student_first_name,
            student_last_name: form.student_last_name,
            dob: form.dob || "",
            blood_group_id: form.blood_group_id || 0,
            address: form.address || "",
            city: form.city || "",
            state: form.state || 0,
            country: form.country || 0,
            date_of_join: form.date_of_join || "",
            date_of_exit: form.date_of_exit || "",
            createdby: form.createdby,
            lastmodifiedby: form.lastmodifiedby,
            image_id: form.image_id,
            class_id: form.class_id || 0,
            section_id: form.section_id || 0,
            student_class_teacher_id: teacherId || 0,
            aadhar_card_no: form.aadhar_card_no || "",
            birth_certificate_no: form.birth_certificate_no || "",
            gender: selectedStatus || "",
            permanent_address: form.permanent_address || "",
            caste: form.caste || "",
            religion_id: form.religion_id || 0,
            aadhar_card_upload: form.aadhar_card_upload || "",
            caste_upload: form.caste_upload || "",
            birth_certificate_upload: form.birth_certificate_upload || "",
            previous_years_tc: form.previous_years_tc || "",
            roll_no: form.roll_no || 0,
            passport_size_photo: selectedFile ? selectedFile.name : form.passport_size_photo || "",
            academic_year_id: userObj.academic_year_id,
            admission_number: form.admission_number,
            mother_tongue: form.mother_tongue || "",
            nationality: form.nationality || "",
            father_occupation: form.father_occupation || "",
            mother_occupation: form.mother_occupation || "",
            class_last_studied: form.class_last_studied || 0,
            previous_school_name: form.previous_school_name || "",
            admission_to: form.admission_to || 0,
            first_language_id: form.first_language_id || 0,
            second_language_id: form.second_language_id || 0,
            vaccination: selectedVaccination || "",
            primary_contact: form.primary_contact,
            father_surname: form.father_surname || "",
            father_firstname: form.father_firstname || "",
            mother_surname: form.mother_surname || "",
            mother_firstname: form.mother_firstname || "",
            father_email: form.father_email || "",
            mother_email: form.mother_email || "",
            father_phone_number: form.father_phone_number || "",
            mother_phone_number: form.mother_phone_number || "",
            school_id: userObj.school_id,
            password,
            father_aadhar_number: form.father_aadhar_number || "",
            father_aadhar_upload: form.father_aadhar_upload || "",
            mother_aadhar_number: form.mother_aadhar_number || "",
            mother_aadhar_upload: form.mother_aadhar_upload || "",
            sibling1_id: form.sibling1_id || 0,
            sibling2_id: form.sibling2_id || 0,
            sibling3_id: form.sibling3_id || 0,
            third_language_id: form.third_language_id || 0,
            guardian_firstname: form.guardian_firstname || "",
            guardian_surname: form.guardian_surname || "",
            guardian_email: form.guardian_email || "",
            guardian_aadhar_number: form.guardian_aadhar_number || "",
            guardian_aadhar_upload: form.guardian_aadhar_upload || "",
            guardian_phone_number: form.guardian_phone_number || "",
            guardian_occupation: form.guardian_occupation || "",
            previous_school_percentage: form.previous_school_percentage || "",
            action: editId !== null ? 'UPDATE' : 'CREATE'
        };
        navigate("/students");

        if (editId !== null) {
            formData.student_id = editId;
        }
        try {
            const response = await axios.post(baseUrl + "/students/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (editId !== null) {
                toast.success("Record Updated Successfully");
                setEditId(null);
            } else {
                toast.success("Record Added Successfully");
            }
        } catch (error) {
            if (error.response) {
                const { status, data } = error.response;
                if (status === 400 && data.error === "Student name with admission number already exists.") {
                    toast.error("Student name with admission number already exists.", { position: "top-right" });
                }
                else if (status === 400 && data.error === "Father email already exists.") {
                    toast.error("Father email already exists.", { position: "top-right" });
                }
                else if (status === 400 && data.error === "Mother email already exists.") {
                    toast.error("Mother email already exists.", { position: "top-right" });
                } else if (status === 500) {
                    toast.error("Error submitting data: " + (data.error || error.message), { position: "top-right" });
                } else {
                    toast.error("Unexpected error occurred", { position: "top-right" });
                }
            } else {
                console.error("There was an error submitting:", error);
                toast.error("Error submitting data: " + error.message, { position: "top-right" });
            }
        }
        setForm({
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
            school_id: "",
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
            India: "India",
            guardian_surname: "",
            guardian_firstname: "",
            guardian_email: "",
            guardian_phone_number: "",
            guardian_aadhar_number: "",
            guardian_aadhar_upload: "",
            guardian_occupation: "",
            previous_school_percentage: "",
        });
        setSelectedFile(null);
        setteacherId("");
        setImagePath("");
        setImageSetName("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    useEffect(() => {
        fetchStudents();
        fetchReadStudents();
        fetchDropdownData('/AcademicYear/',setAcademics,userObj.school_id);
        fetchDropdownData('/classes/', setClasses, userObj.school_id);
        fetchDropdownData('/Users/', setUsers, userObj.school_id);
        fetchDropdownData('/states/', setStates);
        fetchDropdownData('/country/', setCountrys);
        fetchDropdownData('/language/', setLanguages);
        fetchDropdownData('/bloodgroup/', setBloodGroup);
        fetchDropdownData('/schoolmaster/', setSchools);
        fetchDropdownData('/religion/', setReligions);
    }, []);

    const fetchDropdownData = async (endpoint, setter) => {
        try {
            let action = 'READ';
            if (endpoint === "/AcademicYear/") {
                action = 'CURRENTREAD';
            }
            const response = await axios.post(baseUrl + endpoint, { action });
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
        }
    };
    
    const fetchStudents = async () => {
        try {
            const response = await axios.post(baseUrl + "/students/", {
                action: "READ",
            });
            setStudents(response.data);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const fetchReadStudents = async () => {
        try {
            const response = await axios.post(baseUrl + "/readstudents/", {
                action: "READ"
            });
            if (Array.isArray(response.data)) {
                const options = response.data.map((readstudent) => ({
                    value: readstudent.student_id,
                    label: readstudent.student_info,
                }));

                setReadstudents(options);
            } else {
                console.error('Unexpected response format:', response.data);
            }
        } catch (error) {
            console.log("Error fetching data:", error)
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

    useEffect(() => {
        if (form.class_id !== 0 && form.section_id !== 0) {
            fetchUsers(form.class_id || 0, form.section_id || 0);
        }
    }, [form.class_id, form.section_id]);

    const [teacherId, setteacherId] = useState("");
    const fetchUsers = async (class_id, section_id) => {
        try {
            const response = await axios.post(baseUrl + "/getteachers/", {
                action: "READ",
                school_id: userObj.school_id,
                academic_year_id: userObj.academic_year_id,
                class_id: class_id,
                section_id: section_id
            });
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                setUsers(response.data);
                setteacherId(response.data[0].teacher_id);
            } else {
                setUsers("");
            }
        } catch (error) {
            console.error("Error fetching Class Teacher:", error);
        }
    };

    const handleRadioChange = (e) => {
        setForm((prevForm) => ({
            ...prevForm,
            gender: e.target.value
        }));
    };

    const handleRadioChange1 = (e) => {
        setForm((prevForm) => ({
            ...prevForm,
            vaccination: e.target.value
        }));
    };

    const handleInputChange1 = (e) => {
        const { id, value } = e.target;
        setForm((prevForm) => {
            if (id === "admission_to") {
                return {
                    ...prevForm,
                    admission_to: value,
                    class_id: value,
                };
            } else if (id === "class_id") {
                return {
                    ...prevForm,
                    class_id: value,
                };
            }
            return prevForm;
        });
    };

    const handleInputChange = (e) => {
        const { id, value, files } = e.target;
        if (id === "passport_size_photo" && files.length > 0) {
            const file = files[0];
            setForm((prevState) => ({
                ...prevState,
                passport_size_photo: file,
            }));
        }
        else if (id === "father_phone_number" || id === "mother_phone_number" || id === "primary_contact" || id === "roll_no" || id === "father_aadhar_number" || id === "mother_aadhar_number" || id === "aadhar_card_no" || id === "guardian_phone_number" || id === "guardian_aadhar_number") {
            if (/^\d*$/.test(value)) {
                setForm((prevForm) => ({
                    ...prevForm,
                    [id]: value,
                }));
            }
        }
        else if (id === "aadhar_card_upload" && files.length > 0) {
            const file = files[0];
            setForm(prevForm => ({
                ...prevForm,
                aadhar_card_upload: file,
            }));
        }
        else if (id === "caste_upload" && files.length > 0) {
            const file = files[0];
            setForm(prevForm => ({
                ...prevForm,
                caste_upload: file,
            }));
        }
        else if (id === "mother_tongue" || id === "nationality" || id === "caste" || id === "father_occupation" || id === "mother_occupation" || id === "guardian_occupation") {
            if (/^[A-Za-z]*$/.test(value)) {
                setForm((prevForm) => ({
                    ...prevForm,
                    [id]: value,
                }));
            }
        }
        else if (id === "class_id") {
            const selectedClass = classes.find(classe => String(classe.class_id) === String(value));
            setForm((prevForm) => ({
                ...prevForm,
                class_id: value,
                class_name: selectedClass ? selectedClass.class_name : "", 
            }));
        }
        else if (id === "admission_to") {
            const selectedClass = classes.find(classe => String(classe.class_id) === String(value));
            setForm((prevForm) => ({
                ...prevForm,
                admission_to: value,
                next_joining_class_name: selectedClass ? selectedClass.class_name : "",  
            }));
        }
        else if (id === "class_last_studied") {
            const selectedClass = classes.find(classe => String(classe.class_id) === String(value));
            setForm((prevForm) => ({
                ...prevForm,
                class_last_studied: value,
                class_last_studied_name: selectedClass ? selectedClass.class_name : "",  
            }));
        }
        else if (id === "academic_year_id") {
            const selectedAcademics = academics.find(academic => String(academic.academic_year_id) === String(value));
            setForm((prevForm) => ({
                ...prevForm,
                academic_year_id: value,
                academic_year_name: selectedAcademics ? selectedAcademics.academic_year_name : "",  
            }));
        }
        else if (id === "religion_id") {
            const selectedReligions = religions.find(religion => String(religion.religion_id) === String(value));
            setForm((prevForm) => ({
                ...prevForm,
                religion_id: value,
                religion_name: selectedReligions ? selectedReligions.religion_name : "",  
            }));
        }
        else if (id === "first_language_id") {
            const selectedLanguages = languages.find(language => String(language.first_language_id) === String(value));
            setForm((prevForm) => ({
                ...prevForm,
                first_language_id: value,
                first_language_name: selectedLanguages ? selectedLanguages.language_name : "",  
            }));
        }
        else if (id === "second_language_id") {
            const selectedLanguages = languages.find(language => String(language.second_language_id) === String(value));
            setForm((prevForm) => ({
                ...prevForm,
                second_language_id: value,
                second_language_name: selectedLanguages ? selectedLanguages.language_name : "",  
            }));
        }
        else if (id === "third_language_id") {
            const selectedLanguages = languages.find(language => String(language.third_language_id) === String(value));
            setForm((prevForm) => ({
                ...prevForm,
                third_language_id: value,
                third_language_name: selectedLanguages ? selectedLanguages.language_name : "",  
            }));
        }
        else if (id === "section_id") {
            const selectedSection = sections.find(section => String(section.section_id) === String(value));
            setForm((prevForm) => ({
                ...prevForm,
                section_id: value,
                section_name: selectedSection ? selectedSection.section_name : "",
            }));
        }
        else if (id === "blood_group_id") {
            const selectedBloodGroup = bloodgroups.find(bloodgroup => String(bloodgroup.blood_group_id) === String(value));
            setForm((prevForm) => ({
                ...prevForm,
                blood_group_id: value,
                blood_group_name: selectedBloodGroup ? selectedBloodGroup.blood_group_name : "",
            }));
        }
        else if (id === "state") {
            const selectedState = states.find(state => String(state.state) === String(value));
            setForm((prevForm) => ({
                ...prevForm,
                state: value,
                state_name: selectedState ? selectedState.state_name : "",
            }));
        }
        else if (id === "teacher_id") {
            const selectedSection = users.find(user => String(user.teacher_id) === String(value));
            setForm((prevForm) => ({
                ...prevForm,
                teacher_id: value,
                teacher_name: selectedSection ? selectedSection.teacher_name : "",
            }));
        }
        else {
            setForm((prevForm) => ({
                ...prevForm,
                [id]: value
            }));
        }
    };

    const selectedFirstLang = parseInt(form.first_language_id);
    const selectedSecondLang = parseInt(form.second_language_id);

    const secondLangOptions = languages.filter(
        (lang) => lang.language_id !== selectedFirstLang
    );

    const thirdLangOptions = languages.filter(
        (lang) =>
            lang.language_id !== selectedFirstLang &&
            lang.language_id !== selectedSecondLang
    );

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validImageTypes = [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
            ];
            if (validImageTypes.includes(file.type)) {
                setImageSetName(file.name);
                setSelectedFile(file);
                const imageUrl = URL.createObjectURL(file);
                setImagePath(imageUrl);
            } else {
                alert("Please upload a valid image file (jpg, jpeg, png, gif, webp).");
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setImageSetName("");
        setImagePath("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
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

    const handleSelectChange = (selectedOption, field) => {
        if (selectedOption) {
            const [name, phone, date] = selectedOption.label.split(" - ");
            setForm((prevForm) => ({
                ...prevForm,
                [field]: selectedOption.value,
                [`${field}_id`]: selectedOption.value,
                [`${field}_name`]: name,
                [`${field}_phone`]: phone,
                [`${field}_date`]: date
            }));
        } else {
            // Handle clearing the selection
            setForm((prevForm) => ({
                ...prevForm,
                [field]: null,
                [`${field}_id`]: null,
                [`${field}_name`]: "",
                [`${field}_phone`]: "",
                [`${field}_date`]: ""
            }));
        }
    };

    const tabs = ["Student Details", "Class Details", "ID Details", "Parent Details", "Previous School", "Sibling Details", "Review&Submit"];

    const formRef = useRef(null);
    const handleNext = () => {
        const form = formRef.current;
        if (!form) return;
        form.reportValidity();
        if (!form.checkValidity()) {
            return;
        }
        const fatherFirstName = form.querySelector("#father_firstname")?.value.trim();
        const fatherSurname = form.querySelector("#father_surname")?.value.trim();
        const fathercontact = form.querySelector("#father_phone_number")?.value.trim();
        const motherFirstName = form.querySelector("#mother_firstname")?.value.trim();
        const motherSurname = form.querySelector("#mother_surname")?.value.trim();
        const mothercontact = form.querySelector("#mother_phone_number")?.value.trim();
        const guardianFirstName = form.querySelector("#guardian_firstname")?.value.trim();
        const guardianSurname = form.querySelector("#guardian_surname")?.value.trim();
        const guardiancontact = form.querySelector("#guardian_phone_number")?.value.trim();

        const isFatherFilled = fatherFirstName !== "" && fatherSurname !== "" && fathercontact !== "" ;
        const isMotherFilled = motherFirstName !== "" && motherSurname !== "" && mothercontact !== "" ;
        const isGuardianFilled = guardianFirstName !== "" && guardianSurname !== "" && guardiancontact !== "";

        if (!isFatherFilled && !isMotherFilled && !isGuardianFilled) {
            toast.warning("Please fill atleast Father or Mother or Guardian details to proceed.");
            return; 
        }
        handlePrevNext("next");
    };

    const handlePrevNext = (direction) => {
        const currentIndex = tabs.indexOf(showParentDetails);
        if (direction === "prev" && currentIndex > 0) {
            setShowParentDetails(tabs[currentIndex - 1]);
        } else if (direction === "next" && currentIndex < tabs.length - 1) {
            setShowParentDetails(tabs[currentIndex + 1]);
        }
    };

    const handleTabSelect = (selectedKey) => {
        const form = formRef.current;
        if (!form) return;

        const currentIndex = tabs.indexOf(showParentDetails);
        const newIndex = tabs.indexOf(selectedKey);

        // Allow moving to previous tabs freely
        if (newIndex < currentIndex) {
            setShowParentDetails(selectedKey);
            return;
        }
        // Check if the current tab is valid before moving forward
        form.reportValidity();
        if (!form.checkValidity()) {
            return; 
        }
        // Validate all previous required tabs
        for (let i = 0; i < newIndex; i++) {
            if (!isTabValid(tabs[i])) {
                toast.warning(`${tabs[i]} is required before moving forward.`);
                return;
            }
        }
        setShowParentDetails(selectedKey);
    };

    const isTabValid = (tab) => {
        switch (tab) {
            case "Student Details":
                return form.admission_number && form.student_first_name && form.dob && form.date_of_join && form.gender;
            case "Class Details":
                return form.class_id && form.class_name;
            case "ID Details":
                return form.aadhar_card_no && form.birth_certificate_no;
            case "Parent Details":
                return form.mother_firstname && form.mother_surname || form.father_firstname && form.father_surname || form.guardian_firstname && form.guardian_surname;
            default:
                return true; 
        }
    };

    const getFilteredOptions = (siblingKey) => {
        const selectedIds = [form.sibling1_id, form.sibling2_id, form.sibling3_id].filter(Boolean);
        return readstudents.filter((option) => !selectedIds.includes(option.value) || form[siblingKey] === option.value);
    };

    const navigate = useNavigate();

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <div className="pageMain">
                <ToastContainer />
                <LeftNav /> {/* Keeping LeftNav as it is */}
                <div className="pageRight">
                    <div className="pageHead">
                        <Header />
                    </div>
                    <div className="pageBody">
                        <Container fluid>
                            <Card>
                                <Card.Header className="d-flex justify-content-left align-items-center">
                                    <Tabs activeKey={showParentDetails} onSelect={handleTabSelect}>
                                        {tabs.map((tab, index) => (
                                            <Tab key={index} eventKey={tab} title={tab} />
                                        ))}
                                    </Tabs>
                                </Card.Header>
                                <Card.Footer className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex">
                                        {showParentDetails === "Review&Submit" && (
                                            <Button
                                                type="button"
                                                className="btn btn-info clearBtn"
                                                onClick={() => setForm({
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
                                                    passport_size_photo: "",
                                                    academic_year_id: 0,
                                                    academic_year_name: "",
                                                    admission_number: "",
                                                    mother_tongue: "",
                                                    nationality: "",
                                                    father_occupation: "",
                                                    mother_occupation: "",
                                                    class_last_studied: "",
                                                    previous_school_name: "",
                                                    admission_to: "",
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
                                                    India: "India",
                                                    guardian_surname: "",
                                                    guardian_firstname: "",
                                                    guardian_email: "",
                                                    guardian_phone_number: "",
                                                    guardian_aadhar_number: "",
                                                    guardian_aadhar_upload: "",
                                                    guardian_occupation: "",
                                                    previous_school_percentage: "",
                                                })}
                                            >
                                                Reset
                                            </Button>
                                        )}
                                    </div>
                                    <div className="d-flex gap-2" >
                                        <Button
                                            variant="primary"
                                            className="btn-danger secondaryBtn ms-5"
                                            onClick={() => navigate("/students")}
                                        >
                                            Cancel
                                        </Button>
                                        {showParentDetails !== tabs[0] && (
                                            <Button onClick={() => handlePrevNext("prev")}>
                                                <span>{"<< Prev "}</span>
                                            </Button>
                                        )}

                                        {showParentDetails !== "Review&Submit" && tabs.includes(showParentDetails) && (
                                            <Button
                                                onClick={handleNext}
                                                disabled={showParentDetails === tabs[tabs.length - 1]}
                                            >
                                                <span>{"Next >>  "}</span>
                                            </Button>
                                        )}

                                        {showParentDetails === "Review&Submit" && (
                                            <Button variant="primary" className="btn btn-success primaryBtn" onClick={handleSubmit}>
                                                Submit
                                            </Button>
                                        )}
                                    </div>
                                </Card.Footer>

                                <Card.Body className="hide-scrollbar" >
                                    <form ref={formRef}>
                                        {showParentDetails === "Student Details" && (
                                            <Row>
                                                <div>
                                                    <div className="image-upload-container">
                                                        <div className="image-circle" onClick={handleShow} style={{ cursor: "pointer" }}>
                                                            <img
                                                                src={imagePath || "path_to_default_image_or_placeholder.png"}
                                                                className="uploaded-image"
                                                                alt="Uploaded Passport Photo"
                                                            />
                                                            <div className="image-placeholder"></div>
                                                        </div>
                                                    </div>
                                                    <Modal show={show} onHide={handleClose} centered>
                                                        <Modal.Header closeButton>
                                                        </Modal.Header>
                                                        <Modal.Body className="text-center">
                                                            <img
                                                                src={imagePath || "path_to_default_image_or_placeholder.png"}
                                                                alt="Enlarged Passport Photo"
                                                                style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
                                                            />
                                                        </Modal.Body>
                                                    </Modal>
                                                </div>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Admission Number<span className='requiredStar'>*</span></Form.Label>
                                                            <Form.Control
                                                                required
                                                                type="text"
                                                                id="admission_number"
                                                                value={form.admission_number}
                                                                placeholder="Enter Admission Number"
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^[A-Za-z0-9]*$/.test(value)) {
                                                                        handleInputChange(e);
                                                                    }
                                                                }}
                                                                maxLength={30}
                                                            />
                                                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>First Name<span className='requiredStar'>*</span></Form.Label>
                                                            <Form.Control
                                                                required
                                                                type="text"
                                                                id="student_first_name"
                                                                value={form.student_first_name}
                                                                placeholder="Enter First Name"
                                                                maxLength={30}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^[A-Za-z\s]*$/.test(value)) {
                                                                        handleInputChange(e);
                                                                    }
                                                                }}
                                                            />
                                                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Surname <span className='requiredStar'>*</span></Form.Label>
                                                            <Form.Control
                                                                required
                                                                type="text"
                                                                id="student_last_name"
                                                                value={form.student_last_name}
                                                                placeholder="Enter Surname"
                                                                maxLength={30}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^[A-Za-z\s]*$/.test(value)) {
                                                                        handleInputChange(e);
                                                                    }
                                                                }}
                                                            />
                                                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>DOB<span className='requiredStar'>*</span></Form.Label>
                                                            <Form.Control
                                                                required
                                                                type="date"
                                                                id="dob"
                                                                value={form.dob}
                                                                onChange={handleInputChange}
                                                            />
                                                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>DOJ<span className='requiredStar'>*</span></Form.Label>
                                                            <Form.Control
                                                                required
                                                                type="date"
                                                                id="date_of_join"
                                                                min={form.dob}
                                                                value={form.date_of_join}
                                                                onChange={handleInputChange}
                                                            />
                                                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <Form.Group>
                                                            <Form.Label>
                                                                Gender<span className='requiredStar'>*</span>
                                                            </Form.Label>
                                                            <div className="d-flex">
                                                                <div className="form-check">
                                                                    <input
                                                                        className="form-check-input hii"
                                                                        type="radio"
                                                                        name="gender"
                                                                        id="male"
                                                                        value="Male"
                                                                        onChange={handleRadioChange}
                                                                        checked={form.gender === "Male"}
                                                                        required
                                                                    />
                                                                    <label className="form-check-label" htmlFor="active">
                                                                        Male
                                                                    </label>
                                                                </div>
                                                                <div className="form-check ms-3">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        name="gender"
                                                                        id="female"
                                                                        value="Female"
                                                                        onChange={handleRadioChange}
                                                                        checked={form.gender === "Female"}
                                                                    />
                                                                    <label className="form-check-label" htmlFor="inactive">
                                                                        Female
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <Form.Group>
                                                            <Form.Label>
                                                                Vaccination<span className='requiredStar'>*</span>
                                                            </Form.Label>
                                                            <div className="d-flex">
                                                                <div className="form-check">
                                                                    <input
                                                                        className="form-check-input hii"
                                                                        type="radio"
                                                                        name="vaccination"
                                                                        id="yes"
                                                                        value="Yes"
                                                                        onChange={handleRadioChange1}
                                                                        checked={form.vaccination === "Yes"}
                                                                        required
                                                                    />
                                                                    <label className="form-check-label" htmlFor="active">
                                                                        Yes
                                                                    </label>
                                                                </div>
                                                                <div className="form-check ms-3">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        name="vaccination"
                                                                        id="no"
                                                                        value="No"
                                                                        onChange={handleRadioChange1}
                                                                        checked={form.vaccination === "No"}
                                                                    />
                                                                    <label className="form-check-label" htmlFor="inactive">
                                                                        No
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <Form.Group>
                                                            <Form.Label>Passport Photo</Form.Label>

                                                            {/* File input field */}
                                                            <Form.Control
                                                                type="file"
                                                                id="passport_size_photo"
                                                                ref={fileInputRef}
                                                                accept="image/*"
                                                                onChange={handleFileChange}
                                                            />
                                                            {imageSetName && (
                                                                <div
                                                                    style={{
                                                                        display: "flex",
                                                                        justifyContent: "space-between",
                                                                        alignItems: "center",
                                                                    }}
                                                                >
                                                                    <span
                                                                        style={{
                                                                            cursor: "pointer",
                                                                            color: "blue",
                                                                            textDecoration: "underline",
                                                                        }}
                                                                    >
                                                                        {imageSetName}{" "}
                                                                    </span>
                                                                    <span
                                                                        onClick={handleRemoveFile}
                                                                        style={{
                                                                            cursor: "pointer",
                                                                            color: "red",
                                                                            fontSize: "16px",
                                                                        }}
                                                                    >
                                                                        ✖
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <Form.Control.Feedback></Form.Control.Feedback>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Primary Contact</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="primary_contact"
                                                                value={form.primary_contact}
                                                                placeholder="Enter Contact No"
                                                                maxLength={10}
                                                                onChange={handleInputChange}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Blood Group</Form.Label>
                                                            <select
                                                                className="form-select"
                                                                id="blood_group_id"
                                                                value={form.blood_group_id}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="0">Select Blood Group</option>
                                                                {(bloodgroups || []).map((bloodgroup, index) => (
                                                                    <option key={index} value={bloodgroup.blood_group_id}>
                                                                        {bloodgroup.blood_group_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>DOE</Form.Label>
                                                            <Form.Control

                                                                type="date"
                                                                id="date_of_exit"
                                                                value={form.date_of_exit}
                                                                onChange={handleInputChange}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                            </Row>
                                        )}
                                        {showParentDetails === "Class Details" && (
                                            <Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Academic Year<span className='requiredStar'>*</span></Form.Label>
                                                            <select
                                                                required
                                                                className="form-select"
                                                                id="academic_year_id"
                                                                value={form.academic_year_id}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="" disabled hidden>
                                                                    {userObj.academic_year_name}
                                                                </option>
                                                                {(academics || []).map((academic, index) => (
                                                                    <option key={index} value={academic.academic_year_id}>
                                                                        {academic.academic_year_name}
                                                                    </option>
                                                                ))}y
                                                            </select>
                                                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Admission To<span className='requiredStar'>*</span></Form.Label>
                                                            <select
                                                                className="form-select"
                                                                id="admission_to"
                                                                value={form.admission_to}
                                                                onChange={handleInputChange1}
                                                                required
                                                            >
                                                                <option value="">Select Class</option>
                                                                {(classes || [])
                                                                    .filter((classItem) => classItem.is_active === "Active") // Filter to include only active classes
                                                                    .map((classItem) => (
                                                                        <option key={classItem.class_id} value={classItem.class_id}>
                                                                            {classItem.class_name}
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <Form.Group>
                                                            <Form.Label>
                                                                Class<span className="requiredStar">*</span>
                                                            </Form.Label>
                                                            <select
                                                                className="form-select"
                                                                required
                                                                id="class_id"
                                                                value={form.class_id}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="">Select Class</option>
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
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Section<span className='requiredStar'>*</span></Form.Label>
                                                            <select
                                                                required
                                                                className="form-select"
                                                                id="section_id"
                                                                value={form.section_id}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="">Select Section</option>
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
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Class Teacher<span className='requiredStar'>*</span></Form.Label>
                                                            <select
                                                                required
                                                                readOnly
                                                                className="form-select"
                                                                id="teacher_id"
                                                                value={form.teacher_id}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="0" disabled hidden>
                                                                    {form.teacher_id}
                                                                </option>
                                                                {(Array.isArray(users) ? users : []).map((user, index) => (
                                                                    <option key={index} value={user.teacher_id}>
                                                                        {user.teacher_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Roll Number</Form.Label>
                                                            <Form.Control
                                                                // required
                                                                type="text"
                                                                id="roll_no"
                                                                value={form.roll_no}
                                                                placeholder="Enter Roll Number"
                                                                onChange={handleInputChange}
                                                                maxLength={15}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                            </Row>
                                        )}
                                        {showParentDetails === "ID Details" && (
                                            <Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Aadhar Number<span className='requiredStar'>*</span></Form.Label>
                                                            <Form.Control
                                                                required
                                                                type="text"
                                                                id="aadhar_card_no"
                                                                value={form.aadhar_card_no}
                                                                placeholder="Enter Aadhar Number"
                                                                onChange={handleInputChange}
                                                                maxLength={12}
                                                            />
                                                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <Form.Group>
                                                            <Form.Label>Aadhar Upload</Form.Label>
                                                            <Form.Control
                                                                type="file"
                                                                id="aadhar_card_upload"
                                                                onChange={handleInputChange}
                                                                ref={fileInputRef} // Attach ref to input
                                                            />
                                                            {form.aadhar_card_upload && (
                                                                <div className="mt-2 d-flex align-items-center">
                                                                    <span>{form.aadhar_card_upload.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleRemoveFile}
                                                                        style={{
                                                                            marginLeft: "10px",
                                                                            color: "red",
                                                                            border: "none",
                                                                            background: "transparent",
                                                                            cursor: "pointer",
                                                                            fontSize: "14px",
                                                                        }}
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Caste<span className='requiredStar'>*</span></Form.Label>
                                                            <Form.Control
                                                                required
                                                                type="text"
                                                                id="caste"
                                                                value={form.caste}
                                                                placeholder="Enter Caste"
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^[A-Za-z\s]*$/.test(value)) {
                                                                        handleInputChange(e);
                                                                    }
                                                                }}
                                                                maxLength={30}
                                                            />
                                                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Caste Certificate</Form.Label>
                                                            <Form.Control
                                                                type="file"
                                                                id="caste_upload"
                                                                onChange={handleInputChange}
                                                            />
                                                            {form.caste_upload && (
                                                                <div className="mt-2 d-flex align-items-center">
                                                                    <span>{form.caste_upload.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleRemoveFile}
                                                                        style={{
                                                                            marginLeft: "10px",
                                                                            color: "red",
                                                                            border: "none",
                                                                            background: "transparent",
                                                                            cursor: "pointer",
                                                                            fontSize: "14px",
                                                                        }}
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Birth Certificate Number<span className='requiredStar'>*</span></Form.Label>
                                                            <Form.Control
                                                                required
                                                                type="text"
                                                                id="birth_certificate_no"
                                                                value={form.birth_certificate_no}
                                                                placeholder="Enter Birth Certificate"
                                                                onChange={handleInputChange}
                                                                maxLength={20}
                                                            />
                                                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Birth Certificate</Form.Label>
                                                            <Form.Control
                                                                type="file"
                                                                id="birth_certificate_upload"
                                                                onChange={handleInputChange}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>


                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Nationality<span className='requiredStar'>*</span></Form.Label>
                                                            <Form.Control
                                                                required
                                                                type="text"
                                                                id="nationality"
                                                                value={form.nationality}
                                                                placeholder="Enter Nationality"
                                                                onChange={handleInputChange}
                                                                maxLength={20}
                                                            />
                                                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Religion<span className='requiredStar'>*</span></Form.Label>
                                                            <select
                                                                className="form-select"
                                                                id="religion_id"
                                                                value={form.religion_id}
                                                                onChange={handleInputChange}
                                                                required
                                                            >
                                                                <option value="">Select Religion</option>
                                                                {(religions || []).map((religion) => (
                                                                    <option key={religion.religion_id} value={religion.religion_id}>
                                                                        {religion.religion_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <Form.Control.Feedback>Required</Form.Control.Feedback>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Mother Tongue</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="mother_tongue"
                                                                value={form.mother_tongue}
                                                                placeholder="Enter Mother Tongue"
                                                                onChange={handleInputChange}
                                                                maxLength={10}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                            </Row>
                                        )}
                                        {showParentDetails === "Parent Details" && (
                                            <Row>
                                                <Row>
                                                    <u><b>Father Details</b></u>&nbsp;
                                                </Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Father First Name</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="father_firstname"
                                                                value={form.father_firstname}
                                                                placeholder="Enter First Name"
                                                                maxLength={30}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^[A-Za-z\s]*$/.test(value)) {
                                                                        handleInputChange(e);
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Father Surname</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="father_surname"
                                                                value={form.father_surname}
                                                                placeholder="Enter Surname"
                                                                maxLength={30}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^[A-Za-z\s]*$/.test(value)) {
                                                                        handleInputChange(e);
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Father Contact</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="father_phone_number"
                                                                value={form.father_phone_number}
                                                                placeholder="Enter Contact No"
                                                                maxLength={10}
                                                                onChange={handleInputChange}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Father Email</Form.Label>
                                                            <Form.Control
                                                                type="email"
                                                                id="father_email"
                                                                value={form.father_email}
                                                                placeholder="Enter Email"
                                                                onChange={handleInputChange}
                                                                maxLength={150}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>

                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Father Aadhar</Form.Label>
                                                            <Form.Control
                                                                //  required
                                                                type="file"
                                                                id="father_aadhar_upload"
                                                                onChange={handleInputChange}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Father Aadhar Number</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="father_aadhar_number"
                                                                value={form.father_aadhar_number}
                                                                placeholder="Enter Aadhar Number"
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^\d*$/.test(value)) {
                                                                        handleInputChange(e);
                                                                    }
                                                                }}
                                                                maxLength={12}
                                                            />
                                                        </Form.Group>
                                                    </div>&nbsp;
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Father Occupation</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="father_occupation"
                                                                value={form.father_occupation}
                                                                placeholder="Enter Occupation"
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^[A-Za-z\s]*$/.test(value)) {
                                                                        handleInputChange(e);
                                                                    }
                                                                }}
                                                                maxLength={30}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Row>
                                                    <u><b>Mother Details</b></u>&nbsp;
                                                </Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Mother First Name</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="mother_firstname"
                                                                value={form.mother_firstname}
                                                                placeholder="Enter First Name"
                                                                maxLength={30}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^[A-Za-z\s]*$/.test(value)) {
                                                                        handleInputChange(e);
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Mother Surname</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="mother_surname"
                                                                value={form.mother_surname}
                                                                placeholder="Enter Surname"
                                                                maxLength={30}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^[A-Za-z\s]*$/.test(value)) {
                                                                        handleInputChange(e);
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>

                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Mother Contact</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="mother_phone_number"
                                                                value={form.mother_phone_number}
                                                                placeholder="Enter Contact No"
                                                                maxLength={10}
                                                                onChange={handleInputChange}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Mother Email</Form.Label>
                                                            <Form.Control
                                                                type="email"
                                                                id="mother_email"
                                                                value={form.mother_email}
                                                                placeholder="Enter Email"
                                                                onChange={handleInputChange}
                                                                maxLength={150}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>

                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Mother Aadhar</Form.Label>
                                                            <Form.Control
                                                                type="file"
                                                                id="mother_aadhar_upload"
                                                                onChange={handleInputChange}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Mother Aadhar Number</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="mother_aadhar_number"
                                                                value={form.mother_aadhar_number}
                                                                placeholder="Enter Aadhar Number"
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^\d*$/.test(value)) {
                                                                        handleInputChange(e);
                                                                    }
                                                                }}
                                                                maxLength={12}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>

                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Mother Occupation</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="mother_occupation"
                                                                value={form.mother_occupation}
                                                                placeholder="Enter Occupation"
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^[A-Za-z\s]*$/.test(value)) {
                                                                        handleInputChange(e);
                                                                    }
                                                                }}
                                                                maxLength={30}
                                                            />
                                                        </Form.Group>
                                                    </div>&nbsp;
                                                </Col>
                                                <Row>
                                                    <u><b>Guardian Details</b></u>&nbsp;
                                                </Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Guardian First Name</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="guardian_firstname"
                                                                value={form.guardian_firstname}
                                                                placeholder="Enter First Name"
                                                                maxLength={30}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^[A-Za-z\s]*$/.test(value)) {
                                                                        handleInputChange(e);
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Guardian Surname</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="guardian_surname"
                                                                value={form.guardian_surname}
                                                                placeholder="Enter Surname"
                                                                maxLength={30}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^[A-Za-z\s]*$/.test(value)) {
                                                                        handleInputChange(e);
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>

                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Guardian Contact</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="guardian_phone_number"
                                                                value={form.guardian_phone_number}
                                                                placeholder="Enter Contact No"
                                                                maxLength={10}
                                                                onChange={handleInputChange}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Guardian Email</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="guardian_email"
                                                                value={form.guardian_email}
                                                                placeholder="Enter Email"
                                                                onChange={handleInputChange}
                                                                maxLength={150}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Guardian Aadhar</Form.Label>
                                                            <Form.Control
                                                                type="file"
                                                                id="guardian_aadhar_number"
                                                                onChange={handleInputChange}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Guardian Aadhar Number</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="guardian_aadhar_number"
                                                                value={form.guardian_aadhar_number}
                                                                placeholder="Enter Aadhar Number"
                                                                maxLength={12}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^\d*$/.test(value)) {
                                                                        handleInputChange(e);
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Guardian Occupation</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="guardian_occupation"
                                                                value={form.guardian_occupation}
                                                                placeholder="Enter Occupation"
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^[A-Za-z\s]*$/.test(value)) {
                                                                        handleInputChange(e);
                                                                    }
                                                                }}
                                                                maxLength={30}
                                                            />
                                                        </Form.Group>
                                                    </div>&nbsp;
                                                </Col>
                                                <Row>
                                                    <u><b>Location Details</b></u>&nbsp;
                                                </Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>City</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="city"
                                                                value={form.city}
                                                                placeholder="Enter City"
                                                                onChange={handleInputChange}
                                                                maxLength={50}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>State</Form.Label>
                                                            <select
                                                                className="form-select"
                                                                id="state"
                                                                value={form.state}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="0">Select State</option>
                                                                {(states || []).map((state, index) => (
                                                                    <option key={index} value={state.state_id}>
                                                                        {state.state_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Country</Form.Label>
                                                            <select
                                                                className="form-select"
                                                                id="country"
                                                                value={form.country}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="0">Select Country</option>
                                                                {(countrys || []).map((country, index) => (
                                                                    <option key={index} value={country.country_id}>
                                                                        {country.country_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={12} lg={8} xxl={6}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Address</Form.Label>
                                                            <Form.Control
                                                                as="textarea"
                                                                type="text"
                                                                id="address"
                                                                value={form.address}
                                                                placeholder="Enter Address"
                                                                onChange={handleInputChange}
                                                                maxLength={250}
                                                                rows="3"
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={12} lg={8} xxl={6}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Permanent Address</Form.Label>
                                                            <Form.Control
                                                                as="textarea"
                                                                id="permanent_address"
                                                                value={form.permanent_address}
                                                                placeholder="Enter Address"
                                                                onChange={handleInputChange}
                                                                maxLength={250}
                                                                rows="3"
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>

                                            </Row>
                                        )}
                                        {showParentDetails === "Previous School" && (
                                            <Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Previous School</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="previous_school_name"
                                                                value={form.previous_school_name}
                                                                placeholder="Enter Previous School"
                                                                onChange={handleInputChange}
                                                                maxLength={255}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Previous TC</Form.Label>
                                                            <Form.Control
                                                                type="file"
                                                                id="previous_years_tc"
                                                                onChange={handleInputChange}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Previous Class</Form.Label>
                                                            <select
                                                                className="form-select"
                                                                id="class_last_studied"
                                                                value={form.class_last_studied}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="0">Select Class</option>
                                                                {(classes || []).map((classe) => (
                                                                    <option key={classe.class_id} value={classe.class_id}>
                                                                        {classe.class_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <Form.Group>
                                                            <Form.Label>First Language</Form.Label>
                                                            <select
                                                                className="form-select"
                                                                id="first_language_id"
                                                                value={form.first_language_id}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="0">Select Language</option>
                                                                {languages.map((language) => (
                                                                    <option key={language.language_id} value={language.language_id}>
                                                                        {language.language_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </Form.Group>
                                                    </div>
                                                </Col>

                                                {/* Second Language Dropdown */}
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <Form.Group>
                                                            <Form.Label>Second Language</Form.Label>
                                                            <select
                                                                className="form-select"
                                                                id="second_language_id"
                                                                value={form.second_language_id}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="0">Select Language</option>
                                                                {secondLangOptions.map((language) => (
                                                                    <option key={language.language_id} value={language.language_id}>
                                                                        {language.language_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </Form.Group>
                                                    </div>
                                                </Col>

                                                {/* Third Language Dropdown */}
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <Form.Group>
                                                            <Form.Label>Third Language</Form.Label>
                                                            <select
                                                                className="form-select"
                                                                id="third_language_id"
                                                                value={form.third_language_id}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="0">Select Language</option>
                                                                {thirdLangOptions.map((language) => (
                                                                    <option key={language.language_id} value={language.language_id}>
                                                                        {language.language_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className='commonInput'>
                                                        <Form.Group>
                                                            <Form.Label>Previous School Percentage</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                id="previous_school_percentage"
                                                                value={form.previous_school_percentage}
                                                                placeholder="Enter Percentage"
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^[0-9]*$/.test(value)) {
                                                                        handleInputChange(e);
                                                                    } else {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                maxLength={50}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                            </Row>
                                        )}

                                        {showParentDetails === "Sibling Details" && (
                                            <form style={{ height: "500px" }}>
                                                <Row>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group>
                                                                <Form.Label>Sibling 1</Form.Label>
                                                                <Select
                                                                    id="sibling1_id"
                                                                    className="basic-single"
                                                                    classNamePrefix="select"
                                                                    isClearable
                                                                    isSearchable
                                                                    value={readstudents.find(option => option.value === form.sibling1_id) || null}
                                                                    options={getFilteredOptions("sibling1_id")}
                                                                    onChange={(selectedOption) => handleSelectChange(selectedOption, "sibling1")}
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group>
                                                                <Form.Label>Name</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    id="student_info"
                                                                    value={form.sibling1_name}
                                                                    placeholder="Enter Name"
                                                                    onChange={handleInputChange}
                                                                    maxLength={30}
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group>
                                                                <Form.Label>Contact</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    id="primary_contact"
                                                                    value={form.sibling1_phone}
                                                                    placeholder="Enter Contact No"
                                                                    onChange={handleInputChange}
                                                                    maxLength={30}
                                                                    readOnly
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group>
                                                                <Form.Label>Date of Join</Form.Label>
                                                                <Form.Control
                                                                    type="date"
                                                                    id="date_of_join"
                                                                    value={form.sibling1_date}
                                                                    onChange={handleInputChange}
                                                                    maxLength={30}
                                                                    readOnly
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group>
                                                                <Form.Label>Sibling 2</Form.Label>
                                                                <Select
                                                                    id="sibling2_id"
                                                                    className="basic-single"
                                                                    classNamePrefix="select"
                                                                    isClearable
                                                                    isSearchable
                                                                    value={readstudents.find(option => option.value === form.sibling2_id) || null}
                                                                    options={getFilteredOptions("sibling2_id")}
                                                                    onChange={(selectedOption) => handleSelectChange(selectedOption, "sibling2")}
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group>
                                                                <Form.Label>Name</Form.Label>
                                                                <Form.Control
                                                                    required
                                                                    type="text"
                                                                    id="student_info"
                                                                    value={form.sibling2_name}
                                                                    placeholder="Enter Name"
                                                                    onChange={handleInputChange}
                                                                    maxLength={30}
                                                                    readOnly
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group>
                                                                <Form.Label>Contact</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    id="primary_contact"
                                                                    value={form.sibling2_phone}
                                                                    placeholder="Enter Contact No"
                                                                    onChange={handleInputChange}
                                                                    maxLength={30}
                                                                    readOnly
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group>
                                                                <Form.Label>Date of Join</Form.Label>
                                                                <Form.Control
                                                                    type="date"
                                                                    id="date_of_join"
                                                                    value={form.sibling2_date}
                                                                    onChange={handleInputChange}
                                                                    maxLength={30}
                                                                    readOnly
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group>
                                                                <Form.Label>Sibling 3</Form.Label>
                                                                <Select
                                                                    id="sibling3_id"
                                                                    className="basic-single"
                                                                    classNamePrefix="select"
                                                                    isClearable
                                                                    isSearchable
                                                                    value={readstudents.find(option => option.value === form.sibling3_id) || null}
                                                                    options={getFilteredOptions("sibling3_id")}
                                                                    onChange={(selectedOption) => handleSelectChange(selectedOption, "sibling3")}
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group>
                                                                <Form.Label>Name</Form.Label>
                                                                <Form.Control
                                                                    required
                                                                    type="text"
                                                                    id="student_info"
                                                                    value={form.sibling3_name}
                                                                    placeholder="Enter Name"
                                                                    onChange={handleInputChange}
                                                                    maxLength={30}
                                                                    readOnly
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group>
                                                                <Form.Label>Contact</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    id="primary_contact"
                                                                    value={form.sibling3_phone}
                                                                    placeholder="Enter Contact No"
                                                                    onChange={handleInputChange}
                                                                    maxLength={30}
                                                                    readOnly
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                                        <div className='commonInput'>
                                                            <Form.Group>
                                                                <Form.Label>Date of Join</Form.Label>
                                                                <Form.Control
                                                                    type="date"
                                                                    id="date_of_join"
                                                                    value={form.sibling3_date}
                                                                    onChange={handleInputChange}
                                                                    maxLength={30}
                                                                    readOnly
                                                                />
                                                            </Form.Group>
                                                        </div>
                                                    </Col>

                                                </Row>
                                            </form>
                                        )}
                                        {showParentDetails === "Review&Submit" && (
                                            <Row>
                                                <Row>
                                                    <u><b>Student Details</b></u>&nbsp;
                                                </Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}  >
                                                    <div className="commonInput">
                                                        <span className="form-label"> Admission Number:</span>
                                                        <span className="">{form.admission_number}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label"> First Name:</span>
                                                        <span className="">{form.student_first_name}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Surname:</span>
                                                        <span className="">{form.student_last_name}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">DOB:</span>
                                                        <span className="">{formatDate1(form.dob)}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">DOJ:</span>
                                                        <span className="">{formatDate1(form.date_of_join)}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Gender:</span>
                                                        <span className="">{form.gender}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Primary Contact:</span>
                                                        <span className="">{form.primary_contact}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Blood Group:</span>
                                                        <span className="">{form.blood_group_name}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Vaccination:</span>
                                                        <span className="">{form.vaccination}</span>
                                                    </div>
                                                </Col>
                                                
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">DOE:</span>
                                                        <span className="">{form.date_of_exit}</span>
                                                    </div>
                                                </Col>
                                                <Row>
                                                    <u><b>Class Details</b></u>&nbsp;
                                                </Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Academic Year:</span>
                                                        <span className="">{userObj.academic_year_name}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Admission To:</span>
                                                        <span className="">{form.next_joining_class_name}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Class:</span>
                                                        <span className="">{form.class_name}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Section:</span>
                                                        <span className="">{form.section_name}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Class Teacher:</span>
                                                        <span className="">{form.student_class_teacher_name}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Roll Number:</span>
                                                        <span className="">{form.roll_no}</span>
                                                    </div>
                                                </Col>
                                                <Row>
                                                    <u><b>ID Details</b></u>&nbsp;
                                                </Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Aadhar Number:</span>
                                                        <span className=""> {form.aadhar_card_no}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Caste:</span>
                                                        <span className="">{form.caste}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Birth Certificate Number:</span>
                                                        <span className="">{form.birth_certificate_no}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Nationality:</span>
                                                        <span className="">{form.nationality}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Religion:</span>
                                                        <span className="">{form.religion_name}</span>
                                                    </div>
                                                </Col>
                                                <Row>
                                                    <u><b>Previous School</b></u>&nbsp;
                                                </Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Previous School:</span>
                                                        <span className="">{form.previous_school_name}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Previous Class:</span>
                                                        <span className="">{form.class_last_studied_name}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">First Language:</span>
                                                        <span className="">{form.first_language_name}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Second Language:</span>
                                                        <span className="">{form.second_language_name}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Third Language:</span>
                                                        <span className="">{form.third_language_name}</span>
                                                    </div>
                                                </Col>
                                                <Row>
                                                    <u><b>Father Details</b></u>&nbsp;
                                                </Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Father Name:</span>
                                                        <span className="">{form.father_firstname + " " + form.father_surname}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Father Contact:</span>
                                                        <span className="">{form.father_phone_number}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Father Email:</span>
                                                        <span className="">{form.father_email}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Father Aadhar Number:</span>
                                                        <span className="">{form.father_aadhar_number}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Father Occupation:</span>
                                                        <span className="">{form.father_occupation}</span>
                                                    </div>
                                                </Col>
                                                <Row>
                                                    <u><b>Mother Details</b></u>&nbsp;
                                                </Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Mother Name:</span>
                                                        <span className="">{form.mother_firstname + " " + form.mother_surname}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Mother Contact:</span>
                                                        <span className="">{form.mother_phone_number}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Mother Email:</span>
                                                        <span className="">{form.mother_email}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Mother Aadhar Number:</span>
                                                        <span className="">{form.mother_aadhar_number}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Mother Occupation:</span>
                                                        <span className="">{form.mother_occupation}</span>
                                                    </div>
                                                </Col>
                                                <Row>
                                                    <u><b>Guardian Details</b></u>&nbsp;
                                                </Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Guardian Name:</span>
                                                        <span className="">{form.guardian_firstname + " " + form.guardian_surname}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Guardian Contact:</span>
                                                        <span className="">{form.guardian_phone_number}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Guardian Email:</span>
                                                        <span className="">{form.guardian_email}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Guardian Aadhar Number:</span>
                                                        <span className="">{form.guardian_aadhar_number}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Guardian Occupation:</span>
                                                        <span className="">{form.guardian_occupation}</span>
                                                    </div>
                                                </Col>
                                                <Row>
                                                    <u><b>Location Details</b></u>&nbsp;
                                                </Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">City:</span>
                                                        <span className="">{form.city}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">State:</span>
                                                        <span className="">{form.state_name}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Country:</span>
                                                        <span className="">{form.country_name}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Address:</span>
                                                        <span className="">{form.address}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Permanent Address:</span>
                                                        <span className="">{form.permanent_address}</span>
                                                    </div>
                                                </Col>
                                                <Row>
                                                    <u><b>Sibling Details</b></u>&nbsp;
                                                </Row>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Sibling 1:</span>
                                                        <span className="">{form.sibling1_name}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Sibling 2:</span>
                                                        <span className="">{form.sibling2_name}</span>
                                                    </div>
                                                </Col>
                                                <Col xs={12} md={6} lg={4} xxl={3}>
                                                    <div className="commonInput">
                                                        <span className="form-label">Sibling 3:</span>
                                                        <span className="">{form.sibling3_name}</span>
                                                    </div>
                                                </Col>
                                            </Row>

                                        )}
                                        {showParentDetails === "Review&Submit" && (
                                            <div className="container-fluid">
                                                <div className="d-flex justify-content-between mt-3 w-100">

                                                    <div className="d-flex gap-2">
                                                    </div>
                                                </div>
                                            </div>

                                        )}
                                    </form>
                                </Card.Body>
                            </Card>
                        </Container>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddStudent
