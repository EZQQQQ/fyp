// frontend/src/components/Auth/Unauthorized.js

import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Unauthorized() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/"); // Redirect to home or login page
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-500">Unauthorized</h1>
        <p className="mt-4 text-gray-700 dark:text-gray-300">
          You do not have permission to view this page.
        </p>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoBack}
          className="mt-6"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
}

export default Unauthorized;
