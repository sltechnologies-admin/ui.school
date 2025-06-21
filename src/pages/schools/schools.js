import React from 'react';
import { useNavigate } from "react-router-dom";

//Gadgets Import
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';

//Icons 
import { FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { IoMdChatboxes } from "react-icons/io";

//Css
import '../schools/schools.css';
import { CardFooter } from 'react-bootstrap';

//Components
import Header from '../../components/layout/header/header';


export const schoolsData = [
    {
      id: 1,
      name: "School A",
      address: "123 Main St",
      students: 120,
      classes: 12,
      employees: 15,
      dor: "2023-01-01",
      logo: "path/to/logo1.jpg",
    },
    {
      id: 2,
      name: "School B",
      address: "456 Elm St",
      students: 200,
      classes: 18,
      employees: 25,
      dor: "2022-12-15",
      logo: "path/to/logo2.jpg",
    },
    // Add more schools as needed
  ];


const Schools = () => {
 
    const navigate = useNavigate();

    const handleCardClick = (id) => {
      navigate(`/dashboard`);
    };

  return (
    <div className='height100'>
        <Container fluid>
            <div className='height100'>
                <div className=''>
                    <Header></Header>
                </div>
                
                <div className=''>
                    <div className='commonTopHeader'>
                        <Row className=''>
                            <Col xs={12} md={6}>
                            </Col>
                            <Col xs={12} md={6}>
                            </Col>
                        </Row>
                    </div>
                    <div className=''>
                        <Row>
                            {schoolsData.map((school) => (
                            <Col xs={12} md={6} lg={3}>
                                <Card className='commonCard schoolCard' onClick={() => handleCardClick(school.id)}>
                                    <Card.Img variant="top" src="holder.js/100px180" className='schoolLogo' />
                                    <Card.Body>
                                        <Card.Title className='text-center'>{school.name}</Card.Title>
                                        <Card.Text className='text-center addressText'>{school.address}</Card.Text>
                                        <Row>
                                            <Col xs={12} md={6}>
                                                <div className='commonPreData'>
                                                    <span className='commonLabel'>Students:</span><span className='commonValue'>{school.students}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6}>
                                                <div className='commonPreData'>
                                                    <span className='commonLabel'>Classes:</span><span className='commonValue'>{school.classes}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6}>
                                                <div className='commonPreData'>
                                                    <span className='commonLabel'>Employees:</span><span className='commonValue'>{school.employees}</span>
                                                </div>
                                            </Col>
                                            <Col xs={12} md={6}>
                                                <div className='commonPreData'>
                                                    <span className='commonLabel'>DOR:</span><span className='commonValue'>{school.dor}</span>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                    <Card.Footer>
                                        <Row>
                                            <Col xs={4} className="commonHorizontalCenter">
                                                <div className='commonActionIcons'>
                                                    <span><FaPhoneAlt /></span>
                                                </div>
                                            </Col>
                                            <Col xs={4} className='commonHorizontalCenter'>
                                                <div className='commonActionIcons'>
                                                    <span><MdEmail /></span>
                                                </div>
                                            </Col>
                                            <Col xs={4} className='commonHorizontalCenter'>
                                                <div className='commonActionIcons'>
                                                    <span><IoMdChatboxes /></span>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Footer>
                                </Card>
                            </Col>
                             ))}
                        </Row>
                    </div>
                </div>
            </div>
        </Container>      
    </div>
  );
};

export default Schools;
