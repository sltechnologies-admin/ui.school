import React, { useState } from 'react';
import { FaCalendarAlt, FaUsersCog, FaChalkboardTeacher } from 'react-icons/fa';
import Addacademicyear from '../../pages/studentacademicyear/AddStudentAcademic';
import Academic from '../../pages/studentacademicyear/studentacademicyear';
import Sections from '../../pages/sections/sections';
import Teachersubjectmap from '../../pages/teachersubjectmap/teachersubjectmap';
import AddTeachersubjectmap from '../../pages/teachersubjectmap/addteachersubjectmap';
import AddNewSections from '../../pages/sections/AddNewSections';
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import { ToastContainer } from 'react-toastify';

const Academicyear = () => {
    const [activeTab, setActiveTab] = useState('year');

    const tabStyle = {
        background: 'none',
        border: 'none',
        fontSize: '15px',
        fontWeight: 500,
        color: '#6c757d',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        borderBottom:'none',
        padding: '8px 12px',
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
    };

    const activeTabStyle = {
        ...tabStyle,
        color: '#0d6efd',
        fontWeight: 600,
        borderBottom: '2px solid #0d6efd',
    };

    return (
        <div className="pageMain">
            <ToastContainer />
            <LeftNav />
            <div className="pageRight">
                <div className="pageHead">
                    <Header />
                </div>

                <div className="pageBody" style={{ paddingTop: 0 }}>
                    {/* Header + Tabs in one container */}
                    <div
                        style={{
                            paddingLeft: '12px',
                            marginBottom: '5px',
                            marginTop: '5px',
                        }}
                    >
                        <h5 style={{ marginBottom: '5px' }}>Academic Year</h5>

                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button
                                style={activeTab === 'year' ? activeTabStyle : tabStyle}
                                onClick={() => setActiveTab('year')}
                            >
                                <FaCalendarAlt /> Year Setup
                            </button>

                            <button
                                style={activeTab === 'section' ? activeTabStyle : tabStyle}
                                onClick={() => setActiveTab('section')}
                            >
                                <FaUsersCog /> Section Setup
                            </button>

                            <button
                                style={activeTab === 'teacher' ? activeTabStyle : tabStyle}
                                onClick={() => setActiveTab('teacher')}
                            >
                                <FaChalkboardTeacher /> Teacher Setup
                            </button>
                        </div>
                    </div>

                    <div className="tab-content mt-3">
                        {activeTab === 'year' && <Addacademicyear />}
                        {activeTab === 'section' && <AddNewSections />}
                        {activeTab === 'teacher' && <AddTeachersubjectmap />}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Academicyear;
