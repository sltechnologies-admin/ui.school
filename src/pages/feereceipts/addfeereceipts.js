import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import Header from "../../components/layout/header/header";
import { ToastContainer, toast } from 'react-toastify';
import Select from "react-select";
import LeftNav from "../../components/layout/leftNav/leftNav";
import FeeParticulars from "./FeeParticulars";

const AddFeeReceipts = () => {
  const userData = sessionStorage.getItem('user');
  const userObj = JSON.parse(userData);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [filterdStudents, setFilterdStudents] = useState([]);
  const [feeschedule, setFeeschedule] = useState([]);
  const [receiptData, setReceiptData] = useState({
    amountDetails: [],
    grandTotal: "",
  });

  const [form, setForm] = useState({
    class_id: "",
    class_name: "",
    school_id: userObj.school_id || 0,
    academic_year_id: userObj.academic_year_id || 0,
    student_id: "",
    student_name: "",
    section_id: "",
    reciept_date: "",
    admission_number: "",
    receipt_no: "",
    father_name: "",
    mode: "",
    transation_no: "",
    fee_schedule_id: "",
    schedule_name: "",
    section_name: "",
    contact_no: "",
    remarks: "",
  });

  useEffect(() => {
    document.title = "SCHOLAS";
    fetchClasses();
    fetchTerms();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.post(baseUrl + "/classes/", {
        action: "READ",
        school_id: userObj.school_id
      });

      const filterData = Array.isArray(response.data) ? response.data : [];

      const filteredClasses = filterData.filter(
        item => item.is_active?.toLowerCase() === 'active'
      );

      setClasses(filteredClasses)
    }
    catch (error) {
      console.error("Error fetching academic data:", error);
    }
  };

  useEffect(() => {
    setReceiptData((prevData) => ({
      ...prevData,
      amountDetails: [],
      grandTotal: 0,
    }));

    setForm(prevForm => ({
      ...prevForm,
      student_id: "",
      student_name: "",
      section_id: "",
      reciept_date: "",
      admission_number: "",
      receipt_no: "",
      father_name: "",
      mode: "",
      transation_no: "",
      fee_schedule_id: "",
      schedule_name: "",
      section_name: "",
      contact_no: "",
      remarks: "",
    }));

    fetchSections(form.class_id || 0);
  }, [form.class_id]);

  const fetchSections = async (class_id) => {
    try {
      const response = await axios.post(baseUrl + "/Sections/", {
        action: "DROPDOWNREAD",
        school_id: userObj.school_id,
        class_id: class_id
      });
      const filterData = Array.isArray(response.data) ? response.data : [];

      const filteredClasses = filterData.filter(
        item => item.is_active?.toLowerCase() === 'active'
      );
      setSections(filteredClasses);
    }
    catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        const errorMessage = data.error || data.message || "Unexpected error occurred";
        if (status === 404) {
          setSections([]);
        }
      } else {
        console.error("Error fetching section:", error);
      }
    }
  };

  const fetchTerms = async () => {
    try {
      const response = await axios.post(baseUrl + "/feeschedule/", {
        action: "READ",
        school_id: userObj.school_id,
        academic_year_id: userObj.academic_year_id
      });

      const data = response.data || [];

      const filterData = Array.isArray(response.data) ? response.data : [];

      const filteredTerms = filterData
        .filter(item => item.status?.toLowerCase() === 'active')
        .sort((a, b) => a.schedule_name.localeCompare(b.schedule_name));

      setFeeschedule(filteredTerms);
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  useEffect(() => {
    setReceiptData((prevData) => ({
      ...prevData,
      amountDetails: [],
      grandTotal: 0,
    }));

    setForm(prevForm => ({
      ...prevForm,
      student_id: "",
      student_name: "",
      //section_id: "",
      reciept_date: "",
      admission_number: "",
      receipt_no: "",
      father_name: "",
      mode: "",
      transation_no: "",
      fee_schedule_id: "",
      schedule_name: "",
      section_name: "",
      contact_no: "",
      remarks: "",
    }));

    fetchStudents(form.class_id || 0, form.section_id || 0);
  }, [form.class_id, form.section_id]);

  const fetchStudents = async (class_id, section_id) => {
    try {
      const response = await axios.post(baseUrl + "/students/", {
        action: "READ",
        school_id: userObj.school_id
      });
      const filterData = Array.isArray(response.data) ? response.data : [];

      const filteredStudents = filterData.filter(
        item => item.status?.toLowerCase() === 'active'
          && String(item.class_id) === class_id
          && String(item.section_id) === section_id
          && String(item.academic_year_id) === userObj.academic_year_id
      );

      setFilterdStudents(filteredStudents);

      const options = filteredStudents.map((readstudent) => ({
        value: readstudent.student_id,
        label: `${readstudent.student_first_name} ${readstudent.student_last_name}`,
      }));

      setStudents(options);
    }
    catch (error) {
      console.error("Error fetching students:", error);
    }
  };


  useEffect(() => {
    const filteredStudents = filterdStudents.filter(
      item => item.student_id === form.student_id
    );

    if (filteredStudents.length > 0) {
      setForm(prevForm => ({
        ...prevForm,
        admission_number: filteredStudents[0].admission_number || "",
        student_name: `${filteredStudents[0]?.student_first_name || ""} ${filteredStudents[0]?.student_last_name || ""}`.trim(),
        father_name: `${filteredStudents[0]?.father_firstname || ""} ${filteredStudents[0]?.father_surname || ""}`.trim(),
        class_name: filteredStudents[0].class_name || "",
        section_name: `${filteredStudents[0]?.class_name || ""} & ${filteredStudents[0]?.section_name || ""}`,
      }));
    }

    if (form.student_id) {
      fetchFeesItems();
    }

  }, [form.student_id, filterdStudents]);

  const fetchFeesItems = async () => {
    try {
      const response = await axios.post(baseUrl + "/getrecieptsfeeitems/", {
        school_id: userObj.school_id,
        academic_year_id: userObj.academic_year_id,
        student_id: form.student_id,
        class_id: form.class_id
      });

      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        setReceiptData((prevData) => ({
          ...prevData,
          amountDetails: data,
          grandTotal: data.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
        }));
      } else {
        setReceiptData((prevData) => ({
          ...prevData,
          amountDetails: [],
          grandTotal: 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching amount details:", error);
      setReceiptData((prevData) => ({
        ...prevData,
        amountDetails: [],
        grandTotal: 0,
      }));
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value
    }));
  };

  const handleAmountChange = (index, newValue) => {
    const updatedAmountDetails = [...receiptData.amountDetails];
    updatedAmountDetails[index].amount = newValue;

    const newGrandTotal = updatedAmountDetails.reduce((total, item) => {
      return total + (parseFloat(item.amount) || 0);
    }, 0);

    setReceiptData((prevData) => ({
      ...prevData,
      amountDetails: updatedAmountDetails,
      grandTotal: newGrandTotal.toString(),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const submissionData = receiptData.amountDetails.map(item => ({
      action: "CREATE",
      fees_reciepts_id: 0,
      amount_paid: item.amount ? item.amount : 0,
      school_id: userObj.school_id || 0,
      mode: form.mode,
      remarks: form.remarks,
      receipt_date: form.reciept_date,
      fee_receipt_no: form.receipt_no,
      fees_schedule_id: form.fee_schedule_id,
      fees_item_id: item.fees_item_id,
      class_id: form.class_id,
      academic_year_id: userObj.academic_year_id || 0,
      student_id: form.student_id
    }));

    try {
      const response = await axios.post(baseUrl + "/insertfeereciepts/bulk/", submissionData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success("Records Added Successfully");

      setReceiptData((prevData) => ({
        ...prevData,
        amountDetails: [],
        grandTotal: 0,
      }));

      setForm({
        class_id: "",
        class_name: "",
        student_id: "",
        student_name: "",
        section_id: "",
        reciept_date: "",
        admission_number: "",
        receipt_no: "",
        father_name: "",
        mode: "",
        transation_no: "",
        fee_schedule_id: "",
        schedule_name: "",
        section_name: "",
        contact_no: "",
        remarks: "",
      })
      return true;
    } catch (error) {
      console.error("There was an error submitting:", error);
      return false;
    }
  };

  return (
    <div className='pageMain'>
      <ToastContainer />
      <LeftNav />
      <div className='pageRight'>
        <div className='pageHead'>
          <Header />
        </div>
        <div className='pageBody'>
          <Container fluid>
            <Card>
              <Card.Body>
                <form onSubmit={handleSubmit}>
                  <Row>
                    <Col xs={12}>
                      <h6 className='commonSectionTitle'>Fees Discount</h6>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} md={6} lg={3} xxl={3}>
                      <div className='commonInput'>
                        <Form.Group controlId="combined_name">
                          <Form.Label>Class Name<span className='requiredStar'>*</span></Form.Label>
                          <Form.Select
                            required
                            id="class_id"
                            value={form.class_id}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Class Name</option>
                            {(classes || []).map((obj) => (
                              <option key={obj.class_id} value={obj.class_id}>{obj.class_name}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </Col>
                    <Col xs={12} md={6} lg={3} xxl={3}>
                      <div className='commonInput'>
                        <Form.Group>
                          <Form.Label>Section<span className='requiredStar'>*</span></Form.Label>
                          <Form.Select
                            required
                            className="form-select"
                            id="section_id"
                            value={form.section_id}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Section</option>
                            {(sections || []).map((section) => (
                              <option key={section.section_id} value={section.section_id}>
                                {section.section_name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </Col>
                    <Col xs={12} md={6} lg={3} xxl={3}>
                      <div className='commonInput'>
                        <Form.Group controlId="student_name">
                          <Form.Label>Student Name<span className='requiredStar'>*</span></Form.Label>
                          <Select
                            id="student_id"
                            className="basic-single"
                            classNamePrefix="select"
                            required
                            isClearable
                            isSearchable
                            options={students}
                            value={students.find(option => option.value === form.student_id) || null}
                            onChange={(selectedOption) => {
                              setForm({ ...form, student_id: selectedOption?.value || 0 });
                            }}
                          />
                        </Form.Group>
                      </div>
                    </Col>
                    <Col xs={12} md={6} lg={3} xxl={3}>
                      <div className='commonInput'>
                        <Form.Group controlId="student_name">
                          <Form.Label>Term<span className='requiredStar'>*</span></Form.Label>
                          <Form.Select
                            required
                            id="fee_schedule_id"
                            value={form.fee_schedule_id}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Term</option>
                            {(feeschedule || []).map((term) => (
                              <option key={term.fee_schedule_id} value={term.fee_schedule_id}>{term.schedule_name}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <div>
                      <table className="receipt-table">
                        <thead>
                          <tr>
                            <th colSpan="6" className="title">FEE RECEIPT</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Date</td>
                            <td>
                              <input
                                required
                                type="date"
                                id="reciept_date"
                                value={form.reciept_date}
                                placeholder="Enter Receipt Date"
                                onChange={handleInputChange}
                              />
                            </td>
                            <td>Admission No</td>
                            <td>
                              <input
                                type="text"
                                id="admission_no"
                                value={form.admission_number}
                                placeholder="Enter Admission No"
                                onChange={handleInputChange}
                                readOnly
                              />
                            </td>
                            <td>Receipt No</td>
                            <td>
                              <input
                                type="text"
                                id="receipt_no"
                                value={form.receipt_no}
                                placeholder="Enter Receipt Number"
                                onChange={handleInputChange}
                                required
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Student Name</td>
                            <td colSpan="3">
                              <input
                                type="text"
                                id="student_name"
                                value={form.student_name}
                                placeholder="Enter Student Name"
                                onChange={handleInputChange}
                                readOnly
                              />
                            </td>
                            <td>Class & Sec</td>
                            <td>
                              <input
                                type="text"
                                id="section_name"
                                value={form.section_name}
                                placeholder="Enter Class Name"
                                onChange={handleInputChange}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Father Name</td>
                            <td colSpan="3">
                              <input
                                type="text"
                                id="father_name"
                                value={form.father_name}
                                placeholder="Enter Father Name"
                                onChange={handleInputChange}
                                readOnly
                              />
                            </td>
                            <td>Contact No</td>
                            <td>
                              <input
                                type="text"
                                id="contact_no"
                                value={form.contact_no}
                                placeholder="Enter Contact No"
                                onChange={handleInputChange}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Mode of Payment</td>
                            <td colSpan="2">
                              <select
                                id="mode"
                                value={form.mode}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '5px' }}
                                required
                              >
                                <option value="">Select Mode Of Payment</option>
                                <option value="UPI">UPI</option>
                                <option value="Cash">Cash</option>
                                <option value="Cheque">Cheque</option>
                              </select>
                            </td>
                            <td>Remarks</td>
                            <td colSpan="2">
                              <textarea
                                id="remarks"
                                value={form.remarks}
                                placeholder="Enter Remarks"
                                onChange={handleInputChange}
                                rows={2}
                                style={{ width: "100%" }}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <FeeParticulars
                      amountDetails={receiptData.amountDetails}
                      grandTotal={receiptData.grandTotal}
                      onAmountChange={handleAmountChange}
                    />
                  </Row>
                  <div className="d-flex justify-content-between mt-3">
                    <div>
                      <Button
                        type="button"
                        variant="primary"
                        className="btn-info clearBtn"
                        onClick={() => {
                          setReceiptData((prevData) => ({
                            ...prevData,
                            amountDetails: [],
                            grandTotal: 0,
                          }));
                          setForm({
                            class_id: "",
                            class_name: "",
                            student_id: "",
                            student_name: "",
                            section_id: "",
                            reciept_date: "",
                            admission_number: "",
                            receipt_no: "",
                            father_name: "",
                            mode: "",
                            transation_no: "",
                            fee_schedule_id: "",
                            schedule_name: "",
                            section_name: "",
                            contact_no: "",
                            remarks: "",
                          })
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
                </form>
              </Card.Body>
            </Card>
          </Container>
        </div>
      </div>
    </div>
  )
}

export default AddFeeReceipts