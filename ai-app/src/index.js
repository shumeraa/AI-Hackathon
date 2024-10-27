import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import ChatElma from './ChatPage';
import ChatHarry from './ChatPageHarry';
import ChatWendy from './ChatPageWendy';
import Personas from './Personas';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(  
  <Router>
    <Routes>
      <Route path="/" element={<App />} />          {/* Landing page */}
      <Route path="/ChatHarry" element={<ChatHarry />} />   {/* Chat with Wendy */}
      <Route path="/ChatElma" element={<ChatElma />} />   {/* Chat with Elma */}
      <Route path="/ChatWendy" element={<ChatWendy />} />   {/* Chat with Harry */}
      <Route path="/Personas" element={<Personas />} />   {/* Personas Page */}
    </Routes>
  </Router>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
