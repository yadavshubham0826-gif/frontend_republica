// src/pages/SingleBlog.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from 'dompurify'; // Import the sanitizer
import "../styles/style.css";

const SingleBlog = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        // Use new backend API to fetch blog post by ID
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/blog-by-id/${id}`);
        if (response.ok) {
          const data = await response.json();
          setPost({
            ...data,
            date: data.date?.toDate ? data.date.toDate().toISOString() : new Date().toISOString(),
          });
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
  }, [id]);

  if (loading) return <p>Loading post...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!post) return null;

  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="container narrow">
          <h1>{post.title}</h1>
          <p className="muted">
            By {post.author} on {new Date(post.date).toLocaleDateString()}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container narrow blog-content">
          {/* If you have images in your post data */}
          {post.image && (
            <div className="blog-image">
              <img src={post.image} alt={post.title} style={{ width: "100%", marginBottom: "1rem" }} />
            </div>
          )}

          <div className="blog-full-content">
            <div 
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} 
            />
          </div>

          <Link to="/blog" className="btn btn-secondary" style={{ marginTop: "2rem" }}>
            Back to Blog
          </Link>
        </div>
      </section>
    </main>
  );
};

export default SingleBlog;
