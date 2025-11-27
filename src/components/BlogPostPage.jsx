import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import DOMPurify from 'dompurify'; // Import the sanitizer
import "./BlogPostPage.css"; // We'll create this for styling

const BlogPostPage = () => {
  const { blogId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!blogId) return;

      try {
        setLoading(true);
        const postDocRef = doc(db, "blogs", blogId);
        const postDoc = await getDoc(postDocRef);

        if (postDoc.exists()) {
          setPost({ id: postDoc.id, ...postDoc.data() });
        } else {
          setError("Blog post not found.");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load the blog post.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [blogId]);

  if (loading) {
    return <div className="blog-page-container">Loading...</div>;
  }

  if (error) {
    return <div className="blog-page-container">{error}</div>;
  }

  if (!post) {
    return null;
  }

  // Sanitize the HTML content before rendering to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(post.content);

  return (
    <div className="blog-page-container">
      <div className="blog-page-content">
        <Link to="/blog" className="back-link">
          &larr; Back to Blogs
        </Link>
        <h1>{post.title}</h1>
        <p className="author-info">
          By {post.author} on {new Date(post.date?.toDate()).toLocaleDateString()}
        </p>
        <hr />
        <div
          className="blog-body"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </div>
    </div>
  );
};

export default BlogPostPage;