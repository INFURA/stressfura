import React, { useState, useEffect } from 'react';
import './App.css';
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import TestOutput, { InputState } from './TestOutput';
import AbortTest, { AbortInputState } from './AbortTest';

function NetworkComparison() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [testOutput, setTestOutput] = useState("");
  const [testErrors, setTestErrors] = useState("");
  const [isStartBtnDisabled, setStartBtnDisabled] = useState(false);
  const [isDownloadBtnDisabled, setDownloadBtnDisabled] = useState(true);
  const [isAbortBtnDisabled, setAbortBtnDisabled] = useState(true);

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
          setStartBtnDisabled(false);
        }
      })
      .catch((err) => {
        setTestErrors(err)
      });
  };

  const triggerTest = (data: any) => {
    let url = `/commit?VUs=${data.VUs}&Duration=${data.Duration}&Type=single&NetworkUrl=${data.NetworkUrl}`
    let rpcs = '&Rpcs='
    if(data.eth_getLogs !== false) rpcs = rpcs + ',eth_getLogs'
    if(data.eth_call !== false) rpcs = rpcs + ',eth_call'
    if(data.eth_getBalance !== false) rpcs = rpcs + ',eth_getBalance'
    if(data.eth_getTransactionReceipt !== false) rpcs = rpcs + ',eth_getTransactionReceipt'
    if(data.eth_getBlockByNumber !== false) rpcs = rpcs + ',eth_getBlockByNumber'
    if(data.eth_blockNumber !== false) rpcs = rpcs + ',eth_blockNumber'
    fetch(url + rpcs)
      .then((response) => response.json())
      .then((response) => {
        setStartBtnDisabled(true);
        setAbortBtnDisabled(false);
        setDownloadBtnDisabled(false);
        setTestOutput(response)
      })
      .catch((err) => {
        setTestOutput(err);
      });
  };

  const abortTest = () => {
    fetch(`/abort-test`)
    .then((response) => response.json())
    .then((response) => {
      setAbortBtnDisabled(true);
      // TODO: Report result of this somewhere setTestErrors(response)
      setStartBtnDisabled(false)
    })
    .catch((err) => {
      // setTestErrors(err);
    });
  }

  useEffect(() => {
    (async () => {
      await fetch("/cleanup"); 
      
      const getErrors = () => {
        fetch("/fetch-errors")
          .then(result => result.json())
          .then(result => { 
            if (result !== '') setTestErrors(result)
            let textarea = document.getElementById('errors');
            textarea!.scrollTop = textarea!.scrollHeight;
          })
      }
      const getTestState = () => {
        fetch("/fetch-test-progress")
          .then(result => result.json())
          .then(result => { 
            if (result !== '') {
              setTestOutput(result)
              let textarea = document.getElementById('stdout');
              textarea!.scrollTop = textarea!.scrollHeight;
            }
          })       
      }
      getErrors()
      getTestState()
      const interval = setInterval(() => getErrors(), 1000)
      const interval2 = setInterval(() => getTestState(), 1000)
      return () => {
        clearInterval(interval);
        clearInterval(interval2);
      }
    })();
  }, []);

  const inputState: InputState =  {
    fetchTestData,
    isDownloadBtnDisabled,
    testOutput,
    testErrors
  }

  const abortInputState: AbortInputState =  {
    abortTest,
    isAbortBtnDisabled
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Stressfura</h1>
        <Link className="btn btn-dark btn-lg" to="/">Go back to main menu</Link>
        {/* https://react-hook-form.com/ */}
        <div className="container">
          <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label col-form-label-lg" >Network 1 Url</label>
            <div className="col-sm-10">
              <input className="form-control" type="text" {...register("Network1Url", { pattern: /^https:\/\/.*/i } )}  />
              {errors.Network1Url && <span>The VUs field is required and need to be a valid https url</span>}
            </div>
          </div>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label col-form-label-lg">Network 2 Url</label>
            <div className="col-sm-10">
              <input className="form-control"  type="text" {...register("Network2Url", { pattern: /^https:\/\/.*/i } )} />
              {errors.Network2Url && <span>The VUs field is required</span>}
            </div>
          </div>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label col-form-label-lg">VUs </label>
            <div className="col-sm-10">
              <input className="form-control"  type="number" {...register("VUs", { required: true, min: 1, max: 500 } )} />
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

          <hr></hr>
          <div className="form-group row alert-secondary" role="alert">
          <label className="col-sm-12 col-form-label col-form-label-lg" >RPC</label>
          </div>
          <div className="form-group row ">
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox"  value="true" {...register("eth_getLogs")} checked />
              <label className="col-sm-2 col-form-label col-form-label-lg" >eth_getLogs</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox"  value="true" {...register("eth_call")} checked />
              <label className="col-sm-2 col-form-label col-form-label-lg">eth_call</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox" value="true" {...register("eth_getBalance")} checked />
              <label className="col-sm-2 col-form-label col-form-label-lg" >eth_getBalance</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox" value="true" {...register("eth_getTransactionReceipt")} checked />
              <label className="col-sm-2 col-form-label col-form-label-lg" >eth_getTransactionReceipt</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox" value="true" {...register("eth_blockNumber")} checked />
              <label className="col-sm-2 col-form-label col-form-label-lg" >eth_blockNumber</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox" value="true" {...register("eth_getBlockByNumber")} checked />
              <label className="col-sm-2 col-form-label col-form-label-lg" >eth_getBlockByNumber</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox" value="true" {...register("eth_chainId")} checked />
              <label className="col-sm-2 col-form-label col-form-label-lg" >eth_chainId</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox" value="true" {...register("net_version")} checked />
              <label className="col-sm-2 col-form-label col-form-label-lg" >net_version</label>
            </div>
          </div>

          <div className="col-auto">
            <input className="btn btn-dark btn-lg" type="submit" value="Start test"  disabled={isStartBtnDisabled}/>
          </div>
          </form>

          <hr></hr>   
          <AbortTest {...abortInputState}></AbortTest>
          <TestOutput {...inputState}> </TestOutput>

        </div>
      </header>
    </div>
  );
}

export default NetworkComparison;
