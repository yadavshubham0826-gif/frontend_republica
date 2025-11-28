import React from "react";
import "../styles/TeamCard.css";  // correct path now

const TeamCard = ({ img, name, role }) => {
  return (
    <div className="teamcard-container">
      <div className="teamcard-image-wrapper">
        <img src={img} alt={name} className="teamcard-img" />
      </div>

      <h3 className="teamcard-name">{name}</h3>
      <p className="teamcard-role">{role}</p>
    </div>
  );
};

export default TeamCard;
