import React, { useState } from "react";
import { Button } from "@mui/material";
import OutlookLogo from "../../assets/Outlook.png";
import GoogleLogo from "../../assets/Google.png";
import "./index.css";

function Index() {
  const [register, setRegister] = useState(false);

  return (
    <div className="auth">
      <div className="auth-container">
        <p>Log in with the following service available:</p>
        <div className="sign-options">
          <div className="single-option">
            <img src={OutlookLogo} alt="Outlook" />
            <p>Login with Outlook</p>
          </div>
          <div className="single-option">
            <img src={GoogleLogo} alt="Google" />
            <p>Login with Google</p>
          </div>
        </div>

        <div className="auth-login">
          <div className="auth-login-container">
            {register ? (
              <>
                {/* Registration Form */}
                <div className="input-field">
                  <p>Username</p>
                  <input type="text" placeholder="Enter your username" />
                </div>
                <div className="input-field">
                  <p>Email</p>
                  <input type="email" placeholder="Enter your email" />
                </div>
                <div className="input-field">
                  <p>Password</p>
                  <input type="password" placeholder="Enter your password" />
                </div>
                <Button variant="contained" color="primary">
                  Register
                </Button>
              </>
            ) : (
              <>
                {/* Login Form */}
                <div className="input-field">
                  <p>Email</p>
                  <input type="email" placeholder="Enter your email" />
                </div>
                <div className="input-field">
                  <p>Password</p>
                  <input type="password" placeholder="Enter your password" />
                </div>
                <Button variant="contained" color="primary">
                  Login
                </Button>
              </>
            )}
            {/* Toggle Link */}
            <p
              onClick={() => setRegister(!register)}
              style={{
                cursor: "pointer",
                color: "blue",
                textDecoration: "underline",
                marginTop: "10px",
              }}
            >
              {register
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
