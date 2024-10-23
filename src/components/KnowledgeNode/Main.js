import {
  FilterList,
  QuestionAnswer as QuestionAnswerIcon,
} from "@mui/icons-material";

import React from "react";
import { Link } from "react-router-dom";
import AllQuestion from "./AllQuestions";
import Button from "@mui/material/Button";
import "./css/Main.css";

function Main() {
  return (
    <div className="main">
      <div className="main-container">
        <div className="main-top">
          <h2>All Questions</h2>
          <Link to="/add-question">
            <Button
              variant="contained"
              startIcon={<QuestionAnswerIcon />}
              className="button"
            >
              Ask Question
            </Button>
          </Link>
        </div>
        <div className="main-dec">
          <div className="main-filter">
            <div className="main-tabs">
              <div className="main-tab">
                <Link>Newest</Link>
              </div>
              <div className="main-tab">
                <Link>Active</Link>
              </div>
              <div className="main-tab">
                <Link>Unanswered</Link>
              </div>
            </div>
            <div className="main-filter-item">
              <FilterList />
              <p>Filter</p>
            </div>
          </div>
        </div>
        <div className="questions">
          <div className="question">
            <AllQuestion />
            <AllQuestion />
            <AllQuestion />
            <AllQuestion />
            <AllQuestion />
            <AllQuestion />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
