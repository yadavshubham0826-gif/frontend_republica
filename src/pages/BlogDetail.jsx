import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useUser } from '../context/UserContext';
import { useModal } from '../context/ModalContext'; // To open login modal
import ConfirmModal from '../components/ConfirmModal';
import DOMPurify from 'dompurify'; // Import the sanitizer
import Notification from '../components/Notification';
import { db } from "../firebase-config.js"; // Import Firestore instance
import { collection, query, where, getDocs, doc, updateDoc, increment, orderBy } from "firebase/firestore"; // Import Firestore functions
import "../styles/BlogDetail.css";

const BlogDetail = () => {
  const { slug } = useParams();
  const { user } = useUser(); // Get logged-in user
  const { setShowLogin } = useModal(); // Get function to open login modal
  const username = user?.name || "";

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [notification, setNotification] = useState({ message: null, type: '' });
  const [showAuthModal, setShowAuthModal] = useState(false); // For the login prompt modal

  const isUserAdmin = user && user.role === 'admin';

  useEffect(() => {
    if (username) setCommentAuthor(username);
  }, [username]);

  // Fetch blog post
  useEffect(() => {
    const fetchPostBySlug = async () => {
      try {
        setLoading(true);
        // Fetch post by slug directly from Firestore
        const q = query(collection(db, "blogs"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error('Blog post not found.');
        }

        const docSnap = querySnapshot.docs[0];
        const postData = { id: docSnap.id, ...docSnap.data() };
        setPost(postData);

        // Increment views
        const postRef = doc(db, "blogs", docSnap.id);
        await updateDoc(postRef, { views: increment(1) });
      } catch (err) {
        setError("Failed to load blog post.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchPostBySlug();
  }, [slug]);

  // Effect to handle scrolling to comments section
  useEffect(() => {
    // When the component loads, check if the URL has the #comments hash
    if (window.location.hash === "#comments" && post && !showComments) {
      setShowComments(true); // This will trigger the comments to show and fetch
    }
  }, [post]); // Run when post data is available


  const handleLike = async () => {

    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setPost((prev) => ({
      ...prev,
      likes: newIsLiked ? (prev.likes || 0) + 1 : (prev.likes || 0) - 1,
    }));

    try {
      // Update the like count directly in Firestore
      const postRef = doc(db, "blogs", post.id);
      const incrementValue = newIsLiked ? 1 : -1;
      await updateDoc(postRef, {
        likes: increment(incrementValue)
      });
    } catch (err) {
      setIsLiked(!newIsLiked);
      // Rollback UI on error
      setPost((prev) => ({
        ...prev,
        likes: newIsLiked ? (prev.likes || 1) - 1 : (prev.likes || 0) + 1,
      }));
    }
  };

  const fetchComments = async () => {
    if (!post) return;
    setCommentsLoading(true);
    try {
      // Fetch comments directly from the 'comments' subcollection of the blog post
      const commentsRef = collection(db, "blogs", post.id, "comments");
      const q = query(commentsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const commentsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(commentsData);
    } catch (err) {
    } finally {
      setCommentsLoading(false);
    }
  };

  // Effect to fetch comments when showComments becomes true
  useEffect(() => {
    if (showComments && post) {
      fetchComments();

      // Now that we know the comment section will be rendered, scroll to it
      const commentSection = document.getElementById("comment-section");
      if (commentSection) {
        commentSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [showComments, post]); // Depend on post to ensure it's available

  const handleToggleComments = () => {
    setShowComments(prev => !prev);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    // 1. Check if user is logged in
    if (!user) {
      setShowAuthModal(true); // Show the floating window instead of the notification
      return;
    }

    // 2. Validate input
    if (!newComment.trim() || !commentAuthor.trim()) {
      setNotification({ message: 'Please enter your name and comment.', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/add-comment`, {
        method: "POST",
        credentials: 'include', // Include this for authenticated requests
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogId: post.id,
          author: commentAuthor,
          text: newComment,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to post comment.');
      }

      // Clear form and update local state
      setNewComment("");
      setCommentAuthor(username || "");
      // Optimistically update comment count
      setPost((prev) => ({
        ...prev,
        comments: (prev.comments || 0) + 1,
      }));

      fetchComments();
    } catch (err) {
      setNotification({ message: err.message || "Failed to post comment.", type: 'error' });
    }
  };

  const handleDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  const onConfirmDelete = async () => {
    if (!commentToDelete) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/delete-comment`, {
        method: "POST",
        credentials: 'include', // Include this for authenticated requests
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogId: post.id,
          commentId: commentToDelete,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete comment.');
      }

      setComments((prev) => prev.filter((c) => c.id !== commentToDelete));
      // Decrement comment count
      setPost((prev) => ({
        ...prev,
        comments: (prev.comments || 1) - 1,
      }));
    } catch (err) {
      setNotification({ message: err.message || "Failed to delete comment.", type: 'error' });
    } finally {
      setShowDeleteModal(false);
      setCommentToDelete(null);
    }
  };

  const handleCommentLike = async (commentId) => {
    // Optimistically update the UI
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === commentId
          ? { ...comment, likes: (comment.likes || 0) + 1 }
          : comment
      )
    );

    try {
      // Update the like count directly in Firestore
      const commentRef = doc(db, "blogs", post.id, "comments", commentId);
      await updateDoc(commentRef, {
        likes: increment(1)
      });
    } catch (err) {
      console.error("Error liking comment:", err);
      // Rollback UI on error
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId
            ? { ...comment, likes: (comment.likes || 1) - 1 }
            : comment
        )
      );
    }
  };

  if (loading) return <div className="blog-loading">Loading...</div>;
  if (error) return <div className="blog-error">{error}</div>;
  if (!post) return null;

  return (
    <main id="main-content" className="blog-detail-page">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: null, type: '' })}
      />
      <ConfirmModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onConfirm={() => {
          setShowAuthModal(false);
          setShowLogin(true);
        }}
        title="Login Required"
        confirmText="Login / Sign Up"
        cancelText="Cancel"
      >
        <p>Sorry! Only registered users can write comments.</p>
        <p>Please create an account or log in to continue.</p>
      </ConfirmModal>
      <div className="blog-detail-container">
        {/* Header with Back link and Centered Icon */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <Link to="/blog" className="back-link" style={{ flex: 1 }}>← Back to Blog</Link>
          <img
            src="https://res.cloudinary.com/dyv1rtwvh/image/upload/v1763817711/WhatsApp_Image_2025-11-22_at_18.42.47_fa6778ca_nqifs2.jpg"
            alt="Republica Logo"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <div style={{ flex: 1 }}></div> {/* This empty div ensures the icon stays centered */}
        </div>

        <h1 className="blog-title">{post.title}</h1>
        <p className="blog-meta">
          By {post.author} on{" "}
          {post.date ? new Date(post.date._seconds ? post.date._seconds * 1000 : post.date).toLocaleDateString() : "..."}
        </p>
        <hr />

        <div 
          className="blog-content" 
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} 
        />
        <hr />

        <div className="blog-actions">
          <button className="action-btn" onClick={handleLike}>
            {isLiked ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            )}
            {post.likes || 0}
          </button>
          <button className="action-btn" onClick={handleToggleComments}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            {post.comments || 0}
          </button>
          <button className="action-btn" style={{ cursor: 'default' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            {post.views || 0}
          </button>
        </div>

        {showComments && (
          <div id="comment-section" className="comment-section">
            <hr />
            <h2>Comments ({post.comments || 0})</h2>

            <form onSubmit={handleCommentSubmit} className="comment-form">
              <input
                type="text"
                placeholder="Your Name"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                required
                disabled={!!username}
              />
              <textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
              <button type="submit">Post Comment</button>
            </form>

            <div className="comment-list">
              {commentsLoading && <p>Loading comments...</p>}
              {!commentsLoading &&
                comments.map((comment) => {
                  const anonymousLikes = JSON.parse(localStorage.getItem('anonymousLikes') || '[]');
                  // Check if the current user's ID is in the likedBy array
                  const isLikedByUser = user && comment.likedBy?.some(liker => liker.uid === user.uid);

                  const isAdminComment = comment.authorRole === 'admin';
                  const isAdminLiked = comment.likedBy?.some(liker => liker.role === 'admin') || false;

                  return (
                    <div
                      key={comment.id}
                      className={`comment-item ${isAdminComment ? "admin-comment" : ""} ${isAdminLiked ? "admin-liked-comment" : ""}`}
                    >
                      <strong>{comment.author}</strong>
                      <p>{comment.text}</p>
                      <div className="comment-footer">
                        <span>
                          {comment.createdAt?._seconds
                            ? new Date(comment.createdAt._seconds * 1000).toLocaleString()
                            : "Just now"}
                        </span>
                        <div className="comment-actions">
                          <button
                            className="like-btn"
                            onClick={() => handleCommentLike(comment.id)}
                          >
                            {isLikedByUser ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="#3498db"
                                stroke="#3498db"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                              </svg>
                            )}
                            {comment.likes || 0}
                          </button>
                          {isUserAdmin && (
                              <button
                                className="delete-comment-btn"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                Delete
                              </button>
                            )}
                        </div>
                      </div>
                      {isAdminLiked && (
                        <span className="admin-liked-badge" style={{ color: "red" }}>
                          Liked By Admin
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={onConfirmDelete}
          title="Confirm Deletion"
          confirmText="Delete"
        >
          <p>Are you sure you want to delete this comment?</p>
        </ConfirmModal>
      </div>
    </main>
  );
};

export default BlogDetail;
