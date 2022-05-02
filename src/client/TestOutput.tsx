import React from 'react';
import './App.css';

export type InputState = {
  fetchTestData: () => void
  isDownloadBtnDisabled: boolean
  testOutput: string
  testErrors: string
}

const TestOutput: React.FC<InputState> = (inputState: InputState) => {
  return (
    <div>
      <hr></hr>   
      <p>Stdout</p>
      <textarea className="scrollableStdoutBox col-sm-12" value={inputState.testOutput} id="stdout"></textarea>
      <button  className="btn btn-dark btn-lg" onClick={inputState.fetchTestData} disabled={inputState.isDownloadBtnDisabled}>Download test report</button>   
      <p>Errors</p>
      <textarea className="scrollableErrorBox col-sm-12" value={inputState.testErrors} id="errors"></textarea>
    </div>
  );
}

export default TestOutput;
