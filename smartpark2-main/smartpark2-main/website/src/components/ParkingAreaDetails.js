import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ParkingAreaSlotVisualizer from "./ParkingAreaSlotVisualizer";
import NoticeMarquee from "./NoticeMarque";
import axios from "axios";

const ParkingAreaDetail = ({ areas }) => {
  const { areaId } = useParams();
  const selectedArea = areas.find((area) => area.id === parseInt(areaId));
  const navigate = useNavigate();
  const [isCopySuccess, setIsCopySuccess] = useState(false);

  if (!selectedArea) {
    return <div>Area not found</div>;
  }

  // Function to copy the map link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(selectedArea.mapLink);
    setIsCopySuccess(true);
    setTimeout(() => setIsCopySuccess(false), 2000);
  };

  // Truncate link if it's longer than 50 characters
  const truncatedLink =
    selectedArea.mapLink.length > 50
      ? selectedArea.mapLink.substring(0, 50) + "..."
      : selectedArea.mapLink;

  const handleBooking = () => {
    const bookingData = {
      user_id: "123",
      area_id: areaId,
    };
    // console.log({ bookingData });

    axios
      .post(`http://localhost:8080/api/v1/slot/`, bookingData)
      .then((response) => {
        // Assuming the API responds with booking details, you can access them in response.data
        console.log("Booking response:", response.data);

        // Navigate to the booking-details page with the area ID in the URL
        navigate(`/parking-area/${areaId}/booking-details`, {
          state: JSON.stringify({
            data: { ...response.data, ...selectedArea },
          }),
        });
      })
      .catch((error) => {
        console.error("Booking error:", error);
      });
  };

  return (
    <div className="details-wrap">
      <h2 className="details-title">
        Parking Area: {selectedArea.name}
      </h2>
      <div className="stats-row">
        <div className="stat-card">
          <p>Total Slots: {selectedArea.totalSlots}</p>
        </div>
        <div className="stat-card">
          <p>Available Slots: {selectedArea.availableSlots}</p>
        </div>
      </div>
      <ParkingAreaSlotVisualizer
        totalSlots={selectedArea.totalSlots}
        availableSlots={selectedArea.availableSlots}
        bookedSlots={selectedArea.totalSlots - selectedArea.availableSlots}
      />
      <div>
        <NoticeMarquee
          notice={
            "Note: There will be a time of only 10 minutes to reserve your slots"
          }
        />
      </div>
      <div className="map-copy-row">
        <div className="map-link-text">{truncatedLink}</div>
        <button onClick={handleCopyLink} className="copy-btn">
            {isCopySuccess ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="map-frame-wrap">
        <iframe
          className="map-frame"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          id="gmap_canvas"
          src="https://maps.google.com/maps?width=675&amp;height=316&amp;hl=en&amp;q=NIT%20Jalandhar%20Jalandhar+(NITJaladhar)&amp;t=&amp;z=12&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
          title="Area Map"
        />
      </div>
      <div className="book-btn-wrap">
        {selectedArea.availableSlots > 0 ? (
          <button onClick={handleBooking} className="book-btn">
            Book a Slot
          </button>
        ) : (
          <p className="book-btn" style={{ textAlign: "center" }}>
            No available slots to book
          </p>
        )}
      </div>
    </div>
  );
};

export default ParkingAreaDetail;
