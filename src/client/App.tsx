import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [triggerTestResult, setTriggerTestResult] = useState("Test not started");
  const [downloadReportMessage, setDownloadReportMessage] = useState("In progress...");
  const [isBtn1Disabled, setBtn1Disabled] = useState(false);
  const [isBtn2Disabled, setBtn2Disabled] = useState(true);

  const fetchTestData = () => {
    fetch("/fetch")
      .then((response) => response.json())
      .then((response) => {
        const element = document.createElement("a");
        const file = new Blob([response], {
          type: "text/plain"
        });
        element.href = URL.createObjectURL(file);
        element.download = "LoadTestReport.txt";
        document.body.appendChild(element);
        element.click();
        setDownloadReportMessage('Test done see downloaded report');
      })
      .catch(() => {
        setDownloadReportMessage("ERROR");
      });
  };

  const triggerTest = () => {
    fetch("/commit")
      .then((response) => response.json())
      .then((response) => {
        setBtn1Disabled(true);
        setTriggerTestResult(response);
        setBtn2Disabled(false);
      })
      .catch(() => {
        setTriggerTestResult('ERROR');
      });
  };

  // useEffect(() => {
  //   (async () => {
  //     const result = await fetch("/commit");
  //     const newServerResult = await result.json();
  //     setServerResult(newServerResult);
  //   })();
  // }, []);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <br></br>
        <button onClick={triggerTest} disabled={isBtn1Disabled}>Launch load test</button>
        <p>Test run trigger result: {triggerTestResult}</p>
        <button onClick={fetchTestData} disabled={isBtn2Disabled}>Download test report</button>
        <div>Test run download result: {downloadReportMessage}</div>
      </header>
    </div>
  );
}

export default App;
