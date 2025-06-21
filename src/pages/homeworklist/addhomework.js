import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { useLocation } from "react-router-dom";
 
function HomeworkAdd() {
  const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
  const [editId, setEditId] = useState(null);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [schools, setSchools] = useState([]);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const routeLocation = useLocation();
  const [selectedFile, setSelectedFile] = useState(null); 
  const [fileNamesString, setFileNamesString] = useState("");
  const [uploadedFileNames, setUploadedFileNames] = useState([]);
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const day = String(today.getDate()).padStart(2, '0'); 
    return `${year}-${month}-${day}`;
  };
  const [form, setForm] = useState({
    homework_id: "",
    homework_details: "",
    homework_date: getCurrentDate(),
    section_id: "",
    subject_id: "",
    createdby: "",
    lastmodifiedby: "",
    section_name: "",
    subject_name: "",
    class_id: "",
    academic_year_id: userObj.academic_year_id,
    school_id:userObj.school_id,
  });
 
  useEffect(() => {
    window.history.replaceState({}, document.title);

    const fetchSections = async (class_id = 0) => {
        try {
            const response = await axios.post(baseUrl + "/Sections/", {
                action: "DROPDOWNREAD",
                class_id: class_id || 0,
            });
            setSections(response.data || []);
        } catch (error) {
            console.error("Error fetching sections:", error);
        }
    };
 
    const fetchClasses = async () => {
        try {
            const response = await axios.post(baseUrl + "/classes/", { action: "READ", school_id: userObj.school_id });
            setClasses(response.data || [])
        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    };
 
    const fetchAcademicYears = async () => {
        try {
            const response = await axios.post(baseUrl + "/AcademicYear/", { action: "READ", school_id: userObj.school_id });
            setAcademicYears(response.data.map(item => ({ id: item.academic_year_id, name: item.academic_year_name })));
        } catch (error) {
            console.error("Error fetching academic years:", error);
        }
    };
 
    const fetchSchools = async () => {
        try {
            const response = await axios.post(baseUrl + "/schoolmaster/", { action: "READ" });
            setSchools(response.data.map(item => ({ id: item.school_id, name: item.school_name })));
        } catch (error) {
            console.error("Error fetching schools:", error);
        }
    };
 
    fetchSections(form.class_id);  
    fetchClasses();
    fetchAcademicYears();
    fetchSchools();
 
    if (routeLocation.state?.userData && !editId) {
        const userHomework = routeLocation.state.userData;
 
        const formattedDate = userHomework.homework_date
            ? String(userHomework.homework_date).trim().split(" ")[0]
            : "";
 
        setForm({
            ...userHomework,
            homework_date: formattedDate,
        });
        setEditId(userHomework.homework_id);
        if (userHomework.attachments) {
            setUploadedFileNames(userHomework.attachments.split(", ")); 
        }
        
    }
}, [routeLocation, baseUrl, editId, form.class_id]); 
 
const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
        ...prevForm,
        [id]: value,
    }));
};
 
 
  const handleFileChange = (e) => {
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
 
 
  const uploadFiles = async () => {
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
 
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    let uploadedFilePaths = form.attachment || []; 
   
    if (uploadedFileNames.length > 0) {
      uploadedFilePaths = [...uploadedFileNames];
    }
 
    try {
      if (selectedFile && selectedFile.length > 0) {
        const newFilePaths = await uploadFiles(); 
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
 
    const fileNamesOnly = uploadedFilePaths.map(filePath => {
      return filePath.split(/[\\/]/).pop();
    });
 
    const formData = {
      homework_details: form.homework_details || "",
      homework_date: form.homework_date,
      section_id: form.section_id || 0,
      subject_id: form.subject_id || 0,
      section_name: form.section_name,
      subject_name: form.subject_name,
      class_id: form.class_id,
      academic_year_id: form.academic_year_id || 0,
      school_id: userObj.school_id,
      attachment: fileNamesOnly.join(", "), 
      action: editId !== null ? "UPDATE" : "CREATE",
    };console.log(formData);
 
    if (editId !== null) {
      formData.homework_id = editId;
    }
 
    try {
      const response = await axios.post(`${baseUrl}/homework/`, formData, {
        headers: { "Content-Type": "application/json" },
      });
 
      if (response.status === 201) {
        toast.success(editId !== null ? "Record Updated Successfully" : "Record Added Successfully");
      } else {
        throw new Error("Failed to add homework. Status code: " + response.status);
      }
    } catch (error) {
      handleError(error);
    }
 
    resetForm();
  };
  useEffect(() => {
    if (Number(form.class_id) > 0 && Number(form.section_id) > 0) {

      fetchSubjects(form.class_id, form.section_id);
    }
    else{
      setSubjects([]);
    }
  }, [form.class_id, form.section_id]);
  const fetchSubjects = async (class_id, section_id) => {
    try {
      const response = await axios.post(baseUrl + "/teacherssubjectsmap/", {
        action: "FILTER",
        school_id: userObj?.school_id || 0,
        class_id: class_id, section_id: section_id,academic_year_id:userObj.academic_year_id
      });
      setSubjects(response?.data || []);
    } catch (error) {
      console.error("Error fetching Subjects!", error);
    }
  };
 
 
 
  const handleError = (error) => {
    if (error.response) {
      const { status, data } = error.response;
 
      if (status === 400) {
        toast.error("Record Already Exists.", { position: "top-right" });
      } else if (status === 500) {
        toast.error("Server error: " + (data.error || error.message), { position: "top-right" });
      } else if (status === 202) {
        toast.warn("Submission Accepted But Not Completed. Try again later.", { position: "top-right" });
      } else {
        toast.error("Unexpected Error Occurred", { position: "top-right" });
      }
    } else {
      console.error("Error submitting:", error);
      toast.error("Network error: " + error.message, { position: "top-right" });
    }
  };
 
  const resetForm = () => {
    setForm({
      homework_id: "",
      homework_details: "",
      homework_date: "",
      section_id: "",
      section_name: "",
      subject_id: "",
      subject_name: "",
      createdby: "",
      lastmodifiedby: "",
      class_id: "",
      academic_year_id: "",
      attachment:"",
    });
    setSelectedFile(null);
    setFileNamesString(""); 
    setUploadedFileNames([]);
  };
 
 
 
 
    return (
      
      
        <div className='pageMain'>
            <ToastContainer />
          <LeftNav></LeftNav>
          <div className='pageRight'>
            <div className='pageHead'>
              <Header></Header>
            </div>
            <div className='pageBody'>
              <Container fluid>
                <Card>
                
                    <Card.Body className="hide-scrollbar">
                    <form onSubmit={handleSubmit}>
                      <Row>
                      <Col xs={12}>
                        <h6 className="commonSectionTitle">Homework Details</h6>
                        </Col>
                       </Row>
                                                                  
                      <Row>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                                <div className="commonInput">
                                  <Form.Group>
                                    <Form.Label>
                                      Date <span className="requiredStar">*</span>
                                    </Form.Label>
                                    <Form.Control
                                      required
                                      type="date"
                                      id="homework_date"
                                      value={form.homework_date}
                                      placeholder="Select Homework Date"
                                      onChange={handleInputChange}
                                    />
                                  </Form.Group>
                                </div>
                              </Col>
 
                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label> Class<span className="requiredStar">*</span></Form.Label>
                              <Form.Select
                                id="class_id"
                                value={form.class_id}
                                onChange={handleInputChange}
                                required
                              >
                                <option value="">Select Class</option>
                                {(classes || [])
                                 .filter((cls) => cls.is_active==="Active")
                                .map((cls) => (
                                  <option key={cls.class_id} value={cls.class_id}>
                                    {cls.class_name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </div>
                        </Col>
                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className='commonInput'>
                            <Form.Group>
                              <Form.Label>Section  <span className='requiredStar'>*</span></Form.Label>
                              <Form.Select
                                required
                                id="section_id"
                                value={form.section_id}
                                onChange={handleInputChange}
                                style={{ maxHeight: "150px", overflowY: "auto" }}
                              >
                                <option value="">Select Section</option>
                                {(sections || []).map((section)=> (
                                  <option key = {section.section_id} value={section.section_id}>
                                    {section.section_name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </div>
                       </Col>
                       <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label> Subject<span className="requiredStar">*</span></Form.Label>
                              <Form.Select
                                id="subject_id"
                                value={form.subject_id}
                                onChange={handleInputChange}
                                style={{ maxHeight: "150px", overflowY: "auto" }}
                                required
                              >
                                <option value="">Select Subject</option>
                                {(subjects ||[])
                                .filter((subject) => subject.is_active==="Active")
                                .map((subject) => (
                                  <option key={subject.subject_id} value={subject.subject_id}>
                                    {subject.subject_name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </div>
                        </Col>
                        <Col xs={12} md={12} lg={8} xxl={6}>
                                        <div className='commonInput'>
                                          <Form.Group>
                                            <Form.Label>
                                              Homework Details <span className='requiredStar'>*</span>
                                            </Form.Label>
                                            <Form.Control
                                              required
                                              as="textarea"
                                              id="homework_details"
                                              value={form.homework_details}
                                              placeholder="Enter Homework Details"
                                              onChange={handleInputChange}
                                              maxLength={255}
                                              style={{ height: '100%' }} 
                                            />
                                          </Form.Group>
                                        </div>
                                      </Col>
 
                                    <Col xs={12} md={6} lg={4} xxl={3}>
                                    <div className="commonInput d-flex align-items-end">
                                      <Form.Group className="me-2">
                                        <Form.Label>Attachments</Form.Label>
                                        <Form.Control
                                          type="file"
                                          id="attachment"
                                          multiple
                                          onChange={handleFileChange}
                                        />
                                      </Form.Group>
                                      <Button
                                        variant="primary"
                                        onClick={async () => {
                                          if (selectedFile && selectedFile.length > 0) {
                                            const newFilePaths = await uploadFiles(); 
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
                                  </Col>
                                  <Col xs={12} md={6} lg={4} xxl={3} className="mt-4">
                                    <div className="commonInput">
                                      {uploadedFileNames.length > 0 && (
                                        <div>
                                          <p>Uploaded Files:</p>
                                          <table className="table table-bordered" style={{ fontSize: "14px", width: "100%" ,minWidth:"0px" }}>
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
                                                        href={`${baseUrl}/uploads/get-image/${encodeURIComponent(cleanFileName)}`} 
                                                        download={cleanFileName}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ fontSize: "12px" }} 
                                                      >
                                                        {cleanFileName}
                                                      </a>
                                                    </td>
                                                    <td>
                                                      <span
                                                        style={{ cursor: "pointer", color: "red", fontSize: "16px" }} 
                                                        onClick={() => handleRemoveFile(fileName)} 
                                                      >
                                                        ✖
                                                      </span>
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
                                    </Row>
                                    <div className="d-flex justify-content-between mt-3">
                                      <div>
                                        <Button
                                          type="button"
                                          variant="primary"
                                          className="btn-info clearBtn"
                                          onClick={() =>
                                            setForm({
                                              homework_id: "",
                                              homework_details: "",
                                              homework_date: "",
                                              section_id: "",
                                              subject_id: "",
                                              createdby: "",
                                              lastmodifiedby: "",
                                              section_name: "",
                                              subject_name: "",
                                              class_id: "",
                                              academic_year_id: "",
                                            })
                                          }
                                        >
                                          Reset
                                        </Button>
                                      </div>
                                      <div>
                                        <Button
                                          type="button"
                                          variant="primary"
                                          className="btn-danger secondaryBtn me-2"
                                          onClick={() => window.history.back()}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          type="submit"
                                          variant="primary"
                                          className="btn-success primaryBtn"
                                        >
                                          Submit
                                        </Button>
                                      </div>
                                </div>

                         </form>
                  </Card.Body>
                </Card>
              </Container>
            </div>
          </div>
        </div>
      
    );
  }
 
  export default HomeworkAdd;
 