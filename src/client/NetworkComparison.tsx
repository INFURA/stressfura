import React, { useState } from 'react';
import './App.css';
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

function NetworkComparison() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [triggerTestResult, setTriggerTestResult] = useState("Test not started");
  const [downloadReportMessage, setDownloadReportMessage] = useState("In progress...");
  const [isBtn1Disabled, setBtn1Disabled] = useState(false);
  const [isBtn2Disabled, setBtn2Disabled] = useState(true);

  const onSubmit = (data: any) => triggerTest(data);

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
        setBtn1Disabled(false);
      })
      .catch(() => {
        setDownloadReportMessage("ERROR");
      });
  };

  const triggerTest = (data: any) => {
    fetch(`/commit?VUs=${data.VUs}&Duration=${data.Duration}&type=multi&InfuraKey=${data.InfuraKey}&AlchemyKey=${data.AlchemyKey}`)
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
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        {/* <br></br> */}
        <Link to="/">Go back to main menu</Link>
        {/* https://react-hook-form.com/ */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>InfuraKey</label>
          <input type="text" {...register("InfuraKey", { required: true } )}  />
          {errors.InfuraKey && <span>The VUs field is required</span>}
          <br></br>
          <label>AlchemyKey</label>
          <input type="text" {...register("AlchemyKey", { required: true } )} />
          {errors.AlchemyKey && <span>The VUs field is required</span>}
          <br></br>
          <label>VUs</label>
          <input type="number" {...register("VUs", { required: true, min: 1, max: 1000 } )} />
          {errors.VUs && <span>The VUs field is empty or invalid</span>}
          <br></br>
          <label>Duration</label>
          <input type="text" {...register("Duration", { required: true } )} />
          {errors.Duration && <span>The Duration field is empty, example values are 30s,5m</span>}
          <br></br>
          <input type="submit" value="Start test"  disabled={isBtn1Disabled}/>
        </form>
        {/* <button onClick={triggerTest} disabled={isBtn1Disabled}>Launch load test</button> */}

        <p>Test run trigger result: {triggerTestResult}</p>
        <button onClick={fetchTestData} disabled={isBtn2Disabled}>Download test report</button>
        <div>Test run download result: {downloadReportMessage}</div>
      </header>
    </div>
  );
}

export default NetworkComparison;
