// /frontend/src/components/Auth/MicrosoftLoginButton.js

import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, microsoftProvider } from "../../config/firebase-config";
import { ssoLoginUser } from "../../features/userSlice";
import { toast } from "react-toastify";
import OutlookLogo from "../../assets/Outlook.png";
import "./LoginButton.css";

function MicrosoftLoginButton({ isAdmin }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleMicrosoftLogin = async () => {
    try {
      // Trigger Firebase popup and get ID token
      const result = await signInWithPopup(auth, microsoftProvider);
      const token = await result.user.getIdToken();

      // Dispatch your SSO thunk and unwrap the full payload
      const payload = await dispatch(
        ssoLoginUser({ token, isAdmin })
      ).unwrap();

      // Redirect based on isNewUser flag from the backend
      if (payload.isNewUser) {
        navigate("/profile-creation", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

      toast.success("SSO Login successful!");
    } catch (error) {
      console.error("SSO Login Error:", error);
      toast.error("Login failed, please try again.");
    }
  };

  return (
    <button
      className="button"
      data-text="Login with Microsoft"
      onClick={handleMicrosoftLogin}
    >
      <span className="actual-text">
        <img src={OutlookLogo} alt="Outlook Logo" className="logo" />
        &nbsp;Login with Microsoft&nbsp;
      </span>
      <span aria-hidden="true" className="hover-text">
        &nbsp;Login with Microsoft&nbsp;
      </span>
    </button>
  );
}

export default MicrosoftLoginButton;
