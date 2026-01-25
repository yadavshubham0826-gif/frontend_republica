import React, { useState, useEffect } from 'react';
import '../styles/ImageSlideshow.css';
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";

const ImageSlideshow = ({ autoPlayInterval = 4000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideshowImages, setSlideshowImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const storage = getStorage();
        const folderRef = ref(storage, 'slideshow'); // <-- folder named 'slideshow'
        
        // List all files in the folder
        const res = await listAll(folderRef);

        // Get download URLs for all files
        const urls = await Promise.all(
          res.items.map(itemRef => getDownloadURL(itemRef))
        );

        setSlideshowImages(urls);
        console.log("Fetched slideshow images:", urls);
      } catch (error) {
        console.error("Error fetching slideshow images:", error);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    if (slideshowImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % slideshowImages.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [slideshowImages, autoPlayInterval]);

  const goToSlide = index => setCurrentIndex(index);
  const goToPrevious = () =>
    setCurrentIndex(prevIndex =>
      prevIndex === 0 ? slideshowImages.length - 1 : prevIndex - 1
    );
  const goToNext = () =>
    setCurrentIndex(prevIndex => (prevIndex + 1) % slideshowImages.length);

  if (slideshowImages.length === 0) return null;

  return (
    <div className="image-slideshow-container">
      <div className="slideshow-wrapper">
        {slideshowImages.map((image, index) => (
          <div key={index} className={`slide ${index === currentIndex ? 'active' : ''}`}>
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              onError={e => {
                console.error('Image failed to load:', image);
                e.target.style.display = 'none';
              }}
            />
          </div>
        ))}

        {slideshowImages.length > 1 && (
          <>
            <button className="slide-nav prev" onClick={goToPrevious}>&#8249;</button>
            <button className="slide-nav next" onClick={goToNext}>&#8250;</button>
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSlideshow;
