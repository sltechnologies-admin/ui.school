import React, { useState, useEffect } from 'react'
import { useLocation } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { ToastContainer, toast } from 'react-toastify';
import loading from "../../assets/images/common/loading.gif";
import { MdEdit, MdDelete,MdSave } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import DataTable from "react-data-table-component";
const AddTeachersubjectmap = () => {
  const routeLocation = useLocation();
  const [editId, setEditId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [academic, setAcademic] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sections, setSection] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [teachersubjectsmaps, setTeacherssubjectmap] = useState([]);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const userData = sessionStorage.getItem('user');
  const userObj = userData ? JSON.parse(userData) : {};
  const navigate = useNavigate();
  const [column, setColumns] = useState([])
  const [records, setRecords] = useState([]);
  const readOnlyRoles = ["Class Teacher", "Teacher",];
    const canSubmit = !readOnlyRoles.includes(userObj.role_name?.trim());
  useEffect(() => {
    if (teachersubjectsmaps && teachersubjectsmaps.length > 0) {
      setRecords(teachersubjectsmaps);
      setColumns(prev =>
        prev.map(col => ({ ...col, hide: false }))
      );
    } else {
      setRecords([]);
    }
    setIsLoading(false);
  }, [teachersubjectsmaps]);

  const [form, setForm] = useState({
    teacher_subject_id: "",
    teacher_subject_name: "",
    subject_id: "",
    subject_name: "",
    userid: "",
    username: "",
    academic_year_id: userObj.academic_year_id,
    academic_year_name: "",
  
  });
  useEffect(() => {
    setIsLoading(true);
    fetchData().finally(() => setIsLoading(false));
  }, []);
  const fetchDropdownData = async (endpoint, setter) => {
    try {
      const response = await axios.post(baseUrl + endpoint, { action: 'READ', school_id: userObj.school_id });
      setter(response.data);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  };
  useEffect(() => {
    if (form.class_id > 0) {
      fetchSections(form.class_id || 0);
    }
    else {
      setSection([]);
    }
  }, [form.class_id]);
  const fetchSections = async (class_id) => {
    try {
      const response = await axios.post(baseUrl + "/Sections/", {
        action: "DROPDOWNREAD",
        school_id: userObj.school_id,
        class_id: class_id
      });
      setSection(response.data);
    } catch (error) {
      console.error("Error fetching section:", error);
    }
  };
  const fetchAcademicYears = async () => {
    try {
      const response = await axios.post(baseUrl + "/AcademicYear/", {
        action: "CURRENTREAD",
        school_id: userObj.school_id
      });
      setAcademic(response.data)
    } catch (error) {
      console.log("Error fetching academic name:", error)

    }
  };
  const fetchTeachers = async () => {
    try {
      const response = await axios.post(baseUrl + "/Users/", {
        action: "TREAD",
        school_id: userObj.school_id
      });
      setTeachers(response.data)
    } catch (error) {
      console.log("Error fetching teacher name:", error)

    }
  };
  useEffect(() => {
    fetchAcademicYears();
    fetchTeachers();
    fetchDropdownData('/classes/', setClasses);
    fetchDropdownData('/subjectmaster/', setSubjects);
    if (routeLocation.state?.teachersubjectData) {
      const teachersubjectData = routeLocation.state.teachersubjectData;
      setForm(teachersubjectData);
      setEditId(teachersubjectData.teacher_subject_id);
    }
  }, [routeLocation]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const approveStatus = { 'Yes': 'Y', 'No': 'N' };
    const selectedStatus = approveStatus[form.isClassTeacher] || form.isClassTeacher;

    const formData = {
      class_id: form.class_id,
      section_id: form.section_id,
      subject_id: form.subject_id,
      academic_year_id: userObj.academic_year_id,
      userid: form.userid,
    
      school_id: userObj.school_id,
      action: editId !== null ? 'UPDATE' : 'CREATE'
    };

    if (editId !== null) {
      formData.teacher_subject_id = editId;
    }
    try {
      const response = await axios.post(baseUrl + "/teacherssubjectsmap/", formData, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.status >= 200 && response.status < 300) {
        toast.success(editId !== null ? "Record Updated Successfully" : "Record Added Successfully", { position: "top-right" });
        setEditId(null);
        setForm({
          teacher_subject_id: "",
          class_id: "",
          section_id: "",
          subject_id: "",
          academic_year_id: "",
          userid: "",
          isClassTeacher: "Y",
        });
        await fetchData();
      }
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          toast.error("Record Already Exists");
        } else if (status === 401) {
          toast.error("The Subject Is Already Assigned To This Class And Section", { position: "top-right" });
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
  };
  const fetchData = async () => {
    try {
      const response = await axios.post(baseUrl + "/teacherssubjectsmap/", {
        action: "READ",
        school_id: userObj.school_id
      });
      setTeacherssubjectmap(response.data);
    } catch (error) {
      console.log("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // const fetchData = async () => {
  //   if (form.academic_year_id && form.class_id && form.section_id) {
  //     try {
  //       const response = await axios.post(baseUrl + "/teacherssubjectsmap/", {
  //         action: "FILTER",
  //         academic_year_id: userObj.academic_year_id,
  //         class_id: form.class_id,
  //         section_id: form.section_id,
  //       });
  //       setTeacherssubjectmap(response.data);
  //     }
  //     catch (error) {
  //       console.log("Error fetching data:", error);
  //     }
  //   }
  // };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  useEffect(() => {
    if (form.academic_year_id && form.class_id && form.section_id) {
      fetchData();
    }
  }, [form.academic_year_id, form.class_id, form.section_id]);


  const handleRadioChange = (e) => {
    setForm((prevForm) => ({
      ...prevForm,
      isClassTeacher: e.target.value
    }));
  };
  const handleEditClick = (teacher_subject_id) => {
    const employeemasterToEdit = teachersubjectsmaps.find(teachersubject => teachersubject.teacher_subject_id === teacher_subject_id);
    if (employeemasterToEdit) {
      navigate("/academicyear", { state: { teachersubjectData: employeemasterToEdit } });
    }
  };

  const columns = [
    // {
    //   name: "Academic Year Name",
    //   selector: (row) => row.academic_year_name,
    //   cell: row => <Tooltip title={row.academic_year_name}><span>{row.academic_year_name}</span></Tooltip>,
    //   sortable: true,
    // },
    {
      name: "Class",
      selector: (row) => row.class_name,
      cell: row => <Tooltip title={row.class_name}><span>{row.class_name}</span></Tooltip>,
      sortable: true,
    },
    {
      name: "Section ",
      selector: (row) => row.section_name,
      cell: row => <Tooltip title={row.section_name}><span>{row.section_name}</span></Tooltip>,
      sortable: true,
    },
    {
      name: "Subject",
      selector: (row) => row.subject_name,
      cell: row => <Tooltip title={row.subject_name}><span>{row.subject_name}</span></Tooltip>,
      sortable: true,
    },

    {
      name: "Teacher ",
      selector: (row) => row.user_name,
      cell: row => <Tooltip title={row.user_name}><span>{row.user_name}</span></Tooltip>,
      sortable: true,
    },
    {
      name: "Is Class Teacher",
      selector: (row) => row.isClassTeacher,
      cell: row => <Tooltip title={row.isClassTeacher}><span>{row.isClassTeacher}</span></Tooltip>,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) =>
        records.length > 0 ? (
          <div className='tableActions'>
            <Tooltip title="Edit" arrow>
              <a className='commonActionIcons' onClick={() => handleEditClick(row.teacher_subject_id)}>
                <span><MdEdit /></span>
              </a>
            </Tooltip>
          </div>
        ) : null,

    },
  ];
  const searchableColumns = [
    (row) => row.class_name,
    (row) => row.section_name,
    (row) => row.subject_name,
    (row) => row.academic_year_name,
    (row) => row.user_name,
    (row) => row.isClassTeacher,
    (row) => row.is_active,

  ];
  const filteredRecords = (teachersubjectsmaps || []).filter((teachersubjectsmaps) =>
    searchableColumns.some((selector) => {
      const value = selector(teachersubjectsmaps);
      const stringValue = String(value || "").toLowerCase();
      const normalizedValue = stringValue.replace(/[-\s]+/g, "");
      const normalizedQuery = searchQuery.toLowerCase().replace(/[-\s]+/g, "");

      return normalizedValue.includes(normalizedQuery);
    })
  );
  const groupByClassSection = (data) => {
    const grouped = {};

    data.forEach(item => {
      const key = `${item.class_name} - ${item.section_name}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    return Object.entries(grouped).map(([groupKey, rows]) => ({
      groupKey,
      data: rows,
      class_name: rows[0].class_name,
      section_name: rows[0].section_name
    }));
  };

  const handleDeleteClick = async (teacher_subject_id) => {
    const confirmDelete = window.confirm("Are you sure you want change the status?");

    if (!confirmDelete) {
      return;
    }
    const requestBody = {
      teacher_subject_id: teacher_subject_id,
      action: "DELETE"
    };
    try {
      const response = await axios.post(baseUrl + '/teacherssubjectsmap/', requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
      });
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      toast.success("Record Set to InActive");
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const filteredRecord = groupByClassSection(filteredRecords);
const ExpandedComponent = ({ data }) => {
  return (
    <div
      className="px-3"
      style={{
        marginLeft: "100px",
        border: "1px solid rgb(204, 204, 204)",
        borderRadius: "8px",
        padding: "8px",
        background: "linear-gradient(135deg, rgb(249, 249, 249) 0%, rgb(230, 230, 230) 100%)",
        boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.1)"
      }}
    >
      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
        <table className="customExpandedTable" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr className="border-blue">
              <th>Subject</th>
              <th>Teacher</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((item, idx) => (
              <tr key={idx}>
                <td>{item.subject_name}</td>
                <td>{item.user_name}</td>
                <td>{item.is_active}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Tooltip title="Edit" arrow>
                      <span
                        className="commonActionIcons"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/academicyear", { state: { teachersubjectData: item } })}
                      >
                        <MdEdit />
                      </span>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                      <span
                        className="commonActionIcons"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDeleteClick(item.teacher_subject_id)}
                      >
                        <MdDelete />
                      </span>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


  const groupColumns = [
    {
      name: "Class",
      selector: row => row.class_name,
      sortable: true
    },
    {
      name: "Section",
      selector: row => row.section_name,
      sortable: true
    }
  ];


  return (
    <>
      <ToastContainer />
      <div className="">
        <Container fluid>
          <Card>
            <Card.Body className="hide-scrollbar" style={{ padding: "0px" }}>
              <form onSubmit={handleSubmit}>


                <Row className="g-3 align-items-end flex-nowrap overflow-auto">
                  {/* <Col md={2}>
                    <Form.Group className="commonInput">
                      <Form.Label>Academic Year</Form.Label>
                      <Form.Control
                        type="text"
                        readOnly
                        value={userObj.academic_year_name}
                        plaintext
                        className="form-control-plaintext"
                      />
                    </Form.Group>
                  </Col> */}

                  <Col md={2} className="m-0">
                    <Form.Group className="commonInput ">
                      <Form.Label>Class<span className="requiredStar">*</span></Form.Label>
                      <select
                        required
                        className="form-select"
                        id="class_id"
                        value={form.class_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Class</option>
                        {(classes || [])
                          .filter(c => c.is_active === "Active")
                          .map(c => (
                            <option key={c.class_id} value={c.class_id}>
                              {c.class_name}
                            </option>
                          ))}
                      </select>
                    </Form.Group>
                  </Col>

                  <Col md={2} className="m-0">
                    <Form.Group className="commonInput">
                      <Form.Label>Section<span className="requiredStar">*</span></Form.Label>
                      <select
                        required
                        className="form-select"
                        id="section_id"
                        value={form.section_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Section</option>
                        {(sections || []).map(section => (
                          <option key={section.section_id} value={section.section_id}>
                            {section.section_name}
                          </option>
                        ))}
                      </select>
                    </Form.Group>
                  </Col>

                  <Col md={2} className="m-0">
                    <Form.Group className="commonInput">
                      <Form.Label>Subject<span className="requiredStar">*</span></Form.Label>
                      <select
                        required
                        className="form-select"
                        id="subject_id"
                        value={form.subject_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Subject</option>
                        {(subjects || [])
                          .filter(s => s.is_active === "Active")
                          .map(s => (
                            <option key={s.subject_id} value={s.subject_id}>
                              {s.subject_name}
                            </option>
                          ))}
                      </select>
                    </Form.Group>
                  </Col>

                  <Col md={2} className="m-0">
                    <Form.Group className="commonInput">
                      <Form.Label>Teacher<span className="requiredStar">*</span></Form.Label>
                      <select
                        required
                        className="form-select"
                        id="userid"
                        value={form.userid}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Teacher</option>
                        {(teachers || []).map(t => (
                          <option key={t.userid} value={t.userid}>
                            {t.surname + " " + t.firstname}
                          </option>
                        ))}
                      </select>
                    </Form.Group>
                  </Col>

                  {/* <Col md={2} className="m-0">
                    <Form.Group className="commonInput">
                      <Form.Label>Is Class Teacher<span className="requiredStar">*</span></Form.Label>
                      <div className="d-flex gap-3 pt-1">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="isClassTeacher"
                            id="Yes"
                            value="Yes"
                            onChange={handleRadioChange}
                            checked={form.isClassTeacher === "Yes"}
                            required
                          />
                          <label className="form-check-label" htmlFor="Yes">Yes</label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="isClassTeacher"
                            id="No"
                            value="No"
                            onChange={handleRadioChange}
                            checked={form.isClassTeacher === "No"}
                          />
                          <label className="form-check-label" htmlFor="No">No</label>
                        </div>
                      </div>
                    </Form.Group>
                  </Col> */}
                </Row>


                <div className="d-flex justify-content-between mb-1">
                  <Button
                    type="button"
                    variant="primary"
                    className="btn-info clearBtn"
                    onClick={() => setForm({
                      teacher_subject_id: "",
                      class_id: "",
                      section_id: "",
                      subject_id: "",
                      academic_year_id: "",
                      userid: "",
                      isClassTeacher: ""
                    })}
                  >
                    Reset
                  </Button>
                  <div>
                    <Button
                      type="button"
                      variant="primary"
                      className="btn-danger secondaryBtn me-2"
                      onClick={() => window.location.reload()}

                    >
                      Cancel
                    </Button>
<Button
  type="submit"
  variant="success"
  className="btn-success primaryBtn"
  disabled={!canSubmit}
>
  <MdSave style={{ marginRight: "5px" }} />
  {editId !== null ? "Update" : "Save"}
</Button>

                  </div>
                </div>
              </form>
            </Card.Body>
          </Card>
        </Container>
      </div>
      <div className="commonDataTableHead">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            {/* <h6 className="commonTableTitle">Academic Sections</h6> */}
          </div>
          <div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              maxLength={30}
              className="searchInput mt-1"
              onChange={handleSearchChange}
            />
          </div>

        </div>
      </div>
      <div className="commonTable height100 mt-0">
        <div className="tableBody">
          {isLoading ? (
            <div className="loadingContainer">
              <img src={loading} alt="Loading..." className="loadingGif" />
            </div>
          ) : (
            <DataTable
              className="custom-table"
              columns={groupColumns}

              data={(Array.isArray(filteredRecord) && filteredRecord.length > 0)
                ? filteredRecord
                : [{
                  userid: "No records found",
                  role_name: "No records found",
                }]
              }
              pagination={Array.isArray(filteredRecord) && filteredRecord.length > 0}
              highlightOnHover
              responsive
              fixedHeader
              expandableRows
              expandableRowsComponent={ExpandedComponent}
              fixedHeaderScrollHeight="calc(100vh - 400px)"
              conditionalRowStyles={[
                {
                  when: (row) => row.userid === "No records found",
                  style: {
                    textAlign: "center",
                    fontSize: "16px",
                    color: "red",
                    backgroundColor: "#f9f9f9"
                  },
                },
              ]}
            />
          )}
        </div>
      </div>
    </>
  );


}
export default AddTeachersubjectmap;


