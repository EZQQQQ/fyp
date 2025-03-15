// frontend/src/components/ViewQuestion/TextContent.js
import React, { useState, useEffect, useRef } from "react";
import parse, { domToReact } from "html-react-parser";
import DOMPurify from "dompurify";

function TextContent({ content, type }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState("");
  const modalContentRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isModalOpen) {
        closeModal();
      }
      if (event.key === "Tab" && isModalOpen) {
        // Trap focus within the modal
        const focusableElements = modalContentRef.current?.querySelectorAll(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    const handleClickOutside = (event) => {
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(event.target)
      ) {
        closeModal();
      }
    };

    const closeModal = () => {
      setIsModalOpen(false);
    };

    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("mousedown", handleClickOutside);
      // Set focus to the close button when modal opens
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      }
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  // Handle empty or invalid content
  if (!content) {
    return <div className="text-gray-500"></div>;
  }

  // Check if content already has HTML tags
  // If not, wrap it in a paragraph tag for consistent formatting
  let processedContent = content;
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);

  if (!hasHtmlTags) {
    processedContent = `<p>${content}</p>`;
  }

  // Sanitize the content
  const sanitizedContent = DOMPurify.sanitize(processedContent);

  // Remove empty paragraphs (those that contain only whitespace and/or <br>)
  const cleanedContent = sanitizedContent.replace(/<p>(\s|<br\s*\/?>)*<\/p>/gi, "");

  // Define options for html-react-parser
  const options = {
    replace: (node) => {
      // Handle preformatted text blocks
      if (node.name === "pre") {
        return (
          <pre
            className="bg-gray-800 dark:bg-gray-700 text-white p-2 rounded-md overflow-x-auto my-2 w-full"
            key={node.key}
          >
            {domToReact(node.children, options)}
          </pre>
        );
      }

      // Handle inline code snippets
      if (node.name === "code") {
        return (
          <code
            className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-1 rounded"
            key={node.key}
          >
            {domToReact(node.children, options)}
          </code>
        );
      }

      // Handle images
      if (node.name === "img") {
        return (
          <div
            key={node.key}
            onClick={() => {
              setModalImageSrc(node.attribs.src);
              setIsModalOpen(true);
            }}
            className="cursor-pointer inline-block"
          >
            <img
              src={node.attribs.src}
              alt={node.attribs.alt || "Image"}
              className="max-w-xs h-auto rounded-md my-2"
            />
          </div>
        );
      }

      // Handle blockquotes
      if (node.name === "blockquote") {
        return (
          <blockquote
            className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-300 my-2"
            key={node.key}
          >
            {domToReact(node.children, options)}
          </blockquote>
        );
      }

      // Handle unordered lists
      if (node.name === "ul") {
        return (
          <ul
            className="list-disc list-inside text-gray-800 dark:text-gray-200 my-2 space-y-1"
            key={node.key}
          >
            {domToReact(node.children, options)}
          </ul>
        );
      }

      // Handle ordered lists
      if (node.name === "ol") {
        return (
          <ol
            className="list-decimal list-inside text-gray-800 dark:text-gray-200 my-2 space-y-1"
            key={node.key}
          >
            {domToReact(node.children, options)}
          </ol>
        );
      }

      // Handle list items
      if (node.name === "li") {
        return (
          <li className="mt-1" key={node.key}>
            {domToReact(node.children, options)}
          </li>
        );
      }

      // Handle strong text
      if (node.name === "strong") {
        return (
          <strong
            className="font-semibold text-gray-800 dark:text-gray-200"
            key={node.key}
          >
            {domToReact(node.children, options)}
          </strong>
        );
      }

      // Handle emphasized text
      if (node.name === "em") {
        return (
          <em
            className="italic text-gray-800 dark:text-gray-200"
            key={node.key}
          >
            {domToReact(node.children, options)}
          </em>
        );
      }

      // Handle headings
      if (/^h[1-6]$/.test(node.name)) {
        const level = node.name.replace("h", "");
        const size = `text-${Math.min(level * 2 + 2, 6)}xl`; // h1: text-4xl, h2: text-5xl, h3+: text-6xl

        return (
          <div
            key={node.key}
            className={`${size} font-bold text-gray-800 dark:text-gray-100 my-2`}
          >
            {domToReact(node.children, options)}
          </div>
        );
      }
    },
  };

  return (
    <div className="text-gray-800 dark:text-gray-200 break-words">
      {parse(cleanedContent, options)}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            ref={modalContentRef}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeButtonRef}
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-white text-3xl font-bold focus:outline-none transition transform hover:scale-110"
              aria-label="Close"
            >
              &#x2715;
            </button>
            <img
              src={modalImageSrc}
              alt="Expanded Media"
              className="max-w-[90vw] sm:max-w-[85vw] md:max-w-[80vw] lg:max-w-[75vw] max-h-[85vh] rounded-xl shadow-lg transition-transform duration-300 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TextContent;