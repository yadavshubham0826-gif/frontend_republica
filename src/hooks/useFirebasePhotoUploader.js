
import { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../firebase-config';

const useFirebasePhotoUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadPhoto = (file, path = 'images/') => {
    return new Promise((resolve, reject) => {
      if (!file) {
        setError('No file to upload.');
        return reject('No file to upload.');
      }

      // Check if user is authenticated with Firebase Auth
      const currentUser = auth.currentUser;
      if (!currentUser) {
        const errorMsg = 'You must be authenticated with Firebase to upload files. Please log in again.';
        setError(errorMsg);
        return reject(new Error(errorMsg));
      }

      setUploading(true);
      setError(null);
      setProgress(0);

      const storageRef = ref(storage, `${path}${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          setError(error);
          setUploading(false);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            // Also get the full path for deletion purposes
            const fullPath = uploadTask.snapshot.ref.fullPath;
            // Return both URL and path as an object
            resolve({ url: downloadURL, path: fullPath });
          } catch (error) {
            setError(error);
            reject(error);
          } finally {
            setUploading(false);
            setProgress(0);
          }
        }
      );
    });
  };

  return { uploading, progress, error, uploadPhoto };
};

export default useFirebasePhotoUploader;
