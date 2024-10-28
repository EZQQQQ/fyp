// /frontend/src/components/KnowledgeNode/index.js

import React from "react";
import Main from "./Main";
import Sidebar from "./Sidebar";

function KnowledgeNode() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <Main />
    </div>
  );
}

export default KnowledgeNode;
