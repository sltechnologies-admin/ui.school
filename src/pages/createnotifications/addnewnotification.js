import React, { useState, useRef } from "react";
import DOMPurify from "dompurify";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form
} from "react-bootstrap";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

const AddNewNotification = () => {
  const userData = sessionStorage.getItem("user");
  const userObj = userData ? JSON.parse(userData) : {};

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSetName, setImageSetName] = useState("");
  const [imagePath, setImagePath] = useState("");

  const fileInputRef = useRef(null);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const convertContentToHTML = (value) => DOMPurify.sanitize(value);

  const uploadImage = async () => {
    if (!selectedFile) return null;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(`${baseUrl}/uploads/upload/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.filename;
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Image upload failed");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let uploadedImageFileName = "";

    try {

      if (selectedFile) {
        const uploadedPath = await uploadImage();
        if (!uploadedPath) return;
        uploadedImageFileName = uploadedPath.split("/").pop();
      }

      const payload = {
        action: "CREATE",
        subject,
        description: convertContentToHTML(description),
        school_id: userObj.school_id,
        createdby: userObj.email || "system",
        image_path: uploadedImageFileName || null,
        modifiedby: null,
        notification_id: null,
        status: "A"
      };

      await axios.post(`${baseUrl}/notifications/`, payload, {
        headers: { "Content-Type": "application/json" }
      });

      toast.success("Notification added successfully");
      setSubject("");
      setDescription("");
      setSelectedFile(null);
      setImageSetName("");
      setImagePath("");
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to add notification");
    }
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type");
        return;
      }
      setSelectedFile(file);
      setImageSetName(file.name);
      setImagePath(URL.createObjectURL(file));
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
                  <h6 className="commonSectionTitle">Add Notification</h6>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col xs={12} md={6} lg={4} xxl={3}>
                        <Form.Group controlId="subject">
                          <Form.Label>
                            Subject <span className="requiredStar">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter Subject "
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>

                      <Col xs={12} className="mt-3">
                        <Form.Group controlId="description">
                          <Form.Label>
                            Description <span className="requiredStar">*</span>
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={5}
                            placeholder="Enter Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>

                      <Col xs={12} md={6} lg={4} xxl={3} className="mt-3">
                        <Form.Group>
                          <Form.Label>Image Upload</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                          />
                          {imageSetName && (
                            <div className="d-flex justify-content-between align-items-center mt-2">
                              <span>{imageSetName}</span>
                              <span
                                onClick={handleRemoveFile}
                                style={{ cursor: "pointer", color: "red" }}
                              >
                                ✖
                              </span>
                            </div>
                          )}
                        </Form.Group>
                      </Col>


                    </Row>
                    <div className="d-flex justify-content-between mt-3">
                      <div>
                        <Button
                          type="button"
                          variant="primary"
                          className="btn-info clearBtn"
                          onClick={() => {
                            setSubject("");
                            setDescription("");
                            setSelectedFile(null);
                            setImageSetName("");
                            setImagePath("");
                          }}

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
                  </Form>
                </Card.Body>
              </Card>
            </Container>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default AddNewNotification;
