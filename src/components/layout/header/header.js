import React from 'react';
import { Container, Row, Col, Card, Badge, Image, Button } from "react-bootstrap";

//Gadgets

//Import Gallery
import loginPhoto from '../../../assets/images/common/loginPhoto.png';

//Icons
import { FaBell } from "react-icons/fa6";

//Css
import '../header/header.css';
import PageInfoStatus from "../pageInfoStatus/pageInfoStatus";

const Header = () => {
   const userData = sessionStorage.getItem('user');
     const userObj = userData ? JSON.parse(userData) : {};
  return (
    <Container fluid className='topNav'>
      {/* <div className=''>
        <h4>Page Title</h4>
      </div> */}
      <div className="pageInfoStatusSubHead">
                        <PageInfoStatus />
                    </div>
      <div className='rightNavigations'>
        
        {/* <div className='topNotification'>
          <span className='notificationIcon'><FaBell /></span>
          <span className='notificationCount'>01</span>
        </div> */}
        <div className='profileInfo'>
          <div className='profileInfoLeft'>
            <h6 className='user'>{ userObj.user_name}</h6>
            <p className='role'>{userObj.role_name}</p>
          </div>
          <div className='profileInfoRight'>
            <Image src={loginPhoto} alt="Account Background" fluid />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Header;
