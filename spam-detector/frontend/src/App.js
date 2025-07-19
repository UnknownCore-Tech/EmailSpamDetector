import React from "react";
import "./App.css";
import SpamForm from "./components/SpamForm";

function App() {
  return (
    <div className="container">
      <header>
        <span className="logo" style={{ display: "flex", alignItems: "center", fontWeight: "bold", fontSize: "1.2rem" }}>
          <svg width="24" height="24" fill="black" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
            <rect x="2" y="4" width="20" height="16" rx="2" ry="2" fill="black"/>
            <polyline points="22,6 12,13 2,6" fill="none" stroke="white" strokeWidth="2"/>
          </svg>
          Spam Detector
        </span>
        <nav>
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
          <button className="sign-up">Sign Up</button>
        </nav>
      </header>
      <main>
        <SpamForm />
      </main>
    </div>
  );
}

export default App;
