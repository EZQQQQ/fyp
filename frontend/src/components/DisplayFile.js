// /frontend/src/components/DisplayFile.js

import React from "react";

const DisplayFile = ({ filename, mimetype }) => {
  const fileUrl = `http://localhost:3000/api/file/${filename}`;

  return (
    <div>
      {mimetype.startsWith("image/") ? (
        <img src={fileUrl} alt="Uploaded" style={{ width: "300px" }} />
      ) : (
        <video width="320" height="240" controls>
          <source src={fileUrl} type={mimetype} />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

export default DisplayFile;
