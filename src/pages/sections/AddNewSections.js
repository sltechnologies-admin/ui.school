import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import Header from "../../components/layout/header/header";
import { MdEdit, MdSave, MdDelete, MdAddCircle, MdFilterList } from "react-icons/md";
import LeftNav from "../../components/layout/leftNav/leftNav";
import loading from "../../assets/images/common/loading.gif";
import DataTable from "react-data-table-component";
import { Tooltip } from '@mui/material';
import { fetchDataRead } from "../../Utility";

function AddNewSections() {
  const navigate = useNavigate();
  const userData = sessionStorage.getItem('user');
  const [sections, setSections] = useState([])
  const userObj = userData ? JSON.parse(userData) : {};
  const [editId, setEditId] = useState(null);
  const [classes, setClasses] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [academic, setacademic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [Teachers, setTeachers] = useState(null);
  const [NonTeachers, setNonTeachers] = useState(null);
  const [school, setSchool] = useState(null);

  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const routeLocation = useLocation();

  const [form, setForm] = useState({
    section_id: "",
    section_name: "",
    class_id: "",
    room_number: "",
    school_id: "",
    school_name: "",
    academic_year_id: "",
    academic_year_name: "",
    cooridinator_id: "",
    is_active: "A"
  })

useEffect(() => {
  const sectionData = routeLocation.state?.sectionData;

  if (sectionData && sectionData.section_id) {
    setForm({
      section_id: sectionData.section_id,
      section_name: sectionData.section_name || "",
      class_id: sectionData.class_id || "",
      room_number: sectionData.room_number || "",
      class_teacher_id: sectionData.class_teacher_id || "",
      academic_coordinator_id: sectionData.academic_coordinator_id || "",
      school_id: sectionData.school_id || "",
      school_name: sectionData.school_name || "",
      academic_year_id: sectionData.academic_year_id || "",
      academic_year_name: sectionData.academic_year_name || "",
      is_active: sectionData.is_active || "A"
    });
    setEditId(sectionData.section_id);
  } else {
    setForm({
      section_id: "",
      section_name: "",
      class_id: "",
      room_number: "",
      school_id: "",
      school_name: "",
      academic_year_id: "",
      academic_year_name: "",
      class_teacher_id: "",
      academic_coordinator_id: "",
      is_active: "A"
    });
    setEditId(null);
  }

  // Remove state from URL to prevent it from persisting
  window.history.replaceState({}, document.title);
}, [routeLocation.state?.sectionData?.section_id]);



  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));

  };
  useEffect(() => {

    setIsLoading(true);
    fetchSections().finally(() => setIsLoading(false));
  }, []);
  const fetchSections = async () => {
    try {
      const response = await axios.post(baseUrl + "/Sections/", {
        action: "READ", school_id: userObj.school_id
      });
      setSections(response.data);
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };


  useEffect(() => {
    fetchClasses();
    fetchAcademicYear();
    fetchschool();
    fetchNonTeachers();
    fetchTeachers();

  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.post(baseUrl + "/classes/", {
        action: "READ",
        school_id: userObj.school_id
      });
      setClasses(response.data);

    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
const handleEditClick = (section_id) => {
  const sectionToEdit = sections.find(sec => sec.section_id === section_id);
  if (sectionToEdit) {
    setForm({
      section_id: sectionToEdit.section_id,
      section_name: sectionToEdit.section_name || "",
      class_id: sectionToEdit.class_id || "",
      room_number: sectionToEdit.room_number || "",
      class_teacher_id: sectionToEdit.class_teacher_id || "",
      academic_coordinator_id: sectionToEdit.academic_coordinator_id || "",
      school_id: sectionToEdit.school_id || "",
      school_name: sectionToEdit.school_name || "",
      academic_year_id: sectionToEdit.academic_year_id || "",
      academic_year_name: sectionToEdit.academic_year_name || "",
      is_active: sectionToEdit.is_active || "A"
    });
    setEditId(sectionToEdit.section_id);
  } else {
    toast.error("Selected section not found or already inactive.");
  }
};


  const handleDeleteClick = async (section_id) => {
    const confirmDelete = window.confirm('Are you sure you want change the status?');
    if (!confirmDelete) {
      return;
    }
    const requestBody = {
      section_id: section_id,
      action: "DELETE"
    };
    try {
      const response = await axios.post(baseUrl + "/Sections/", requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
      });
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      toast.success("Record Set to InActive");
      fetchSections();
    } catch (error) {
      console.error('Error:', error);
    }
  };
  useEffect(() => {

    setIsLoading(true);
    fetchSections().finally(() => setIsLoading(false));
  }, []);
  const fetchTeachers = async () => {
    try {
      const response = await axios.post(baseUrl + "/Users/", {
        action: "TREAD",
        school_id: userObj.school_id
      });
      setTeachers(response.data);

    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
  const fetchNonTeachers = async () => {
    try {
      const response = await axios.post(baseUrl + "/Users/", {
        action: "TNREAD",
        school_id: userObj.school_id
      });
      setNonTeachers(response.data);

    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
    const readOnlyRoles = ["Class Teacher", "Teacher"];
    const canSubmit = !readOnlyRoles.includes(userObj.role_name?.trim());


  const fetchAcademicYear = async () => {
    try {
      const response = await axios.post(baseUrl + "/AcademicYear/", {
        action: "CURRENTREAD",
      });
      setacademic(response.data);

    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const fetchschool = async () => {
    try {
      const response = await axios.post(baseUrl + "/schoolmaster/", {
        action: "READ",
      });
      setSchool(response.data);

    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();



    const formData = {
      section_name: form.section_name,
      room_number: form.room_number,
      class_id: form.class_id,
      class_teacher_id: form.class_teacher_id,
      academic_coordinator_id: form.academic_coordinator_id,
      is_active: form.is_active || "A",
      school_id: userObj.school_id,
      academic_year_id: userObj.academic_year_id,
      action: editId !== null ? 'UPDATE' : 'CREATE'
    };
    if (editId !== null) {
      formData.section_id = editId;
    }
    try {
      const response = await axios.post(baseUrl + "/Sections/", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (editId !== null) {
        toast.success("Record Updated Successfully", { position: "top-right" });
        setEditId(null);
        setForm({
          section_id: "",
          section_name: "",
          class_id: "",
          class_teacher_id: "",
          academic_coordinator_id: "",
          room_number: "",
          school_id: "",
          school_name: "",
          academic_year_id: "",
          is_active: "A"
        });
        fetchSections();
      } else {
        toast.success("Record Added Successfully", { position: "top-right" });
        setForm({
          section_id: "",
          section_name: "",
          class_id: "",
          class_teacher_id: "",
          academic_coordinator_id: "",
          room_number: "",
          school_id: "",
          school_name: "",
          academic_year_id: "",
          is_active: "A"
        });
        await fetchSections();
      }

    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 400 && data.error === "Record already exists.") {

          toast.error("Record already exists.", { position: "top-right" });

        }
        else if (status === 402) {
          toast.error("Class Teacher Is Already Assigned To This Class And Section", { position: "top-right" });
        }
        else if (status === 401) {
          toast.error("Room Number is already Assigned")
        }
        else if (status === 500) {
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
  // const columns = [
  //   // {
  //   //   name: "Academic Year",
  //   //   selector: (row) => row.academic_year_name,
  //   //   cell: row => (
  //   //     <Tooltip title={row.academic_year_name}>
  //   //       <span>{row.academic_year_name}</span>
  //   //     </Tooltip>
  //   //   ),
  //   //   sortable: true,
  //   // },
  //   {
  //     name: "Class",
  //     selector: (row) => row.class_name,
  //     cell: row => (
  //       <Tooltip title={row.class_name}>
  //         <span>{row.class_name}</span>
  //       </Tooltip>
  //     ),
  //     sortable: true,
  //   },
  //   {
  //     name: "Section",
  //     selector: row => row.section_name,
  //     cell: row => (
  //       <Tooltip title={row.section_name}>
  //         <span>{row.section_name}</span>
  //       </Tooltip>
  //     ),
  //     sortable: true,
  //   },
  //   {
  //     name: "Room Number",
  //     selector: (row) => row.room_number,
  //     cell: row => (
  //       <Tooltip title={row.room_number}>
  //         <span>{row.room_number}</span>
  //       </Tooltip>
  //     ),
  //     sortable: true,
  //   },
  //   {
  //     name: "Is Active",
  //     selector: (row) => row.is_active,
  //     cell: row => (
  //       <Tooltip title={row.is_active}>
  //         <span>{row.is_active}</span>
  //       </Tooltip>
  //     ),
  //     sortable: true,
  //   },
  //   {
  //     name: "Actions",
  //     cell: (row) => row.section_id !== "No records found" ?
  //       (
  //         <div className='tableActions'>
  //           <Tooltip title="Edit" arrow>
  //             <a className='commonActionIcons' onClick={() => handleEditClick(row.section_id)}>
  //               <span><MdEdit /></span>
  //             </a>
  //           </Tooltip>

  //           <Tooltip title="Delete" arrow>
  //             <a className='commonActionIcons' onClick={() => handleDeleteClick(row.section_id)}>
  //               <span><MdDelete /></span>
  //             </a>
  //           </Tooltip>
  //         </div>
  //       ) : null
  //   },
  // ]
  const columns = [
    {
      name: "Class Name",
      selector: (row) => row.class_name,
      sortable: true,
      cell: row => (
        <Tooltip title={row.class_name}>
          <span>{row.class_name}</span>
        </Tooltip>
      ),
    }
  ];

  const searchableColumns = [
    (row) => row.academic_year_name,
    (row) => row.class_name,
    (row) => row.section_name,
    (row) => row.room_number,
    (row) => row.is_active,
  ];
  const filteredRecords = (sections || []).filter((section) =>
    searchableColumns.some((selector) => {
      const value = selector(section);
      return String(value || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    })
  );
  const handleSearchChange = (event) => {

    fetchSections();
    setSearchQuery(event.target.value);
  };
  const groupByClass = (sectionsList) => {
    const grouped = {};

    (sectionsList || []).forEach((item) => {
      const key = item.class_id;
      if (!grouped[key]) {
        grouped[key] = {
          class_id: item.class_id,
          class_name: item.class_name,
          sections: []
        };
      }
      grouped[key].sections.push(item);
    });

    return Object.values(grouped);
  };

  const groupedRecords = groupByClass(filteredRecords);
  const ExpandedComponent = ({ data }) => (
    <div
      className="expandedTableWrapper"
      style={{
        marginLeft: "100px", border: "1px solid rgb(204, 204, 204)", borderRadius: "8px", padding: "12px",
        background: "linear-gradient(135deg, rgb(249, 249, 249) 0%, rgb(230, 230, 230) 100%)", boxShadow: "rgba(0, 0, 0, 0.1) 2px 4px 10px"
      }}>

      <table className="customExpandedTable">
        <thead style={{ backgroundColor: "#dee2e6" }}>
          <tr className="border-blue">
            <th>Section</th>
           
            <th>Teacher</th>
            <th>Coordinator</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.sections.map((sec, idx) => (
            <tr key={idx}>
              <td>{sec.section_name}</td>
           
              <td>{sec.class_teacher_name}</td>
              <td>{sec.academic_coordinator_name}</td>
              <td>{sec.is_active}</td>
              <td>
                <div className=" d-flex gap-2">
                  <Tooltip title="Edit" arrow>
                    <span
                      className="commonActionIcons"
                      style={{ cursor: "pointer" }}
                    onClick={() => handleEditClick(sec.section_id)}

                    >
                      <MdEdit />
                    </span>
                  </Tooltip>
                  <Tooltip title="Delete" arrow>
                    <a className='commonActionIcons' onClick={() => handleDeleteClick(sec.section_id)}>
                      <span><MdDelete /></span>
                    </a>
                  </Tooltip>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <ToastContainer />
      <div>
        <Container fluid>
          <Card>
            <Card.Body style={{ padding: "2px" }}>
              <form onSubmit={handleSubmit}>
                {/* <Row>
                <Col xs={12}>
                  <h6 className="commonSectionTitle">Academic Section Details</h6>
                </Col>
              </Row> */}


                <Row className="g-3 align-items-end">
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
                      <Form.Label>
                        Class <span className="requiredStar">*</span>
                      </Form.Label>
                      <select
                        required
                        className="form-select"
                        id="class_id"
                        value={form.class_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Class</option>
                        {(classes || [])
                          .filter((cls) => cls.is_active === "Active")
                          .map((classe) => (
                            <option key={classe.class_id} value={classe.class_id}>
                              {classe.class_name}
                            </option>
                          ))}
                      </select>
                    </Form.Group>
                  </Col>

                  <Col md={2} className="m-0">
                    <Form.Group className="commonInput">
                      <Form.Label>
                        Section <span className="requiredStar">*</span>
                      </Form.Label>
                      <Form.Control
                        required
                        type="text"
                        id="section_name"
                        value={form.section_name}
                        maxLength={30}
                        placeholder="Enter Section"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (
                            /^[a-zA-Z0-9 +]*$/.test(value) &&
                            (value.match(/\+/g)?.length || 0) <= 1 &&
                            (value.match(/ /g)?.length || 0) <= 1
                          ) {
                            handleInputChange(e);
                          }
                        }}
                      />
                    </Form.Group>
                  </Col>

                  {/* <Col md={2}>
                    <Form.Group className="commonInput">
                      <Form.Label>
                        Room Number <span className="requiredStar">*</span>
                      </Form.Label>
                      <Form.Control
                        required
                        type="text"
                        id="room_number"
                        placeholder="Enter Room Number"
                        maxLength={30}
                        value={form.room_number}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[a-zA-Z0-9]*-?[a-zA-Z0-9]*$/.test(value)) {
                            handleInputChange(e);
                          }
                        }}
                      />
                    </Form.Group>
                  </Col> */}
                  <Col md={2} className="m-0">
                    <Form.Group className="commonInput">
                      <Form.Label>
                        Teacher <span className="requiredStar">*</span>
                      </Form.Label>
                      <select
                        required
                        className="form-select"
                        id="class_teacher_id"
                        value={form.class_teacher_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Teacher</option>
                        {(Teachers || [])
                          // .filter((cls) => cls.is_active === "Active")
                          .map((t) => (
                            <option key={t.userid} value={t.userid}>
                              {t.surname + " " + t.firstname}
                            </option>
                          ))}
                      </select>


                    </Form.Group>
                  </Col>
                  <Col md={2} className="m-0">
                    <Form.Group className="commonInput">
                      <Form.Label>
                        Co-ordinator <span className="requiredStar">*</span>
                      </Form.Label>
                      <select
                        required
                        className="form-select"
                        id="academic_coordinator_id"
                        value={form.academic_coordinator_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Co-ordinator</option>
                        {(NonTeachers || [])
                          // .filter((cls) => cls.is_active === "Active")
                          .map((t) => (
                            <option key={t.userid} value={t.userid}>
                              {t.surname + " " + t.firstname}
                            </option>
                          ))}
                      </select>


                    </Form.Group>
                  </Col>


                  {/* Buttons */}

                </Row>
                <div className="d-flex justify-content-between mt-1">
                  <Button
                    type="button"
                    variant="primary"
                    className="btn-info clearBtn"
                    onClick={() => {
                      setForm({
                        section_name: "",
                        class_id: "",
                        is_active: "",
                        class_teacher_id: "",
                        academic_coordinator_id: "",
                        createdby: "",
                        lastmodifiedby: "",

                      
                      });
                      setEditId(null);
                    }}
                  >
                    Reset
                  </Button>


                  <div>
                    <Button
                      type="button"
                      variant="danger"
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
   <div className="commonTable height100 mt-0" style={{ overflowY: "auto" }}>
  <div className="tableBody" style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}>
    {isLoading ? (
      <div className="loadingContainer">
        <img src={loading} alt="Loading..." className="loadingGif" />
      </div>
    ) : (
      <DataTable
        className="custom-table"
        columns={columns}
        data={
          Array.isArray(groupedRecords) && groupedRecords.length > 0
            ? groupedRecords
            : [
              {
                section_id: "No records found",
                section_name: "No records found",
              },
            ]
        }
        pagination={Array.isArray(groupedRecords) && groupedRecords.length > 0}
        highlightOnHover
        responsive
        fixedHeader
        fixedHeaderScrollHeight="calc(100vh - 400px)"
        expandableRows
        expandableRowsComponent={(props) => <ExpandedComponent {...props} />}
        conditionalRowStyles={[
          {
            when: (row) => row.section_id === "No records found",
            style: {
              textAlign: "center",
              fontSize: "16px",
              backgroundColor: "#f9f9f9",
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
export default AddNewSections
