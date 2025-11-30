import React from "react";
import FacultyCard from "./FacultyCard";
import "../styles/FacultyCard.css";


const FacultySection = () => {
  return (
    <div className="faculty-container">
      <FacultyCard img="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1764348832/WhatsApp_Image_2025-11-28_at_22.22.54_43301c8a_bdopox.jpg" name="Dr. Jagdish Chander" role="Teacher In Charge" position="Associate Professor" />
      <FacultyCard img="IMAGE_URL" name="Dr. Seema Das" position="Associate Professor" />
      <FacultyCard img="IMAGE_URL" name="Dr. Chandrachur Singh" position="Professor" />
      <FacultyCard img="IMAGE_URL" name="Dr. Maneesha Pandey" position="Associate Professor" />

      {/* Your repeated cards */}
      <FacultyCard img="IMAGE_URL" name="Dr. Maneesha Pandey" position="Associate Professor" />
      <FacultyCard img="IMAGE_URL" name="Dr. Maneesha Pandey" position="Associate Professor" />
      <FacultyCard img="IMAGE_URL" name="Dr. Maneesha Pandey" position="Associate Professor" />
      <FacultyCard img="IMAGE_URL" name="Dr. Maneesha Pandey" position="Associate Professor" />
      <FacultyCard img="IMAGE_URL" name="Dr. Maneesha Pandey" position="Associate Professor" />
      <FacultyCard img="IMAGE_URL" name="Dr. Maneesha Pandey" position="Associate Professor" />
      <FacultyCard img="IMAGE_URL" name="Dr. Maneesha Pandey" position="Associate Professor" />
      <FacultyCard img="IMAGE_URL" name="Dr. Maneesha Pandey" position="Associate Professor" />
      <FacultyCard img="IMAGE_URL" name="Dr. Maneesha Pandey" position="Associate Professor" />
      <FacultyCard img="IMAGE_URL" name="Dr. Maneesha Pandey" position="Associate Professor" />
      <FacultyCard img="IMAGE_URL" name="Dr. Maneesha Pandey" position="Associate Professor" />
      <FacultyCard img="IMAGE_URL" name="Dr. Maneesha Pandey" position="Associate Professor" />
      <FacultyCard img="IMAGE_URL" name="Dr. Maneesha Pandey" position="Associate Professor" />
      <FacultyCard img="IMAGE_URL" name="Dr. Maneesha Pandey" position="Associate Professor" />
    </div>
  );
};

export default FacultySection;
