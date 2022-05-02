import React from 'react';
import './App.css';

export type AbortInputState = {
  abortTest: () => void
  isAbortBtnDisabled: boolean
}

const AbortTest: React.FC<AbortInputState> = (inputState: AbortInputState) => {
  return (
    <div>
      <input className="btn btn-dark btn-lg" value="Abort test"  disabled={inputState.isAbortBtnDisabled} onClick={inputState.abortTest}/>
    </div>
  );
}

export default AbortTest;
