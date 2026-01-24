import React, { useState, useEffect } from 'react';
import '../styles/ImageSlideshow.css';

const ImageSlideshow = ({ images = [], autoPlayInterval = 4000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Default images if none provided
  const defaultImages = [
    "https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FMain%20Page%2FAdobe_Express_-_file_pcjl0s.jpg?alt=media&token=24589b70-edaa-48dc-833d-672ff566876e",
    "https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FMain%20Page%2FAdobe_Express_-_file_pcjl0s.jpg?alt=media&token=24589b70-edaa-48dc-833d-672ff876e",
    "https://firebasestorage.googleapis.com/v0/b/drc-political-science.firebasestorage.app/o/Team%2FMain%20Page%2FAdobe_Express_-_file_pcjl0s.jpg?alt=media&token=24589b70-edaa-48dc-833d-672ff566876e"
  ];

  const slideshowImages = images.length > 0 ? images : defaultImages;

  // Debug: Log images count
  useEffect(() => {
    console.log('Slideshow images:', slideshowImages.length, slideshowImages);
  }, [images]);

  useEffect(() => {
    if (slideshowImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slideshowImages.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [images.length, autoPlayInterval, slideshowImages.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? slideshowImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % slideshowImages.length
    );
  };

  if (slideshowImages.length === 0) {
    return (
      <div className="image-slideshow-container">
        <div className="slideshow-wrapper">
          <div className="slide active">
            <img src={defaultImages[0]} alt="Default slide" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="image-slideshow-container">
      <div className="slideshow-wrapper">
        {slideshowImages.map((image, index) => (
          <div
            key={index}
            className={`slide ${index === currentIndex ? 'active' : ''}`}
          >
            <img src={image} alt={`Slide ${index + 1}`} onError={(e) => {
              console.error('Image failed to load:', image);
              e.target.style.display = 'none';
            }} />
          </div>
        ))}
        
        {slideshowImages.length > 1 && (
          <>
            <button className="slide-nav prev" onClick={goToPrevious} aria-label="Previous slide">
              &#8249;
            </button>
            <button className="slide-nav next" onClick={goToNext} aria-label="Next slide">
              &#8250;
            </button>
          </>
        )}
      </div>
      
      {slideshowImages.length > 1 && (
        <div className="slideshow-dots">
          {slideshowImages.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSlideshow;

