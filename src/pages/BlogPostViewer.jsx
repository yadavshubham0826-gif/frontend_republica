// src/pages/BlogPostViewer.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from 'dompurify'; // Import the sanitizer
import "../styles/style.css";

const BlogPostViewer = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Use new backend API to fetch blog post by slug
        const response = await fetch(`/api/blog/${slug}`);
        if (!response.ok) {
          setError("Blog post not found.");
          setPost(null);
        } else {
          const postData = await response.json();
          setPost({
            ...postData,
            // Convert Firestore timestamp from backend to a Date object
            date: postData.date?._seconds ? new Date(postData.date._seconds * 1000) : new Date(),
          });
          setError("");
        }
      } catch (err) {
        console.error(err);
        setError("Error loading blog post.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchPost();
  }, [slug]);

  if (loading) return <div style={{ padding: "2rem" }}>Loading...</div>;
  if (error) return <div style={{ padding: "2rem", color: "red" }}>{error}</div>;
  if (!post) return null;

  return (
    <main id="main-content" style={{ padding: "2rem" }}>
      <div className="container narrow">
        <Link to="/blog" style={{ marginBottom: "1rem", display: "inline-block" }}>
          &larr; Back to Blog
        </Link>

        <h1>{post.title}</h1>
        <p className="muted" style={{ marginBottom: "2rem" }}>
          By {post.author} on {post.date.toLocaleDateString()}
        </p>

        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content || "<p>No content available.</p>") }}
        />
      </div>
    </main>
  );
};

export default BlogPostViewer;
