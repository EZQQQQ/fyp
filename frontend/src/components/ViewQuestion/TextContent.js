// /frontend/src/components/ViewQuestion/TextContent.js

import React from "react";
import parse, { domToReact } from "html-react-parser";
import DOMPurify from "dompurify";

function TextContent({ content, type }) {
  const sanitizedContent = DOMPurify.sanitize(content);

  const options = {
    replace: (node) => {
      if (node.name === "pre") {
        return (
          <pre
            className="bg-gray-800 dark:bg-gray-700 text-white p-2 rounded-md overflow-x-auto my-2"
            key={node.key}
          >
            {domToReact(node.children, options)}
          </pre>
        );
      }
      if (node.name === "code") {
        return (
          <code
            className="bg-gray-800 dark:bg-gray-700 text-white p-1 rounded"
            key={node.key}
          >
            {domToReact(node.children, options)}
          </code>
        );
      }
      if (node.name === "img") {
        // Ensure images are responsive
        return (
          <img
            src={node.attribs.src}
            alt={node.attribs.alt || "Image"}
            className="max-w-full h-auto rounded-md my-2"
            key={node.key}
          />
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
