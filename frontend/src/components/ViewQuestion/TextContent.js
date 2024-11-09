// frontend/src/components/ViewQuestion/TextContent.js

import React from "react";
import parse, { domToReact } from "html-react-parser";
import DOMPurify from "dompurify";

function TextContent({ content, type }) {
  const sanitizedContent = DOMPurify.sanitize(content);

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
          <img
            src={node.attribs.src}
            alt={node.attribs.alt || "Image"}
            className="max-w-full h-auto rounded-md my-2"
            key={node.key}
          />
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
    <div className={`text-gray-800 dark:text-gray-200 break-words`}>
      {parse(sanitizedContent, options)}
    </div>
  );
}

export default TextContent;
