import React, { useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import './AddBlogModal.css';

const AddBlogModal = ({ isOpen, onClose, onAddBlog }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [error, setError] = useState('');
  const modalContentRef = useRef(null);

  const generateSlug = (title) =>
    title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

  const handleSave = async () => {
    setError(''); // Clear previous errors
    if (!title.trim() || !author.trim()) {
      setError("Heading and Title Cannot be Empty. Please Add Proper Heading and Title.");
      if (modalContentRef.current) {
        modalContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    try {
      // Send data to the secure backend endpoint
      const response = await fetch("http://localhost:5000/api/create-blog", {
        method: "POST",
        credentials: 'include', // <-- ADD THIS LINE
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          author: author || "Admin",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save post.');
      }

      onAddBlog(); // Refresh the blog list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalContentRef}>
        <h2>Create a New Blog Post</h2>

        {error && <div className="error-message">{error}</div>}

        <input
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
        />

        <input
          type="text"
          placeholder="Author Name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
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
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">Save Post</button>
        </div>
      </div>
    </div>
  );
};

export default AddBlogModal;
