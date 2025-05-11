import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './main.css'
import App from "./component/App/app.jsx"
import reportWebVitals from './reportWebVitals.js';

import { ReactFlowProvider } from '@xyflow/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
        <ReactFlowProvider>
        <DndProvider backend={HTML5Backend}>
    <App/>
    </DndProvider>
    </ReactFlowProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
