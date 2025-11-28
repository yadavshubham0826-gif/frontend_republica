import { useState, useCallback } from 'react';
import heic2any from 'heic2any';

/**
 * A custom hook to handle file selection, HEIC/HEIF conversion, and previews.
 * @returns {object} An object containing states and handler functions.
 */
export const usePhotoUploader = () => {
  // State to hold the original File objects and their base64 representations for upload
  const [photos, setPhotos] = useState([]);
  // State to hold URLs for image previews
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = useCallback(async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsConverting(true);
    setError('');
    setPhotos([]);
    setPhotoPreviews([]);

    const processedPhotos = [];
    const previews = [];

    for (const file of files) {
      const fileName = file.name.toLowerCase();
      let fileToProcess = file;

      // Check if the file is a HEIC/HEIF image
      if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) {
        try {
          // Convert it to JPEG
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8, // Adjust quality as needed
          });
          // Create a new File object from the converted blob
          fileToProcess = new File([convertedBlob], `${fileName.split('.')[0]}.jpg`, {
            type: 'image/jpeg',
            lastModified: new Date().getTime(),
          });
        } catch (conversionError) {
          console.error('Error converting HEIC file:', conversionError);
          setError(`Failed to convert ${file.name}. Please try a different file.`);
          // Skip this file and continue with the next ones
          continue;
        }
      }

      // Generate a preview URL for the processed file (original or converted)
      previews.push(URL.createObjectURL(fileToProcess));

      // Read the file as a base64 string for upload
      const reader = new FileReader();
      reader.readAsDataURL(fileToProcess);
      reader.onloadend = () => {
        processedPhotos.push({
          file: fileToProcess,
          base64: reader.result,
        });
        // Update state when the last file is processed
        if (processedPhotos.length === files.length) {
          setPhotos(processedPhotos);
          setPhotoPreviews(previews);
          setIsConverting(false);
        }
      };
      reader.onerror = () => {
        console.error('Error reading file as base64.');
        setError('There was an error processing your files.');
        setIsConverting(false);
      };
    }
  }, []);

  return { photos, photoPreviews, isConverting, error, handleFileChange };
};