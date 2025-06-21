import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const students = [
  {
    id: 1,
    name: "John Doe",
    fee: 52000,
    activityFee: 10000,
    academicFee: 32000,
    transportFee: 10000,
    activityTerm1: 3334,
    activityTerm2: 3333,
    activityTerm3: 3333,
    academicTerm1: 10667,
    academicTerm2: 10667,
    academicTerm3: 10666,
    transportTerm1: 3334,
    transportTerm2: 3333,
    transportTerm3: 3333,
    activityPaidTerm1: 1000,
    activityPaidTerm2: 0,
    activityPaidTerm3: 1000,
    academicPaidTerm1: 5000,
    academicPaidTerm2: 4000,
    academicPaidTerm3: 0,
    transportPaidTerm1: 0,
    transportPaidTerm2: 1000,
    transportPaidTerm3: 2000,
  },
];

const StudentTable = () => {
  const [expandedStudent, setExpandedStudent] = useState(null);

  const toggleStudent = (student) => {
    setExpandedStudent(expandedStudent === student.id ? null : student.id);
  };

  return (
    <div className="p-4 flex justify-center items-center min-h-screen">
      <div className="w-full max-w-4xl">
        <h2 className="text-xl font-bold mb-4 text-center">Student List</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Total Fee</th>
              <th className="px-4 py-2">Activity Fee</th>
              <th className="px-4 py-2">Academic Fee</th>
              <th className="px-4 py-2">Transport Fee</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <React.Fragment key={student.id}>
                <tr className="border-t cursor-pointer" onClick={() => toggleStudent(student)}>
                  <td className="px-4 py-2 flex items-center justify-between">
                    {student.name}
                    {expandedStudent === student.id ? <FaChevronUp /> : <FaChevronDown />}
                  </td>
                  <td className="px-4 py-2">{student.fee}</td>
                  <td className="px-4 py-2">{student.activityFee}</td>
                  <td className="px-4 py-2">{student.academicFee}</td>
                  <td className="px-4 py-2">{student.transportFee}</td>
                </tr>
                {expandedStudent === student.id && (
                  <tr>
                    <td colSpan="5" className="p-4 border border-gray-300 bg-gray-100">
                      <h3 className="text-lg font-bold">Term-wise Fee Breakdown</h3>
                      <table className="w-full border-collapse border border-gray-300 mt-2">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="px-4 py-2">Type</th>
                            <th className="px-4 py-2">Term 1</th>
                            <th className="px-4 py-2">Term 2</th>
                            <th className="px-4 py-2">Term 3</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { type: "Activity Fee", term1: "activityTerm1", term2: "activityTerm2", term3: "activityTerm3" },
                            { type: "Academic Fee", term1: "academicTerm1", term2: "academicTerm2", term3: "academicTerm3" },
                            { type: "Transport Fee", term1: "transportTerm1", term2: "transportTerm2", term3: "transportTerm3" },
                          ].map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-2">{item.type}</td>
                              <td className="px-4 py-2">{student[item.term1]}</td>
                              <td className="px-4 py-2">{student[item.term2]}</td>
                              <td className="px-4 py-2">{student[item.term3]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Paid Details Section */}
                      <h3 className="text-lg font-bold mt-4">Paid Amount Breakdown</h3>
                      <table className="w-full border-collapse border border-gray-300 mt-2">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="px-4 py-2">Type</th>
                            <th className="px-4 py-2">Term 1</th>
                            <th className="px-4 py-2">Term 2</th>
                            <th className="px-4 py-2">Term 3</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { type: "Activity Fee", paid1: "activityPaidTerm1", paid2: "activityPaidTerm2", paid3: "activityPaidTerm3" },
                            { type: "Academic Fee", paid1: "academicPaidTerm1", paid2: "academicPaidTerm2", paid3: "academicPaidTerm3" },
                            { type: "Transport Fee", paid1: "transportPaidTerm1", paid2: "transportPaidTerm2", paid3: "transportPaidTerm3" },
                          ].map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-2">{item.type}</td>
                              <td className="px-4 py-2">{student[item.paid1]}</td>
                              <td className="px-4 py-2">{student[item.paid2]}</td>
                              <td className="px-4 py-2">{student[item.paid3]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
