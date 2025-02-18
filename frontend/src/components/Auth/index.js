// /frontend/src/components/Auth/index.js
import React, { useEffect, useRef, useState } from "react";
import MicrosoftLoginButton from "./MicrosoftLoginButton";
import AuthText from "./AuthText";
import * as THREE from "three";
import NET from "vanta/dist/vanta.globe.min.js";
import "./AuthPage.css";

function Auth() {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    // Ensure THREE is available globally for VANTA
    window.THREE = THREE;
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(
        NET({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0x485da7,
          color2: 0x4848a2,
          size: 1.10,
          backgroundColor: 0xc7d9d9,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div id="vanta-bg" ref={vantaRef} style={{ minHeight: "100vh" }}>
      <div className="auth-page-container">
        <div className="auth-text-column">
          <AuthText />
        </div>
        <div className="login-button-column">
          <MicrosoftLoginButton />
        </div>
      </div>
    </div>
  );
}

export default Auth;
