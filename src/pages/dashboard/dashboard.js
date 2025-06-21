import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Container } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import Calendar from 'react-calendar';
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import { ToastContainer } from 'react-toastify';
import './dashboard.css';
import 'react-calendar/dist/Calendar.css';

const Dashboard = () => {
  const COLORS = ['#0088FE', '#FF8042'];

  const genderData = [
    { name: 'Boys', value: 1500 },
    { name: 'Girls', value: 1000 },
  ];

  const attendanceData = [
    { day: 'Mon', Present: 400, Absent: 50 },
    { day: 'Tue', Present: 420, Absent: 40 },
    { day: 'Wed', Present: 410, Absent: 60 },
    { day: 'Thu', Present: 430, Absent: 30 },
    { day: 'Fri', Present: 440, Absent: 20 },
    { day: 'Sat', Present: 450, Absent: 10 },
  ];

  const notifications = [
    "School annual sports day celebration 2023",
    "Annual function celebration 2023-24",
    "Mid-term examination routine published",
    "Inter school annual painting competition",
    "School annual sports day celebration 2023",
    "Annual function celebration 2023-24",
    "Mid-term examination routine published",
    "Inter school annual painting competition", "School annual sports day celebration 2023",
    "Annual function celebration 2023-24",
    "Mid-term examination routine published",
    "Inter school annual painting competition"
  ];

  const [date, setDate] = useState(new Date());

  const events = [
    { date: '2025-03-20', title: 'Sports Day' },
    { date: '2025-03-25', title: 'Annual Day' },
    { date: '2025-03-01', title: 'Exam Results' },
    { date: '2025-03-05', title: 'Painting Competition' },
  ];

  return (
    <div className="pageMain">
      <ToastContainer />
      <LeftNav />
      <div className="pageRight">
        <div className="pageHead">
          <Header />
        </div>
        <Container fluid className="dashboard-container">
          {/* Top Stat Cards */}
          <Row >
            {['Total Students', 'Total Teachers', 'Total Employees'].map((label, i) => (
              <Col className="mb-4">
                <Card className="dashboard-card1 text-center">
                  <Card.Body>
                    <h5>{label}</h5>
                    <h1>{[2500, 150, 600][i]}</h1>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Charts Section */}
          <Row className="mb-3">
            <Col xs={12} md={6} className="mb-3">
              <Card className="dashboard-card">
                <Card.Body>
                  <h5>Total Students by Gender</h5>
                  <div className="pie-chart-wrapper">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={genderData} dataKey="value" outerRadius={80} label>
                          {genderData.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={6} className="mb-3">
              <Card className="dashboard-card">
                <Card.Body>
                  <h5>Attendance</h5>
                  <div className="bar-chart-wrapper">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={attendanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Present" fill="#82ca9d" />
                        <Bar dataKey="Absent" fill="#FF8042" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Notifications, Calendar, Events */}
          <Row>
            <Col xs={12} md={4} className="mb-3">
              <Card className="dashboard-card">
                <Card.Body>
                  <h5>Recent Notifications</h5>
                  <div className="notifications-container">
                    <ul className="notification-list">
                      {notifications.map((note, i) => <li key={i}>{note}</li>)}
                    </ul>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={4} className="mb-3">
              <Card className="dashboard-card">
                <Card.Body>
                  <h5>Event Calendar</h5>
                  <Calendar value={date} onChange={setDate} />
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={4} className="mb-3">
              <Card className="dashboard-card">
                <Card.Body>
                  <h5>Upcoming Events</h5>
                  <ul className="event-list">
                    {events.map((event, i) => <li key={i}><strong>{event.date}:</strong> {event.title}</li>)}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Dashboard;

