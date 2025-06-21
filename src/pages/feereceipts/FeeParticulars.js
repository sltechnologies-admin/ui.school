import React from 'react';
import './FeeReceipt.css';

const FeeParticulars = ({ amountDetails, grandTotal, onAmountChange }) => {
    const handleInputChange = (e, index) => {
        const { value } = e.target;
        if (/^\d*$/.test(value) || value === '') {
            onAmountChange(index, value);
        }
    };

    return (
        <div>
            <table className="receipt-table">
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>FEE PARTICULARS</th>
                        <th style={{ textAlign: 'right' }}>AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    {amountDetails.map((item, index) => (
                        <tr key={item.s_no}>
                            <td>{item.s_no}</td>
                            <td>{item.fees_item}</td>
                            <td style={{ textAlign: 'right' }}>
                                <input
                                    type="text"
                                    value={item.amount}
                                    onChange={(e) => handleInputChange(e, index)}
                                    style={{ width: '100px', textAlign: 'right' }}
                                    required
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="2" className="text-right">GRAND TOTAL</td>
                        <td>{grandTotal}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default FeeParticulars;
