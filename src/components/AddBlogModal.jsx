import React, { useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import useFirebasePhotoUploader from '../hooks/useFirebasePhotoUploader';
import LoadingUI from './LoadingUI';
import './AddBlogModal.css';

const AddBlogModal = ({ isOpen, onClose, onAddBlog }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const modalContentRef = useRef(null);

  const {
    uploading: isUploading,
    progress,
    error: uploadError,
    uploadPhoto,
  } = useFirebasePhotoUploader();

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
      setLoading(true);
      // Send data to the secure backend endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/create-blog`, {
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
      setError(error.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalContentRef}>
        <h2>Create a New Blog Post</h2>

        {(error || uploadError) && <div className="error-message">{error || uploadError.message}</div>}

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
    menubar: "file edit view insert format tools table help",

    plugins: [
      "advlist",
      "autolink",
      "lists",
      "link",
      "image",
      "charmap",
      "preview",
      "anchor",
      "searchreplace",
      "visualblocks",
      "code",
      "fullscreen",
      "insertdatetime",
      "media",
      "table",
      "help",
      "wordcount",
      "emoticons",
      "directionality",
      "nonbreaking",
      "pagebreak",
      "visualchars"
    ],

    toolbar:
      "undo redo | blocks styles | fontfamily fontsize | " +
      "bold italic underline | forecolor backcolor | " +
      "alignleft aligncenter alignright | bullist numlist | " +
      "outdent indent | link image table | moretools",

    toolbar_mode: "wrap",

    setup: (editor) => {
      editor.ui.registry.addMenuButton("moretools", {
        text: "More",
        tooltip: "More formatting options",
        fetch: (callback) => {
          callback([
            {
              type: "menuitem",
              text: "Strikethrough",
              onAction: () => editor.execCommand("Strikethrough")
            },
            {
              type: "menuitem",
              text: "Justify",
              onAction: () => editor.execCommand("JustifyFull")
            },
            {
              type: "menuitem",
              text: "Special characters",
              onAction: () => editor.execCommand("mceShowCharmap")
            },
            {
              type: "menuitem",
              text: "Emoticons",
              onAction: () => editor.execCommand("mceEmoticons")
            },
            {
              type: "menuitem",
              text: "Search and replace",
              onAction: () => editor.execCommand("SearchReplace")
            },
            {
              type: "menuitem",
              text: "Preview",
              onAction: () => editor.execCommand("mcePreview")
            },
            {
              type: "menuitem",
              text: "Fullscreen",
              onAction: () => editor.execCommand("mceFullScreen")
            },
            {
              type: "menuitem",
              text: "Source code",
              onAction: () => editor.execCommand("mceCodeEditor")
            },
            {
              type: "menuitem",
              text: "Remove formatting",
              onAction: () => editor.execCommand("RemoveFormat")
            }
          ]);
        }
      });
    },

    font_family_formats:
      "Arial=arial,helvetica,sans-serif;" +
      "Calibri=calibri,sans-serif;" +
      "Cambria=cambria,serif;" +
      "Georgia=georgia,palatino,serif;" +
      "Times New Roman=times new roman,times,serif;" +
      "Verdana=verdana,geneva,sans-serif;" +
      "Courier New=courier new,courier,monospace",

    font_size_formats:
      "8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 24pt 28pt 36pt 48pt 72pt",

    style_formats: [
      {
        title: "Headings",
        items: [
          { title: "Heading 1", format: "h1" },
          { title: "Heading 2", format: "h2" },
          { title: "Heading 3", format: "h3" },
          { title: "Heading 4", format: "h4" },
          { title: "Heading 5", format: "h5" },
          { title: "Heading 6", format: "h6" }
        ]
      },
      {
        title: "Paragraph Styles",
        items: [
          { title: "Normal", format: "p" },
          { title: "No Spacing", format: "noSpacing" },
          { title: "Blockquote", format: "blockquote" },
          { title: "Preformatted", format: "pre" }
        ]
      },
      {
        title: "Text Styles",
        items: [
          { title: "Bold", format: "bold" },
          { title: "Italic", format: "italic" },
          { title: "Underline", format: "underline" },
          { title: "Strikethrough", format: "strikethrough" }
        ]
      },
      {
        title: "Image Styles",
        items: [
          {
            title: "Image Shadow",
            selector: "img",
            classes: "img-shadow"
          },
          {
            title: "Image Border",
            selector: "img",
            classes: "img-border"
          }
        ]
      }
    ],

    style_formats_merge: false,

    formats: {
      noSpacing: {
        block: "p",
        styles: {
          "margin-top": "0",
          "margin-bottom": "0",
          "line-height": "1"
        }
      }
    },

    content_style: `
      body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 12pt;
        line-height: 1.6;
        max-width: 900px;
        margin: 20px auto;
        padding: 0 24px;
      }

      p {
        margin-top: 0;
        margin-bottom: 1em;
      }

      h1 { font-size: 24pt; }
      h2 { font-size: 20pt; }
      h3 { font-size: 16pt; }

      img {
        max-width: 100%;
        height: auto;
      }

      img.img-shadow {
        box-shadow: 4px 4px 12px rgba(0,0,0,0.3);
      }

      img.img-border {
        border: 2px solid #ccc;
        padding: 2px;
      }

      blockquote {
        border-left: 4px solid #ccc;
        margin-left: 0;
        padding-left: 16px;
        color: #555;
      }
    `,

    browser_spellcheck: true,
    contextmenu: "link image table",
    automatic_uploads: true,
    file_picker_types: "image",

    file_picker_callback: (callback, value, meta) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          const photoData = await uploadPhoto(file, "blog_images/");
          const photoURL =
            typeof photoData === "string"
              ? photoData
              : photoData.url;

          callback(photoURL, { alt: file.name });
        } catch (err) {
          console.error("Image upload failed", err);
        }
      };

      input.click();
    }
  }}
/>

        <div className="modal-actions">
          {isUploading && (
            <LoadingUI text="Uploading image" detail={`${progress.toFixed(0)}% complete`} progress={progress} variant="card" size="sm" />
          )}
          <button onClick={onClose} className="btn btn-secondary" disabled={loading || isUploading}>Cancel</button>
          <button onClick={handleSave} className="btn btn-primary" disabled={loading || isUploading}>
            {loading ? <><span className="spinner"></span> Saving...</> : "Save Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBlogModal;
