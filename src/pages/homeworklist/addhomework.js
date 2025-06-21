import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import loading from "../../assets/images/common/loading.gif";
import { useNavigate, useLocation } from "react-router-dom";
import { BsDownload } from "react-icons/bs";

function HomeworkAdd() {
  const userData = sessionStorage.getItem("user");
  const userObj = userData ? JSON.parse(userData) : {};
  const [editId, setEditId] = useState(null);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const routeLocation = useLocation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileNamesString, setFileNamesString] = useState("");
  const [uploadedFileNames, setUploadedFileNames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isReadOnly = routeLocation.state?.is_read_only || false;
  const navigate = useNavigate();

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const [form, setForm] = useState({
    homework_id: "",
    homework_details: "",
    homework_date: getCurrentDate(),
    submit_date: "",
    section_id: "",
    subject_id: "",
    section_name: "",
    subject_name: "",
    class_id: "",
    academic_year_id: userObj.academic_year_id,
    school_id: userObj.school_id,
  });

  useEffect(() => {
    fetchDropdownData("/classes/", setClasses);
  }, []);

  const fetchDropdownData = async (endpoint, setter) => {
    try {
      const response = await axios.post(baseUrl + endpoint, {
        action: "READ",
        school_id: userObj.school_id,
      });
      setter(response.data);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  };

  const fetchSections = async (class_id) => {
    try {
      const response = await axios.post(
        baseUrl + "/getsectionsbyteachersubjectmap/",
        {
          action: "SECTIONREAD",
          school_id: userObj.school_id,
          class_id: class_id,
        }
      );
      setSections(response.data);
    } catch (error) {
      console.error("Error fetching section:", error);
    }
  };

  const fetchSubject = async (class_id) => {
    try {
      const response = await axios.post(baseUrl + "/teacherssubjectsmap/", {
        action: "SFILTER",
        school_id: userObj?.school_id || 0,
        class_id: class_id,
        academic_year_id: userObj.academic_year_id,
      });
      setSubjects(response?.data || []);
    } catch (error) {
      console.error("Error fetching Subjects!", error);
    }
  };

  if (routeLocation.state?.userData && !editId) {
    const userHomework = routeLocation.state.userData;

    const formattedDate = userHomework.homework_date
      ? String(userHomework.homework_date).trim().split(" ")[0]
      : "";
      const formattedSubmitDate = userHomework.submit_date
    ? String(userHomework.submit_date).trim().split(" ")[0]
    : "";
    setForm({
      ...userHomework,
      homework_date: formattedDate,
      submit_date: formattedSubmitDate,
    });
    setEditId(userHomework.homework_id);
    if (userHomework.attachments) {
      setUploadedFileNames(userHomework.attachments.split(", "));
    }
  }

  useEffect(() => {
    if (form.class_id != 0) {
      fetchSections(form.class_id || 0);
    } else {
      setSections();
    }
  }, [form.class_id]);

  useEffect(() => {
    if (Number(form.class_id) > 0) {
      fetchSubject(form.class_id);
    }
  }, [form.class_id]);

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
      const updatedFiles = (prevFiles || []).filter(
        (fileName) => fileName !== fileNameToRemove
      );

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
      const response = await axios.post(
        `${baseUrl}/uploads/multipleupload/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const uploadedFilePaths = response.data.uploaded_files.map(
        (file) => file.location
      );
      return uploadedFilePaths;
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error uploading files");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.homework_details || form.homework_details.trim() === "") {
      toast.error("Homework details cannot be empty or only spaces.");
      return;
    }

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

    const fileNamesOnly = uploadedFilePaths.map((filePath) => {
      return filePath.split(/[\\/]/).pop();
    });

    const formData = {
      homework_details: form.homework_details.trim() || "",
      homework_date: form.homework_date,
      submit_date: form.submit_date,
      section_id: form.section_id || 0,
      subject_id: form.subject_id || 0,
      section_name: form.section_name,
      subject_name: form.subject_name,
      class_id: form.class_id,
      academic_year_id: form.academic_year_id || 0,
      school_id: userObj.school_id,
      attachment: fileNamesOnly.join(", "),
      action: editId !== null ? "UPDATE" : "CREATE",
    };

    if (editId !== null) {
      formData.homework_id = editId;
    }

    try {
      const response = await axios.post(`${baseUrl}/homework/`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 201) {
        toast.success(
          editId !== null
            ? "Record Updated Successfully"
            : "Record Added Successfully"
        );
      } else {
        throw new Error(
          "Failed to add homework. Status code: " + response.status
        );
      }
    } catch (error) {
      handleError(error);
    }

    navigate("/homework/homeworklist", {
      state: {
        filterData: {
          class_id: form.class_id,
          section_id: form.section_id,
          homework_date: form.homework_date,
        },
      },
    });
  };

  const handleError = (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 400) {
        toast.error("Record Already Exists.", { position: "top-right" });
      } else if (status === 500) {
        toast.error("Server error: " + (data.error || error.message), {
          position: "top-right",
        });
      } else if (status === 202) {
        toast.warn("Submission Accepted But Not Completed. Try again later.", {
          position: "top-right",
        });
      } else {
        toast.error("Unexpected Error Occurred", { position: "top-right" });
      }
    } else {
      console.error("Error submitting:", error);
      toast.error("Network error: " + error.message, { position: "top-right" });
    }
  };

  const handleDownloadFile = async (fileName) => {
    try {
      const response = await axios.get(
        `${baseUrl}/uploads/get-image/${encodeURIComponent(fileName)}`,
        {
          responseType: "blob", // important for downloading files
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName); // this forces download
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Failed to download file");
      console.error("Download error:", error);
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
      class_id: "",
      academic_year_id: "",
      attachment: "",
    });
    setSelectedFile(null);
    setFileNamesString("");
    setUploadedFileNames([]);
  };

  return (
    <div className="pageMain">
      <ToastContainer />
      <LeftNav></LeftNav>
      <div className="pageRight">
        <div className="pageHead">
          <Header></Header>
        </div>
        <div className="pageBody">
          <Container fluid>
            <Card>
              <Card.Body className="hide-scrollbar">
                <form onSubmit={handleSubmit}>
                  <Row>
                    <Col xs={12}>
                      {isReadOnly && (
                        <div
                          className="text-center p-2 mb-3"
                          style={{
                            backgroundColor: "#fff3cd",
                            border: "1px solid #ffeeba",
                            borderRadius: "4px",
                            color: "#856404",
                            fontWeight: "500",
                          }}
                        >
                          🔒 This homework is reviewed and locked for editing.
                        </div>
                      )}

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
                            readOnly={isReadOnly}
                            min={new Date().toISOString().split("T")[0]} // restrict to today or future
                            style={{
                              height: "100%",
                              ...(isReadOnly && {
                                appearance: "none",
                                WebkitAppearance: "none",
                                MozAppearance: "none",
                                backgroundImage: "none",
                                backgroundColor: "transparent",
                                border: "none",
                                boxShadow: "none",
                                pointerEvents: "none",
                              }),
                            }}
                          />
                        </Form.Group>
                      </div>
                    </Col>

                    <Col xs={12} md={6} lg={4} xxl={3}>
                      <div className="commonInput">
                        <Form.Group>
                          <Form.Label>
                            {" "}
                            Class<span className="requiredStar">*</span>
                          </Form.Label>
                          <Form.Select
                            id="class_id"
                            value={form.class_id}
                            onChange={handleInputChange}
                            disabled={isReadOnly}
                            required
                            style={{
                              maxHeight: "150px",
                              overflowY: "auto",
                              ...(isReadOnly && {
                                appearance: "none",
                                WebkitAppearance: "none",
                                MozAppearance: "none",
                                backgroundImage: "none",
                                backgroundColor: "transparent",
                                border: "none",
                                boxShadow: "none",
                                pointerEvents: "none",
                              }),
                            }}
                          >
                            <option value="">Select Class</option>
                            {(classes || [])
                              .filter((cls) => cls.is_active === "Active")
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
                      <div className="commonInput">
                        <Form.Group>
                          <Form.Label>
                            Section <span className="requiredStar">*</span>
                          </Form.Label>
                          <Form.Select
                            required
                            id="section_id"
                            value={form.section_id}
                            disabled={isReadOnly}
                            onChange={handleInputChange}
                            style={{
                              maxHeight: "150px",
                              overflowY: "auto",
                              ...(isReadOnly && {
                                appearance: "none",
                                WebkitAppearance: "none",
                                MozAppearance: "none",
                                backgroundImage: "none",
                                backgroundColor: "transparent",
                                border: "none",
                                boxShadow: "none",
                                pointerEvents: "none",
                              }),
                            }}
                          >
                            <option value="">Select Section</option>
                            {(sections || []).map((section) => (
                              <option
                                key={section.section_id}
                                value={section.section_id}
                              >
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
                          <Form.Label>
                            {" "}
                            Subject<span className="requiredStar">*</span>
                          </Form.Label>
                          <Form.Select
                            id="subject_id"
                            value={form.subject_id}
                            disabled={isReadOnly}
                            onChange={handleInputChange}
                            style={{
                              maxHeight: "150px",
                              overflowY: "auto",
                              ...(isReadOnly && {
                                appearance: "none",
                                WebkitAppearance: "none",
                                MozAppearance: "none",
                                backgroundImage: "none",
                                backgroundColor: "transparent",
                                border: "none",
                                boxShadow: "none",
                                pointerEvents: "none",
                              }),
                            }}
                            required
                          >
                            <option value="">Select Subject</option>
                            {(subjects || [])
                              .filter(
                                (subject) => subject.is_active === "Active"
                              )
                              .map((subject) => (
                                <option
                                  key={subject.subject_id}
                                  value={subject.subject_id}
                                >
                                  {subject.subject_name}
                                </option>
                              ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </Col>
                    <Col xs={12} md={12} lg={8} xxl={6}>
                      <div className="commonInput">
                        <Form.Group>
                          <Form.Label>
                            Homework Details{" "}
                            <span className="requiredStar">*</span>
                          </Form.Label>
                          <Form.Control
                            required
                            as="textarea"
                            id="homework_details"
                            value={form.homework_details}
                            placeholder="Enter Homework Details"
                            onChange={handleInputChange}
                            readOnly={isReadOnly}
                            maxLength={250}
                            style={{
                              height: "100%",
                              backgroundColor: isReadOnly ? "transparent" : "",
                              border: isReadOnly ? "none" : "",
                              boxShadow: isReadOnly ? "none" : "",
                              pointerEvents: isReadOnly ? "none" : "auto",
                              ...(isReadOnly && {
                                appearance: "none",
                                WebkitAppearance: "none",
                                MozAppearance: "none",
                                backgroundImage: "none",
                                resize: "none",
                                outline: "none",
                              }),
                            }}
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
                            readOnly={isReadOnly}
                            style={{
                              height: "100%",
                              backgroundColor: isReadOnly ? "transparent" : "",
                              border: isReadOnly ? "none" : "",
                              boxShadow: isReadOnly ? "none" : "",
                              pointerEvents: isReadOnly ? "none" : "auto",
                            }}
                          />
                        </Form.Group>
                        <Button
                          variant="primary"
                          disabled={isReadOnly}
                          onClick={async () => {
                            if (selectedFile && selectedFile.length > 0) {
                              const newFilePaths = await uploadFiles();
                              if (newFilePaths) {
                                setUploadedFileNames((prev) => [
                                  ...prev,
                                  ...newFilePaths,
                                ]);
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
                      <Col xs={17} md={15} lg={10} xxl={6} className="mt-4">
                        <div className="commonInput">
                          {uploadedFileNames.length > 0 && (
                            <div style={{ marginTop: "20px" }}>
                              <p style={{ fontWeight: "600" }}>
                                Uploaded Files:
                              </p>
                              <div
                                style={{
                                  overflowX: "auto",
                                  display: "inline-block",
                                }}
                              >
                                <table
                                  style={{
                                    borderCollapse: "collapse",
                                    fontSize: "14px",
                                    minWidth: "300px",
                                    width: "auto",
                                    tableLayout: "auto",
                                  }}
                                >
                                  <thead>
                                    <tr>
                                      <th
                                        style={{
                                          border: "1px solid #ccc",
                                          padding: "8px 12px",
                                          textAlign: "left",
                                          background: "#f5f5f5",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        File Name
                                      </th>
                                      <th
                                        style={{
                                          border: "1px solid #ccc",
                                          padding: "8px 12px",
                                          textAlign: "center",
                                          background: "#f5f5f5",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {uploadedFileNames.map(
                                      (fileName, index) => {
                                        const cleanFileName = fileName
                                          .trim()
                                          .split(/[\\/]/)
                                          .pop();

                                        return (
                                          <tr key={index}>
                                            <td
                                              style={{
                                                border: "1px solid #ccc",
                                                padding: "8px 12px",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              <a
                                                href={`${baseUrl}/uploads/get-image/${encodeURIComponent(
                                                  cleanFileName
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={cleanFileName}
                                                style={{
                                                  textDecoration: "none",
                                                  color: "#007bff",
                                                  wordBreak: "break-all",
                                                }}
                                              >
                                                {cleanFileName}
                                              </a>
                                            </td>

                                            <td
                                              style={{
                                                border: "1px solid #ccc",
                                                padding: "8px 12px",
                                                textAlign: "center",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              <div
                                                style={{
                                                  display: "flex",
                                                  justifyContent: "center",
                                                  alignItems: "center",
                                                  gap: "10px",
                                                }}
                                              >
                                                <span
                                                  onClick={() =>
                                                    handleDownloadFile(
                                                      cleanFileName
                                                    )
                                                  }
                                                  title="Download File"
                                                  style={{
                                                    cursor: "pointer",
                                                    color: "green",
                                                    fontSize: "18px",
                                                  }}
                                                >
                                                  <BsDownload />
                                                </span>

                                                {isReadOnly ? (
                                                  <span
                                                    title="Option Disabled"
                                                    style={{
                                                      color: "#ccc",
                                                      fontSize: "18px",
                                                      cursor: "not-allowed",
                                                    }}
                                                  >
                                                    ✖
                                                  </span>
                                                ) : (
                                                  <span
                                                    onClick={() =>
                                                      handleRemoveFile(fileName)
                                                    }
                                                    title="Remove File"
                                                    style={{
                                                      cursor: "pointer",
                                                      color: "red",
                                                      fontSize: "18px",
                                                    }}
                                                  >
                                                    ✖
                                                  </span>
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      }
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </Col>
                    </Col>
                    <Col xs={12} md={6} lg={4} xxl={3}>
                      <div className="commonInput">
                        <Form.Group>
                          <Form.Label>
                            Submission Date{" "}
                            <span className="requiredStar">*</span>
                          </Form.Label>
                          <Form.Control
                            required
                            type="date"
                            id="submit_date"
                            value={form.submit_date}
                            onChange={handleInputChange}
                            readOnly={isReadOnly}
                            min={form.homework_date}
                            style={{
                              height: "100%",
                              ...(isReadOnly && {
                                appearance: "none",
                                WebkitAppearance: "none",
                                MozAppearance: "none",
                                backgroundImage: "none",
                                backgroundColor: "transparent",
                                border: "none",
                                boxShadow: "none",
                                pointerEvents: "none",
                              }),
                            }}
                          />
                        </Form.Group>
                      </div>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-between mt-3">
                    <div>
                      {!isReadOnly && (
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
                      )}
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="primary"
                        className="btn-danger secondaryBtn me-2"
                        onClick={() => {
                          const filterData = routeLocation.state?.filterData;
                          // If filters are empty or cleared
                          const isFilterEmpty =
                            !filterData ||
                            Object.values(filterData).every(
                              (val) => !val || val === 0 || val === ""
                            );

                          navigate("/homework/homeworklist", {
                            state: isFilterEmpty ? null : { filterData },
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      {!isReadOnly && (
                        <Button
                          type="submit"
                          variant="primary"
                          className="btn-success primaryBtn"
                        >
                          Submit
                        </Button>
                      )}
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
