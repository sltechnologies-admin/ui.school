import React, { useState, useEffect, useCallback } from 'react';
import { MdAddCircle, MdFilterList } from "react-icons/md";
import { ToastContainer, toast } from 'react-toastify';
import { Button, Modal, Row, Col, Form, OverlayTrigger } from "react-bootstrap";
//Icons 
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
//Components
import Header from '../../components/layout/header/header';
import LeftNav from '../../components/layout/leftNav/leftNav';
import axios from "axios";
import DataTable from "react-data-table-component";
import { Tooltip } from '@mui/material';
import loading from "../../assets/images/common/loading.gif";

const FeesItemsAmount = ({ class_id }) => {
    const [feesItemsChild, setFeesItemsChild] = useState([]);
    const [isLoadingChild, setIsLoadingChild] = useState(false);

    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : {};
    const [feesItemsAmount, setFeesItemsAmount] = useState([]);

    const expandableColumns = [
        {
            name: "Fees Item",
            selector: (row) => row.fees_item,
            sortable: true,
            cell: (row) => <Tooltip title={row.fees_item}>{row.fees_item}</Tooltip>,
        },
        {
            name: "Fees Item Amount",
            selector: (row) => {
                const amount = Number(row.fees_item_amount);
                return isNaN(amount) ? 0 : amount;
            },
            sortable: true,
            cell: (row) => {
                if (feesItemsChild.length > 0) {
                    const formattedAmount = new Intl.NumberFormat('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).format(Number(row.fees_item_amount));

                    return <Tooltip title={formattedAmount}>{formattedAmount}</Tooltip>;
                } else {
                    return <div className="noDataMessage">No Records Found</div>;
                }
            },
        }
    ];


    const getFeesItems = (academic_year_id, class_id) => {
        return {
            academic_year_id: academic_year_id || null,
            class_id: class_id || null,
            school_id: userObj.school_id || null,
            action: 'FILTER',
        };
    };

    const fetchFeeItemsDetails = async (formData) => {
        try {
            const response = await axios.post(baseUrl + "/feeitemsamount/", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response.data || [];
        } catch (error) {
            console.log("Full error object:", error);
            return [];
        }
    };

    const fetchFeesItemsAmount = async () => {
        try {
            const response = await axios.post(baseUrl + "/feeitemsamount/", { action: "TOTALREAD", school_id: userObj.school_id, academic_year_id: userObj.academic_year_id });
            setFeesItemsAmount(response.data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

    const fetchData = useCallback(async () => {
        setIsLoadingChild(true);
        try {
            const formData = getFeesItems(userObj.academic_year_id, class_id);

            const fetchedData = await fetchFeeItemsDetails(formData);

            setFeesItemsChild(fetchedData);

            if (Array.isArray(fetchedData) && fetchedData.length === 0) {
                fetchFeesItemsAmount();
            }
        } finally {
            setIsLoadingChild(false);
        }
    }, [class_id]);

    useEffect(() => {
        if (class_id) {
            fetchData();
        }
    }, [fetchData]);

    useEffect(() => {
        if (class_id) {
            fetchData();
        }
    }, [class_id]);

    return (
        <div>
            {isLoadingChild ? (
                <div className="loadingContainer">
                    <img src={loading} alt="Loading..." className="loadingGif" />
                </div>
            ) : (
                <DataTable
                    className="custom-table"
                    columns={[
                        ...expandableColumns,
                    ]}
                    data={
                        feesItemsChild.length > 0
                            ? feesItemsChild
                            : [{ fees_item: "" }]
                    }
                    pagination={feesItemsChild.length > 0}
                    highlightOnHover
                    responsive
                    fixedHeader
                    fixedHeaderScrollHeight="calc(100vh - 170px)"
                />
            )}
        </div>
    );
}

export default FeesItemsAmount