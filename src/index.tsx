// https://spin.atomicobject.com/2020/08/17/cra-express-share-code/

import React from 'react';
import ReactDOM from 'react-dom/client';
import './client/index.css';
import App from './client/App';
import reportWebVitals from './client/reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
