// /frontend/src/components/Auth/MicrosoftLogin.js

import React from "react";
import { Button } from "@mui/material";
import { auth, microsoftProvider } from "../../config/firebase-config";
import { signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { ssoLoginUser } from "../../features/userSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import OutlookLogo from "../../assets/Outlook.png";

function MicrosoftLogin({ isAdmin }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleMicrosoftLogin = async () => {
    try {
      const result = await signInWithPopup(auth, microsoftProvider);
      const token = await result.user.getIdToken();

      dispatch(ssoLoginUser({ token, isAdmin }))
        .unwrap()
        .then((data) => {
          // Check if user needs to create a profile
          if (!data.data.user.username) {
            navigate("/profile");
          } else {
            navigate("/");
          }
        })
        .catch((error) => {
          console.error("SSO Login Error:", error);
          // Error handling is managed in the slice via toast
        });
    } catch (error) {
      console.error("Microsoft Sign-In Error:", error);
      toast.error("Microsoft Sign-In failed. Please try again.");
    }
  };

  return (
    <Button
      onClick={handleMicrosoftLogin}
      variant="contained"
      color="primary"
      className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
    >
      <img src={OutlookLogo} alt="Outlook Logo" className="w-6 h-6 mr-2" />
      Login with Outlook
    </Button>
  );
}

export default MicrosoftLogin;
