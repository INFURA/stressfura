import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [serverResult, setServerResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState("In progress...");

  const fetchTestData = () => {
    fetch("/fetch")
      .then((response) => response.json())
      .then((response) => {
        const element = document.createElement("a");
        const file = new Blob([response], {
          type: "text/plain"
        });
        element.href = URL.createObjectURL(file);
        element.download = "myFile.txt";
        document.body.appendChild(element);
        element.click();
        setStatusMessage('Test done see downloaded report');
      })
      .catch(() => {
        setStatusMessage("ERROR");
      });
  };

  useEffect(() => {
    (async () => {
      const result = await fetch("/commit");
      const newServerResult = await result.json();
      console.log(newServerResult)
      setServerResult(newServerResult);
    })();
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {/* <p>Client result {sum(1, 3)}</p> */}
        <p>Server result {serverResult}</p>
        <div>Test run status: {statusMessage}</div>
        <button onClick={fetchTestData}>Check Status</button>
      </header>
    </div>
  );
}

export default App;
