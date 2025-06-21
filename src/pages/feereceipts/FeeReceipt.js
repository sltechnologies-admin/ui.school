import React from 'react';
import FeeParticulars from './FeeParticulars';
import PaymentDetails from './PaymentDetails';
import './FeeReceipt.css';

const FeeReceipt = () => {
  const receiptData = {
    date: '31/03/2025',
    admission_no: 'A246789',
    receiptNo: '1122',
    studentName: 'abc',
    class: 'V',
    section: 'A1',
    fatherName: 'abc xyz',
    modeOfPayment: 'UPI',
    contactNo: '',
    transation_no: '',
    amountDetails: [
      { sno: 1, feeParticular: 'Admission Fee', amount: '' },
      { sno: 2, feeParticular: 'Annual Charges', amount: '' },
      { sno: 3, feeParticular: 'Tuition Fee', amount: '30000' },
      { sno: 4, feeParticular: 'Lab Charges', amount: '' },
    ],
    grandTotal: '30000',
  };

  return (
    <div className="receipt-container">
      <div className="receipt-box">

        {/* FEE RECEIPT Section */}
        <table className="receipt-table">
          <thead>
            <tr>
              <th colSpan="6" className="title">FEE RECEIPT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>DATE :</strong></td>
              <td>{receiptData.date}</td>
              <td><strong>ADMISSION NO :</strong></td>
              <td>{receiptData.admission_no}</td>
              <td><strong>RECEIPT NO :</strong></td>
              <td>{receiptData.receiptNo}</td>
            </tr>
            <tr>
              <td><strong>STUDENT NAME :</strong></td>
              <td colSpan="3">{receiptData.studentName}</td>
              <td><strong>Class & Sec :</strong></td>
              <td>{`${receiptData.class} & ${receiptData.section}`}</td>
            </tr>
            <tr>
              <td><strong>FATHER NAME :</strong></td>
              <td colSpan="3">{receiptData.fatherName}</td>
              <td><strong>CONTACT NO :</strong></td>
              <td>{receiptData.contactNo}</td>
            </tr>
            <tr>
              <td><strong>MODE OF PAYMENT :</strong></td>
              <td colSpan="2">{receiptData.modeOfPayment}</td>
              <td colSpan="1"><strong>TRANSACTION NO :</strong></td>
              <td colSpan="2">{receiptData.transation_no}</td>
            </tr>
          </tbody>
        </table>

        {/* FEE PARTICULARS Component */}
        <FeeParticulars
          amountDetails={receiptData.amountDetails}
          grandTotal={receiptData.grandTotal}
        />

        {/* PAYMENT DETAILS Component */}
        <PaymentDetails grandTotal={receiptData.grandTotal} />
      </div>
    </div>
  );
};

export default FeeReceipt;
