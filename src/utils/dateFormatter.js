const formatDate = (timestamp) => {
  if (!timestamp) {
    return "Just now";
  }

  // Firestore Timestamp object
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleString();
  }

  // Firestore Timestamp from client SDK (_seconds)
  if (timestamp._seconds) {
    return new Date(timestamp._seconds * 1000).toLocaleString();
  }

  // Admin SDK timestamp (seconds)
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }

  // Fallback for JS Date or other parsable date strings
  const date = new Date(timestamp);
  if (!isNaN(date)) {
    return date.toLocaleString();
  }

  return "Invalid Date";
};

export { formatDate };
