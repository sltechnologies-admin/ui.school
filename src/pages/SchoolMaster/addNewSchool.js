import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
function AddNewSchool() {  
  const [editId, setEditId] = useState(null);
  const routeLocation = useLocation();
  const [states, setStates] = useState([]);
  const [countrys, setCountrys] = useState([]);
  const [boards, setBoard] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const imgName = routeLocation.state?.imgName || "";   
  const [imagePath, setImagePath] = useState("");
  const [imageSetName, setImageSetName] = useState("");
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const [form, setForm] = useState({
    school_id: "",
    school_name: "",
    board_id: "",
    address: "",
    branch: "",
    city: "",
    state: "",
    country: "",  
    contact_person: "",
    mobile_number: "",
    registration_no: "",
    gst: "",
    email: "",
    website: "",
    logo: "",
    school_location: "",
    school_description: "",
    school_office_phone_number: "",
    principal_phone_number: "",
    incharge_phone_number: "",
    status: "A",
  });
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
  useEffect(() => {
    if (routeLocation.state?.schoolData) {
      const schoolData = routeLocation.state.schoolData;
      setForm(schoolData);
      setEditId(schoolData.school_id);
    }
  }, [routeLocation]);
  const fetchDropdownData = async (endpoint, setter) => {
    try {
      const response = await axios.post(baseUrl + endpoint, { action: 'READ' });
      setter(response.data);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  };
  useEffect(() => {
    fetchDropdownData('/country/', setCountrys);
    fetchDropdownData('/board/', setBoard);
    fetchDropdownData('/states/', setStates);
  }, []);
  const handleInputChange = (e) => {
    const { id, value, files } = e.target;
  
    if (id === "logo" && files.length > 0) {
      const fileName = files[0];
      setForm((prevState) => ({
        ...prevState,
        logo: fileName,
      }));
    } else if (id === "school_name") { 
      if (/^[A-Za-z\s]*$/.test(value)) {
        setForm((prevForm) => ({
          ...prevForm,
          [id]: value,
        }));
      }
    } else if (
      id === "contact_person" ||
      id === "mobile_number" ||
      id === "school_office_phone_number" ||
      id === "principal_phone_number" ||
      id === "incharge_phone_number"
    ) {
      if (/^\d*$/.test(value)) {
        setForm((prevForm) => ({
          ...prevForm,
          [id]: value,
        }));
      }
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        [id]: value,
      }));
    }
  };
  
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

      return response.data.file_path;
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Error uploading logo");
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let uploadedLogoPath = form.logo;
    try {
      if (selectedFile) {
        uploadedLogoPath = await uploadLogo();
        if (!uploadedLogoPath) {
        }
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Error uploading logo: " + error.message);
      return;
    }

    const formData = {
      school_name: form.school_name,
      board_id: form.board_id,
      address: form.address,
      branch: form.branch,
      city: form.city,
      state: form.state,
      country: form.country,
      contact_person: form.contact_person,
      mobile_number: form.mobile_number,
      registration_no: form.registration_no,
      gst: form.gst,
      email: form.email,
      website: form.website,
      logo: selectedFile ? selectedFile.name : "",
      status: form.status || "A",
      school_location: form.school_location,
      school_description: form.school_description,
      school_office_phone_number: form.school_office_phone_number,
      principal_phone_number: form.principal_phone_number,
      incharge_phone_number: form.incharge_phone_number,
      action: editId !== null ? "UPDATE" : "CREATE",
    };
    if (editId !== null) {
      formData.school_id = editId;
    }
    try {
      const response = await axios.post(baseUrl + "/schoolmaster/", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (editId !== null) {
        toast.success("Record Updated Successfully", { position: "top-right" });
        setEditId(null);
      } else {
        toast.success("Record Added Successfully", { position: "top-right" });
      }
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (
          status === 400 &&
          data.error === "School name with this branch already exists."
        ) {
          toast.error("School with this branch already exists.", {
            position: "top-right",
          });
        } else if (status === 500) {
          toast.error(
            "Error submitting data: " + (data.error || error.message),
            { position: "top-right" }
          );
        } else {
          toast.error("Unexpected error occurred", { position: "top-right" });
        }
      } else {
        toast.error("Error submitting data: " + error.message, {
          position: "top-right",
        });
      }
    }
    setForm({
      school_name: "",
      board_id: "",
      address: "",
      branch: "",
      city: "",
      state: "",
      country: "",
      contact_person: "",
      mobile_number: "",
      registration_no: "",
      gst: "",
      email: "",
      website: "",
      logo: "",
      school_location: "",
      school_description: "",
      school_office_phone_number: "",
      principal_phone_number: "",
      incharge_phone_number: "",
      status: "A",
    });

    setSelectedFile(null);
    setImageSetName("");
    setImagePath("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
            <div className="">
              <Card>
                <Card.Body className="hide-scrollbar">
                  <div className="">
                    <div className="image-upload-container">
                      <div className="image-circle">
                        <img
                          src={
                            imagePath ||
                            "path_to_default_image_or_placeholder.png"
                          }
                          className="uploaded-image"
                          alt="Uploaded Logo"
                        />
                        <div className="image-placeholder"></div>
                      </div>
                    </div>
                  </div>
                  <form className="" onSubmit={handleSubmit}>
                    <div className="">
                      <Row>
                        <Col xs={12}>
                          <h6 className="commonSectionTitle">
                            School Details
                          </h6>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>
                                School Name{" "}
                                <span className="requiredStar">*</span>
                              </Form.Label>
                              <Form.Control
                                required
                                type="text"
                                id="school_name"
                                value={form.school_name}
                                placeholder="Enter School Name"
                                maxLength={30}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  handleInputChange(e);
                                }}
                              />
                              {/[0-9]/.test(form.school_name) && (
                                <div className="text-danger mt-1">
                                  Only letters and spaces allowed.
                                </div>
                              )}
                            </Form.Group>
                          </div>
                        </Col>
                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>
                                Curriculum
                                <span className="requiredStar">*</span>
                              </Form.Label>
                              <Form.Select
                                required
                                className="form-select"
                                id="board_id"
                                value={form.board_id}
                                onChange={handleInputChange}
                              >
                                <option value="">Select Board</option>
                                {boards.map((board) => (
                                  <option
                                    key={board.board_id}
                                    value={board.board_id}
                                  >
                                    {board.board_name}
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
                                Branch<span className="requiredStar">*</span>
                              </Form.Label>
                              <Form.Control
                                required
                                type="text"
                                id="branch"
                                value={form.branch}
                                placeholder="Branch"
                                maxLength={50}
                                onChange={handleInputChange}
                              />
                              <Form.Control.Feedback>
                                Required
                              </Form.Control.Feedback>
                            </Form.Group>
                          </div>
                        </Col>

                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>
                                Registration Number
                                <span className="requiredStar">*</span>
                              </Form.Label>
                              <Form.Control
                                required
                                type="text"
                                placeholder="Enter Registration Number"
                                maxLength={20}
                                id="registration_no"
                                value={form.registration_no}
                                onChange={handleInputChange}
                              />
                              <Form.Control.Feedback>
                                Required
                              </Form.Control.Feedback>
                            </Form.Group>
                          </div>
                        </Col>
                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>
                                Address<span className="requiredStar">*</span>
                              </Form.Label>
                              <Form.Control
                                required
                                as="textarea"
                                id="address"
                                value={form.address}
                                placeholder="Address"
                                maxLength={150}
                                rows={4}
                                onChange={handleInputChange}
                              />
                              <Form.Control.Feedback>
                                Required
                              </Form.Control.Feedback>
                            </Form.Group>
                          </div>
                        </Col>

                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>
                                City<span className="requiredStar">*</span>
                              </Form.Label>
                              <Form.Control
                                required
                                type="text"
                                id="city"
                                value={form.city}
                                placeholder="City"
                                maxLength={50}
                                onChange={handleInputChange}
                              />
                              <Form.Control.Feedback>
                                Required
                              </Form.Control.Feedback>
                            </Form.Group>
                          </div>
                        </Col>
                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>
                                <Form.Label>
                                  State<span className="requiredStar">*</span>
                                </Form.Label>
                              </Form.Label>
                              <Form.Select
                                required
                                className="form-select"
                                id="state"
                                value={form.state}
                                onChange={handleInputChange}
                              >
                                <option value="">Select State</option>
                                {states.map((state) => (
                                  <option
                                    key={state.state_id}
                                    value={state.state_id}
                                  >
                                    {state.state_name}
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
                                <Form.Label>
                                  Country
                                  <span className="requiredStar">*</span>
                                </Form.Label>
                              </Form.Label>
                              <Form.Select
                                required
                                id="country"
                                value={form.country}
                                onChange={handleInputChange}
                              >
                                <option value="">Select Country</option>
                                {countrys.map((country) => (
                                  <option
                                    key={country.country_id}
                                    value={country.country_id}
                                  >
                                    {country.country_name}
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
                                Contact Person Number
                                <span className="requiredStar">*</span>
                              </Form.Label>
                              <Form.Control
                                required
                                type="text"
                                id="contact_person"
                                value={form.contact_person || ""}
                                placeholder="Enter Contact Person Number"
                                onChange={handleInputChange}
                                maxLength={10}
                              />
                            </Form.Group>
                          </div>
                        </Col>
                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>
                                Mobile Number{" "}
                                <span className="requiredStar">*</span>
                              </Form.Label>
                              <Form.Control
                                required
                                type="text"
                                id="mobile_number"
                                value={form.mobile_number || ""}
                                placeholder="Enter Mobile Number"
                                onChange={handleInputChange}
                                maxLength={10}
                              />
                            </Form.Group>
                          </div>
                        </Col>
                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>
                                Email<span className="requiredStar">*</span>
                              </Form.Label>
                              <Form.Control
                                required
                                type="email"
                                id="email"
                                value={form.email}
                                placeholder="Enter Email Address"
                                maxLength={150}
                                onChange={handleInputChange}
                              />
                              <Form.Control.Feedback>
                                Required
                              </Form.Control.Feedback>
                            </Form.Group>
                          </div>
                        </Col>
                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>Website</Form.Label>
                              <Form.Control
                                type="text"
                                id="website"
                                value={form.website}
                                placeholder="Website"
                                maxLength={255}
                                onChange={handleInputChange}
                              />
                            </Form.Group>
                          </div>
                        </Col>

                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>Logo</Form.Label>
                              <Form.Control
                                type="file"
                                id="logo"
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
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>
                                Location
                                <span className="requiredStar">*</span>
                              </Form.Label>
                              <Form.Control
                                required
                                as="textarea"
                                rows="4"
                                type="text"
                                id="school_location"
                                value={form.school_location}
                                placeholder="School Location"
                                maxLength={200}
                                onChange={handleInputChange}
                              />
                              <Form.Control.Feedback>
                                Required
                              </Form.Control.Feedback>
                            </Form.Group>
                          </div>
                        </Col>
                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>
                                School Description
                                <span className="requiredStar">*</span>
                              </Form.Label>
                              <Form.Control
                                required
                                type="text"
                                as="textarea"
                                rows="8"
                                id="school_description"
                                value={form.school_description}
                                placeholder="School Description Here"
                                maxLength={500}
                                onChange={handleInputChange}
                              />
                              <Form.Control.Feedback>
                                Required
                              </Form.Control.Feedback>
                            </Form.Group>
                          </div>
                        </Col>

                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>
                                Office Number{" "}
                                <span className="requiredStar">*</span>
                              </Form.Label>
                              <Form.Control
                                required
                                type="text"
                                id="school_office_phone_number"
                                value={form.school_office_phone_number}
                                placeholder="Enter Office Number"
                                onChange={handleInputChange}
                                maxLength={10}
                              />
                            </Form.Group>
                          </div>
                        </Col>
                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>
                                Principal Contact Number{" "}
                                <span className="requiredStar">*</span>
                              </Form.Label>
                              <Form.Control
                                required
                                type="text"
                                id="principal_phone_number"
                                value={form.principal_phone_number}
                                placeholder="Enter Principal Contact Number"
                                onChange={handleInputChange}
                                maxLength={10}
                              />
                            </Form.Group>
                          </div>
                        </Col>
                        <Col xs={12} md={6} lg={4} xxl={3}>
                          <div className="commonInput">
                            <Form.Group>
                              <Form.Label>
                                Incharge Contact Number{" "}
                                <span className="requiredStar">*</span>
                              </Form.Label>
                              <Form.Control
                                required
                                type="text"
                                id="incharge_phone_number"
                                value={form.incharge_phone_number}
                                placeholder="Enter Incharge Contact Number"
                                onChange={handleInputChange}
                                maxLength={10}
                              />
                            </Form.Group>
                          </div>
                        </Col>
                      </Row>
                    </div>
                    <div className="d-flex justify-content-between mt-3">
                      <div className="">
                        <Button
                          type="button"
                          variant="primary"
                          className="btn-info clearBtn"
                          onClick={() =>
                            setForm({
                              school_id: "",
                              school_name: "",
                              address: "",
                              branch: "",
                              city: "",
                              state: "",
                              country: "",
                              contact_person: "",
                              mobile_number: "",
                              registration_no: "",
                              gst: "",
                              email: "",
                              website: "",
                              logo: "",
                              school_location: "",
                              school_description: "",
                              school_office_phone_number: "",
                              principal_phone_number: "",
                              incharge_phone_number: "",
                            })
                          }
                        >
                          Reset
                        </Button>
                      </div>
                      <div className="">
                        <Button
                          type="button"
                          variant="primary"
                          className=" btn-danger secondaryBtn"
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
            </div>
          </Container>
        </div>
      </div>
    </div>

  );
}

export default AddNewSchool;
