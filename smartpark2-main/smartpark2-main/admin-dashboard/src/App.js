import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import SignupPage from './pages/Signup';
import LoginPage from './pages/Login.js'
import AdminForm from './pages/Adminform.js';


const areasData = [
  { id: 1, name: 'Area 1', totalSlots: 10, availableSlots: 7, mapLink: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3440.711120357035!2d77.964261675494!3d30.415936974738667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3908d4890d7c1735%3A0x22d3ae324c238e3c!2sUPES!5e0!3m2!1sen!2sin!4v1693118306428!5m2!1sen!2sin/FLCnK4q3YX7eZ1JE8"}, // Example data
  { id: 2, name: 'Area 2', totalSlots: 10, availableSlots: 0, mapLink: "https://goo.gl/maps/FLCnK4q3YX7eZ1JE8" }, // Example data
  // Add more area data
];

const bookingData = {
  bookingTime: "4:30",
  area: "Parking Area A1",
  imageUrl: "https://example.com/your-image-url.jpg",
  // Add more data here
};

function App() {
  return (
     <BrowserRouter>
        <Routes>
            <Route path="/" element={<LoginPage/>} />
            <Route path="/signup" element={<SignupPage/>} />
            <Route path="Adminform" element = {<AdminForm/>} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
