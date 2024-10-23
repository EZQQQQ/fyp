import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Sidebar from "./components/KnowledgeNode/Sidebar";
import AllQuestions from "./components/KnowledgeNode/AllQuestions";
import MainQuestion from "./components/ViewQuestion/MainQuestion";
import AddQuestion from "./components/AddQuestion/Question";
import Auth from "./components/Auth";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Router>
        <Header />
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<AllQuestions />} />
              <Route path="/question" element={<MainQuestion />} />
              <Route path="/add-question" element={<AddQuestion />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </div>
        </div>
      </Router>
    </div>
  );
}

export default App;
