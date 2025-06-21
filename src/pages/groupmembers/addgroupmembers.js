import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast, } from "react-toastify";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { fetchDataRead } from "../../Utility";
import Select from "react-select";
import { Tooltip } from "@mui/material";
import DataTable from "react-data-table-component";

function AddGroupMembers() {
  const routeLocation = useLocation();
  const [editId, setEditId] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [removedUserIds, setRemovedUserIds] = useState([]);
  const [existingGroupUserIds, setExistingGroupUserIds] = useState([]);
  const [userToGroupMemberMap, setUserToGroupMemberMap] = useState({});

  const [classes, setClasses] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [groups, setGroups] = useState([]);
  const [userRecords, setUserRecords] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const userData = sessionStorage.getItem("user");
  const userObj = userData ? JSON.parse(userData) : {};
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const [form, setForm] = useState({
    group_id: "",
    roleid: "",
    school_id: userObj.school_id || "",
    class_id: "",
    section_id: "",
  });

  const searchedUsers = filteredUsers.filter((user) => {
    const search = (searchText || "").toLowerCase();
    const userName = String(user?.user_name || "").toLowerCase();
    const studentName = String(user?.student_name || "").toLowerCase();
    const phoneNumber = String(user?.phone_number || "").toLowerCase();
    const roleName = String(user?.role_name || "").toLowerCase();
    return (
      userName.includes(search) ||
      studentName.includes(search) ||
      phoneNumber.includes(search) ||
      roleName.includes(search)
    );
  });

  useEffect(() => {
    fetchDataRead("/role/", setRoles, userObj.school_id);
    fetchDataRead("/Sections/", setSections, userObj.school_id);
    fetchDataRead("/classes/", setClasses, userObj.school_id);
    fetchDataRead("/creategroup", setGroups, userObj.school_id);
    fetchDataRead("/Users/", setUserRecords, userObj.school_id);
  }, []);

  useEffect(() => {
    if (routeLocation.state?.userData) {
      const userData = routeLocation.state.userData;
      setForm({
        group_id: userData.group_id || 0,
        user_id: userData.user_id || 0,
        school_id: userObj.school_id,
      });
      setEditId(userData.group_member_id);
      window.history.replaceState({}, document.title);
    }
  }, [routeLocation]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === "class_id") {
      const selectedClassId = parseInt(value, 10);
      const updatedSections = sections.filter((section) => section.class_id === selectedClassId);
      setFilteredSections(updatedSections);
      setForm((prev) => ({ ...prev, class_id: selectedClassId, section_id: "" }));
    } else {
      setForm((prevForm) => ({ ...prevForm, [id]: value }));
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (selectedUserIds.length === 0 && removedUserIds.length === 0) {
  //     toast.warning("Please select or deselect at least one user.");
  //     return;
  //   }

  //   const createPayload = selectedUserIds
  //     .filter((uid) => !existingGroupUserIds.includes(uid))
  //     .map((uid) => ({
  //       group_member_id: null,
  //       group_id: form.group_id,
  //       user_id: uid,
  //       createdby: userObj.email || "system",
  //       modifiedby: userObj.email || "system",
  //       school_id: userObj.school_id,
  //       status: "Active",
  //       action: "CREATE",
  //     }));

  //   const updatePayload = selectedUserIds
  //     .filter((uid) => existingGroupUserIds.includes(uid) && !removedUserIds.includes(uid))
  //     .map((uid) => ({
  //       group_member_id: userToGroupMemberMap[uid],
  //       group_id: form.group_id,
  //       user_id: uid,
  //       createdby: userObj.email || "system",
  //       modifiedby: userObj.email || "system",
  //       school_id: userObj.school_id,
  //       status: "Active",
  //       action: "UPDATE",
  //     }));

  //   const deletePayload = removedUserIds.map((uid) => ({
  //     group_member_id: userToGroupMemberMap[uid],
  //     group_id: form.group_id,
  //     user_id: uid,
  //     createdby: userObj.email || "system",
  //     modifiedby: userObj.email || "system",
  //     school_id: userObj.school_id,
  //     status: "Inactive",
  //     action: "DELETE",
  //   }));

  //   const payload = [...createPayload, ...updatePayload, ...deletePayload];

  //   try {
  //     await axios.post(`${baseUrl}/addnotificationgroupmembers/`, payload, {
  //       headers: { "Content-Type": "application/json" },
  //     });
  //     toast.success("Group members updated successfully");
  //     setSelectedUserIds([]);
  //     setRemovedUserIds([]);
  //   } catch (error) {
  //     toast.error("Failed to update group members");
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedUserIds.length === 0 && removedUserIds.length === 0) {
      toast.warning("Please select or deselect at least one user.");
      return;
    }

    // CREATE payload
    const createPayload = selectedUserIds
      .filter((uid) => !existingGroupUserIds.includes(uid))
      .map((uid) => ({
        group_member_id: null,
        group_id: form.group_id,
        user_id: uid,
        createdby: userObj.email || "system",
        modifiedby: userObj.email || "system",
        school_id: userObj.school_id,

        action: "CREATE",
      }));

    // UPDATE payload
    const updatePayload = selectedUserIds
      .filter((uid) => existingGroupUserIds.includes(uid) && !removedUserIds.includes(uid))
      .map((uid) => ({
        group_member_id: userToGroupMemberMap[uid],
        group_id: form.group_id,
        user_id: uid,
        createdby: userObj.user_name || "systemmmmmmmmmm",
        modifiedby: userObj.user_name || "systemmmmmmm",
        school_id: userObj.school_id,
        action: "UPDATE",
      }));

    // DELETE payload
    const deletePayload = removedUserIds.map((uid) => ({
      group_member_id: userToGroupMemberMap[uid],
      group_id: form.group_id,
      user_id: uid,
      createdby: userObj.userName || "system",
      modifiedby: userObj.userName || "system",
      school_id: userObj.school_id,

      action: "DELETE",
    }));
    console.log(deletePayload);
    console.log(updatePayload);
    console.log(createPayload);



    try {
      // send CREATE
      if (createPayload.length > 0) {
        await axios.post(`${baseUrl}/addnotificationgroupmembers11/`, createPayload, {
          headers: { "Content-Type": "application/json" },
        });
      }

      // send UPDATE
      if (updatePayload.length > 0) {
        await axios.post(`${baseUrl}/addnotificationgroupmembers11/`, updatePayload, {
          headers: { "Content-Type": "application/json" },
        });
      }

      // send DELETE
      if (deletePayload.length > 0) {
        await axios.post(`${baseUrl}/addnotificationgroupmembers11/`, deletePayload, {
          headers: { "Content-Type": "application/json" },
        });
      }

      toast.success("Group members updated successfully");
      fetchFilteredUsersAndMatchGroup();
      setSelectedUserIds([]);
      setRemovedUserIds([]);
    } catch (error) {
      toast.error("Failed to update group members");
    }
  };
 const fetchFilteredUsersAndMatchGroup = async () => {
      if (form.roleid && form.class_id && form.section_id && form.group_id) {
        try {
          const [usersRes, groupRes] = await Promise.all([
            axios.post(`${baseUrl}/GetUsersByRole`, {
              roleid: form.roleid,
              class_id: form.class_id,
              section_id: form.section_id,
              academic_year_id: userObj.academic_year_id,
              school_id: userObj.school_id,

            }, { headers: { "Content-Type": "application/json" } }),
            axios.post(`${baseUrl}/addnotificationgroupmembers_read/`, {
              school_id: userObj.school_id,
              group_id: form.group_id,
              status: "Active",
              action: "FILTER"
            }, { headers: { "Content-Type": "application/json" } })
          ]);

          const allUsers = usersRes.data || [];
          const groupUsers = groupRes.data || [];
          const groupUserIds = groupUsers.map(u => u.user_id);
          const matchedUserIds = allUsers.filter(u => groupUserIds.includes(u.user_id)).map(u => u.user_id);

          const userToGroupMap = {};
          groupUsers.forEach(u => {
            userToGroupMap[u.user_id] = u.group_member_id;
          });

          setUserToGroupMemberMap(userToGroupMap);
          setFilteredUsers(allUsers);
          setSelectedUserIds(matchedUserIds);
          setExistingGroupUserIds(groupUserIds);

        } catch (error) {
          toast.error("Failed to fetch users or group members");
          setFilteredUsers([]);
          setSelectedUserIds([]);
        }
      } else {
        setFilteredUsers([]);
        setSelectedUserIds([]);
      }
    };
  useEffect(() => {
   

    fetchFilteredUsersAndMatchGroup();
  }, [form.roleid, form.class_id, form.section_id, form.group_id]);


  const allSelected = filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length;

  const userColumns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px"
    },
    {
      name: "User Name",
      selector: (row) => row.user_name || "-",
      sortable: true
    },
    {
      name: "student",
      selector: (row) => row.student_name || "-",
      sortable: true
    },
    {
      name: "Phone Number",
      selector: (row) => row.phone_number || "-",
      sortable: true
    },
    {
      name: (
        <Form.Check
          type="checkbox"
          id="select-all-checkbox"
          checked={allSelected}
          onChange={(e) => {
            const checked = e.target.checked;
            setSelectedUserIds(checked ? filteredUsers.map(u => u.user_id) : []);
            if (!checked) {
              setRemovedUserIds(existingGroupUserIds);
            }
          }}
          label={<span>✔ Select All</span>}
          className="mb-0"
        />
      ),
      cell: (row) => {
        const userId = Number(row.user_id);
        const isSelected = selectedUserIds.includes(userId);
        const isNewlySelected = isSelected && !existingGroupUserIds.includes(userId);
        const isRemoved = removedUserIds.includes(userId);

        return (
          <div className="d-flex align-items-center" style={{ padding: "4px", borderRadius: "4px" }}>
            {isNewlySelected ? (
              // ✅ Show styled ✔ for newly selected
              <Form.Check
                type="checkbox"
                id={`checkbox-${userId}`} // unique ID for label if needed
                checked={selectedUserIds.includes(userId)}
                onChange={(e) => {
                  const checked = e.target.checked;

                  if (checked) {
                    setSelectedUserIds((prev) => [...prev, userId]);
                    setRemovedUserIds((prev) => prev.filter((id) => id !== userId));
                  } else {
                    setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
                    if (existingGroupUserIds.includes(userId)) {
                      setRemovedUserIds((prev) => [...prev, userId]);
                    }
                  }
                }}
              />



            ) : (
              // ✅ Show checkbox for existing/normal records
              <Form.Check
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  const checked = e.target.checked;

                  if (checked) {
                    setSelectedUserIds((prev) => [...prev, userId]);
                    setRemovedUserIds((prev) => prev.filter((id) => id !== userId));
                  } else {
                    setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
                    if (existingGroupUserIds.includes(userId)) {
                      setRemovedUserIds((prev) => [...prev, userId]);
                    }
                  }
                }}
              />
            )}

            {isRemoved && (
              <span style={{ color: "red", marginLeft: "5px" }}></span>
            )}
          </div>
        );
      },

      width: "130px"
    }
  ];
  return (
    <Container fluid>
      <div className="pageMain">
        <ToastContainer />
        <LeftNav />
        <div className="pageRight">
          <div className="pageHead">
            <Header />
          </div>
          <div className="pageBody">
            <Container fluid>
              <Card>
                <Card.Body>
                  <form onSubmit={handleSubmit}>
                    <Row>
                      <Col xs={12}>
                        <h6 className="commonSectionTitle">Add Group Members</h6>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className="commonInput">
                          <Form.Group controlId="group_id">
                            <Form.Label>Group <span className="requiredStar">*</span></Form.Label>
                            <Form.Select required id="group_id" value={form.group_id} onChange={handleInputChange}>
                              <option value="">Select Group</option>
                              {groups.map((group) => (
                                <option key={group.group_id} value={group.group_id}>
                                  {group.group_name}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <div className="commonInput">
                          <Form.Group controlId="roleid">
                            <Form.Label>Role <span className="requiredStar">*</span></Form.Label>
                            <Form.Select required value={form.roleid} onChange={handleInputChange}>
                              <option value="">Select Role</option>
                              {roles.filter(role => role.is_active === "Active").map(role => (
                                <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} sm={6} md={4} lg={3}>
                        <div className="commonInput">
                          <Form.Group controlId="class_id">
                            <Form.Label>Class <span className="requiredStar">*</span></Form.Label>
                            <Form.Select required id="class_id" value={form.class_id} onChange={handleInputChange}>
                              <option value="">Select Class</option>
                              {classes.filter(cls => cls.is_active === "Active").map(cls => (
                                <option key={cls.class_id} value={cls.class_id}>{cls.class_name}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xs={12} sm={6} md={4} lg={3}>
                        <div className="commonInput">
                          <Form.Group controlId="section_id">
                            <Form.Label>Section <span className="requiredStar">*</span></Form.Label>
                            <Form.Select required id="section_id" value={form.section_id} onChange={handleInputChange} disabled={!form.class_id}>
                              <option value="">Select Section</option>
                              {filteredSections.filter(sec => sec.is_active === "Active").map(sec => (
                                <option key={sec.section_id} value={sec.section_id}>{sec.section_name}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </Col>
                    </Row>
                    <div className="d-flex justify-content-between mt-3">
                      <div>
                        <Button type="button" className="btn btn-info clearBtn" onClick={() => {
                          setForm({ group_id: "", user_id: "", school_id: userObj.school_id });
                          setSelectedUserIds([]);
                        }}>Reset</Button>
                      </div>
                      <div>
                        <Button type="button" variant="danger" className="secondaryBtn" onClick={() => window.history.back()}>Cancel</Button>
                        <Button type="submit" className="btn btn-success primaryBtn">Submit</Button>
                      </div>
                    </div>
                  </form>
                  {form.roleid && form.class_id && form.section_id && (
                    <div className="mt-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="commonSectionTitle mb-0">Filtered Users</h6>
                        <Form.Control
                          type="text"
                          size="sm"
                          style={{ width: "250px" }}
                          placeholder="Search..."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                        />
                      </div>

                      <div className="commonTable height100">
                        <div className="tableBody">
                          <DataTable
                            className="custom-table"
                            columns={userColumns}
                            data={
                              Array.isArray(searchedUsers) && searchedUsers.length > 0
                                ? searchedUsers
                                : [{ user_id: "No records found", user_name: "No records found" }]
                            }
                            pagination={Array.isArray(searchedUsers) && searchedUsers.length > 0}
                            highlightOnHover
                            responsive
                            fixedHeader
                            fixedHeaderScrollHeight="300px"
                            conditionalRowStyles={[
                              {
                                when: (row) => row.user_id === "No records found",
                                style: {
                                  textAlign: "center",
                                  fontSize: "16px",
                                  color: "red"
                                }
                              }
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  )}


                </Card.Body>
              </Card>
            </Container>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default AddGroupMembers;
