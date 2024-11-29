import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import TextEditor from "./TextEditor";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="app-header">
          <h1 className="app-title">📝 EditFlow</h1>  {/* New Website Name */}
          <p className="app-subtitle">Real-Time Collaborative Editing</p>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to={`/documents/${uuidV4()}`} />} />
          <Route path="/documents/:id" element={<TextEditor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
