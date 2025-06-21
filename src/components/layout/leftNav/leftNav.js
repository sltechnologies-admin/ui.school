import React, { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { Accordion, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router-dom'; // useLocation to track the active route

import { RiUserStarFill, RiMoneyRupeeCircleFill } from "react-icons/ri";
import { IoLibrary } from "react-icons/io5";
import { HiDocumentReport } from "react-icons/hi";
import { HiOutlineAcademicCap } from "react-icons/hi2";
import { IoIosArrowBack } from "react-icons/io";
import { MdSms, MdSchool, MdAdminPanelSettings, MdOutlineHelp, MdNotifications, MdNoteAlt, MdOutlineEmojiTransportation, MdOutlineWebAsset, MdCalculate, MdLocalLibrary } from "react-icons/md";
import { BsPeople, BsPersonCheck, BsBuilding, BsClipboardData, BsCardChecklist, BsBook, BsBell, BsCalendar, BsClock, BsFileEarmarkText } from "react-icons/bs";
// Css
import '../leftNav/leftNav.css';

// Icons
import { RiHomeSmileFill } from 'react-icons/ri';

// Gadgets
import { Image } from 'react-bootstrap';

// Import Images
import appLogo from '../../../assets/images/common/logo.png';
import appLogoIcon from '../../../assets/images/common/appIcon.png';

const LeftNav = () => {
    const [activeKey, setActiveKey] = useState(null);
    const location = useLocation(); // useLocation hook to get the current path

    const [isOpen, setIsOpen] = useState(false);

    const toggleLeftNav = () => {
        setIsOpen(!isOpen);
    };



    useEffect(() => {
        if (
            location.pathname.startsWith('/users') || location.pathname.startsWith('/usersadd') ||
            location.pathname.startsWith('/schoolmaster') || location.pathname.startsWith('/addNewSchool') ||
            location.pathname.startsWith('/roles') || location.pathname.startsWith('/AddRoles') ||
            location.pathname.startsWith('/departments') || location.pathname.startsWith('/AddDepartments') ||
            location.pathname.startsWith('/dashboard') ||
            location.pathname.startsWith('/schoolcalendar') || location.pathname.startsWith('/addevent')

        ) {
            setActiveKey("1"); // Admin Section
        } else if (
            location.pathname.startsWith('/classes') || location.pathname.startsWith('/addnewclass') ||
            location.pathname.startsWith('/subjects') || location.pathname.startsWith('/addsubject') ||
            location.pathname.startsWith('/students') || location.pathname.startsWith('/addstudent') ||
            location.pathname.startsWith('/viewstudents') ||
            location.pathname.startsWith('/studentacademicyear') ||
            location.pathname.startsWith('/AddStudentAcademic') ||
            location.pathname.startsWith('/sections') ||
            location.pathname.startsWith('/AddNewSections') ||
            location.pathname.startsWith('/teachersubjectmap') ||
            location.pathname.startsWith('/addteachersubjectmap') ||
            location.pathname.startsWith('/studentattendance') ||
            location.pathname.startsWith('/addstudentattendance') ||
            location.pathname.startsWith('/homework') ||
            location.pathname.startsWith('/addhomework') ||
            location.pathname.startsWith('/periods') ||
            location.pathname.startsWith('/addperiods') ||
            location.pathname.startsWith('/syllabus') ||
            location.pathname.startsWith('/addsyllabus') ||
            location.pathname.startsWith('/timetable') ||
            location.pathname.startsWith('/addtimetable')
        ) {
            setActiveKey("2");

        } else if (
            location.pathname.startsWith('/creategroups') || location.pathname.startsWith('/addcreategroups') ||
            location.pathname.startsWith('/sendnotifications') || location.pathname.startsWith('/addnotifications') ||
            // location.pathname.startsWith('/createnotifications') || location.pathname.startsWith('/addnotifiaction') ||
            location.pathname.startsWith('/groupmembers') || location.pathname.startsWith('/addgroupmembers')
        ) {
            setActiveKey("13");
        }
        else if (
            location.pathname.startsWith('/feeitems') || location.pathname.startsWith('/addfeeitems') ||
            location.pathname.startsWith('/feeitemslist') || location.pathname.startsWith('/addfeeitemslist') ||
            location.pathname.startsWith('/feediscount') || location.pathname.startsWith('/addfeediscount') ||
            location.pathname.startsWith('/feeitemschedule') || location.pathname.startsWith('/addfeeitemschedule') ||
            location.pathname.startsWith('/feeitemschedule1') || location.pathname.startsWith('/addfeeitemschedule1') ||
            location.pathname.startsWith('/feeschedule') || location.pathname.startsWith('/addfeeschedule') ||
            location.pathname.startsWith('/feesstudentsschedule') || location.pathname.startsWith('/addfeesstudentsschedule') ||
            location.pathname.startsWith('/feereceipts') || location.pathname.startsWith('/addfeereceipts')

        ) {
            setActiveKey("3");
        }
        else if (
            location.pathname.startsWith('/grades') || location.pathname.startsWith('/addgrades') ||
            location.pathname.startsWith('/result') || location.pathname.startsWith('/addresult') ||
            location.pathname.startsWith('/examschedule') || location.pathname.startsWith('/addexamschedule') ||

            location.pathname.startsWith('/exam') || location.pathname.startsWith('/addexam') || location.pathname.startsWith('/bulkaddresult')
        ) {
            setActiveKey("5");
        }
        else if (
            location.pathname.startsWith('/historyreports') ||
            location.pathname.startsWith('/dailyattendancereport') ||
            location.pathname.startsWith('/wiseattendancereport') ||
            location.pathname.startsWith('/admissionreport') ||
            location.pathname.startsWith('/typereport') ||
            location.pathname.startsWith('/schoolstrength')
        ) {
            setActiveKey("6");
        }


    }, [location]);

    const handleAccordionToggle = (key) => {
        setActiveKey(activeKey === key ? null : key); // Toggle the section open/close
    };
    return (
        <div className={`leftNav ${isOpen ? "closeNav" : ""}`}>
            <div className='leftNavTopPart'>
                <div className='logoPart'>
                    <Image src={appLogo} alt="Account Background" className='appLogo' />
                    <Image src={appLogoIcon} alt="Account Background" className='appLogoIcon' />
                </div>
                <div className='toggleNavBtnPart'>
                    <Button variant="primary" className='toggleNavBtn' onClick={toggleLeftNav}>
                        <IoIosArrowBack />
                    </Button>
                </div>
            </div>
            <Nav variant="pills" activeKey={activeKey}>

                {/* Admin Links */}
                <Accordion activeKey={activeKey}>
                    <Accordion.Item eventKey="2">
                        <Accordion.Header onClick={() => handleAccordionToggle("2")}>
                            <OverlayTrigger placement="right" overlay={<Tooltip>Student Management System</Tooltip>}>
                                <span className='leftNavIcon'><MdSchool /></span>
                            </OverlayTrigger>
                            <span className='leftNavIconLabel'>SMS</span>
                        </Accordion.Header>
                        <Accordion.Collapse eventKey="2">
                            <Nav className="flex-column">
                                <NavLink to="/studentacademicyear" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/AddStudentAcademic') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Academic Years</Tooltip>}>
                                        <span className='leftNavIcon'><BsCalendar /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Academic Years</span>
                                </NavLink>
                                <NavLink to="/classes" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/addnewclass') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Classes</Tooltip>}>
                                        <span className='leftNavIcon'><BsCardChecklist /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Classes</span>
                                </NavLink>
                                <NavLink to="/subjects" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/addsubject') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Subjects</Tooltip>}>
                                        <span className='leftNavIcon'><BsBook /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Subjects</span>
                                </NavLink>
                                <NavLink to="/sections" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/AddNewSections') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Academic Sections</Tooltip>}>
                                        <span className='leftNavIcon'><BsCardChecklist /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Academic Sections</span>
                                </NavLink>
                                <NavLink to="/teachersubjectmap" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/addteachersubjectmap') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Academic Class Setup</Tooltip>}>
                                        <span className='leftNavIcon'><HiOutlineAcademicCap /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Academic Class Setup</span>
                                </NavLink>
                                <NavLink
                                    to="/students"
                                    className={({ isActive }) =>
                                        isActive || location.pathname === "/addstudent" || location.pathname === "/viewstudents"
                                            ? "nav-link active"
                                            : "nav-link"
                                    }
                                >

                                    <OverlayTrigger placement="right" overlay={<Tooltip>Students</Tooltip>}>
                                        <span className='leftNavIcon'><BsPeople /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Students</span>
                                </NavLink>









                                <NavLink to="/studentattendance" className={({ isActive }) =>
                                    isActive || location.pathname === '/addstudentattendance' ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Attendance</Tooltip>}>
                                        <span className='leftNavIcon'><BsClipboardData /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Attendance</span>
                                </NavLink>
                                <NavLink to="/timetable" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/addtimetable') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Time Table</Tooltip>}>
                                        <span className='leftNavIcon'><RiUserStarFill /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Time Table</span>
                                </NavLink>
                                <NavLink to="/homework/homeworklist" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/addhomework') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Homework</Tooltip>}>
                                        <span className='leftNavIcon'><BsBook /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Homework</span>
                                </NavLink>
                                <NavLink to="/periods" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/addperiods') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Periods</Tooltip>}>
                                        <span className='leftNavIcon'><BsBook /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Periods</span>
                                </NavLink>
                                <NavLink to="/syllabus" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/addsyllabus') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Syllabus Planning</Tooltip>}>
                                        <span className='leftNavIcon'><BsBook /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Syllabus Planning</span>
                                </NavLink>
                                <NavLink to="/Promote Students" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/Promote Students') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Promote Students</Tooltip>}>
                                        <span className='leftNavIcon'><BsBook /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Promote Students</span>
                                </NavLink>

                            </Nav>
                        </Accordion.Collapse>

                    </Accordion.Item>
                </Accordion>
                <Accordion activeKey={activeKey}>
                    <Accordion.Item eventKey="3">
                        <Accordion.Header onClick={() => handleAccordionToggle("3")}>
                            <OverlayTrigger placement="right" overlay={<Tooltip>Fee Management</Tooltip>}>
                                <span className='leftNavIcon'><RiMoneyRupeeCircleFill /></span>
                            </OverlayTrigger>
                            <span className='leftNavIconLabel'>Fee Management</span>
                        </Accordion.Header>
                        <Accordion.Collapse eventKey="3">
                            <Nav className="flex-column">
                                <NavLink to="/feeitemslist" className={({ isActive }) =>
                                    isActive || location.pathname === '/addfeeitemslist' ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Fee Items List</Tooltip>}>
                                        <span className='leftNavIcon'><BsPeople /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Fee Items List</span>
                                </NavLink>
                                <NavLink to="/feeitems" className={({ isActive }) =>
                                    isActive || location.pathname === '/addfeeitems' ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Fees Items Amount</Tooltip>}>
                                        <span className='leftNavIcon'><BsPeople /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Fees Items Amount</span>
                                </NavLink>
                                <NavLink to="/feeschedule" className={({ isActive }) =>
                                    isActive || location.pathname === '/addfeeschedule' ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Fees Schedule</Tooltip>}>
                                        <span className='leftNavIcon'><BsPeople /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Fees Schedule</span>
                                </NavLink>
                                <NavLink to="/feeitemschedule" className={({ isActive }) =>
                                    isActive || location.pathname === '/addfeeitemschedule' ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Fees Item Schedule</Tooltip>}>
                                        <span className='leftNavIcon'><BsPeople /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Fees Item Schedule</span>
                                </NavLink>
                                <NavLink to="/feesstudentsschedule" className={({ isActive }) =>
                                    isActive || location.pathname === '/addfeesstudentsschedule' ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Fees Discount</Tooltip>}>
                                        <span className='leftNavIcon'><BsPeople /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Fees Discount</span>
                                </NavLink>
                                <NavLink to="/feereceipts" className={({ isActive }) =>
                                    isActive || location.pathname === '/addfeereceipts' ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Fee Receipts</Tooltip>}>
                                        <span className='leftNavIcon'><BsPeople /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Fee Receipts</span>
                                </NavLink>
                            </Nav>
                        </Accordion.Collapse>
                    </Accordion.Item>
                </Accordion>
                <Accordion activeKey={activeKey}>
                    <Accordion.Item eventKey="5">
                        <Accordion.Header onClick={() => handleAccordionToggle("5")}>
                            <OverlayTrigger placement="right" overlay={<Tooltip>Exam Module</Tooltip>}>
                                <span className='leftNavIcon'><MdNoteAlt /></span>
                            </OverlayTrigger>
                            <span className='leftNavIconLabel'>Exam Module</span>
                        </Accordion.Header>
                        <Accordion.Collapse eventKey="5">
                            <Nav className="flex-column">
                                <NavLink
                                    to="/exam"
                                    className={({ isActive }) =>
                                        isActive || location.pathname === "/addexam" ? "nav-link active" : "nav-link"
                                    }
                                >
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Exam Master</Tooltip>}>
                                        <span className="leftNavIcon"><BsCalendar /></span>
                                    </OverlayTrigger>
                                    <span className="leftNavIconLabel">Exam Master</span>
                                </NavLink>
                                <NavLink to="/grades"
                                    className={({ isActive }) =>
                                        isActive || location.pathname === "/addgrades" ? "nav-link active" : "nav-link"
                                    }
                                >
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Grades</Tooltip>}>
                                        <span className='leftNavIcon'><BsClipboardData /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Grades</span>
                                </NavLink>
                                <NavLink to="/examschedule" className="nav-link  d-flex align-items-center">
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Exam Schedule</Tooltip>}>
                                        <span className='leftNavIcon'><BsCalendar /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Exam Schedule</span>
                                </NavLink>
                                <NavLink
                                    to="/result"
                                    className={({ isActive }) =>
                                        isActive || location.pathname === "/addresult" || location.pathname === "/bulkaddresult"
                                            ? "nav-link active"
                                            : "nav-link"
                                    }
                                >
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Exam Results</Tooltip>}>
                                        <span className="leftNavIcon"><BsClipboardData /></span>
                                    </OverlayTrigger>
                                    <span className="leftNavIconLabel">Upload Results</span>
                                </NavLink>

                            </Nav>
                        </Accordion.Collapse>

                    </Accordion.Item>
                </Accordion>
                <Accordion activeKey={activeKey}>
                    <Accordion.Item eventKey="13">
                        <Accordion.Header onClick={() => handleAccordionToggle("13")}>
                            <OverlayTrigger placement="right" overlay={<Tooltip>Notifications</Tooltip>}>
                                <span className='leftNavIcon'><MdNotifications /></span>
                            </OverlayTrigger>
                            <span className='leftNavIconLabel'>Notifications</span>
                        </Accordion.Header>
                        <Accordion.Collapse eventKey="13">
                            <Nav className="flex-column">
                                <NavLink to="/creategroups" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/addcreategroups') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Create Groups</Tooltip>}>
                                        <span className='leftNavIcon'><BsPeople /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Create Groups</span>
                                </NavLink>
                                <NavLink to="/groupmembers" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/addgroupmembers') ? 'nav-link active' : 'nav-link'
                                }>

                                    <OverlayTrigger placement="right" overlay={<Tooltip>Group Members</Tooltip>}>
                                        <span className='leftNavIcon'><BsPeople /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Group Members</span>
                                </NavLink>
                                {/* <NavLink to="/createnotifications" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/addnotification') ? 'nav-link active' : 'nav-link'
                                }>

                                    <OverlayTrigger placement="right" overlay={<Tooltip>Create Notifications</Tooltip>}>
                                        <span className='leftNavIcon'><BsPeople /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Create Notifications</span>
                                </NavLink> */}
                                <NavLink to="/sendnotifications" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/addnotifications') ? 'nav-link active' : 'nav-link'
                                }>

                                    <OverlayTrigger placement="right" overlay={<Tooltip>Send Notification</Tooltip>}>
                                        <span className='leftNavIcon'><BsPeople /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Send Notification</span>
                                </NavLink>

                            </Nav>

                        </Accordion.Collapse>
                    </Accordion.Item>
                </Accordion>

                <Accordion activeKey={activeKey}>
                    <Accordion.Item eventKey="1">
                        <Accordion.Header onClick={() => handleAccordionToggle("1")}>
                            <OverlayTrigger placement="right" overlay={<Tooltip>Admin</Tooltip>}>
                                <span className='leftNavIcon'><MdAdminPanelSettings /></span>
                            </OverlayTrigger>
                            <span className='leftNavIconLabel'>Admin</span>
                        </Accordion.Header>
                        <Accordion.Collapse eventKey="1">
                            <Nav className="flex-column">
                                <NavLink
                                    to="/dashboard"
                                    className={({ isActive }) =>
                                        isActive || location.pathname.startsWith('/dashboard') ? 'nav-link active' : 'nav-link'
                                    }
                                >
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Dashboard</Tooltip>}>
                                        <span className='leftNavIcon'><BsPeople /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Dashboard</span>
                                </NavLink>

                                <NavLink
                                    to="/users"
                                    className={({ isActive }) =>
                                        isActive || location.pathname.startsWith('/usersadd') ? 'nav-link active' : 'nav-link'
                                    }
                                >
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Users</Tooltip>}>
                                        <span className='leftNavIcon'><BsPeople /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Users</span>
                                </NavLink>
                                <NavLink
                                    to="/schoolmaster"
                                    className={({ isActive }) =>
                                        isActive || location.pathname.startsWith('/addNewSchool') ? 'nav-link active' : 'nav-link'
                                    }
                                >
                                    <OverlayTrigger placement="right" overlay={<Tooltip>School Master</Tooltip>}>
                                        <span className='leftNavIcon'><BsPeople /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>School Master</span>
                                </NavLink>

                                <NavLink to="/roles" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/AddRoles') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Roles</Tooltip>}>
                                        <span className='leftNavIcon'><BsPersonCheck /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Roles</span>
                                </NavLink>
                                <NavLink to="/departments" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/AddDepartments') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Departments</Tooltip>}>
                                        <span className='leftNavIcon'><BsBuilding /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>Departments</span>
                                </NavLink>


                                <NavLink to="/schoolcalendar" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/addevent') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>School Calendar</Tooltip>}>
                                        <span className='leftNavIcon'><RiUserStarFill /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>School Calendar</span>
                                </NavLink>


                            </Nav>
                        </Accordion.Collapse>
                    </Accordion.Item>
                </Accordion>

                {/* SMS Links */}


                <Accordion activeKey={activeKey}>
                    <Accordion.Item eventKey="4">
                        <Accordion.Header onClick={() => handleAccordionToggle("4")}>
                            <OverlayTrigger placement="right" overlay={<Tooltip>Help Desk</Tooltip>}>
                                <span className='leftNavIcon'><MdOutlineHelp /></span>
                            </OverlayTrigger>
                            <span className='leftNavIconLabel'>Help Desk</span>
                        </Accordion.Header>
                    </Accordion.Item>
                </Accordion>


                <Accordion activeKey={activeKey}>
                    <Accordion.Item eventKey="6">
                        <Accordion.Header onClick={() => handleAccordionToggle("6")}>
                            <OverlayTrigger placement="right" overlay={<Tooltip>Reports</Tooltip>}>
                                <span className='leftNavIcon'><HiDocumentReport /></span>
                            </OverlayTrigger>
                            <span className='leftNavIconLabel'>Reports</span>
                        </Accordion.Header>
                        <Accordion.Collapse eventKey="6">
                            <Nav className="flex-column">
                                <NavLink to="/historyreports" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/historyreports') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Students 360</Tooltip>}>
                                        <span className="leftNavIcon"><RiUserStarFill /></span>
                                    </OverlayTrigger>
                                    <span className="leftNavIconLabel">Students 360</span>
                                </NavLink>

                                <NavLink to="/admissionreport" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/admissionreport') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Admission Report</Tooltip>}>
                                        <span className="leftNavIcon"><RiUserStarFill /></span>
                                    </OverlayTrigger>
                                    <span className="leftNavIconLabel">Admission Report</span>
                                </NavLink>

                                <NavLink to="/typereport" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/typereport') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Student Attendance Type Report</Tooltip>}>
                                        <span className="leftNavIcon"><RiUserStarFill /></span>
                                    </OverlayTrigger>
                                    <span className="leftNavIconLabel">Student Attendance Type Report</span>
                                </NavLink>

                                <NavLink to="/dailyattendancereport" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/dailyattendancereport') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Daily Attendance Report</Tooltip>}>
                                        <span className="leftNavIcon"><RiUserStarFill /></span>
                                    </OverlayTrigger>
                                    <span className="leftNavIconLabel">Daily Attendance Report</span>
                                </NavLink>

                                <NavLink to="/wiseattendancereport" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/wiseattendancereport') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>Student Day Wise Attendance Report</Tooltip>}>
                                        <span className="leftNavIcon"><RiUserStarFill /></span>
                                    </OverlayTrigger>
                                    <span className="leftNavIconLabel">Student Day Wise Attendance Report</span>
                                </NavLink>

                                <NavLink to="/schoolstrength" className={({ isActive }) =>
                                    isActive || location.pathname.startsWith('/schoolstrength') ? 'nav-link active' : 'nav-link'
                                }>
                                    <OverlayTrigger placement="right" overlay={<Tooltip>School Strength</Tooltip>}>
                                        <span className='leftNavIcon'><BsPersonCheck /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>School Strength</span>
                                </NavLink>
                            </Nav>
                        </Accordion.Collapse>
                    </Accordion.Item>
                </Accordion>

                {/* <Accordion activeKey={activeKey}>
                    <Accordion.Item eventKey="6">
                        <Accordion.Header onClick={() => handleAccordionToggle("7")}>
                            <OverlayTrigger placement="right" overlay={<Tooltip>Reports</Tooltip>}>
                                <span className='leftNavIcon'><MdOutlineEmojiTransportation /></span>
                            </OverlayTrigger>
                            <span className='leftNavIconLabel'>Reports</span>
                        </Accordion.Header>
                        <Accordion.Collapse eventKey="1">
                            <Nav className="flex-column">
                               

                               
                                <NavLink
                                    to="/schoolmaster"
                                    className={({ isActive }) =>
                                        isActive || location.pathname.startsWith('/addNewSchool') ? 'nav-link active' : 'nav-link'
                                    }
                                >
                                    <OverlayTrigger placement="right" overlay={<Tooltip>School Master</Tooltip>}>
                                        <span className='leftNavIcon'><BsPeople /></span>
                                    </OverlayTrigger>
                                    <span className='leftNavIconLabel'>School Master</span>
                                </NavLink>

                            
                               


                             


                            </Nav>
                        </Accordion.Collapse>
                    </Accordion.Item>
                </Accordion> */}
                <Accordion activeKey={activeKey}>
                    <Accordion.Item eventKey="7">
                        <Accordion.Header onClick={() => handleAccordionToggle("7")}>
                            <OverlayTrigger placement="right" overlay={<Tooltip>Transport</Tooltip>}>
                                <span className='leftNavIcon'><MdOutlineEmojiTransportation /></span>
                            </OverlayTrigger>
                            <span className='leftNavIconLabel'>Transport</span>
                        </Accordion.Header>
                    </Accordion.Item>
                </Accordion>
                <Accordion activeKey={activeKey}>
                    <Accordion.Item eventKey="8">
                        <Accordion.Header onClick={() => handleAccordionToggle("8")}>
                            <OverlayTrigger placement="right" overlay={<Tooltip>Transport</Tooltip>}>
                                <span className='leftNavIcon'><RiMoneyRupeeCircleFill /></span>
                            </OverlayTrigger>
                            <span className='leftNavIconLabel'>Finance</span>
                        </Accordion.Header>
                    </Accordion.Item>
                </Accordion>
                <Accordion activeKey={activeKey}>
                    <Accordion.Item eventKey="9">
                        <Accordion.Header onClick={() => handleAccordionToggle("9")}>
                            <OverlayTrigger placement="right" overlay={<Tooltip>Asset Management</Tooltip>}>
                                <span className='leftNavIcon'><MdOutlineWebAsset /></span>
                            </OverlayTrigger>
                            <span className='leftNavIconLabel'>Asset Management</span>
                        </Accordion.Header>
                    </Accordion.Item>
                </Accordion>
                <Accordion activeKey={activeKey}>
                    <Accordion.Item eventKey="10">
                        <Accordion.Header onClick={() => handleAccordionToggle("10")}>
                            <OverlayTrigger placement="right" overlay={<Tooltip>Payroll</Tooltip>}>
                                <span className='leftNavIcon'><MdCalculate /></span>
                            </OverlayTrigger>
                            <span className='leftNavIconLabel'>Payroll</span>
                        </Accordion.Header>
                    </Accordion.Item>
                </Accordion>
                <Accordion activeKey={activeKey}>
                    <Accordion.Item eventKey="11">
                        <Accordion.Header onClick={() => handleAccordionToggle("11")}>
                            <OverlayTrigger placement="right" overlay={<Tooltip>Library System</Tooltip>}>
                                <span className='leftNavIcon'><IoLibrary /></span>
                            </OverlayTrigger>
                            <span className='leftNavIconLabel'>Library System</span>
                        </Accordion.Header>
                    </Accordion.Item>
                </Accordion>
                <Accordion activeKey={activeKey}>
                    <Accordion.Item eventKey="12">
                        <Accordion.Header onClick={() => handleAccordionToggle("12")}>
                            <OverlayTrigger placement="right" overlay={<Tooltip>LMS</Tooltip>}>
                                <span className='leftNavIcon'><MdLocalLibrary /></span>
                            </OverlayTrigger>
                            <span className='leftNavIconLabel'>LMS</span>
                        </Accordion.Header>
                    </Accordion.Item>
                </Accordion>

            </Nav>
        </div>
    );
};

export default LeftNav;
