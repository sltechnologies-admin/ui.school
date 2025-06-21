import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Tooltip } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { MdEdit, MdDelete, MdAddCircle, MdFilterList } from 'react-icons/md';
import loading from '../../assets/images/common/loading.gif';
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import { Button, Form, Modal, OverlayTrigger } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
 
const Academic = () => {
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const [academicYears, setAcademicYears] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [months, setMonths] = useState([]);
    const [years, setYears] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const toastMessage = location.state?.toastMessage;
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
   // const toastMessage = location.state?.toastMessage;
 
    const [filter, setFilter] = useState({
        academic_year_name: '',
        start_month: 0,
        start_year: 0,
        end_month: 0,
        end_year: 0,
        school_id:parseInt(userObj.school_id),
        is_current_year: '',
        action: 'FILTER',
    });
 
    const fetchDropdownData = async (endpoint, setter) => {
        try {
            const response = await axios.post(baseUrl + endpoint, { action: 'READ' });
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
        }
    };

    const fetchYears = async (endpoint) => {
        try {
            const response = await axios.post(baseUrl + endpoint, { action: 'READ' });
            return response.data;
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
        }
    };
 
    const fetchAcademicYears = async () => {
        try {
            const response = await axios.post(baseUrl + '/AcademicYear/', { action: 'READ' });
            setAcademicYears(response.data);
            // console.log(response.data)
        } catch (error) {
            console.error('Error fetching academic data:', error);
        } finally {
            setIsLoading(false);
        }
    };
 
    useEffect(() => {
        fetchAcademicYears();
        
    }, []);
    useEffect(() => {
        if (toastMessage) {
            toast.success(toastMessage);
            // Optional: Clean the state to prevent duplicate toasts on refresh
            window.history.replaceState({}, document.title);
        }
    }, [toastMessage]);
 
    const searchableColumns = [
        (row) => row.academic_year_name,
        (row) => row.start_month_name,
        (row) => row.start_year_name,
        (row) => row.end_month_name,
        (row) => row.end_year_name,
        (row) => row.is_current_year,
        (row) => row.is_active,
    ];
 
    const filteredRecords = (academicYears || []).filter((item) =>
        searchableColumns.some((selector) => {
            const value = selector(item);
            const stringValue = String(value || '').toLowerCase().replace(/[-\s]+/g, '');
            const normalizedQuery = searchQuery.toLowerCase().replace(/[-\s]+/g, '');
            return stringValue.includes(normalizedQuery);
        })
    );
 
    const handleEditClick = (id) => {
        const itemToEdit = academicYears.find((item) => item.academic_year_id === id);
        if (itemToEdit) {
            navigate('/AddStudentAcademic', { state: { userData: itemToEdit } });
        } else {
            console.error(`Academic Year with ID ${id} not found.`);
        }
    };
 
    const handleDeleteClick = async (id) => {
        if (!window.confirm('Are you sure you want to change the status?')) return;
        try {
            const response = await axios.post(baseUrl + '/AcademicYear', { academic_year_id: id, action: 'DELETE' }, {
                headers: { 'Content-Type': 'application/json' },
            });
            console.log(response)
            if (response.status >= 200 && response.status < 300) {
                toast.success('Record Status is Updated');
                fetchAcademicYears();
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
 
    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        try {
            
            const response = await axios.post(baseUrl + '/AcademicYear/', filter, {
                headers: { 'Content-Type': 'application/json' },
            });
            setAcademicYears(response.data || []);
            handleCloseFilterModal();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
 
    const handleFilterClear = async () => {
        setFilter({
            academic_year_name: '',
            action: 'FILTER',
            start_month: 0,
            start_year: 0,
            end_month: 0,
            end_year: 0,
            school_id: parseInt(userObj.school_id),
            is_current_year: '',
        });
        fetchAcademicYears();
    };
 
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };
 
    const handleCloseFilterModal = () => setShowFilterModal(false);
    const handleShowFilterModal = () => {
        if (months.length === 0) {
            fetchDropdownData('/months/', setMonths);
        }
        if (years.length === 0) {
            fetchYears('/years/')
                .then((data) => {
                    setYears(data);
                });
        }
        setShowFilterModal(true)
    };
 
    const columns = [
        {
            name: 'Academic Year',
            selector: (row) => row.academic_year_name,
            cell: (row) => <Tooltip title={row.academic_year_name}><span>{row.academic_year_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: 'Start Month',
            selector: (row) => row.start_month,
            cell: (row) => <Tooltip title={row.start_month_name}><span>{row.start_month_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: 'Start Year',
            selector: (row) => row.start_year,
            cell: (row) => <Tooltip title={row.start_year_name}><span>{row.start_year_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: 'End Month',
            selector: (row) => row.end_month,
            cell: (row) => <Tooltip title={row.end_month_name}><span>{row.end_month_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: 'End Year',
            selector: (row) => row.end_year,
            cell: (row) => <Tooltip title={row.end_year_name}><span>{row.end_year_name}</span></Tooltip>,
            sortable: true,
        },
        {
            name: 'Is Current Year',
            selector: (row) => row.is_current_year,
            cell: (row) => <Tooltip title={row.is_current_year}><span>{row.is_current_year}</span></Tooltip>,
            sortable: true,
        },
        {
            name: 'Is Active',
            selector: (row) => row.is_active,
            cell: (row) => <Tooltip title={row.is_active}><span>{row.is_active}</span></Tooltip>,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row) => filteredRecords.length > 0 && (
                <div className='tableActions'>
                    <Tooltip title="Edit" arrow>
                        <a className='commonActionIcons' onClick={() => handleEditClick(row.academic_year_id)}>
                            <span><MdEdit /></span>
                        </a>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                        <a className='commonActionIcons' onClick={() => handleDeleteClick(row.academic_year_id)}>
                            <span><MdDelete /></span>
                        </a>
                    </Tooltip>
                </div>
            ),
        },
    ];
 
    return (
        <>
            <ToastContainer />
            <div className='pageMain'>
                <LeftNav />
                <div className='pageRight'>
                    <div className='pageHead'>
                        <Header />
                    </div>
                    <div className='pageBody'>
                        <div className="commonDataTableHead">
                            <div className="d-flex justify-content-between align-items-center w-100">
                                <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                                    <h6 className="commonTableTitle">Academic Year Master</h6>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        className="searchInput"
                                        onChange={handleSearchChange}
                                    />
                                </div>
                                <div className="d-flex align-items-center" style={{ gap: 6 }}>
                                    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Filter</Tooltip>}>
                                        <Button className="secondaryBtn" variant="secondary" onClick={handleShowFilterModal}>
                                            <MdFilterList />
                                        </Button>
                                    </OverlayTrigger>
                                    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add</Tooltip>}>
                                        <Button className="primaryBtn" variant="primary" onClick={() => navigate("/AddStudentAcademic")}>
                                            <MdAddCircle />
                                        </Button>
                                    </OverlayTrigger>
                                </div>
                            </div>
                        </div>
                        <div className="commonTable height100">
                            <div className="tableBody">
                                {isLoading ? (
                                    <div className="loadingContainer">
                                        <img src={loading} alt="Loading..." className="loadingGif" />
                                    </div>
                                ) : (
                                    <DataTable
                                        className="custom-table"
                                        columns={columns}
                                        data={filteredRecords.length > 0 ? filteredRecords : [{ userid: 'No records found', role_name: 'No records found' }]}
                                        pagination={filteredRecords.length > 0}
                                        highlightOnHover
                                        responsive
                                        fixedHeader
                                        fixedHeaderScrollHeight="calc(100vh - 170px)"
                                        conditionalRowStyles={[
                                            {
                                                when: (row) => row.userid === 'No records found',
                                                style: { textAlign: 'center', fontSize: '16px', color: 'red', backgroundColor: '#f9f9f9' },
                                            },
                                        ]}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    <Modal show={showFilterModal} onHide={handleCloseFilterModal} className="commonFilterModal">
                        <Modal.Header closeButton className="modalHeaderFixed">
                            <Modal.Title>Filter</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="modalBodyScrollable">
                            <Form id="filterForm" onSubmit={handleFilterSubmit}>
                                <Form.Group controlId="academic_year_name" className='commonInput'>
                                    <Form.Label>Academic Year Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="academic_year_name"
                                        placeholder="Academic Year Name"
                                        value={filter.academic_year_name}
                                        onChange={(e) => setFilter({ ...filter, academic_year_name: e.target.value.replace(/[^0-9\s-]/g, '').replace(/\s{2,}/g, ' ').substring(0, 30).trim() })}
                                    />
                                </Form.Group>
                                <Form.Group controlId="start_month" className="commonInput">
                                    <Form.Label>Start Month<span className="requiredStar"></span></Form.Label>
                                    <Form.Select name="start_month" value={filter.start_month} onChange={(e) => setFilter((prev) => ({ ...prev, start_month: parseInt(e.target.value || '0', 10) }))}>
                                        <option value="">Select Start Month</option>
                                        {(months || []).map((month) => (
                                            <option key={month.month_id} value={month.month_id}>{month.month_name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group controlId="start_year" className='commonInput'>
                                    <Form.Label> Start Year </Form.Label>
                                    <Form.Select name="start_year" value={filter.start_year} onChange={(e) => setFilter({ ...filter, start_year: parseInt(e.target.value || '0', 10) })}>
                                        <option value="">Select Start Year</option>
                                        {(years || []).map((year) => (
                                            <option key={year.year_id} value={year.year_id}>{year.year_name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group controlId="end_month" className="commonInput">
                                    <Form.Label>End Month<span className="requiredStar"></span></Form.Label>
                                    <Form.Select name="end_month" value={filter.end_month} onChange={(e) => setFilter((prev) => ({ ...prev, end_month: parseInt(e.target.value || '0', 10) }))}>
                                        <option value="">Select End Month</option>
                                        {(months || []).map((month) => (
                                            <option key={month.month_id} value={month.month_id}>{month.month_name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group controlId="end_year" className='commonInput'>
                                    <Form.Label> End Year </Form.Label>
                                    <Form.Select name="end_year" value={filter.end_year} onChange={(e) => setFilter({ ...filter, end_year: parseInt(e.target.value || '0', 10) })}>
                                        <option value="">Select End Year</option>
                                        {(years || []).map((year) => (
                                            <option key={year.year_id} value={year.year_id}>{year.year_name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group controlId="is_current_year" className='commonInput'>
                                    <Form.Label>Is Current Year</Form.Label>
                                    <Form.Select name="is_current_year" value={filter.is_current_year} onChange={(e) => setFilter({ ...filter, is_current_year: e.target.value })}>
                                        <option value="">Select Year</option>
                                        <option value="Y">Yes</option>
                                        <option value="N">No</option>
                                    </Form.Select>
                                    <Form.Control.Feedback>Required</Form.Control.Feedback>
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer className="modalFooterFixed">
                            <Button variant="secondary" className="btn-info clearBtn me-2" onClick={handleFilterClear}>
                                Reset
                            </Button>
                            <div>
                                <Button variant="secondary" className="btn-danger secondaryBtn me-2" onClick={handleCloseFilterModal}>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit" className="btn-success primaryBtn" form="filterForm" onClick={handleCloseFilterModal}>
                                    Search
                                </Button>
                            </div>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </>
    );
};
 
export default Academic;