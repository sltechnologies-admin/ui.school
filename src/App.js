import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/variables.css';
import Login from './pages/account/login/login';
import Schools from './pages/schools/schools';
import Dashboard from './pages/dashboard/dashboard';
import Users from './pages/users/users';
import StudentAttendance from './pages/studentattendance/studentattendance';
import UsersAdd from './pages/users/usersadd';
import AddStudentAttendance from './pages/studentattendance/addstudentattendance';
import Subjects from './pages/subjects/subjects';
import AddSubject from './pages/subjects/addsubject';
import SchoolMaster from './pages/SchoolMaster/SchoolMaster';
import AddNewSchool from './pages/SchoolMaster/addNewSchool';
import AddStudent from './pages/students/addstudent';
import Students from './pages/students/students';
import Classes from './pages/classes/classes';
import Homeworklist from './pages/homeworklist/homeworklist';
import AddHomework from './pages/homeworklist/addhomework';
import Studentacademicyear from './pages/studentacademicyear/studentacademicyear';
import Addstudentacademicyear from './pages/studentacademicyear/AddStudentAcademic';
import AddNewClass from './pages/classes/addnewclass';
import Roles from './pages/roles/roles';
import AddRoles from './pages/roles/AddRoles';
import Departments from './pages/departments/departments';
import AddDepartments from './pages/departments/AddDepartments';
import Teachersubjectmap from './pages/teachersubjectmap/teachersubjectmap';
import AddTeachersubjectmap from './pages/teachersubjectmap/addteachersubjectmap';
import Sections from './pages/sections/sections';
import AddNewSections from './pages/sections/AddNewSections';
import Feeitems from './pages/feeitems/feeitems';
import AddFeeitems from './pages/feeitems/addfeeitems';
import Feeitemslist from './pages/feeitemslist/feeitemslist';
import AddFeeitemslist from './pages/feeitemslist/addfeeitemslist';
import Timetable from './pages/timetable/timetable';
// import Addtimetable from './pages/timetable/addtimetable';
import Feediscount from './pages/feediscount/feediscount';
import Addfeediscount from './pages/feediscount/addfeediscount';
import Feeitemschedule from './pages/feeitemschedule/feeitemschedule';
import Addfeeitemschedule from './pages/feeitemschedule/addfeeitemschedule';
import SchoolCalendar from './pages/schoolcalendar/schoolcalendar';
import CreateGroups from './pages/creategroup/creategroups';
import AddCreateGroups from './pages/creategroup/addcreategroups'
import GroupMembers from './pages/groupmembers/groupmembers'
import AddGroupMembers from './pages/groupmembers/addgroupmembers'
import Periods from './pages/periods/periods';
import AddPeriods from './pages/periods/addperiods';
import Exam from './pages/exam/exam';
import AddExam from './pages/exam/addexam';
import ExamResult from './pages/Examresults/result';
import AddExamResult from './pages/Examresults/addresult';
import ViewStudent from './pages/students/viewstudent';
import Syllabus from './pages/syllabus/syllabus';
import AddSyllabus from './pages/syllabus/addsyllabus';
// import Notifications from './pages/createnotifications/createnotifications';
// import AddNotification from './pages/createnotifications/addnotification';
import Notification from './pages/createnotifications/notifications';
import AddNewNotification from './pages/createnotifications/addnewnotification'
import Grades from './pages/grades/grades';
import AddGrades from './pages/grades/addgrades';
import ExamsSchedule from './pages/examschedule/examschedule';
import AddexamSchedule from './pages/examschedule/addexamschedule';
import SendNotification from './pages/sendnotifications/sendnotifications';
import AddNotification from './pages/sendnotifications/addnotifications';
import Feeschedule from './pages/feeschedule/feeschedule';
import AddFeeschedule from './pages/feeschedule/addfeeschedule';
import ResultDashboard from './pages/Examresults/studentresultdashboard'
import Feesstudentsschedule from './pages/feesstudentsschedule/feesstudentsschedule';
import Addfeesstudentsschedule from './pages/feesstudentsschedule/addfeesstudentsschedule';
import BulkAddResult from './pages/Examresults/bulkresultadd';
import StudentDetails from './pages/studentshistoryreports/StudentDetails';
import StudenthistoryReports from './pages/studentshistoryreports/historyreports';
import Admissionreport from './pages/admissionreport/admissionreport';
import Studentattendancereport from './pages/studentattendancetypereport/typereport';
import Dailyattendancereport from './pages/dailyattendancereport/dailyattendancereport';
// import AddEvent from './pages/schoolcalendar/addevent';
import Studentdaywiseattendancereport from './pages/studentdaywiseattendancereport/wiseattendancereport';
import SchoolStrength from './pages/schoolstrength/schoolstrength';
import FeeReceipts from './pages/feereceipts/feereceipts';
import AddFeeReceipts from './pages/feereceipts/addfeereceipts';
import Category from './pages/category/category';
import AddCategory from './pages/category/addcategory';
import Promotestudents from './pages/promotestudents/promotestudents';
import Assignlanguages from './pages/assignlaunguages/assignlanguages';
import Teachertimetable from './pages/teachertimetable/teachertimetable';

import Academicyear from './pages/academicyearfullsetup/academicyear';
import FeeCategory from './pages/feecategory/feecategory';
import AddFeeCategory from './pages/feecategory/addfeecategory';
import PrincipalDashboard from './pages/principaldashboard/principaldashboard';

import Approvals from './pages/approval/approval';
import ClasswiseStudentsReport from './pages/classwisereports/classwisestudentsreport';
import ClasswiseTeachersReport from './pages/classwisereports/classwiseteachersreport';
import ClasswiseTeacherSubject from './pages/classwisereports/classwiseteachersubject';
import SiblingsReport  from './pages/siblings/siblings'
import FeeScheduleType from './pages/feescheduletype/feescheduletype';
import AddFeeScheduleType from './pages/feescheduletype/addfeesheduletype'; 

function App() {
  return (
    <div className="App height100">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="account/login" element={<Login />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schools" element={<Schools />} />
          <Route path="Users" element={<Users />} />
          <Route path="StudentAttendance" element={<StudentAttendance />} />
          <Route path="UsersAdd" element={<UsersAdd />} />
          <Route path='AddStudentAttendance' element={<AddStudentAttendance />} />
          <Route path="Subjects" element={<Subjects />} />
          <Route path="addsubject" element={< AddSubject />} />
          <Route path="schoolmaster" element={<SchoolMaster />} />
          <Route path="addnewschool" element={<AddNewSchool />} />
          <Route path="addstudent" element={<AddStudent />} />
          <Route path="students" element={<Students />} />
          <Route path="classes" element={<Classes />} />
          <Route path="homework/homeworklist" element={<Homeworklist />} />
          <Route path="addhomework" element={<AddHomework />} />
          <Route path="studentacademicyear" element={<Studentacademicyear />} />
          <Route path="addstudentacademic" element={< Addstudentacademicyear />} />
          <Route path="addnewclass" element={<AddNewClass />} />
          <Route path="roles" element={<Roles />} />
          <Route path="AddRoles" element={<AddRoles />} />
          <Route path="departments" element={<Departments />} />
          <Route path="AddDepartments" element={<AddDepartments />} />
          <Route path="Teachersubjectmap" element={<Teachersubjectmap />} />
          <Route path="addteachersubjectmap" element={< AddTeachersubjectmap />} />
          <Route path="sections" element={<Sections />} />
          <Route path="addnewsections" element={<AddNewSections />} />
          <Route path="/timetable" element={<Timetable />} />
          {/* <Route path="/addtimetable" element={<Addtimetable />} /> */}
          <Route path="feeitems" element={<Feeitems />} />
          <Route path="addfeeitems" element={<AddFeeitems />} />
          <Route path="feeitemslist" element={<Feeitemslist />} />
          <Route path="addfeeitemslist" element={<AddFeeitemslist />} />
          <Route path="feediscount" element={<Feediscount />} />
          <Route path="addfeediscount" element={<Addfeediscount />} />
          <Route path="feeitemschedule" element={<Feeitemschedule />} />
          <Route path="addfeeitemschedule" element={<Addfeeitemschedule />} />
          <Route path="schoolcalendar" element={<SchoolCalendar />} />
          <Route path="creategroups" element={<CreateGroups />} />
          <Route path="addcreategroups" element={<AddCreateGroups />} />
          <Route path="groupmembers" element={<GroupMembers />} />
          <Route path="addgroupmembers" element={<AddGroupMembers />} />
          <Route path="addperiods" element={<AddPeriods />} />
          <Route path="periods" element={<Periods />} />
          <Route path="addexam" element={<AddExam />} />
          <Route path="exam" element={<Exam />} />
          <Route path="result" element={<ExamResult />} />
          <Route path="addresult" element={<AddExamResult />} />
          <Route path="viewstudents" element={<ViewStudent />} />
          <Route path="syllabus" element={<Syllabus />} />
          <Route path="addsyllabus" element={<AddSyllabus />} />
          {/* <Route path="createnotifications" element={<Notifications />} />
          <Route path="addnotification" element={<AddNotification />} /> */}
          <Route path="grades" element={<Grades />} />
          <Route path="addgrades" element={<AddGrades />} />
          <Route path="examschedule" element={<ExamsSchedule />} />
          <Route path="addexamschedule" element={<AddexamSchedule />} />
          <Route path="sendnotifications" element={<SendNotification />} />
          <Route path="addnotifications" element={<AddNotification />} />
          <Route path="feeschedule" element={<Feeschedule />} />
          <Route path="addfeeschedule" element={<AddFeeschedule />} />
          <Route path="studentresultdashboard" element={<ResultDashboard />} />
          <Route path="feesstudentsschedule" element={<Feesstudentsschedule />} />
          <Route path="addfeesstudentsschedule" element={<Addfeesstudentsschedule />} />
          <Route path="bulkaddresult" element={<BulkAddResult />} />
          <Route path="historyreports" element={<StudenthistoryReports />} />
          <Route path="StudentDetails/:student_id" element={<StudentDetails />} />
          <Route path="dailyattendancereport" element={<Dailyattendancereport />} />
          <Route path="admissionreport" element={<Admissionreport />} />
          <Route path="typereport" element={<Studentattendancereport />} />
          <Route path="wiseattendancereport" element={<Studentdaywiseattendancereport />} />
          <Route path="schoolstrength" element={<SchoolStrength />} />
          <Route path="feereceipts" element={<FeeReceipts />} />
          <Route path="addfeereceipts" element={<AddFeeReceipts />} />

          <Route path="promotestudents" element={<Promotestudents />} />

          <Route path="assignlanguages" element={<Assignlanguages />} />
          <Route path="teachertimetable" element={<Teachertimetable />} />


          <Route path="notifications" element={<Notification />} />
          <Route path="addnewnotification" element={<AddNewNotification />} />
          <Route path="academicyear" element={<Academicyear />} />

          <Route path="feecategory" element={<FeeCategory />} />
          <Route path="addfeecategory" element={<AddFeeCategory />} />

          <Route path="addcategory" element={<AddCategory />} />
          <Route path="category" element={<Category />} />

          <Route path="principaldashboard" element={<PrincipalDashboard />} />

          <Route path="approvals" element={<Approvals />} />
          <Route path="classwisestudentsreport" element={<ClasswiseStudentsReport />} />
          <Route path="classwiseteachersreport" element={<ClasswiseTeachersReport />} />
          <Route path="classwisetechersubject" element={<ClasswiseTeacherSubject />} />
          <Route path="siblings" element={<SiblingsReport />} />
          <Route path='feescheduletype' element={<FeeScheduleType/>}/>
          <Route path='addfeescheduletype' element={<AddFeeScheduleType/>}/>

        </Routes>
      </Router>
    </div>
  );
}

export default App;
