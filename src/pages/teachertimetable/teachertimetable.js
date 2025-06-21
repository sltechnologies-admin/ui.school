import React, { useState, useEffect } from "react";
import { Container, Button, Form, Col, Modal } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Header from "../../components/layout/header/header";
import LeftNav from "../../components/layout/leftNav/leftNav";
import axios from "axios";

const TeachertimetableForm = () => {
  const userData = sessionStorage.getItem("user");
  const userObj = userData ? JSON.parse(userData) : {};
  const [timetable, setTimetable] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [weekday, setWeekday] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [isGridVisible, setIsGridVisible] = useState(false);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        
        const weekdayResponse = await axios.post(baseUrl + "/weekday/", {
          action: "READ",
        });
        setWeekday(weekdayResponse?.data?.filter(day => day?.week_day_name !== "Sunday") || []);

        
        await fetchTeacherTimetable();
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  const fetchTeacherTimetable = async () => {
    if (!userObj.user_id) return;

    setIsLoading(true);
    try {
    
      const timetableResponse = await axios.post(`${baseUrl}/teachertimetable/`, {
        action: "READ",
        teacher_id: userObj.user_id,
        school_id: userObj.school_id,
        academic_year_id: userObj.academic_year_id
      });

    
      const processedTimetable = timetableResponse.data.map(item => {
        return {
          ...item,
          class_name: item.class_name || "",
          section_name: item.section_name || ""
        };
      });

      setTimetable(processedTimetable);


      

      
      const uniquePeriods = [...new Set(processedTimetable.map(item => ({
        period_id: item.period_id,
        period_name: item.period_name,
        period_order: item.period_order,
        start_time: item.start_time,
        end_time: item.end_time
      })))].sort((a, b) => a.period_order - b.period_order);

      setPeriods(uniquePeriods);
      setIsGridVisible(true);
    } catch (error) {
      console.error("Error fetching teacher timetable:", error);
    } finally {
      setIsLoading(false);
    }
  };

  
  const processTimetableData = () => {
    const grid = Array(periods?.length || 0)
      .fill()
      .map(() => Array(6).fill(null));

    timetable?.forEach((entry) => {
      const { period_order, week_day_id, class_name, section_name } = entry;
      if (period_order >= 1 && period_order <= periods?.length && week_day_id >= 1 && week_day_id <= 6) {
        grid[period_order - 1][week_day_id - 1] = {
          class_name: class_name || "",
          section_name: section_name || ""
        };
      }
    });

    return grid;
  };

  const timetableGrid = processTimetableData();

  
  const formatTime12Hour = (time) => {
    if (!time) return 'Invalid Time';
    if (/^\d{1,2}:\d{2} (AM|PM)$/.test(time)) return time;
   
    const [hoursStr, minutesStr] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr.padStart(2, '0');

    if (isNaN(hours) || isNaN(minutes)) return 'Invalid Time';

    const amPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${amPm}`;
  };

  return (
    <Container fluid>
      <div className="pageMain" style={{ display: "flex", height: "100vh" }}>
        <LeftNav />
        <div className="pageRight">
          <div className="pageHead">
            <Header />
          </div>
          <div className="pageBody">
            <div className="commonDataTableHead m-0">
              <div className="float-start d-flex align-items-center">
                <h6 className="commonTableTitle">Teacher Timetable</h6>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center my-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : !isGridVisible ? (
              <p className="text-center">No timetable data available</p>
            ) : (
              <div className="commonTable height100">
                <div className="tableBody height100">
                  <div className="timetableGrid height100">
                    <div className="tableWrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Day/Period</th>
                            {periods?.map((period, index) => (
                              <th key={index} style={{ fontSize: '12px' }}>
                                {period?.period_name || `Period ${index + 1}`}
                                <br />
                                {period?.start_time && period?.end_time && (
                                  <span>
                                    {formatTime12Hour(period?.start_time)} - 
                                    {formatTime12Hour(period?.end_time)}
                                  </span>
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {weekday?.map((day) => (
                            <tr key={day?.week_day_id}>
                              <td style={{ fontWeight: "bold" }}>{day?.week_day_name}</td>
                              {periods?.map((_, periodOrder) => {
                                const entry = timetableGrid[periodOrder]?.[day?.week_day_id - 1];
                               
                                return (
                                  <td
                                    key={periodOrder}
                                    style={{
                                      position: "relative",
                                      minHeight: "50px",
                                      ...(!entry?.class_name && {
                                        backgroundColor: "#f9f9f9",
                                      }),
                                    }}
                                  >
                                    {entry?.class_name ? (
                                      <div style={{ textAlign: "center" }}>
                                        <div>{entry.class_name}</div>
                                        {entry.section_name && (
                                          <div style={{ fontSize: "0.8em", color: "#666" }}>
                                            ({entry.section_name})
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span
                                        style={{
                                          position: "absolute",
                                          top: "50%",
                                          left: "50%",
                                          transform: "translate(-50%, -50%)",
                                          fontSize: "24px",
                                          color: "#ddd",
                                          fontWeight: "bold"
                                        }}
                                      >
                                        -
                                      </span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </Container>
  );
};

export default TeachertimetableForm;