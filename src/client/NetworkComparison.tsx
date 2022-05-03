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
    let url = `/commit?VUs=${data.VUs}&Duration=${data.Duration}&Type=single&NetworkUrl=${data.NetworkUrl}&Ramp=${data.Ramp}`
    let rpcs = '&Rpcs='
    if(data.eth_getLogs !== false) rpcs = rpcs + ',eth_getLogs'
    if(data.eth_call !== false) rpcs = rpcs + ',eth_call'
    if(data.eth_getBalance !== false) rpcs = rpcs + ',eth_getBalance'
    if(data.eth_getTransactionReceipt !== false) rpcs = rpcs + ',eth_getTransactionReceipt'
    if(data.eth_getBlockByNumber !== false) rpcs = rpcs + ',eth_getBlockByNumber'
    if(data.eth_blockNumber !== false) rpcs = rpcs + ',eth_blockNumber'
    if(data.eth_chainId !== false) rpcs = rpcs + ',eth_chainId'
    if(data.net_version !== false) rpcs = rpcs + ',net_version'
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
      fetch("/cleanup"); 
      
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
        <Link className="btn btn-dark btn-lg" to="/">Go back to main menu</Link>
        <div className="container">
          <form onSubmit={handleSubmit(onSubmit)}>
          <hr></hr>
          <div className="form-group row alert-secondary" role="alert">
            <label className="col-sm-12 col-form-label col-form-label-lg" >Main params</label>
          </div>
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
          <a className="col-sm-2 col-form-label col-form-label-lg alert-link" href="https://k6.io/docs/using-k6/scenarios/arrival-rate" target="_blank">VUs</a>
            <div className="col-sm-10">
              <input className="form-control"  type="number" {...register("VUs", { required: true, min: 1, max: 500 } )} />
              {errors.VUs && <span>The VUs field is empty or invalid</span>}
            </div>
          </div>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label col-form-label-lg">Duration</label>
            <div className="col-sm-10">
              <input className="form-control"  type="text" {...register("Duration", { pattern: /^\d+h\d+m\d+s$|^\d+h\d+m$|^\d+h\d+s$|^\d+m\d+s$|^\d+m$|^\d+s/ } )} />
              {errors.Duration && <span>The Duration field is empty, example values [30s, 5m, 1h, 2h30m, 25m5s, 1h10m5s]</span>}
            </div>
          </div>

          <hr></hr>
          <div className="form-group row alert-secondary" role="alert">
          <label className="col-sm-12 col-form-label col-form-label-lg" >RPC</label>
          </div>
          <div className="form-group row ">
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox"   {...register("eth_getLogs")} />
              <label className="col-sm-2 col-form-label col-form-label-lg" >eth_getLogs</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox"   {...register("eth_call")} />
              <label className="col-sm-2 col-form-label col-form-label-lg">eth_call</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox" {...register("eth_getBalance")} />
              <label className="col-sm-2 col-form-label col-form-label-lg" >eth_getBalance</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox"  {...register("eth_getTransactionReceipt")} />
              <label className="col-sm-2 col-form-label col-form-label-lg" >eth_getTransactionReceipt</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox"  {...register("eth_blockNumber")} />
              <label className="col-sm-2 col-form-label col-form-label-lg" >eth_blockNumber</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox"  {...register("eth_getBlockByNumber")}  />
              <label className="col-sm-2 col-form-label col-form-label-lg" >eth_getBlockByNumber</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox" {...register("eth_chainId")}  />
              <label className="col-sm-2 col-form-label col-form-label-lg" >eth_chainId</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox"  {...register("net_version")}  />
              <label className="col-sm-2 col-form-label col-form-label-lg" >net_version</label>
            </div>
          </div>

          <hr></hr>
          <div className="form-group row alert-secondary" role="alert">
            <label className="col-sm-12 col-form-label col-form-label-lg" >Load Ramps</label>
          </div>
          <div className="form-group row">
            <div className="card col-sm-3 form-check">
              <img className="card-img-top" src="./load-ramp.png" alt="Load test ramp" />
              <div className="card-body">
                <h5 className="card-title">Load</h5>
                <p className="card-text">
                <ol>
                  <li>Ramp up from 0 to VUs (30s)</li>
                  <li>Plateau VUs (duration)</li>
                  <li>Ramp down from VUs to 0 (30s)</li>
                </ol>
                </p>
                <input className="form-check-input" type="radio" value="loadRamp" {...register("Ramp", { required: true })} />
              </div>
            </div>
            <div className="card col-sm-3 form-check">
              <img className="card-img-top" src="./stress-ramp.webp" alt="Stress test ramp" />
              <div className="card-body">
                <h5 className="card-title">Stress</h5>
                <p className="card-text">
                <ol>
                  <li>Ramp up from 0 to VUs (1m)</li>
                  <li>Plateau VUs (duration)</li>
                  <li>Ramp up from VUs to VUs*2 (1m)</li>
                  <li>Plateau VUs*2 (duration)</li>
                  <li>Ramp up from VUs* to VUs*3 (1m)</li>
                  <li>Plateau VUs*3 (duration)</li>
                  <li>Ramp up from VUs*3 to VUs*4 (1m)</li>
                  <li>Plateau VUs*4 (duration)</li>
                  <li>Ramp down from VUs to 0 (1m)</li>
                </ol>
                </p>
                <input className="form-check-input" type="radio" value="stressRamp"  {...register("Ramp", { required: true })} />
              </div>
            </div>
            <div className="card  col-sm-3 form-check">
              <img className="card-img-top" src="./soak-ramp.webp" alt="Soak test ramp" />
              <div className="card-body">
                <h5 className="card-title">Soak</h5>
                <p className="card-text">
                <ol>
                  <li>Ramp up from 0 to VUs (2m)</li>
                  <li>Plateau VUs (duration)</li>
                  <li>Ramp down from VUs to 0 (2m)</li>
                </ol>
                </p>
                <input className="form-check-input" type="radio" value="soakRamp"  {...register("Ramp", { required: true })} />
              </div>
            </div>
            <div className="card  col-sm-3 form-check">
              <img className="card-img-top" src="./soak-ramp.webp" alt="Spike test ramp" />
              <div className="card-body">
                <h5 className="card-title">Spike</h5>
                <p className="card-text">
                <ol>
                  <li>Ramp up from 0 to VUs/5 (10s)</li>
                  <li>Plateau VUs/5 (30s)</li>
                  <li>Ramp up from VUs/5 to VUs (10s)</li>
                  <li>Plateau VUs (duration)</li>
                  <li>Ramp down from VUs to VUs/5 (10s)</li>
                  <li>Plateau VUs/5 (duration)</li>
                  <li>Ramp down from VUs/5 to 0 (10s)</li>
                </ol>
                </p>
                <input className="form-check-input" type="radio" value="spikeRamp"  {...register("Ramp", { required: true })} />
              </div>
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
