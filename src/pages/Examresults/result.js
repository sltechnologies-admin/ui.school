import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { IoMdAdd } from "react-icons/io";
import { Button, Modal, Row, Col, Form, OverlayTrigger, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete, MdFilterList, MdFileDownload, MdCloudUpload } from "react-icons/md";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from 'react-toastify';
import loading from "../../assets/images/common/loading.gif";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { fetchDataRead } from "../../Utility";
import Tooltip from "@mui/material/Tooltip";
import * as XLSX from "xlsx";


function ExamResult() {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const handleCloseFilterModal = () => setShowFilterModal(false);
 
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [errorRows, setErrorRows] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [exams, setExams] = useState([]);
  const [grades, setGrades] = useState([]);
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [examsdetails, setExamsDeatails] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const userData = sessionStorage.getItem('user');
  const userObj = userData ? JSON.parse(userData) : {};
  useEffect(() => {
    setIsLoading(true);
    fetchDataRead("/examresults/", setExamsDeatails, userObj.school_id)
      .finally(() => {
        setIsLoading(false);
        
      });
  }, []);
  const handleShowFilterModal = () => {
    if (classes.length === 0) {
        fetchDataRead("/classes", setClasses, userObj.school_id);
    }
    if (students.length === 0) {
        fetchDataRead("/students", setStudents, userObj.school_id);
    }
    if (subjects.length === 0) {
        fetchDataRead("/subjectmaster", setSubjects, userObj.school_id);
    }
    if (exams.length === 0) {
        fetchDataRead("/exammaster", setExams, userObj.school_id);
    }
    if (grades.length === 0) {
        fetchDataRead("/grades", setGrades, userObj.school_id);
    }
    setShowFilterModal(true);
};


  const groupByExam = (data) => {
    const grouped = {};
    data.forEach((item) => {
      const key = `${item.student_id}-${item.class_id}-${item.academic_year_id}-${item.exam_id}`;
      console.log(key);
      
      if (!grouped[key]) {
        grouped[key] = {
          student_id: item.student_id,
          class_id: item.class_id,
          section_id: item.section_id,
          academic_year_id: item.academic_year_id,
          student_name: item.student_name,
          class_name: item.class_name,
          academic_year_name: item.academic_year_name,
          exam_id: item.exam_id,
          exam_name: item.exam_name,
          subjects: [],
        };
      }
      grouped[key].subjects.push({
        subject_name: item.subject_name,
        marks: item.marks,
        grade_name: item.grade_name,
        exam_results_id: item.exam_results_id,
        grade_points: item.grade_points,
      });
    });
    return Object.values(grouped);
  };

  const ExpandedComponent = ({ data }) => (
    <div className="expandedTableWrapper"
      style={{
        marginLeft: "100px", border: "1px solid rgb(204, 204, 204)", borderRadius: "8px", padding: "12px",
        background: "linear-gradient(135deg, rgb(249, 249, 249) 0%, rgb(230, 230, 230) 100%)", boxShadow: "rgba(0, 0, 0, 0.1) 2px 4px 10px"
      }}>
      <table className="customExpandedTable">
        <thead>
          <tr className="border-blue">
            <th>Subject</th>
            <th>Marks</th>
            <th>Grade</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {data.subjects.map((subject, index) => (
            <tr key={index}>
              <td>{subject.subject_name}</td>
              <td>{subject.marks}</td>
              <td><span >{subject.grade_name}</span></td>
              <td>{subject.grade_points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  const searchableColumns = [
    row => row.exam_name,
    row => row.subject_name,
    row => row.grade_name,
    row => row.student_name,
    row => row.class_name,
    row => row.remarks,
    row => row.is_active,
    row => row.marks
  ];
  const filteredRecords = (examsdetails || []).filter((user) =>
    searchableColumns.some((selector) => {
      const value = selector(user);
      return String(value || '').toLowerCase().includes(searchQuery.toLowerCase());
    })
  );
  const groupedData = groupByExam(filteredRecords);
  const [filter, setFilter] = useState({
    exam_name: "",
    school_id: userObj.school_id,
    action: "FILTER",
  });

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = {
      exam_id: filter.exam_id || 0,
      student_id: filter.student_id || 0,
      subject_id: filter.subject_id || 0,
      grade_id: filter.grade_id || 0,
      marks: filter.marks || 0,
      school_id: userObj.school_id,
      action: "FILTER",
    };
    try {
      const response = await axios.post(`${baseUrl}/examresults/`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      const filterData = response.data || [];
      if (filterData.length === 0) {
        setExamsDeatails([]);
      } else {
        setExamsDeatails(filterData);
      }
      setShowFilterModal(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response) {
        if (error.response.status === 404) {
          setExamsDeatails([]);
        } else {
          toast.error("Failed to fetch filtered data. Please try again.");
        }
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleFilterClear = () => {
    setFilter({
      exam_id: "",
      student_id: "",
      subject_id: "",
      grade_id: "",
      marks: "",
      school_id: ""
    });
    fetchDataRead("/examresults", setExamsDeatails, userObj.school_id);
  };
  const handleSearchChange = (event) => {
    fetchDataRead("/examresults", setExamsDeatails, userObj.school_id);
    setSearchQuery(event.target.value);
  };
  const globaledit = ({ student_id, class_id, exam_id }) => {
    const filteredResults = examsdetails.filter(
      (result) => result.student_id === student_id && result.class_id === class_id && result.exam_id === exam_id
    );
    if (filteredResults.length === 0) return;
    const flatPayload = {};
    filteredResults.forEach((res, index) => {
      flatPayload[`subject_${index}`] = {
        exam_results_id: res.exam_results_id,
        subject_id: res.subject_id,
        marks: res.marks,
        grade_id: res.grade_id,
        remarks: res.remarks,
        student_id: res.student_id,
        class_id: res.class_id,
        section_id: res.section_id,
        academic_year_id: res.academic_year_id,
        exam_id: res.exam_id,
      };
    });
    navigate("/addresult", { state: flatPayload });
  };
  const globaldelete = async ({ student_id, class_id, exam_id }) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete all results for this student and exam?"
    );
    if (!confirmDelete) return;
    const filteredResults = examsdetails.filter(
      (result) =>result.student_id === student_id &&result.class_id === class_id &&result.exam_id === exam_id
    );
    if (filteredResults.length === 0) return;
    try {
      const deletePayload = filteredResults.map((res) => ({
        exam_results_id: res.exam_results_id,
        action: "DELETE",
      }));
      const response = await axios.post(`${baseUrl}/examresults/bulk/`, deletePayload, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.status === 200 || response.status === 201) {
        toast.success("All results deleted successfully");
        fetchDataRead("/examresults", setExamsDeatails, userObj.school_id);
      } else {
        toast.error("Unexpected response while deleting records.");
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete records.");
    }
  };
  //excel
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
  const handleUpload = async () => {
    const userData = sessionStorage.getItem("user");
    const userObj = userData ? JSON.parse(userData) : {};
    if (!file) {
      toast.warning("Please select a file before uploading.");
      return;
    }
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = async (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      if (!sheetData.length) {
        toast.error("The uploaded file is empty or invalid.");
        return;
      }
      const requiredHeaders = [
        "Exam Name", "class", "section", "student",
        "subject", "marks", "remarks", "school_name", "academic_year_name"
      ];
      const headers = Object.keys(sheetData[0] || {});
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        toast.error(`Missing headers: ${missingHeaders.join(", ")}`);
        return;
      }
      const payload = {
        section_name: "ExamResultsUpload",
        sheet_data: sheetData,
        uploaded_by: userObj.email || "unknown"
      };
      try {
        const response = await fetch(`${baseUrl}/uploadExcelData`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (response.ok) {
          const errorRows = result.filter(row => row.error_message !== null && row.error_message.trim() !== "");
          const successCount = result.filter(row => row.is_processed === "Y").length;
          if (errorRows.length > 0) {
            toast.warning(`Upload completed. ${successCount} succeeded, ${errorRows.length} failed.`);
            setErrorRows(errorRows);
            setShowErrorModal(true);
          } else {
            toast.success("All exam results uploaded successfully.");
          }
          fetchDataRead("/examresults", setExamsDeatails, userObj.school_id);
        } else {
          throw new Error(result.detail || "Upload failed.");
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Upload failed. Please check your file or try again.");
      }
    };
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "Exam Name",
      "class",
      "section",
      "student",
      "subject",
      "marks",
      "remarks",
      "school_name",
      "academic_year_name"
    ];
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    worksheet["!cols"] = headers.map(header => ({ wch: header.length + 5 }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ExamResultsTemplate");
    XLSX.writeFile(workbook, "exam_results_template.xlsx");
  }
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
            <div className="d-flex justify-content-between align-items-center w-100">
              <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                <h6 className="commonTableTitle">Exam Results</h6>
              </div>
              <div className="">
                <input type="text" placeholder="Search..." value={searchQuery} className="searchInput" onChange={handleSearchChange} />
              </div>
              <div className="d-flex align-items-center" style={{ gap: 6 }}>
                <div className="fileUploadPart" >
                  <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Download Template</Tooltip>}>
                    <Button className="secondaryBtn" variant="secondary" onClick={handleDownloadTemplate}>
                      <MdFileDownload size={18} />
                    </Button>
                  </OverlayTrigger>
                  <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} ref={fileInputRef}
                    className="form-control form-control-sm commonFileUpload" style={{ marginRight: "16px" }} />
                  <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Excel Upload</Tooltip>}>
                    <Button className="btn primaryBtn" onClick={handleUpload}>  <span> Upload</span>  </Button>
                  </OverlayTrigger>
                </div>
                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Bulk Update</Tooltip>}>
                  <Button className="primaryBtn" variant="primary" onClick={() => navigate("/bulkaddresult")}>
                    <MdCloudUpload size={18} />
                  </Button>
                </OverlayTrigger>
                &nbsp;
                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}>
                  <Button className="secondaryBtn" variant="secondary" onClick={handleShowFilterModal}><MdFilterList /> </Button>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add</Tooltip>}>
                  <Button className="primaryBtn" variant="primary" onClick={() => navigate("/addresult")}>  <IoMdAdd /></Button>
                </OverlayTrigger>
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
                  columns={[
                    {
                      name: "Academic Year",
                      selector: row => row.academic_year_name,
                      sortable: true,
                      cell: row => (<Tooltip title={row.academic_year_name}>     <span>{row.academic_year_name}</span>   </Tooltip>)
                    },
                    {
                      name: "Student",
                      selector: row => row.student_name,
                      sortable: true,
                      cell: row => (<Tooltip title={row.student_name}>     <span>{row.student_name}</span>   </Tooltip>)
                    },
                    {
                      name: "Class",
                      selector: row => row.class_name,
                      sortable: true,
                      cell: row => (<Tooltip title={row.class_name}>   <span>{row.class_name}</span> </Tooltip>)
                    },
                    {
                      name: "Exam",
                      selector: row => row.exam_name,
                      sortable: true,
                      cell: row => (<Tooltip title={row.exam_name}><span>{row.exam_name}</span></Tooltip>)
                    }
                    , {
                      name: "Actions",
                      cell: row =>
                        row.exam_results_id !== "No Records Found" ? (
                          <div className="tableActions">
                            <Tooltip title="Edit" arrow>
                              <span className="commonActionIcons" onClick={() =>
                                globaledit({ student_id: row.student_id, class_id: row.class_id, exam_id: row.exam_id })}
                              >
                                <MdEdit />
                              </span>
                            </Tooltip>
                            <Tooltip title="Delete" arrow>
                              <span
                                className="commonActionIcons"
                                onClick={() =>
                                  globaldelete({student_id: row.student_id,class_id: row.class_id,exam_id: row.exam_id
                                  })
                                }>
                                <MdDelete />
                              </span>
                            </Tooltip>
                          </div>
                        ) : null
                    }
                  ]}
                  data={(Array.isArray(groupedData) && groupedData.length > 0)
                    ? groupedData
                    : [{    exam_results_id: "No Records Found", class_name: "No Records Found", subjects: []  }]}
                  expandableRows={Array.isArray(groupedData) && groupedData.length > 0}
                  expandableRowsComponent={ExpandedComponent}
                  pagination={Array.isArray(groupedData) && groupedData.length > 0}
                  highlightOnHover
                  responsive
                  fixedHeader
                  fixedHeaderScrollHeight="calc(100vh - 170px)"
                  conditionalRowStyles={[
                    {
                      when: (row) => row.exam_results_id === "No Records Found", style: { textAlign: "center", fontSize: "16px", color: "red", backgroundColor: "#f9f9f9" },
                    },
                  ]}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal show={showFilterModal} onHide={handleCloseFilterModal} className="commonFilterModal">
        <Modal.Header closeButton className="modalHeaderFixed">
          <Modal.Title>Filter</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modalBodyScrollable">
          <Form id="filterForm" onSubmit={handleFilterSubmit}>
            <Row>
              <Col xs={12}>
                <div className="commonInput">
                  <Form.Group controlId="exam_id">
                    <Form.Label>Exam</Form.Label>
                    <Form.Select as="select" className="custom-select" value={filter.exam_id}
                      onChange={(e) => setFilter({ ...filter, exam_id: e.target.value })}   >
                      <option value="">Select Exam</option>
                      {(exams || []).filter((exam) => exam.is_active === "Active")
                        .map((exam) => (
                          <option key={exam.exam_id} value={exam.exam_id}>  {exam.exam_name} </option>))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </Col>
              <Col xs={12}>
                <div className="commonInput">
                  <Form.Group controlId="student_id">
                    <Form.Label>Student</Form.Label>
                    <Form.Select as="select" className="custom-select" value={filter.student_id}
                      onChange={(e) => setFilter({ ...filter, student_id: e.target.value })}    >
                      <option value="">Select Student</option>
                      {(students || []).filter((student) => student.status === "Active").map((student) => (
                        <option key={student.student_id} value={student.student_id}> {student.student_first_name} {student.student_last_name} </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </Col>
              <Col xs={12}>
                <div className="commonInput">
                  <Form.Group controlId="subject_id">
                    <Form.Label>Subject</Form.Label>
                    <Form.Select as="select" value={filter.subject_id}
                      onChange={(e) => setFilter({ ...filter, subject_id: e.target.value })} >
                      <option value="">Select Subject</option>
                      {(subjects || []).filter((sub) => sub.is_active === "Active").map((sub) => (
                        <option key={sub.subject_id} value={sub.subject_id}> {sub.subject_name}  </option>))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </Col>
              <Col xs={12}>
                <div className="commonInput">
                  <Form.Group controlId="grade_id">
                    <Form.Label>Grade</Form.Label>
                    <Form.Select as="select" value={filter.grade_id}
                      onChange={(e) => setFilter({ ...filter, grade_id: e.target.value })}>
                      <option value="">Select Grade</option>
                      {(grades || []).filter((grade) => grade.is_active === "Active").map((grade) => (
                        <option key={grade.grade_id} value={grade.grade_id}> {grade.grade_name}  </option>))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </Col>
              <Col xs={12}>
                <div className="commonInput">
                  <Form.Group controlId="marks">
                    <Form.Label>Marks</Form.Label>
                    <Form.Control type="number" placeholder="Enter Marks" value={filter.marks}
                      onChange={(e) => setFilter({ ...filter, marks: e.target.value })} />
                  </Form.Group>
                </div>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modalFooterFixed">
          <div className="">
            <Button variant="secondary" className="btn-info clearBtn" onClick={handleFilterClear}>   Reset</Button>
          </div>
          <div className="">
            <Button variant="secondary" className="btn-danger secondaryBtn" onClick={handleCloseFilterModal} > Close </Button>
            <Button variant="primary" className="btn-success primaryBtn" type="submit" form="filterForm" onClick={handleCloseFilterModal}>  Search </Button>
          </div>
        </Modal.Footer>
      </Modal>
      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} size="xl" centered>
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #dee2e6", }} >
          <Modal.Title style={{ color: "#dc3545", fontWeight: "600" }}> Upload Errors ({errorRows.length}) </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table bordered hover responsive className="align-middle text-center" style={{ fontSize: "14px" }} >
            <thead style={{ backgroundColor: "#f1f1f1", fontWeight: "600", }}>
              <tr>
                <th>Row</th>
                <th>Exam</th>
                <th>Class</th>
                <th>Section</th>
                <th>Student</th>
                <th>Subject</th>
                <th>Marks</th>
                <th>Remarks</th>
                <th>Academic Year</th>
                <th>School</th>
                <th>Status</th>
                <th>Error Message</th>
              </tr>
            </thead>
            <tbody>
              {errorRows.map((row, idx) => (
                <tr key={idx} style={row.is_processed !== "Y"  ? { backgroundColor: "#fef2f2", color: "#b91c1c" }  : {}}>
                  <td>{row.excel_row}</td>
                  <td>{row.exam_name}</td>
                  <td>{row.class_name}</td>
                  <td>{row.section_name}</td>
                  <td>{row.student_name}</td>
                  <td>{row.subject_name}</td>
                  <td>{row.marks}</td>
                  <td>{row.remarks}</td>
                  <td>{row.academic_year_name}</td>
                  <td>{row.school_name}</td>
                  <td>{row.is_processed === "Y" ? "Yes" : "No"}</td>
                  <td>{row.error_message || "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer
          style={{ backgroundColor: "#f8f9fa", borderTop: "1px solid #dee2e6", display: "flex", justifyContent: "space-between", }}>
          <small style={{ color: "#6c757d" }}>Please review and fix the rows with errors before re-uploading. </small>
          <Button variant="outline-secondary" style={{ borderColor: "#dee2e6", padding: "4px 12px" }} onClick={() => setShowErrorModal(false)} > Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
export default ExamResult
