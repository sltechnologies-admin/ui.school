import React from 'react';
import { Container, Row, Col, Card, Badge, Image, Button } from "react-bootstrap";
 
import sampleSchoolLogo from "../../../assets/images/common/sampleSchoolLogo.png";
 
//Css
import '../pageInfoStatus/pageInfoStatus.css';
 
const PageInfoStatus = () => {
  const userData = sessionStorage.getItem('user');
  const userObj = userData ? JSON.parse(userData) : {};
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const apiUrl = baseUrl + `/uploads/get-image/${userObj.logo}`;
  return (
    <Container fluid className='pageInfoStatusCard float-start'>
          <div className="schoolInfo">
              <div className="schoolLogo">
                  <Image src={apiUrl} alt="School Logo" fluid rounded />
              </div>
              <div className="schoolDetails pt-3">
                 <h4>{userObj.school_name }</h4>
              </div>
          </div>
    </Container>
  );
};
 
export default PageInfoStatus;