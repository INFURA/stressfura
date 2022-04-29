// https://spin.atomicobject.com/2020/08/17/cra-express-share-code/

import React from 'react';
import { render } from "react-dom";
import './client/index.css';
import App from './client/App';
import NetworkComparison from './client/NetworkComparison';
import SingleNetwork from './client/SingleNetwork';
import reportWebVitals from './client/reportWebVitals';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

const rootElement = document.getElementById("root");
render(
  // https://github.com/remix-run/react-router/blob/main/docs/getting-started/tutorial.md
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="networkComparison" element={<NetworkComparison />} />
      <Route path="singleNetwork" element={<SingleNetwork />} />
    </Routes>
  </BrowserRouter>,
  rootElement
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
