import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Form, Button, Image, Modal } from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import "bootstrap-icons/font/bootstrap-icons.css";
// Import Images
import accountBg from '../../../assets/images/account/accountBg.png';
import appIcon from '../../../assets/images/common/appIcon.png';
 
// CSS
import '../login/login.css';
 
const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
 
  const navigate = useNavigate();
  const baseUrl = process.env.REACT_APP_API_BASE_URL ;
 
 
  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    email: '',
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
 
  // Handle input changes for Reset Password
  const handleResetPasswordChange = (e) => {
    setResetPasswordData({ ...resetPasswordData, [e.target.name]: e.target.value });
  };
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    const { email, old_password, new_password, confirm_password } = resetPasswordData;
 
    // ✅ Ensure all fields are filled
    if (!email || !old_password || !new_password || !confirm_password) {
      toast.error('All fields are required.');
      return;
    }
 
    // ✅ Ensure new password matches confirm password
    if (new_password !== confirm_password) {
      toast.error('New password and confirm password must match.');
      return;
    }
 
    setLoading(true);
 
    try {
      // ✅ Send request to backend with correct field name (`current_password`)
      const response = await axios.post(`${baseUrl}/resetpassword/`, {
        email,
        current_password: old_password,  // ✅ Fix field name
        new_password
      });
 
      const { status, data } = response;
 
      // ✅ Handle API Response Properly
      if (status === 200 && data.message === "Password reset successfully") {
        toast.success('Password reset successfully.');
        setShowResetPasswordModal(false);
        setResetPasswordData({ email: '', old_password: '', new_password: '', confirm_password: '' });
      } else {
        // Handle backend error messages properly
        throw new Error(data.detail || 'Failed to reset password.');
      }
 
    } catch (error) {
      console.error('Reset password error:', error);
 
      if (error.response) {
        const { status, data } = error.response;
 
        if (status === 400) {
          toast.error(data.detail || 'Invalid request.');
        } else if (status === 401) {
          toast.error('Incorrect current password.');
        } else if (status === 404) {
          toast.error('User not found.');
        } else {
          toast.error('Failed to reset password. Please try again.');
        }
      } else {
        toast.error('Network error. Please check your internet connection.');
      }
 
    } finally {
      setLoading(false);
    }
  };
 
  // Handle Reset Password Submission
  // const handleResetPasswordSubmit = async (e) => {
  //   e.preventDefault();
  //   const { email, old_password, new_password, confirm_password } = resetPasswordData;
 
  //   if (!email || !old_password || !new_password || !confirm_password) {
  //     toast.error('All fields are required.');
  //     return;
  //   }
 
  //   if (new_password !== confirm_password) {
  //     toast.error('New password and confirm password must match.');
  //     return;
  //   }
 
  //   setLoading(true);
 
  //   try {
  //     const response = await axios.post(`${baseUrl}/resetpassword/`, {
  //       email,
  //       old_password,
  //       new_password,
  //     });
 
  //     if (response.status === 200) {
  //       toast.success('Password reset successfully.');
  //       setShowResetPasswordModal(false);
  //       setResetPasswordData({ email: '', old_password: '', new_password: '', confirm_password: '' });
  //     } else {
  //       toast.error('Failed to reset password.');
  //     }
  //   } catch (error) {
  //     console.error('Reset password error:', error);
  //     toast.error(error.response?.data?.detail || 'Something went wrong.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // Handle login
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
 
    setLoading(true);
 
    try {
      const response = await axios.post(`${baseUrl}/login/`, { email, password });
 
      if (response.data) {
        const { user_id, user_name,school_id,school_name,academic_year_id,academic_year_name,role_id,role_name,logo} = response.data;
        // console.log(user_id, user_name,school_id,school_name,academic_year_id,academic_year_name);
        sessionStorage.setItem('user', JSON.stringify({ user_id,user_name,school_id, school_name,academic_year_id,academic_year_name,role_id,role_name,logo }));
        navigate('/dashboard');
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.detail || 'Login error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
 
  // Generate a random password
  const generatePassword = () => {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*!";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };
 
  // Handle Reset Password
  // Handle Reset Password using forgot password API
  const handleResetPassword = async (e) => {
    e.preventDefault();
 
    if (!forgotEmail) {
      toast.error('Please enter your email.');
      return;
    }
 
    const newPassword = generatePassword(); // Generate new password
    const passwordFlag = "forgot"; // Use appropriate flag
 
    setLoading(true);
 
    try {
      console.log(`Checking if email exists: ${forgotEmail}`);
 
      // Step 1: Check if the email exists in the database
      const checkEmailResponse = await axios.post(`${baseUrl}/check-email/`, { email: forgotEmail });
 
      if (checkEmailResponse.status === 200 && checkEmailResponse.data.exists) {
        console.log("Email found, resetting password.");
 
        // Step 2: Use the Forgot Password API instead of Reset Password
        const forgotPasswordResponse = await axios.post(`${baseUrl}/forgotpassword/`, {
          email: forgotEmail,
          new_password: newPassword,
          password_flag: "Y", // Pass flag
        });
 
        if (forgotPasswordResponse.status === 200) {
          // Step 3: Send reset password email
          await axios.post(`${baseUrl}/send-email/`, {
            email: forgotEmail,
            password: newPassword, // Send the generated password
          });
 
          toast.success("A new password has been sent to your email.");
          setShowForgotPasswordModal(false);
          setForgotEmail('');
        } else {
          toast.error(forgotPasswordResponse.data.message || "Failed to reset password.");
        }
      } else {
        toast.error("Email not found .");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className='height100'>
      <ToastContainer />
 
      <Row className='height100'>
        <Col xs={12} md={6} lg={7} className='height100'>
          <div className='accountBg'>
            <div className='accounBgInner'>
              <Image src={accountBg} alt="Account Background" fluid rounded />
            </div>
          </div>
        </Col>
        <Col xs={12} md={6} lg={5} className='height100'>
          <div className='accountInner height100'>
            <div>
              <Row>
                <Col xs={12}>
                  <div className='accountLogoIcon'>
                    <Image src={appIcon} alt="App Icon" fluid rounded />
                  </div>
                  <h2>Welcome Back!</h2>
                  <p>Enter to get unlimited access to data & information.</p>
                </Col>
              </Row>
            </div>
            <div>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col xs={12}>
                    <div className='commonInput'>
                      <Form.Group controlId="email">
                        <Form.Label>Email <span className='requiredStar'>*</span></Form.Label>
                        <Form.Control
                          required
                          type="email"
                          name="email"
                          className="input"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your Email Address"
                        />
                      </Form.Group>
                    </div>
                  </Col>
                  <Col sm={12}>
                    <div className='commonInput'>
                      <Form.Group controlId="password">
                        <Form.Label>Password <span className='requiredStar'>*</span></Form.Label>
                        <Form.Control
                          required
                          type="password"
                          name="password"
                          className="input"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter your Password"
                        />
                      </Form.Group>
                    </div>
                  </Col>
                  <Col xs="12" className='mb-3'>
                    <div className="floatR">
                      <a href="#" onClick={(e) => { e.preventDefault(); setShowForgotPasswordModal(true); }}>
                        Forgot Password?
                      </a>
                      <span style={{ margin: "0 10px" }}>|</span>
                      <a href="#" onClick={(e) => { e.preventDefault(); setShowResetPasswordModal(true); }}>
                        Reset Password
                      </a>
                    </div>
                  </Col>
 
                  <Col xs="12">
                    <Button variant="primary" className='submit w-100 commonBtn' type="submit" disabled={loading}>
                      {loading ? 'Logging in...' : 'Login'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
 
     
   
      <Modal show={showForgotPasswordModal} onHide={() => setShowForgotPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Forgot  Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleResetPassword}>
            <Form.Group controlId="forgotEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </Form.Group>
 
            <div className="mt-4 d-flex justify-content-end">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Processing...' : 'Submit'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal show={showResetPasswordModal} onHide={() => setShowResetPasswordModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="w-100 text-center">
            <i className="bi bi-shield-lock-fill me-2"></i> Reset Your Password
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleResetPasswordSubmit}>
            {/* Email Field */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold"><i ></i>Email</Form.Label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person-fill"></i></span>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter your registered email"
                  value={resetPasswordData.email}
                  onChange={handleResetPasswordChange}
                  className="py-2"
                  required
                />
              </div>
            </Form.Group>
 
            {/* Old Password Field */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold"><i className=""></i>Current Password</Form.Label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-key-fill me-2"></i></span>
                <Form.Control
                  type="password"
                  name="old_password"
                  placeholder="Enter your current password"
                  value={resetPasswordData.old_password}
                  onChange={handleResetPasswordChange}
                  className="py-2"
                  required
                />
              </div>
            </Form.Group>
 
            {/* New Password Field */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold"><i className=""></i>New Password</Form.Label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-shield-lock-fill me-2"></i></span>
                <Form.Control
                  type="password"
                  name="new_password"
                  placeholder="New password"
                  value={resetPasswordData.new_password}
                  onChange={handleResetPasswordChange}
                  className="py-2"
                  required
                />
              </div>
            </Form.Group>
 
            {/* Confirm New Password Field */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold"><i className=""></i>Confirm Password</Form.Label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-shield-lock-fill me-2"></i></span>
                <Form.Control
                  type="password"
                  name="confirm_password"
                  placeholder="Confirm password"
                  value={resetPasswordData.confirm_password}
                  onChange={handleResetPasswordChange}
                  className="py-2"
                  required
                />
              </div>
            </Form.Group>
 
            {/* Buttons */}
            <div className="d-flex justify-content-center">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? <i className="bi bi-arrow-repeat"></i> : <i className=""></i>} Submit
              </Button>
            </div>
 
          </Form>
        </Modal.Body>
      </Modal>
 
    </div>
  );
};
 
export default Login;
 