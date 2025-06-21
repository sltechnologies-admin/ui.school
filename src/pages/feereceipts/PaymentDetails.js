import React, { useState, useEffect } from 'react';
import './FeeReceipt.css';

const PaymentDetails = ({ grandTotal }) => {
    const [paymentData, setPaymentData] = useState({
        date: '',
        bankName: '',
        branch: '',
        chequeNo: '',
        amount: grandTotal
    });

    useEffect(() => {
        setPaymentData((prevData) => ({
            ...prevData,
            amount: grandTotal
        }));
    }, [grandTotal]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPaymentData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    return (
        <div>
            <table className="receipt-table">
                <thead>
                    <tr>
                        <th colSpan="5" className="title">PAYMENT DETAILS</th>
                    </tr>
                    <tr>
                        <th>Date</th>
                        <th>Name of the Bank</th>
                        <th>Issuing Branch</th>
                        <th>Cheque No</th>
                        <th>Amount (in Rs)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <input
                                type="date"
                                name="date"
                                value={paymentData.date}
                                onChange={handleChange}
                                placeholder="Enter date"
                            />
                        </td>
                        <td>
                            <input
                                type="text"
                                name="bankName"
                                value={paymentData.bankName}
                                onChange={handleChange}
                                placeholder="Enter bank name"
                            />
                        </td>
                        <td>
                            <input
                                type="text"
                                name="branch"
                                value={paymentData.branch}
                                onChange={handleChange}
                                placeholder="Enter branch"
                            />
                        </td>
                        <td>
                            <input
                                type="text"
                                name="chequeNo"
                                value={paymentData.chequeNo}
                                onChange={handleChange}
                                placeholder="Enter cheque no"
                            />
                        </td>
                        <td>
                            <input
                                type="text"
                                name="amount"
                                value={paymentData.amount}
                                onChange={handleChange}
                                placeholder="Enter amount"
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default PaymentDetails;
