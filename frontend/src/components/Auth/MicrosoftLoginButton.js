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
      const result = await signInWithPopup(auth, microsoftProvider);
      const token = await result.user.getIdToken();
      dispatch(ssoLoginUser({ token, isAdmin }))
        .unwrap()
        .then((data) => {
          if (!data.data.user.username) {
            navigate("/profile");
          } else {
            navigate("/");
          }
        })
        .catch((error) => {
          console.error("SSO Login Error:", error);
        });
    } catch (error) {
      console.error("Microsoft Sign-In Error:", error);
      toast.error("Microsoft Sign-In failed. Please try again.");
    }
  };

  return (
    <button className="button" data-text="Login with Microsoft" onClick={handleMicrosoftLogin}>
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
