import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

const EditBlogModal = ({ isOpen, onClose, postToEdit, onAddBlog }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const modalContentRef = useRef(null);

  useEffect(() => {
    if (!postToEdit) return;
    setTitle(postToEdit.title || "");
    setAuthor(postToEdit.author || "");
    setContent(postToEdit.content || "");
    setError(""); // Clear errors when a new post is loaded
  }, [postToEdit]);

  if (!isOpen || !postToEdit) return null;

  const handleUpdate = async () => {
    setError(""); // Clear previous errors
    if (!title.trim() || !author.trim()) {
      setError("Heading and Title Cannot be Empty. Please Add Proper Heading and Title.");
      if (modalContentRef.current) {
        modalContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    try {
      setLoading(true);
      
      // 1️⃣ Call the new secure backend endpoint
      const response = await fetch("https://republicadrcdu.vercel.app/api/edit-blog", {
        method: "POST",
        credentials: 'include', // <-- ADD THIS LINE
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: postToEdit.id,
          title,
          author,
          content,
          oldContent: postToEdit.content, // Send old content for comparison on backend
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update post.');
      }

      // 2️⃣ Refresh blog list and close modal
      await onAddBlog();
      onClose();
    } catch (err) {
      console.error("Error updating blog:", err);
      setError(err.message || "An error occurred while updating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalContentRef}>
        <h2>Edit Blog Post</h2>

        {error && <div className="error-message">{error}</div>}

        <input
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

        <input
          type="text"
          placeholder="Author Name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

   <Editor
  apiKey="wlob6qkemz0muvfnbvbjltl5n6419jw1uyoq4u2ym4hok7o6"
  value={content}
  onEditorChange={(newContent) => setContent(newContent)}
  init={{
    height: 500,
    menubar: true,
    plugins: [
      "advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor",
      "searchreplace", "visualblocks", "code", "fullscreen", "insertdatetime", "media",
      "table", "help", "wordcount", "emoticons", "formatpainter", "textpattern"
    ],
    toolbar:
      "undo redo | styleselect formatselect fontfamily fontsize | " +
      "bold italic underline strikethrough forecolor backcolor | " +
      "alignleft aligncenter alignright alignjustify | " +
      "bullist numlist | outdent indent | " +
      "link image | table | emoticons | " +
      "removeformat | code fullscreen",
    style_formats: [
      { title: 'Headers', items: [
          { title: 'Heading 1', format: 'h1' },
          { title: 'Heading 2', format: 'h2' },
          { title: 'Heading 3', format: 'h3' },
          { title: 'Heading 4', format: 'h4' },
          { title: 'Heading 5', format: 'h5' },
          { title: 'Heading 6', format: 'h6' }
        ] 
      },
      { title: 'Inline', items: [
          { title: 'Bold', format: 'bold' },
          { title: 'Italic', format: 'italic' },
          { title: 'Underline', format: 'underline' },
          { title: 'Strikethrough', format: 'strikethrough' }
        ]
      },
      { title: 'Blocks', items: [
          { title: 'Paragraph', format: 'p' },
          { title: 'Blockquote', format: 'blockquote' }
        ]
      },
      { title: 'Image Styles', items: [
          { title: 'Image Shadow', selector: 'img', classes: 'img-shadow' },
          { title: 'Image Border', selector: 'img', classes: 'img-border' }
        ]
      }
    ],
    content_style: `
      img.img-shadow { box-shadow: 4px 4px 12px rgba(0,0,0,0.3); }
      img.img-border { border: 2px solid #ccc; padding: 2px; }
    `,
    automatic_uploads: false,
    file_picker_types: "image",
    file_picker_callback: (callback) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => callback(reader.result, { alt: file.name });
        reader.readAsDataURL(file);
      };
      input.click();
    },
  }}
/>

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBlogModal;
