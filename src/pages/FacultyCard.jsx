import React from "react";
import "../styles/FacultyCard.css";

const FacultyCard = ({ img, name, role, position }) => {
  return (
    <div className="faculty-card">
      <div className="faculty-img">
        <img src={img} alt={name} />
      </div>

      <h3>{name}</h3>

      {role && <p className="role">{role}</p>}

      <p className="position">{position}</p>

      <button className="know-btn">
        Know More <span>›</span>
      </button>
    </div>
  );
};

export default FacultyCard;
