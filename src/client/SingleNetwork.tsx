import React, { useState, useEffect } from 'react';
import './App.css';
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

function SingleNetwork() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [testErrors, setTestErrors] = useState("");
  const [triggerTestResult, setTriggerTestResult] = useState("Test not started");
  const [downloadReportMessage, setDownloadReportMessage] = useState("");
  const [isBtn1Disabled, setBtn1Disabled] = useState(false);
  const [isBtn2Disabled, setBtn2Disabled] = useState(true);

  const onSubmit = (data: any) => triggerTest(data);

  const fetchTestData = () => {
    fetch("/fetch")
      .then((response) => response.json())
      .then((response) => {
        if(response !== 'results not ready'){
          const element = document.createElement("a");
          const file = new Blob([response], {
            type: "text/plain"
          });
          element.href = URL.createObjectURL(file);
          element.download = "LoadTestReport.txt";
          document.body.appendChild(element);
          element.click();
          setBtn1Disabled(false);
        }
      })
      .catch(() => {
        setDownloadReportMessage("ERROR");
      });
  };

  const triggerTest = (data: any) => {
    fetch(`/commit?VUs=${data.VUs}&Duration=${data.Duration}&type=single&NetworkUrl=${data.NetworkUrl}`)
      .then((response) => response.json())
      .then((response) => {
        setBtn1Disabled(true);
        setTriggerTestResult(response);
      })
      .catch(() => {
        setTriggerTestResult('ERROR');
      });
  };

  useEffect(() => {
    (async () => {
      // await fetch("/cleanup"); 
      
      const getErrors = () => {
        fetch("/fetch-errors")
          .then(result => result.json())
          .then(result => setTestErrors(result))
      }
      const getTestState = () => {
        fetch("/fetch-test-progress")
          .then(result => result.json())
          .then(result => { 
            setDownloadReportMessage(result)
            if(result === 'Test finished, please download the report'){
              setBtn2Disabled(false)
            }
          })       
      }
      getErrors()
      getTestState()
      const interval = setInterval(() => getErrors(), 5000)
      const interval2 = setInterval(() => getTestState(), 2000)
      return () => {
        clearInterval(interval);
        clearInterval(interval2);
      }
    })();
  }, []);
  
  return (
    <div className="App">
      <header className="App-header">
      <Link className="btn btn-dark btn-lg" to="/">Go back to main menu</Link>
        {/* https://react-hook-form.com/ */}
        <div className="container">
        <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label col-form-label-lg" >Network Url</label>
          <div className="col-sm-10">
            <input className="form-control" type="text" {...register("NetworkUrl", { required: true } )}  />
            {errors.NetworkUrl && <span>The VUs field is required</span>}
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label col-form-label-lg">VUs</label>
          <div className="col-sm-10">
            <input className="form-control"  type="number" {...register("VUs", { required: true, min: 1, max: 2000 } )} />
            {errors.VUs && <span>The VUs field is empty or invalid</span>}
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label col-form-label-lg">Duration</label>
          <div className="col-sm-10">
            <input className="form-control"  type="text" {...register("Duration", { required: true } )} />
            {errors.Duration && <span>The Duration field is empty, example values are 30s,5m</span>}
          </div>
        </div>
        <div className="col-auto">
          <input className="btn btn-dark btn-lg" type="submit" value="Start test"  disabled={isBtn1Disabled}/>
        </div>
        </form>
        {/* <button onClick={triggerTest} disabled={isBtn1Disabled}>Launch load test</button> */}

        <div className="alert alert-secondary col-sm-12" role="alert">{triggerTestResult}</div>
        <button  className="btn btn-dark btn-lg" onClick={fetchTestData} disabled={isBtn2Disabled}>Download test report</button>
        <div className="alert alert-secondary col-sm-12" role="alert">{downloadReportMessage}</div>
        
        <hr></hr>
        <p>Errors</p>
        <textarea className="scrollableErrorBox col-sm-12" value={testErrors}></textarea>

        </div>
      </header>
    </div>
  );
}

export default SingleNetwork;
