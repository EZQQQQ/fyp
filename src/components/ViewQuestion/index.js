import React from "react";
import "../KnowledgeNode/css/index.css";
import MainQuestion from "./MainQuestion";
import Sidebar from "../KnowledgeNode/Sidebar";

function index() {
  return (
    <div className="stack-index">
      <div className="stack-index-content">
        <Sidebar />
        <MainQuestion />
      </div>
    </div>
  );
}

export default index;
