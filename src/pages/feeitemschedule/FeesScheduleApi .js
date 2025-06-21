import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './FeesScheduleApi.css';

const FeesScheduleApi = forwardRef(({ p_academic_year_id, p_class_id, p_school_id }, ref) => {
    const [data, setData] = useState([]);
    const [apiData, setApiData] = useState([]);
    const [terms, setTerms] = useState([]);
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        if (p_academic_year_id && p_class_id && p_school_id) {
            fetchData();
        } else {
            setApiData([]);
            setData([]);
            setTerms([]);
        }
    }, [p_academic_year_id, p_class_id, p_school_id]);

    useImperativeHandle(ref, () => ({
        handleFetchData
    }));

    const fetchData = async () => {
        try {
            const response = await axios.post(baseUrl + "/getfeeschedule/", {
                p_academic_year_id,
                p_class_id,
                p_school_id
            });

            const apiResponseData = response.data;

            setApiData(apiResponseData);

            const processedData = apiResponseData.reduce((acc, row) => {
                const existingItem = acc.find((item) => item.fees_item === row.fees_item);
                if (existingItem) {
                    existingItem.result = { ...existingItem.result, ...row.result };
                } else {
                    acc.push({
                        fees_item: row.fees_item,
                        fees_item_id: row.fees_item_id,
                        fees_schedule_id: row.fees_schedule_id,
                        total_amount: row.total_amount,
                        due_dates: { ...row.result },
                        result: { ...row.result }
                    });
                }
                return acc;
            }, []);

            const extractedTerms = [
                ...new Set(apiResponseData.flatMap((item) => Object.keys(item.result)))
            ].sort();

            const termDueDates = {};
            apiResponseData.forEach((item) => {
                extractedTerms.forEach((term) => {
                    if (item.result[term]) {
                        termDueDates[term] = item.due_date || '';
                    }
                });
            });

            setData(processedData);
            setTerms(extractedTerms);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleAmountChange = (feesItem, term, value) => {
        const sanitizedValue = value.replace(/[^0-9]/g, '');

        const numericValue = sanitizedValue ? Number(sanitizedValue) : 0;

        if (numericValue < 0) {
            alert('Please enter a non-negative value');
            return;
        }

        const currentRow = data.find((item) => item.fees_item === feesItem);
        const rowTotal = terms.reduce((total, term) => total + (currentRow.result[term] || 0), 0);
        const newRowTotal = rowTotal - (currentRow.result[term] || 0) + numericValue;

        if (newRowTotal > currentRow.total_amount) {
            alert(`Total amount for "${feesItem}" cannot exceed ${currentRow.total_amount}`);
            return;
        }

        setData((prevData) =>
            prevData.map((item) =>
                item.fees_item === feesItem
                    ? {
                        ...item,
                        result: {
                            ...item.result,
                            [term]: sanitizedValue === '' ? '' : numericValue
                        }
                    }
                    : item
            )
        );
    };

    const calculateRowTotal = (row) => {
        return terms.reduce((total, term) => total + (row.result[term] || 0), 0);
    };

    const calculateColumnTotal = (term) => {
        return data.reduce((total, row) => total + (row.result[term] || 0), 0);
    };

    const calculateGrandTotal = () => {
        return data.reduce((grandTotal, row) => grandTotal + calculateRowTotal(row), 0);
    };

    const calculateTotalAmountSum = () => {
        return data.reduce((sum, row) => sum + row.total_amount, 0);
    };

    const handleFetchData = async () => {
        const saveObject = [];
        const underpaidRows = [];

        data.forEach((row) => {
            let isRowValid = true;
            let rowTotal = 0;

            if (row.total_amount === 0) {
                return;
            }

            Object.keys(row.result).forEach((term) => {
                const amount = row.result[term];

                rowTotal += Number(amount);

                const rawRow = apiData.find(
                    (item) =>
                        item.fees_item === row.fees_item &&
                        item.fees_item_id === row.fees_item_id &&
                        item.result[term] !== undefined
                );

                saveObject.push({
                    fee_items_schedule_id: 0,
                    fees_item_id: row.fees_item_id,
                    fee_schedule_id: rawRow ? rawRow.fees_schedule_id : null,
                    academic_year_id: p_academic_year_id,
                    class_id: p_class_id,
                    amount_to_pay: amount ? amount : 0,
                    school_id: p_school_id
                });
            });

            if (rowTotal < row.total_amount) {
                underpaidRows.push(row.fees_item);
            }
        });

        if (underpaidRows.length > 0) {
            alert(`Rows with total amount less than required: ${underpaidRows.join(', ')}`);
            return;
        }

        if (saveObject.length === 0) {
            alert("No valid rows to save.");
            return;
        }

        try {
            const response = await axios.post(baseUrl + "/feeitemsschedule/bulk-upload/", saveObject, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            toast.success("Records Added Successfully");
            return true;
        } catch (error) {
            console.error("There was an error submitting:", error);
            return false;
        }
    };

    return (
        <div>
            <table className="fees-table">
                <thead>
                    <tr>
                        <th>Fee Type</th>
                        {terms.map((term) => (
                            <th key={term}>{term}</th>
                        ))}
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.fees_item}>
                            <td className="fees-item">{`${row.fees_item} (${row.total_amount})`}</td>
                            {terms.map((term) => (
                                <td key={term}>
                                    <input
                                        type="text"
                                        value={row.result[term] || ''}
                                        onChange={(e) => handleAmountChange(row.fees_item, term, e.target.value)}
                                        style={{ width: '80px' }}
                                        disabled={row.total_amount === 0}
                                    />
                                </td>
                            ))}
                            <td className="total-cell">{calculateRowTotal(row)}</td>
                        </tr>
                    ))}
                    <tr className="grand-total-row">
                        <td>{`Grand Total (${calculateTotalAmountSum()})`}</td>
                        {terms.map((term) => (
                            <td key={term}>{calculateColumnTotal(term)}</td>
                        ))}
                        <td>{calculateGrandTotal()}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
});
export default FeesScheduleApi;
