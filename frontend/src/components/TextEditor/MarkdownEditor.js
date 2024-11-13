// /frontend/src/components/MarkdownEditor/MarkdownEditor.js

import React from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./MarkdownEditor.css"; // Import the custom CSS
import MarkdownShortcuts from "quill-markdown-shortcuts";

Quill.register("modules/markdownShortcuts", MarkdownShortcuts);

const MarkdownEditor = ({ value, onChange, placeholder, darkMode }) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
    markdownShortcuts: {},
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "list",
    "bullet",
    "link",
    "image",
  ];

  return (
    <div className={`rounded-md overflow-hidden ${darkMode ? "dark" : ""}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
};

export default MarkdownEditor;
