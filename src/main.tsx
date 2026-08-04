import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { HospitalWorkflowProvider } from './context/HospitalWorkflowContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <HospitalWorkflowProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HospitalWorkflowProvider>
    </AuthProvider>
  </React.StrictMode>,
);