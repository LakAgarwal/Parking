import React from "react";
import { Link } from "react-router-dom";
import car from "../Images/car.png";

const Areacard = ({ area, onSelectArea }) => {
  return (
    <article className="zone-card">
      <div className="zone-image-wrap">
        <img src={car} className="zone-image" alt={`${area.name} icon`} />
      </div>
      <div className="zone-content">
        <p className="zone-label">Zone {area.id}</p>
        <h3 className="zone-name">{area.name}</h3>
        <p className="zone-copy">Track availability and secure your parking slot in seconds.</p>
        <div className="zone-actions">
          <button type="button" className="btn btn-light">Preview</button>
          <Link to={`/parking-area/${area.id}`}>
            <button type="button" onClick={() => onSelectArea(area.id)} className="btn btn-primary">
              Book Now
            </button>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default Areacard;
