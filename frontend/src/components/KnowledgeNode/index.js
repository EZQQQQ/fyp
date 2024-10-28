import React from "react";
import "./css/index.css";
import Main from "./Main";
import Sidebar from "./Sidebar";

function index() {
  return (
    <div className="sidebar-index">
      <div className="sidebar-index-content">
        <Sidebar />
        <Main />
      </div>
    </div>
  );
}

export default index;
