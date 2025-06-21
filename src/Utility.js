import axios from "axios";
import { toast } from "react-toastify";

const userData = sessionStorage.getItem('user');
const userObj = userData ? JSON.parse(userData) : {};
 
const fetchDataRead = async (endpoint, setRecords,school_id) => {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
   try {
       const url = `${baseUrl}${endpoint}`;
       const actionValue = endpoint === "/AcademicYear" ? "CURRENTREAD" : "READ";
       const response = await axios.post(url, {
           action: actionValue,
           school_id: school_id,
       });
       setRecords(response.data);      
    } catch (error) {
        console.error(` Error fetching data from ${endpoint}:`, error);
    }
};
export { fetchDataRead };