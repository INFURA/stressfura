import React from 'react';
import './App.css';
import { Link } from "react-router-dom";

function App() {
  
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <h1>Scenarios</h1>
        <nav
        style={{
          padding: "1rem",
        }}
      >
        <Link className="btn btn-dark  btn-lg" to="/networkComparison">Network comparison scenario</Link>
        <Link className="btn btn-dark btn-lg" to="/singleNetwork">Single Network scenario</Link>
      </nav>

      </header>
    </div>
  );
}

export default App;
