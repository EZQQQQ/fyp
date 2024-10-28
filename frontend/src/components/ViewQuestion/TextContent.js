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
            className="bg-black text-white p-1 rounded-md overflow-x-auto"
            key={node.key}
          >
            {domToReact(node.children, options)}
          </pre>
        );
      }
      if (node.name === "code") {
        return (
          <code className="bg-black text-white p-1 rounded" key={node.key}>
            {domToReact(node.children, options)}
          </code>
        );
      }
    },
  };

  return (
    <div className={`${type}-text-content`}>
      {parse(sanitizedContent, options)}
    </div>
  );
}

export default TextContent;
