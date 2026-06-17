import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import SignupPage from './pages/Signup';
import LoginPage from './pages/Login.js'
import Home from './pages/Home'
import BookSlot from "./pages/Bookslot.js"
import ParkingAreaDetails from './components/ParkingAreaDetails';
import QRCodeListingPage from './pages/Qrcodelistingpage';

const areasData = [
  { id: 1, name: 'Area 1', totalSlots: 10, availableSlots: 7, mapLink: "https://maps.google.com/?q=NIT+Jalandhar" },
  { id: 2, name: 'Area 2', totalSlots: 10, availableSlots: 6, mapLink: "https://maps.google.com/?q=NIT+Jalandhar" },
  { id: 3, name: 'Area 3', totalSlots: 10, availableSlots: 6, mapLink: "https://maps.google.com/?q=NIT+Jalandhar" },
  { id: 4, name: 'Area 4', totalSlots: 10, availableSlots: 8, mapLink: "https://maps.google.com/?q=NIT+Jalandhar" },
  { id: 5, name: 'Area 5', totalSlots: 10, availableSlots: 5, mapLink: "https://maps.google.com/?q=NIT+Jalandhar" },
  { id: 6, name: 'Area 6', totalSlots: 10, availableSlots: 4, mapLink: "https://maps.google.com/?q=NIT+Jalandhar" },
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
            <Route path="/home" element={<Home/>} />
            <Route path="/parking-area/:areaId"
             element = {<ParkingAreaDetails areas={areasData}/>} />
            <Route
          path="/parking-area/:areaId/booking-details" element = {<BookSlot bookingData={bookingData}/>}/>

          <Route path="/qrcodelisting" element={<QRCodeListingPage></QRCodeListingPage>}></Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
