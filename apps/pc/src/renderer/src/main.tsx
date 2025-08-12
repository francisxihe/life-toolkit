import React from 'react';
import ReactDOM from 'react-dom/client';
import DatabaseTest from './components/DatabaseTest';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <DatabaseTest />
  </React.StrictMode>
);